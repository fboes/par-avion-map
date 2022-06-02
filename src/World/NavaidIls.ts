import Navaid from "Navaid.js";
import Randomizer from "../Helper/Randomizer.js";
import Coordinates from "../Types/Coordinates.js";
import Degree from "../Types/Degree.js";

export default class NavaidIls extends Navaid {
  public direction: Degree;
  public verticalDirection: Degree;

  public constructor(public coordinates: Coordinates, protected randomizer: Randomizer, type: string = '') {
    super(coordinates, randomizer, 'ILS');
    this.direction = new Degree(0);
    this.verticalDirection = new Degree(3);
  }
}
