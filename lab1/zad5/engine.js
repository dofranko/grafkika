

import { Turtle3D } from "./turtle3D.js";

/**
 * Klasa silnika 3d
 */
class Engine {
    constructor(canvas, perspective) {
        this.context = canvas.getContext("2d");
        this.height_diff = canvas.height / 2;
        this.width_diff = canvas.width / 2;
        //lista obrotów - potrzebna do prawidłowego rysowania żółwia
        this.rotation_list = []
        //tablica kształtów do rysowania (element 0 to "terrarium")
        this.shapes = [];
        this.perspective = perspective;
    }

    /**
     * Renderowanie linii na canvasie
     * @param {Line[]} lines tablica linii do rysowania 
     * @param {string} style styl rysowania
     */
    render(lines, style) {
        this.context.beginPath();
        lines.forEach(line => {
            this.context.moveTo(line.start.x + this.width_diff, line.start.y + this.height_diff);
            this.context.lineTo(line.end.x + this.width_diff, line.end.y + this.height_diff);
        });
        this.context.strokeStyle = style;
        this.context.stroke();
    }

    /**
     * Pobranie przetworzonych kształtów z 3d do 2d i wywołąnie rysowania
     */
    draw() {
        this.context.clearRect(0, 0, this.width_diff * 2, this.height_diff * 2);
        this.shapes.forEach(shape => {
            this.render(shape.get_lines_to_render(this.perspective), shape.style);
        })
    }

    /**
     * Poruszenie całą mapą
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    move(x, y, z) {
        this.shapes.forEach(shape => {
            shape.move(x, y, z);
        })
    }

    /**
     * Dodanie nowego kształtu
     * @param {Shape} shape nowy kształ
     */
    add_shape(shape) {
        this.shapes.push(shape);
    }

    remove_shape(shape) {
        let tmp = this.shapes.indexOf(shape);
        if (tmp !== -1)
            this.shapes.splice(tmp, 1)
    }

    /**
     * Usunięcie kształtu
     * @param {Shape} shape kształ
     */
    check_collisions() {
        for (let shape of this.shapes) {
            if (!shape.center) continue;
            if (shape.check_collision(-this.perspective)) {
                if (shape instanceof BigSquare)
                    return "win"
                return "lose"
            }
        }
        return;
    }
    /**
     * Zwrócenie tablicy potrzebnej do rotacji mapy
     * @param {number} p 
     * @param {number} r 
     * @param {number} y 
     * @returns tablica potrzebna do rotacji w 3d
     */
    rotation_array(p = 0, r = 0, y = 0) {
        let [pCos, pSin] = [Math.cos(p), Math.sin(p)];
        let [yCos, ySin] = [Math.cos(y), Math.sin(y)];
        let [rCos, rSin] = [Math.cos(r), Math.sin(r)];
        return [
            [yCos * pCos, yCos * pSin * rSin - ySin * rCos, yCos * pSin * rCos + ySin * rSin],
            [ySin * pCos, ySin * pSin * rSin + yCos * rCos, ySin * pSin * rCos - yCos * rSin],
            [-pSin, pCos * rSin, pCos * rCos]
        ];
    }

    /**
     * Rotacja obiektów na mapie
     * @param {number} p 
     * @param {number} r 
     * @param {number} y 
     * @param {boolean} do_update czy aktualizować tablicę obrotów
     */
    rotate_shapes(p = 0, r = 0, y = 0, do_update = true) {
        if (do_update) {
            this.rotation_list.push({ pitch: p, roll: r, yaw: y })
        }
        //Zamiana ze stopni ° na radiany
        p = p * Math.PI / 180;
        r = r * Math.PI / 180;
        y = y * Math.PI / 180;
        let rotation_arr = this.rotation_array(p, r, y);
        let rotation_center = this.shapes[0].center
        this.shapes.forEach(shape => {
            shape.lines.forEach(line => {
                [line.start, line.end].forEach(point => {
                    let [dx, dy, dz] = [point.x - rotation_center.x, point.y - rotation_center.y, point.z - rotation_center.z];

                    point.x = rotation_arr[0][0] * dx + rotation_arr[0][1] * dy + rotation_arr[0][2] * dz + rotation_center.x;
                    point.y = rotation_arr[1][0] * dx + rotation_arr[1][1] * dy + rotation_arr[1][2] * dz + rotation_center.y;
                    point.z = rotation_arr[2][0] * dx + rotation_arr[2][1] * dy + rotation_arr[2][2] * dz + rotation_center.z;
                })
            })
            //jeśli żółw to dodatkowo zmiana pozycji żółwia
            if (shape instanceof Turtle3D) {
                let [dx, dy, dz] = [shape.position.x - rotation_center.x, shape.position.y - rotation_center.y, shape.position.z - rotation_center.z];
                shape.position.x = rotation_arr[0][0] * dx + rotation_arr[0][1] * dy + rotation_arr[0][2] * dz + rotation_center.x;
                shape.position.y = rotation_arr[1][0] * dx + rotation_arr[1][1] * dy + rotation_arr[1][2] * dz + rotation_center.y;
                shape.position.z = rotation_arr[2][0] * dx + rotation_arr[2][1] * dy + rotation_arr[2][2] * dz + rotation_center.z;
            }
        })
    }

