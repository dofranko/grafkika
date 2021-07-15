/**
 * 
 * @returns shadery jako tekst
 */
function getShadersStrings() {
    return {
        vertex_shader_string: `
            precision mediump float;

            attribute vec2 a_position;
            attribute vec2 a_texcoord;

            uniform vec2 u_resolution;
            uniform float u_depth;

            varying vec2 v_texcoord;
            
            void main() {
                gl_Position = vec4((a_position/u_resolution)*2.0-1.0, u_depth ,1.0);
                gl_PointSize = 5.0;

                // Pass the texcoord to the fragment shader.
                v_texcoord = a_texcoord;    
            }
        `,
        fragment_shader_string: `
            precision mediump float;

            uniform vec3 u_color;

            void main() {
                gl_FragColor = vec4(u_color, 1.0);
            }
        `,
        textured_fragment_shader_string: `
            precision mediump float;
            
            // The texture.
            uniform sampler2D u_texture;

            varying vec2 v_texcoord;

            void main() {
                gl_FragColor = texture2D(u_texture, v_texcoord);
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
        //#region Normal Program - program bez textur
        //#region SHADERSSS - stworzenie shaderów
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
            attributes: {
                position: gl.getAttribLocation(this.program, "a_position"),
            },
            uniforms: {
                depth: gl.getUniformLocation(this.program, "u_depth"),
                resolution: gl.getUniformLocation(this.program, "u_resolution"),
                color: gl.getUniformLocation(this.program, "u_color"),
            }
        };
        //#endregion

        //#region Textured Program - program z texturami
        //#region SHADERSSS
        const textured_vertex_shader = gl.createShader(gl.VERTEX_SHADER);
        const textured_fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(textured_vertex_shader, shaders_strings.vertex_shader_string);
        gl.shaderSource(textured_fragment_shader, shaders_strings.textured_fragment_shader_string);

        gl.compileShader(textured_vertex_shader);
        if (!gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS)) {
            console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertex_shader));
            return;
        }
        gl.compileShader(textured_fragment_shader);
        if (!gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS)) {
            console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragment_shader));
            return;
        }
        //#endregion

        //#region PROGRAMMM
        const textured_program = gl.createProgram();
        gl.attachShader(textured_program, textured_vertex_shader);
        gl.attachShader(textured_program, textured_fragment_shader);

        gl.linkProgram(textured_program);
        if (!gl.getProgramParameter(textured_program, gl.LINK_STATUS)) {
            console.error('ERROR linking program!', gl.getProgramInfoLog(textured_program));
            return;
        }
        gl.validateProgram(textured_program);
        if (!gl.getProgramParameter(textured_program, gl.VALIDATE_STATUS)) {
            console.error('ERROR validating program!', gl.getProgramInfoLog(textured_program));
            return;
        }
        //#endregion


        this.textured_program = textured_program;
        this.textured_program_info = {
            program: this.textured_program,
            attributes: {
                position: gl.getAttribLocation(this.textured_program, "a_position"),
                texcords: gl.getAttribLocation(this.textured_program, "a_texcoord"),
            },
            uniforms: {
                depth: gl.getUniformLocation(this.textured_program, "u_depth"),
                resolution: gl.getUniformLocation(this.textured_program, "u_resolution"),
                texture: gl.getUniformLocation(this.textured_program, "u_texture"),
            }
        };
        //#endregion
    }

    /**
     * Rysowanie figur
     * @param {*} drawables 
     */
    draw(drawables) {
        const gl = this.gl
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        drawables.forEach(drawable => {
            gl.useProgram(this.program);

            if (drawable.visible === false) return;
            let data_array = drawable.vertex_list;
            let just_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, just_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data_array), gl.STATIC_DRAW);


            if (drawable.textured) {
                //jeżeli oteksturowany
                gl.useProgram(this.textured_program);
                gl.enableVertexAttribArray(this.textured_program_info.attributes.position);
                gl.vertexAttribPointer(
                    this.textured_program_info.attributes.position, //lokacja atrybutu
                    2, // liczba elementów per atrybut
                    gl.FLOAT, //typ elemntów
                    gl.FALSE, //normalizacja
                    2 * Float32Array.BYTES_PER_ELEMENT, //rozmiar każdego vertexu
                    0 //offset w tablicy
                );
                //Wrzucenie texcordów i textury
                gl.enableVertexAttribArray(this.textured_program_info.attributes.texcords);
                let texcoordBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(drawable.texcoords), gl.STATIC_DRAW);
                gl.vertexAttribPointer(
                    this.textured_program_info.attributes.texcords,
                    2, // liczba elementów per atrybut
                    gl.FLOAT, //typ elemntów
                    gl.FALSE, //normalizacja
                    2 * Float32Array.BYTES_PER_ELEMENT, //rozmiar każdego vertexu
                    0 //offset w tablicy
                );

                gl.bindTexture(gl.TEXTURE_2D, drawable.texture);
                gl.uniform1i(this.textured_program_info.uniforms.texture, 0);
                gl.uniform1f(this.textured_program_info.uniforms.depth, drawable.pos.z);
                gl.uniform2f(
                    this.textured_program_info.uniforms.resolution,
                    gl.canvas.width,
                    gl.canvas.height
                );
                gl.lineWidth(5);

                gl.drawArrays(gl[drawable.draw_type], 0, data_array.length / 2);
                gl.disableVertexAttribArray(this.textured_program_info.attributes.texcords);
            }
            else {
                //gdy zwykły 
                gl.useProgram(this.program);
                gl.enableVertexAttribArray(this.program_info.attributes.position);
                gl.vertexAttribPointer(
                    this.program_info.attributes.position, //lokacja atrybutu
                    2, // liczba elementów per atrybut
                    gl.FLOAT, //typ elemntów
                    gl.FALSE, //normalizacja
                    2 * Float32Array.BYTES_PER_ELEMENT, //rozmiar każdego vertexu
                    0 //offset w tablicy
                );
                gl.uniform3f(this.program_info.uniforms.color, ...drawable.color);
                gl.uniform1f(this.program_info.uniforms.depth, drawable.pos.z);
                gl.uniform2f(
                    this.program_info.uniforms.resolution,
                    gl.canvas.width,
                    gl.canvas.height
                );
                gl.lineWidth(5);

                gl.drawArrays(gl[drawable.draw_type], 0, data_array.length / 2);
                gl.disableVertexAttribArray(this.program_info.attributes.position);
            }

        });
    }


    /**
     * Zbindowanie textury do obiektu
     * @param {*} object obiekt, który ma zostać otexturowany
     * @param {*} textureSrc ścieżka do textury
     */
    bindTextureToObject(object, textureSrc) {
        object.textured = true;
        //Koordynaty "zbierania" textury 
        object.texcoords = [0, 0, 1, 0, 0.5, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0,];
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            1,
            1,
            0,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            new Uint8Array([0, 255, 0, 255])
        );

        const image = new Image();
        image.src = textureSrc;
        image.addEventListener("load", () => {
            //Załadowanie textury gdy obrazek gotowy
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                0,
                this.gl.RGBA,
                this.gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                image
            );
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        });

        object.texture = texture;
    }
}

export { WebGL }