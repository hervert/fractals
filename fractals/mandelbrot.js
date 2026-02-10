// Mandelbrot Set Fractal

class MandelbrotFractal {
    constructor(viewer) {
        this.viewer = viewer;
    }

    calculate(cx, cy) {
        let x = 0;
        let y = 0;
        let iteration = 0;

        while (x * x + y * y <= 4 && iteration < this.viewer.maxIterations) {
            const xtemp = x * x - y * y + cx;
            y = 2 * x * y + cy;
            x = xtemp;
            iteration++;
        }

        // For continuous coloring, add smooth component
        if (iteration < this.viewer.maxIterations) {
            const log_zn = Math.log(x * x + y * y) / 2;
            const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
            iteration = iteration + 1 - nu;
        }

        return iteration;
    }

    async render() {
        // Try WebGL rendering first if available
        if (this.viewer.webglRenderer && this.viewer.webglRenderer.initialized) {
            const params = {
                width: this.viewer.canvas.width,
                height: this.viewer.canvas.height,
                centerX: this.viewer.centerX,
                centerY: this.viewer.centerY,
                zoom: this.viewer.zoom,
                maxIterations: this.viewer.maxIterations,
                colorScheme: this.viewer.colorScheme,
                color1: this.viewer.cosineBaseColor,
                color2: this.viewer.cosineAccentColor
            };

            const success = this.viewer.webglRenderer.render('mandelbrot', params);
            if (success) {
                // WebGL renders instantly, simulate progress for UI consistency
                this.viewer.updateProgress(100);
                return;
            }
        }

        // Fallback to Canvas2D rendering
        const width = this.viewer.canvas.width;
        const height = this.viewer.canvas.height;
        const imageData = this.viewer.ctx.createImageData(width, height);
        const data = imageData.data;
        const scale = 3.5 / (this.viewer.zoom * width);
        const chunkSize = 20;

        for (let py = 0; py < height; py++) {
            for (let px = 0; px < width; px++) {
                const x0 = this.viewer.centerX + (px - width / 2) * scale;
                const y0 = this.viewer.centerY + (py - height / 2) * scale;

                const iteration = this.calculate(x0, y0);
                const [r, g, b] = this.viewer.getColor(iteration);

                const index = (py * width + px) * 4;
                data[index] = r;
                data[index + 1] = g;
                data[index + 2] = b;
                data[index + 3] = 255;
            }

            if (py % chunkSize === 0) {
                const progress = (py / height) * 100;
                this.viewer.updateProgress(progress);
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        this.viewer.updateProgress(100);
        this.viewer.ctx.putImageData(imageData, 0, 0);
    }
}
