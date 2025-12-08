// Class that defines an array of route services
export class RouteServiceArray
{
  // Constructor
  constructor(route, services) {
    this.route = route;
    this.services = services;
  }

  // Return the JSON representation of the route service array
  toJSON(options) {
    return this.services.map(service => service.toJSON(options));
  }
}