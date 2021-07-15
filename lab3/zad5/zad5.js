/*jshint esversion: 8 */

var VERTEX_CHECK = "floor( mod(gl_FragCoord.x+gl_FragCoord.y, 2.0) )";
var IS_STOP = false;
function main() {
    let canvas = document.getElementsByTagName("canvas")[0];
    let background_color = document.getElementsByTagName("input")[0];
    background_color.value = '[1,1,1]';
    let gl = canvas.getContext("webgl");
    let plot = new Plot(gl, DRAW_TYPE.TRIANGLES, false);
    let plot2 = new Plot(gl, DRAW_TYPE.TRIANGLES, true);
    let engine = new Engine(gl, canvas);
    engine.set_objects([plot, plot2]);

    engine.draw();
    var animation = (time) => {
        if (IS_STOP) {
            //window.requestAnimationFrame(animation);
            return;
        }
        let rotate_step = 0.01;
        engine.rotate(plot, 0, -rotate_step, 0);
        engine.rotate(plot2, 0, rotate_step, 0);
        engine.draw();
        window.requestAnimationFrame(animation);
    };

    window.requestAnimationFrame(animation);
    window.addEventListener("keypress", (e) => {
        let x_step = 0.05;
        let y_step = 0.05;
        let z_step = 1;
        let rotate_step = 0.05;
        if (e.key === "d") {
            engine.move(plot, x_step, 0, 0);
            engine.draw();
        } else if (e.key === "a") {
            engine.move(plot, -x_step, 0, 0);
            engine.draw();
        } else if (e.key === "w") {
            engine.move(plot, 0, y_step, 0);
            engine.draw();
        } else if (e.key === "s") {
            engine.move(plot, 0, -y_step, 0);
            engine.draw();
        } else if (e.key === "q") {
            engine.move(plot, 0, 0, z_step);
            engine.draw();
        } else if (e.key === "e") {
            engine.move(plot, 0, 0, -z_step);
            engine.draw();
        } else if (e.key === "j") {
            engine.rotate(plot, 0, rotate_step, 0);
            engine.draw();
        } else if (e.key === "l") {
            engine.rotate(plot, 0, -rotate_step, 0);
            engine.draw();
        } else if (e.key === "i") {
            engine.rotate(plot, -rotate_step, 0, 0);
            engine.draw();
        } else if (e.key === "k") {
            engine.rotate(plot, rotate_step, 0, 0);
            engine.draw();
        } else if (e.key === "u") {
            engine.rotate(plot, 0, 0, -rotate_step);
            engine.draw();
        } else if (e.key === "o") {
            engine.rotate(plot, 0, 0, rotate_step);
            engine.draw();
        }
    });


    background_color.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {

            try {
                engine.set_background_color(eval(background_color.value));
            } catch (error) {
                console.log(error);
            }
            //IS_STOP = false;
            //window.requestAnimationFrame(animation);
        }
    });
}

window.onload = main;