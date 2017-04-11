/**
 * @file
 * In this assignment, you will be overriding functions from the 3.10 module.
 * You'll go through the motions of overriding functions as well as getting 
 * more practice with JavaScript's Math library.
 */

var Shape3D = require(__dirname + '/../readings/3.10-classes_as_inheritable.js')
    .Shape3D;

/**
 * @class
 */
class Cone extends Shape3D {
    constructor(radius, height){
    }
}

/**
 * @class
 */
class Pyramid extends Shape3D {
    constructor(width, height) {
    }
}

/**
 * @class
 */
class Sphere extends Shape3D {
    constructor(radius){
    }
}

module.exports = {
    cone: Cone,
    pyramid: Pyramid,
    sphere: Sphere
}