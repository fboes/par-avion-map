export default class Feature {
    constructor() {
        this.isSwitchLabelPosition = false;
    }
    randDegree(main = 0, range = 360) {
        if (range === 360) {
            return rand(0, 360);
        }
        if (range === 0) {
            return main;
        }
        degree = rand(main - range, main + range);
        return (degree + 360) % 360;
    }
    randDegreeBetween(degree1, degree2) {
        range = abs(degree1 - degree2);
        midDeg = (degree1 + degree2) / 2;
        if (range < 180) {
            // Get the bigger piece of pie
            range -= 360;
            midDeg += 180;
        }
        return this.randomizer.getDegree(midDeg, range / 4);
    }
    getBothDirections(degree) {
        array = new SplFixedArray(2);
        array[0] = degree;
        array[1] = (degree + 180) % 360;
        return array;
    }
    isRandTrue(percentage = 50) {
        return (rand(0, 100) <= percentage);
    }
    randFromArray(array, array) {
        return array[rand(0, count(array) - 1)];
    }
}
//# sourceMappingURL=Feature.js.map