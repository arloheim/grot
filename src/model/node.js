import Record from "./record.js";


// Class that defines a node in a feed
export default class Node extends Record
{
  // Constructor
  constructor(feed, id, data) {
    super(feed, "nodes", id);

    this.slug = data.slug;
    this.name = data.name;
    this.code = data.code;
    this.abbr = data.abbr;
    this.description = data.description;
    this.url = data.url;
    this.modality = data.modality;
    this.icon = data.icon ?? this.modality?.icon ?? 'location-dot';
    this.city = data.city;
    this.x = data.x;
    this.y = data.y;
    this.visible = data.visible ?? true;
  }


  // Return the services for the node
  get services() {
    return this._feed.getNodeServices(this.id);
  }

  // Return the routes that have a stop at the node
  get routes() {
    return this._feed.getRoutes()
      .filter(route => route.getStopsAtNode(this).length > 0)
      .flatMap(this._addStopsToRoute.bind(this));
  }

  // Return the transfers that include the node
  get transfers() {
    return this._feed.getTransfers()
      .filter(transfer => transfer.includesNode(this))
      .flatMap(this._addOppositeNodeToTransfer.bind(this));
  }

  // Return the notifications that affect the node
  get notifications() {
    return this._feed.getNotifications()
      .filter(notification => notification.affectsNode(this));
  }


  // Add the stops to a route that stops at a node
  _addStopsToRoute(route) {
    return route.getStopsAtNode(this).map(stop => {
      const stopRoute = route._sliceBeginningAtSequence(stop.sequence);
      stopRoute.stopAtNode = stop;
      return stopRoute;
    });
  }

  // Add the opposite node to a transfer of a node
  _addOppositeNodeToTransfer(transfer) {
    return transfer._alignToNode(this);
  }


  // Return the JSON representation of the node
  toJSON() {
    return {
      id: this.id,
      slug: this.slug,
      name: this.name,
      code: this.code ?? null,
      abbr: this.abbr ?? null,
      description: this.description ?? null,
      url: this.url ?? null,
      modality: this.modality?.toJSON(),
      icon: this.icon,
      city: this.city ?? null,
      x: this.x ?? null,
      y: this.y ?? null,
      visible: this.visible,
    }
  }
}
