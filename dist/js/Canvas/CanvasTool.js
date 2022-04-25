export default class CanvasTool {
    constructor(ctx, x, y, multiplier) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.multiplier = multiplier;
    }
    dX(x = 0) {
        return this.dD(this.x + x);
    }
    dY(y = 0) {
        return this.dD(this.y + y);
    }
    dD(d) {
        return d * this.multiplier;
    }
    style(fillStyle, strokeStyle = '', lineWidth = 0.1) {
        this.ctx.fillStyle = fillStyle;
        this.ctx.strokeStyle = strokeStyle || fillStyle;
        this.lineWidth = lineWidth;
        return this.ctx;
    }
    set lineWidth(lineWidth) {
        this.ctx.lineWidth = lineWidth * this.multiplier;
    }
    get lineWidth() {
        return this.ctx.lineWidth / this.multiplier;
    }
    textStyle(fontSize = 0.5, textAlign = 'center') {
        this.ctx.font = this.dD(fontSize) + 'px sans-serif';
        this.ctx.textAlign = textAlign;
        return this.ctx;
    }
    setLineDash(dashes) {
        this.ctx.setLineDash(dashes.map((v) => {
            return this.dD(v);
        }));
        return this.ctx;
    }
    text(x, y, text) {
        this.ctx.fillText(text, this.dX(x), this.dY(y));
        return this.ctx;
    }
    textMultiline(x, y, textLines, outline = true, lineSpacing = 0.55) {
        const oldStrokeStyle = this.ctx.strokeStyle;
        const oldLineWidth = this.ctx.lineWidth;
        this.ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        this.lineWidth = 0.1;
        textLines.forEach((text, i) => {
            if (outline) {
                this.ctx.strokeText(text, this.dX(x), this.dY(y + i * lineSpacing));
            }
            this.ctx.fillText(text, this.dX(x), this.dY(y + i * lineSpacing));
        });
        this.ctx.strokeStyle = oldStrokeStyle;
        this.ctx.lineWidth = oldLineWidth;
        return this.ctx;
    }
    circle(x, y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(this.dX(x), this.dY(y), this.dD(radius), 0, Math.PI * 2, true);
        this.ctx.closePath();
        return this.ctx;
    }
    rect(x, y, width, height) {
        this.ctx.rect(this.dX(x), this.dY(y), this.dD(width), this.dD(height));
        return this.ctx;
    }
    fillRect(x, y, width, height) {
        this.ctx.fillRect(this.dX(x), this.dY(y), this.dD(width), this.dD(height));
        return this.ctx;
    }
    strokeRect(x, y, width, height) {
        this.ctx.strokeRect(this.dX(x), this.dY(y), this.dD(width), this.dD(height));
        return this.ctx;
    }
    line(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.dX(x1), this.dY(y1));
        this.ctx.lineTo(this.dX(x2), this.dY(y2));
        this.ctx.closePath();
        return this.ctx;
    }
    /**
     * Draw a closed polygon.
     * @param points an array with point arrays.
     *  If there are two coordinates, it will be treated as straight line.
     *  If there are six coordinates, it will be treaded as bezier curve.
     * @returns the drawing context
     */
    polygon(points) {
        this.ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) {
                this.ctx.moveTo(this.dX(point[0]), this.dY(point[1]));
            }
            else if (point.length === 6) {
                this.ctx.bezierCurveTo(this.dX(point[0]), this.dY(point[1]), this.dX(point[2]), this.dY(point[3]), this.dX(point[4]), this.dY(point[5]));
            }
            else {
                this.ctx.lineTo(this.dX(point[0]), this.dY(point[1]));
            }
        });
        this.ctx.closePath();
        return this.ctx;
    }
    rotate(x, y, angle) {
        this.ctx.translate(this.dX(x), this.dY(y));
        this.ctx.rotate(angle * Math.PI / 180);
        this.ctx.translate(-this.dX(x), -this.dY(y));
        return this.ctx;
    }
    reset() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        return this.ctx;
    }
    static numPad(text, targetLength) {
        return String(text).padStart(targetLength, '0');
    }
    static frequency(frequency) {
        return frequency.toFixed(2);
    }
}
//# sourceMappingURL=CanvasTool.js.map