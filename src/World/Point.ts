import Randomizer from "../Helper/Randomizer.js";
import Coordinates from "../Types/Coordinates.js";

export default class Point {
  protected _type: string;
  protected _name: string;
  protected _code: string;
  public isSwitchLabelPosition: boolean;

  public constructor(
    public coordinates: Coordinates,
    protected randomizer: Randomizer,
  ) {
    this._type = this.constructor.name;
    this._name = "";
    this._code = "";
    this.isSwitchLabelPosition = false;
    this.name = randomizer ? this.randWords(0) + " " + this.randWords(1) : "";
  }

  public set name(name: string) {
    this._name = name;
    this._code = name.toUpperCase().replace(/^(\w\w).+?\W(\w\w).*$/g, "$1$2");
  }

  public get type(): string {
    return this._type;
  }

  public get name(): string {
    return this._name;
  }

  public set code(code: string) {
    this._code = code;
  }

  public get code(): string {
    return this._code;
  }

  protected randWords(index = 0): string {
    const words = [
      [
        "Belle",
        "Big",
        "Black",
        "Blue",
        "Broken",
        "Clear",
        "Cold",
        "Deep",
        "Dusty",
        "East",
        "Far",
        "Foggy",
        "Free",
        "Good",
        "Grand",
        "Great",
        "Greater",
        "Green",
        "Grey",
        "Higher",
        "Inner",
        "Little",
        "Lonely",
        "Lost",
        "Lower",
        "Middle",
        "Misty",
        "New",
        "North",
        "Northeast",
        "Northwest",
        "Old",
        "Outer",
        "Plain",
        "Red",
        "Shady",
        "Small",
        "South",
        "Southeast",
        "Southwest",
        "Still",
        "Stormy",
        "Sunny",
        "Tiny",
        "Upper",
        "West",
        "White",
        "Windy",
      ],
      [
        "Acre",
        "Acres",
        "Bastion",
        "Bend",
        "Borough",
        "Bridge",
        "Brook",
        "Castle",
        "Chapel",
        "Church",
        "City",
        "Clearing",
        "Corner",
        "Corners",
        "County",
        "Court",
        "Cove",
        "Creek",
        "Crossing",
        "Dale",
        "Dam",
        "Falls",
        "Farm",
        "Farms",
        "Ferry",
        "Field",
        "Fields",
        "Flats",
        "Ford",
        "Forest",
        "Fort",
        "Frontier",
        "Gate",
        "Garden",
        "Glen",
        "Harbour",
        "Haven",
        "Head",
        "House",
        "Houses",
        "Junction",
        "Lake",
        "Land",
        "Lights",
        "Lodge",
        "Meadow",
        "Mills",
        "Outpost",
        "Park",
        "Plains",
        "Point",
        "Pond",
        "Port",
        "Ranch",
        "Ranches",
        "Range",
        "Reservoir",
        "Resort",
        "Ridge",
        "River",
        "Road",
        "Roads",
        "Rock",
        "Sea",
        "Sister",
        "Sisters",
        "State",
        "Station",
        "Stone",
        "Square",
        "Tower",
        "Towers",
        "Town",
        "Tree",
        "Trees",
        "Vale",
        "Valley",
        "Ville",
        "Water",
        "Way",
        "Wood",
        "Woods",
        "Yard",
      ],
    ];

    return this.randomizer.fromArray(words[index]);
  }
}
