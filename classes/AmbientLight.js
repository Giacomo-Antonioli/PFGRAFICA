
/** Classe che rapprenta la luce ambientale che colpisce ogni oggetto sulla scena.*/
class AmbientLight {
    /**
     * @constructs
     * @param color {Array(3)} Array di 3 elementi tra compresi nell'insieme [0,1]
     */
    constructor(color,type) {
        this.color = glMatrix.vec3.fromValues(color[0], color[1], color[2]);
        this.type=type;
    }
}


