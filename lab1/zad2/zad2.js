

import { Turtle, Position } from './turtle.js';


/**
 * Funkcja rysująca żółwiem trojkąt Sierpińskiego
 * @param {number} length długość boku trójkąta
 * @param {unmber} depth głębokość rysowania
 * @param {Object} turtle żółw
 */
function draw_sierpinski_triangle(length, depth, turtle) {
    if (length < 1) return
    if (depth == 0) {
        for (let i = 0; i < 3; i++) {
            turtle.do_command("fd " + length)
            turtle.do_command("lt 120")
        }
    }
    else {
        draw_sierpinski_triangle(length / 2, depth - 1, turtle)
        turtle.do_command("fd " + length / 2)
        draw_sierpinski_triangle(length / 2, depth - 1, turtle)
        turtle.do_command("bk " + length / 2)
        turtle.do_command("lt 60")
        turtle.do_command("fd " + length / 2)
        turtle.do_command("rt 60")
        draw_sierpinski_triangle(length / 2, depth - 1, turtle)
        turtle.do_command("lt 60")
        turtle.do_command("bk " + length / 2)
        turtle.do_command("rt 60")
    }


}

/**
 * Funkcja rysująca żółwiem płatek Kocha
 * @param {number} length długość boku kocha
 * @param {unmber} depth głębokość rysowania
 * @param {Object} turtle żółw
 */
function draw_koch_snowflake(length, depth, turtle) {
    if (length < 1) depth = 0;
    if (depth == 0) {
        turtle.do_command("fd " + length)
        return
    }
    length /= 3.0
    draw_koch_snowflake(length, depth - 1, turtle)
    turtle.do_command("lt 60")
    draw_koch_snowflake(length, depth - 1, turtle)
    turtle.do_command("rt 120")
    draw_koch_snowflake(length, depth - 1, turtle)
    turtle.do_command("lt 60")
    draw_koch_snowflake(length, depth - 1, turtle)
}

function main() {
    //[minX, maxX, minY, maxY]
    const resizer = [0, 1000, 0, 1000]
    const canvas = document.getElementById("mycanvas");
    const turtle = new Turtle(canvas, resizer);
    const sierpinski_depth = document.getElementById("sierpinskiDepth");
    const koch_depth = document.getElementById("kochDepth");
    const sierpinski_size = 500
    const koch_size = 500

    //wywoałanie rysowania trójkąta
    turtle.do_command("lt 30")
    draw_sierpinski_triangle(sierpinski_size, sierpinski_depth.value, turtle);
    turtle.do_command("rt 135")
    //wywołąnie rysowanie płatka
    for (let i = 0; i < 3; i++) {
        draw_koch_snowflake(koch_size, koch_depth.value, turtle);
        turtle.do_command("rt 120")
    }

    //Event listenery, które aktualizują figury po zmianie głębokości
    koch_depth.addEventListener("input", () => {
        turtle.do_command("cs");
        turtle.reset_position();
        turtle.do_command("lt 30");
        draw_sierpinski_triangle(sierpinski_size, sierpinski_depth.value, turtle);
        turtle.do_command("rt 135")
        for (let i = 0; i < 3; i++) {
            draw_koch_snowflake(koch_size, koch_depth.value, turtle);
            turtle.do_command("rt 120")
        }
    });
    sierpinski_depth.addEventListener("input", () => {
        turtle.do_command("cs");
        turtle.reset_position();
        turtle.do_command("lt 30");
        draw_sierpinski_triangle(sierpinski_size, sierpinski_depth.value, turtle);
        turtle.do_command("rt 135")
        for (let i = 0; i < 3; i++) {
            draw_koch_snowflake(koch_size, koch_depth.value, turtle);
            turtle.do_command("rt 120")
        }
    });

}



window.onload = main;