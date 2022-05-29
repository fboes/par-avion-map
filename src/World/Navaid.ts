import Point from "./Point.js";
import HoldingPattern from "./HoldingPattern.js";
import Coordinates from "../Types/Coordinates.js";
import Randomizer from "../Helper/Randomizer.js";
import Degree from "../Types/Degree.js";

export default class Navaid extends Point {
  public static VOR = 'VOR';
  public static NDB = 'NDB';

  public hasDme = false;
  public holdingPattern: HoldingPattern | null;
  public frequency: number;

  public constructor(public coordinates: Coordinates, protected randomizer: Randomizer) {
    super(coordinates, randomizer);

    this._code = this.code.slice(0, 3);
    this._type = this.randomizer.isRandTrue() ? Navaid.VOR : Navaid.NDB;
    this.hasDme = this.randomizer.isRandTrue();
    this.holdingPattern = null;

    this.frequency = (this.type == Navaid.VOR)
      ? this.randomizer.getInt(108, 117)
      : this.randomizer.getInt(190, 535);

    if (this.type == Navaid.VOR) {
      // Reserve frequencies for ILS
      this.frequency += ((this.frequency < 112)
        ? this.randomizer.getInt(0, 4) * 0.2
        : this.randomizer.getInt(0, 9) * 0.1
      );
    }
  }

  public randHoldingPattern(degree: number | null = null) {
    if (!this.randomizer) {
      throw new Error("No Randomizer present");
    }

    if (this.randomizer.isRandTrue()) {
      this.holdingPattern = new HoldingPattern(this.coordinates, this.randomizer);
      if (degree) {
        this.holdingPattern.direction = new Degree(degree);
      }
    }

    this.isSwitchLabelPosition = (this.holdingPattern !== null
      && this.holdingPattern.direction !== null
      && (
        (this.holdingPattern.isRight && (this.holdingPattern.direction.degree < 100 || this.holdingPattern.direction.degree > 300))
        || (!this.holdingPattern.isRight && (this.holdingPattern.direction.degree < 60 || this.holdingPattern.direction.degree > 260))
      )
    );
  }
}
