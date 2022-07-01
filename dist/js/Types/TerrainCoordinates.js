import Coordinates from "./Coordinates.js";
import Degree from "./Degree.js";
export default class TerrainCoordinates {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
    getCoordinates(resolution, elevation) {
        return new Coordinates(this.a / resolution, this.b / resolution, elevation);
    }
    getBearing(coord2) {
        let degree = Coordinates.rad2deg(Math.atan2((coord2.b - this.b), (coord2.a - this.a)));
        return new Degree(degree + 90);
    }
    getDistance(coord2) {
        return Math.sqrt(Math.pow(coord2.b - this.b, 2) + Math.pow(coord2.a - this.a, 2));
    }
}
