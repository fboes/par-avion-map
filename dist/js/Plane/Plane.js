import Degree from "../Types/Degree.js";
import NavRadio from "./NavRadio.js";
import Hsi from "./Hsi.js";
import FlightLog from "./FlightLog.js";
import App from "../App.js";
import LogCoordinates from "../Types/LogCoordinates.js";
export default class Plane {
    constructor(coordinates) {
        this._heading = new Degree(0);
        this._throttle = 0;
        this._speedKts = 0;
        this._altAglFt = 0;
        this._fuel = 100;
        this.isBroken = false;
        // in Degrees
        this.elevator = 0;
        // in Degrees
        this.ailerons = 0;
        // in Degrees
        this.rudder = 0;
        // in Degrees
        this.flaps = 0;
        // in Degrees/s
        this._roll = 0;
        // in Degrees/s
        this._yaw = 0;
        // in Degrees/s
        this._pitch = 0;
        this._coordinates = coordinates;
        this.navRadios = [
            new NavRadio([]),
            new NavRadio([]),
        ];
        this.hsi = new Hsi(0, this.navRadios);
        this.flightLog = new FlightLog(this.getLogCoordinates(0));
    }
    move(delta, currentWeather, elevationHeight) {
        if (this.isBroken) {
            return false;
        }
        this._speedKts = (this.fuel <= 0)
            ? 0
            : this._throttle / 100 * this.specifications.v.normalOperation;
        if (!this.coordinates.elevation || elevationHeight > this.coordinates.elevation) {
            if (this._speedKts < 50) {
                this.coordinates.elevation = elevationHeight;
            }
            else {
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
        let vector = {
            groundSpeed: Math.cos(radElevator) * this._speedKts,
            altitudeChange: Math.sin(radElevator) * this._speedKts * 1.68781 / 1000,
            heading: this.heading,
        };
        if (currentWeather.windSpeedKts > 0) {
            const radCourse = this.heading.rad;
            const deltaRad = currentWeather.windDirection.rad - radCourse;
            const correctionRad = (deltaRad === 0 || deltaRad === Math.PI || vector.groundSpeed >= 0)
                ? 0
                : Math.asin(currentWeather.windSpeedKts * Math.sin(deltaRad) / vector.groundSpeed);
            if (deltaRad === 0) {
                vector.groundSpeed += currentWeather.windSpeedKts;
            }
            else if (deltaRad === Math.PI) {
                vector.groundSpeed -= currentWeather.windSpeedKts;
            }
            else {
                vector.groundSpeed = Math.round(Math.sin(deltaRad + correctionRad) * vector.groundSpeed / Math.sin(deltaRad));
            }
            const correctionDeg = correctionRad / (Math.PI / 180);
            // TODO: Remove rudder from this equation
            vector.heading = new Degree(this.heading.degree + correctionDeg + this.rudder);
        }
        this.coordinates = this._coordinates.getNewCoordinates(vector.heading, vector.groundSpeed * delta / 3600000 * App.TIME_COMPRESSION, this.coordinates.elevation + (vector.altitudeChange * 0.0666 * delta * App.TIME_COMPRESSION));
        this._fuel -= this._throttle * delta / 3600000 * App.TIME_COMPRESSION;
        return true;
    }
    set coordinates(coordinates) {
        this._coordinates = coordinates;
        this.navRadios.forEach((navRadio) => {
            navRadio.coordinates = coordinates;
        });
    }
    set heading(heading) {
        this._heading = heading;
        this.hsi.heading = heading;
    }
    get heading() {
        return this._heading;
    }
    changeHeading(changeDegree) {
        this._heading.degree += changeDegree;
        this.hsi.heading.degree += changeDegree;
    }
    changeAltitude(changeAltitude) {
        if (this.coordinates.elevation === null) {
            this.coordinates.elevation = 0;
        }
        this.coordinates.elevation += changeAltitude;
    }
    get coordinates() {
        return this._coordinates;
    }
    getLogCoordinates(timestamp) {
        return new LogCoordinates(this, timestamp);
    }
    set throttle(throttle) {
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
    get specifications() {
        return {
            v: {
                stallSpeedFlaps: 50,
                stallSpeed: 80,
                maxFlapsExtended: 120,
                maxLandingGearExtended: 120,
                normalOperation: 180,
                neverExceed: 220 // vne, red starts here
            },
            rate: {
                ailerons: 1,
                elevator: 1,
                rudder: 1,
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
        };
    }
}
Plane.GRAVITY_MS = 9.81;
