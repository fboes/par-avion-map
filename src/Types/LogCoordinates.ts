import Plane from "../Plane/Plane.js";
import Coordinates from "./Coordinates.js";
import Degree from "./Degree.js";

export default class LogCoordinates {
  public coordinates: Coordinates;
  public heading: Degree;
  public altAglFt: number;

  constructor(plane: Plane, public timestamp: number) {
    this.coordinates = plane.coordinates;
    this.heading = plane.heading;
    this.altAglFt = plane.altAglFt;
  }
}
