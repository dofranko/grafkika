import { WebGL } from "./simpleWebGl.js"
import { Drawable } from "./drawable.js"

const type = "LINES";

/**
 * Sprawdzenie który radiobutton jest wciśnięty
 * @param {*} radioButtons 
 * @returns 
 */
function getCheckedNumber(radioButtons) {
    let i = 0;
    for (let button of radioButtons) {
        if (button.checked)
            return i;
        i++;
    }
}

/**
 * Stworzenie od nowa kształtów
 * @param {*} shape 
 * @returns 
 */
function redraw(shape) {
    let array = []
    if (shape == "sierpinski") {
        for (let i = 1; i <= 8; i++) {
            let new_sierp = new Drawable({ x: canvas.clientWidth / 2 + 150, y: canvas.clientHeight / 2 - 150, z: -1.0 + i * 0.2 }, [1 - i * 0.1, Math.random(), i * 0.1], true);
            new_sierp.draw_sierpinski(300 + 20 * i, i);
            array.push(new_sierp);
        }
    }
    else if (shape == "koch") {
        for (let i = 1; i <= 8; i++) {
            let new_sierp = new Drawable({ x: canvas.clientWidth / 2 + 300, y: canvas.clientHeight / 2 + 100, z: -1.0 + i * 0.2 }, [1 - i * 0.1, Math.random(), i * 0.1], true);
            new_sierp.draw_koch(300 + 20 * i, i);
            array.push(new_sierp);
        }
    }
    return array;
}

function main() {
    const canvas = document.getElementById("canvas");
    const info = document.getElementById("info");
    const webgl = new WebGL(canvas);
    const selected_shape = document.getElementById("shapename");

    const radioButtons = []
    for (let i = 1; i <= 8; i++) {
        radioButtons.push(document.getElementById(`sierp${i}`))
    }

    const actual_shapes = redraw(selected_shape.value);

    window.addEventListener('keypress', function (e) {
        let num = getCheckedNumber(radioButtons);
        if (e.key === 'd') {
            actual_shapes[num].move(10, 0);
            webgl.draw(actual_shapes, type);
        }
        else if (e.key === 'a') {
            actual_shapes[num].move(-10, 0);
            webgl.draw(actual_shapes, type);
        }
        else if (e.key === 'w') {
            actual_shapes[num].move(0, 10);
            webgl.draw(actual_shapes, type);
        }
        else if (e.key === 's') {
            actual_shapes[num].move(0, -10);
            webgl.draw(actual_shapes, type);
        }
        else if (e.key === 'z') {
            actual_shapes[num].move(0, 0, -0.1);
            webgl.draw(actual_shapes, type);
        }
        else if (e.key === 'c') {
            actual_shapes[num].move(0, 0, 0.1);
            webgl.draw(actual_shapes, type);
        }

    });

    selected_shape.addEventListener('change', (event) => {
        actual_shapes.length = 0
        let new_array = redraw(selected_shape.value);
        new_array.forEach(element => {
            actual_shapes.push(element);
        })
        webgl.draw(actual_shapes, type);
    });

    webgl.draw(actual_shapes, type);
    //info.textContent = type;

}

window.onload = main