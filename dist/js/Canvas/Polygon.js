export default class Polygon {
    constructor(ctx, t, points) {
        ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(t.dX(point[0]), t.dY(point[1]));
            }
            else {
                ctx.lineTo(t.dX(point[0]), t.dY(point[1]));
            }
        });
    }
}
//# sourceMappingURL=Polygon.js.map