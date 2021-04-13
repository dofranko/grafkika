

import { Turtle, Position } from './turtle.js';

/**
 * Funkcja tworząca punkty dla trójkąta Sierpińskiego
 * @param {number} length długość boku trójkąta
 * @param {unmber} depth głębokość rysowania
 * @param {Object} turtle żółw
 */
function draw_sierpinski_triangle(length, depth, turtle, result) {
    if (length < 1) return
    if (depth == 0) {
        for (let i = 0; i < 3; i++) {
            turtle.do_command("fd " + length)
            push_pos(turtle, result)
            turtle.do_command("lt 120")
        }
    }
    else {
        draw_sierpinski_triangle(length / 2, depth - 1, turtle, result)
        turtle.do_command("fd " + length / 2)
        push_pos(turtle, result)
        draw_sierpinski_triangle(length / 2, depth - 1, turtle, result)
        turtle.do_command("bk " + length / 2)
        push_pos(turtle, result)
        turtle.do_command("lt 60")
        turtle.do_command("fd " + length / 2)
        push_pos(turtle, result)
        turtle.do_command("rt 60")
        draw_sierpinski_triangle(length / 2, depth - 1, turtle, result)
        turtle.do_command("lt 60")
        turtle.do_command("bk " + length / 2)
        push_pos(turtle, result)
        turtle.do_command("rt 60")
    }


}

/**
 * Funkcja tworząca punkty dla płatka Kocha
 * @param {number} length długość boku kocha
 * @param {unmber} depth głębokość rysowania
 * @param {Object} turtle żółw
 */
function draw_koch_snowflake(length, depth, turtle, result) {
    if (length < 1) depth = 0;
    if (depth == 0) {
        turtle.do_command("fd " + length)
        push_pos(turtle, result)
        return
    }
    length /= 3.0
    draw_koch_snowflake(length, depth - 1, turtle, result)
    turtle.do_command("lt 60")
    draw_koch_snowflake(length, depth - 1, turtle, result)
    turtle.do_command("rt 120")
    draw_koch_snowflake(length, depth - 1, turtle, result)
    turtle.do_command("lt 60")
    draw_koch_snowflake(length, depth - 1, turtle, result)
}

/**
 * Dodanie punktu żółwia do tablicy
 * @param {Object} turtle żółw
 * @param {string[]} array tablica punktów
 */
function push_pos(turtle, array) {
    array.push(`${turtle.pos.x.toFixed(2)},${turtle.pos.y.toFixed(2)}`)
}

/**
 * Przetworzenie tablicy punktów na string do svg
 * @param {string[]} result tablica z punktami
 * @returns  string z punktami przygotowanymi pod svg
 */
function get_result_points(result) {
    var points = ""
    for (let i = 0; i < result.length; i++) {
        points += result[i] + " "
    }
    result = []
    return points;
}
function main() {
    //[minX, maxX, minY, maxY]
    const resizer = [0, 1000, 0, 1000]
    const canvas = document.getElementById("mycanvas");
    const svg = document.getElementById("mysvg");
    const turtle = new Turtle(svg, resizer);
    const sierpinski_depth = document.getElementById("sierpinskiDepth");
    const koch_depth = document.getElementById("kochDepth");
    const sierpinski_size = 500
    const koch_size = 500
    var points = ""
    var result = []

    turtle.do_command("lt 30")

    draw_sierpinski_triangle(sierpinski_size, sierpinski_depth.value, turtle, result);

    points = get_result_points(result);
    //W ten sposób odbywa się rysowanie w svg
    svg.innerHTML = `<polyline points = "${points}" style="fill: none; stroke: black; stroke-width: 1px">`;
    turtle.do_command("rt 135")
    for (let i = 0; i < 3; i++) {
        draw_koch_snowflake(koch_size, koch_depth.value, turtle, result);
        turtle.do_command("rt 120")
    }
    points += " " + get_result_points(result)
    svg.innerHTML = `<polyline points = "${points}" style="fill: none; stroke: black; stroke-width: 1px">`;


    koch_depth.addEventListener("input", () => {
        result = []
        turtle.reset_position();
        turtle.do_command("lt 30");
        draw_sierpinski_triangle(sierpinski_size, sierpinski_depth.value, turtle, result);
        points = get_result_points(result);
        turtle.do_command("rt 135")
        for (let i = 0; i < 3; i++) {
            draw_koch_snowflake(koch_size, koch_depth.value, turtle, result);
            turtle.do_command("rt 120")
        }
        points += " " + get_result_points(result);
        svg.innerHTML = `<polyline points = "${points}" style="fill: none; stroke: black; stroke-width: 1px">`;
    });
    sierpinski_depth.addEventListener("input", () => {
        result = []
        turtle.reset_position();
        turtle.do_command("lt 30");
        draw_sierpinski_triangle(sierpinski_size, sierpinski_depth.value, turtle, result);
        points = get_result_points(result);
        turtle.do_command("rt 135")
        for (let i = 0; i < 3; i++) {
            draw_koch_snowflake(koch_size, koch_depth.value, turtle, result);
            turtle.do_command("rt 120")
        }
        points += " " + get_result_points(result);
        svg.innerHTML = `<polyline points = "${points}" style="fill: none; stroke: black; stroke-width: 1px">`;
    });

}



window.onload = main;