/**
 * Classe che rappresenta una luce posizionale dotata di una sorgente puntiforme.
 * @extends AmbientLight
 */

class PointLight extends AmbientLight {
    /**
     * @constructor
     * Funzione che costruisce una luce posizionale
     * @param position
     * @param color
     */
    constructor(position, color)
    {
        super(color);
        this.has_position=true;
        this.position = glMatrix.vec3.fromValues(position[0], position[1], position[2]);
    }
}