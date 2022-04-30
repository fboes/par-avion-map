import Randomizer from "../Helper/Randomizer.js";
import Coordinates from "../Types/Coordinates.js";
import Navaid from "./Navaid.js";
import Airport from "./Airport.js";
import Obstruction from "./Obstruction.js";
import Degree from "../Types/Degree.js";

export default class LocationsMap
{
  public windDirection: Degree;
  public center: Coordinates;
  public airports: Airport[] = [];
  public navAids: Navaid[] = [];
  public obstructions: Obstruction[] = [];

  public static PADDING = 6;

  public constructor(public mapDimension: number, public randomizer: Randomizer)
  {
    this.mapDimension = Math.max(6  + LocationsMap.PADDING * 2, Math.ceil(mapDimension / 2) * 2);
    this.center = new Coordinates(this.mapDimension / 2, this.mapDimension / 2);
    this.windDirection = this.randomizer.getDegree();

    this.rand();
  }

  protected rand(deviation = 30)
  {
    const allowedRadius = (this.mapDimension - LocationsMap.PADDING * 2) / 2;
    const departureDegree = this.randomizer.getDegree();
    this.airports[0] = new Airport(
      this.getCoordinates(allowedRadius, departureDegree), this.randomizer
    );
    this.airports[0].addRunway(this.randomizer.getDegree(this.windDirection.degree, deviation));

    const destinationDegree = this.randomizer.getDegree(departureDegree.oppositeDegree, deviation * 2);
    this.airports[1] = new Airport(
      this.getCoordinates(allowedRadius, destinationDegree), this.randomizer
    );
    this.airports[1].addRunway(this.randomizer.getDegree(this.windDirection.degree, deviation));

    this.navAids[0] = new Navaid(
      this.getCoordinates(
        this.randomizer.getInt(0, allowedRadius),
        this.randomizer.getDegree(departureDegree.degree + 90, 70)
      ),
      this.randomizer
    );

    if (this.randomizer.isRandTrue()) {
      this.obstructions.push(new Obstruction(
        this.getCoordinates(
          this.randomizer.getInt(0, allowedRadius + LocationsMap.PADDING / 2),
          this.randomizer.getDegree(departureDegree.degree + 90, 70)
        ),
        this.randomizer
      ));
    }

    if (this.mapDimension >= (10 + 2 * LocationsMap.PADDING)) {
      this.navAids[0].randHoldingPattern(
        this.navAids[0].coordinates.getBearing(this.airports[1].approachPoints[0].coordinates)
      );
    }
    if (this.mapDimension >= (15 + 2 * LocationsMap.PADDING)) {
      this.navAids[1] = new Navaid(
        this.getCoordinates(
          this.randomizer.getInt(5, allowedRadius + LocationsMap.PADDING / 2),
          this.randomizer.getDegree(destinationDegree.degree + 90, 70)
        ),
        this.randomizer
      );
      if (this.randomizer.isRandTrue()) {
        this.obstructions.push(new Obstruction(
          this.getCoordinates(
            this.randomizer.getInt(0, allowedRadius + LocationsMap.PADDING / 2),
            this.randomizer.getDegree(departureDegree.degree + 90, 70)
          ),
          this.randomizer
        ));
      }
    }
    if (this.mapDimension >= (20 + 2 * LocationsMap.PADDING)) {
      this.navAids[1].randHoldingPattern(
        this.navAids[1].coordinates.getBearing(this.airports[0].approachPoints[0].coordinates)
      );
      const destinationDegree2 = this.randomizer.getDegreeBetween(departureDegree, destinationDegree);
      this.airports[2] = new Airport(
        this.getCoordinates(allowedRadius - 5, destinationDegree2),
        this.randomizer
      );
      this.airports[2].addRunway(this.randomizer.getDegree(this.windDirection.degree, deviation));
    }

    if (this.mapDimension >= (25 + 2 * LocationsMap.PADDING)) {
      this.navAids[2] = new Navaid(
        this.getCoordinates(
          this.randomizer.getInt(5, allowedRadius + LocationsMap.PADDING / 2),
          this.randomizer.getDegree(destinationDegree.degree + 90, 70)
        ),
        this.randomizer
      );
    }
  }

  /**
   * ...including elevation
   */
  public getHighestObstruction(x1: number, y1: number, sliceX: number, sliceY: number)
  {
    let max = 0;

    this.obstructions.forEach((obstruction) => {
      if (
        obstruction.coordinates
        && obstruction.coordinates.elevation !== null
        && obstruction.coordinates.x >= x1
        && obstruction.coordinates.x <= x1 + sliceX
        && obstruction.coordinates.y >= y1
        && obstruction.coordinates.y <= y1 + sliceY
      ) {
        let totalHeight = obstruction.coordinates.elevation + obstruction.heightAboveGround;
        max = Math.max(max, totalHeight);
      }
    });

    return max;
  }

  protected getCoordinates(distanceFromCenter: number, degreeFromCenter: Degree)
  {
    const rad = Coordinates.deg2rad(degreeFromCenter);

    return new Coordinates(
      (-Math.cos(rad) * distanceFromCenter) + (this.mapDimension / 2),
      (Math.sin(rad) * distanceFromCenter) + (this.mapDimension / 2)
    );
  }
};
