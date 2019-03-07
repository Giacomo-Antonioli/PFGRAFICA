
class Ray{
    constructor(direction, origin, tMax, tMin) {
        this.direction = glMatrix.vec3.clone(direction); // e' necessario usare clone e non assegnare solo il valore del vec3
        this.origin = glMatrix.vec3.clone(origin);

    }


    point_at_parameter = function (t) {
        // non mi preoccupo di costruire direction  e origin come vec3 perche' il costruttore
        // li prende gia' come tali

        //*********************************VARIABILI D'APPOGGIO*************/
        let Orig_MUl_scaledDir = glMatrix.vec3.create();
        let ScaledDir = glMatrix.vec3.create();
        //*****************************************************************/

        glMatrix.vec3.scale(ScaledDir, this.direction, t);
        glMatrix.vec3.add(Orig_MUl_scaledDir, ScaledDir, this.origin);

        return Orig_MUl_scaledDir;


    };




};

