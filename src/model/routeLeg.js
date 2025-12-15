// Class that defines a route leg of a journey
export class RouteLeg
{
  // Constructor
  constructor(route) {
    this.route = route;
  }

  // Return the JSON representation of the route leg
  toJSON(options) {
    return {
      type: 'route',
      from: this.from,
      to: this.to,
      route: this.route.toJSON(options),
    };
  }
  

  // Return the departure node of the route
  get from() {
    return this.route.stops.at(0).node;
  }

  // Return the arrival node of the route
  get to() {
    return this.route.stops.at(-1).node;
  }

  // Return the cumulative time of the route
  get cumulativeTime() {
    return this.route.stops.at(-1)._cumulativeTime;
  }
}
