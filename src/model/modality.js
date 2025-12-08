import { Record } from "./record.js";
import { FeedError } from "./exception.js";


// Class that defines a modality in a feed
export class Modality extends Record
{
  // Constructor
  constructor(feed, id, data) {
    super(feed, id);

    if (!('name' in data))
      throw new FeedError(`Missing required field "name" in modality with id "${this.id}"`);
    if (!('nodeName' in data))
      throw new FeedError(`Missing required field "nodeName" in modality with id "${this.id}"`);
    
    this.name = data.name;
    this.nodeName = data.nodeName;
    this.abbr = data.abbr ?? null;
    this.description = data.description ?? null;
    this.icon = data.icon ?? null;
  }

  // Return the JSON representation of the modality
  toJSON(options) {
    return {
      id: this.id,
      name: this._feed.applyTranslation(this, 'name', options?.language),
      nodeName: this._feed.applyTranslation(this, 'nodeName', options?.language),
      abbr: this._feed.applyTranslation(this, 'abbr', options?.language),
      description: this._feed.applyTranslation(this, 'description', options?.language),
      icon: this.icon,
    };
  }
}
