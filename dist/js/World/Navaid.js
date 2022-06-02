import Point from "./Point.js";
import HoldingPattern from "./HoldingPattern.js";
import Degree from "../Types/Degree.js";
export default class Navaid extends Point {
    constructor(coordinates, randomizer, type = '') {
        super(coordinates, randomizer);
        this.coordinates = coordinates;
        this.randomizer = randomizer;
        this.hasDme = false;
        this._code = this.code.slice(0, 3);
        this._type = type ? type : (this.randomizer.isRandTrue() ? Navaid.VOR : Navaid.NDB);
        this.hasDme = this.randomizer.isRandTrue();
        this.holdingPattern = null;
        this.range = 200;
        switch (this.type) {
            case Navaid.VOR:
                this.frequency = this.randomizer.getInt(108, 117);
                // Reserve frequencies for ILS
                this.frequency += ((this.frequency < 112)
                    ? this.randomizer.getInt(0, 4) * 0.2
                    : this.randomizer.getInt(0, 9) * 0.1);
                break;
            case Navaid.ILS:
                this.frequency = this.randomizer.getInt(108, 111) + (this.randomizer.getInt(0, 4) * 0.2) + 0.1;
                this.range = 50;
                break;
            default:
                this.frequency = this.randomizer.getInt(190, 535);
                break;
        }
    }
    randHoldingPattern(degree = null) {
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
            && ((this.holdingPattern.isRight && (this.holdingPattern.direction.degree < 100 || this.holdingPattern.direction.degree > 300))
                || (!this.holdingPattern.isRight && (this.holdingPattern.direction.degree < 60 || this.holdingPattern.direction.degree > 260))));
    }
}
Navaid.VOR = 'VOR';
Navaid.NDB = 'NDB';
Navaid.ILS = 'ILS';
