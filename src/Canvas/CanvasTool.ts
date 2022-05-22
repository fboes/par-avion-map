export default class CanvasTool {
  constructor(protected ctx: CanvasRenderingContext2D, public x: number, public y: number, protected multiplier: number
  ) { }

  dX(x = 0) {
    return this.dD(this.x + x);
  }

  dY(y = 0) {
    return this.dD(this.y + y);
  }

  dD(d: number) {
    return d * this.multiplier;
  }

  style(fillStyle: string, strokeStyle: string = "", lineWidth: number = 0.1) {
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

  textStyle(fontSize: number = 0.5, textAlign: CanvasTextAlign = "center", fontStyle: string = "") {
    if (fontStyle) {
      fontStyle += " ";
    }
    this.ctx.font = fontStyle + this.dD(fontSize) + "px sans-serif";
    this.ctx.textAlign = textAlign;
    return this.ctx;
  }

  setLineDash(dashes: number[]) {
    this.ctx.setLineDash(
      dashes.map((v) => {
        return this.dD(v);
      })
    );
    return this.ctx;
  }

  textOutline(x: number, y: number, text: string, outline = 0.1) {
    return this.text(x, y, text, outline);
  }

  text(x: number, y: number, text: string, outline = 0) {
    const oldStrokeStyle = this.ctx.strokeStyle;
    const oldLineJoin = this.ctx.lineJoin;
    const oldLineWidth = this.ctx.lineWidth;
    if (outline) {
      this.ctx.strokeStyle = "rgba(255,255,255,0.75)";
      this.ctx.lineJoin = "round";
      this.lineWidth = outline;
      this.ctx.strokeText(text, this.dX(x), this.dY(y));
    }
    this.ctx.fillText(text, this.dX(x), this.dY(y));

    if (outline) {
      this.ctx.strokeStyle = oldStrokeStyle;
      this.ctx.lineJoin = oldLineJoin;
      this.ctx.lineWidth = oldLineWidth;
    }
    return this.ctx;
  }

  textMultiline(x: number, y: number, textLines: string[], outline = true, lineSpacing = 0.55) {
    const oldStrokeStyle = this.ctx.strokeStyle;
    const oldLineJoin = this.ctx.lineJoin;
    const oldLineWidth = this.ctx.lineWidth;
    this.ctx.strokeStyle = "rgba(255,255,255,0.75)";
    this.ctx.lineJoin = "round";
    this.lineWidth = 0.1;

    textLines.forEach((text, i) => {
      if (outline) {
        this.ctx.strokeText(text, this.dX(x), this.dY(y + i * lineSpacing));
      }
      this.ctx.fillText(text, this.dX(x), this.dY(y + i * lineSpacing));
    });
    this.ctx.strokeStyle = oldStrokeStyle;
    this.ctx.lineJoin = oldLineJoin;
    this.ctx.lineWidth = oldLineWidth;
    return this.ctx;
  }

  // ---------------------------------------------------------------------------

  circle(x: number, y: number, radius: number) {
    this.ctx.beginPath();
    this.ctx.arc(this.dX(x), this.dY(y), this.dD(radius), 0, Math.PI * 2, true);
    this.ctx.closePath();
    return this.ctx;
  }

  roundedRect(x: number, y: number, width: number, height: number, radius: number) {
    this.ctx.beginPath();
    this.roundedRectRaw(x, y, width, height, radius);
    this.ctx.closePath();
    return this.ctx;
  }

  roundedRectRaw(x: number, y: number, width: number, height: number, radius: number) {
    return this.polygonRaw([
      [x + width - radius, y], // top
      [x + width - radius * 0.45, y, x + width, y + radius * 0.45, x + width, y + radius,], // left
      [x + width, y + height - radius],
      [x + width, y + height - radius * 0.45, x + width - radius * 0.45, y + height, x + width - radius, y + height,], // bottom
      [x + radius, y + height],
      [x + radius * 0.45, y + height, x, y + height - radius * 0.45, x, y + height - radius,], // right
      [x, y + radius],
      [x, y + radius * 0.45, x + radius * 0.45, y, x + radius, y], // top
      [x + width - radius, y],
    ]);
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
    this.ctx.strokeRect(
      this.dX(x),
      this.dY(y),
      this.dD(width),
      this.dD(height)
    );
    return this.ctx;
  }

  line(x1: number, y1: number, x2: number, y2: number) {
    this.ctx.beginPath();
    this.lineRaw(x1, y1, x2, y2);
    this.ctx.closePath();

    return this.ctx;
  }

  lineRaw(x1: number, y1: number, x2: number, y2: number) {
    this.ctx.moveTo(this.dX(x1), this.dY(y1));
    this.ctx.lineTo(this.dX(x2), this.dY(y2));
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
    this.polygonRaw(points);
    this.ctx.closePath();
    return this.ctx;
  }

  polygonRaw(points: number[][]) {
    points.forEach((point, index) => {
      if (index === 0) {
        this.ctx.moveTo(this.dX(point[0]), this.dY(point[1]));
      } else if (point.length === 6) {
        this.ctx.bezierCurveTo(
          this.dX(point[0]),
          this.dY(point[1]),
          this.dX(point[2]),
          this.dY(point[3]),
          this.dX(point[4]),
          this.dY(point[5])
        );
      } else {
        this.ctx.lineTo(this.dX(point[0]), this.dY(point[1]));
      }
    });

    return this.ctx;
  }

  rotate(x: number, y: number, angle: number) {
    this.ctx.translate(this.dX(x), this.dY(y));
    this.ctx.rotate((angle * Math.PI) / 180);
    this.ctx.translate(-this.dX(x), -this.dY(y));
    return this.ctx;
  }

  reset() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    return this.ctx;
  }

  static numPad(text: number, targetLength: number): string {
    return text.toFixed().padStart(targetLength, "0");
  }

  static frequency(frequency: number): string {
    return frequency.toFixed(2);
  }

  static terrainElevations(elevation: number) {
    elevation = Math.ceil(elevation / 100) * 100;
    return {
      thousand: Math.floor(elevation / 1000),
      hundred: (elevation % 1000) / 100,
    };
  }

  static scale(points: number[][], scale: number): number[][] {
    if (scale === 1) {
      return points;
    }
    return points.map((point) => {
      return point.map((c) => { return c / scale })
    })
  }

  static mirror(points: number[][], x = 1, y = 1): number[][] {
    if (x === 1 && y === 1) {
      return points;
    }
    return points.map((point) => {
      return [
        point[0] / x,
        point[1] / y
      ]
    })
  }
}
