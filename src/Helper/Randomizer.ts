import Degree from "../Types/Degree.js";

export default class Randomizer {
  constructor(seed: number | string | null = null) {
    if (seed) {
      Math.random();
    }
  }

  public getInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
  }

  public getDegree(main: number = 0, range = 360): Degree {
    if (range === 360) {
      return new Degree(this.getInt(0, 360));
    }
    if (range === 0) {
      return new Degree(main);
    }

    let degree = this.getInt(main + range, main - range,);
    return new Degree(degree);
  }

  public getDegreeBetween(degree1: Degree, degree2: Degree) {
    let range = Math.abs(degree1.degree - degree2.degree);
    let midDeg = (degree1.degree + degree2.degree) / 2;
    if (range < 180) {
      // Get the bigger piece of pie
      range -= 360;
      midDeg += 180;
    }

    return this.getDegree(midDeg, range / 4);
  }

  public isRandTrue(percentage = 50) {
    return (Math.random() <= (percentage / 100));
  }

  public fromArray(list: any[]): any {
    return list[this.getInt(0, list.length - 1)];
  }
}
