


/**
 * Elementy tła
 */
class Background {
    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        this.textured = false;
        this.objects = []
        let background_color = {}
        background_color.textured = false;
        background_color.color = [0, 1, 0]
        background_color.locations = [
            [0, 0],
            [canvas.width, 0],
            [canvas.width, canvas.height],
            [0, canvas.height],
            [0, 0]
        ]
        background_color.draw_type = "TRIANGLE_STRIP"
        background_color.visible = true
        background_color.pos = { x: canvas.width, y: canvas.height }
        background_color.pos.z = 1;
        this.objects.push(background_color)

        let lines_offset = 2;
        let background_lines = {}
        background_lines.textured = false;
        background_lines.color = [1, 1, 1]
        background_lines.locations = [
            [0 + lines_offset, 0 + lines_offset],
            [canvas.width / 2, 0 + lines_offset],
            [canvas.width / 2, canvas.height - lines_offset],
            [0 + lines_offset, canvas.height - lines_offset],
            [0 + lines_offset, 0 + lines_offset],
            [canvas.width - lines_offset, 0 + lines_offset],
            [canvas.width - lines_offset, canvas.height - lines_offset],
            [canvas.width / 2, canvas.height - lines_offset]
        ]
        background_lines.draw_type = "LINE_STRIP"
        background_lines.visible = true
        background_lines.pos = {}
        background_lines.pos.z = 0.9;
        this.objects.push(background_lines)
        this.stars = []
        for (let i = 0; i < 5; i++) {
            let background_star = {}
            background_star.textured = false;
            let w = canvas.width;
            let h = canvas.height;
            background_star.color = [Math.random(), 0, Math.random()]
            var alpha = (2 * Math.PI) / 10;
            var radius = Math.random() * 100 + 20;
            var starXY = [50 + Math.random() * w, Math.random() * (h - 100) + 50]
            background_star.locations = [starXY]
            for (var ii = 11; ii != 0; ii--) {
                var r = radius * (ii % 2 + 1) / 2;
                var omega = alpha * ii;
                background_star.locations.push([(r * Math.sin(omega)) + starXY[0], (r * Math.cos(omega)) + starXY[1]]);
            }
            background_star.draw_type = "TRIANGLE_FAN"
            background_star.visible = true
            background_star.pos = {}
            background_star.pos.z = 0.9;
            this.stars.push(background_star)
            this.objects.push(background_star)
        }

        for (let object of this.objects) {
            object.vertex_list = []
            object.vertex_list = object.locations.flat()
        }
    }
    get_objects() {
        return this.objects
    }
    get_stars() {
        return this.stars
    }
}

class Player {
    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        this.textured = false;
        this.color = [0, 0, 0]
        this.pos = { x: canvas.width / 2, y: 0 + 20, z: -1 }
        this.size = { width: 40, heigth: 20 }
        this.locations = [
            [this.pos.x - this.size.width / 2, this.pos.y - this.size.heigth / 2],
            [this.pos.x + this.size.width / 2, this.pos.y - this.size.heigth / 2],
            [this.pos.x, this.pos.y + this.size.heigth / 2],
        ]
        this.draw_type = "TRIANGLE_STRIP"
        this.visible = true
        this.vertex_list = []
        this.vertex_list = this.locations.flat()

    }
    move(x) {
        this.locations.forEach(position => {
            position[0] += x;
        })
        this.pos.x += x;
        this.vertex_list = []
        for (let i = 0; i < this.locations.length; i++) {
            this.vertex_list.push([...this.locations[i]]);
        }
        this.vertex_list = this.vertex_list.flat()
    }

    get_player() {
        return this
    }
}

class Collectiable {
    /**
         * 
         * @param {HTMLCanvasElement} canvas 
         */
    constructor(canvas, position) {
        this.textured = false;
        this.objects = []
        this.color = [0.2 + Math.random() / 2, 0.2 + Math.random() * 0.1, 0.3 + Math.random() * 0.6]
        this.pos = { x: position.x, y: position.y, z: -0.2 };
        this.size = { width: 20, heigth: 50 }
        this.locations = [
            [this.pos.x - this.size.width / 2, this.pos.y + this.size.heigth / 2],
            [this.pos.x + this.size.width / 2, this.pos.y + this.size.heigth / 2],
            [this.pos.x + this.size.width / 2, this.pos.y - this.size.heigth / 2],
            [this.pos.x, this.pos.y - this.size.heigth / 2 - this.size.heigth / 5],
            [this.pos.x - this.size.width / 2, this.pos.y - this.size.heigth / 2],
        ]
        this.draw_type = "TRIANGLE_FAN"
        this.visible = true
        this.vertex_list = []
        for (let i = 0; i < this.locations.length; i++) {
            this.vertex_list.push([...this.locations[i]]);
        }
        this.vertex_list = this.vertex_list.flat()

    }
    move(y) {
        this.locations.forEach(position => {
            position[1] += y;
        })
        this.pos.y += y;
        this.vertex_list = [];
        this.vertex_list = this.locations.flat()
    }

    get_player() {
        return this
    }
}
export { Background, Player, Collectiable }