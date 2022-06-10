export default class FlightLog {
    constructor(coordinates, maxEntries = 3600) {
        this.maxEntries = maxEntries;
        this._coordinates = [];
        this.push(coordinates, 0);
    }
    push(coordinates, timestamp) {
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
