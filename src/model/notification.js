// Class that defines a notification in a feed
export default class Notification
{
  // Constructor
  constructor(feed, data) {
    this._feed = feed;

    this.type = data.type;
    this.id = data.id;
    this.name = data.name ?? this.type?.name;
    this.description = data.description;
    this.period = data.period;
    this.affectedNodes = data.affectedNodes ?? [];
    this.affectedRoutes = data.affectedRoutes ?? [];
    this.icon = data.icon ?? this.type?.icon;
    this.color = data.color ?? this.type?.color;
    this.visible = data.visible ?? this.type?.visible ?? true;
    this.severe = data.severe ?? this.type?.severe ?? false;
  }


  // Return if the notification affects the specified node
  affectsNode(node) {
    return this.affectedNodes.find(n => n.id === node.id) !== undefined;
  }

  // Return if the notification affects the specified route
  affectsRoute(route) {
    return this.affectedRoutes.find(r => r.id === route.id) !== undefined;
  }


  // Return the JSON representation of the notification
  toJSON() {
    return {
      id: this.id,
      type: this.type.toJSON(),
      name: this.name,
      description: this.description,
      period: this.period,
      affectedNodes: this.affectedNodes.map(node => node.toJSON()),
      affectedRoutes: this.affectedRoutes.map(route => route.toJSON()),
      icon: this.icon ?? null,
      color: this.color ?? null,
      visible: this.visible,
      severe: this.severe,
    };
  }
}