import Degree from "../Types/Degree.js";
export default class NavRadio {
    constructor(label) {
        this.label = label;
    }
    setBearing(bearing) {
        if (!this.bearing) {
            this.bearing = new Degree(bearing);
        }
        else {
            this.bearing.degree = bearing;
        }
        if (this.course) {
            this.setDeviation(this.course.degree - this.bearing.degree);
        }
    }
    setCourse(course) {
        if (!this.course) {
            this.course = new Degree(course);
        }
        else {
            this.course.degree = course;
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
}
;
