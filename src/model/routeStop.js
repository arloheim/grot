// Class that defines a stop in a route
export class RouteStop
{
  // Constructor
  constructor(feed, route, sequence, data) {
    this._feed = feed;
    this._route = route;
    this.sequence = parseInt(sequence);

    if (!('node' in data))
      throw new FeedError(`Missing required field "node" in route stop with sequence ${this.sequence} in route with id "${this._route.id}"`);
    if (!('duration' in data))
      throw new FeedError(`Missing required field "duration" in route stop with sequence ${this.sequence} in route with id "${this._route.id}"`);
    
    this.node = data.node;
    this.duration = data.duration;
    this.halts = data.halts ?? true;
    this.platform = data.platform ?? null;
    this.headsign = data.headsign ?? null;
    this.alightDirection = data.alightDirection ?? null;
    this.status = data.status ?? null;

    this._headsignStopSequence = undefined;
    this._cumulativeTime = 0;
    this._journeyTime = undefined;
  }

  // Return the JSON representation of the route stop
  toJSON(options) {
    return {
      sequence: this.sequence,
      node: this.node.toJSON(options),
      duration: this.duration,
      formattedDuration: `${Math.floor(this.duration / 3600)}:${Math.floor(this.duration % 3600 / 60).toString().padStart(2, '0')}`,
      halts: this.halts,
      platform: this.platform,
      headsign: this._feed.applyTranslation(this._headsignStopSequence !== undefined ? this.headsignStop : this._route, 'headsign', options?.language),
      alightDirection: this.alightDirection,
      status: this.status ?? null,
      
      journeyTime: this._journeyTime?.format('YYYY-MM-DD[T]HH:mm:ss'),
      formattedJourneyTime: this._journeyTime?.format('H:mm'),
    };
  }


  // Return if this stop is the first stop of the route
  get isFirstStop() {
    return this === this._route.stops.at(0);
  }

  // Return if this stop is the first stop of the route
  get isLastStop() {
    return this === this._route.stops.at(-1);
  }

  // Return the stop that contains the headsign for this stop
  get headsignStop() {
    if (this._headsignStopSequence === undefined)
      return undefined;
    else if (this._headsignStopSequence === this.sequence)
      return this;
    else
      return this._route.getStopWithSequence(this._headsignStopSequence);
  }


  // Copy the stop
  _copy(modifiedProps = {}) {
    return new RouteStop(this._feed, this._route, this.sequence, {...this, modifiedProps});
  }
}
