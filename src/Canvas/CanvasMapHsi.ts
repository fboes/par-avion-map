import NavRadio from "../Plane/NavRadio.js";
import Plane from "../Plane/Plane.js";
import LocationsMap from "../World/LocationsMap.js";
import Navaid from "../World/Navaid.js";
import CanvasTool from "./CanvasTool.js";

export default class CanvasMapHsi {
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

  protected multiplier: number;
  protected ctx: CanvasRenderingContext2D;

  static ALPHA = 0.6;
  static VOR_SHOW_BRG = false;

  constructor(protected canvas: HTMLCanvasElement, protected plane: Plane, protected map: LocationsMap) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("No CanvasRenderingContext2D found");
    }
    this.canvas.width = Math.max(512, this.canvas.clientWidth * window.devicePixelRatio);
    this.canvas.height = this.canvas.width;
    this.multiplier = this.canvas.width / map.mapDimension;
    this.ctx = ctx;
    this.draw();
  }

  draw() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const t = this.getCanvasTool();
    t.style('black').globalAlpha = CanvasMapHsi.ALPHA;
    t.circle(0, 0, 115).fill();
    t.style('white', 'white', 2);
    t.circle(0, 0, 65).stroke(); // around plane

    this.plane.hsi.navRadios.forEach((navRadio, index) => {
      this.drawNavRadio(navRadio, index);
    })
    this.drawHeading();
    //this.drawHeadingSelect();
    this.drawPlane();
    t.reset();
  }

  protected drawNavRadio(navRadio: NavRadio, index: number) {
    const t = this.getCanvasTool();
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
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(-128, -128, 256, 256);
    this.ctx.arc(0, 0, 120, 0, Math.PI * 2);
    this.ctx.clip('evenodd');

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
    this.ctx.restore();

    if (navRadio.course) {
      t.rotate(0, 0, navRadio.course.degree);

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

        if (navRadio.distance) {
          const distance = Math.min(10, navRadio.distance) / 10 * (circleDeviationPx - 3) * (isTo ? 1 : -1);
          t.line(currentDeviation - 9, -distance, currentDeviation - 5, -distance).stroke();
          t.line(currentDeviation + 9, -distance, currentDeviation + 5, -distance).stroke();
        }
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
      t.rotate(0, 0, -1 * (navRadio.course.degree));
    }

    if (navRadio.bearing && (navRadio.type === Navaid.NDB || CanvasMapHsi.VOR_SHOW_BRG)) {
      t.style(color, color, 2);
      if (deviation !== null) {
        this.ctx.globalAlpha = Math.abs(deviation / 10);
      }

      t.rotate(0, 0, navRadio.bearing.degree);
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
      if (navRadio.distance && navRadio.type === Navaid.NDB) {
        const distance = Math.min(10, navRadio.distance) / 10 * (maxArrow - 15);
        t.line(-5, -distance, +5, -distance).stroke();
        if (navRadio.course) {
          t.line(0, -distance, 0, 0).stroke();
        }
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

  protected drawHeadingSelect() {
    if (this.plane.hsi.headingSelect) {
      const t = this.getCanvasTool();
      const y = 15;
      t.style(this.colors.turqoise, this.colors.magenta, 2);
      t.rotate(0, 0, this.plane.hsi.headingSelect.degree);
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

  protected drawHeading() {
    const t = this.getCanvasTool();
    const ring = -104;
    t.style('white', 'white', 2);
    t.textStyle(15);

    for (let i = 0; i < 360; i += 5) {
      let length = 5;
      if (i % 10 === 0) {
        length += 5;
      }
      if (i % 30 === 0) {
        length += 5;
        let text;
        switch (i) {
          case 0: text = 'N'; break;
          case 90: text = 'E'; break;
          case 180: text = 'S'; break;
          case 270: text = 'W'; break;
          default: text = (i / 10).toFixed().padStart(2, '0'); break;
        }

        t.rotate(0, ring + 25, -i);
        t.text(0, ring + 15 + length, text);
        t.rotate(0, ring + 25, i);
      }
      t.line(0, ring, 0, ring + length).stroke();
      t.rotate(0, 0, 5);
    }

    t.reset();
  }

  drawPlane() {
    const t = this.getCanvasTool();
    t.rotate(0, 0, this.plane.hsi.heading.degree);
    const y = 15;

    t.style('white', 'white', 2);
    t.line(0, -12, 0, +10).stroke();
    t.line(-10, 0, 10, 0).stroke();
    t.line(-6, +10, 6, +10).stroke();

    for (let i = 0; i < 360; i += 45) {
      if (i === 0) {
        this.ctx.beginPath();
        t.polygon([
          [-5, y - 125],
          [0, y - 118],
          [5, y - 125],
        ]).stroke();
      } else {
        t.line(0, y - 128, 0, y - 120).stroke();
      }
      t.rotate(0, 0, 45);
    }
  }

  getCanvasTool() {
    return new CanvasTool(this.ctx, this.plane.coordinates.x * this.multiplier, this.plane.coordinates.y * this.multiplier, 1);
  }

  text(t: CanvasTool, x: number, y: number, main: string, label: string, align: CanvasTextAlign = 'left') {
    const width = 80;
    const oldFillStyle = this.ctx.fillStyle;
    t.style('black').globalAlpha = CanvasMapHsi.ALPHA;
    this.ctx.fillRect(x - 2 - (align === 'left' ? 0 : width - 4), y - 16, width, 19 + (label ? 9 : 0));
    this.ctx.fillStyle = oldFillStyle;
    this.ctx.globalAlpha = 1;

    if (label) {
      t.textStyle(8, align);
      this.ctx.fillText(label, x, y - 6);

    }
    t.textStyle(14, align);
    this.ctx.fillText(main, x, y + (label ? 9 : 0));
  }
}
