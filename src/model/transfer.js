import Record from "./record.js";


// Class that defines a transfer in a feed
export default class Transfer extends Record
{
  // Constructor
  constructor(feed, id, data) {
    super(feed, id);
    
    if (!('from' in data))
      throw new FeedError(`Missing required field "from" in transfer with id "${this.id}"`);
    if (!('to' in data))
      throw new FeedError(`Missing required field "to" in transfer with id "${this.id}"`);
    if (!('time' in data))
      throw new FeedError(`Missing required field "time" in transfer with id "${this.id}"`);
    
    this.from = data.from;
    this.to = data.to;
    this.time = data.time;
    this.icon = data.icon ?? 'person-walking';
    this.direct = data.direct ?? true;

    this.initialTime = data.initialTime ?? 0;
    this._cumulativeTime = this.initialTime + this.time;
  }
  
  // Return the JSON representation of the transfer
  toJSON(options) {
    return {
      id: this.id,
      from: this.from.toJSON(options), 
      to: this.to.toJSON(options),
      time: this.time,
      icon: this.icon,
      direct: this.direct,
    };
  }


  // Return if the transfer includes the specified node
  includesNode(node) {
    return this.from.id === node.id || this.to.id === node.id;
  }

  // Get the opposite node of the speficied node in the transfer
  getOppositeNode(node) {
    if (this.from.id === node.id)
      return this.to;
    else if (this.to.id === node.id)
      return this.from;
    else
      return undefined;
  }


  // Copy the transfer
  _copy(modifiedProps = {}) {
    return new Transfer(this._feed, this.id, {...this, ...modifiedProps});
  }

  // Align the transfer to the specified node
  _alignToNode(node) {
    if (this.from.id === node.id)
      return this._copy();
    else if (this.to.id === node.id)
      return this._copy({from: this.to, to: this.from});
    else
      return undefined;
  }

  // Align the transfer to the opposite node of the specified node
  _alignToOppositeNode(node) {
    return this._alignToNode(this.getOppositeNode(node));
  }

  // Apply an initial time to the transfer
  _withInitialTime(initialTime) {
    return this._copy({initialTime});
  }
}
