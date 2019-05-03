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
     * @param type {String} stringa che indica il tipo di luce (ambient, point o directional)
     */
    constructor(direction, color,type)
    {
        super(color,type);
       // this.has_position=false;
        this.direction = glMatrix.vec3.fromValues(direction[0], direction[1], direction[2]);
    }
}
