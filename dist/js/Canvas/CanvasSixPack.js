import CanvasDisplay from "./CanvasDisplay.js";
export default class CanvasSixPack extends CanvasDisplay {
    constructor(canvas, plane) {
        super(canvas);
        this.canvas = canvas;
        this.plane = plane;
        this.draw();
    }
}
