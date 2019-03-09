class Camera {
    constructor(eye, at, up, fovy, aspect) { //definisco la classe Camera

        this.eye = glMatrix.vec3.fromValues(eye[0], eye[1], eye[2]);
        this.up = glMatrix.vec3.fromValues(up[0], up[1], up[2]);
        this.at = glMatrix.vec3.fromValues(at[0], at[1], at[2]);
        this.fovy = fovy;
        this.aspect = aspect;

        this.h = 2 * Math.tan(rad(fovy / 2.0));
        this.w = this.h * aspect;
    }

    castRay(x, y) { //aggiungo alla classe Camera la funzione castRay_______ INCOMPLETO!!!
        let u = (this.w * x / (canvas.width - 1)) - (this.w / 2.0);
        let v = (-this.h * y / (canvas.height - 1)) + (this.h / 2.0);


        //where is eye used??
        let direction = glMatrix.vec3.fromValues(u, v, -1);
        let origin = glMatrix.vec3.clone(this.eye);//vec3.clone(this.at);// vec3.fromValues(0, 0, 0);
        return new Ray(direction, origin, undefined, 0);
        //return new ray with origin at (0,0,0) and direction
    }

}

