// Class that defines a translation in a feed
export default class Translation
{
  // Constructor
  constructor(feed, id, table) {
    this._feed = feed;

    this.id = id;
    this.table = table;
  }

  // Apply the translation to a record
  apply(record) {
    // Check if the record is contained in the table
    if (!(record._collection in this.table) || !(record.id in this.table[record._collection]))
      return record;

    // Assign the translations to the record
    Object.assign(record, this.table[record._collection][record.id]);
    return record;
  }
}