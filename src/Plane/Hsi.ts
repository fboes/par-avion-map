import Degree from "../Types/Degree.js";
import NavRadio from "./NavRadio.js";

export default class Hsi {
  heading: Degree;
  headingSelect: Degree | undefined;

  constructor(heading: 0, public navRadios: NavRadio[]) {
    this.heading = new Degree(heading);
    this.headingSelect = new Degree(heading);
  }
}
