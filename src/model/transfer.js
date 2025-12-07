// Class that defines a transfer in a feed
export default class Transfer
{
  // Constructor
  constructor(feed, data) {
    this._feed = feed;

    this.id = data.id;
    this.between = data.between;
    this.and = data.and;
    this.time = data.time;
    this.direct = data.direct ?? true;
    this.icon = data.icon ?? 'person-walking';

    this.oppositeNode = undefined;
    this.initialTime = data.initialTime ?? 0;
    this.cumulativeTime = this.initialTime + this.time;
  }


  // Return if the transfer includes the specified node
  includesNode(node) {
    return this.between.id === node.id || this.and.id === node.id;
  }

  // Get the opposite node of the speficied node in the transfer
  getOppositeNode(node) {
    if (this.between.id === node.id)
      return this.and;
    else if (this.and.id === node.id)
      return this.between;
    else
      return undefined;
  }


  // Copy the transfer
  _copy(modifiedProps = {}) {
    return new Transfer(this._feed, {...this, ...modifiedProps});
  }

  // Align the transfer to the specified node
  _alignToNode(node) {
    if (this.between.id === node.id)
      return this._copy();
    else if (this.and.id === node.id)
      return this._copy({between: this.and, and: this.between});
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


  // Return the JSON representation of the transfer
  toJSON() {
    return {
      id: this.id,
      nodes: [this.between.toJSON(), this.and.toJSON()],
      time: this.time,
      direct: this.direct,
      icon: this.icon,
      oppositeNode: this.oppositeNode,
    };
  }
}
