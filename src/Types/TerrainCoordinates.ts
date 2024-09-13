import Coordinates from "./Coordinates.js";
import Degree from "./Degree.js";

export default class TerrainCoordinates {
  public constructor(
    public a: number,
    public b: number,
  ) {}

  public getCoordinates(resolution: number, elevation: number | null) {
    return new Coordinates(this.a / resolution, this.b / resolution, elevation);
  }

  public getBearing(coord2: TerrainCoordinates): Degree {
    let degree = Coordinates.rad2deg(
      Math.atan2(coord2.b - this.b, coord2.a - this.a),
    );

    return new Degree(degree + 90);
  }

  getDistance(coord2: TerrainCoordinates) {
    return Math.sqrt(
      Math.pow(coord2.b - this.b, 2) + Math.pow(coord2.a - this.a, 2),
    );
  }
}
