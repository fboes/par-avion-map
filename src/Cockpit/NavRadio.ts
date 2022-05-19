import Degree from "../Types/Degree.js";

export default class NavRadio {
  course: Degree | undefined;
  deviation: Degree | undefined;
  bearing: Degree | undefined;
  distance: number | undefined;

  constructor(public label: string) {
  }

  setBearing(bearing: number) {
    if (!this.bearing) {
      this.bearing = new Degree(bearing);
    } else {
      this.bearing.degree = bearing;
    }

    if (this.course) {
      this.setDeviation(this.course.degree - this.bearing.degree);
    }
  }

  setCourse(course: number) {
    if (!this.course) {
      this.course = new Degree(course);
    } else {
      this.course.degree = course;
    }
  }

  setDeviation(deviation: number) {
    if (!this.deviation) {
      this.deviation = new Degree(deviation);
    } else {
      this.deviation.degree = deviation;
    }
  }
};
