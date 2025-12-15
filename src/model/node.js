import { Record } from "./record.js";
import { FeedError } from "./exception.js";


// Class that defines a node in a feed
export class Node extends Record
{
  // Constructor
  constructor(feed, id, data) {
    super(feed, id);

    if (!('name' in data))
      throw new FeedError(`Missing required field "name" in node with id "${this.id}"`);

    this.code = data.code ?? null;
    this.name = data.name;
    this.abbr = data.abbr ?? null;
    this.description = data.description ?? null;
    this.url = data.url ?? null;
    this.city = data.city ?? null;
    this.modality = data.modality ?? null;
    this.icon = data.icon ?? this.modality?.icon ?? 'location-dot';
    this.x = data.x ?? null;
    this.y = data.y ?? null;
    this.visible = data.visible ?? true;
  }
  
  // Return the JSON representation of the node
  toJSON(options) {
    return {
      id: this.id,
      code: this.code,
      name: this._feed.applyTranslation(this, 'name', options?.language),
      abbr: this._feed.applyTranslation(this, 'abbr', options?.language),
      description: this._feed.applyTranslation(this, 'description', options?.language),
      url: this._feed.applyTranslation(this, 'url', options?.language),
      city: this._feed.applyTranslation(this, 'city', options?.language),
      modality: this.modality?.toJSON(options),
      icon: this.icon,
      x: this.x,
      y: this.y,
      visible: this.visible,
    }
  }


  // Return the services for the node
  getServices() {
    return this._feed.getNodeServices(this.id);
  }

  // Return the routes that have a stop at the node
  getRoutes(excludeNonHalts = false) {
    return this._feed.getRoutes()
      .filter(route => route.getStopsAtNode(this, excludeNonHalts).length > 0)
      .flatMap(this._addStopsToRoute.bind(this));
  }

  // Return the transfers that include the node
  getTransfers() {
    return this._feed.getTransfers()
      .filter(transfer => transfer.includesNode(this))
      .flatMap(transfer => transfer._alignToNode(this));
  }

  // Return the notifications that affect the node
  getNotifications() {
    return this._feed.getNotifications()
      .filter(notification => notification.affectsNode(this));
  }


  // Add the stops to a route that stops at a node
  _addStopsToRoute(route) {
    return route.getStopsAtNode(this)
      .map(stop => route._sliceBeginningAtSequence(stop.sequence, {_stopAtNode: stop}));
  }
}
