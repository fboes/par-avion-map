import Degree from "../Types/Degree.js";
export default class Hsi {
    constructor(heading, navRadios) {
        this.navRadios = navRadios;
        this.elements = [
            Hsi.INTERACTIVE_HEADING,
            Hsi.INTERACTIVE_NAV1_SOURCE,
            Hsi.INTERACTIVE_NAV1_COURSE,
            Hsi.INTERACTIVE_NAV2_SOURCE,
            Hsi.INTERACTIVE_NAV2_COURSE,
        ];
        this._activeElement = 0;
        this.heading = new Degree(heading);
        this.headingSelect = new Degree(heading);
    }
    activateNextElement(step = +1) {
        this._activeElement =
            (this._activeElement + step + this.elements.length) %
                this.elements.length;
        if ((this._activeElement === Hsi.INTERACTIVE_NAV1_COURSE &&
            this.navRadios[0].course === undefined) ||
            (this._activeElement === Hsi.INTERACTIVE_NAV2_COURSE &&
                this.navRadios[1].course === undefined)) {
            this._activeElement =
                (this._activeElement + step + this.elements.length) %
                    this.elements.length;
        }
        return this.activeElement;
    }
    get activeElement() {
        return this.elements[this._activeElement];
    }
}
Hsi.INTERACTIVE_HEADING = 0;
Hsi.INTERACTIVE_NAV1_SOURCE = 1;
Hsi.INTERACTIVE_NAV1_COURSE = 2;
Hsi.INTERACTIVE_NAV2_SOURCE = 3;
Hsi.INTERACTIVE_NAV2_COURSE = 4;
