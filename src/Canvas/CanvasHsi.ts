import Hsi from "../Plane/Hsi.js";
import NavRadio from "../Plane/NavRadio.js";
import Navaid from "../World/Navaid.js";
import CanvasDisplay from "./CanvasDisplay.js";
import CanvasTool from "./CanvasTool.js";


export default class CanvasHsi extends CanvasDisplay {
  protected colors = {
    cyan: 'rgb(50,245,255)',
    magenta: 'rgb(255,0,255)',
    green: 'rgb(63,255,72)',
    yellow: 'rgb(255,230,0,1)',
    orange: 'rgb(63,255,72)',
    pink: '#ff3385',
    blue: '#3870ff',
    turqoise: '#16FFE4',
  }

  static COMPASS_SCALE_X = 1;
  static COMPASS_SCALE_Y = CanvasHsi.COMPASS_SCALE_X;

  constructor(protected canvas: HTMLCanvasElement, public hsi: Hsi) {
    super(canvas);
    this.draw();
  }

  draw() {
    const t = new CanvasTool(this.ctx, 128, 128, this.multiplier);
    super.draw();

    t.style('white', 'white', 2);
    t.rescaleCanvas(CanvasHsi.COMPASS_SCALE_X, CanvasHsi.COMPASS_SCALE_Y);
    t.circle(0, 0, 65).stroke(); // around plane
    this.hsi.navRadios.forEach((navRadio, index) => {
      this.drawNavRadio(navRadio, index);
    })
    this.drawHeading();
    this.drawHeadingSelect();
    this.drawPlane();
  }

  protected drawNavRadio(navRadio: NavRadio, index: number) {
    const t = new CanvasTool(this.ctx, 128, 128, this.multiplier);
    let color = this.colors.green;
    if (index !== 0) {
      switch (navRadio.type) {
        case Navaid.VOR: color = this.colors.blue; break;
        case Navaid.ILS: color = this.colors.yellow; break;
        default: color = this.colors.pink; break;
      }
    }

    let maxArrow = 104;
    const circleDeviationPx = 61;
    const deviationMaxRangePx = 50;
    let deviation: number | null = null;
    const maxDeviationDegrees = (navRadio.type === Navaid.ILS ? 2.5 : 10);
    t.style(color, color, 2);

    const align = index === 0 ? 'left' : 'right';
    this.text(
      t,
      index === 0 ? -125 : +125, -112,
      navRadio.label, navRadio.type,
      align
    );
    if (navRadio.distance) {
      this.text(
        t,
        index === 0 ? -125 : +125, 115,
        navRadio.distance.toFixed(2) + ' NM', 'DME',
        align
      );
    }
    if (navRadio.course) {
      this.text(
        t,
        index === 0 ? -125 : +125, navRadio.distance ? 83 : 115,
        navRadio.course.degree.toFixed(0).padStart(3, '0') + '°', 'CRS',
        align
      );
    } else if (navRadio.bearing) {
      this.text(
        t,
        index === 0 ? -125 : +125, navRadio.distance ? 83 : 115,
        navRadio.bearing.degree.toFixed(0).padStart(3, '0') + '°', 'BRG',
        align
      );
    }

    t.rescaleCanvas(CanvasHsi.COMPASS_SCALE_X, CanvasHsi.COMPASS_SCALE_Y);
    if (navRadio.course) {
      t.rotate(0, 0, navRadio.course.degree - this.hsi.heading.degree);

      if (navRadio.deviation) {
        const isTo = navRadio.deviation.isBetween(270, 90);
        deviation = navRadio.deviation.degree;
        if (deviation > 270) { deviation -= 360; }
        else if (deviation > 90) { deviation -= 180; deviation *= -1; }
        deviation = Math.max(-maxDeviationDegrees, Math.min(maxDeviationDegrees, deviation));

        const currentDeviation = (deviation / -maxDeviationDegrees) * deviationMaxRangePx;

        t.polygon(CanvasTool.mirror([
          [currentDeviation - 10, 14 - 50],
          [currentDeviation + 0, - 50],
          [currentDeviation + 10, 14 - 50],
          [currentDeviation + 3, 12 - 50],
          [currentDeviation + 3, 14 - 50],
          [currentDeviation + 3, circleDeviationPx - 2],
          [currentDeviation - 3, circleDeviationPx - 2],
          [currentDeviation - 3, 14 - 50],
          [currentDeviation - 3, 12 - 50],
        ], 1, isTo ? 1 : -1)).fill();

        t.polygon(CanvasTool.mirror([
          [currentDeviation - 3, -circleDeviationPx + 2],
          [currentDeviation + 3, -circleDeviationPx + 2],
          [currentDeviation + 3, 2 - 50],
          [currentDeviation + 0, - 50 - 3],
          [currentDeviation - 3, 2 - 50]
        ], 1, isTo ? 1 : -1)).fill();
      }

      t.polygon([
        [-10, 14 - maxArrow],
        [0, -maxArrow],
        [10, 14 - maxArrow],
        [3, 12 - maxArrow],
        [3, 14 - maxArrow],
        [3, -circleDeviationPx],
        [-3, -circleDeviationPx],
        [-3, 14 - maxArrow],
        [-3, 12 - maxArrow],
      ]).fill();
      t.polygon([
        [-3, circleDeviationPx],
        [3, circleDeviationPx],
        [3, maxArrow - 2],
        [-3, maxArrow - 2]
      ]).fill();

      t.style('white', 'white', 2);
      //t.textStyle(10);
      //t.text(deviationMaxRangePx, 18, String(maxDeviationDegrees) + '°');
      if (maxDeviationDegrees === 2.5) {
        t.circle(1 / 2.5 * deviationMaxRangePx, 0, 5).stroke();
        t.circle(2 / 2.5 * deviationMaxRangePx, 0, 5).stroke();
        t.circle(-2 / 2.5 * deviationMaxRangePx, 0, 5).stroke();
        t.circle(-1 / 2.5 * deviationMaxRangePx, 0, 5).stroke();

      } else {
        t.circle(0.5 * deviationMaxRangePx, 0, 5).stroke();
        t.circle(deviationMaxRangePx, 0, 5).stroke();
        t.circle(-deviationMaxRangePx, 0, 5).stroke();
        t.circle(-0.5 * deviationMaxRangePx, 0, 5).stroke();
      }
      t.reset();
    }

    if (navRadio.bearing) {
      t.style(color, color, 2);
      if (deviation !== null) {
        this.ctx.globalAlpha = Math.abs(deviation / 10);
      }

      t.rotate(0, 0, navRadio.bearing.degree - this.hsi.heading.degree);
      if (deviation === null) {
        t.polygon([
          [-5, 10 - maxArrow],
          [0, -maxArrow],
          [5, 10 - maxArrow],
          [5, maxArrow],
          [-5, maxArrow]
        ]).stroke();
      } else {
        maxArrow -= 40;
      }
      t.polygon([
        [-10, 14 - maxArrow],
        [0, -maxArrow],
        [10, 14 - maxArrow],
        [0, 10 - maxArrow],
      ]);
      if (deviation === null) {
        this.ctx.fill();
      } else {
        this.ctx.stroke();
      }
      t.reset();
    }
  }

