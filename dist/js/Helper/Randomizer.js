import Degree from "../Types/Degree.js";
export default class Randomizer {
    constructor(seed = null) {
        if (seed) {
            Math.random();
        }
    }
    getInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
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
        return (Math.random() <= (percentage / 100));
    }
    fromArray(list) {
        return list[this.getInt(0, list.length - 1)];
    }
}
//# sourceMappingURL=Randomizer.js.map