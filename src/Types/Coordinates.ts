import TerrainCoordinates from "./TerrainCoordinates.js";
import Degree from "./Degree.js";

export default class Coordinates {
  public constructor(
    public x: number,
    public y: number,
    public elevation: number | null = null,
  ) {}

  public getTerrainCoordinates(resolution: number) {
    return new TerrainCoordinates(this.x * resolution, this.y * resolution);
  }

  public getNewCoordinates(
    degree: Degree,
    distance: number,
    elevation: number | null = null,
  ): Coordinates {
    let rad = degree.rad;

    return new Coordinates(
      Math.sin(rad) * distance + this.x,
      -Math.cos(rad) * distance + this.y,
      elevation,
    );
  }

  public getBearing(coord2: Coordinates): number {
    let degree = Coordinates.rad2deg(
      Math.atan2(coord2.y - this.y, coord2.x - this.x),
    );

    return (degree + 360 + 90) % 360;
  }

  public static rad2deg(rad: number): number {
    return rad / (Math.PI / 180);
  }

  getDistance(coord2: Coordinates) {
    return Math.sqrt(
      Math.pow(coord2.y - this.y, 2) + Math.pow(coord2.x - this.x, 2),
    );
  }
}
