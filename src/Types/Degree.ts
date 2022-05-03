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

  get rad(): number {
    return this._degree * (Math.PI / 180);
  }

  isBetween(min: number, max: number) {
    min = (min + 360) % 360;
    max = (max + 360) % 360;

    if (min > max) {
      // searching over end of circle
      max += 360;
    }

    return min <= this._degree && this._degree <= max;
  }
}
