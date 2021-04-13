

import { Engine, Cube, BigSquare } from "./engine.js"
//wymiary rysowania figur i inne dane
const LEVEL_X = 7000;
const LEVEL_Y = 7000;
const LEVEL_Z = 10000;
const CUBES_NUMBER = 150;
const START_OFFSET = 200;
const PERSPECTIVE = 300;

/**
 * Stworzenie mapy (figur itp)
 * @param {Engine} engine silnik
 */
function start_game(engine) {
    engine.shapes = []
    for (let i = 0; i < CUBES_NUMBER; i++) {
        let x = Math.floor(PERSPECTIVE + START_OFFSET + Math.random() * (LEVEL_X - (PERSPECTIVE + START_OFFSET)));
        let y = Math.floor(PERSPECTIVE + START_OFFSET + Math.random() * (LEVEL_Y - (PERSPECTIVE + START_OFFSET)));
        let z = Math.floor(PERSPECTIVE + START_OFFSET + Math.random() * (LEVEL_Z - (PERSPECTIVE + START_OFFSET)));
        let r = Math.floor(300 + Math.random() * (700 - 300));
        x -= LEVEL_X / 2;
        y -= LEVEL_Y / 2;
        engine.add_shape(new Cube({ x: x, y: y, z: z }, r, "black"))
    }
    engine.add_shape(new BigSquare({ x: 0, y: 0 }, LEVEL_X + LEVEL_Y, LEVEL_Z, "blue"));
}

function main() {
    const canvas = document.getElementById("mycanvas");
    const engine = new Engine(canvas, PERSPECTIVE);
    const speed_control = document.getElementById("speedControl");
    start_game(engine)

    /**
     * Funkcja rysująca grę
     */
    function animate() {

        engine.draw();
        let collision = engine.check_collisions()
        switch (collision) {
            case "lose": {
                alert("Koliza. Sprobuj ponowie.")
                start_game(engine)
                break;
            }
            case "win": {
                alert("BRAWO!!!")
                start_game(engine)
                break;
            }
        }
        window.requestAnimationFrame(animate);
    }
    //Poruszanie się
    window.addEventListener('keypress', function (e) {
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
    });
    animate();
}



window.onload = main;