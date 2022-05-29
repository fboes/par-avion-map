import Degree from "../Types/Degree.js";
export default class Hsi {
    constructor(heading, navRadios) {
        this.navRadios = navRadios;
        this.heading = new Degree(heading);
        this.headingSelect = new Degree(heading);
    }
}
