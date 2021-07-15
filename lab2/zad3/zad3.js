import { WebGL } from "./simpleWebGl.js"
import { Background, Player, Collectiable } from "./drawable.js"


function main() {
    const canvas = document.getElementById("canvas");
    const info = document.getElementById("info");
    var points = 0;
    info.innerText = "Punkty:" + points
    const webgl = new WebGL(canvas);
    const back = new Background(canvas);
    const player = new Player(canvas);
    const shapes = [...back.get_objects(), player.get_player()]
    const collectibles = [new Collectiable(canvas, { x: canvas.width / 2, y: canvas.height })]
    webgl.draw(shapes);
    var timeToObstacle = 1000
    var lastTime = window.performance.now();


    window.addEventListener('keypress', function (e) {

        if (e.key === 'd') {
            player.move(10)
            webgl.draw(shapes);
        }
        else if (e.key === 'a') {
            player.move(-10)
            webgl.draw(shapes);
        }

    });

    var animate = function (time) {
        var timeDelta = time - lastTime;
        lastTime = time;
        timeToObstacle -= timeDelta;
        if (timeToObstacle < 0) {
            timeToObstacle = 2000 + Math.random() * (1000);
            collectibles.push(new Collectiable(canvas, { x: 20 + Math.random() * (canvas.width - 50), y: canvas.height }))
        }
        for (let i = 0; i < collectibles.length; i++) {
            collectibles[i].move(-0.2 * timeDelta)
            if (collectibles[i].position.y < collectibles[i].size.heigth) {
                if (Math.abs(collectibles[i].position.x - player.position.x) < player.size.width)
                    points += 1
                info.innerText = "Punkty:" + points
                collectibles.splice(i, 1);
            }
        }

        webgl.draw([...shapes, ...collectibles]);
        window.requestAnimationFrame(animate);
    }
    window.requestAnimationFrame(animate);


}

window.onload = main