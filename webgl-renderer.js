// WebGL-based renderer for escape-time fractals
// Provides GPU-accelerated rendering with significant performance improvements

class WebGLRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = null;
        this.program = null;
        this.vertexBuffer = null;
        this.initialized = false;
    }

    // Initialize WebGL context and resources
    init() {
        try {
            this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
            if (!this.gl) {
                console.warn('WebGL not supported, falling back to Canvas2D');
                return false;
            }

            // Create vertex buffer for a full-screen quad
            const vertices = new Float32Array([
                -1, -1,  // bottom-left
                 1, -1,  // bottom-right
                -1,  1,  // top-left
                 1,  1   // top-right
            ]);

            this.vertexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

            this.initialized = true;
            return true;
        } catch (e) {
            console.warn('WebGL initialization failed:', e);
            return false;
        }
    }

    // Compile a shader from source
    compileShader(source, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    // Create shader program from vertex and fragment shaders
    createProgram(vertexSource, fragmentSource) {
        const vertexShader = this.compileShader(vertexSource, this.gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(fragmentSource, this.gl.FRAGMENT_SHADER);

        if (!vertexShader || !fragmentShader) {
            return null;
        }

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }

        return program;
    }

    // Common vertex shader for all fractals (simple passthrough)
    getVertexShader() {
        return `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;
    }

    // Mandelbrot fragment shader
    getMandelbrotFragmentShader() {
        return `
            precision highp float;
            uniform vec2 u_resolution;
            uniform vec2 u_center;
            uniform float u_zoom;
            uniform int u_maxIterations;
            uniform vec3 u_color1;
            uniform vec3 u_color2;
            uniform int u_colorScheme;

            vec3 getColor(float iteration, float maxIter) {
                if (iteration >= maxIter) {
                    return vec3(0.0, 0.0, 0.0);
                }

                float t = iteration / maxIter;

                // Color scheme 0: Default polynomial
                if (u_colorScheme == 0) {
                    float r = 9.0 * (1.0 - t) * t * t * t;
                    float g = 15.0 * (1.0 - t) * (1.0 - t) * t * t;
                    float b = 8.5 * (1.0 - t) * (1.0 - t) * (1.0 - t) * t;
                    return vec3(r, g, b);
                }
                // Color scheme 1: Cosine gradient
                else if (u_colorScheme == 1) {
                    vec3 a = (u_color1 + u_color2) / 2.0;
                    vec3 b = (u_color2 - u_color1) / 2.0;
                    vec3 c = vec3(1.0, 1.0, 1.0);
                    vec3 d = vec3(0.0, 0.33, 0.67);

                    return a + b * cos(6.28318 * (c * t + d));
                }
                // Color scheme 2: HSL smooth
                else {
                    float hue = mod(iteration * 10.0, 360.0) / 360.0;
                    float sat = 0.8;
                    float light = 0.5 + 0.3 * sin(iteration * 0.5);

                    // HSL to RGB conversion
                    float c = (1.0 - abs(2.0 * light - 1.0)) * sat;
                    float x = c * (1.0 - abs(mod(hue * 6.0, 2.0) - 1.0));
                    float m = light - c / 2.0;

                    vec3 rgb;
                    if (hue < 1.0/6.0) rgb = vec3(c, x, 0.0);
                    else if (hue < 2.0/6.0) rgb = vec3(x, c, 0.0);
                    else if (hue < 3.0/6.0) rgb = vec3(0.0, c, x);
                    else if (hue < 4.0/6.0) rgb = vec3(0.0, x, c);
                    else if (hue < 5.0/6.0) rgb = vec3(x, 0.0, c);
                    else rgb = vec3(c, 0.0, x);

                    return rgb + m;
                }
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution;

                // Map screen coordinates to complex plane
                float scale = 3.5 / (u_zoom * u_resolution.x);
                float x0 = u_center.x + (gl_FragCoord.x - u_resolution.x / 2.0) * scale;
                float y0 = u_center.y + (gl_FragCoord.y - u_resolution.y / 2.0) * scale;

                // Mandelbrot iteration
                float x = 0.0;
                float y = 0.0;
                float iteration = 0.0;
                float maxIter = float(u_maxIterations);

                for (int i = 0; i < 1000; i++) {
                    if (i >= u_maxIterations) break;
                    if (x * x + y * y > 4.0) break;

                    float xtemp = x * x - y * y + x0;
                    y = 2.0 * x * y + y0;
                    x = xtemp;
                    iteration += 1.0;
                }

                // Smooth coloring
                if (iteration < maxIter) {
                    float log_zn = log(x * x + y * y) / 2.0;
                    float nu = log(log_zn / log(2.0)) / log(2.0);
                    iteration = iteration + 1.0 - nu;
                }

                vec3 color = getColor(iteration, maxIter);
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }

    // Julia fragment shader
    getJuliaFragmentShader() {
        return `
            precision highp float;
            uniform vec2 u_resolution;
            uniform vec2 u_center;
            uniform float u_zoom;
            uniform int u_maxIterations;
            uniform vec2 u_juliaC;
            uniform vec3 u_color1;
            uniform vec3 u_color2;
            uniform int u_colorScheme;

            vec3 getColor(float iteration, float maxIter) {
                if (iteration >= maxIter) {
                    return vec3(0.0, 0.0, 0.0);
                }

                float t = iteration / maxIter;

                if (u_colorScheme == 0) {
                    float r = 9.0 * (1.0 - t) * t * t * t;
                    float g = 15.0 * (1.0 - t) * (1.0 - t) * t * t;
                    float b = 8.5 * (1.0 - t) * (1.0 - t) * (1.0 - t) * t;
                    return vec3(r, g, b);
                }
                else if (u_colorScheme == 1) {
                    vec3 a = (u_color1 + u_color2) / 2.0;
                    vec3 b = (u_color2 - u_color1) / 2.0;
                    vec3 c = vec3(1.0, 1.0, 1.0);
                    vec3 d = vec3(0.0, 0.33, 0.67);

                    return a + b * cos(6.28318 * (c * t + d));
                }
                else {
                    float hue = mod(iteration * 10.0, 360.0) / 360.0;
                    float sat = 0.8;
                    float light = 0.5 + 0.3 * sin(iteration * 0.5);

                    float c = (1.0 - abs(2.0 * light - 1.0)) * sat;
                    float x = c * (1.0 - abs(mod(hue * 6.0, 2.0) - 1.0));
                    float m = light - c / 2.0;

                    vec3 rgb;
                    if (hue < 1.0/6.0) rgb = vec3(c, x, 0.0);
                    else if (hue < 2.0/6.0) rgb = vec3(x, c, 0.0);
                    else if (hue < 3.0/6.0) rgb = vec3(0.0, c, x);
                    else if (hue < 4.0/6.0) rgb = vec3(0.0, x, c);
                    else if (hue < 5.0/6.0) rgb = vec3(x, 0.0, c);
                    else rgb = vec3(c, 0.0, x);

                    return rgb + m;
                }
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution;

                float scale = 3.5 / (u_zoom * u_resolution.x);
                float zx = u_center.x + (gl_FragCoord.x - u_resolution.x / 2.0) * scale;
                float zy = u_center.y + (gl_FragCoord.y - u_resolution.y / 2.0) * scale;

                float x = zx;
                float y = zy;
                float iteration = 0.0;
                float maxIter = float(u_maxIterations);

                for (int i = 0; i < 1000; i++) {
                    if (i >= u_maxIterations) break;
                    if (x * x + y * y > 4.0) break;

                    float xtemp = x * x - y * y + u_juliaC.x;
                    y = 2.0 * x * y + u_juliaC.y;
                    x = xtemp;
                    iteration += 1.0;
                }

                if (iteration < maxIter) {
                    float log_zn = log(x * x + y * y) / 2.0;
                    float nu = log(log_zn / log(2.0)) / log(2.0);
                    iteration = iteration + 1.0 - nu;
                }

                vec3 color = getColor(iteration, maxIter);
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }

    // Burning Ship fragment shader
    getBurningShipFragmentShader() {
        return `
            precision highp float;
            uniform vec2 u_resolution;
            uniform vec2 u_center;
            uniform float u_zoom;
            uniform int u_maxIterations;
            uniform vec3 u_color1;
            uniform vec3 u_color2;
            uniform int u_colorScheme;

            vec3 getColor(float iteration, float maxIter) {
                if (iteration >= maxIter) {
                    return vec3(0.0, 0.0, 0.0);
                }

                float t = iteration / maxIter;

                if (u_colorScheme == 0) {
                    float r = 9.0 * (1.0 - t) * t * t * t;
                    float g = 15.0 * (1.0 - t) * (1.0 - t) * t * t;
                    float b = 8.5 * (1.0 - t) * (1.0 - t) * (1.0 - t) * t;
                    return vec3(r, g, b);
                }
                else if (u_colorScheme == 1) {
                    vec3 a = (u_color1 + u_color2) / 2.0;
                    vec3 b = (u_color2 - u_color1) / 2.0;
                    vec3 c = vec3(1.0, 1.0, 1.0);
                    vec3 d = vec3(0.0, 0.33, 0.67);

                    return a + b * cos(6.28318 * (c * t + d));
                }
                else {
                    float hue = mod(iteration * 10.0, 360.0) / 360.0;
                    float sat = 0.8;
                    float light = 0.5 + 0.3 * sin(iteration * 0.5);

                    float c = (1.0 - abs(2.0 * light - 1.0)) * sat;
                    float x = c * (1.0 - abs(mod(hue * 6.0, 2.0) - 1.0));
                    float m = light - c / 2.0;

                    vec3 rgb;
                    if (hue < 1.0/6.0) rgb = vec3(c, x, 0.0);
                    else if (hue < 2.0/6.0) rgb = vec3(x, c, 0.0);
                    else if (hue < 3.0/6.0) rgb = vec3(0.0, c, x);
                    else if (hue < 4.0/6.0) rgb = vec3(0.0, x, c);
                    else if (hue < 5.0/6.0) rgb = vec3(x, 0.0, c);
                    else rgb = vec3(c, 0.0, x);

                    return rgb + m;
                }
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution;

                float scale = 3.5 / (u_zoom * u_resolution.x);
                float cx = u_center.x + (gl_FragCoord.x - u_resolution.x / 2.0) * scale;
                float cy = u_center.y + (gl_FragCoord.y - u_resolution.y / 2.0) * scale;

                float x = 0.0;
                float y = 0.0;
                float iteration = 0.0;
                float maxIter = float(u_maxIterations);

                for (int i = 0; i < 1000; i++) {
                    if (i >= u_maxIterations) break;
                    if (x * x + y * y > 4.0) break;

                    // Burning Ship: take absolute values before squaring
                    x = abs(x);
                    y = abs(y);

                    float xtemp = x * x - y * y + cx;
                    y = 2.0 * x * y + cy;
                    x = xtemp;
                    iteration += 1.0;
                }

                if (iteration < maxIter) {
                    float log_zn = log(x * x + y * y) / 2.0;
                    float nu = log(log_zn / log(2.0)) / log(2.0);
                    iteration = iteration + 1.0 - nu;
                }

                vec3 color = getColor(iteration, maxIter);
                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }

    // Render a fractal using WebGL
    render(fractalType, params) {
        if (!this.initialized) {
            return false;
        }

        const gl = this.gl;

        // Create appropriate shader program
        let fragmentShader;
        switch (fractalType) {
            case 'mandelbrot':
                fragmentShader = this.getMandelbrotFragmentShader();
                break;
            case 'julia':
                fragmentShader = this.getJuliaFragmentShader();
                break;
            case 'burning_ship':
                fragmentShader = this.getBurningShipFragmentShader();
                break;
            default:
                return false;
        }

        this.program = this.createProgram(this.getVertexShader(), fragmentShader);
        if (!this.program) {
            return false;
        }

        gl.useProgram(this.program);

        // Set up vertex attributes
        const positionLocation = gl.getAttribLocation(this.program, 'position');
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Set uniforms
        gl.uniform2f(gl.getUniformLocation(this.program, 'u_resolution'),
            params.width, params.height);
        gl.uniform2f(gl.getUniformLocation(this.program, 'u_center'),
            params.centerX, params.centerY);
        gl.uniform1f(gl.getUniformLocation(this.program, 'u_zoom'), params.zoom);
        gl.uniform1i(gl.getUniformLocation(this.program, 'u_maxIterations'),
            params.maxIterations);

        // Color uniforms
        const color1 = params.color1 || { r: 128, g: 128, b: 255 };
        const color2 = params.color2 || { r: 255, g: 128, b: 128 };
        gl.uniform3f(gl.getUniformLocation(this.program, 'u_color1'),
            color1.r / 255, color1.g / 255, color1.b / 255);
        gl.uniform3f(gl.getUniformLocation(this.program, 'u_color2'),
            color2.r / 255, color2.g / 255, color2.b / 255);

        // Color scheme: 0=default, 1=cosine, 2=continuous
        let colorScheme = 0;
        if (params.colorScheme === 'cosine') colorScheme = 1;
        else if (params.colorScheme === 'continuous') colorScheme = 2;
        gl.uniform1i(gl.getUniformLocation(this.program, 'u_colorScheme'), colorScheme);

        // Julia-specific parameters
        if (fractalType === 'julia') {
            gl.uniform2f(gl.getUniformLocation(this.program, 'u_juliaC'),
                params.juliaReal || -0.4, params.juliaImag || 0.6);
        }

        // Clear and draw
        gl.viewport(0, 0, params.width, params.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        return true;
    }

    // Clean up resources
    destroy() {
        if (this.gl) {
            if (this.program) {
                this.gl.deleteProgram(this.program);
            }
            if (this.vertexBuffer) {
                this.gl.deleteBuffer(this.vertexBuffer);
            }
        }
        this.initialized = false;
    }
}
