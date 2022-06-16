import Plane from "../Plane/Plane";
import CanvasDisplay from "./CanvasDisplay.js";
import CanvasTool from "./CanvasTool.js";

export default class CanvasSixPack extends CanvasDisplay {
  static HORIZON_SCALE_X = 1;
  static HORIZON_SCALE_Y = CanvasSixPack.HORIZON_SCALE_X;

  constructor(protected canvas: HTMLCanvasElement, public plane: Plane) {
    super(canvas);
    this.draw();
  }

  draw() {
    const t = new CanvasTool(this.ctx, 128, 128, this.multiplier);
    super.draw();

    t.style('white', 'white', 2);
    t.rescaleCanvas(CanvasSixPack.HORIZON_SCALE_X, CanvasSixPack.HORIZON_SCALE_Y);
    t.circle(0, 0, 65).stroke();

    this.drawHorizon();
    this.drawAsi();
    this.drawAlt();
  }
  drawAlt() {
    if (!this.plane.coordinates || this.plane.coordinates.elevation === null) {
      return;
    }

    const t = new CanvasTool(this.ctx, 256, 128, this.multiplier);
    const elevation = Math.ceil(this.plane.coordinates.elevation);
    t.style('white', 'white', 2);
    t.textStyle(15);
    t.text(-40, 5, Math.floor(elevation / 100).toFixed());
    t.textStyle(10);
    t.text(-20, 5, (elevation % 100).toFixed());
    t.polygon([[-60, 0], [-50, 10], [0, 10], [0, -10], [-50, -10]]).stroke();
  }
  drawAsi() {
    if (this.plane.speedKts === null) {
      return;
    }

    const t = new CanvasTool(this.ctx, 0, 128, this.multiplier);
    t.style('white', 'white', 2);
    t.textStyle(15);
    t.text(40, 5, (this.plane.speedKts).toFixed());
    t.polygon([[60, 0], [50, 10], [0, 10], [0, -10], [50, -10]]).stroke();
  }

  drawHorizon() {
    //throw new Error("Method not implemented.");
  }
}
