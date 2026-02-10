// Koch Snowflake Fractal

FractalViewer.prototype.kochSegment = function(x1, y1, x2, y2, depth) {
    if (depth === 0) {
        return [[x1, y1], [x2, y2]];
    }

    const dx = x2 - x1;
    const dy = y2 - y1;

    // First third point
    const px1 = x1 + dx / 3;
    const py1 = y1 + dy / 3;

    // Second third point
    const px2 = x1 + 2 * dx / 3;
    const py2 = y1 + 2 * dy / 3;

    // Peak point (equilateral triangle)
    const angle = Math.PI / 3; // 60 degrees
    const px3 = px1 + (px2 - px1) * Math.cos(angle) - (py2 - py1) * Math.sin(angle);
    const py3 = py1 + (px2 - px1) * Math.sin(angle) + (py2 - py1) * Math.cos(angle);

    // Recursively generate segments
    const seg1 = this.kochSegment(x1, y1, px1, py1, depth - 1);
    const seg2 = this.kochSegment(px1, py1, px3, py3, depth - 1);
    const seg3 = this.kochSegment(px3, py3, px2, py2, depth - 1);
    const seg4 = this.kochSegment(px2, py2, x2, y2, depth - 1);

    // Concatenate all segments
    const result = seg1.slice(0, -1)
        .concat(seg2.slice(0, -1))
        .concat(seg3.slice(0, -1))
        .concat(seg4);

    return result;
};

FractalViewer.prototype.generateKochSnowflake = function(depth) {
    // Equilateral triangle vertices
    const size = 0.8;
    const height = size * Math.sqrt(3) / 2;

    const v1 = [-size / 2, height / 3];
    const v2 = [size / 2, height / 3];
    const v3 = [0, -2 * height / 3];

    // Generate each side of the snowflake
    const side1 = this.kochSegment(v1[0], v1[1], v2[0], v2[1], depth);
    const side2 = this.kochSegment(v2[0], v2[1], v3[0], v3[1], depth);
    const side3 = this.kochSegment(v3[0], v3[1], v1[0], v1[1], depth);

    // Concatenate all sides
    return side1.slice(0, -1)
        .concat(side2.slice(0, -1))
        .concat(side3.slice(0, -1));
};

FractalViewer.prototype.renderKoch = function() {
    const depth = Math.min(Math.floor(this.maxIterations / 10), 9);
    const points = this.generateKochSnowflake(depth);

    // Transform points to screen coordinates
    this.ctx.strokeStyle = '#00BFFF';
    this.ctx.lineWidth = 1.5;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';

    this.ctx.beginPath();

    for (let i = 0; i < points.length; i++) {
        const [wx, wy] = points[i];
        const sx = this.worldToScreenX(wx);
        const sy = this.worldToScreenY(wy);

        if (i === 0) {
            this.ctx.moveTo(sx, sy);
        } else {
            this.ctx.lineTo(sx, sy);
        }
    }

    this.ctx.closePath();
    this.ctx.stroke();

    // Fill the snowflake
    this.ctx.fillStyle = 'rgba(0, 191, 255, 0.1)';
    this.ctx.fill();
};
