import Record from "./record.js";


// Class that defines the type of a notification in a feed
export default class NotificationType extends Record
{
  // Constructor
  constructor(feed, id, data) {
    super(feed, "notification_types", id);
    
    this.name = data.name;
    this.icon = data.icon;
    this.color = data.color;
    this.visible = data.visible ?? true;
    this.severe = data.severe ?? false;
  }


  // Return the JSON representation of the notification type
  toJSON() {
    return {
      id: this.id,
      name: this.name,
    };
  }
}
