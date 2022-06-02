import Navaid from "./Navaid.js";
import Degree from "../Types/Degree.js";
export default class NavaidIls extends Navaid {
    constructor(coordinates, randomizer, type = '') {
        super(coordinates, randomizer, 'ILS');
        this.coordinates = coordinates;
        this.randomizer = randomizer;
        this.direction = new Degree(0);
        this.verticalDirection = new Degree(3);
    }
}
