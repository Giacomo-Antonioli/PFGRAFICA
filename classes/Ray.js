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
        this.direction = glMatrix.vec3.clone(direction); // e' necessario usare clone e non assegnare solo il valore del vec3
        this.origin = glMatrix.vec3.clone(origin);
        this.t_Nearest = tMax;
        this.tMax = tMax;
        this.tMin = tMin;
    }

    //#########################################METHODS########################################################

    /**
     * Metodo per il debug. Mostra:
     * direzione
     * origine
     * t_Nearest
     * tMin
     * tMax
     */
    show() {
        console.log("direction: " + this.direction);
        console.log("origin: " + this.origin);
        console.log("t_Nearest: " + this.t_Nearest);
        console.log("tMin: " + this.tMin);
        console.log("tMax: " + this.tMax);
    }
    /**
     * Metodo per il debug. Mostra:
     * direzione
     */
    showme() {
        console.log("direction: " + this.direction);
        //  console.log("origin: " + this.origin);
    }

    /**
     * Funzione che setta il punto più vicino di hit. Raddrizza i versi errati delle normali
     * @param {Float} t 
     * @param {Array} point 
     * @param {Array} n 
     */
    ray_Intersect(t, point, n) {
        /*
         * INPUT
         * t         scalare
         * point     Vettore
         * n         Vettore
         * */
        if (t <= this.t_Nearest && t >= this.tMin) {
            if (glMatrix.vec3.dot(n, this.direction) > rad(90)) //NON SO IL VERSO DELLA NORMALE QUINDI LO ADATTO ALLA POS DELLA CAMERA
                glMatrix.vec3.negate(n, n);
            this.t_Nearest = t;
            this.intersection_point = glMatrix.vec3.clone(point);
            this.normalpoint = glMatrix.vec3.clone(n);
            return true;
        }
        return false;

    }

    setValues(direction, origin)
     {
        this.direction = glMatrix.vec3.clone(direction); // e' necessario usare clone e non assegnare solo il valore del vec3
        this.origin = glMatrix.vec3.clone(origin);
     }
    setNearestValue(tempRay) // usata solo quando si importano in ray questi valori da tempRay
    {
        this.t_Nearest = tempRay.t_Nearest;
        this.intersection_point = glMatrix.vec3.clone(tempRay.intersection_point);
        this.normalpoint = glMatrix.vec3.clone(tempRay.normalpoint);
    }

}