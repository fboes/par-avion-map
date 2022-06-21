import Coordinates from "../Types/Coordinates.js";
import Degree from "../Types/Degree.js";
import NavRadio from "./NavRadio.js";
import Hsi from "./Hsi.js";
import FlightLog from "./FlightLog.js";
import { CurrentWeather } from "../World/Weather.js";
import App from "../App.js";
import LogCoordinates from "../Types/LogCoordinates.js";

type Vector = {
  groundSpeed: number,
  altitudeChange: number,
  heading: Degree,
};

export default class Plane {
  protected _heading = new Degree(0);
  protected _coordinates: Coordinates;
  /**
   * In percent, 0..100
   */
  protected _throttle: number = 0;
  protected _speedKts: number = 0;
  protected _altAglFt: number = 0;
  protected _fuel: number = 100
  hsi: Hsi;
  navRadios: NavRadio[];
  flightLog: FlightLog;
  /**
   * Some major part of the plane is broken, so the plane is not able to fly anymore
   */
  isBroken = false;
  /**
   * Motor has been started and plane has not yet landed and stopped again
   */
  isActive = false;
  /**
   * Elevator positon in Degrees
   */
  elevator = 0;
  /**
   * Ailerons positon in Degrees
   */
  ailerons = 0;
  /**
   * Rudder positon in Degrees. Negative values will yaw to the left.
   */
  rudder = 0;
  /**
   * Flaps positon in Degrees.
   */
  protected _flaps = 0;
  /**
   * in Degrees / Second
   */
  protected _roll = 0;
  /**
   * in Degrees / Second
   */
  protected _yaw = 0;
  /**
   * in Degrees / Second
   */
  protected _pitch = 0;

  static GRAVITY_MS = 9.81;

  constructor(coordinates: Coordinates) {
    this._coordinates = coordinates;
    this.navRadios = [
      new NavRadio([]),
      new NavRadio([]),
    ]
    this.hsi = new Hsi(0, this.navRadios);
    this.flightLog = new FlightLog(this.getLogCoordinates(0));
  }

  move(delta: number, currentWeather: CurrentWeather, elevationHeight: number): boolean {
    if (this.isBroken) {
      return false;
    }

    this._speedKts = (this.fuel <= 0)
      ? 0
      : this._throttle / 100 * this.specifications.v.normalOperation;

    this.isActive = this.isActive || (this._throttle > 0);
    if (!this.coordinates.elevation || elevationHeight > this.coordinates.elevation) {
      if (this._speedKts < 50) {
        this.coordinates.elevation = elevationHeight;
      } else {
        this.isBroken = true;
        return false;
      }
    }

    this._altAglFt = this.coordinates.elevation
      ? this.coordinates.elevation - elevationHeight
      : elevationHeight;
    let radElevator = this.elevator * (Math.PI / 180);


    // TODO: This is oversimplified
    this.changeHeading(this.ailerons * delta / 5000 * App.TIME_COMPRESSION);
    let vector: Vector = {
      groundSpeed: Math.cos(radElevator) * this._speedKts,
      altitudeChange: Math.sin(radElevator) * this._speedKts * 1.68781 / 1000, // NM/h to ft/ms
      heading: this.heading,
    }

    if (currentWeather.windSpeedKts > 0) {
      const radCourse = this.heading.rad;
      const deltaRad = currentWeather.windDirection.rad - radCourse;
      const correctionRad = (deltaRad === 0 || deltaRad === Math.PI || vector.groundSpeed >= 0)
        ? 0
        : Math.asin(currentWeather.windSpeedKts * Math.sin(deltaRad) / vector.groundSpeed)
        ;
      if (deltaRad === 0) {
        vector.groundSpeed += currentWeather.windSpeedKts;
      } else if (deltaRad === Math.PI) {
        vector.groundSpeed -= currentWeather.windSpeedKts;
      } else {
        vector.groundSpeed = Math.round(Math.sin(deltaRad + correctionRad) * vector.groundSpeed / Math.sin(deltaRad));
      }

      const correctionDeg = correctionRad / (Math.PI / 180);

      // TODO: Remove rudder from this equation
      vector.heading = new Degree(this.heading.degree + correctionDeg + this.rudder);
    }

    this.coordinates = this._coordinates.getNewCoordinates(
      vector.heading,
      vector.groundSpeed * delta / 3600000 * App.TIME_COMPRESSION,
      this.coordinates.elevation + (vector.altitudeChange * 0.0666 * delta * App.TIME_COMPRESSION)
    );
    this._fuel -= this._throttle * delta / 3600000 * App.TIME_COMPRESSION;

    return true;
  }

  set coordinates(coordinates: Coordinates) {
    this._coordinates = coordinates;
    this.navRadios.forEach((navRadio) => {
      navRadio.coordinates = coordinates;
    });
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

  changeAltitude(changeAltitude: number) {
    if (this.coordinates.elevation === null) {
      this.coordinates.elevation = 0;
    }
    this.coordinates.elevation += changeAltitude;
  }

  get coordinates() {
    return this._coordinates;
  }

  getLogCoordinates(timestamp: number) {
    return new LogCoordinates(this, timestamp);
  }

  set throttle(throttle: number) {
    this._throttle = Math.max(0, Math.min(100, throttle));
  }

  get throttle() {
    return this._throttle;
  }

  get speedKts() {
    return this._speedKts;
  }

  get altAglFt() {
    return this._altAglFt;
  }

  get fuel() {
    return this._fuel;
  }

  set flaps(angle: number) {
    this._flaps = Math.max(0, Math.min(45, angle));
  }

  get flaps() {
    return this._flaps;
  }

  get specifications() {
    return {
      v: {
        stallSpeedFlaps: 50, // vs0, white starts here
        stallSpeed: 80, // vs1, green starts here
        maxFlapsExtended: 120, // vfe, white ends here
        maxLandingGearExtended: 120,
        normalOperation: 180, // vn0, yelow starts here
        neverExceed: 220 // vne, red starts here
      },
      rate: {
        ailerons: 1, // aileron
        elevator: 1, // elevator
        rudder: 1, // rudder,
        acceleration: 1,
        deceleration: 1,
      },
      physics: {
        drag: 0,
        dragGear: 0,
        dragMaxFlaps: 0,
        lift: 0,
        liftFlaps: 0
      }
    }
  }
}
