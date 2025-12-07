// Class that defines an array of route services
export default class RouteServiceArray
{
  // Constructor
  constructor(route, services) {
    this.route = route;
    this.services = services;
  }

  // Return the JSON representation of the route service array
  toJSON() {
    return this.services.map(service => service.toJSON());
  }
}