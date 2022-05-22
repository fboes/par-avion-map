export default class RgbaColor {
    constructor(r, g, b, a = 255) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    toString() {
        let rgb = this.r.toFixed() + ',' + this.g.toFixed() + ',' + this.b.toFixed();
        return (this.a !== 255)
            ? 'rgba(' + rgb + ',' + this.a.toFixed(3) + ')'
            : 'rgb(' + rgb + ')';
    }
}
