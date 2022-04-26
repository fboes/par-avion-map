import TerrainCoordinates from "./TerrainCoordinates.js";
import TerrainMap from "../ParAvion/TerrainMap.js";
import Degree from "./Degree.js";

export default class Coordinates {
  public constructor(public x: number, public y: number, public elevation: number | null = null) {
  }

  public getTerrainCoordinates() {
    return new TerrainCoordinates(this.x * TerrainMap.RESOLUTION, this.y * TerrainMap.RESOLUTION);
  }


  public getNewCoordinates(degree: Degree, distance: number): Coordinates {
    let rad = Coordinates.deg2rad(degree);

    return new Coordinates(
      (Math.sin(rad) * distance) + this.x,
      (-Math.cos(rad) * distance) + this.y
    );
  }

  public getBearing(coord2: Coordinates): number {
    let degree = Coordinates.rad2deg(Math.atan2(
      (coord2.y - this.y),
      (coord2.x - this.x)
    ));

    return (degree + 360 + 90) % 360;
  }

  public static deg2rad(degree: Degree): number {
    return degree.degree * (Math.PI / 180);
  }

  public static rad2deg(rad: number): number {
    return rad / (Math.PI / 180);
  }

  getDistance(coord2: Coordinates) {
    return Math.sqrt(Math.pow(coord2.y - this.y, 2) + Math.pow(coord2.x - this.x, 2));
  }
}
