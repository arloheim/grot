// Class that defines a transfer leg of a journey
export class TransferLeg
{
  // Constructor
  constructor(transfer) {
    this.transfer = transfer;
  }

  // Return the JSON representation of the route leg
  toJSON(options) {
    return {
      type: 'transfer',
      from: this.from,
      to: this.to,
      transfer: this.transfer.toJSON(options),
    };
  }


  // Return the departure node of the transfer
  get from() {
    return this.transfer.from;
  }

  // Return the arrival node of the transfer
  get to() {
    return this.transfer.to;
  }
  
  // Return the cumulative time of the transfer
  get cumulativeTime() {
    return this.transfer._cumulativeTime;
  }
}
