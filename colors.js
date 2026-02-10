// Color scheme methods for FractalViewer

FractalViewer.prototype.getColor = function(iteration) {
    if (iteration >= this.maxIterations) {
        return [0, 0, 0];
    }

    switch(this.colorScheme) {
        case 'default':
            return this.getColorDefault(iteration);
        case 'cosine':
            return this.getColorCosine(iteration);
        case 'continuous':
            return this.getColorContinuous(iteration);
        case 'hsl':
            return this.getColorHSL(iteration);
        case 'golden':
            return this.getColorGolden(iteration);
        case 'cubehelix':
            return this.getColorCubehelix(iteration);
        case 'grayscale':
            return this.getColorGrayscale(iteration);
        case 'bezier':
            return this.getColorBezier(iteration);
        case 'complementary':
            return this.getColorComplementary(iteration);
        case 'triadic':
            return this.getColorTriadic(iteration);
        case 'stripe':
            return this.getColorStripe(iteration);
        default:
            return this.getColorDefault(iteration);
    }
};

FractalViewer.prototype.getColorDefault = function(iteration) {
    // Original polynomial coloring
    const t = iteration / this.maxIterations;
    const r = Math.floor(9 * (1 - t) * t * t * t * 255);
    const g = Math.floor(15 * (1 - t) * (1 - t) * t * t * 255);
    const b = Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255);
    return [r, g, b];
};

FractalViewer.prototype.getColorCosine = function(iteration) {
    // Cosine gradient using user-selected base and accent colors
    const t = iteration / this.maxIterations;

    // Convert user colors to normalized values (0-1 range)
    const base = {
        r: this.cosineBaseColor.r / 255,
        g: this.cosineBaseColor.g / 255,
        b: this.cosineBaseColor.b / 255
    };

    const accent = {
        r: this.cosineAccentColor.r / 255,
        g: this.cosineAccentColor.g / 255,
        b: this.cosineAccentColor.b / 255
    };

    // Calculate midpoint and amplitude for cosine function
    // a = midpoint between base and accent
    // b = half the distance between them (amplitude)
    const a = [
        (base.r + accent.r) / 2,
        (base.g + accent.g) / 2,
        (base.b + accent.b) / 2
    ];

    const b = [
        (accent.r - base.r) / 2,
        (accent.g - base.g) / 2,
        (accent.b - base.b) / 2
    ];

    // Use cosine function with configurable frequency
    const c = [1.0, 1.0, 1.0]; // Frequency
    const d = [0.0, 0.33, 0.67]; // Phase shift for each channel

    const r = Math.floor(255 * (a[0] + b[0] * Math.cos(2 * Math.PI * (c[0] * t + d[0]))));
    const g = Math.floor(255 * (a[1] + b[1] * Math.cos(2 * Math.PI * (c[1] * t + d[1]))));
    const b_val = Math.floor(255 * (a[2] + b[2] * Math.cos(2 * Math.PI * (c[2] * t + d[2]))));

    return [
        Math.max(0, Math.min(255, r)),
        Math.max(0, Math.min(255, g)),
        Math.max(0, Math.min(255, b_val))
    ];
};

FractalViewer.prototype.getColorContinuous = function(iteration) {
    // Continuous coloring using smooth iteration count
    // Slower hue cycling and modulated saturation/lightness for smoother appearance

    // Slow down the hue change significantly
    const hue = (iteration * 3) % 360;

    // Vary saturation and lightness based on iteration for depth
    // This creates more organic, less jarring transitions
    const saturation = 70 + 30 * Math.sin(iteration * 0.1);
    const lightness = 40 + 20 * Math.cos(iteration * 0.15);

    return this.hslToRgb(hue, saturation, lightness);
};

