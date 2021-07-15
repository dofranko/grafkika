/*jshint esversion: 8 */
/**
 * Enum for webgl draw-types.
 * @readonly
 * @enum {string}
 */
const DRAW_TYPE = Object.freeze({ "TRIANGLES": "TRIANGLES", "POINTS": "POINTS" });

/** @type {string}  kod vertex shadera*/
var vertex_shader_code = `
        attribute vec3 a_position;
        attribute vec3 a_normal;
        uniform mat4 u_projection;
        uniform mat4 u_view;
        uniform mat4 u_model;
        varying vec3 v_normal;

        void main(void) {
            gl_Position = u_projection*u_view*u_model*vec4(a_position, 1.0);
            gl_PointSize = 2.0;
            v_normal = a_normal;
        }
        `;

/** @type {string} kod fragment shadera*/
var fragment_shader_code = `
        precision mediump float;
        uniform vec3 u_color;
        uniform float u_ambientStrength;
        uniform vec3 u_lightColor;
        uniform vec3 u_lightPos;
        
        varying vec3 v_normal;
        void main(void) {
            vec3 normal = normalize(v_normal);
            vec3 ambient = u_ambientStrength * u_lightColor;

            float diff = max(dot(normal, u_lightPos), 0.0);
            vec3 diffuse = diff * u_lightColor;

            vec3 result = (ambient + diffuse) * u_color;
            
            gl_FragColor = vec4(result, 1.0);
        }
        `;

/**
 * Klasa silnika do renderowania
 */
class Engine {

    /**
     * 
     * @param {WebGLRenderingContext} gl 
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(gl, canvas) {
        this.gl = gl;
        this.canvas = canvas;
        /** @type {Plot[]} */
        this.objects = [];

        //#region generating program
        let vertex_shader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertex_shader, vertex_shader_code);
        gl.compileShader(vertex_shader);
        if (!gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(vertex_shader));
            return null;
        }
        let fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragment_shader, fragment_shader_code);
        gl.compileShader(fragment_shader);
        if (!gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(fragment_shader));
            return null;
        }

        let program = gl.createProgram();
        gl.attachShader(program, vertex_shader);
        gl.attachShader(program, fragment_shader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log("Could not initialise shaders");
            return null;
        }
        //#endregion

        /**Informacje o programie, głównie lokacje w shaderach */
        this.program_info = {
            program: program,
            framgnet_shader: fragment_shader,
            vertex_shader: vertex_shader,
            locations: {
                attributes: {
                    position: gl.getAttribLocation(program, "a_position"),
                    normal: gl.getAttribLocation(program, "a_normal"),
                },
                uniforms: {
                    light_position: gl.getUniformLocation(program, "u_lightPos"),
                    color: gl.getUniformLocation(program, "u_color"),
                    ambient_strength: gl.getUniformLocation(program, "u_ambientStrength"),
                    light_color: gl.getUniformLocation(program, "u_lightColor"),
                    projection: gl.getUniformLocation(program, "u_projection"),
                    view: gl.getUniformLocation(program, "u_view"),
                    model: gl.getUniformLocation(program, "u_model"),
                },
            },
        };
        /**Dane do shaderów wspólne między obiektami */
        this.program_data = {
            matrixes: {
                projection: get_projection(40, canvas.width / canvas.height, 1, 100),
                model: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
                view: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -11, 1],
            },
            vectors3f: {
                light_position_normalized: normalize([1, 0.3, 0.2]),
                color: [1, 0.5, 0.9],
                light_color: [1, 1, 1],
            },
            vectors1f: {
                ambient_strength: 0.4,
            }
        };
    }

    /**
     * Rysowanie sceny
     */
    draw() {
        let gl = this.gl;
        let canvas = this.canvas;
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearColor(0, 0, 0, 0);
        gl.clearDepth(1.0);

        gl.useProgram(this.program_info.program);
        gl.viewport(0.0, 0.0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.objects.forEach(object => {
            gl.uniformMatrix4fv(this.program_info.locations.uniforms.projection, false, this.program_data.matrixes.projection);
            gl.uniformMatrix4fv(this.program_info.locations.uniforms.view, false, this.program_data.matrixes.view);
            gl.uniformMatrix4fv(this.program_info.locations.uniforms.model, false, this.program_data.matrixes.model);

            gl.uniform1f(this.program_info.locations.uniforms.ambient_strength, this.program_data.vectors1f.ambient_strength);

            let [p1, p2, p3] = this.program_data.vectors3f.light_position_normalized;
            gl.uniform3f(this.program_info.locations.uniforms.light_position, p1, p2, p3);
            let [c1, c2, c3] = this.program_data.vectors3f.color;
            gl.uniform3f(this.program_info.locations.uniforms.color, c1, c2, c3);
            let [lc1, lc2, lc3] = this.program_data.vectors3f.light_color;
            gl.uniform3f(this.program_info.locations.uniforms.light_color, lc1, lc2, lc3);

            gl.enableVertexAttribArray(this.program_info.locations.attributes.position);
            gl.bindBuffer(gl.ARRAY_BUFFER, object.position_buffer);
            gl.vertexAttribPointer(this.program_info.locations.attributes.position, 3, gl.FLOAT, false, 0, 0);
            if (object.draw_type === DRAW_TYPE.TRIANGLES) {
                gl.enableVertexAttribArray(this.program_info.locations.attributes.normal);
                gl.bindBuffer(gl.ARRAY_BUFFER, object.normal_buffer);
                gl.vertexAttribPointer(this.program_info.locations.attributes.normal, 3, gl.FLOAT, false, 0, 0);
            } else {
                gl.disableVertexAttribArray(this.program_info.locations.attributes.normal);
            }
            gl.drawArrays(gl[object.draw_type], 0, object.positions.length / 3);
        });
    }

    /**
     * @param {any[]} objects Ustawienie obiektów do rysowania
     */
    set_objects(objects) {
        this.objects = objects;
    }

    /**
     * Poruszanie całą sceną
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    move(x, y, z) {
        if (x) {
            moveX(this.program_data.matrixes.model, x);
        }
        if (y) {
            moveY(this.program_data.matrixes.model, y);
        }
        if (z) {
            moveZ(this.program_data.matrixes.model, z);
        }
    }

    /**
     * Obracanie całej sceny
     * @param {any} x
     * @param {any} y
     * @param {any} z
     */
    rotate(x, y, z) {
        if (x) {
            rotateX(this.program_data.matrixes.model, x);
        }
        if (y) {
            rotateY(this.program_data.matrixes.model, y);
        }
        if (z) {
            rotateZ(this.program_data.matrixes.model, z);
        }
    }


}