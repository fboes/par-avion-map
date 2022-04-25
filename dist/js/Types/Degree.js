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
}
//# sourceMappingURL=Degree.js.map