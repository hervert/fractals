// FractalViewer class

class FractalViewer {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        // Initialize WebGL renderer
        this.webglRenderer = new WebGLRenderer(this.canvas);
        if (this.webglRenderer.init()) {
            console.log('WebGL acceleration enabled');
        } else {
            console.log('WebGL not available, using Canvas2D fallback');
        }

        // Initialize fractal instances
        this.fractals = {
            mandelbrot: new MandelbrotFractal(this),
            julia: new JuliaFractal(this),
            burning_ship: new BurningShipFractal(this),
            koch: new KochFractal(this),
            sierpinski: new SierpinskiFractal(this),
            dragon: new DragonFractal(this),
            barnsley: new BarnsleyFractal(this),
            menger: new MengerFractal(this)
        };

        this.loading = document.getElementById('loading');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');

        // Fractal parameters
        this.fractalType = 'mandelbrot';
        this.centerX = -0.5;
        this.centerY = 0;
        this.zoom = 1;
        this.maxIterations = 100;
        this.colorScheme = 'default';

        // Click-to-Julia mode
        this.juliaClickMode = false;

        // Cosine gradient colors
        this.cosineBaseColor = { r: 128, g: 128, b: 255 }; // Purple-blue
        this.cosineAccentColor = { r: 255, g: 128, b: 128 }; // Pink-red

        // HSL parameters
        this.hslStartHue = 240;
        this.hslEndHue = 0;

        // Bezier parameters
        this.bezierColors = [
            { r: 10, g: 20, b: 100 },
            { r: 0, g: 150, b: 200 },
            { r: 255, g: 220, b: 50 },
            { r: 200, g: 50, b: 10 }
        ];

        // Complementary/Triadic base hues
        this.complementaryHue = 220;
        this.triadicHue = 0;

        // Cubehelix rotations
        this.cubehelixRotations = -1.5;

        // Julia Set parameters
        this.juliaReal = -0.4;
        this.juliaImag = 0.6;

        // Julia Set presets
        this.juliaPresets = {
            dendrite: { real: -0.4, imag: 0.6, name: 'Dendrite' },
            san_marco: { real: -0.75, imag: 0.1, name: 'San Marco' },
            spiral: { real: -0.7269, imag: 0.1889, name: 'Spiral' },
            dragon: { real: -0.835, imag: -0.2321, name: 'Dragon' },
            douady: { real: -0.123, imag: 0.745, name: 'Douady Rabbit' },
            siegel: { real: -0.391, imag: -0.587, name: 'Siegel Disk' }
        };

        // Location presets - beautiful fractal spots
        this.presets = [
            {
                name: 'Mandelbrot Overview',
                fractalType: 'mandelbrot',
                centerX: -0.5,
                centerY: 0,
                zoom: 1,
                maxIterations: 100,
                colorScheme: 'default'
            },
            {
                name: 'Seahorse Valley',
                fractalType: 'mandelbrot',
                centerX: -0.743643887037151,
                centerY: 0.131825904205330,
                zoom: 500,
                maxIterations: 200,
                colorScheme: 'cosine'
            },
            {
                name: 'Spiral Detail',
                fractalType: 'mandelbrot',
                centerX: -0.7746806106269039,
                centerY: -0.1374168856037867,
                zoom: 1000,
                maxIterations: 300,
                colorScheme: 'continuous'
            },
            {
                name: 'Elephant Valley',
                fractalType: 'mandelbrot',
                centerX: 0.3245046418497685,
                centerY: 0.04855101129280834,
                zoom: 800,
                maxIterations: 250,
                colorScheme: 'bezier'
            },
            {
                name: 'Triple Spiral',
                fractalType: 'mandelbrot',
                centerX: -0.088,
                centerY: 0.654,
                zoom: 150,
                maxIterations: 150,
                colorScheme: 'hsl'
            },
            {
                name: 'Dendrite Julia',
                fractalType: 'julia',
                centerX: 0,
                centerY: 0,
                zoom: 1.5,
                maxIterations: 150,
                colorScheme: 'golden',
                juliaReal: -0.4,
                juliaImag: 0.6
            },
            {
                name: 'Douady Rabbit',
                fractalType: 'julia',
                centerX: 0,
                centerY: 0,
                zoom: 1.5,
                maxIterations: 200,
                colorScheme: 'triadic',
                juliaReal: -0.123,
                juliaImag: 0.745
            },
            {
                name: 'Dragon Julia',
                fractalType: 'julia',
                centerX: 0,
                centerY: 0,
                zoom: 1.5,
                maxIterations: 180,
                colorScheme: 'cosine',
                juliaReal: -0.835,
                juliaImag: -0.2321
            },
            {
                name: 'San Marco Fractal',
                fractalType: 'julia',
                centerX: 0,
                centerY: 0,
                zoom: 1.8,
                maxIterations: 140,
                colorScheme: 'cubehelix',
                juliaReal: -0.75,
                juliaImag: 0.1
            },
            {
                name: 'Burning Ship Overview',
                fractalType: 'burning_ship',
                centerX: -0.5,
                centerY: -0.5,
                zoom: 1.2,
                maxIterations: 100,
                colorScheme: 'default'
            },
            {
                name: 'Burning Ship Detail',
                fractalType: 'burning_ship',
                centerX: -1.7625,
                centerY: -0.028,
                zoom: 300,
                maxIterations: 250,
                colorScheme: 'complementary'
            },
            {
                name: 'Mini Mandelbrot',
                fractalType: 'mandelbrot',
                centerX: -0.16,
                centerY: 1.0405,
                zoom: 200,
                maxIterations: 300,
                colorScheme: 'stripe'
            },
            {
                name: 'Fibonacci Spiral',
                fractalType: 'mandelbrot',
                centerX: -0.7,
                centerY: 0.3,
                zoom: 30,
                maxIterations: 150,
                colorScheme: 'golden'
            }
        ];

