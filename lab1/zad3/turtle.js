

/**
 * Dwupunktowa pozycja elementu
 */
class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

/**
 * Żółw i operacje z nim związane
 */
class Turtle {
    constructor(canvas, resizer) {
        this.resizer = resizer;
        this.canvas = canvas;
        this.pos = new Position(canvas.clientWidth / 2, canvas.clientHeight / 2);
        this.rotation = 90; //w stopniach(0 -> patrzy w prawo, 90 -> patrzy w góre.. itd)
        this.doStroke = true;
    }

    /**
     * Reset pozycji i rotacji żółwia
     */
    reset_position() {
        this.pos = new Position(this.canvas.clientWidth / 2, this.canvas.clientHeight / 2);
        this.rotation = 90;
    }
    /**
     * Pobranie pozycji żółwia
     * @returns pozycja gracza przeskalowana do własnej skali
     */
    get_position() {
        return new Position(
            this.resizer[0] + this.pos.x / this.canvas.clientWidth * (this.resizer[1] - this.resizer[0]),
            this.resizer[3] - this.pos.y / this.canvas.clientHeight * (this.resizer[3] - this.resizer[2])
        );
    }

    /**
     * Rysowanie linii żółwia
     * @param {number} distance odległość rysowania
     */
    line_to(distance) {
        this.pos.x += (distance * Math.cos(this.rotation * Math.PI / 180)) / (this.resizer[1] - this.resizer[0]) * this.canvas.clientWidth;
        this.pos.y -= distance * Math.sin(this.rotation * Math.PI / 180) / (this.resizer[3] - this.resizer[2]) * this.canvas.clientHeight;
    }

    /**
     * Teleportacja żółwia
     * @param {number} x 
     * @param {number} y 
     */
    go_to(x, y) {
        this.pos.x = x;
        this.pos.y = y;
    }

    /**
     * Obrót żółwia
     * @param {number} angle kąt w stopniach ° 
     */
    rotate(angle) {
        this.rotation = (this.rotation + ((angle % 360) + 360) % 360) % 360;
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
                this.line_to(args[0]);
                break;
            }
            case "bk": {
                this.line_to(-args[0]);
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
            case "cs": {
                this.ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
                break;
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
            case "-----repeat":
            case "----rp": {
                for (let i = 0; i < args[0]; i++) {
                    let [command2, ...args2] = args.slice(1);
                    this.exec_command(command2, args2, true);
                }
                return;
            }
        }

    }

}
export { Turtle, Position };