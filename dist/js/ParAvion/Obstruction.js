import Point from './Point.js';
export default class Obstruction extends Point {
    constructor(coordinates, randomizer) {
        super(coordinates, randomizer);
        this.coordinates = coordinates;
        this.randomizer = randomizer;
        this.heightAboveGround = this.randomizer.fromArray([200, 250, 300, 400, 500, 700, 1000]);
        this.hasHighIntensityLight = this.randomizer.isRandTrue(this.heightAboveGround > 700 ? 75 : 25);
        this._type = ((this.heightAboveGround === 400 || this.heightAboveGround === 500) && this.randomizer.isRandTrue())
            ? 'Wind Turbine'
            : 'Antenna';
    }
}
//# sourceMappingURL=Obstruction.js.map