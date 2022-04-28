import TerrainCoordinates from "./TerrainCoordinates.js";
export default class Coordinates {
    constructor(x, y, elevation = null) {
        this.x = x;
        this.y = y;
        this.elevation = elevation;
    }
    getTerrainCoordinates(resolution) {
        return new TerrainCoordinates(this.x * resolution, this.y * resolution);
    }
    getNewCoordinates(degree, distance) {
        let rad = Coordinates.deg2rad(degree);
        return new Coordinates((Math.sin(rad) * distance) + this.x, (-Math.cos(rad) * distance) + this.y);
    }
    getBearing(coord2) {
        let degree = Coordinates.rad2deg(Math.atan2((coord2.y - this.y), (coord2.x - this.x)));
        return (degree + 360 + 90) % 360;
    }
    static deg2rad(degree) {
        return degree.degree * (Math.PI / 180);
    }
    static rad2deg(rad) {
        return rad / (Math.PI / 180);
    }
    getDistance(coord2) {
        return Math.sqrt(Math.pow(coord2.y - this.y, 2) + Math.pow(coord2.x - this.x, 2));
    }
}
//# sourceMappingURL=Coordinates.js.map