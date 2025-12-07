// Class that defines a stop in a route
export default class RouteStop
{
  // Constructor
  constructor(feed, data) {
    this._feed = feed;

    this.sequence = parseInt(data.sequence);
    this.node = data.node;
    this.time = data.time ?? 0;
    this.halts = data.halts ?? true;
    this.platform = data.platform || undefined;
    this.headsign = data.headsign;
    this.alightDirection = data.alightDirection;
    this.status = data.status;

    this.first = false;
    this.last = false;
    this.cumulativeTime = 0;
    this.changedHeadsign = false;
  }


  // Copy the stop
  _copy(modifiedProps = {}) {
    return new RouteStop(this._feed, {...this, modifiedProps});
  }


  // Return the JSON representation of the route stop
  toJSON() {
    return {
      sequence: this.sequence,
      node: this.node.toJSON(),
      time: this.time,
      halts: this.halts,
      platform: this.platform ?? null,
      headsign: this.headsign,
      alightDirection: this.alightDirection ?? null,
      status: this.status ?? null,
    };
  }
}
