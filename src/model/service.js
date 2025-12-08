import { Record } from "./record.js";
import { FeedError } from "./exception.js";


// Class that defines a service in a feed
export class Service extends Record
{
  // Constructor
  constructor(feed, id, data) {
    super(feed, id);
    
    if (!('name' in data))
      throw new FeedError(`Missing required field "name" in service with id "${this.id}"`);
    
    this.name = data.name;
    this.icon = data.icon ?? null;
    this.color = data.color ?? null;
    this.agency = data.agency ?? null;
  }

  // Return the JSON representation of the type
  toJSON(options) {
    return {
      id: this.id,
      name: this._feed.applyTranslation(this, 'name', options?.language),
      icon: this.icon,
      color: this.color,
      agency: this.agency?.toJSON(options),
    };
  }
}
