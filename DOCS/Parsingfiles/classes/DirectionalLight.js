/**
 * Classe che rappresenta una luce direzionale dotata di una direzione.
 * @extends AmbientLight
 */
class DirectionalLight extends AmbientLight
{
    /**
     * @constructor
     * Funzione che costruisce una luce direzionale.
     * @param direction
     * @param color
     */
    constructor(direction, color)
    {
        super(color);
        this.has_position=false;
        this.direction = glMatrix.vec3.fromValues(direction[0], direction[1], direction[2]);
    }
}
