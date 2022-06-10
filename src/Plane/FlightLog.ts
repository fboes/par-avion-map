import Coordinates from "../Types/Coordinates";

export default class FlightLog {
  protected _coordinates: Coordinates[] = [];

  constructor(coordinates: Coordinates, protected maxEntries = 3600) {
    this.push(coordinates, 0);
  }

  push(coordinates: Coordinates, timestamp: number) {
    if (this.maxEntries && this._coordinates.length > this.maxEntries) {
      this._coordinates.shift();
    }
    coordinates.timestamp = timestamp;
    this._coordinates.push(coordinates);
  }

  get coordinates() {
    return this._coordinates;
  }
}
