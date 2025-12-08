import { Record } from "./record.js";
import { FeedError } from "./exception.js";


// Class that defines an agency in a feed
export class Agency extends Record
{
  // Constructor
  constructor(feed, id, data) {
    super(feed, id);

    if (!('name' in data))
      throw new FeedError(`Missing required field "name" in agency with id "${this.id}"`);
    
    this.name = data.name;
    this.abbr = data.abbr ?? null;
    this.description = data.description ?? null;
    this.url = data.url ?? null;
    this.icon = data.icon ?? null;
  }

  // Return the JSON representation of the agency
  toJSON(options) {
    return {
      id: this.id,
      name: this._feed.applyTranslation(this, 'name', options?.language),
      abbr: this._feed.applyTranslation(this, 'abbr', options?.language),
      description: this._feed.applyTranslation(this, 'description', options?.language),
      url: this._feed.applyTranslation(this, 'url', options?.language),
      icon: this.icon,
    };
  }


  // Return the routes of the agency
  getRoutes() {
    return this._feed.getRoutes().filter(route => route.agency.id === this.id);
  }
}
