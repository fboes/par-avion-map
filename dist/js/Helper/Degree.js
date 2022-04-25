"use strict";
class Degree {
    constructor(heading) {
        this.heading = heading;
        this.heading %= 360;
    }
    get oppositeHeading() {
        return (this.heading + 180) % 360;
    }
}
//# sourceMappingURL=Degree.js.map