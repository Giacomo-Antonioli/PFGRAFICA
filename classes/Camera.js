import * as glMatrix from "../libs/gl-matrix";

class Camera {
    constructor(eye, at, up, fovy, aspect) { //definisco la classe Camera

        this.eye =glMatrix.vec3.fromValues(eye[0],eye[1],eye[2]);
        this.up = glMatrix.vec3.fromValues(up[0],up[1],up[2]);
        this.at = glMatrix.vec3.fromValues(at[0],at[1],at[2]);
        this.fovy = fovy;
        this.aspect = aspect;

        this.h = 2 * Math.tan(rad(fovy / 2.0));
        this.w = this.h * aspect;
    }

}

export default Camera;