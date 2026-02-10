# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modular fractal visualization app with class-based architecture — no build system, no dependencies, no tests. Pure HTML/CSS/JavaScript rendered via Canvas 2D API.

## File Structure

```
index.htm           # Main HTML, FractalViewer class, UI controls, event handlers
style.css           # Separated stylesheet
fractals/           # Fractal implementations as ES6 classes
  mandelbrot.js     # MandelbrotFractal class
  julia.js          # JuliaFractal class
  burning-ship.js   # BurningShipFractal class
  koch.js           # KochFractal class
  sierpinski.js     # SierpinskiFractal class
  dragon.js         # DragonFractal class
  barnsley.js       # BarnsleyFractal class
  menger.js         # MengerFractal class
```

## Running

Open `index.htm` directly in a browser, or serve with any static file server (e.g., `python3 -m http.server`).

## Architecture

### FractalViewer (index.htm)

Main controller class instantiated on page load. Manages canvas, UI state, user interaction, and coordinates fractal rendering.

**Key responsibilities:**
- Canvas setup and coordinate transformations (`screenToWorld{X,Y}`, `worldToScreen{X,Y}`)
- User interaction (zoom box, pan, scroll, Julia click mode)
- Color schemes (11 total): `getColor<Name>(iteration)` methods returning `[r, g, b]`
- Progress tracking and UI updates
- Fractal class instantiation and lifecycle management

**Fractal instances:** In constructor, creates `this.fractals` object with all 8 fractal class instances, passing `this` (viewer) to each constructor. The `render()` method dispatches to `this.fractals.<type>.render()`.

### Fractal Classes (fractals/*.js)

Each fractal is an ES6 class that receives the FractalViewer instance in its constructor and stores it as `this.viewer`. All fractals implement a `render()` method.

**Escape-time fractals** (Mandelbrot, Julia, Burning Ship):
- `calculate(x, y)` — iteration function with smooth/continuous iteration count for anti-banding
- `async render()` — pixel-by-pixel rendering into `ImageData`, yields to event loop every 20 rows for progress updates

**Geometric fractals** (Koch, Sierpinski, Dragon, Barnsley, Menger):
- `generate(depth)` — recursive subdivision generating point/shape arrays
- `render()` — synchronous rendering with Canvas path API
- Depth derived from `viewer.maxIterations` with per-fractal divisors and caps

**Viewer access:** Fractals access viewer state via `this.viewer` (e.g., `this.viewer.maxIterations`, `this.viewer.canvas`, `this.viewer.getColor()`, `this.viewer.worldToScreenX()`).

### Key Concepts

- **Coordinate system**: Scale factor is `3.5 / (zoom * canvasWidth)`. Geometric fractals use world coordinates transformed to screen via `worldToScreen{X,Y}()`.
- **Iteration granularity**: All geometric fractals now use `/10` divisor for maxIterations, allowing visible changes every 10 iterations.
- **Color schemes**: 11 schemes with UI controls (cosine base/accent, HSL hue range, Bezier control points, complementary/triadic base hue, cubehelix rotations).
- **Interaction**: Left-drag for zoom box, right-drag to pan, scroll to zoom, double-click to center+zoom. Julia click mode lets you pick Mandelbrot points as Julia `c` parameters.
