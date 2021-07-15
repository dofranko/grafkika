import { WebGL } from "./simpleWebGl.js"

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const types = [
    "POINTS",
    "LINE_STRIP",
    "LINE_LOOP",
    "LINES",
    "TRIANGLE_STRIP",
    "TRIANGLE_FAN",
    "TRIANGLES",
]

const vertex_list = [
    // X, Y,       R, G, B
    10, 10, Math.random(), Math.random(), Math.random(),
    500, 500, Math.random(), Math.random(), Math.random(),
    100, 250, Math.random(), Math.random(), Math.random(),

    600, 400, Math.random(), Math.random(), Math.random(),
    500, 500, Math.random(), Math.random(), Math.random(),
    0, 0, Math.random(), Math.random(), Math.random(),

    700, 400, Math.random(), Math.random(), Math.random(),
    111, 100, Math.random(), Math.random(), Math.random(),
    10, 450, Math.random(), Math.random(), Math.random(),


]
var type = 0;
function main() {
    const canvas = document.getElementById("canvas");
    const info = document.getElementById("info");
    const webgl = new WebGL(canvas);
    webgl.draw(vertex_list, types[type]);
    info.textContent = types[type];

    canvas.onclick = function () {
        type++;
        type = type % types.length;
        webgl.draw(vertex_list, types[type]);
        info.textContent = types[type];
    }

    webgl.writeAttribUniLogs();
}

window.onload = main