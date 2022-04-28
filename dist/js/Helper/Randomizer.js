import Degree from "../Types/Degree.js";
export default class Randomizer {
    constructor(seed = '') {
        this._seed = '';
        this.seed = seed.toUpperCase();
    }
    set seed(seed) {
        if (seed === '') {
            for (let i = 0; i < 5; i++) {
                seed += String.fromCharCode(Math.floor(Math.random() * 26 + 65)); // 65..90
            }
        }
        this._seed = seed;
        const seedHasher = this.xmur3(this.seed);
        Randomizer.prototype.random = this.mulberry32(seedHasher());
    }
    get seed() {
        return this._seed;
    }
    getInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(this.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
    }
    getDegree(main = 0, range = 360) {
        if (range === 360) {
            return new Degree(this.getInt(0, 360));
        }
        if (range === 0) {
            return new Degree(main);
        }
        let degree = this.getInt(main + range, main - range);
        return new Degree(degree);
    }
    getDegreeBetween(degree1, degree2) {
        let range = Math.abs(degree1.degree - degree2.degree);
        let midDeg = (degree1.degree + degree2.degree) / 2;
        if (range < 180) {
            // Get the bigger piece of pie
            range -= 360;
            midDeg += 180;
        }
        return this.getDegree(midDeg, range / 4);
    }
    isRandTrue(percentage = 50) {
        return (this.random() <= (percentage / 100));
    }
    fromArray(list) {
        return list[this.getInt(0, list.length - 1)];
    }
    // @see https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
    xmur3(str) {
        for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
            h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
            h = h << 13 | h >>> 19;
        }
        return function () {
            h = Math.imul(h ^ (h >>> 16), 2246822507);
            h = Math.imul(h ^ (h >>> 13), 3266489909);
            return (h ^= h >>> 16) >>> 0;
        };
    }
    // @see https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
    mulberry32(a) {
        return function () {
            var t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }
    random() {
        return Math.random();
    }
}
//# sourceMappingURL=Randomizer.js.map