
/** Classe che rapprenta la luce ambientale che colpisce ogni oggetto sulla scena */
class AmbientLight {
    /**
     * @constructor
     * Instanziazione del colore tramite costruttore.
     * @param color
     */
    constructor(color) {
        this.color = glMatrix.vec3.fromValues(color[0], color[1], color[2]);
    }
}


