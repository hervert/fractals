// Dragon Curve Fractal

FractalViewer.prototype.generateDragonCurve = function(depth) {
    let sequence = [1]; // Start with a single right turn

    // Build the dragon curve sequence
    for (let i = 0; i < depth; i++) {
        const newSequence = [...sequence];
        newSequence.push(1); // Add a right turn
        // Add reversed and flipped sequence
        for (let j = sequence.length - 1; j >= 0; j--) {
            newSequence.push(-sequence[j]);
        }
        sequence = newSequence;
    }

    // Convert sequence to points
    const points = [[0, 0]];
    let x = 0, y = 0;
    let direction = 0; // 0 = right, 1 = up, 2 = left, 3 = down
    const stepSize = 0.4 / Math.pow(Math.sqrt(2), depth);

    for (const turn of sequence) {
        direction = (direction + turn + 4) % 4;

        switch (direction) {
            case 0: x += stepSize; break; // right
            case 1: y -= stepSize; break; // up
            case 2: x -= stepSize; break; // left
            case 3: y += stepSize; break; // down
        }

        points.push([x, y]);
    }

    return points;
};

FractalViewer.prototype.renderDragon = function() {
    const depth = Math.min(Math.floor(this.maxIterations / 10), 16);
    const points = this.generateDragonCurve(depth);

    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 2;
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

    this.ctx.stroke();
};
