/*jshint esversion: 8 */

var VERTEX_CHECK = "floor( mod(gl_FragCoord.x+gl_FragCoord.y, 2.0) )";
var IS_STOP = true;
function main() {
    //let choosen_draw_type = "TRIANGLES";
    let input_area = document.getElementsByTagName("input")[0];
    let button_start = document.getElementsByTagName("input")[1];
    let button_stop = document.getElementsByTagName("input")[2];
    let background_color = document.getElementsByTagName("input")[3];
    background_color.value = '[1,1,1]';
    input_area.value = VERTEX_CHECK;
    let canvas = document.getElementsByTagName("canvas")[0];
    //let selected_shape = document.getElementsByTagName("select")[0];
    let gl = canvas.getContext("webgl", { stencil: true });
    let plot = new Plot(gl, DRAW_TYPE.TRIANGLES, (x, y) => Math.sin(x * 2 + y ** 2), false);
    let plot2 = new Plot(gl, DRAW_TYPE.TRIANGLES, (x, y) => Math.sin(x * 2 + y ** 2), true);
    let engine = new Engine(gl, canvas);
    let back = new Background(gl, [1, 1, 1]);
    engine.set_objects(back, [plot, plot2]);

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

    input_area.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            if (!IS_STOP) return;
            VERTEX_CHECK = input_area.value;
            try {
                engine = new Engine(gl, canvas);
                engine.set_objects(back, [plot, plot2]);
                engine.draw();
            } catch (error) {

                console.log(error);
            }
            //IS_STOP = false;
            //window.requestAnimationFrame(animation);
        }
    });
    button_start.addEventListener("click", (e) => {
        if (!IS_STOP) return;
        window.requestAnimationFrame(animation);
        IS_STOP = false;
    });
    button_stop.addEventListener("click", (e) => {
        if (IS_STOP) return;
        IS_STOP = true;
    });

    background_color.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            if (!IS_STOP) return;
            let back1 = back;
            try {
                back = new Background(gl, eval(background_color.value));
                engine.set_objects(back, [plot, plot2]);
                engine.draw();
            } catch (error) {
                back = back1;
                console.log(error);
            }
            //IS_STOP = false;
            //window.requestAnimationFrame(animation);
        }
    });
    /*
        selected_shape.addEventListener('change', (event) => {
            choosen_draw_type = selected_shape.value;
            with (Math) {
                plot = new Plot(gl, choosen_draw_type, eval('(x,y)=>' + input_area.value), true);
                plot2 = new Plot(gl, choosen_draw_type, eval('(x,y)=>' + input_area.value), false);
            }
            engine.set_objects([plot, plot2]);
            engine.draw();
        });
    */
}

window.onload = main;