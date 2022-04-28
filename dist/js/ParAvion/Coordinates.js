import TerrainCoordinates from "./TerrainCoordinates.js";
import TerrainMap from "./TerrainMap.js";
export default class Coordinates {
    constructor(x, y, elevation = null) {
        this.x = x;
        this.y = y;
        this.elevation = elevation;
    }
    getTerrainCoordinates() {
        return new TerrainCoordinates(this.x * TerrainMap.RESOLUTION, this.y * TerrainMap.RESOLUTION);
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
        return degree * (Math.PI / 180);
    }
    static rad2deg(rad) {
        return rad / (Math.PI / 180);
    }
}
//# sourceMappingURL=Coordinates.js.map
