import Coordinates from "./Coordinates.js";
import Navaid from "./Navaid.js";
export default class Map {
    constructor(mapDimension, randomizer) {
        this.mapDimension = mapDimension;
        this.randomizer = randomizer;
        this.windDirection = 0;
        this.airports = [];
        this.navAids = [];
        this.obstructions = [];
        //this.mapDimension = (rand(5, maxDimension / 2) + Map.PADDING) * 2;
        this.center = new Coordinates(this.mapDimension / 2, this.mapDimension / 2);
        randomizer && this.rand();
    }
    rand(deviation = 30) {
        this.windDirection = this.randomizer.getDegree();
        const allowedRadius = (this.mapDimension - Map.PADDING * 2) / 2;
        const departureDegree = this.randomizer.getDegree();
        /*this.airports[0] = new Airport(
          this.getCoordinates(allowedRadius, departureDegree)
        );
        this.airports[0].addRunway(this.randomizer.getDegree(this.windDirection, deviation));*/
        const destinationDegree = this.randomizer.getDegree(departureDegree - 180, deviation * 2);
        /*this.airports[1] = new Airport(
          this.getCoordinates(allowedRadius, destinationDegree)
        );
        this.airports[1].addRunway(this.randomizer.getDegree(this.windDirection, deviation));*/
        this.navAids[0] = new Navaid(this.getCoordinates(this.randomizer.getInt(0, allowedRadius), this.randomizer.getDegree(departureDegree + 90, 70)));
        /*if (this.randomizer.isRandTrue()) {
          this.obstructions[] = new Obstruction(
            this.getCoordinates(
              this.randomizer.getInt(0, allowedRadius + Map.PADDING / 2),
              this.randomizer.getDegree(departureDegree + 90, 70)
            )
          );
        }
    
        if (this.mapDimension > (10 + 2 * Map.PADDING)) {
          this.navAids[0].randHoldingPattern(
            this.navAids[0].coordinates.getBearing(this.airports[1].approachPoints[0].coordinates)
          );
        }
        if (this.mapDimension > (15 + 2 * Map.PADDING)) {
          this.navAids[1] = new Navaid(
            this.getCoordinates(
              this.randomizer.getInt(5, allowedRadius + Map.PADDING / 2),
              this.randomizer.getDegree(destinationDegree + 90, 70)
            )
          );
          if (this.randomizer.isRandTrue()) {
            this.obstructions[] = new Obstruction(
              this.getCoordinates(
                this.randomizer.getInt(0, allowedRadius + Map.PADDING / 2),
                this.randomizer.getDegree(departureDegree + 90, 70)
              )
            );
          }
        }
        if (this.mapDimension > (20 + 2 * Map.PADDING)) {
          this.navAids[1].randHoldingPattern(
            this.navAids[1].coordinates.getBearing(this.airports[0].approachPoints[0].coordinates)
          );
          destinationDegree2 = this.randomizer.getDegreeBetween(departureDegree, destinationDegree);
          this.airports[2] = new Airport(
            this.getCoordinates(allowedRadius - 5, destinationDegree2)
          );
          this.airports[2].addRunway(this.randomizer.getDegree(this.windDirection, deviation));
        }*/
    }
    /**
     * ...including elevation
     */
    getHighestObstruction(x1, y1, sliceX, sliceY) {
        let max = 0;
        this.obstructions.forEach((obstruction) => {
            /*if (
              obstruction.coordinates.x >= x1
              && obstruction.coordinates.x <= x1 + sliceX
              && obstruction.coordinates.y >= y1
              && obstruction.coordinates.y <= y1 + sliceY
            ) {
              totalHeight = obstruction.coordinates.elevation + obstruction.heightAboveGround;
              max = max(max, totalHeight);
            }*/
        });
        return max;
    }
    getCoordinates(distanceFromCenter, degreeFromCenter) {
        const rad = Coordinates.deg2rad(degreeFromCenter);
        return new Coordinates((-Math.cos(rad) * distanceFromCenter) + (this.mapDimension / 2), (Math.sin(rad) * distanceFromCenter) + (this.mapDimension / 2));
    }
}
Map.PADDING = 6;
;
//# sourceMappingURL=Map.js.map