FractalViewer.prototype.hslToRgb = function(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

FractalViewer.prototype.getColorHSL = function(iteration) {
    // HSL interpolation with customizable start and end hues
    const t = iteration / this.maxIterations;
    const hue = this.hslStartHue + (this.hslEndHue - this.hslStartHue) * t;
    const saturation = 80;
    const lightness = 50;
    return this.hslToRgb(hue, saturation, lightness);
};

FractalViewer.prototype.getColorGolden = function(iteration) {
    // Golden ratio based hue distribution
    const phi = 1.618033988749895; // Golden ratio
    const hue = (iteration * phi * 137.508) % 360; // Golden angle
    const saturation = 70;
    const lightness = 50;
    return this.hslToRgb(hue, saturation, lightness);
};

FractalViewer.prototype.getColorCubehelix = function(iteration) {
    // Cubehelix color scheme with customizable rotations
    const t = iteration / this.maxIterations;
    const start = 0.5; // Start hue
    const hue = 360 * (start / 3 + this.cubehelixRotations * t);
    const saturation = 50 + 50 * t;
    const lightness = 20 + 60 * t; // Monotonically increasing
    return this.hslToRgb(hue, saturation, lightness);
};

FractalViewer.prototype.getColorGrayscale = function(iteration) {
    // Simple grayscale with smooth gradation
    const t = iteration / this.maxIterations;
    const intensity = Math.floor(255 * Math.sqrt(t));
    return [intensity, intensity, intensity];
};

FractalViewer.prototype.getColorBezier = function(iteration) {
    // Bezier curve interpolation through customizable RGB control points
    const t = iteration / this.maxIterations;

    const p0 = this.bezierColors[0];
    const p1 = this.bezierColors[1];
    const p2 = this.bezierColors[2];
    const p3 = this.bezierColors[3];

    // Cubic Bezier interpolation
    const s = 1 - t;
    const r = s*s*s * p0.r + 3*s*s*t * p1.r + 3*s*t*t * p2.r + t*t*t * p3.r;
    const g = s*s*s * p0.g + 3*s*s*t * p1.g + 3*s*t*t * p2.g + t*t*t * p3.g;
    const b = s*s*s * p0.b + 3*s*s*t * p1.b + 3*s*t*t * p2.b + t*t*t * p3.b;

    return [Math.floor(r), Math.floor(g), Math.floor(b)];
};

FractalViewer.prototype.getColorComplementary = function(iteration) {
    // Complementary color harmony with customizable base hue
    const t = iteration / this.maxIterations;
    // Oscillate between complementary colors
    const hue = t < 0.5 ? this.complementaryHue : (this.complementaryHue + 180) % 360;
    const saturation = 80;
    const lightness = 40 + 20 * Math.sin(t * Math.PI * 4);
    return this.hslToRgb(hue, saturation, lightness);
};

FractalViewer.prototype.getColorTriadic = function(iteration) {
    // Triadic color harmony with customizable base hue
    const t = iteration / this.maxIterations;
    let hue;
    if (t < 0.33) {
        hue = this.triadicHue;
    } else if (t < 0.66) {
        hue = (this.triadicHue + 120) % 360;
    } else {
        hue = (this.triadicHue + 240) % 360;
    }
    const saturation = 70;
    const lightness = 45 + 15 * Math.sin(t * Math.PI * 6);
    return this.hslToRgb(hue, saturation, lightness);
};

FractalViewer.prototype.getColorStripe = function(iteration) {
    // Stripe averaging effect - creates interesting banding
    const t = iteration / this.maxIterations;
    // Create color bands with smooth transitions
    const bands = 8;
    const bandIndex = Math.floor(t * bands);
    const bandT = (t * bands) - bandIndex;

    const hue = (bandIndex * 45) % 360;
    const saturation = 70 + 20 * Math.sin(bandT * Math.PI);
    const lightness = 40 + 20 * bandT;

    return this.hslToRgb(hue, saturation, lightness);
};

FractalViewer.prototype.hexToRgb = function(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 128, g: 128, b: 255 };
};
