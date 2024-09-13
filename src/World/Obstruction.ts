import Point from "./Point.js";
import Coordinates from "../Types/Coordinates.js";
import Randomizer from "../Helper/Randomizer.js";

export default class Obstruction extends Point {
  public heightAboveGround: number;
  public hasHighIntensityLight: boolean;

  public constructor(
    public coordinates: Coordinates,
    protected randomizer: Randomizer,
  ) {
    super(coordinates, randomizer);

    this.heightAboveGround = this.randomizer.fromArray([
      200, 250, 300, 400, 500, 700, 1000,
    ]);
    this.hasHighIntensityLight = this.randomizer.isRandTrue(
      this.heightAboveGround > 700 ? 75 : 25,
    );
    this._type =
      (this.heightAboveGround === 400 || this.heightAboveGround === 500) &&
      this.randomizer.isRandTrue()
        ? "Wind Turbine"
        : "Antenna";
  }
}
