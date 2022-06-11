import LogCoordinates from "../Types/LogCoordinates.js";

export default class FlightLog {
  protected _coordinates: LogCoordinates[] = [];

  constructor(coordinates: LogCoordinates, protected maxEntries = 3600) {
    this.push(coordinates);
  }

  push(coordinates: LogCoordinates) {
    if (this.maxEntries && this._coordinates.length > this.maxEntries) {
      this._coordinates.shift();
    }
    this._coordinates.push(coordinates);
  }

  get coordinates() {
    return this._coordinates;
  }
}
