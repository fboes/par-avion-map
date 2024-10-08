import CanvasTool from "./CanvasTool.js";
export default class CanvasMapLog {
    constructor(canvas, plane, map) {
        this.canvas = canvas;
        this.plane = plane;
        this.map = map;
        this.showLog = false;
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
        const altitudeMulti = 0.005;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = "black";
        this.ctx.fillStyle = "white";
        this.ctx.lineCap = "round";
        this.ctx.globalAlpha = 1;
        if (this.showLog) {
            this.plane.flightLog.coordinates.forEach((c) => {
                let t = new CanvasTool(this.ctx, c.coordinates.x * this.multiplier, c.coordinates.y * this.multiplier, 1);
                this.ctx.lineWidth = 4;
                this.ctx.beginPath();
                t.lineRaw(0, 3, 0, c.altAglFt ? -c.altAglFt * altitudeMulti : 0).stroke();
                this.ctx.lineWidth = 0.25;
                t.circle(0, c.altAglFt ? -c.altAglFt * altitudeMulti : 0, 2).fill();
                this.ctx.stroke;
            });
        }
        const PlaneCoords = [
            [2, -7.5],
            [1.1, -7.8],
            [0, -9],
            [-1.1, -7.8],
            [-2, -7.5],
            [-2.1, -3],
            [-10.2, -2],
            [-10, 2],
            [-2, 2],
            [-0.8, 9],
            [-5.2, 9.5],
            [-5, 12.5],
            [0, 12],
            [5, 12.5],
            [5.2, 9.5],
            [0.8, 9],
            [2, 2],
            [10, 2],
            [10.2, -2],
            [2.1, -3],
        ];
        const alpha = this.showLog ? 1 : this.getAlpha();
        let t = this.getCanvasTool();
        t.rotate(0, 0, this.plane.hsi.heading.degree);
        t.style("black", "black");
        this.ctx.globalAlpha = alpha;
        t.polygon(PlaneCoords).fill();
        t = this.getCanvasTool(this.plane.altAglFt ? -this.plane.altAglFt * altitudeMulti : -2);
        t.rotate(0, 0, this.plane.hsi.heading.degree);
        t.style(this.plane.isBroken ? "red" : "white", "black", 0.25);
        this.ctx.globalAlpha = alpha;
        t.polygon(PlaneCoords).fill();
        this.ctx.stroke();
        t.reset();
    }
    getAlpha() {
        const maxVisDistNm = 3;
        let distance = maxVisDistNm;
        this.map.airports.forEach((airport) => {
            distance = Math.min(distance, airport.coordinates.getDistance(this.plane.coordinates));
        });
        return Math.min(1, Math.max(0, 1 - distance / maxVisDistNm));
    }
    getCanvasTool(offset = 0) {
        return new CanvasTool(this.ctx, this.plane.coordinates.x * this.multiplier, this.plane.coordinates.y * this.multiplier + offset, 1);
    }
}
