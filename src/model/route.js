// Class that defines a route in a feed
export default class Route
{
  // Constructor
  constructor(feed, data) {
    this._feed = feed;

    this.id = data.id;
    this.slug = data.slug;
    this.name = data.name;
    this.abbr = data.abbr;
    this.description = data.description;
    this.url = data.url;
    this.agency = data.agency;
    this.modality = data.modality;
    this.icon = data.icon ?? this.modality?.icon;
    this.headsign = data.headsign;
    this.color = {background: '#ffffff', text: '#000000', ...data.color};
    this.visible = data.visible ?? true;
    this.stops = data.stops.map(s => s._copy());

    this.stopAtNode = undefined;
    this.initialTime = data.initialTime ?? 0;

    // Calculate cumulative time for the stops of the route
    let lastHeadsign = this.headsign;
    for (let [index, stop] of this.stops.entries()) {
      // Set the flags of the first and last stops
      stop.first = index === 0;
      stop.last = index === this.stops.length - 1;

      // Set the time of the first stop
      stop.time = index > 0 ? stop.time : 0;

      // Calculate cumulative time for the stop
      stop.cumulativeTime = (index > 0 ? this.stops[index - 1].cumulativeTime : this.initialTime) + stop.time;

      // Set the headsign of the stop
      if (stop.headsign !== undefined) {
        stop.changedHeadsign = !stop.last && stop.headsign != lastHeadsign;
        lastHeadsign = stop.headsign;
      } else {
        stop.headsign = lastHeadsign;
      }
    }
  }


  // Return the services for the route
  get services() {
    return this._feed.getRouteServices(this.id);
  }

  // Return the notifications that affect the route
  get notifications() {
    return this._feed.notifications
      .filter(notification => notification.affectsRoute(this))
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
    return new Route(this._feed, {...this, ...modifiedProps});
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


  // Return the JSON representation of the route
  toJSON() {
    return {
      id: this.id,
      slug: this.slug,
      name: this.name,
      abbr: this.abbr,
      description: this.description,
      url: this.url,
      agency: this.agency.toJSON(),
      modality: this.modality.toJSON(),
      modalityName: this.modalityName,
      icon: this.icon,
      headsign: this.stopAtNode?.headsign ?? this.headsign,
      color: this.color,
      visible: this.visible,
      stops: this.stops.map(stop => stop.toJSON()),
      stopAtNode: this.stopAtNode,
    };
  }
}
