export default class Degree {
    constructor(degree) {
        this._degree = 0;
        this._oppositeDegree = 180;
        this.degree = degree;
    }
    set degree(degree) {
        this._degree = (degree + 360) % 360;
        this._oppositeDegree = (this._degree + 180) % 360;
    }
    get degree() {
        return this._degree;
    }
    get oppositeDegree() {
        return this._oppositeDegree;
    }
    isBetween(min, max) {
        min = (min + 360) % 360;
        max = (max + 360) % 360;
        if (min > max) {
            // searching over end of circle
            max += 360;
        }
        return min <= this._degree && this._degree <= max;
    }
}
//# sourceMappingURL=Degree.js.map