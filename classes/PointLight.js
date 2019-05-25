/**
 * Classe che rappresenta una luce posizionale dotata di una sorgente puntiforme.
 * @extends AmbientLight
 */

class PointLight extends AmbientLight {
    /**
     * @constructor
     * @param position {Array(3)} Vettore posizione della sorgente luminosa
     * @param color {Array(3)} Vettore che indica l'intensità luminosa rgb della luce
     */
    constructor(position, color)
    {
        super(color);
        this.position = glMatrix.vec3.fromValues(position[0], position[1], position[2]);
    }
}