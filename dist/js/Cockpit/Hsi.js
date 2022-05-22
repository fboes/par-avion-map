import Degree from "../Types/Degree.js";
import NavRadio from "./NavRadio.js";
export default class Hsi {
    constructor(heading) {
        this.heading = new Degree(heading);
        this.headingSelect = new Degree(heading);
        this.navRadios = [
            new NavRadio('', 'NAV1'),
            new NavRadio('', 'NAV2')
        ];
    }
}
