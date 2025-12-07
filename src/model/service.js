// Class that defines a service in a feed
export default class Service
{
  // Constructor
  constructor(feed, data) {
    this._feed = feed;

    this.id = data.id;
    this.name = data.name;
    this.icon = data.icon;
    this.color = data.color;
    this.agency = data.agency;
  }


  // Return the JSON representation of the type
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      icon: this.icon ?? null,
      color: this.color ?? null,
      agency: this.agency?.toJSON(),
    };
  }
}
