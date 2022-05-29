import Navaid from "../World/Navaid.js";
import Degree from "../Types/Degree.js";
export default class NavRadio {
    constructor(navAids) {
        this.navAids = navAids;
    }
    get label() {
        return this.currentNavAid ? this.currentNavAid.code : '';
    }
    get type() {
        return this.currentNavAid ? this.currentNavAid.type : '';
    }
    set coordinates(coordinates) {
        if (this.currentNavAid) {
            this.bearing = new Degree(coordinates.getBearing(this.currentNavAid.coordinates));
            this.distance = this.currentNavAid.hasDme ? coordinates.getDistance(this.currentNavAid.coordinates) : undefined;
            this.caluclateDeviation();
        }
    }
    setCurrentNavAid(index, coordinates) {
        this.currentNavAid = this.navAids[index];
        this.course = (this.currentNavAid.type === Navaid.VOR) ? new Degree(0) : undefined;
        this.coordinates = coordinates;
    }
    setCourse(course) {
        if (this.currentNavAid && this.currentNavAid.type === Navaid.VOR) {
            if (!this.course) {
                this.course = new Degree(course);
            }
            else {
                this.course.degree = course;
            }
            this.caluclateDeviation();
        }
        else {
            this.course = undefined;
        }
    }
    setDeviation(deviation) {
        if (!this.deviation) {
            this.deviation = new Degree(deviation);
        }
        else {
            this.deviation.degree = deviation;
        }
    }
    caluclateDeviation() {
        if (this.currentNavAid && this.currentNavAid.type === Navaid.VOR && this.course && this.bearing) {
            this.setDeviation(this.course.degree - this.bearing.degree);
        }
    }
}
;
