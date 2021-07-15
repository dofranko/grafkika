/*jshint esversion: 8 */
function main() {
    let choosen_draw_type = "TRIANGLES";
    let input_area = document.getElementsByTagName("input")[0];
    input_area.value = 'sin(x * 2 + y ** 2)';
    let canvas = document.getElementsByTagName("canvas")[0];
    let selected_shape = document.getElementsByTagName("select")[0];
    let gl = canvas.getContext("webgl");
    let plot = new Plot(gl, choosen_draw_type, (x, y) => Math.sin(x * 2 + y ** 2));
    let engine = new Engine(gl, canvas);
    engine.set_objects([plot]);

    engine.draw();
    window.addEventListener("keypress", (e) => {
        let x_step = 0.05;
        let y_step = 0.05;
        let z_step = 1;
        let rotate_step = 0.05;
        if (e.key === "d") {
            engine.move(x_step, 0, 0);
            engine.draw();
        } else if (e.key === "a") {
            engine.move(-x_step, 0, 0);
            engine.draw();
        } else if (e.key === "w") {
            engine.move(0, y_step, 0);
            engine.draw();
        } else if (e.key === "s") {
            engine.move(0, -y_step, 0);
            engine.draw();
        } else if (e.key === "q") {
            engine.move(0, 0, z_step);
            engine.draw();
        } else if (e.key === "e") {
            engine.move(0, 0, -z_step);
            engine.draw();
        } else if (e.key === "j") {
            engine.rotate(0, rotate_step, 0);
            engine.draw();
        } else if (e.key === "l") {
            engine.rotate(0, -rotate_step, 0);
            engine.draw();
        } else if (e.key === "i") {
            engine.rotate(-rotate_step, 0, 0);
            engine.draw();
        } else if (e.key === "k") {
            engine.rotate(rotate_step, 0, 0);
            engine.draw();
        } else if (e.key === "u") {
            engine.rotate(0, 0, -rotate_step);
            engine.draw();
        } else if (e.key === "o") {
            engine.rotate(0, 0, rotate_step);
            engine.draw();
        }
    });

    input_area.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            let last_plot = plot;
            try {
                with (Math) {
                    plot = new Plot(gl, choosen_draw_type, eval('(x,y)=>' + input_area.value));
                }
                engine.set_objects([plot]);
                engine.draw();
            } catch (error) {
                plot = last_plot;
                engine.set_objects([plot]);
                engine.draw();
                console.log(error);
            }
        }
    });

    selected_shape.addEventListener('change', (event) => {
        choosen_draw_type = selected_shape.value;
        with (Math) {
            plot = new Plot(gl, choosen_draw_type, eval('(x,y)=>' + input_area.value));
        }
        engine.set_objects([plot]);
        engine.draw();
    });
}

window.onload = main;