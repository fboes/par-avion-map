import Hsi from "../Cockpit/Hsi.js";
import NavRadio from "../Cockpit/NavRadio.js";
import Degree from "../Types/Degree.js";
import CanvasTool from "./CanvasTool.js";


export default class CanvasHsi {
  protected multiplier: number;
  protected ctx: CanvasRenderingContext2D;

  constructor(protected canvas: HTMLCanvasElement, public hsi: Hsi) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("No CanvasRenderingContext2D found");
    }
    this.canvas.width = Math.max(512, this.canvas.clientWidth);
    this.canvas.height = this.canvas.width;
    this.multiplier = this.canvas.width / 256;
    this.ctx = ctx;


    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const t = new CanvasTool(this.ctx, 128, 128, this.multiplier);
    t.style('rgba(0,0,0,0.7');
    t.fillRect(-128,-128,256,256);

    t.style('white', 'white', 2);
    t.circle(0,0,70).stroke(); // around plane
    for (let i = 0; i < 360; i += 45) {
      if (i === 0) {
        t.line(0, -128, 0, -120).stroke(); // TODO: Chevron
      } else {
        t.line(0, -128, 0, -120).stroke();
      }
      t.rotate(0,0,45);
    }

    this.hsi.navRadios.forEach((navRadio, index) => {
      this.drawNavRadio(navRadio, index);
    })
    this.drawHeading();
    this.drawPlane();
  }

  protected drawNavRadio(navRadio: NavRadio, index: number) {
    const t = new CanvasTool(this.ctx, 128, 128, this.multiplier);
    const color = index === 0 ? 'cyan' : 'magenta';
    const maxArrow = 110;
    const circleDeviation = 65;
    const deviationSpacer = 25;

    t.style(color, color, 2);

    if (navRadio.bearing) {
      t.rotate(0,0,this.hsi.heading.degree + navRadio.bearing.degree);
      t.polygon([
        [-5, 7-maxArrow],
        [0, -maxArrow],
        [5, 7-maxArrow],
        [5, maxArrow],
        [-5, maxArrow]
      ]).stroke();
      t.reset();
    }


    t.textStyle(15, index === 0 ? 'left' : 'right');
    t.text(
      index === 0 ? -125 : +125,
      -110,
      navRadio.label
    );
    if (navRadio.distance) {
      t.text(
        index === 0 ? -125 : +125,
        120,
        navRadio.distance.toFixed(2)
      );
    }

    if (navRadio.course) {
      t.rotate(0,0,this.hsi.heading.degree + navRadio.course.degree);

      if (navRadio.deviation) {
        const isTo = navRadio.deviation.isBetween(270, 90);

        let deviation = navRadio.deviation.degree;
        if (deviation > 270) { deviation -= 360; }
        else if (deviation > 90) { deviation -= 180; deviation *= -1; }

        const currentDeviation = (deviation / 90) * 2 * deviationSpacer;
        t.polygon(isTo
          ?[
          [currentDeviation -3, 7-circleDeviation +5],
          [currentDeviation, -circleDeviation +5],
          [currentDeviation + 3, 7-circleDeviation +5],
          [currentDeviation + 3, circleDeviation -2],
          [currentDeviation + -3, circleDeviation -2]
        ] : [
          [currentDeviation -3, -1 * (7-circleDeviation +5)],
          [currentDeviation, -1 * (-circleDeviation +5)],
          [currentDeviation + 3, -1 * (7-circleDeviation +5)],
          [currentDeviation + 3, -1 * (circleDeviation -2)],
          [currentDeviation + -3, -1 * (circleDeviation -2)]
        ]).fill();
      }

      t.polygon([
        [-3, 7-maxArrow +7],
        [0, -maxArrow +7],
        [3, 7-maxArrow +7],
        [3, -circleDeviation],
        [-3, -circleDeviation]
      ]).fill();

      t.polygon([
        [-3, circleDeviation],
        [3, circleDeviation],
        [3, maxArrow -7],
        [-3, maxArrow -7]
      ]).fill();

      t.style('white', 'white', 2);
      t.circle(2 * deviationSpacer,0,5).stroke();
      t.circle(deviationSpacer,0,5).stroke();
      t.circle(-deviationSpacer,0,5).stroke();
      t.circle(-2 * deviationSpacer,0,5).stroke();
      t.reset();
    }
  }

  protected drawHeading() {
    const t = new CanvasTool(this.ctx, 128, 128, this.multiplier);
    const ring = -118;
    t.style('white', 'white', 2);
    t.textStyle(15);
    t.rotate(0,0,this.hsi.heading.degree);

    for (let i = 0; i < 360; i += 5) {
      let length = 5;
      if (i % 10 === 0) {
        length += 5;
      }
      if (i % 30 === 0) {
        length += 5;
        t.text(0, ring + 15 + length, String(i / 10));
      }
      t.line(0, ring, 0, ring + length).stroke();
      t.rotate(0,0,5);
    }

    if (this.hsi.headingSelect) {
      t.rotate(0,0,this.hsi.headingSelect.degree);
      // TODO: paint heading select
    }

    t.reset();
  }

  protected drawPlane() {
    // TODO: orange lubber line
    // TODO: plane
  }
}
