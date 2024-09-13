import Point from "./Point.js";
import Runway from "./Runway.js";
import Degree from "../Types/Degree.js";
import Waypoint from "./Waypoint.js";
export default class Airport extends Point {
    constructor(coordinates, randomizer) {
        super(coordinates, randomizer);
        this.coordinates = coordinates;
        this.randomizer = randomizer;
        this.runways = [];
        this.approachPoints = [];
        this.frequency =
            this.randomizer.getInt(118, 136) + this.randomizer.getInt(0, 1) * 0.5;
        this.hasBeacon = false;
        this.hasTower = false;
        if (this.randomizer.isRandTrue()) {
            this.hasBeacon = true;
            this.hasTower = this.randomizer.isRandTrue(33);
        }
        this.hasFuelService = this.hasTower || !this.randomizer.isRandTrue(20);
    }
    addRunway(heading) {
        this.runways.push(new Runway(this.coordinates, heading, this.randomizer));
        [heading.degree, heading.oppositeDegree].forEach((h, key) => {
            const deg = new Degree(h);
            let approachPoints = new Waypoint(this.coordinates.getNewCoordinates(deg, 4), this.randomizer);
            approachPoints.code =
                this.code.slice(0, 3) +
                    Math.round(deg.oppositeDegree / 10)
                        .toFixed()
                        .padStart(2, "0");
            approachPoints.isSwitchLabelPosition =
                key === 0
                    ? h > 280 || h < 130
                    : heading.oppositeDegree > 320 || heading.oppositeDegree < 40;
            this.approachPoints.push(approachPoints);
        });
        this.isSwitchLabelPosition = heading.degree > 120 && heading.degree < 260;
    }
    get rightPatternRunways() {
        let runways = [];
        this.runways.forEach((r) => {
            r.rightPatternDirections.forEach((d) => {
                runways.push(d);
            });
        });
        return runways;
    }
}
Airport.ILS_RANGE = 10;