    /**
     * Przywrócenie rotacji obiektów do stanu początkowego
     */
    undo_rotate() {
        this.rotation_list.slice().reverse().forEach(rotation => {
            this.rotate_shapes(-rotation.pitch, -rotation.roll, -rotation.yaw, false)
        })
    }

    /**
     * Przywróceni świata do pozycji po liście obrotów
     */
    redo_rotate() {
        this.rotation_list.forEach(rotation => {
            this.rotate_shapes(rotation.pitch, rotation.roll, rotation.yaw, false)
        })
    }
}

/**
 * Podstawowa klasa kształtu
 */
class Shape {
    constructor(lines = [], style = "black") {
        this.lines = lines;
        this.style = style;
        this.center = null;
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
        })
    }

    /**
     * Sprawdzenie kolizji
     * @param {number} perspective perspektywa
     * @returns wynik sprawdzenia
     */
    check_collision(perspective) {
        return false;
    }
}

class Cube extends Shape {
    /**
     * Stworzenie kostki
     * @param {Object<string, number>} center centrum kostki
     * @param {number} radius wielkość kostki
     * @param {string} style styl rsowania
     */
    constructor(center, radius, style = "black") {
        super();
        this.center = center;
        this.style = style;
        this.radius = radius;
        let half = radius / 2;
        let abcdefgh = {
            a: { x: center.x - half, y: center.y + half, z: center.z + half },
            b: { x: center.x + half, y: center.y + half, z: center.z + half },
            c: { x: center.x - half, y: center.y - half, z: center.z + half },
            d: { x: center.x + half, y: center.y - half, z: center.z + half },
            //
            e: { x: center.x - half, y: center.y + half, z: center.z - half },
            f: { x: center.x + half, y: center.y + half, z: center.z - half },
            g: { x: center.x - half, y: center.y - half, z: center.z - half },
            h: { x: center.x + half, y: center.y - half, z: center.z - half },
        }

        this.lines = [
            /*      a --- b
                    |     |
                /  c --- d
                e --- f  /
                |     | /
                g --- h
                
            */
            //a->b
            new Line({ ...abcdefgh.a }, { ...abcdefgh.b }, style),
            //b->d
            new Line({ ...abcdefgh.b }, { ...abcdefgh.d }, style),
            //d->c
            new Line({ ...abcdefgh.d }, { ...abcdefgh.c }, style),
            //c->a
            new Line({ ...abcdefgh.c }, { ...abcdefgh.a }, style),
            //e->f
            new Line({ ...abcdefgh.e }, { ...abcdefgh.f }, style),
            //f->h
            new Line({ ...abcdefgh.f }, { ...abcdefgh.h }, style),
            //h->g
            new Line({ ...abcdefgh.h }, { ...abcdefgh.g }, style),
            //g->e
            new Line({ ...abcdefgh.g }, { ...abcdefgh.e }, style),
            //a->e
            new Line({ ...abcdefgh.a }, { ...abcdefgh.e }, style),
            //b->f
            new Line({ ...abcdefgh.b }, { ...abcdefgh.f }, style),
            //d->h
            new Line({ ...abcdefgh.d }, { ...abcdefgh.h }, style),
            //c->g
            new Line({ ...abcdefgh.c }, { ...abcdefgh.g }, style),
        ];
    }

    /**
     * Poruszenie kształtem
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    move(x, y, z) {
        super.move(x, y, z);
        this.center.x += x;
        this.center.y += y;
        this.center.z += z;
    }

    /**
     * Sprawdzenie kolizji
     * @param {number} perspective perspektywa
     * @returns wynik sprawdzenia
     */
    check_collision(perspective) {
        if (Math.sqrt(Math.pow(this.center.x, 2) + Math.pow(this.center.y, 2) + Math.pow(this.center.z - perspective, 2)) < this.radius)
            return true;
        return false;
    }
}

/**
 * Klasa linii. Zawiera punkty końca oraz styl
 */
class Line {
    constructor(start, end, style = "black") {
        this.start = start;
        this.end = end;
        this.style = style
    }

    /**
     * Przetworzenie kopii linii z 3d na 2d i ich zwrócenie
     * @param {number} perspective perspektywa
     * @returns przetworzona kopia linii
     */
    project(perspective) {
        if (this.start.z <= -perspective && this.end.z <= -perspective) {
            return [];
        }
        return [{
            start: {
                // This 0.01 should be actually 0, but canvas doesn't allow to draw at infinity
                x: perspective * this.start.x / Math.max(perspective + this.start.z, 0.01),
                y: perspective * this.start.y / Math.max(perspective + this.start.z, 0.01)
            },
            end: {
                x: perspective * this.end.x / Math.max(perspective + this.end.z, 0.01),
                y: perspective * this.end.y / Math.max(perspective + this.end.z, 0.01)
            }
        }];
    }

    /**
     * Poruszenie lińmi
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    move(x, y, z) {
        this.start.x += x;
        this.start.y += y;
        this.start.z += z;

        this.end.x += x;
        this.end.y += y;
        this.end.z += z;
    }

}



export { Engine, Line, Cube, Shape };