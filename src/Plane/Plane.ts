import Coordinates from "../Types/Coordinates.js";
import Degree from "../Types/Degree.js";
import NavRadio from "./NavRadio.js";
import Hsi from "./Hsi.js";

export default class Plane {
  protected _heading = new Degree(0);
  protected _coordinates: Coordinates;
  hsi: Hsi;
  navRadios: NavRadio[];

  constructor(coordinates: Coordinates) {
    this._coordinates = coordinates;
    this.navRadios = [
      new NavRadio([]),
      new NavRadio([]),
    ]
    this.hsi = new Hsi(0, this.navRadios);
  }

  set heading(heading: Degree) {
    this._heading = heading;
    this.hsi.heading = heading;
  }

  changeHeading(changeDegree: number) {
    this._heading.degree += changeDegree;
    this.hsi.heading.degree += changeDegree;
  }

  set coordinates(coordinates: Coordinates) {
    this._coordinates = coordinates;
    this.navRadios.forEach((navRadio) => {
      navRadio.coordinates = coordinates;
    });
  }
}
