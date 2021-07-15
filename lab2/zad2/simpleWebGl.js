/**
 * 
 * @returns shadery jako tekst
 */
function getShadersStrings() {
    return {
        fragment_shader_string: `
            precision mediump float;
            varying vec3 fragColor;
            void main() {
                gl_FragColor = vec4(fragColor, 1.0);
            }
        `,
        vertex_shader_string: `
            precision mediump float;
            attribute vec2 vertPosition;
            attribute float vertDepth;
            attribute vec3 vertColor;

            uniform vec2 resolution;

            varying vec3 fragColor;
            
            void main() {
                fragColor = vertColor;
                gl_Position = vec4((vertPosition/resolution)*2.0-1.0, vertDepth ,1.0);
                gl_PointSize = 5.0;
            }
        `
    }
}

/**
 * Klasa webgl
 */
class WebGL {
    /**
     * Inicjalizacja shaderów, programu itp
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        this.gl = canvas.getContext("webgl");
        const gl = this.gl;
        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }
        //#region SHADERSSS- stworzenie shaderów
        const shaders_strings = getShadersStrings()
        const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
        const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(vertex_shader, shaders_strings.vertex_shader_string);
        gl.shaderSource(fragment_shader, shaders_strings.fragment_shader_string);

        gl.compileShader(vertex_shader);
        if (!gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS)) {
            console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertex_shader));
            return;
        }
        gl.compileShader(fragment_shader);
        if (!gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS)) {
            console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragment_shader));
            return;
        }
        //#endregion

        //#region PROGRAMMM - stworzenie programu
        const program = gl.createProgram();
        gl.attachShader(program, vertex_shader);
        gl.attachShader(program, fragment_shader);

        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('ERROR linking program!', gl.getProgramInfoLog(program));
            return;
        }
        gl.validateProgram(program);
        if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
            console.error('ERROR validating program!', gl.getProgramInfoLog(program));
            return;
        }
        //#endregion

        //Zapisanie informacji o programie
        this.program = program;
        this.program_info = {
            program: this.program,
            attributes_locations: {
                position: gl.getAttribLocation(this.program, "vertPosition"),
                color: gl.getAttribLocation(this.program, "vertColor"),
                depth: gl.getAttribLocation(this.program, "vertDepth"),
            },
            uniforms: {
                resolution: gl.getUniformLocation(this.program, "resolution"),
            }
        };
    }

    /**
     * Rysowanie figury
     * @param {Float64Array} data_array tablica vertexów w postaci [x0, y0, x1, y1, ...]
     */
    draw(drawables, type = "TRIANGLES") {
        const gl = this.gl
        const attribs_per_vertex = 6;
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //! Włączenie głębi
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        /**
         * Dla każego obiektu rysowanie go (dzięki czemu, tylko raz jest clearcolor)
         */
        drawables.forEach(drawable => {

            if (drawable.visible === false) return;
            let data_array = drawable.vertex_list
            const traingle_buffer_object = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, traingle_buffer_object);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data_array), gl.STATIC_DRAW);

            /**
             * W jednej tablicy przekazywane jest jednocześnie pozycja, głębokość i kolor
             */
            gl.vertexAttribPointer(
                this.program_info.attributes_locations.position, //lokacja atrybutu
                2, // liczba elementów per atrybut
                gl.FLOAT, //typ elemntów
                gl.FALSE, //normalizacja
                6 * Float32Array.BYTES_PER_ELEMENT, //rozmiar każdego vertexu
                0 //offset w tablicy
            );
            gl.vertexAttribPointer(
                this.program_info.attributes_locations.depth, //lokacja atrybutu
                1, // liczba elementów per atrybut
                gl.FLOAT, //typ elemntów
                gl.FALSE, //normalizacja
                6 * Float32Array.BYTES_PER_ELEMENT, //rozmiar każdego vertexu
                2 * Float32Array.BYTES_PER_ELEMENT //offset w tablicy
            );
            gl.vertexAttribPointer(
                this.program_info.attributes_locations.color, //lokacja atrybutu
                3, // liczba elementów per atrybut
                gl.FLOAT, //typ elemntów
                gl.FALSE, //normalizacja
                6 * Float32Array.BYTES_PER_ELEMENT, //rozmiar każdego vertexu
                3 * Float32Array.BYTES_PER_ELEMENT //offset w tablicy
            );

            gl.enableVertexAttribArray(this.program_info.attributes_locations.position);
            gl.enableVertexAttribArray(this.program_info.attributes_locations.color);
            gl.enableVertexAttribArray(this.program_info.attributes_locations.depth);

            gl.useProgram(this.program);

            gl.uniform2f(
                this.program_info.uniforms.resolution,
                gl.canvas.width,
                gl.canvas.height
            );

            gl.drawArrays(gl[type], 0, data_array.length / attribs_per_vertex);
        });
    }

    /**
     * Wypisnaie informacji o atrybutach i uniformach
     */
    writeAttribUniLogs() {
        console.log("Attributes: ");
        const numAttribs = this.gl.getProgramParameter(
            this.program,
            this.gl.ACTIVE_ATTRIBUTES
        );
        for (let i = 0; i < numAttribs; ++i) {
            const info = this.gl.getActiveAttrib(this.program, i);
            console.log("name:", info.name, "type:", info.type, "size:", info.size);
        }
        console.log("Uniforms: ");
        const numUniforms = this.gl.getProgramParameter(
            this.program,
            this.gl.ACTIVE_UNIFORMS
        );
        for (let i = 0; i < numUniforms; ++i) {
            const info = this.gl.getActiveUniform(this.program, i);
            console.log("name:", info.name, "type:", info.type, "size:", info.size);
        }
        console.log("vertColor location:", this.gl.getAttribLocation(this.program, "vertColor"))
    }
}

export { WebGL }