import Point from "./Point.js";
import Coordinates from "../Types/Coordinates.js";
import Randomizer from "../Helper/Randomizer.js";
import Degree from "../Types/Degree.js";

export default class HoldingPattern extends Point {
  public isRight: boolean;
  public direction: Degree;

  public static LENGTH = 6;
  public static WIDTH = 3;

  public constructor(public coordinates: Coordinates, protected randomizer: Randomizer) {
    super(coordinates, randomizer);

    this.isRight = !this.randomizer.isRandTrue(20);
    this.direction = this.randomizer.getDegree();
  }
}
