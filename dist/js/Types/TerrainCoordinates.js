import TerrainMap from "../ParAvion/TerrainMap.js";
import Coordinates from "./Coordinates.js";
export default class TerrainCoordinates {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
    getCoordinates(elevation = null) {
        return new Coordinates(this.a / TerrainMap.RESOLUTION, this.b / TerrainMap.RESOLUTION, elevation);
    }
}
//# sourceMappingURL=TerrainCoordinates.js.map