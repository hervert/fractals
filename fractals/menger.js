// Menger Sponge Fractal (2D cross-section)

FractalViewer.prototype.generateMengerSponge = function(depth) {
    const squares = [];
    this.subdivideMengerSquare(0, 0, 0.8, depth, squares);
    return squares;
};

FractalViewer.prototype.subdivideMengerSquare = function(x, y, size, depth, squares) {
    if (depth === 0) {
        squares.push({ x, y, size });
        return;
    }

    const newSize = size / 3;

    // Divide into 9 squares, skip the middle one
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            // Skip center square
            if (i === 1 && j === 1) continue;

            const newX = x + (i - 1) * newSize;
            const newY = y + (j - 1) * newSize;
            this.subdivideMengerSquare(newX, newY, newSize, depth - 1, squares);
        }
    }
};

FractalViewer.prototype.renderMenger = function() {
    const depth = Math.min(Math.floor(this.maxIterations / 10), 7);
    const squares = this.generateMengerSponge(depth);

    this.ctx.fillStyle = '#9370DB';
    this.ctx.strokeStyle = '#8A2BE2';
    this.ctx.lineWidth = 1;

    for (const square of squares) {
        const x1 = this.worldToScreenX(square.x - square.size / 2);
        const y1 = this.worldToScreenY(square.y - square.size / 2);
        const x2 = this.worldToScreenX(square.x + square.size / 2);
        const y2 = this.worldToScreenY(square.y + square.size / 2);

        const width = x2 - x1;
        const height = y2 - y1;

        this.ctx.fillRect(x1, y1, width, height);
        this.ctx.strokeRect(x1, y1, width, height);
    }
};
