export default class Circle {
    constructor(ctx, t, point, radius) {
        ctx.beginPath();
        ctx.arc(t.dX(point[0]), t.dY(point[1]), t.dD(radius), 0, Math.PI * 2, true);
    }
}
//# sourceMappingURL=Circle.js.map