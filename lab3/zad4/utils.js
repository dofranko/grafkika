/*jshint esversion: 8 */
/**
 * 
 * @param {number[]} v array to normalize
 * @returns {number[]} normalized array
 */
function normalize(v) {
    let length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (length > 0.00001) {
        return [v[0] / length, v[1] / length, v[2] / length];
    } else {
        return [0, 0, 0];
    }
}

/**
 * 
 * @param {*} angle 
 * @param {*} a 
 * @param {*} zMin 
 * @param {*} zMax 
 * @returns 
 */
function get_projection(angle, a, zMin, zMax) {
    let ang = Math.tan((angle * 0.5 * Math.PI) / 180);
    return [
        0.5 / ang,
        0,
        0,
        0,
        0,
        (0.5 * a) / ang,
        0,
        0,
        0,
        0,
        -(zMax + zMin) / (zMax - zMin),
        -1,
        0,
        0,
        (-2 * zMax * zMin) / (zMax - zMin),
        0,
    ];
}

/**
 * @param {number[]} m
 * @param {number} angle
 */
function rotateZ(m, angle) {
    let c = Math.cos(angle);
    let s = Math.sin(angle);
    let mv0 = m[0],
        mv4 = m[4],
        mv8 = m[8];

    m[0] = c * m[0] - s * m[1];
    m[4] = c * m[4] - s * m[5];
    m[8] = c * m[8] - s * m[9];

    m[1] = c * m[1] + s * mv0;
    m[5] = c * m[5] + s * mv4;
    m[9] = c * m[9] + s * mv8;
}

/**
 * @param {number[]} m
 * @param {number} angle
 */
function rotateX(m, angle) {
    let c = Math.cos(angle);
    let s = Math.sin(angle);
    let mv1 = m[1],
        mv5 = m[5],
        mv9 = m[9];

    m[1] = m[1] * c - m[2] * s;
    m[5] = m[5] * c - m[6] * s;
    m[9] = m[9] * c - m[10] * s;

    m[2] = m[2] * c + mv1 * s;
    m[6] = m[6] * c + mv5 * s;
    m[10] = m[10] * c + mv9 * s;
}

/**
 * @param {number[]} m
 * @param {number} angle
 */
function rotateY(m, angle) {
    let c = Math.cos(angle);
    let s = Math.sin(angle);
    let mv0 = m[0],
        mv4 = m[4],
        mv8 = m[8];

    m[0] = c * m[0] + s * m[2];
    m[4] = c * m[4] + s * m[6];
    m[8] = c * m[8] + s * m[10];

    m[2] = c * m[2] - s * mv0;
    m[6] = c * m[6] - s * mv4;
    m[10] = c * m[10] - s * mv8;
}
/**
 * @param {any[]} m
 * @param {number} step
 */
function moveX(m, step) {
    m[12] += step;
}
/**
 * @param {any[]} m
 * @param {number} step
 */
function moveY(m, step) {
    m[13] += step;
}
/**
 * @param {any[]} m
 * @param {number} step
 */
function moveZ(m, step) {
    m[14] += step;
}