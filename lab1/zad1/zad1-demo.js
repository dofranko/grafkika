
import { Turtle, Position } from './turtle.js';

/**
 * Rysowania przykladowego rysunku
 * @param {Object} turtle - żółw
 */
function demo(turtle) {
    for (let i = 0; i < 10; i++) {
        turtle.do_command("fd 7");
        turtle.do_command("lt 36");
    }

    turtle.change_color("blue")
    for (let i = 0; i < 2; i++) {
        turtle.do_command("rt 60")
        turtle.do_command("fd 20")
        turtle.do_command("rt 120")
        turtle.do_command("fd 40")
    }

    turtle.reset_position();
    turtle.change_color("black");
    turtle.do_command("up");
    turtle.do_command("fd 17");
    turtle.do_command("dn");
    turtle.change_line_width(3);
    for (let i = 0; i < 5; i++) {
        turtle.do_command("fd 20");
        turtle.do_command("lt 72");
    }

}


function main() {
    //[minX, maxX, minY, maxY]
    const resizer = [0, 100, 0, 100]
    const canvas = document.getElementById("mycanvas");
    const turtle = new Turtle(canvas, resizer);

    demo(turtle);
}



window.onload = main;