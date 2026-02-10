// Burning Ship Fractal

FractalViewer.prototype.burningShip = function(cx, cy) {
    let x = 0;
    let y = 0;
    let iteration = 0;

    while (x * x + y * y <= 4 && iteration < this.maxIterations) {
        // Key difference: take absolute value before squaring
        x = Math.abs(x);
        y = Math.abs(y);
        const xtemp = x * x - y * y + cx;
        y = 2 * x * y + cy;
        x = xtemp;
        iteration++;
    }

    // For continuous coloring
    if (iteration < this.maxIterations) {
        const log_zn = Math.log(x * x + y * y) / 2;
        const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
        iteration = iteration + 1 - nu;
    }

    return iteration;
};

FractalViewer.prototype.renderBurningShip = async function() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;
    const scale = 3.5 / (this.zoom * width);
    const chunkSize = 20;

    for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
            const x0 = this.centerX + (px - width / 2) * scale;
            const y0 = this.centerY + (py - height / 2) * scale;

            const iteration = this.burningShip(x0, y0);
            const [r, g, b] = this.getColor(iteration);

            const index = (py * width + px) * 4;
            data[index] = r;
            data[index + 1] = g;
            data[index + 2] = b;
            data[index + 3] = 255;
        }

        if (py % chunkSize === 0) {
            const progress = (py / height) * 100;
            this.updateProgress(progress);
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    this.updateProgress(100);
    this.ctx.putImageData(imageData, 0, 0);
};
