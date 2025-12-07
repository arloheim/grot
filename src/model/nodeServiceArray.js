// Class that defines an array of node services
export default class NodeServiceArray
{
  // Constructor
  constructor(node, services) {
    this.node = node;
    this.services = services;
  }

  // Return the JSON representation of the node service array
  toJSON() {
    return this.services.map(service => service.toJSON());
  }
}