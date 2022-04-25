export default class CanvasTool {
  constructor(protected ctx: CanvasRenderingContext2D, public x: number, public y: number, protected multiplier: number) { }

  dX(x = 0) {
    return this.dD(this.x + x);
  }


  dY(y = 0) {
    return this.dD(this.y + y);
  }

  dD(d: number) {
    return d * this.multiplier;
  }

  style(fillStyle: string, strokeStyle: string = '', lineWidth: number = 0.1) {
    this.ctx.fillStyle = fillStyle;
    this.ctx.strokeStyle = strokeStyle || fillStyle;
    this.lineWidth = lineWidth;
    return this.ctx;
  }

  set lineWidth(lineWidth: number) {
    this.ctx.lineWidth = lineWidth * this.multiplier;
  }

  get lineWidth() {
    return this.ctx.lineWidth / this.multiplier;
  }

  textStyle(fontSize: number = 0.5, textAlign: CanvasTextAlign = 'center') {
    this.ctx.font = this.dD(fontSize) + 'px sans-serif';
    this.ctx.textAlign = textAlign;
    return this.ctx;
  }

  setLineDash(dashes: number[]) {
    this.ctx.setLineDash(dashes.map((v) => {
      return this.dD(v);
    }));
    return this.ctx;
  }

  text(x: number, y: number, text: string) {
    this.ctx.fillText(text, this.dX(x), this.dY(y));
    return this.ctx;
  }

  textMultiline(x: number, y: number, textLines: string[], outline = true, lineSpacing = 0.55) {
    const oldStrokeStyle = this.ctx.strokeStyle;
    const oldLineWidth = this.ctx.lineWidth;
    this.ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    this.lineWidth = 0.1;
    textLines.forEach((text, i) => {
      if (outline) {
        this.ctx.strokeText(text, this.dX(x), this.dY(y + i * lineSpacing));
      }
      this.ctx.fillText(text, this.dX(x), this.dY(y + i * lineSpacing));
    });
    this.ctx.strokeStyle = oldStrokeStyle;
    this.ctx.lineWidth = oldLineWidth;
    return this.ctx;
  }

  circle(x: number, y: number, radius: number) {
    this.ctx.beginPath();
    this.ctx.arc(this.dX(x), this.dY(y), this.dD(radius), 0, Math.PI * 2, true);
    this.ctx.closePath();
    return this.ctx;
  }

  rect(x: number, y: number, width: number, height: number) {
    this.ctx.rect(this.dX(x), this.dY(y), this.dD(width), this.dD(height));
    return this.ctx;
  }

  fillRect(x: number, y: number, width: number, height: number) {
    this.ctx.fillRect(this.dX(x), this.dY(y), this.dD(width), this.dD(height));
    return this.ctx;
  }

  strokeRect(x: number, y: number, width: number, height: number) {
    this.ctx.strokeRect(this.dX(x), this.dY(y), this.dD(width), this.dD(height));
    return this.ctx;
  }

  line(x1: number, y1: number, x2: number, y2: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(this.dX(x1), this.dY(y1));
    this.ctx.lineTo(this.dX(x2), this.dY(y2));
    this.ctx.closePath();

    return this.ctx;
  }

  /**
   * Draw a closed polygon.
   * @param points an array with point arrays.
   *  If there are two coordinates, it will be treated as straight line.
   *  If there are six coordinates, it will be treaded as bezier curve.
   * @returns the drawing context
   */
  polygon(points: number[][]) {
    this.ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        this.ctx.moveTo(this.dX(point[0]), this.dY(point[1]));
      } else if (point.length === 6) {
        this.ctx.bezierCurveTo(
          this.dX(point[0]), this.dY(point[1]),
          this.dX(point[2]), this.dY(point[3]),
          this.dX(point[4]), this.dY(point[5])
        );
      } else {
        this.ctx.lineTo(this.dX(point[0]), this.dY(point[1]));
      }
    });
    this.ctx.closePath();
    return this.ctx;
  }

  rotate(x: number, y: number, angle: number) {
    this.ctx.translate(this.dX(x), this.dY(y));
    this.ctx.rotate(angle * Math.PI / 180);
    this.ctx.translate(-this.dX(x), -this.dY(y));
    return this.ctx;
  }

  reset() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    return this.ctx;
  }

  static numPad(text: number, targetLength: number): string {
    return String(text).padStart(targetLength, '0');
  }

  static frequency(frequency: number): string {
    return frequency.toFixed(2);
  }
}
