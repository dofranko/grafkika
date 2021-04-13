

import { Engine, Cube } from "./engine.js"
import { Turtle3D } from "./turtle3D.js"

const PERSPECTIVE = 500


function main() {
    const canvas = document.getElementById("mycanvas");
    const engine = new Engine(canvas, PERSPECTIVE);
    const speed_control = document.getElementById("speedControl");
    const positionControl = document.getElementById("positionControl");
    const input = document.getElementById("commandInput");
    engine.add_shape(new Cube({ x: 0, y: 0, z: 500 }, 500))//terrarium
    const turtle3D = new Turtle3D(engine, { ...engine.shapes[0].center })

    /**
     * Funkcja rysowania canvasu
     */
    function animate() {

        engine.draw();
        window.requestAnimationFrame(animate);
    }

    /**
     * Aktualizacja wyświetlanych koordynatów pozycji żółwia
     */
    function update_position() {
        positionControl.textContent = `X:${turtle3D.position.x.toFixed(4)}, Y:${turtle3D.position.y.toFixed(4)}, 
        Z:${turtle3D.position.z.toFixed(4)}, r:${turtle3D.rotation}, rUD:${turtle3D.rotation_up_down}`
    }

    /**
     * event listener na komendy wpisywane
     */
    input.addEventListener('keyup', (event) => {
        event.preventDefault();
        if (event.key === 'Enter') {
            turtle3D.do_command(input.value);
            input.value = '';
            update_position();
        }
    });

    /**
     * Przechwycenie przycisków na ruch w świecie
     */
    window.addEventListener('keypress', function (e) {
        if (document.activeElement === input)
            return;
        let speed = parseInt(speed_control.value);
        if (e.key === 'a') {
            engine.move(speed, 0, 0);
        }
        else if (e.key === 'd') {
            engine.move(-speed, 0, 0);
        }
        else if (e.key === 'w') {
            engine.move(0, speed, 0);
        }
        else if (e.key === 's') {
            engine.move(0, -speed, 0);
        }
        else if (e.key === 'u') {
            engine.move(0, 0, -speed);
        }
        else if (e.key === 'j') {
            engine.move(0, 0, speed);
        }
        else if (e.key === 'h') {
            engine.rotate_shapes(-speed, 0, 0);
        }
        else if (e.key === 'k') {
            engine.rotate_shapes(speed, 0, 0);
        }
        else if (e.key === 'y') {
            engine.rotate_shapes(0, -speed, 0);
        }
        else if (e.key === 'i') {
            engine.rotate_shapes(0, speed, 0);
        }
        else if (e.key === 'p') {
            engine.rotate_shapes(0, 0, -speed);
        }
        else if (e.key === 'o') {
            engine.rotate_shapes(0, 0, speed);
        }
        else if (e.key === 'm') {
            turtle3D.do_command("fd 10")
        }
        update_position();
    });

    animate();
    turtle3D.do_command("rt 90")
    update_position();
}



window.onload = main;