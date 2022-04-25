import Point from "./Point.js";
import Runway from "./Runway.js";
import Coordinates from "../Types/Coordinates.js";
import Randomizer from "../Helper/Randomizer.js";
import Degree from "../Types/Degree.js";
import LocationsMap from "./LocationsMap.js";
import Waypoint from "./Waypoint.js";

export default class Airport extends Point {
  public hasFuelService: boolean;
  public hasTower: boolean;
  public frequency: number;
  public hasBeacon: boolean;
  public runways: Runway[] = [];
  public approachPoints: Waypoint[] = [];

  public static ILS_RANGE = 10;

  public constructor(public coordinates: Coordinates, protected randomizer: Randomizer) {
    super(coordinates, randomizer);

    this.frequency = this.randomizer.getInt(118, 136) + this.randomizer.getInt(0, 1) * 0.5;
    this.hasBeacon = false;
    this.hasTower = false;
    if (this.randomizer.isRandTrue()) {
      this.hasBeacon = true;
      this.hasTower = this.randomizer.isRandTrue(33);
    }
    this.hasFuelService = this.hasTower || !this.randomizer.isRandTrue(20);

  }

  public addRunway(heading: Degree) {
    this.runways.push(new Runway(this.coordinates, heading, this.randomizer));

    [heading.degree, heading.oppositeDegree].forEach((h, key) => {
      let approachPoints = new Waypoint(this.coordinates.getNewCoordinates(new Degree(h), LocationsMap.PADDING / 2), this.randomizer);
      approachPoints.code = this.code.slice(0, 3) + String(Math.round(h / 10)).padStart(2, '0');
      approachPoints.isSwitchLabelPosition = (key === 0)
        ? (h > 280 || h < 130)
        : (heading.oppositeDegree > 320 || heading.oppositeDegree < 40);
      this.approachPoints.push(approachPoints);

    })

    this.isSwitchLabelPosition = (heading.degree > 120 && heading.degree < 260);
  }
}
