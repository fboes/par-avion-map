import Degree from "../Types/Degree.js";
import NavRadio from "./NavRadio.js";

export default class Hsi {
  heading: Degree;
  headingSelect: Degree | undefined;
  protected elements = [
    Hsi.INTERACTIVE_HEADING,
    Hsi.INTERACTIVE_NAV1_SOURCE,
    Hsi.INTERACTIVE_NAV1_COURSE,
    Hsi.INTERACTIVE_NAV2_SOURCE,
    Hsi.INTERACTIVE_NAV2_COURSE,
  ];
  protected _activeElement = 0;

  static INTERACTIVE_HEADING = 0;
  static INTERACTIVE_NAV1_SOURCE = 1;
  static INTERACTIVE_NAV1_COURSE = 2;
  static INTERACTIVE_NAV2_SOURCE = 3;
  static INTERACTIVE_NAV2_COURSE = 4;

  constructor(
    heading: 0,
    public navRadios: NavRadio[],
  ) {
    this.heading = new Degree(heading);
    this.headingSelect = new Degree(heading);
  }

  activateNextElement(step = +1) {
    this._activeElement =
      (this._activeElement + step + this.elements.length) %
      this.elements.length;
    if (
      (this._activeElement === Hsi.INTERACTIVE_NAV1_COURSE &&
        this.navRadios[0].course === undefined) ||
      (this._activeElement === Hsi.INTERACTIVE_NAV2_COURSE &&
        this.navRadios[1].course === undefined)
    ) {
      this._activeElement =
        (this._activeElement + step + this.elements.length) %
        this.elements.length;
    }
    return this.activeElement;
  }

  get activeElement(): number {
    return this.elements[this._activeElement];
  }
}
