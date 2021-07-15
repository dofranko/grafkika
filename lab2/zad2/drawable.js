/**
 * Klasa dla trójkątów i płatków (zrobione na pseudo żółwiu z porpzendiego zadania)
 */
class Drawable {
    constructor(start_pos = { x: 300, y: 300, z: 1.0 }, color = [1, 0, 0], visible = false) {
        this.visible = visible;
        this.pos = start_pos;
        this.color = color;
        this.vertex_list = [];
        this.locations = [];
        this.rotation = 180;
    }

    move(x, y, z = 0.0) {
        if (x != 0 || y != 0) {
            for (let location of this.locations) {
                location[0] += x;
                location[1] += y;
            }
        }
        this.pos.z += z;
        this.vertex_list = []
        for (let i = 0; i < this.locations.length; i++) {
            this.vertex_list.push([...this.locations[i], this.pos.z, ...this.color]);
        }
        this.vertex_list = this.vertex_list.flat()
    }

    fd(distance) {
        this.locations.push([this.pos.x, this.pos.y])
        this.pos.x += (distance * Math.cos(this.rotation * Math.PI / 180));
        this.pos.y -= distance * Math.sin(this.rotation * Math.PI / 180);
        this.locations.push([this.pos.x, this.pos.y])
    }
    bk(distance) {
        this.fd(-distance);
    }
    lt(angle) {
        this.rotation = (this.rotation + ((angle % 360) + 360) % 360) % 360;
    }
    rt(rot) {
        this.lt(-rot)
    }

    draw_sierpinski(length, depth) {
        this.vertex_list = []
        this.locations = []
        this.draw_sierpinski_triangle(length, depth);
        for (let i = 0; i < this.locations.length; i++) {
            this.vertex_list.push([...this.locations[i], this.pos.z, ...this.color]);
        }
        this.vertex_list = this.vertex_list.flat()
    }
    draw_sierpinski_triangle(length, depth) {
        if (length < 1) return
        if (depth == 0) {
            for (let i = 0; i < 3; i++) {
                this.fd(length)
                this.lt(120)
            }
        }
        else {
            this.draw_sierpinski_triangle(length / 2, depth - 1)
            this.fd(length / 2)
            this.draw_sierpinski_triangle(length / 2, depth - 1)
            this.bk(length / 2)
            this.lt(60)
            this.fd(length / 2)
            this.rt(60)
            this.draw_sierpinski_triangle(length / 2, depth - 1)
            this.lt(60)
            this.bk(length / 2)
            this.rt(60)
        }
    }
    draw_koch(length, depth) {
        this.vertex_list = []
        this.locations = []
        for (let i = 0; i < 3; i++) {
            this.draw_koch_snowflake(length, depth);
            this.rt(120)
        }
        for (let i = 0; i < this.locations.length; i++) {
            this.vertex_list.push([...this.locations[i], this.pos.z, ...this.color]);
        }
        this.vertex_list = this.vertex_list.flat()
    }
    draw_koch_snowflake(length, depth) {
        if (length < 1) depth = 0;
        if (depth == 0) {
            this.fd(length)
            return
        }
        length /= 3.0
        this.draw_koch_snowflake(length, depth - 1)
        this.lt(60)
        this.draw_koch_snowflake(length, depth - 1)
        this.rt(120)
        this.draw_koch_snowflake(length, depth - 1)
        this.lt(60)
        this.draw_koch_snowflake(length, depth - 1)
    }
}

export { Drawable }