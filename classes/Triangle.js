import * as glMatrix from "../libs/gl-matrix";

class Triangle {
    constructor(p1,p2,p3,material)
    {
        this.p1 = glMatrix.vec3.fromValues(p1[0], p1[1], p1[2]);
        this.p2 = glMatrix.vec3.fromValues(p2[0], p2[1], p2[2]);
        this.p3 = glMatrix.vec3.fromValues(p3[0], p3[1], p3[2]);
        this.material=material;
    }
}

export default Triangle;