// Sierpinski Triangle Fractal

class SierpinskiFractal {
    constructor(viewer) {
        this.viewer = viewer;
    }

    subdivideTriangle(v1, v2, v3, depth, triangles) {
        if (depth === 0) {
            triangles.push([v1, v2, v3]);
            return;
        }

        // Midpoints
        const m1 = [(v1[0] + v2[0]) / 2, (v1[1] + v2[1]) / 2];
        const m2 = [(v2[0] + v3[0]) / 2, (v2[1] + v3[1]) / 2];
        const m3 = [(v3[0] + v1[0]) / 2, (v3[1] + v1[1]) / 2];

        // Recursively subdivide the three outer triangles
        this.subdivideTriangle(v1, m1, m3, depth - 1, triangles);
        this.subdivideTriangle(m1, v2, m2, depth - 1, triangles);
        this.subdivideTriangle(m3, m2, v3, depth - 1, triangles);
    }

    generate(depth) {
        const triangles = [];
        const size = 0.8;
        const height = size * Math.sqrt(3) / 2;

        // Initial triangle
        const v1 = [-size / 2, height / 3];
        const v2 = [size / 2, height / 3];
        const v3 = [0, -2 * height / 3];

        this.subdivideTriangle(v1, v2, v3, depth, triangles);
        return triangles;
    }

    render() {
        const depth = Math.min(Math.floor(this.viewer.maxIterations / 10), 10);
        const triangles = this.generate(depth);

        // Draw all triangles
        this.viewer.ctx.fillStyle = '#FF1493';
        this.viewer.ctx.strokeStyle = '#FF69B4';
        this.viewer.ctx.lineWidth = 0.5;

        for (const triangle of triangles) {
            this.viewer.ctx.beginPath();

            for (let i = 0; i < triangle.length; i++) {
                const [wx, wy] = triangle[i];
                const sx = this.viewer.worldToScreenX(wx);
                const sy = this.viewer.worldToScreenY(wy);

                if (i === 0) {
                    this.viewer.ctx.moveTo(sx, sy);
                } else {
                    this.viewer.ctx.lineTo(sx, sy);
                }
            }

            this.viewer.ctx.closePath();
            this.viewer.ctx.fill();
            this.viewer.ctx.stroke();
        }
    }
}
