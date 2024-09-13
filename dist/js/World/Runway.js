import HoldingPattern from "./HoldingPattern.js";
import Degree from "../Types/Degree.js";
import TwoWay from "../Types/TwoWay.js";
import NavaidIls from "./NavaidIls.js";
export default class Runway {
    constructor(coordinates, heading, randomizer) {
        this.coordinates = coordinates;
        this.heading = heading;
        this.randomizer = randomizer;
        this.trafficPatterns = [];
        this.length = this.randomizer.getInt(20, 60) * 100; // 4000 - 8000ft
        this.slopeIndicators = new TwoWay();
        this.approachLights = new TwoWay();
        this.ils = new TwoWay();
        //#widths = [60, 75, 100, 150, 200];
        if (this.length >= 6000) {
            this.width = this.randomizer.isRandTrue() ? 150 : 200;
        }
        else if (this.length >= 4000) {
            this.width = this.randomizer.isRandTrue() ? 100 : 150;
        }
        else if (this.length >= 2000) {
            this.width = this.randomizer.isRandTrue() ? 75 : 100;
        }
        else {
            this.width = this.randomizer.isRandTrue() ? 75 : 60;
        }
        this.rand();
        this.rand(1);
    }
    rand(index = 0) {
        this.trafficPatterns[index] = new HoldingPattern(this.coordinates, this.randomizer);
        this.trafficPatterns[index].direction = new Degree(index === 0 ? this.heading.degree : this.heading.oppositeDegree);
        this.trafficPatterns[index].isRight = this.randomizer.isRandTrue(20);
        if (index === 1 && this.trafficPatterns[0].isRight) {
            this.trafficPatterns[index].isRight = !this.trafficPatterns[0].isRight;
        }
        // ILS
        if (index === 0 || this.ils.first) {
            if (this.randomizer.isRandTrue(index === 0 ? 33 : 20)) {
                const ils = new NavaidIls(this.coordinates.getNewCoordinates(this.trafficPatterns[index].direction, this.length / 2 / 6076), this.randomizer, NavaidIls.ILS);
                ils.code += this.trafficPatterns[index].direction.degree.toFixed();
                ils.direction = this.trafficPatterns[index].direction;
                this.ils.set(index, ils);
            }
            else {
                this.ils.set(index, null);
            }
        }
        // Approach Lights
        if (index === 0 || this.approachLights.first) {
            if (this.ils.get(index)) {
                this.approachLights.set(index, this.randomizer.fromArray(this.length > 4000
                    ? [Runway.ALSF1, Runway.ALSF2, Runway.MALSR]
                    : [Runway.MALSR, Runway.MALS]));
            }
            else if (this.randomizer.isRandTrue()) {
                this.approachLights.set(index, this.randomizer.fromArray(this.length > 4000
                    ? [Runway.ALSF1, Runway.SSALR, Runway.MALSR]
                    : [Runway.SALS, Runway.MALS, Runway.ODALS]));
            }
        }
        // Slope Indicators
        if (index === 0 ||
            (this.slopeIndicators.first &&
                (this.ils.get(index) || this.randomizer.isRandTrue()))) {
            let slope = this.randomizer.isRandTrue() ? Runway.PAPI : Runway.VASI;
            if (index === 1) {
                slope = this.slopeIndicators.first;
            }
            this.slopeIndicators.set(index, slope);
        }
    }
    get rightPatternDirections() {
        return this.trafficPatterns
            .filter((tp) => {
            return tp.isRight;
        })
            .map((tp) => {
            return tp.direction;
        });
    }
}
Runway.ILS = "ILS";
Runway.PAPI = "PAPI"; // P
Runway.VASI = "VASI"; // V
// @see https://www.euroga.org/system/1/user_files/files/000/017/859/17859/1d13e220b/large/IMG_0075.PNG
// @see https://www.flightlearnings.com/wp-content/uploads/2017/07/8-22a.jpg
Runway.ALSF2 = "ALSF-2"; // A
Runway.ALSF1 = "ALSF-1"; // A1
Runway.SALS = "SALS"; // A2
Runway.SSALR = "SSALR"; // A3
Runway.MALS = "MALS"; // A4
Runway.MALSR = "MALSR"; // A5
Runway.ODALS = "ODALS"; // +⦾
Runway.TRAFFICPATTERN_WIDTH = 1;
Runway.TRAFFICPATTERN_LENGTH = 3;
