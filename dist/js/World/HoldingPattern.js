import Point from "./Point.js";
import Degree from "../Types/Degree.js";
export default class HoldingPattern extends Point {
    constructor(coordinates, randomizer) {
        super(coordinates, randomizer);
        this.coordinates = coordinates;
        this.randomizer = randomizer;
        this.isRight = !this.randomizer.isRandTrue(20);
        this.direction = this.randomizer.getDegree();
    }
    getCenterCoordinates() {
        return this.coordinates.getNewCoordinates(new Degree(this.direction.oppositeDegree + (this.isRight ? -32 : 32)), 3.55 / 2);
    }
}
HoldingPattern.LENGTH = 4.9; // @180 kts & 1min / leg
HoldingPattern.WIDTH = 1.9; // @180kts & 1min / leg
