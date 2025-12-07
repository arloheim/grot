// Class that defines an agency in a feed
export default class Agency
{
  // Constructor
  constructor(feed, props) {
    this._feed = feed;

    this.id = props.id;
    this.name = props.name;
    this.abbr = props.abbr;
    this.description = props.description;
    this.url = props.url;
    this.icon = props.icon;
  }


  // Return the routes of the agency
  get routes() {
    return this._feed.routes.filter(route => route.agency.id === this.id);
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
