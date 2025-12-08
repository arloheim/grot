import { Record } from "./record.js";
import { FeedError } from "./exception.js";


// Class that defines a route in a feed
export class Route extends Record
{
  // Constructor
  constructor(feed, id, data) {
    super(feed, id);

    if (!('name' in data))
      throw new FeedError(`Missing required field "name" in route with id "${this.id}"`);
    if (!('agency' in data))
      throw new FeedError(`Missing required field "agency" in route with id "${this.id}"`);
    if (!('modality' in data))
      throw new FeedError(`Missing required field "modality" in route with id "${this.id}"`);
    if (!('headsign' in data))
      throw new FeedError(`Missing required field "modality" in route with id "${this.id}"`);
    if (!('stops' in data))
      throw new FeedError(`Missing required field "stops" in route with id "${this.id}"`);
    
    this.name = data.name;
    this.headsign = data.headsign;
    this.abbr = data.abbr ?? null;
    this.description = data.description ?? null;
    this.url = data.url ?? null;
    this.colors = {background: '#ffffff', text: '#000000', ...data.colors};
    this.agency = data.agency;
    this.modality = data.modality;
    this.icon = data.icon ?? this.modality?.icon;
    this.stops = data.stops;
    this.visible = data.visible ?? true;

    this.stopAtNode = undefined;
    this.initialTime = data.initialTime ?? 0;
  }

  // Finalize loading the route
  _postLoad() {
    // Copy the stops
    this.stops = this.stops.map(s => s._copy());

    // Calculate cumulative time for the stops of the route
    let lastHeadsignSequence = null;
    for (let [index, stop] of this.stops.entries()) {
      // Set the flags of the first and last stops
      stop.first = index === 0;
      stop.last = index === this.stops.length - 1;

      // Set the time of the first stop
      stop.time = index > 0 ? stop.time : 0;

      // Calculate cumulative time for the stop
      stop.cumulativeTime = (index > 0 ? this.stops[index - 1].cumulativeTime : this.initialTime) + stop.time;

      // Set the actual headsign sequence of the stop
      if (stop.headsign !== null)
        lastHeadsignSequence = stop.sequence;
      stop._actualHeadsignSequence = lastHeadsignSequence;
    }
  }

  // Return the JSON representation of the route
  toJSON(options) {
    return {
      id: this.id,
      name: this._feed.applyTranslation(this, 'name', options?.language),
      headsign: this._feed.applyTranslation(this, ['stops', this.stopAtNode?._actualHeadsignSequence, 'headsign'], options?.language)
        ?? this._feed.applyTranslation(this, 'headsign', options?.language),
      abbr: this._feed.applyTranslation(this, 'abbr', options?.language),
      description: this._feed.applyTranslation(this, 'description', options?.language),
      url: this._feed.applyTranslation(this, 'url', options?.language),
      colors: this.colors,
      agency: this.agency.toJSON(options),
      modality: this.modality.toJSON(options),
      icon: this.icon,
      stops: this.stops.map(stop => stop.toJSON(options)),
      stopAtNode: this.stopAtNode?.toJSON(options),
      visible: this.visible,
    };
  }


  // Return the services for the route
  getServices() {
    return this._feed.getRouteServices(this.id);
  }

  // Return the notifications that affect the route
  getNotifications() {
    return this._feed.getNotifications()
      .filter(notification => notification.affectsRoute(this));
  }

  // Return the stop of the route with the specified sequence
  getStopWithSequence(sequence, excludeNonHalts = false) {
    return this.stops.find(s => s.sequence === sequence && (!excludeNonHalts || s.halts));
  }

  // Return the index of the stop of the route with the specified sequence
  getStopIndexWithSequence(sequence, excludeNonHalts = false) {
    return this.stops.findIndex(s => s.sequence === sequence && (!excludeNonHalts || s.halts));
  }

  // Return the stops of the route that halts at the specified node
  getStopsAtNode(node, excludeNonHalts = false) {
    return this.stops.filter(s => s.node.id === node.id && (!excludeNonHalts || s.halts));
  }

  // Return the index of the stop of the route that halts at the specified node
  getStopIndexAtNode(node, excludeNonHalts = false) {
    return this.stops.findIndex(s => s.node.id === node.id && (!excludeNonHalts || s.halts));
  }


  // Copy the route
  _copy(modifiedProps = {}) {
    const route = new Route(this._feed, this.id, {...this, ...modifiedProps});
    route._postLoad();
    return route;
  }

  // Slice the route to begin at the specified sequence
  _sliceBeginningAtSequence(seqence) {
    let index = this.getStopIndexWithSequence(seqence);
    return index > -1 ? this._copy({stops: this.stops.slice(index)}) : this._copy();
  }

  // Slice the route to end at the specified sequence
  _sliceEndingAtSequence(seqence) {
    let index = this.getStopIndexWithSequence(seqence);
    return index > -1 ? this._copy({stops: this.stops.slice(0, index + 1)}) : this._copy();
  }

  // Slice the route to begin at the specified node
  _sliceBeginningAtNode(node) {
    let index = this.getStopIndexAtNode(node);
    return index > -1 ? this._copy({stops: this.stops.slice(index)}) : this._copy();
  }

  // Slice the route to end at the specified node
  _sliceEndingAtNode(node) {
    let index = this.getStopIndexAtNode(node);
    return index > -1 ? this._copy({stops: this.stops.slice(0, index + 1)}) : this._copy();
  }

  // Apply an initial time to the route
  _withInitialTime(initialTime) {
    return this._copy({initialTime});
  }
}
