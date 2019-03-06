import * as glMatrix from "../libs/gl-matrix";

class Sphere{

    constructor(center,radius,material) {
        this.center = glMatrix.vec3.fromValues(center[0], center[1], center[2]);
        this.radius = radius;
        this.material = material; //Indica l'indice all'interno dell'array materiali da applicare alla figura

    }

}

export default Sphere;