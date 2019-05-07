/**Classe che rappresenta un raggio luminoso qualsiasi. */
class Ray {
    /**
     * @constructor
     * @param {Vec3} direction direnzione nella quale il raggio si propaga
     * @param {Vec3} origin  origine del raggio 
     * @param {Float} tMax  distanza massima dopo la quale il raggio cessa di esistere
     * @param {Float} tMin  distanza minima dalla sorgente per la quale si considera il raggio esistente
     */
    constructor(direction, origin, tMax, tMin) {
        this._direction = glMatrix.vec3.clone(direction); // e' necessario usare clone e non assegnare solo il valore del vec3
        this._origin = glMatrix.vec3.clone(origin);
        this._t_Nearest = tMax;
        this._NearestObject = 0;
        this._tMax = tMax;
        this._tMin = tMin;
        this._direction = direction;
        this._origin = origin;

    }

    //____________________________________________________________________________________________________
    /*
    ##     ## ######## ######## ##     ##  #######  ########   ######
    ###   ### ##          ##    ##     ## ##     ## ##     ## ##    ##
    #### #### ##          ##    ##     ## ##     ## ##     ## ##
    ## ### ## ######      ##    ######### ##     ## ##     ##  ######
    ##     ## ##          ##    ##     ## ##     ## ##     ##       ##
    ##     ## ##          ##    ##     ## ##     ## ##     ## ##    ##
    ##     ## ########    ##    ##     ##  #######  ########   ######

*/
    /**
     * Metodo per il debug. Mostra:
     * direzione
     * origine
     * t_Nearest
     * tMin
     * tMax
     */
    show() {
        console.log("direction: " + this._direction);
        console.log("origin: " + this._origin);
        console.log("t_Nearest: " + this._t_Nearest);
        console.log("tMin: " + this._tMin);
        console.log("tMax: " + this._tMax);
    }

    /**
     * Funzione che setta il punto più vicino di hit. Raddrizza i versi errati delle normali
     * @param {Float} t 
     * @param {Array} point 
     * @param {Array} n 
     */
    // ray_Intersect(t,point,n) {
    //     /*
    //     * INPUT
    //     * t         scalare
    //     * point     Vettore
    //     * n         Vettore
    //     * */
    //      if (glMatrix.vec3.dot(n, this.direction)>rad(90))//NON SO IL VERSO DELLA NORMALE QUINDI LO ADATTO ALLA POS DELLA CAMERA
    //             glMatrix.vec3.negate(n, n);
    //     this.t_parameter=t;
    //     this.intersection_point=glMatrix.vec3.clone(point);
    //     this.normalpoint = glMatrix.vec3.clone(n);
    //     if (t <= this.t_Nearest && t >= this._tMin)
    //         this.t_Nearest = t;
    //
    // }


    //____________________________________________________________________________________________________
    /*
        ######  ######## ######## ######## ######## ########   ######  
        ##    ## ##          ##       ##    ##       ##     ## ##    ## 
        ##       ##          ##       ##    ##       ##     ## ##       
         ######  ######      ##       ##    ######   ########   ######  
              ## ##          ##       ##    ##       ##   ##         ## 
        ##    ## ##          ##       ##    ##       ##    ##  ##    ## 
         ######  ########    ##       ##    ######## ##     ##  ######  
    */
    set direction(value) {
        this._direction = value;
    }

    set origin(value) {
        this._origin = value;
    }

    set t_Nearest(value) {
        this._t_Nearest = value;
    }

    set NearestObject(value) {
        this._NearestObject = value;
    }

    set tMax(value) {
        this._tMax = value;
    }

    set tMin(value) {
        this._tMin = value;
    }
    //____________________________________________________________________________________________________
    /*

    ######   ######## ######## ######## ######## ########   ######
    ##    ##  ##          ##       ##    ##       ##     ## ##    ##
    ##        ##          ##       ##    ##       ##     ## ##
    ##   #### ######      ##       ##    ######   ########   ######
    ##    ##  ##          ##       ##    ##       ##   ##         ##
    ##    ##  ##          ##       ##    ##       ##    ##  ##    ##
     ######   ########    ##       ##    ######## ##     ##  ######

*/

    get direction() {
        return this._direction;
    }

    get origin() {
        return this._origin;
    }

    get t_Nearest() {
        return this._t_Nearest;
    }

    get NearestObject() {
        return this._NearestObject;
    }

    get tMax() {
        return this._tMax;
    }
    get tMin() {
        return this._tMin;
    }

}