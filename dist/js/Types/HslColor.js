export default class HslColor {
    constructor(hue, saturation, luminosity, alpha) {
        this.hue = hue;
        this.saturation = saturation;
        this.luminosity = luminosity;
        this.alpha = alpha;
    }
    get value() {
        // hsla(0, 0%, 0%, 0.74)
        return `hsl(${this.hue}, ${this.saturation * 100}%, ${this.luminosity * 100}%, ${this.alpha})`;
    }
}
//# sourceMappingURL=HslColor.js.map