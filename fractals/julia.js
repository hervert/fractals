// Julia Set Fractal

FractalViewer.prototype.julia = function(zx, zy) {
    let x = zx;
    let y = zy;
    let iteration = 0;

    while (x * x + y * y <= 4 && iteration < this.maxIterations) {
        const xtemp = x * x - y * y + this.juliaReal;
        y = 2 * x * y + this.juliaImag;
        x = xtemp;
        iteration++;
    }

    // For continuous coloring, add smooth component
    if (iteration < this.maxIterations) {
        const log_zn = Math.log(x * x + y * y) / 2;
        const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
        iteration = iteration + 1 - nu;
    }

    return iteration;
};

FractalViewer.prototype.renderJulia = async function() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;
    const scale = 3.5 / (this.zoom * width);
    const chunkSize = 20;

    for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
            const zx = this.centerX + (px - width / 2) * scale;
            const zy = this.centerY + (py - height / 2) * scale;

            const iteration = this.julia(zx, zy);
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
