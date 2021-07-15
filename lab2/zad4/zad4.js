import { WebGL } from "./simpleWebGl.js"
import { Background, Player, Collectiable } from "./drawable.js"

const type = "LINES";




function main() {
    const canvas = document.getElementById("canvas");
    const info = document.getElementById("info");
    var points = 0;
    info.innerText = "Punkty:" + points
    const webgl = new WebGL(canvas);
    const back = new Background(canvas);
    const player = new Player(canvas);
    webgl.bindTextureToObject(player, "./textures/player.png")
    const shapes = [...back.get_objects(), player.get_player()]
    back.get_stars().forEach(star => {
        webgl.bindTextureToObject(star, "./textures/star.png")
    })
    const collectibles = [new Collectiable(canvas, { x: canvas.width / 2, y: canvas.height })]
    webgl.draw([...shapes, ...collectibles]);
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
        else if ("space") {

        }

    });

    var animate = function (time) {
        var timeDelta = time - lastTime;
        lastTime = time;
        timeToObstacle -= timeDelta;
        if (timeToObstacle < 0) {
            timeToObstacle = 2000 + Math.random() * (1000);
            let newC = new Collectiable(canvas, { x: 20 + Math.random() * (canvas.width - 50), y: canvas.height })
            collectibles.push(newC)
            webgl.bindTextureToObject(newC, "./textures/collectible.png")

        }
        for (let i = 0; i < collectibles.length; i++) {
            collectibles[i].move(-0.2 * timeDelta)
            if (collectibles[i].pos.y < collectibles[i].size.heigth / 2) {
                if (Math.abs(collectibles[i].pos.x - player.pos.x) < player.size.width)
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