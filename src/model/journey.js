import { RouteLeg } from './routeLeg.js';
import { TransferLeg } from './transferLeg.js';


// Class that defines a journey
export class Journey
{
  // Constructor
  constructor(legs, departureTime) {
    this.legs = legs;

    this.departureTime = departureTime;
    this.arrivalTime = departureTime.add(legs.at(-1).cumulativeTime, 'seconds');
    this.duration = this.arrivalTime.diff(this.departureTime, 'seconds');

    // Iterate over the legs
    for (let leg of this.legs) {
      // Check the type of the leg
      if (leg instanceof RouteLeg) {
        // Copy the route
        leg.route = leg.route._copy();

        // Iterate over the stops of the route and set the journey time
        for (let stop of leg.route.stops)
          stop._journeyTime = this.departureTime.add(stop._cumulativeTime, 'seconds');
      } else if (leg instanceof TransferLeg) {
        // Copy the transfer
        leg.transfer = leg.transfer._copy();

        // Set the journey time
        leg.transfer._journeyTime = this.departureTime.add(leg.transfer.duration, 'seconds');
      }
    }
  }

  // Return the JSON representation of the route leg
  toJSON(options) {
    return {
      from: this.from.toJSON(options),
      to: this.to.toJSON(options),
      departureTime: this.departureTime.format('YYYY-MM-DD[T]HH:mm:ss'),
      formattedDepartureTime: this.departureTime.format('H:mm'),
      arrivalTime: this.arrivalTime.format('YYYY-MM-DD[T]HH:mm:ss'),
      formattedArrivalTime: this.arrivalTime.format('H:mm'),
      duration: this.duration,
      formattedDuration: `${Math.floor(this.duration / 3600)}:${Math.floor(this.duration % 3600 / 60).toString().padStart(2, '0')}`,
      transfers: this.transfers,
      legs: this.legs.map(leg => leg.toJSON(options)),
    };
  }


  // Return the departure node of the journey
  get from() {
    return this.legs.at(0).from;
  }

  // Return the arrival node of the journey
  get to() {
    return this.legs.at(-1).to;
  }

  // Return the amount of transfers of the journey
  get transfers() {
    return this.legs.filter(l => l instanceof RouteLeg).length - 1;
  }
}
