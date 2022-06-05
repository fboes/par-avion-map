import Plane from "../Plane/Plane";
import CanvasDisplay from "./CanvasDisplay.js";

export default class CanvasSixPack extends CanvasDisplay {

  constructor(protected canvas: HTMLCanvasElement, public plane: Plane) {
    super(canvas);
    this.draw();
  }
}
