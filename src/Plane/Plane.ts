import Coordinates from "../Types/Coordinates.js";
import Degree from "../Types/Degree.js";
import NavRadio from "./NavRadio.js";
import Hsi from "./Hsi.js";
import FlightLog from "./FlightLog.js";
import { CurrentWeather } from "../World/Weather.js";
import App from "../App.js";

export default class Plane {
  protected _heading = new Degree(0);
  protected _coordinates: Coordinates;
  protected _throttle: number = 0;
  protected _speedKts: number = 0;
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

  move(delta: number, currentWeather: CurrentWeather) {
    this._speedKts = this._throttle * 2;
    let speedVector = this._speedKts;
    let headingVector = this.heading;

    if (currentWeather.windSpeedKts > 0) {
      const radCourse = this.heading.rad;
      const deltaRad = currentWeather.windDirection.rad - radCourse;
      const correctionRad = (deltaRad === 0 || deltaRad === Math.PI || this._speedKts >= 0)
        ? 0
        : Math.asin(currentWeather.windSpeedKts * Math.sin(deltaRad) / this._speedKts)
        ;
      if (deltaRad === 0) {
        speedVector = this._speedKts + currentWeather.windSpeedKts;
      } else if (deltaRad === Math.PI) {
        speedVector = this._speedKts - currentWeather.windSpeedKts;
      } else {
        speedVector = Math.round(Math.sin(deltaRad + correctionRad) * this._speedKts / Math.sin(deltaRad));
      }

      const correctionDeg = correctionRad / (Math.PI / 180);
      headingVector = new Degree(this.heading.degree + correctionDeg);
    }

    this.coordinates = this._coordinates.getNewCoordinates(headingVector, speedVector * delta / 3600000 * App.TIME_COMPRESSION, this.coordinates.elevation);
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
