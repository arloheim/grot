// Class that defines a record in a fed
export default class Record
{
  // Constructor
  constructor(feed, collection, id) {
    this._feed = feed;
    this._collection = collection;
    
    this.id = id;
  }
}