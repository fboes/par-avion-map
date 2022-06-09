import Coordinates from "../Types/Coordinates";

export default class FlightLog {
  protected _coordinates: Coordinates[] = [];

  constructor(coordinates: Coordinates) {
    this.push(coordinates, 0);
  }

  push(coordinates: Coordinates, timestamp: number) {
    coordinates.timestamp = timestamp;
    this._coordinates.push(coordinates);
  }

  get coordinates() {
    return this._coordinates;
  }
}
