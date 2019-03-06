class AmbientLight {

    constructor(color) {
        this.color = glMatrix.vec3.fromValues(color[0], color[1], color[2]);
    }
}

export default AmbientLight;
