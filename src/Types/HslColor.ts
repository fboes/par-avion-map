export default class HslColor {
  constructor(
    public hue: number,
    public saturation: number,
    public luminosity: number,
    public alpha: number,
  ) {}

  get value() {
    // hsla(0, 0%, 0%, 0.74)
    return `hsl(${this.hue}, ${this.saturation * 100}%, ${this.luminosity * 100}%, ${this.alpha})`;
  }
}
