import Point from "./Point.js";
import Coordinates from "../Types/Coordinates.js";
import Randomizer from "../Helper/Randomizer.js";
import Degree from "../Types/Degree.js";

export default class HoldingPattern extends Point {
  public isRight: boolean;
  public direction: Degree;

  public static LENGTH = 4.9; // @180 kts & 1min / leg
  public static WIDTH = 1.9; // @180kts & 1min / leg

  public constructor(public coordinates: Coordinates, protected randomizer: Randomizer) {
    super(coordinates, randomizer);

    this.isRight = !this.randomizer.isRandTrue(20);
    this.direction = this.randomizer.getDegree();
  }

  getCenterCoordinates(): Coordinates {
    return this.coordinates.getNewCoordinates(new Degree(this.direction.oppositeDegree + (this.isRight ? -32 : 32)), 3.55 / 2);
  }
}
