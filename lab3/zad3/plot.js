/*jshint esversion: 8 */

/**
 * Klasa generująca wykres
 */
class Plot {
    /**
     * 
     * @param {WebGLRenderingContext} gl 
     * @param {DRAW_TYPE} draw_type Preferred "POINTS" | "TRIANGLES"
     * @param {function} my_func funkcja obliczająca z
     */
    constructor(gl, draw_type, my_func) {
        this.draw_type = draw_type;
        this.visible = true;
        this.size = 200;
        this.density = 500;
        this.normals = [];
        this.positions = [];
        this.generatePlot(
            [-8, 8],
            [-8, 8],
            my_func,
        );

        this.color = [1, 0, 0, 1];
        this.translation = [1000, 0, 20];
        this.rotation = [0, 0, 0];

        /* Creating positions buffer */
        this.position_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.positions),
            gl.STATIC_DRAW
        );

        /* Creating normals buffer */
        this.normal_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.normals),
            gl.STATIC_DRAW
        );
    }
    /**
     * Generate plot to display
     * @param {number[]} x_range range of x axis 
     * @param {number[]} y_range range of y axis
     * @param {function} my_func function generating z value
     */
    generatePlot(x_range, y_range, my_func) {
        let plot = [];
        const scale = this.size / Math.abs(x_range[1] - x_range[0]);
        for (let x = 0; x < this.density; x++) {
            for (let y = 0; y < this.density; y++) {
                let value = my_func(
                    x_range[0] + (x * (x_range[1] - x_range[0])) / this.density,
                    y_range[0] + (y * (y_range[1] - y_range[0])) / this.density
                ) * scale;

                if (this.draw_type === DRAW_TYPE.TRIANGLES) {
                    let next_y = null;
                    let next_x = null;
                    let next_yx = null;
                    if (y !== this.density - 1) {
                        next_y = my_func(
                            x_range[0] + (x * (x_range[1] - x_range[0])) / this.density,
                            y_range[0] +
                            ((y + 1) * (y_range[1] - y_range[0])) / this.density
                        ) * scale;
                    }
                    if (x !== this.density - 1) {
                        next_x = my_func(
                            x_range[0] +
                            ((x + 1) * (x_range[1] - x_range[0])) / this.density,
                            y_range[0] + (y * (y_range[1] - y_range[0])) / this.density
                        ) * scale;
                    }
                    if (x !== this.density - 1 && y !== this.density - 1) {
                        next_yx = my_func(
                            x_range[0] +
                            ((x + 1) * (x_range[1] - x_range[0])) / this.density,
                            y_range[0] +
                            ((y + 1) * (y_range[1] - y_range[0])) / this.density
                        ) * scale;
                    }

                    if (next_x !== null && next_y !== null && next_yx !== null) {
                        const triangle_1 = [
                            (x * this.size) / this.density - this.size / 2,
                            (y * this.size) / this.density - this.size / 2,
                            value,
                            ((x + 1) * this.size) / this.density - this.size / 2,
                            (y * this.size) / this.density - this.size / 2,
                            next_x,
                            (x * this.size) / this.density - this.size / 2,
                            ((y + 1) * this.size) / this.density - this.size / 2,
                            next_y,
                        ];

                        const triangle_2 = [
                            ((x + 1) * this.size) / this.density - this.size / 2,
                            ((y + 1) * this.size) / this.density - this.size / 2,
                            next_yx,
                            ((x + 1) * this.size) / this.density - this.size / 2,
                            (y * this.size) / this.density - this.size / 2,
                            next_x,
                            (x * this.size) / this.density - this.size / 2,
                            ((y + 1) * this.size) / this.density - this.size / 2,
                            next_y,
                        ];

                        plot.push(...triangle_1, ...triangle_2);
                        let triangle_1_normals = this.getNormalsFromTriangle(triangle_1);
                        let triangle_2_normals = this.getNormalsFromTriangle(triangle_2, true);

                        this.normals.push(
                            ...triangle_1_normals, ...triangle_1_normals, ...triangle_1_normals,
                            ...triangle_2_normals, ...triangle_2_normals, ...triangle_2_normals,
                        );
                    }
                } else {
                    plot.push(
                        (x * this.size) / this.density - this.size / 2,
                        (y * this.size) / this.density - this.size / 2,
                        value
                    );
                }
            }
        }


        this.positions = plot.map(value => {
            return value / 20;
        });
    }

    /**
     * Generate normal vector of passed triangle
     * @param {number[]} triangle 
     * @param {boolean} swap 
     * @returns {number[]} triangle's normal vector[3] (not normalized)
     */
    getNormalsFromTriangle(triangle, swap = false) {
        let U = [
            triangle[3] - triangle[0],
            triangle[4] - triangle[1],
            triangle[5] - triangle[2],
        ];
        let V = [
            triangle[6] - triangle[0],
            triangle[7] - triangle[1],
            triangle[8] - triangle[2],
        ];

        if (swap) {
            [U, V] = [V, U];
        }

        return [
            U[1] * V[2] - U[2] * V[1],
            U[2] * V[0] - U[0] * V[2],
            U[0] * V[1] - U[1] * V[0],
        ];
    }

}