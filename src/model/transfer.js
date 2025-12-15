import { Record } from "./record.js";
import { FeedError } from "./exception.js";


// Class that defines a transfer in a feed
export class Transfer extends Record
{
  // Constructor
  constructor(feed, id, data) {
    super(feed, id);
    
    if (!('from' in data))
      throw new FeedError(`Missing required field "from" in transfer with id "${this.id}"`);
    if (!('to' in data))
      throw new FeedError(`Missing required field "to" in transfer with id "${this.id}"`);
    if (!('duration' in data))
      throw new FeedError(`Missing required field "duration" in transfer with id "${this.id}"`);
    
    this.from = data.from;
    this.to = data.to;
    this.duration = data.duration;
    this.icon = data.icon ?? 'person-walking';
    this.direct = data.direct ?? true;

    this._initialTime = data._initialTime ?? 0;
    this._cumulativeTime = this._initialTime + this.duration;
    this._journeyTime = undefined;
  }
  
  // Return the JSON representation of the transfer
  toJSON(options) {
    return {
      id: this.id,
      from: this.from.toJSON(options), 
      to: this.to.toJSON(options),
      duration: this.duration,
      formattedDuration: `${Math.floor(this.duration / 3600)}:${Math.floor(this.duration % 3600 / 60).toString().padStart(2, '0')}`,
      icon: this.icon,
      direct: this.direct,
      
      journeyTime: this._journeyTime?.format('YYYY-MM-DD[T]HH:mm:ss'),
      formattedJourneyTime: this._journeyTime?.format('H:mm'),
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
  _alignToNode(node, modifiedProps = {}) {
    if (this.from.id === node.id)
      return this._copy(modifiedProps);
    else if (this.to.id === node.id)
      return this._copy({...modifiedProps, from: this.to, to: this.from});
    else
      return undefined;
  }

  // Align the transfer to the opposite node of the specified node
  _alignToOppositeNode(node, modifiedProps = {}) {
    return this._alignToNode(this.getOppositeNode(node), modifiedProps);
  }
}
