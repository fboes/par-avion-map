export default class FlightLog {
    constructor(coordinates) {
        this._coordinates = [];
        this.push(coordinates, 0);
    }
    push(coordinates, timestamp) {
        coordinates.timestamp = timestamp;
        this._coordinates.push(coordinates);
    }
    get coordinates() {
        return this._coordinates;
    }
}
