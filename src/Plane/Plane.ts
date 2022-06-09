import Coordinates from "../Types/Coordinates.js";
import Degree from "../Types/Degree.js";
import NavRadio from "./NavRadio.js";
import Hsi from "./Hsi.js";
import FlightLog from "./FlightLog.js";

export default class Plane {
  protected _heading = new Degree(0);
  protected _coordinates: Coordinates;
  protected _throttle: number = 0;
  hsi: Hsi;
  navRadios: NavRadio[];
  flightLog: FlightLog;

  constructor(coordinates: Coordinates) {
    this._coordinates = coordinates;
    this.navRadios = [
      new NavRadio([]),
      new NavRadio([]),
    ]
    this.hsi = new Hsi(0, this.navRadios);
    this.flightLog = new FlightLog(coordinates);
  }

  set heading(heading: Degree) {
    this._heading = heading;
    this.hsi.heading = heading;
  }

  get heading() {
    return this._heading;
  }

  changeHeading(changeDegree: number) {
    this._heading.degree += changeDegree;
    this.hsi.heading.degree += changeDegree;
  }

  move(delta: number) {
    this.coordinates = this._coordinates.getNewCoordinates(this.heading, this.throttle * delta / 100000, this.coordinates.elevation);
  }

  set coordinates(coordinates: Coordinates) {
    this._coordinates = coordinates;
    this.navRadios.forEach((navRadio) => {
      navRadio.coordinates = coordinates;
    });
  }

  get coordinates() {
    return this._coordinates;
  }

  set throttle(throttle: number) {
    this._throttle = Math.max(0, Math.min(100, throttle));
  }

  get throttle() {
    return this._throttle;
  }
}
