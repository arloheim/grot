import { Record } from "./record.js";
import { FeedError } from "./exception.js";


// Class that defines the type of a notification in a feed
export class NotificationType extends Record
{
  // Constructor
  constructor(feed, id, data) {
    super(feed, id);

    if (!('name' in data))
      throw new FeedError(`Missing required field "name" in notification type with id "${this.id}"`);
    
    this.name = data.name;
    this.icon = data.icon ?? null;
    this.color = data.color ?? null;
    this.visible = data.visible ?? true;
    this.severe = data.severe ?? false;
  }

  // Return the JSON representation of the notification type
  toJSON(options) {
    return {
      id: this.id,
      name: this._feed.applyTranslation(this, 'name', options?.language),
    };
  }
}
