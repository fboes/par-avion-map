import Degree from "../Types/Degree.js";
import NavRadio from "./NavRadio.js";
export default class Hsi {
    constructor(heading) {
        this.heading = new Degree(heading);
        this.navRadios = [
            new NavRadio(''),
            new NavRadio('')
        ];
    }
}
