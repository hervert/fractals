# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modular fractal visualization app with class-based architecture — no build system, no dependencies, no tests. Pure HTML/CSS/JavaScript rendered via Canvas 2D API.

## File Structure

```
index.htm           # HTML markup and UI controls only
style.css           # All styling
viewer.js           # FractalViewer class (main controller)
colors.js           # Color scheme methods (added to FractalViewer.prototype)
webgl-renderer.js   # WebGL shader-based GPU renderer
decimal.min.js      # Decimal.js library for arbitrary precision math
fractals/           # Fractal implementations as ES6 classes
  mandelbrot.js     # MandelbrotFractal class (escape-time, async, WebGL + high precision)
  julia.js          # JuliaFractal class (escape-time, async, WebGL + high precision)
  burning-ship.js   # BurningShipFractal class (escape-time, async, WebGL + high precision)
  koch.js           # KochFractal class (geometric, async)
  sierpinski.js     # SierpinskiFractal class (geometric, async)
  dragon.js         # DragonFractal class (geometric, async)
  barnsley.js       # BarnsleyFractal class (geometric, async)
  menger.js         # MengerFractal class (geometric, async)
```

**IMPORTANT: Script Loading Order**
Scripts must load in this exact order:
1. `decimal.min.js` - Decimal.js library (for arbitrary precision)
2. `viewer.js` - Defines FractalViewer class
3. `colors.js` - Adds color methods to FractalViewer.prototype
4. `webgl-renderer.js` - WebGL renderer (uses FractalViewer context)
5. `fractals/*.js` - Reference FractalViewer and WebGLRenderer in constructors

Loading colors.js before viewer.js will cause `ReferenceError: FractalViewer is not defined`.

## Running

Open `index.htm` directly in a browser, or serve with any static file server (e.g., `python3 -m http.server`).

## Architecture

### FractalViewer (viewer.js)

Main controller class instantiated on page load. Manages canvas, UI state, user interaction, and coordinates fractal rendering.

**Key responsibilities:**
- Canvas setup and coordinate transformations (`screenToWorld{X,Y}`, `worldToScreen{X,Y}`)
- User interaction (zoom box, pan, scroll, Julia click mode)
- Progress tracking and UI updates (`updateProgress()`)
- Fractal class instantiation and lifecycle management
- Event handling for all UI controls

**Fractal instances:** In constructor, creates `this.fractals` object with all 8 fractal class instances, passing `this` (viewer) to each constructor. The `render()` method dispatches to `this.fractals[this.fractalType].render()`.

### Color Schemes (colors.js)

Contains all color-related methods added to `FractalViewer.prototype`:
- `getColor(iteration)` - Main dispatcher that calls appropriate color scheme
- 11 color schemes: Default, Cosine, Continuous, HSL, Golden, Cubehelix, Grayscale, Bezier, Complementary, Triadic, Stripe
- Helper methods: `hslToRgb()`, `hexToRgb()`, `rgbToHex()`

Each color scheme method returns `[r, g, b]` array. Several have UI controls for customization.

### WebGL Renderer (webgl-renderer.js)

GPU-accelerated rendering engine for escape-time fractals:
- `WebGLRenderer` class manages WebGL context, shaders, and rendering
- Fragment shaders for Mandelbrot, Julia, and Burning Ship
- Computes iterations on GPU (10-100x faster than CPU)
- Supports default, cosine, and continuous color schemes in shaders
- Automatic WebGL capability detection with graceful fallback to Canvas2D
- Renders to full-screen quad with viewport-matched resolution

**Performance:** Enables real-time interaction even at 500+ iterations. WebGL renders are nearly instantaneous.

### Arbitrary Precision Math (decimal.min.js)

Decimal.js library for deep zoom capability:
- Enables zooms beyond IEEE 754 double precision limits (2^53)
- Automatically activates at zoom > 2^20 (~1 million)
- Each escape-time fractal has `calculateHighPrecision()` method
- Seamless switching between standard (fast) and arbitrary precision (deep zoom)
- Allows exploration of structures invisible at native precision (mini-Mandelbrots, deep details)

### Fractal Classes (fractals/*.js)

Each fractal is an ES6 class that receives the FractalViewer instance in its constructor and stores it as `this.viewer`. All fractals implement a `render()` method.

