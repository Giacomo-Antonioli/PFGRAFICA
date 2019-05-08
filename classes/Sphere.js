/**
 * Classe che rappresenta una generica sfera.
 */
class Sphere extends Figure {
    /**
     * @constructor
     * @param {Array} center Centro della sfera
     * @param {Float} radius Raggio della sfera
     * @param {Integer} material Indice della lista di materiali di cui è costituito l'oggetto
     */
    constructor(center, radius, material, index) {
        super(material, index);
        this._center = glMatrix.vec3.fromValues(center[0], center[1], center[2]);
        this._radius = radius;

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
     * Funzione che calcola il punto di intersezione tra un raggio e l'oggetto.
     * @param {Ray} ray Raggio
     * @returns {Boolean} Hit Dice se il raggio interseca l'oggetto.
     */
    intersection(ray) {
        /* *
         * Funzione per il calcolo delle intersezioni del raggio di luce con la sfera
         * INPUT
         * Ray (struct) --> ottenuto dal castray della camera
         * OUTPUT
         * t (array) --> array di punti di intersezione con l'oggetto
         * Funzionamento
         * Risolve il sistema tra l'equazione del raggio e quella della sfera, trovando il punto o i punti
         * di interesezione
         * letiabili
         * origin_center_sub --> Differenza tra origine circonferenza e origine del raggio (e-c)
         * direction_times_origin_center_sub --> d*(e-c)
         * direction_euclidean_norm_squared --> d*d
         * origin_center_sub_euclidean_norm_squared --> (e-c)^2
         * */

        let flag_t1, flag_t2;
        let origin_center_sub = glMatrix.vec3.create(); //a=(e-c)

        let direction_times_origin_center_sub; // b = d*(e-c)
        let direction_euclidean_norm_squared; // f=d*d
        let origin_center_sub_euclidean_norm_squared; // a^2

        glMatrix.vec3.subtract(origin_center_sub, ray.origin, this._center); // a
        direction_times_origin_center_sub = glMatrix.vec3.dot(ray.direction, origin_center_sub); // b
        direction_euclidean_norm_squared = glMatrix.vec3.dot(ray.direction, ray.direction); // f
        origin_center_sub_euclidean_norm_squared = glMatrix.vec3.dot(origin_center_sub, origin_center_sub);

        let discriminant = Math.pow(direction_times_origin_center_sub, 2) - direction_euclidean_norm_squared * (origin_center_sub_euclidean_norm_squared - Math.pow(this._radius, 2));

        // -b + sqrt(b^2 - f*(a^2) - R^2) / f
        flag_t1 = (-direction_times_origin_center_sub + Math.sqrt(discriminant)) / direction_euclidean_norm_squared;
        // -b - sqrt(b^2 - f*(a^2) - R^2) / f
        flag_t2 = (-direction_times_origin_center_sub - Math.sqrt(discriminant)) / direction_euclidean_norm_squared;


        // flag_t2 = ((-direction_times_origin_center_sub - Math.sqrt(Math.pow(direction_times_origin_center_sub, 2) - direction_euclidean_norm_squared * (origin_center_sub_euclidean_norm_squared - Math.pow(this.radius, 2)))) / direction_euclidean_norm_squared);


        let t;
        //Posso fare il controllo solo un flag in quanto se i punti sono coincidenti i flag sono uguali
        // E se son diversi devono avere entrambi un valore non nullo se intersecano la sfera
        if (flag_t1 < 0 && flag_t2 < 0 || isNaN(flag_t1) && isNaN(flag_t2)) {
            t = -1;
        } else if (flag_t1 < 0 && flag_t2 >= 0 || isNaN(flag_t1) && flag_t2 >= 0) {
            t = flag_t2;
        } else if (flag_t1 >= 0 && flag_t2 < 0 || isNaN(flag_t2) && flag_t1 >= 0) {
            t = flag_t1;

        } else {
            if (flag_t1 > flag_t2) {
                t = flag_t2;

            } else {
                t = flag_t1;

            }
        }
        if (t === -1 || t <= ray.tMin) {
            return false;
        } else {
            let point = glMatrix.vec3.create();
            glMatrix.vec3.scaleAndAdd(point, ray.origin, ray.direction, t);
            let normal = glMatrix.vec3.create();
            glMatrix.vec3.subtract(normal, point, this._center);
            let unitNormal = glMatrix.vec3.create();
            glMatrix.vec3.scale(unitNormal, normal, 1 / this._radius);
            this.setInterception(t, point, unitNormal, ray.direction);

            return true;
        }


    }

    isTheSame(secondObject) {
        return super.isTheSame(secondObject);
    }


    /**
     * Funzione che mostra il tipo di oggettto corrente (Sfera).
     */
    me() {
        console.log("SPHERE");
    }
    /** */
    showTransformationMatrix() {
        super.showTransformationMatrix();
    }
    /** */
    setTranslation(TransaltionVector) {
        super.setTranslation(TransaltionVector);
    }
    /** */
    setRotation(RotationVector) {
        super.setRotation(RotationVector);
    }
    /** */
    setScaling(ScalingVector) {
        super.setScaling(ScalingVector);
    }
    /** */
    invertMatrix() {
        super.invertMatrix();
    }
    /** */
    transposeInvertedMatrix() {
        super.transposeInvertedMatrix();
    }
    /** */
    setTransformationMatrixValue() {
        super.setTransformationMatrixValue();
    }
    /** */
    initInterception() {
        super.initInterception();
    }
    /** */
    setInterception(t, interception_point, normal, direction) {
        super.setInterception(t, interception_point, normal, direction);
    }



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

    /** */
    set material(value) {
        super.material = value;
    }
    /** */
    set index(value) {
        super.index = value;
    }
    /** */
    set TransformationMatrix(value) {
        super.TransformationMatrix = value;
    }
    /** */
    set inverseTransformationMatrix(value) {
        super.inverseTransformationMatrix = value;
    }
    /** */
    set transposedInverseTransformationMatrix(value) {
        super.transposedInverseTransformationMatrix = value;
    }
    /** */
    set hasTransformationMatrix(value) {
        super.hasTransformationMatrix = value;
    }
    /** */
    set t(value) {
        super.t = value;
    }
    /** */
    set interception_point(value) {
        super.interception_point = value;
    }
    /** */
    set normal(value) {
        super.normal = value;
    }
    /** */
    set radius(value) {
        this._radius = value;
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

    get material() {
        return super.material;
    }

    get index() {
        return super.index;
    }

    get TransformationMatrix() {
        return super.TransformationMatrix;
    }

    get inverseTransformationMatrix() {
        return super.inverseTransformationMatrix;
    }

    get transposedInverseTransformationMatrix() {
        return super.transposedInverseTransformationMatrix;
    }

    get hasTransformationMatrix() {
        return super.hasTransformationMatrix;
    }

    get t() {
        return super.t;
    }

    get interception_point() {
        return super.interception_point;
    }

    get normal() {
        return super.normal;
    }

    get center() {
        return this._center;
    }

    get radius() {
        return this._radius;
    }
}