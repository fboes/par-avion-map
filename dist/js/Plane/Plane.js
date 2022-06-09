import Degree from "../Types/Degree.js";
import NavRadio from "./NavRadio.js";
import Hsi from "./Hsi.js";
import FlightLog from "./FlightLog.js";
export default class Plane {
    constructor(coordinates) {
        this._heading = new Degree(0);
        this._throttle = 0;
        this._coordinates = coordinates;
        this.navRadios = [
            new NavRadio([]),
            new NavRadio([]),
        ];
        this.hsi = new Hsi(0, this.navRadios);
        this.flightLog = new FlightLog(coordinates);
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
    move(delta) {
        this.coordinates = this._coordinates.getNewCoordinates(this.heading, this.throttle * delta / 100000, this.coordinates.elevation);
    }
    set coordinates(coordinates) {
        this._coordinates = coordinates;
        this.navRadios.forEach((navRadio) => {
            navRadio.coordinates = coordinates;
        });
    }
    get coordinates() {
        return this._coordinates;
    }
    set throttle(throttle) {
        this._throttle = Math.max(0, Math.min(100, throttle));
    }
    get throttle() {
        return this._throttle;
    }
}
