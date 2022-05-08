import CanvasTool from "./CanvasTool.js";
import Runway from "../ParAvion/Runway.js";
export default class CanvasApproach {
    constructor(canvas, airport) {
        this.canvas = canvas;
        this.airport = airport;
        this.colors = {
            white: "#ffffff",
            black: "#000000",
            blackTransparent: "rgba(0, 0, 0, 0.3)",
            grey: "#bbbbbb",
        };
        this.maxX = 150;
        this.maxY = 180;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("No CanvasRenderingContext2D found");
        }
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.width * this.maxY / this.maxX;
        this.multiplier = this.canvas.width / this.maxX;
        this.ctx = ctx;
        this.ctx.fillStyle = this.colors.white;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.makeRunways();
        this.makeAirport();
        this.makeInfoBox();
    }
    makeInfoBox() {
        const t = this.getNewCanvasTool(0, 0);
        const lineHeight = 7;
        const ilsFrequency = this.airport.runways[0].ilsFrequencies.first;
        const rows = {
            first: !ilsFrequency ? this.maxX / 2 : this.maxX * 1 / 3,
            second: !ilsFrequency ? -1 : this.maxX * 2 / 3,
            firstCenter: !ilsFrequency ? this.maxX * 1 / 4 : this.maxX * 1 / 6,
            secondCenter: !ilsFrequency ? this.maxX * 3 / 4 : this.maxX * 5 / 6,
            thirdCenter: !ilsFrequency ? -1 : this.maxX * 3 / 6
        };
        t.line(0, 27, this.maxX, 27).stroke();
        t.line(rows.first, 10, rows.first, 27).stroke();
        if (ilsFrequency) {
            t.line(rows.second, 10, rows.second, 27).stroke();
        }
        t.textStyle(6, 'left');
        t.text(1, lineHeight * 1, this.airport.name + ' (' + this.airport.code + ')');
        t.textStyle(6, 'right', 'bold');
        t.text(this.maxX - 1, lineHeight * 1, 'APR ' + CanvasTool.numPad(this.airport.runways[0].heading.degree, 3));
        t.textStyle(6, 'center');
        t.text(rows.firstCenter, 3 + lineHeight * 2, (this.airport.hasTower ? "CT" : "UNICOM"));
        t.text(rows.secondCenter, 3 + lineHeight * 2, ('Elevation'));
        if (ilsFrequency) {
            t.text(rows.thirdCenter, 3 + lineHeight * 2, "ILS");
        }
        t.textStyle(6, 'center', 'bold');
        t.text(rows.firstCenter, 3 + lineHeight * 3, CanvasTool.frequency(this.airport.frequency));
        t.text(rows.secondCenter, 3 + lineHeight * 3, String(this.airport.coordinates.elevation));
        if (ilsFrequency) {
            t.text(rows.thirdCenter, 3 + lineHeight * 3, CanvasTool.frequency(ilsFrequency));
        }
        t.textStyle(4, 'right');
        t.text(this.maxX - 3, this.maxY - 3, CanvasTool.frequency(this.airport.coordinates.x) + 'X | ' + CanvasTool.frequency(this.airport.coordinates.y) + 'Y');
        t.strokeRect(0, 10, this.maxX, this.maxY - 10);
    }
    makeAirport() {
        const rad = this.airport.runways[0].heading.rad;
        const xCenter = this.maxX / 2 + Math.cos(rad) * (600 / CanvasApproach.FACTOR);
        const yCenter = (this.maxY - 27) / 2 + 27 + Math.sin(rad) * (600 / CanvasApproach.FACTOR);
        const t = this.getNewCanvasTool(xCenter, yCenter);
        t.style(this.colors.white, this.colors.black, 0.5);
        if (this.airport.hasBeacon) {
            t.polygon([
                [0, -0.2],
                [+0.065, -0.05],
                [+0.2, -0.05],
                [+0.08, 0.06],
                [+0.13, 0.2],
                [0, 0.12],
                [-0.13, 0.2],
                [-0.08, 0.06],
                [-0.2, -0.05],
                [-0.065, -0.05],
            ], 0.1).fill();
            this.ctx.stroke();
        }
    }
    makeRunways() {
        const xCenter = this.maxX / 2;
        const yCenter = (this.maxY - 27) / 2;
        const t = this.getNewCanvasTool(xCenter, yCenter + 27);
        // Coordinate grid
        if (this.airport.coordinates) {
            t.style(this.colors.grey);
            const mile = 6076 / CanvasApproach.FACTOR;
            const xOffset = (this.airport.coordinates.x % 1) * -mile;
            const yOffset = (this.airport.coordinates.y % 1) * -mile;
            for (let i = -2; i <= 2; i++) {
                if (yOffset + i * mile > -yCenter) {
                    t.line(-xCenter, yOffset + i * mile, xCenter, yOffset + i * mile).stroke();
                }
                t.line(xOffset + i * mile, -yCenter, xOffset + i * mile, yCenter).stroke();
            }
        }
        this.airport.runways.forEach((runway) => {
            t.rotate(0, 0, runway.heading.degree - 90);
            const runwayX = runway.length / CanvasApproach.FACTOR;
            const runwayY = runway.width / CanvasApproach.FACTOR;
            t.style(this.colors.grey, this.colors.grey, 50 / CanvasApproach.FACTOR);
            t.polygonRaw([
                [runwayX / 2.1, runwayY / 2],
                [runwayX / 2.1, runwayY / 2 + 100 / CanvasApproach.FACTOR],
                [runwayX / 2.1 - 100 / CanvasApproach.FACTOR, runwayY / 2 + 200 / CanvasApproach.FACTOR],
                [runwayX / -2.1 + 100 / CanvasApproach.FACTOR, runwayY / 2 + 200 / CanvasApproach.FACTOR],
                [runwayX / -2.1, runwayY / 2 + 100 / CanvasApproach.FACTOR],
                [runwayX / -2.1, runwayY / 2],
            ]).stroke();
            t.fillRect(runwayX / -4, runwayY / 2 + 200 / CanvasApproach.FACTOR, runwayX / 2, 150 / CanvasApproach.FACTOR);
            const extraExits = Math.floor(runway.length / 1000);
            if (extraExits > 1) {
                const exitSpacing = runway.length / extraExits / CanvasApproach.FACTOR;
                for (let i = 1; i < extraExits; i++) {
                    t.line(runwayX / 2 - i * exitSpacing, runwayY / 2, runwayX / 2 - i * exitSpacing, runwayY / 2 + 200 / CanvasApproach.FACTOR).stroke();
                }
            }
            t.style(this.colors.black);
            t.fillRect(runwayX / -2, runwayY / -2, runwayX, runwayY);
            [0, 1].forEach((i) => {
                t.textStyle(4);
                const multiplier = (i === 0) ? 1 : -1;
                const posY = runwayX / 2;
                const deg = (i === 0) ? runway.heading.degree : runway.heading.oppositeDegree;
                t.rotate(0, 0, multiplier * -90);
                if (runway.slopeIndicators.get(i)) {
                    this.makeLight(-5, posY - 3, t, runway.slopeIndicators.get(i));
                }
                if (runway.approachLights.get(i)) {
                    const approachLight = runway.approachLights.get(i);
                    this.makeApproach(0, posY, t, approachLight);
                    this.makeLight(0, posY + (approachLight !== Runway.ODALS ? 2000 : 1000) / CanvasApproach.FACTOR, t, approachLight);
                }
                t.style(this.colors.black);
                t.textStyle(4);
                t.text(0, posY + 6, CanvasTool.numPad(Math.round(deg / 10), 2), CanvasApproach.OUTLINE);
                t.rotate(0, 0, multiplier * 90);
            });
            t.textStyle(4);
            const invers = runway.heading.isBetween(180, 0);
            if (invers) {
                t.rotate(0, 0, 180);
            }
            t.text(0, invers ? 5.5 : -2.5, String(runway.length) + ' × ' + String(runway.width), CanvasApproach.OUTLINE);
            t.reset();
        });
    }
    // @see https://www.euroga.org/system/1/user_files/files/000/017/859/17859/1d13e220b/large/IMG_0075.PNG
    // @see https://www.flightlearnings.com/wp-content/uploads/2017/07/8-22a.jpg
    makeLight(x, y, t, label) {
        const pilotControlledLight = !this.airport.hasTower;
        t.textStyle(4);
        t.style(pilotControlledLight ? this.colors.black : this.colors.white, pilotControlledLight ? this.colors.white : this.colors.black, 0.5);
        t.circle(x, y, 3).fill();
        this.ctx.stroke();
        t.style(pilotControlledLight ? this.colors.white : this.colors.black, pilotControlledLight ? this.colors.white : this.colors.black, 0.25);
        switch (label) {
            case Runway.ALSF1:
            case Runway.MALSR:
                t.textStyle(4, 'right');
                t.text(x + 0.35, y + 1.4, 'A');
                t.textStyle(3, 'left');
                t.text(x + 0.35, y + 1.4, label === Runway.ALSF1 ? '1' : '5');
                break;
            case Runway.ODALS:
                t.circle(x, y, 1).stroke();
                t.line(x, y + 1, x, y + 3).stroke();
                t.line(x, y - 1, x, y - 3).stroke();
                t.line(x + 1, y, x + 3, y).stroke();
                t.line(x - 1, y, x - 3, y).stroke();
                break;
            default:
                t.text(x, y + 1.5, label.slice(0, 1));
                break;
        }
        if (label !== Runway.PAPI && label !== Runway.VASI) {
            t.style(this.colors.black, this.colors.white, 0.2);
            t.circle(x, y - 2.9, 1).fill();
            this.ctx.stroke();
        }
    }
    makeApproach(x, y, t, label) {
        t.style(this.colors.blackTransparent);
        t.lineWidth = 0.5;
        t.line(x, y + 1, x, y + (label === Runway.ODALS ? 1500 : 2500) / CanvasApproach.FACTOR).stroke();
        if (label !== Runway.ODALS) {
            t.line(x - 200 / CanvasApproach.FACTOR, y + 1, x + 200 / CanvasApproach.FACTOR, y + 1).stroke();
            t.line(x - 100 / CanvasApproach.FACTOR, y + 1000 / CanvasApproach.FACTOR, x + 100 / CanvasApproach.FACTOR, y + 1000 / CanvasApproach.FACTOR).stroke();
        }
        if (label === Runway.ALSF1) {
            t.line(x - 100 / CanvasApproach.FACTOR, y + 1, x - 100 / CanvasApproach.FACTOR, y + 1000 / CanvasApproach.FACTOR).stroke();
            t.line(x + 100 / CanvasApproach.FACTOR, y + 1, x + 100 / CanvasApproach.FACTOR, y + 1000 / CanvasApproach.FACTOR).stroke();
        }
    }
    getNewCanvasTool(x, y) {
        const t = new CanvasTool(this.ctx, x, y, this.multiplier);
        t.style(this.colors.black, this.colors.black, 0.5);
        return t;
    }
}
CanvasApproach.OUTLINE = 1;
CanvasApproach.FACTOR = 75;
