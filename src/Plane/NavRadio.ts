import Navaid from "../World/Navaid.js";
import Coordinates from "../Types/Coordinates.js";
import Degree from "../Types/Degree.js";
import NavaidIls from "../World/NavaidIls.js";

export default class NavRadio {
  course: Degree | undefined;
  deviation: Degree | undefined;
  verticalDeviation: Degree | undefined;
  bearing: Degree | undefined;
  distance: number | undefined;
  inRange = false;

  protected currentNavAid: Navaid | NavaidIls | undefined;

  constructor(public navAids: Array<Navaid | NavaidIls>) {
  }

  get label(): string {
    return this.currentNavAid ? this.currentNavAid.code : '';
  }

  get type(): string {
    return this.currentNavAid ? this.currentNavAid.type : '';
  }

  set coordinates(coordinates: Coordinates) {
    if (this.currentNavAid) {
      const distance = coordinates.getDistance(this.currentNavAid.coordinates);
      const bearing = new Degree(coordinates.getBearing(this.currentNavAid.coordinates));
      this.inRange = (this.currentNavAid.range > distance);

      if (this.inRange && this.currentNavAid instanceof NavaidIls) {
        this.inRange = bearing.isBetween(this.currentNavAid.direction.oppositeDegree - 10, this.currentNavAid.direction.oppositeDegree + 10)
      }

      if (this.inRange) {
        this.bearing = bearing;
        this.distance = this.currentNavAid.hasDme ? distance : undefined;
        this.caluclateDeviation();
      } else {
        this.bearing = undefined;
        this.distance = undefined;
        this.deviation = undefined;
      }
    }
  }

  setCurrentNavAid(index: number, coordinates: Coordinates) {
    this.currentNavAid = this.navAids[index];
    this.course = undefined;
    switch (this.currentNavAid.type) {
      case Navaid.VOR: this.course = new Degree(0); break;
      case Navaid.ILS: this.course = new Degree(this.currentNavAid instanceof NavaidIls ? this.currentNavAid.direction.oppositeDegree : 0); break;
    }
    this.coordinates = coordinates;
  }

  setCourse(course: number) {
    if (this.currentNavAid && this.currentNavAid.type === Navaid.VOR) {

      if (!this.course) {
        this.course = new Degree(course);
      } else {
        this.course.degree = course;
      }

      this.caluclateDeviation();
    } else {
      this.course = undefined;
    }
  }


  setDeviation(deviation: number) {
    if (!this.deviation) {
      this.deviation = new Degree(deviation);
    } else {
      this.deviation.degree = deviation;
    }
  }

  caluclateDeviation() {
    if (this.currentNavAid
      && (this.currentNavAid.type === Navaid.VOR || this.currentNavAid.type === Navaid.ILS)
      && this.course
      && this.bearing) {
      this.setDeviation(this.course.degree - this.bearing.degree);
    }
  }
};