  protected drawHeading() {
    const t = new CanvasTool(this.ctx, 128, 128, this.multiplier);
    t.rescaleCanvas(CanvasHsi.COMPASS_SCALE_X, CanvasHsi.COMPASS_SCALE_Y);
    const ring = -104;
    t.style('white', 'white', 2);
    t.textStyle(15);
    t.rotate(0, 0, -this.hsi.heading.degree);

    for (let i = 0; i < 360; i += 5) {
      let length = 5;
      if (i % 10 === 0) {
        length += 5;
      }
      if (i % 30 === 0) {
        const rotText = this.hsi.heading.degree - i;
        length += 5;
        let text;
        switch (i) {
          case 0: text = 'N'; break;
          case 90: text = 'E'; break;
          case 180: text = 'S'; break;
          case 270: text = 'W'; break;
          default: text = (i / 10).toFixed().padStart(2, '0'); break;
        }

        t.rotate(0, ring + 25, rotText);
        t.text(0, ring + 15 + length, text);
        t.rotate(0, ring + 25, -rotText);
      }
      t.line(0, ring, 0, ring + length).stroke();
      t.rotate(0, 0, 5);
    }

    t.reset();
  }

  protected drawHeadingSelect() {
    if (this.hsi.headingSelect) {
      const t = new CanvasTool(this.ctx, 128, 128, this.multiplier);
      const y = 15;
      t.style(this.colors.turqoise, this.colors.magenta, 2);
      t.textStyle(15);
      t.text(3, 125, this.hsi.headingSelect.degree.toFixed(0).padStart(3, '0') + '°')

      t.rescaleCanvas(CanvasHsi.COMPASS_SCALE_X, CanvasHsi.COMPASS_SCALE_Y);
      t.rotate(0, 0, this.hsi.headingSelect.degree - this.hsi.heading.degree);
      t.polygonRaw([
        [-10, y - 119],
        [-10, y - 125],
        [-5, y - 125],
        [0, y - 118],
        [5, y - 125],
        [10, y - 125],
        [10, y - 119]
      ]).fill();
      t.reset();
    }
  }

  protected drawPlane() {
    const t = new CanvasTool(this.ctx, 128, 128, this.multiplier);
    const y = 15;

    t.style('white', 'white', 2);
    t.textStyle(15);
    t.text(3, -112, this.hsi.heading.degree.toFixed(0).padStart(3, '0') + '°')


    // Plane
    t.rescaleCanvas(CanvasHsi.COMPASS_SCALE_X, CanvasHsi.COMPASS_SCALE_Y);
    t.line(0, -12, 0, +10).stroke();
    t.line(-10, 0, 10, 0).stroke();
    t.line(-6, +10, 6, +10).stroke();

    for (let i = 0; i < 360; i += 45) {
      if (i === 0) {
        this.ctx.beginPath();
        t.polygonRaw([
          [-18, y - 125],
          [-5, y - 125],
          [0, y - 118],
          [5, y - 125],
          [18, y - 125]
        ]).stroke();
      } else {
        t.line(0, y - 128, 0, y - 120).stroke();
      }
      t.rotate(0, 0, 45);
    }

  }

  text(t: CanvasTool, x: number, y: number, main: string, label: string, align: CanvasTextAlign = 'left') {
    if (label) {
      t.textStyle(8, align);
      t.text(x, y - 6, label);
    }
    t.textStyle(14, align);
    t.text(x, y + (label ? 9 : 0), main);
  }
}
