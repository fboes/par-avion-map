import CanvasTool from "./CanvasTool.js";
export default class CanvasDisplay {
    constructor(canvas) {
        this.canvas = canvas;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("No CanvasRenderingContext2D found");
        }
        this.canvas.width = Math.max(128, this.canvas.clientWidth * window.devicePixelRatio);
        this.canvas.height = this.canvas.width;
        this.multiplier = this.canvas.width / 256;
        this.ctx = ctx;
        this.ctx.scale(this.multiplier, this.multiplier);
    }
    draw() {
        const t = new CanvasTool(this.ctx, 128, 128, this.multiplier);
        this.ctx.clearRect(-128, -128, 256, 256);
        t.style('black').globalAlpha = 0.8;
        this.ctx.fillRect(-128, -128, 256, 256);
        t.style('white', 'white', 2);
    }
}
