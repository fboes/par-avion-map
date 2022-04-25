import TerrainMap from "../ParAvion/TerrainMap.js";
import Coordinates from "./Coordinates.js";

export default class TerrainCoordinates {
  public constructor(public a: number, public b: number) {
  }

  public getCoordinates(elevation: number|null = null) {
    return new Coordinates(this.a / TerrainMap.RESOLUTION, this.b / TerrainMap.RESOLUTION, elevation);
  }
}
