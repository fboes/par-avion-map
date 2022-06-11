export default class LogCoordinates {
    constructor(plane, timestamp) {
        this.timestamp = timestamp;
        this.coordinates = plane.coordinates;
        this.heading = plane.heading;
        this.altAglFt = plane.altAglFt;
    }
}