        // Mouse interaction
        this.isDragging = false;
        this.isZoomBoxing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.zoomBoxStart = { x: 0, y: 0 };
        this.zoomBoxEnd = { x: 0, y: 0 };
        this.savedImageData = null; // For storing canvas state during zoom box

        // Debounce timers for color controls
        this.colorDebounceTimer = null;

        this.setupCanvas();
        this.setupEventListeners();

        // Load state from URL if present
        this.decodeStateFromURL();

        this.render();
    }

    // Encode current state to URL parameters
    encodeState() {
        const params = new URLSearchParams();
        params.set('type', this.fractalType);
        params.set('cx', this.centerX.toString());
        params.set('cy', this.centerY.toString());
        params.set('z', this.zoom.toString());
        params.set('iter', this.maxIterations.toString());
        params.set('color', this.colorScheme);

        // Add Julia parameters if applicable
        if (this.fractalType === 'julia') {
            params.set('jr', this.juliaReal.toString());
            params.set('ji', this.juliaImag.toString());
        }

        // Add color scheme specific parameters
        if (this.colorScheme === 'cosine') {
            params.set('c1', `${this.cosineBaseColor.r},${this.cosineBaseColor.g},${this.cosineBaseColor.b}`);
            params.set('c2', `${this.cosineAccentColor.r},${this.cosineAccentColor.g},${this.cosineAccentColor.b}`);
        } else if (this.colorScheme === 'hsl') {
            params.set('h1', this.hslStartHue.toString());
            params.set('h2', this.hslEndHue.toString());
        } else if (this.colorScheme === 'complementary') {
            params.set('ch', this.complementaryHue.toString());
        } else if (this.colorScheme === 'triadic') {
            params.set('th', this.triadicHue.toString());
        } else if (this.colorScheme === 'cubehelix') {
            params.set('chr', this.cubehelixRotations.toString());
        }

        return params.toString();
    }

    // Decode state from URL parameters
    decodeStateFromURL() {
        const params = new URLSearchParams(window.location.search);

        if (params.has('type')) {
            this.fractalType = params.get('type');
            document.getElementById('fractalType').value = this.fractalType;
        }

        if (params.has('cx')) this.centerX = parseFloat(params.get('cx'));
        if (params.has('cy')) this.centerY = parseFloat(params.get('cy'));
        if (params.has('z')) this.zoom = parseFloat(params.get('z'));
        if (params.has('iter')) {
            this.maxIterations = parseInt(params.get('iter'));
            document.getElementById('maxIterations').value = this.maxIterations;
        }

        if (params.has('color')) {
            this.colorScheme = params.get('color');
            document.getElementById('colorScheme').value = this.colorScheme;
        }

        // Julia parameters
        if (params.has('jr')) {
            this.juliaReal = parseFloat(params.get('jr'));
            document.getElementById('juliaReal').value = this.juliaReal;
        }
        if (params.has('ji')) {
            this.juliaImag = parseFloat(params.get('ji'));
            document.getElementById('juliaImag').value = this.juliaImag;
        }

        // Color parameters
        if (params.has('c1')) {
            const [r, g, b] = params.get('c1').split(',').map(Number);
            this.cosineBaseColor = { r, g, b };
            const hex = this.rgbToHex(r, g, b);
            document.getElementById('cosineBaseColor').value = hex;
            document.getElementById('cosineBasePreview').style.background = hex;
        }
        if (params.has('c2')) {
            const [r, g, b] = params.get('c2').split(',').map(Number);
            this.cosineAccentColor = { r, g, b };
            const hex = this.rgbToHex(r, g, b);
            document.getElementById('cosineAccentColor').value = hex;
            document.getElementById('cosineAccentPreview').style.background = hex;
        }
        if (params.has('h1')) {
            this.hslStartHue = parseInt(params.get('h1'));
            document.getElementById('hslStartHue').value = this.hslStartHue;
            document.getElementById('hslStartHueValue').textContent = this.hslStartHue + '°';
        }
        if (params.has('h2')) {
            this.hslEndHue = parseInt(params.get('h2'));
            document.getElementById('hslEndHue').value = this.hslEndHue;
            document.getElementById('hslEndHueValue').textContent = this.hslEndHue + '°';
        }
        if (params.has('ch')) {
            this.complementaryHue = parseInt(params.get('ch'));
            document.getElementById('complementaryHue').value = this.complementaryHue;
            document.getElementById('complementaryHueValue').textContent = this.complementaryHue + '°';
        }
        if (params.has('th')) {
            this.triadicHue = parseInt(params.get('th'));
            document.getElementById('triadicHue').value = this.triadicHue;
            document.getElementById('triadicHueValue').textContent = this.triadicHue + '°';
        }
        if (params.has('chr')) {
            this.cubehelixRotations = parseFloat(params.get('chr'));
            document.getElementById('cubehelixRotations').value = this.cubehelixRotations;
            document.getElementById('cubehelixRotationsValue').textContent = this.cubehelixRotations.toFixed(1);
        }

        // Update UI controls visibility
        this.updateJuliaControls();
        this.updateCosineControls();
    }

    // Load a preset location
    loadPreset(preset) {
        this.fractalType = preset.fractalType;
        this.centerX = preset.centerX;
        this.centerY = preset.centerY;
        this.zoom = preset.zoom;
        this.maxIterations = preset.maxIterations;
        this.colorScheme = preset.colorScheme;

        if (preset.juliaReal !== undefined) this.juliaReal = preset.juliaReal;
        if (preset.juliaImag !== undefined) this.juliaImag = preset.juliaImag;

        // Update UI
        document.getElementById('fractalType').value = this.fractalType;
        document.getElementById('maxIterations').value = this.maxIterations;
        document.getElementById('colorScheme').value = this.colorScheme;

        if (this.fractalType === 'julia') {
            document.getElementById('juliaReal').value = this.juliaReal;
            document.getElementById('juliaImag').value = this.juliaImag;
            document.getElementById('juliaPreset').value = 'custom';
        }

        this.updateJuliaControls();
        this.updateCosineControls();
        this.render();
    }

    // Copy current state to clipboard as URL
    copyLinkToClipboard() {
        const url = window.location.origin + window.location.pathname + '?' + this.encodeState();

        // Update browser URL without reload
        window.history.replaceState({}, '', url);

        // Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            // Show feedback
            const btn = document.getElementById('copyLinkBtn');
            const originalText = btn.textContent;
            btn.textContent = 'Link Copied!';
            btn.style.background = '#4CAF50';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy link:', err);
            alert('Failed to copy link to clipboard');
        });
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.render();
        });

        // Mouse dragging for panning and zoom box
        this.canvas.addEventListener('mousedown', (e) => {
            // Right-click or Ctrl+Click for panning
            if (e.button === 2 || e.ctrlKey) {
                e.preventDefault();
                this.isDragging = true;
                this.lastX = e.clientX;
                this.lastY = e.clientY;
            }
            // Left-click for zoom box or Julia parameter selection
            else if (e.button === 0 && !e.ctrlKey) {
                // Check if in Julia click mode
                if (this.juliaClickMode && this.fractalType === 'mandelbrot') {
                    this.handleJuliaClick(e.clientX, e.clientY);
                } else {
                    this.isZoomBoxing = true;
                    this.zoomBoxStart.x = e.clientX;
                    this.zoomBoxStart.y = e.clientY;
                    this.zoomBoxEnd.x = e.clientX;
                    this.zoomBoxEnd.y = e.clientY;
                    // Save current canvas state
                    this.savedImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                }
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const dx = e.clientX - this.lastX;
                const dy = e.clientY - this.lastY;

                const scale = 3.5 / (this.zoom * this.canvas.width);
                this.centerX -= dx * scale;
                this.centerY -= dy * scale;

                this.lastX = e.clientX;
                this.lastY = e.clientY;

                this.render();
            } else if (this.isZoomBoxing) {
                this.zoomBoxEnd.x = e.clientX;
                this.zoomBoxEnd.y = e.clientY;
                // Restore saved image and draw zoom box
                this.ctx.putImageData(this.savedImageData, 0, 0);
                this.drawZoomBox();
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (this.isZoomBoxing && e.button === 0) {
                this.isZoomBoxing = false;
                this.savedImageData = null;
                this.executeZoomBox();
            }
            this.isDragging = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            if (this.isZoomBoxing) {
                // Restore canvas if zoom box was cancelled
                if (this.savedImageData) {
                    this.ctx.putImageData(this.savedImageData, 0, 0);
                }
                this.isZoomBoxing = false;
                this.savedImageData = null;
            }
        });

        // Prevent context menu on right-click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Mouse wheel for zooming
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Get world coordinates before zoom
            const worldX = this.screenToWorldX(mouseX);
            const worldY = this.screenToWorldY(mouseY);

            // Zoom
            this.zoom *= zoomFactor;

            // Get world coordinates after zoom
            const newWorldX = this.screenToWorldX(mouseX);
            const newWorldY = this.screenToWorldY(mouseY);

            // Adjust center to keep mouse position fixed
            this.centerX += worldX - newWorldX;
            this.centerY += worldY - newWorldY;

            this.render();
        });

        // Double-click to zoom in
        this.canvas.addEventListener('dblclick', (e) => {
            const worldX = this.screenToWorldX(e.clientX);
            const worldY = this.screenToWorldY(e.clientY);

            this.centerX = worldX;
            this.centerY = worldY;
            this.zoom *= 2;

            this.render();
        });

        // Menu controls
        document.getElementById('fractalType').addEventListener('change', (e) => {
            this.fractalType = e.target.value;
            this.updateJuliaControls();
            this.updateCosineControls();
            this.resetView();
            this.render();
        });

        // Preset selector
        const presetSelect = document.getElementById('presetSelect');
        this.presets.forEach((preset, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = preset.name;
            presetSelect.appendChild(option);
        });

        presetSelect.addEventListener('change', (e) => {
            const index = parseInt(e.target.value);
            if (!isNaN(index) && this.presets[index]) {
                this.loadPreset(this.presets[index]);
            }
            // Reset selection to show placeholder
            e.target.value = '';
        });

        // Copy link button
        document.getElementById('copyLinkBtn').addEventListener('click', () => {
            this.copyLinkToClipboard();
        });

        // Julia click mode buttons
        const mandelbrotClickBtn = document.getElementById('mandelbrotClickBtn');
        const juliaClickBtn = document.getElementById('juliaClickBtn');
        const clickModeIndicator = document.getElementById('clickModeIndicator');

        if (mandelbrotClickBtn) {
            mandelbrotClickBtn.addEventListener('click', () => {
                this.juliaClickMode = !this.juliaClickMode;
                if (this.juliaClickMode) {
                    mandelbrotClickBtn.classList.add('active');
                    mandelbrotClickBtn.textContent = 'Click Mode: ON';
                    clickModeIndicator.style.display = 'block';
                } else {
                    mandelbrotClickBtn.classList.remove('active');
                    mandelbrotClickBtn.textContent = 'Click to Pick Julia Parameter';
                    clickModeIndicator.style.display = 'none';
                }
            });
        }

        if (juliaClickBtn) {
            juliaClickBtn.addEventListener('click', () => {
                // Switch to Mandelbrot and enable click mode
                this.fractalType = 'mandelbrot';
                document.getElementById('fractalType').value = 'mandelbrot';
                this.juliaClickMode = true;
                this.updateJuliaControls();
                this.resetView();
                this.render();
            });
        }

        document.getElementById('juliaPreset').addEventListener('change', (e) => {
            const preset = e.target.value;
            if (preset !== 'custom' && this.juliaPresets[preset]) {
                this.juliaReal = this.juliaPresets[preset].real;
                this.juliaImag = this.juliaPresets[preset].imag;
                document.getElementById('juliaReal').value = this.juliaReal;
                document.getElementById('juliaImag').value = this.juliaImag;
                document.getElementById('juliaParams').style.display = 'none';
            } else {
                document.getElementById('juliaParams').style.display = 'block';
            }
            this.render();
        });

        document.getElementById('juliaReal').addEventListener('input', (e) => {
            this.juliaReal = parseFloat(e.target.value);
            document.getElementById('juliaPreset').value = 'custom';
        });
        document.getElementById('juliaReal').addEventListener('change', (e) => {
            this.render();
        });

        document.getElementById('juliaImag').addEventListener('input', (e) => {
            this.juliaImag = parseFloat(e.target.value);
            document.getElementById('juliaPreset').value = 'custom';
        });
        document.getElementById('juliaImag').addEventListener('change', (e) => {
            this.render();
        });

        document.getElementById('maxIterations').addEventListener('change', (e) => {
            this.maxIterations = parseInt(e.target.value);
            this.render();
        });

        document.getElementById('colorScheme').addEventListener('change', (e) => {
            this.colorScheme = e.target.value;
            this.updateCosineControls();
            this.render();
        });

        document.getElementById('cosineBaseColor').addEventListener('input', (e) => {
            const hex = e.target.value;
            this.cosineBaseColor = this.hexToRgb(hex);
            document.getElementById('cosineBasePreview').style.background = hex;
            this.debouncedRender();
        });

        document.getElementById('cosineAccentColor').addEventListener('input', (e) => {
            const hex = e.target.value;
            this.cosineAccentColor = this.hexToRgb(hex);
            document.getElementById('cosineAccentPreview').style.background = hex;
            this.debouncedRender();
        });

        // HSL controls
        document.getElementById('hslStartHue').addEventListener('input', (e) => {
            this.hslStartHue = parseInt(e.target.value);
            document.getElementById('hslStartHueValue').textContent = this.hslStartHue + '°';
        });
        document.getElementById('hslStartHue').addEventListener('change', (e) => {
            this.render();
        });

        document.getElementById('hslEndHue').addEventListener('input', (e) => {
            this.hslEndHue = parseInt(e.target.value);
            document.getElementById('hslEndHueValue').textContent = this.hslEndHue + '°';
        });
        document.getElementById('hslEndHue').addEventListener('change', (e) => {
            this.render();
        });

        // Bezier controls
        for (let i = 0; i < 4; i++) {
            document.getElementById(`bezierColor${i}`).addEventListener('input', (e) => {
                this.bezierColors[i] = this.hexToRgb(e.target.value);
                document.getElementById(`bezierPreview${i}`).style.background = e.target.value;
                this.debouncedRender();
            });
        }

        // Complementary control
        document.getElementById('complementaryHue').addEventListener('input', (e) => {
            this.complementaryHue = parseInt(e.target.value);
            document.getElementById('complementaryHueValue').textContent = this.complementaryHue + '°';
        });
        document.getElementById('complementaryHue').addEventListener('change', (e) => {
            this.render();
        });

        // Triadic control
        document.getElementById('triadicHue').addEventListener('input', (e) => {
            this.triadicHue = parseInt(e.target.value);
            document.getElementById('triadicHueValue').textContent = this.triadicHue + '°';
        });
        document.getElementById('triadicHue').addEventListener('change', (e) => {
            this.render();
        });

        // Cubehelix control
        document.getElementById('cubehelixRotations').addEventListener('input', (e) => {
            this.cubehelixRotations = parseFloat(e.target.value);
            document.getElementById('cubehelixRotationsValue').textContent = this.cubehelixRotations.toFixed(1);
        });
        document.getElementById('cubehelixRotations').addEventListener('change', (e) => {
            this.render();
        });

        document.getElementById('renderBtn').addEventListener('click', () => {
            this.render();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetView();
            this.render();
        });
    }

    updateJuliaControls() {
        const juliaControls = document.getElementById('juliaControls');
        const juliaParams = document.getElementById('juliaParams');
        const mandelbrotControls = document.getElementById('mandelbrotControls');
        const mandelbrotClickBtn = document.getElementById('mandelbrotClickBtn');
        const clickModeIndicator = document.getElementById('clickModeIndicator');

        if (this.fractalType === 'julia') {
            juliaControls.style.display = 'block';
            mandelbrotControls.style.display = 'none';
            // Show params only if custom is selected
            const preset = document.getElementById('juliaPreset').value;
            juliaParams.style.display = preset === 'custom' ? 'block' : 'none';
        } else if (this.fractalType === 'mandelbrot') {
            juliaControls.style.display = 'none';
            mandelbrotControls.style.display = 'block';
            // Update button state
            if (this.juliaClickMode) {
                mandelbrotClickBtn.classList.add('active');
                mandelbrotClickBtn.textContent = 'Click Mode: ON';
                clickModeIndicator.style.display = 'block';
            } else {
                mandelbrotClickBtn.classList.remove('active');
                mandelbrotClickBtn.textContent = 'Click to Pick Julia Parameter';
                clickModeIndicator.style.display = 'none';
            }
        } else {
            juliaControls.style.display = 'none';
            juliaParams.style.display = 'none';
            mandelbrotControls.style.display = 'none';
        }
    }

    updateCosineControls() {
        // Hide all color control sections
        document.getElementById('cosineControls').style.display = 'none';
        document.getElementById('hslControls').style.display = 'none';
        document.getElementById('bezierControls').style.display = 'none';
        document.getElementById('complementaryControls').style.display = 'none';
        document.getElementById('triadicControls').style.display = 'none';
        document.getElementById('cubehelixControls').style.display = 'none';

        // Show relevant controls based on scheme
        switch(this.colorScheme) {
            case 'cosine':
                document.getElementById('cosineControls').style.display = 'block';
                break;
            case 'hsl':
                document.getElementById('hslControls').style.display = 'block';
                break;
            case 'bezier':
                document.getElementById('bezierControls').style.display = 'block';
                break;
            case 'complementary':
                document.getElementById('complementaryControls').style.display = 'block';
                break;
            case 'triadic':
                document.getElementById('triadicControls').style.display = 'block';
                break;
            case 'cubehelix':
                document.getElementById('cubehelixControls').style.display = 'block';
                break;
        }
    }

    handleJuliaClick(screenX, screenY) {
        // Convert screen coordinates to Mandelbrot coordinates
        const worldX = this.screenToWorldX(screenX);
        const worldY = this.screenToWorldY(screenY);

        // Set Julia parameters to clicked point
        this.juliaReal = worldX;
        this.juliaImag = worldY;

        // Update UI
        document.getElementById('juliaReal').value = this.juliaReal.toFixed(4);
        document.getElementById('juliaImag').value = this.juliaImag.toFixed(4);
        document.getElementById('juliaPreset').value = 'custom';

        // Switch to Julia set
        this.fractalType = 'julia';
        document.getElementById('fractalType').value = 'julia';

        // Disable click mode
        this.juliaClickMode = false;

        // Update UI and render
        this.updateJuliaControls();
        this.resetView();
        this.render();
    }

    debouncedRender(delay = 150) {
        // Clear existing timer
        if (this.colorDebounceTimer) {
            clearTimeout(this.colorDebounceTimer);
        }
        // Set new timer
        this.colorDebounceTimer = setTimeout(() => {
            this.render();
        }, delay);
    }

    updateProgress(percent) {
        this.progressFill.style.width = percent + '%';
        this.progressText.textContent = Math.floor(percent) + '%';
    }

    resetView() {
        if (this.fractalType === 'mandelbrot') {
            this.centerX = -0.5;
            this.centerY = 0;
            this.zoom = 1;
        } else if (this.fractalType === 'burning_ship') {
            this.centerX = -0.5;
            this.centerY = -0.5;
            this.zoom = 1.2;
        } else if (this.fractalType === 'julia') {
            this.centerX = 0;
            this.centerY = 0;
            this.zoom = 1.5;
        } else if (this.fractalType === 'koch') {
            this.centerX = 0;
            this.centerY = 0;
            this.zoom = 1.5;
        } else if (this.fractalType === 'sierpinski') {
            this.centerX = 0;
            this.centerY = 0.1;
            this.zoom = 1.8;
        } else if (this.fractalType === 'dragon') {
            this.centerX = 0;
            this.centerY = 0;
            this.zoom = 2.5;
        } else if (this.fractalType === 'barnsley') {
            this.centerX = 0;
            this.centerY = -0.2;
            this.zoom = 1.2;
        } else if (this.fractalType === 'menger') {
            this.centerX = 0;
            this.centerY = 0;
            this.zoom = 1.5;
        }
    }

    drawZoomBox() {
        // Draw the zoom box overlay without re-rendering the fractal
        const x1 = Math.min(this.zoomBoxStart.x, this.zoomBoxEnd.x);
        const y1 = Math.min(this.zoomBoxStart.y, this.zoomBoxEnd.y);
        const width = Math.abs(this.zoomBoxEnd.x - this.zoomBoxStart.x);
        const height = Math.abs(this.zoomBoxEnd.y - this.zoomBoxStart.y);

        // Just draw the box overlay directly on top of existing canvas
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(x1, y1, width, height);

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(x1, y1, width, height);

        this.ctx.setLineDash([]);
    }

    executeZoomBox() {
        const x1 = Math.min(this.zoomBoxStart.x, this.zoomBoxEnd.x);
        const y1 = Math.min(this.zoomBoxStart.y, this.zoomBoxEnd.y);
        const x2 = Math.max(this.zoomBoxStart.x, this.zoomBoxEnd.x);
        const y2 = Math.max(this.zoomBoxStart.y, this.zoomBoxEnd.y);

        const width = x2 - x1;
        const height = y2 - y1;

        // Ignore very small boxes (likely accidental clicks)
        if (width < 10 || height < 10) {
            this.render();
            return;
        }

        // Calculate the center of the zoom box in world coordinates
        const centerScreenX = (x1 + x2) / 2;
        const centerScreenY = (y1 + y2) / 2;

        const newCenterX = this.screenToWorldX(centerScreenX);
        const newCenterY = this.screenToWorldY(centerScreenY);

        // Calculate the zoom factor based on the box size
        const zoomFactorX = this.canvas.width / width;
        const zoomFactorY = this.canvas.height / height;
        const zoomFactor = Math.min(zoomFactorX, zoomFactorY);

        // Update view
        this.centerX = newCenterX;
        this.centerY = newCenterY;
        this.zoom *= zoomFactor;

        this.render();
    }

    screenToWorldX(screenX) {
        const scale = 3.5 / (this.zoom * this.canvas.width);
        return this.centerX + (screenX - this.canvas.width / 2) * scale;
    }

    screenToWorldY(screenY) {
        const scale = 3.5 / (this.zoom * this.canvas.width);
        return this.centerY + (screenY - this.canvas.height / 2) * scale;
    }

    async render() {
        this.loading.classList.add('active');
        this.updateProgress(0);

        // Small delay to allow UI to update
        await new Promise(resolve => setTimeout(resolve, 50));

        const fractal = this.fractals[this.fractalType];
        if (!fractal) {
            console.error(`Unknown fractal type: ${this.fractalType}`);
            this.loading.classList.remove('active');
            return;
        }

        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas with black background for geometric fractals
        const geometricFractals = ['koch', 'sierpinski', 'dragon', 'barnsley', 'menger'];
        if (geometricFractals.includes(this.fractalType)) {
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, width, height);
        }

        // All fractals now render asynchronously
        await fractal.render();

        // Ensure progress shows 100% completion
        this.updateProgress(100);

        // Brief delay so user can see completion
        await new Promise(resolve => setTimeout(resolve, 200));

        this.loading.classList.remove('active');
    }

    worldToScreenX(worldX) {
        const scale = this.zoom * this.canvas.width / 3.5;
        return (worldX - this.centerX) * scale + this.canvas.width / 2;
    }

    worldToScreenY(worldY) {
        const scale = this.zoom * this.canvas.width / 3.5;
        return (worldY - this.centerY) * scale + this.canvas.height / 2;
    }

    // Helper: Convert hex color to RGB object
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 128, g: 128, b: 128 };
    }

    // Helper: Convert RGB values to hex color
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
}

// Initialize the viewer when page loads
window.addEventListener('load', () => {
    new FractalViewer();
});
