/**
 * Classe che rappresenta una luce direzionale dotata di una direzione.
 * @extends AmbientLight
 */
class DirectionalLight extends AmbientLight
{
    /**
     * @constructor
     * @param direction {Array(3)} Vettore direzione del raggio luminoso
     * @param color {Array(3)} Vettore che indica l'intensità luminosa rgb della luce
     */
    constructor(direction, color)
    {
        super(color);
        this.direction = glMatrix.vec3.fromValues(direction[0], direction[1], direction[2]);
    }
}
