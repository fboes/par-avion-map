import Degree from "../Types/Degree.js";
import NavRadio from "./NavRadio.js";
import Hsi from "./Hsi.js";
export default class Plane {
    constructor(coordinates) {
        this._heading = new Degree(0);
        this._coordinates = coordinates;
        this.navRadios = [
            new NavRadio([]),
            new NavRadio([]),
        ];
        this.hsi = new Hsi(0, this.navRadios);
    }
    set heading(heading) {
        this._heading = heading;
        this.hsi.heading = heading;
    }
    changeHeading(changeDegree) {
        this._heading.degree += changeDegree;
        this.hsi.heading.degree += changeDegree;
    }
    set coordinates(coordinates) {
        this._coordinates = coordinates;
        this.navRadios.forEach((navRadio) => {
            navRadio.coordinates = coordinates;
        });
    }
    get coordinates() {
        return this._coordinates;
    }
}
