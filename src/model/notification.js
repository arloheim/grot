import { Record } from "./record.js";
import { FeedError } from "./exception.js";


// Class that defines a notification in a feed
export class Notification extends Record
{
  // Constructor
  constructor(feed, id, data) {
    super(feed, id);

    if (!('type' in data))
      throw new FeedError(`Missing required field "type" in notification with id "${this.id}"`);
    if (!('name' in data))
      throw new FeedError(`Missing required field "name" in notification with id "${this.id}"`);

    this.type = data.type;
    this.name = data.name;
    this.description = data.description ?? null;
    this.period = data.period ?? null;
    this.icon = data.icon ?? this.type.icon;
    this.color = data.color ?? this.type.color;
    this.affectedNodes = data.affectedNodes ?? [];
    this.affectedRoutes = data.affectedRoutes ?? [];
    this.visible = data.visible ?? this.type.visible;
    this.severe = data.severe ?? this.type.severe;
  }

  // Return the JSON representation of the notification
  toJSON(options) {
    return {
      id: this.id,
      type: this.type.toJSON(options),
      name: this._feed.applyTranslation(this, 'name', options?.language),
      description: this._feed.applyTranslation(this, 'description', options?.language),
      period: this._feed.applyTranslation(this, 'period', options?.language),
      icon: this.icon ?? null,
      color: this.color ?? null,
      affectedNodes: this.affectedNodes.map(node => node.toJSON(options)),
      affectedRoutes: this.affectedRoutes.map(route => route.toJSON(options)),
      visible: this.visible,
      severe: this.severe,
    };
  }


  // Return if the notification affects the specified node
  affectsNode(node) {
    return this.affectedNodes.find(n => n.id === node.id) !== undefined;
  }

  // Return if the notification affects the specified route
  affectsRoute(route) {
    return this.affectedRoutes.find(r => r.id === route.id) !== undefined;
  }
}