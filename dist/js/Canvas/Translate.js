export default class Translate {
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
    circle(point, radius) {
        this.ctx.beginPath();
        this.ctx.arc(this.dX(point[0]), this.dY(point[1]), this.dD(radius), 0, Math.PI * 2, true);
    }
    polygon(points) {
        this.ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) {
                this.ctx.moveTo(this.dX(point[0]), this.dY(point[1]));
            }
            else {
                this.ctx.lineTo(this.dX(point[0]), this.dY(point[1]));
            }
        });
    }
    rotate(point, angle) {
        this.ctx.translate(this.dX(point[0]), this.dY(point[1]));
        this.ctx.rotate(angle * Math.PI / 180);
        this.ctx.translate(-this.dX(point[0]), -this.dY(point[1]));
    }
    reset() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}
//# sourceMappingURL=Translate.js.map