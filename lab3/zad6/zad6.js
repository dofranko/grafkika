/*jshint esversion: 8 */

var VERTEX_CHECK = "floor( mod(gl_FragCoord.x+gl_FragCoord.y, 2.0) )";

function main() {
    let canvas = document.getElementsByTagName("canvas")[0];
    let gl = canvas.getContext("webgl");
    let input_area = document.getElementsByTagName("input")[0];
    input_area.value = 'sin(x * 2 + y ** 2)';
    let plot = new Plot(gl, DRAW_TYPE.TRIANGLES, (x, y) => Math.sin(x * 2 + y ** 2), false);
    let plot2 = new Plot(gl, DRAW_TYPE.TRIANGLES, (x, y) => Math.sin(x * 2 + y ** 2), true);
    let engine = new Engine(gl, canvas);
    engine.set_objects([plot, plot2]);

    engine.move(plot, 0.2, 0.05, 0);
    engine.draw();
    window.addEventListener("keypress", (e) => {
        let x_step = 0.05;
        let y_step = 0.05;
        let z_step = 0.05;
        let rotate_step = 0.05;
        if (e.key === "d") {
            engine.move(plot, x_step, 0, 0);
            engine.move(plot2, x_step, 0, 0);
            engine.draw();
        } else if (e.key === "a") {
            engine.move(plot, -x_step, 0, 0);
            engine.move(plot2, -x_step, 0, 0);
            engine.draw();
        } else if (e.key === "w") {
            engine.move(plot, 0, y_step, 0);
            engine.move(plot2, 0, y_step, 0);

            engine.draw();
        } else if (e.key === "s") {
            engine.move(plot, 0, -y_step, 0);
            engine.move(plot2, 0, -y_step, 0);

            engine.draw();
        } else if (e.key === "q") {
            engine.move(plot, 0, 0, z_step);
            engine.move(plot2, 0, 0, z_step);

            engine.draw();
        } else if (e.key === "e") {
            engine.move(plot, 0, 0, -z_step);
            engine.move(plot2, 0, 0, -z_step);

            engine.draw();
        } else if (e.key === "j") {
            engine.rotate(plot, 0, rotate_step, 0);
            engine.rotate(plot2, 0, rotate_step, 0);

            engine.draw();
        } else if (e.key === "l") {
            engine.rotate(plot, 0, -rotate_step, 0);
            engine.rotate(plot2, 0, -rotate_step, 0);

            engine.draw();
        } else if (e.key === "i") {
            engine.rotate(plot, -rotate_step, 0, 0);
            engine.rotate(plot2, -rotate_step, 0, 0);

            engine.draw();
        } else if (e.key === "k") {
            engine.rotate(plot, rotate_step, 0, 0);
            engine.rotate(plot2, rotate_step, 0, 0);

            engine.draw();
        } else if (e.key === "u") {
            engine.rotate(plot, 0, 0, -rotate_step);
            engine.rotate(plot2, 0, 0, -rotate_step);

            engine.draw();
        } else if (e.key === "o") {
            engine.rotate(plot, 0, 0, rotate_step);
            engine.rotate(plot2, 0, 0, rotate_step);

            engine.draw();
        }
    });

    input_area.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            let last_plot = plot;
            let last_plot2 = plot2;
            try {
                with (Math) {
                    plot = new Plot(gl, "TRIANGLES", eval('(x,y)=>' + input_area.value), false);
                    plot2 = new Plot(gl, "TRIANGLES", eval('(x,y)=>' + input_area.value), true);
                }
                engine.move(plot, 0.2, 0.05, 0);
                engine.set_objects([plot, plot2]);
                engine.draw();
            } catch (error) {
                plot = last_plot;
                plot2 = last_plot2;
                engine.move(plot, 0.2, 0.05, 0);
                engine.set_objects([plot, plot2]);
                engine.draw();
                console.log(error);
            }
        }
    });
}

window.onload = main;