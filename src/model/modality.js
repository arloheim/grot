import Record from "./record.js";


// Class that defines a modality in a feed
export default class Modality extends Record
{
  // Constructor
  constructor(feed, id, data) {
    super(feed, "modalities", id);
    
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
