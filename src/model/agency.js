import Record from "./record.js";


// Class that defines an agency in a feed
export default class Agency extends Record
{
  // Constructor
  constructor(feed, id, data) {
    super(feed, "agencies", id);
    
    this.name = data.name;
    this.abbr = data.abbr;
    this.description = data.description;
    this.url = data.url;
    this.icon = data.icon;
  }


  // Return the routes of the agency
  get routes() {
    return this._feed.getRoutes().filter(route => route.agency.id === this.id);
  }


  // Return the JSON representation of the agency
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      abbr: this.abbr ?? null,
      description: this.description ?? null,
      url: this.url ?? null,
      icon: this.icon,
    };
  }
}
