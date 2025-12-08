// Class that defines a stop in a route
export default class RouteStop
{
  // Constructor
  constructor(feed, route, sequence, data) {
    this._feed = feed;
    this._route = route;
    this.sequence = parseInt(sequence);

    if (!('node' in data))
      throw new FeedError(`Missing required field "node" in route stop with sequence ${this.sequence}`);
    
    this.node = data.node;
    this.time = data.time ?? 0;
    this.halts = data.halts ?? true;
    this.platform = data.platform ?? null;
    this.headsign = data.headsign ?? null;
    this.alightDirection = data.alightDirection ?? null;
    this.status = data.status ?? null;

    this._first = false;
    this._last = false;
    this._cumulativeTime = 0;
    this._actualHeadsignSequence = undefined;
  }

  // Return the JSON representation of the route stop
  toJSON(options) {
    return {
      sequence: this.sequence,
      node: this.node.toJSON(options),
      time: this.time,
      halts: this.halts,
      platform: this.platform,
      headsign: this._actualHeadsignSequence !== null
        ? this._feed.applyTranslation(this._route.getStopWithSequence(this._actualHeadsignSequence), 'headsign', options?.language)
        : this._feed.applyTranslation(this._route, 'headsign', options?.language),
      alightDirection: this.alightDirection,
      status: this.status ?? null,
    };
  }


  // Copy the stop
  _copy(modifiedProps = {}) {
    return new RouteStop(this._feed, this._route, this.sequence, {...this, modifiedProps});
  }
}
