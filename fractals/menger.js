// Menger Sponge Fractal (2D cross-section)

class MengerFractal {
    constructor(viewer) {
        this.viewer = viewer;
    }

    subdivideSquare(x, y, size, depth, squares) {
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
                this.subdivideSquare(newX, newY, newSize, depth - 1, squares);
            }
        }
    }

    generate(depth) {
        const squares = [];
        this.subdivideSquare(0, 0, 0.8, depth, squares);
        return squares;
    }

    render() {
        const depth = Math.min(Math.floor(this.viewer.maxIterations / 10), 7);
        const squares = this.generate(depth);

        this.viewer.ctx.fillStyle = '#9370DB';
        this.viewer.ctx.strokeStyle = '#8A2BE2';
        this.viewer.ctx.lineWidth = 1;

        for (const square of squares) {
            const x1 = this.viewer.worldToScreenX(square.x - square.size / 2);
            const y1 = this.viewer.worldToScreenY(square.y - square.size / 2);
            const x2 = this.viewer.worldToScreenX(square.x + square.size / 2);
            const y2 = this.viewer.worldToScreenY(square.y + square.size / 2);

            const width = x2 - x1;
            const height = y2 - y1;

            this.viewer.ctx.fillRect(x1, y1, width, height);
            this.viewer.ctx.strokeRect(x1, y1, width, height);
        }
    }
}
