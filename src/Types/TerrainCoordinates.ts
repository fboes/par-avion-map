import TerrainMap from "../ParAvion/TerrainMap.js";
import Coordinates from "./Coordinates.js";
import Degree from "./Degree.js";

export default class TerrainCoordinates {
  public constructor(public a: number, public b: number) {
  }

  public getCoordinates(elevation: number | null = null) {
    return new Coordinates(this.a / TerrainMap.RESOLUTION, this.b / TerrainMap.RESOLUTION, elevation);
  }

  public getBearing(coord2: TerrainCoordinates): Degree {
    let degree = Coordinates.rad2deg(Math.atan2(
      (coord2.b - this.b),
      (coord2.a - this.a)
    ));

    return new Degree(degree + 90);
  }

  getDistance(coord2: TerrainCoordinates) {
    return Math.sqrt(Math.pow(coord2.b - this.b, 2) + Math.pow(coord2.a - this.a, 2));
  }
}
