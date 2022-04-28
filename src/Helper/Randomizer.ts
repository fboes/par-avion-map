import Degree from "../Types/Degree.js";

export default class Randomizer {
  protected _seed: string = '';

  constructor(seed: string = '') {
    this.seed = seed.toUpperCase();
  }

  set seed(seed:string){
    if (seed === '') {
      for (let i = 0; i < 5; i++) {
        seed += String.fromCharCode(Math.floor(Math.random() * 26 + 65)); // 65..90
      }
    }
    this._seed = seed;
    const seedHasher = this.xmur3(this.seed);
    Randomizer.prototype.random = this.mulberry32(seedHasher());
  }

  get seed(): string {
    return this._seed;
  }

  public getInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(this.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
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
    return (this.random() <= (percentage / 100));
  }

  public fromArray(list: any[]): any {
    return list[this.getInt(0, list.length - 1)];
  }

  // @see https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
  protected xmur3(str: string): () => number {
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = h << 13 | h >>> 19;
    }
    return function() {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
    }
  }

  // @see https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
  protected mulberry32(a: number): () => number {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }

  random(): number {
    return Math.random();
  }
}
