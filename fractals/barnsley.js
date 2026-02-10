// Barnsley Fern Fractal

class BarnsleyFractal {
    constructor(viewer) {
        this.viewer = viewer;
    }

    generate(iterations) {
        const points = [];
        let x = 0, y = 0;

        for (let i = 0; i < iterations; i++) {
            const r = Math.random();
            let nextX, nextY;

            if (r < 0.01) {
                // Stem
                nextX = 0;
                nextY = 0.16 * y;
            } else if (r < 0.86) {
                // Successively smaller leaflets
                nextX = 0.85 * x + 0.04 * y;
                nextY = -0.04 * x + 0.85 * y + 1.6;
            } else if (r < 0.93) {
                // Largest left-hand leaflet
                nextX = 0.2 * x - 0.26 * y;
                nextY = 0.23 * x + 0.22 * y + 1.6;
            } else {
                // Largest right-hand leaflet
                nextX = -0.15 * x + 0.28 * y;
                nextY = 0.26 * x + 0.24 * y + 0.44;
            }

            x = nextX;
            y = nextY;

            // Skip first few iterations (transient behavior)
            if (i > 20) {
                points.push([x / 11, y / 11 - 0.5]); // Normalize to fit view
            }
        }

        return points;
    }

    async render() {
        // Yield initially to allow progress UI to show
        await new Promise(resolve => setTimeout(resolve, 0));

        const iterations = Math.min(this.viewer.maxIterations * 1000, 100000);
        const points = this.generate(iterations);

        this.viewer.updateProgress(50);

        this.viewer.ctx.fillStyle = '#00FF00';

        for (let i = 0; i < points.length; i++) {
            const [wx, wy] = points[i];
            const sx = this.viewer.worldToScreenX(wx);
            const sy = this.viewer.worldToScreenY(wy);

            this.viewer.ctx.fillRect(sx, sy, 1, 1);

            // Yield periodically to keep UI responsive
            if (i % 5000 === 0) {
                const progress = 50 + (i / points.length) * 50;
                this.viewer.updateProgress(progress);
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        this.viewer.updateProgress(100);
    }
}
