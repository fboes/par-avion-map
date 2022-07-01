export default class FlightLog {
    constructor(coordinates, maxEntries = 3600) {
        this.maxEntries = maxEntries;
        this._coordinates = [];
        this.push(coordinates);
    }
    push(coordinates) {
        if (this.maxEntries && this._coordinates.length > this.maxEntries) {
            this._coordinates.shift();
        }
        this._coordinates.push(coordinates);
    }
    get coordinates() {
        return this._coordinates;
    }
}
