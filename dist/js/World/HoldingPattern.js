import Point from "./Point.js";
export default class HoldingPattern extends Point {
    constructor(coordinates, randomizer) {
        super(coordinates, randomizer);
        this.coordinates = coordinates;
        this.randomizer = randomizer;
        this.isRight = !this.randomizer.isRandTrue(20);
        this.direction = this.randomizer.getDegree();
    }
}
HoldingPattern.LENGTH = 4.9; // @180 kts & 1min / leg
HoldingPattern.WIDTH = 1.9; // @180kts & 1min / leg
