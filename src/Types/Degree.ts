export default class Degree {
  protected _degree: number = 0;
  protected _oppositeDegree: number = 180;

  public constructor(degree: number) {
    this.degree = degree;
  }

  set degree(degree: number) {
    this._degree = (degree + 360) % 360;
    this._oppositeDegree = (this._degree + 180) % 360;
  }

  get degree(): number {
    return this._degree;
  }

  get oppositeDegree(): number {
    return this._oppositeDegree;
  }
}