**Escape-time fractals** (Mandelbrot, Julia, Burning Ship):
- `calculate(x, y)` — standard iteration function with smooth/continuous iteration count
- `calculateHighPrecision(x, y)` — arbitrary precision iteration using Decimal.js (for zoom > 2^20)
- `async render()` — multi-path rendering:
  1. **WebGL path:** GPU-accelerated rendering via `viewer.webglRenderer` (preferred, instant)
  2. **Canvas2D path:** CPU pixel-by-pixel rendering with progress updates (fallback)
  3. **High precision mode:** Automatically uses Decimal.js for deep zooms
- Yields to event loop every 20 rows with granular progress (0-100%)

**Geometric fractals** (Koch, Sierpinski, Dragon, Barnsley, Menger):
- `generate(depth)` — recursive subdivision generating point/shape arrays
- `async render()` — asynchronous rendering with Canvas path API, updates progress (50% → 100%)
- Depth derived from `viewer.maxIterations` with per-fractal divisors and caps
- Barnsley fern yields every 5000 points with granular progress for long renders

**Viewer access:** Fractals access viewer state via `this.viewer` (e.g., `this.viewer.maxIterations`, `this.viewer.webglRenderer`, `this.viewer.getColor()`, `this.viewer.worldToScreenX()`).

### Key Concepts

- **Coordinate system**: Scale factor is `3.5 / (zoom * canvasWidth)`. Geometric fractals use world coordinates transformed to screen via `worldToScreen{X,Y}()`. High precision mode uses Decimal.js for coordinate calculations when zoom > 2^20.
- **Iteration granularity**: All geometric fractals use `/10` divisor for maxIterations, allowing visible changes every 10 iterations.
- **Color schemes**: 11 schemes with UI controls (cosine base/accent, HSL hue range, Bezier control points, complementary/triadic base hue, cubehelix rotations).
- **Interaction**: Left-drag for zoom box, right-drag to pan, scroll to zoom, double-click to center+zoom. Julia click mode lets you pick Mandelbrot points as Julia `c` parameters.
- **Performance tiers**:
  - **WebGL (fast):** GPU rendering, instant results, limited to ~1000 iterations
  - **Canvas2D (medium):** CPU rendering, progress updates, supports all features
  - **High precision (slow):** Arbitrary precision math for zoom > 2^20, necessary for deep exploration

## Advanced Features

### URL Sharing & Presets

Complete fractal state can be encoded in URL parameters and shared:
- **URL encoding:** All parameters (fractal type, position, zoom, iterations, color scheme, color parameters) encoded in query string
- **Browser history:** State changes push to history for back/forward navigation
- **Presets:** 13 curated beautiful locations accessible via dropdown menu
- **Copy Link:** One-click copy current state to clipboard with visual feedback

**URL format:** `?fractal=mandelbrot&cx=-0.5&cy=0&zoom=1&iter=100&color=default&...`

**Preset locations:**
- Mandelbrot: Overview, Seahorse Valley, Spiral, Elephant Valley, Triple Spiral, Mini Mandelbrot, Fibonacci Spiral
- Julia: Dendrite, Douady Rabbit, Dragon, San Marco
- Burning Ship: Overview, Detail

### Deep Zoom Capability

Arbitrary precision math enables exploration beyond native floating-point limits:
- **Automatic activation:** When zoom exceeds 2^20 (~1,048,576)
- **High Precision Mode indicator:** Visual UI indicator shows when active
- **Zoom depth display:** Real-time zoom level shown in scientific notation (e.g., "2.5e+8")
- **Performance impact:** Significantly slower than standard precision (~10-50x), but necessary for deep zooms
- **Precision method:** Uses Decimal.js for all coordinate and iteration calculations

**Use cases:** Discover mini-Mandelbrots, explore microscopic details, demonstrate floating-point limitations

### GPU Acceleration

WebGL shader-based rendering for escape-time fractals:
- **Detection:** Automatically attempts WebGL, falls back to Canvas2D if unavailable
- **Shader programs:** Custom fragment shaders for each fractal type
- **Performance:** 10-100x faster than CPU rendering, enables real-time interaction
- **Color support:** Default, Cosine, and Continuous color schemes implemented in shaders
- **Limitations:** Limited to ~1000 iterations (shader instruction limits), doesn't support arbitrary precision

**Rendering priority:** WebGL → Canvas2D → High Precision Canvas2D
