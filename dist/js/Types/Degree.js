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
    get rad() {
        return this._degree * (Math.PI / 180);
    }
    isBetween(min, max) {
        min = (min + 360) % 360;
        max = (max + 360) % 360;
        return min > max
            ? min <= this._degree || this._degree <= max // searching over end of circle
            : min <= this._degree && this._degree <= max;
    }
    add(degree) {
        this.degree = this._degree + degree;
        return this;
    }
}
