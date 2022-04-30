import HoldingPattern from "./HoldingPattern.js";
import Coordinates from "../Types/Coordinates.js";
import Randomizer from "../Helper/Randomizer.js";
import Degree from "../Types/Degree.js";
import TwoWay from "../Types/TwoWay.js";

export default class Runway {
  public length: number;
  public width: number;
  public slopeIndicators: TwoWay;
  public approachLights: TwoWay;
  public ilsFrequencies: TwoWay;
  public trafficPatterns: HoldingPattern[] = [];

  public static ILS = 'ILS';

  public static PAPI = 'PAPI'; // P
  public static VASI = 'VASI'; // V

  // @see https://www.euroga.org/system/1/user_files/files/000/017/859/17859/1d13e220b/large/IMG_0075.PNG
  // @see https://www.flightlearnings.com/wp-content/uploads/2017/07/8-22a.jpg
  public static ALSF2 = 'ALSF-2'; // A
  public static ALSF1 = 'ALSF-1'; // A1
  public static MALSR = 'MALSR'; // A5
  public static ODALS = 'ODALS'; // +⦾

  public static TRAFFICPATTERN_WIDTH = 2;
  public static TRAFFICPATTERN_LENGTH = 6;

  public constructor(public coordinates: Coordinates, public heading: Degree, public randomizer: Randomizer) {
    this.length = this.randomizer.getInt(20, 60) * 100; // 4000 - 8000ft
    this.slopeIndicators = new TwoWay();
    this.approachLights = new TwoWay();
    this.ilsFrequencies = new TwoWay();

    //#widths = [60, 75, 100, 150, 200];
    if (this.length >= 6000) {
      this.width = this.randomizer.isRandTrue() ? 150 : 200;
    } else if (this.length >= 4000) {
      this.width = this.randomizer.isRandTrue() ? 100 : 150;
    } else if (this.length >= 2000) {
      this.width = this.randomizer.isRandTrue() ? 75 : 100;
    } else {
      this.width = this.randomizer.isRandTrue() ? 75 : 60;
    }

    this.rand();
    this.rand(1);
  }

  protected rand(index = 0): void {
    this.trafficPatterns[index] = new HoldingPattern(this.coordinates, this.randomizer);
    this.trafficPatterns[index].direction = new Degree(index === 0
      ? this.heading.degree
      : this.heading.oppositeDegree
    );
    this.trafficPatterns[index].isRight = this.randomizer.isRandTrue(20);

    if (index === 1 && this.trafficPatterns[0].isRight) {
      this.trafficPatterns[index].isRight = !this.trafficPatterns[0].isRight;
    }

    // ILS
    if (index === 0 || this.ilsFrequencies.first) {
      this.ilsFrequencies.set(
        index,
        this.randomizer.isRandTrue(index === 0 ? 33 : 20)
          ? this.randomizer.getInt(108, 111) + (this.randomizer.getInt(0, 4) * 0.2) + 0.1
          : null
      )
    }

    // Approach Lights
    if (index === 0 || this.approachLights.first) {
      if (this.ilsFrequencies.get(index)) {
        this.approachLights.set(index, this.randomizer.isRandTrue() ? Runway.ALSF2 : Runway.ALSF1);
      } else if (this.randomizer.isRandTrue()) {
        this.approachLights.set(index, this.randomizer.isRandTrue() ? Runway.MALSR : Runway.ODALS);
      }
    }

    // Slope Indicators
    if (index === 0 || this.slopeIndicators.first && (this.ilsFrequencies.get(index) || this.randomizer.isRandTrue())) {
      let slope = this.randomizer.isRandTrue() ? Runway.PAPI : Runway.VASI;
      if (index === 1) {
        slope = this.slopeIndicators.first
      }
      this.slopeIndicators.set(
        index,
        slope
      );
    }
  }
}
