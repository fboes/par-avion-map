import HoldingPattern from "./HoldingPattern.js";
import Degree from "../Types/Degree.js";
import TwoWay from "../Types/TwoWay.js";
export default class Runway {
    constructor(coordinates, heading, randomizer) {
        this.coordinates = coordinates;
        this.heading = heading;
        this.randomizer = randomizer;
        this.trafficPatterns = [];
        this.length = this.randomizer.getInt(20, 60) * 100; // 4000 - 8000ft
        this.slopeIndicators = new TwoWay();
        this.approachLights = new TwoWay();
        this.ilsFrequencies = new TwoWay();
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
        this.trafficPatterns[index].direction = new Degree(index === 0
            ? this.heading.degree
            : this.heading.oppositeDegree);
        this.trafficPatterns[index].isRight = this.randomizer.isRandTrue(20);
        if (index === 1 && this.trafficPatterns[0].isRight) {
            this.trafficPatterns[index].isRight = !this.trafficPatterns[0].isRight;
        }
        // ILS
        if (index === 0 || this.ilsFrequencies.first) {
            this.ilsFrequencies.set(index, this.randomizer.isRandTrue(index === 0 ? 33 : 20)
                ? this.randomizer.getInt(108, 111) + (this.randomizer.getInt(0, 4) * 0.2) + 0.1
                : null);
        }
        // Approach Lights
        if (index === 0 || this.approachLights.first) {
            if (this.ilsFrequencies.get(index)) {
                this.approachLights.set(index, this.randomizer.isRandTrue() ? Runway.ALSF2 : Runway.ALSF1);
            }
            else if (this.randomizer.isRandTrue()) {
                this.approachLights.set(index, this.randomizer.isRandTrue() ? Runway.MALSR : Runway.ODALS);
            }
        }
        // Slope Indicators
        if (index === 0 || this.slopeIndicators.first && (this.ilsFrequencies.get(index) || this.randomizer.isRandTrue())) {
            let slope = this.randomizer.isRandTrue() ? Runway.PAPI : Runway.VASI;
            if (index === 1) {
                slope = this.slopeIndicators.first;
            }
            this.slopeIndicators.set(index, slope);
        }
    }
    getFeatures() {
        let features = {};
        /*[this.approachLights, this.slopeIndicators].forEach((feature) => {
          feature.forEach((value, key) => {
            if (value) {
              features[key].push(value);
            }
          });
        });*/
        /*
        this.ilsFrequencies.forEach() as key => value) {
           if (!empty(value)) {
             features[key][] = this.ILS;
           }
         }*/
        return features;
    }
}
Runway.ILS = 'ILS';
Runway.PAPI = 'PAPI';
Runway.VASI = 'VASI';
// @see https://www.euroga.org/system/1/user_files/files/000/017/859/17859/1d13e220b/large/IMG_0075.PNG
Runway.ALSF2 = 'ALSF-2';
Runway.ALSF1 = 'ALSF-1';
Runway.MALSR = 'MALSR';
Runway.ODALS = 'ODALS';
Runway.TRAFFICPATTERN_WIDTH = 2;
Runway.TRAFFICPATTERN_LENGTH = 6;
//# sourceMappingURL=Runway.js.map