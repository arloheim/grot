// Class that defines a modality in a feed
export default class Modality
{
  // Constructor
  constructor(feed, data) {
    this._feed = feed;

    this.id = data.id;
    this.name = data.name;
    this.nodeName = data.nodeName;
    this.abbr = data.abbr;
    this.description = data.description;
    this.icon = data.icon;
  }


  // Return the JSON representation of the modality
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      nodeName: this.nodeName,
      abbr: this.abbr ?? null,
      description: this.description ?? null,
      icon: this.icon,
    };
  }
}
