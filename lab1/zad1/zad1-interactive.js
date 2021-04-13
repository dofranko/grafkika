

import { Turtle, Position } from './turtle.js';



function main() {
    //[minX, maxX, minY, maxY]
    const resizer = [0, 100, 0, 100]
    const canvas = document.getElementById("mycanvas");
    const turtle = new Turtle(canvas, resizer);
    const input = document.getElementById("commandInput");
    const lineWidthControl = document.getElementById("lineWidthControl");
    const positionControl = document.getElementById("positionControl");
    const windowResizer = document.getElementById("windowResizer");
    /**
     * Funkcja aktualizująca pozycję żółwia
     */
    const updateTurtlePosition = () => {
        let tmppos = turtle.get_position();
        windowResizer.textContent = `Wymiary: X:(${resizer[0]}, ${resizer[1]}), Y:(${resizer[2]}, ${resizer[3]})`;
        positionControl.textContent = `x: ${tmppos.x.toFixed(4)}; y: ${tmppos.y.toFixed(4)}; r: ${turtle.rotation}`
    }
    updateTurtlePosition();

    //Event listener, który wysyła komendę do żółwia po naciśnięciu enter
    input.addEventListener('keyup', (event) => {
        event.preventDefault();
        if (event.key === 'Enter') {
            turtle.change_line_width(lineWidthControl.value);
            turtle.do_command(input.value);
            input.value = '';
            updateTurtlePosition();
        }
    });
}



window.onload = main;