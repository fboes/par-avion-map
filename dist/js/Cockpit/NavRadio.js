import Degree from "../Types/Degree.js";
export default class NavRadio {
    constructor(label, type) {
        this.label = label;
        this.type = type;
    }
    setBearing(bearing) {
        if (!this.bearing) {
            this.bearing = new Degree(bearing);
        }
        else {
            this.bearing.degree = bearing;
        }
        this.caluclateDeviation();
    }
    setCourse(course) {
        if (!this.course) {
            this.course = new Degree(course);
        }
        else {
            this.course.degree = course;
        }
        this.caluclateDeviation();
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
        if (this.course && this.bearing) {
            this.setDeviation(this.course.degree - this.bearing.degree);
        }
    }
}
;
