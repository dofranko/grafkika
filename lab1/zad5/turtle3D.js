

import { Line } from "./engine.js";

/**
 * Żółw 3D i operacje z nim związane
 */
class Turtle3D {
    get is3D() {
        return true;
    }

    constructor(engine, position = { x: 0, y: 0, z: 0 }) {
        this.engine = engine;
        this.position = position
        this.center = position
        this.lines = []

        this.doStroke = true;
        this.engine.add_shape(this);
        this.rotation = 0
        this.rotation_up_down = 0
    }

    /**
     * Rysowanie linii żółwia
     * @param {number} distance odległość rysowania
     */
    line_to(distance) {
        const tmp = { ...this.position };
        let newPos = { ...this.position };
        newPos.x += distance * Math.cos(this.rotation_up_down * Math.PI / 180) * Math.sin(this.rotation * Math.PI / 180);
        newPos.y += distance * Math.sin(this.rotation_up_down * Math.PI / 180) // * Math.cos(this.rotation * Math.PI / 180);
        newPos.z += distance * Math.cos(this.rotation_up_down * Math.PI / 180) * Math.cos(this.rotation * Math.PI / 180);

        //this.engine.undo_rotate();
        let terrarium = this.engine.shapes[0]
        if (!(terrarium.center.x - terrarium.radius / 2 <= newPos.x && newPos.x <= terrarium.center.x + terrarium.radius / 2
            && terrarium.center.y - terrarium.radius / 2 <= newPos.y && newPos.y <= terrarium.center.y + terrarium.radius / 2
            && terrarium.center.z - terrarium.radius / 2 <= newPos.z && newPos.z <= terrarium.center.z + terrarium.radius / 2)) {
            //this.engine.redo_rotate();
            return;
        }
        //this.engine.redo_rotate();
        this.position = { ...newPos }
        if (this.doStroke)
            this.lines.push(new Line(tmp, { x: this.position.x, y: this.position.y, z: this.position.z }))
    }

    /**
     * Obrót żółwia (w płaszczyźnie x y)
     * @param {number} angle kąt w stopniach ° 
     */
    rotate(angle) {
        this.rotation = (this.rotation + ((angle % 360) + 360) % 360) % 360;
    }

    /**
     * Obrót żółwia (w płaszczyźnie góra dół)
     * @param {number} angle kąt w stopniach ° 
     */
    rotate_up_down(angle) {
        this.rotation_up_down = (this.rotation_up_down + ((angle % 360) + 360) % 360) % 360;
    }

    /**
     * Parsowanie komend i wywołanie ich
     * @param {string} input 
     */
    do_command(input) {
        let commands = input.split(";");
        commands.forEach(element => {
            let [command, ...args] = element.replace(/\s+/g, ' ').trim().toLowerCase().split(' ');
            this.exec_command(command, args);
        });
    }

    /**
     * 
     * @param {string} command 
     * @param {string[]} args 
     */
    exec_command(command, args) {
        switch (command) {
            case "fd": {
                this.engine.undo_rotate();
                this.line_to(args[0]);
                this.engine.redo_rotate();
                break;
            }
            case "bk": {
                this.engine.undo_rotate();
                this.line_to(-args[0]);
                this.engine.redo_rotate();
                break;
            }
            case "rt": {
                this.rotate(-args[0]);
                break;
            }
            case "lt": {
                this.rotate(args[0]);
                break;
            }
            case "rd": {
                this.rotate_up_down(args[0])
                break;
            }
            case "ru": {
                this.rotate_up_down(-args[0])
                break;
            }
            case "cs": {
                break;
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
            case "up": {
                this.doStroke = false;
                break;
            }
            case "dn": {
                this.doStroke = true;
                break;
            }
            case "color": {
                this.change_color(args[0]);
                break;
            }
        }

    }


    /**
     * Przetworzenie linii z 3d na 2d i zwrócenie ich kopii
     * @param {number} perspective perspekrywa
     * @returns Lista przetworzonych (projected) linii do wyrenderowania
     */
    get_lines_to_render(perspective) {
        let lines_projected = []
        this.lines.forEach(line => {
            let pojected = line.project(perspective)
            if (pojected != []) {
                lines_projected.push(...pojected);
            }
        })
        return lines_projected;
    }

    /**
     * Poruszenie kształtem
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    move(x, y, z) {
        this.lines.forEach(line => {
            line.move(x, y, z)
        });
        this.position.x += x;
        this.position.y += y;
        this.position.z += z;

    }
    change_color(color) {
        this.style = color;
    }
}

export { Turtle3D };