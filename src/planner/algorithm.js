import dayjs from 'dayjs';

import { Journey } from '../model/journey.js';
import { RouteLeg } from '../model/routeLeg.js';
import { TransferLeg } from '../model/transferLeg.js';


// Class that executes the RAPTOR algorithm on a transit feed
// Adapted from https://www.microsoft.com/en-us/research/wp-content/uploads/2012/01/raptor_alenex.pdf
export default class RaptorAlgorithm
{
  // Constructor
  constructor(feed) {
    this.feed = feed;
  }


  // Return possible journeys between two nodes
  calculate(departureNode, arrivalNode, dateTime) {
    // Get all labels from the departure node
    let kLabels = this._scan(departureNode);

    // Iterate over the labels from the departure node to the arrival node
    let journeys = [];
    for (let k = 1; k < kLabels.length; k ++) {
      // Break if there are no labels in this round
      if (kLabels[k].size === 0)
        break;

      // Get the trace of k trips and append it to the journeys
      let trace = this._traceBack(kLabels, arrivalNode, k).slice(1);
      if (trace.length > 0) {
        let legs = trace.map(label => label.leg);
        journeys.push(new Journey(legs, dateTime ?? dayjs()));
      }
    }

    // Sort the journeys by total time
    journeys.sort((a, b) => a.duration - b.duration);

    // Return the journeys
    return journeys;
  }

  // Return if a node is before another node in a route
  _isNodeBefore(route, node1, node2) {
    return route.getStopIndexAtNode(node1) < route.getStopIndexAtNode(node2);
  }

  // Return the earliest departure time when transfering
  _earliestDepartureTime(arrivalTime, k = 1) {
    if (k <= 1)
      return arrivalTime;

    let departureTime = arrivalTime + 60;
    if (departureTime % 60 > 0)
      departureTime -= (departureTime % 60);
    return departureTime;
  }

  // Return all possible labels at the specified departure node
  _scan(departureNode, rounds = 10) {
    // kLabels[i][node] denodes the label for node up to i trips
    let kLabels = Array.from({length: rounds}, () => new Map());
    kLabels[0].set(departureNode, {cumulativeTime: 0});

    // bestLabels[node] denotes the shortest time it takes to travel to node regardless of which trip
    let bestLabels = new Map();
    bestLabels.set(departureNode, {cumulativeTime: 0});

    // markedNodes denotes a set of nodes for which the time is improved at the previous round
    let markedNodes = new Set([departureNode]);

    // Iterate over the transfers from the departure node
    for (let transfer of departureNode.getTransfers()) {
      let transferNode = transfer.getOppositeNode(departureNode);

      // Update the time to travel to the transfer node
      let label = {node: departureNode, leg: new TransferLeg(transfer), cumulativeTime: alignedTransfer._cumulativeTime};
      kLabels[0].set(transferNode, label);
      bestLabels.set(transferNode, label);

      // Mark the transfer node
      markedNodes.add(transferNode);
    }

    // Iterate over the rounds while there are nodes marked
    let queue = new Map();
    for (let k = 1; k < rounds; k ++) {
      // First stage: accumulate routes serving marked nodes from previous rounds
      queue.clear();
      for (let node of markedNodes) {
        for (let route of node.getRoutes(true)) {
          // Don't process the route if the stop is the last stop of the route
          if (route._stopAtNode.isLastStop)
            continue;

          // Don't process the route if it is the same one as in the last round
          if (kLabels[k - 1].has(node)) {
            let label = kLabels[k - 1].get(route._stopAtNode.node);
            if (label.leg instanceof RouteLeg && label.leg.route?.id === route.id)
              continue;
          }

          // Update the route based on the earliest node that is encountered
          if (!queue.has(route.id) || this._isNodeBefore(route, node, queue.get(route.id)))
            queue.set(route.id, {routeNode: node, routeStopSequence: route._stopAtNode.sequence});
        }
        markedNodes.delete(node);
      }

      // Second stage: examine the routes
      for (let [routeId, {routeNode, routeStopSequence}] of queue.entries()) {
        let route = this.feed.getRoute(routeId);
        // Apply the time to the route
        route = route._sliceBeginningAtSequence(routeStopSequence, {_initialTime: this._earliestDepartureTime(kLabels[k - 1].get(routeNode).cumulativeTime, k)});

        // Iterate over the stops in the route starting at routeStopSequence
        let stopIndex = 0;
        while (stopIndex < route.stops.length) {
          stopIndex ++;
          let stop = route.stops[stopIndex];

          // Check if the stop is defined
          if (stop === undefined)
            break;

          // Check if there is a faster route to the node of the stop
          if (kLabels[k - 1].has(stop.node)) {
            let label = kLabels[k - 1].get(stop.node);

            // Check if the node can be reached faster using the label
            if (label.cumulativeTime < stop._cumulativeTime) {
              // Slice the route with the better time
              route = route._sliceBeginningAtSequence(stop.sequence, {_initialTime: this._earliestDepartureTime(label.cumulativeTime, k)});

              // Update the route-dependent variables
              routeNode = stop.node;
              stopIndex = 0;
              stop = route.stops[stopIndex];
            }
          }

          // Improve the time of the node of the stop if it is shorter than the current best time
          if (stop._cumulativeTime < (bestLabels.get(stop.node)?.cumulativeTime ?? Infinity)) {
            let routeSoFar = route._sliceEndingAtSequence(stop.sequence);

            // Check if the route has more than one stop
            if (routeSoFar.stops.length <= 1)
              continue;

            // Update the time to travel to the node of the stop
            let label = {node: routeNode, leg: new RouteLeg(routeSoFar), cumulativeTime: stop._cumulativeTime};
            kLabels[k].set(stop.node, label);
            bestLabels.set(stop.node, label);

            // Mark the node of the stop
            markedNodes.add(stop.node);
          }
        }
      }

      // Third stage: examine the transfers
      for (let node of markedNodes) {
        // Iterate over the transfers from the node
        for (let transfer of node.getTransfers()) {
          let transferNode = transfer.getOppositeNode(node);

          // Check for cyclic labels
          let trace = this._traceBack(kLabels, node, k);
          if (trace.some(label => label.node?.id === transferNode.id))
            continue;

          // Apply the time to the transfer
          transfer = transfer._copy({_initialTime: kLabels[k].get(node).cumulativeTime});

          // Improve the time of the transfer node if it is shorter than the best time
          if (transfer._cumulativeTime < (bestLabels.get(transferNode)?.cumulativeTime ?? Infinity)) {
            // Update the time to travel to the transfer node
            let label = {node: node, leg: new TransferLeg(transfer), cumulativeTime: transfer._cumulativeTime};
            kLabels[k].set(transferNode, label);
            bestLabels.set(transferNode, label);

            // Mark the transfer node
            markedNodes.add(transferNode);
          }
        }
      }

      // If there are no more marked nodes, then stop the algorithm
      if (markedNodes.size === 0)
        break;
    }

    // Return the labels
    return kLabels;
  }

  // Trace back a label
  _traceBack(kLabels, arrivalNode, round) {
    let trace = [];
    let previousNode = arrivalNode;

    // Iterate over the labels
    let k = round;
    while (k >= 0) {
      // Get the label at the k-th trip
      let previousLabel = kLabels[k].get(previousNode);
      if (previousLabel === undefined)
        break;

      // Prepend the label
      trace.unshift(previousLabel);
      previousNode = previousLabel.node;
      if (!(previousLabel.leg instanceof TransferLeg))
        k --;
    }

    // Return the trace
    return trace;
  }
}
