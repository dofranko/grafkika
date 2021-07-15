/*jshint esversion: 8 */
/**
 * Enum for tri-state values.
 * @readonly
 * @enum {string}
 */
const DRAW_TYPE = Object.freeze({ "TRIANGLES": "TRIANGLES", "POINTS": "POINTS" });


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
        this.background_color = [1, 1, 1];
        let [vertex_code, fragment_code] = this.get_shaders();
        let vertex_shader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertex_shader, vertex_code);
        gl.compileShader(vertex_shader);
        if (!gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(vertex_shader));
            return null;
        }

        let fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragment_shader, fragment_code);
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
                    color: gl.getUniformLocation(program, "u_color"),

                    light_position: gl.getUniformLocation(program, "u_lightPos"),
                    ambient_strength: gl.getUniformLocation(program, "u_ambientStrength"),
                    light_color: gl.getUniformLocation(program, "u_lightColor"),

                    projection: gl.getUniformLocation(program, "u_projection"),
                    view: gl.getUniformLocation(program, "u_view"),
                    model: gl.getUniformLocation(program, "u_model"),

                    fog_near: gl.getUniformLocation(program, "u_fogNear"),
                    fog_far: gl.getUniformLocation(program, "u_fogFar"),
                    fog_color: gl.getUniformLocation(program, "u_fogColor"),

                    first: gl.getUniformLocation(program, "first"),
                },
            },
        };
        /**Dane do shaderów wspólne między obiektami */

        this.program_data = {
            matrixes: {
                projection: get_projection(40, canvas.width / canvas.height, 1, 100),
                view: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -11, 1],
            },
            vectors3f: {
                color: [1, 0.5, 0.9],
                light_color: [1, 1, 1],
                light_position_normalized: normalize([1, 0.3, 0.2]),
                fog_color: [1, 1, 1],
            },
            vectors1f: {
                ambient_strength: 0.4,
                fog_near: 10,
                fog_far: 40,
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
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(true);
        let [bg1, bg2, bg3] = this.background_color;
        gl.clearColor(bg1, bg2, bg3, 1);
        gl.clearDepth(1.0);
        gl.useProgram(this.program_info.program);
        gl.viewport(0.0, 0.0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.objects.forEach(object => {
            gl.uniformMatrix4fv(this.program_info.locations.uniforms.projection, false, this.program_data.matrixes.projection);
            gl.uniformMatrix4fv(this.program_info.locations.uniforms.view, false, this.program_data.matrixes.view);
            gl.uniformMatrix4fv(this.program_info.locations.uniforms.model, false, object.model);

            gl.uniform1f(this.program_info.locations.uniforms.ambient_strength, this.program_data.vectors1f.ambient_strength);
            gl.uniform1f(this.program_info.locations.uniforms.fog_near, this.program_data.vectors1f.fog_near);
            gl.uniform1f(this.program_info.locations.uniforms.fog_far, this.program_data.vectors1f.fog_far);
            gl.uniform1f(this.program_info.locations.uniforms.first, object.first === true ? 1.0 : 0.0);

            let [p1, p2, p3] = this.program_data.vectors3f.light_position_normalized;
            gl.uniform3f(this.program_info.locations.uniforms.light_position, p1, p2, p3);
            let [c1, c2, c3] = this.program_data.vectors3f.color;
            gl.uniform3f(this.program_info.locations.uniforms.color, c1, c2, c3);
            let [lc1, lc2, lc3] = this.program_data.vectors3f.light_color;
            gl.uniform3f(this.program_info.locations.uniforms.light_color, lc1, lc2, lc3);
            let [fc1, fc2, fc3] = this.program_data.vectors3f.fog_color;
            gl.uniform3f(this.program_info.locations.uniforms.fog_color, fc1, fc2, fc3);

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

    get_shaders() {
        var vertex_code = `
        attribute vec3 a_position;
        attribute vec3 a_normal;

        uniform mat4 u_projection;
        uniform mat4 u_view;
        uniform mat4 u_model;

        varying vec3 v_normal;
        varying float v_fogDepth;

        void main(void) {
            gl_Position = u_projection*u_view*u_model*vec4(a_position, 1.0);
            gl_PointSize = 2.0;
            v_normal = a_normal;
            v_fogDepth = -(u_view*u_model*vec4(a_position, 1.0)).z;
        }
        `;
        /** @type {string} */
        var fragment_code = `
        precision mediump float;
        uniform vec3 u_color;

        uniform float u_ambientStrength;
        uniform vec3 u_lightColor;
        uniform vec3 u_lightPos;

        uniform vec3 u_fogColor;
        uniform float u_fogNear;
        uniform float u_fogFar;
        uniform float first;

        varying vec3 v_normal;
        varying float v_fogDepth;

        void main(void) {
            
            vec3 normal = normalize(v_normal);
            vec3 ambient = u_ambientStrength * u_lightColor;

            float diff = max(dot(normal, u_lightPos), 0.0);
            vec3 diffuse = diff * u_lightColor;

            vec3 result = (ambient + diffuse) * u_color;
            
            float fogAmount = smoothstep(u_fogNear, u_fogFar, v_fogDepth);

            gl_FragColor = mix(vec4(result, 0.8), vec4(u_fogColor, 1), fogAmount);
        }
        `;
        return [vertex_code, fragment_code];
    }


    /**
     * @param {any[]} objects
     */
    set_objects(objects) {
        this.objects = objects;
    }

    set_background_color(color) {
        this.background_color = color;
    }

    /**
     * Poruszanie całą sceną
     * 
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    move(object, x, y, z) {
        if (x) {
            moveX(object.model, x);
        }
        if (y) {
            moveY(object.model, y);
        }
        if (z) {
            moveZ(object.model, z);
        }
    }

    /**
     * Obracanie całej sceny
     * 
     * @param {any} x
     * @param {any} y
     * @param {any} z
     */
    rotate(object, x, y, z) {
        if (x) {
            rotateX(object.model, x);
        }
        if (y) {
            rotateY(object.model, y);
        }
        if (z) {
            rotateZ(object.model, z);
        }
    }


}