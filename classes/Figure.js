/**
 * Classe che rappresenta una generica Figura.
 */
class Figure {
    /**
     * @constructor
     * @param {Array} center Centro della sfera
     * @param {Float} radius Raggio della sfera
     * @param {Integer} material Indice della lista di materiali di cui è costituito l'oggetto
     */
    constructor(material, index) {
        //Indica l'indice all'interno dell'array materiali da applicare alla figura
        this._TransformationMatrix = glMatrix.mat4.create();
        this._inverseTransformationMatrix = glMatrix.mat4.create();
        this._hasTransformationMatrix = false;
        this._t = 0;
        this._interception_point = 0;
        this._normal = 0;
        this._material = material;
        this._index = index;
    }
/*

 ######   ######## ######## ######## ######## ########   ######
##    ##  ##          ##       ##    ##       ##     ## ##    ##
##        ##          ##       ##    ##       ##     ## ##
##   #### ######      ##       ##    ######   ########   ######
##    ##  ##          ##       ##    ##       ##   ##         ##
##    ##  ##          ##       ##    ##       ##    ##  ##    ##
 ######   ########    ##       ##    ######## ##     ##  ######

*/
    /**
     * Indice del Materiale della figura
     * @returns material {Integer} material index
     */
    get material() {
        return this._material;
    }

    /**
     * Indice della figura all'interno della lista delle figure
     * @returns index {Integer} indice della lista delle figure
     */
    get index() {
        return this._index;
    }

    /**
     * Matrice di Trasformazione della figura
     * @returns TransformationMatrix {mat4} Matrice di trasformazione della figura
     */
    get TransformationMatrix() {
        return this._TransformationMatrix;
    }

    /**
     * Inversa della matrice di Trasformazione della figura
     * @returns {mat4} Inversa della matrice di trasformazione
     */
    get inverseTransformationMatrix() {
        return this._inverseTransformationMatrix;
    }

    /**
     * Boolean che indica se la figura possiede o meno una matrice di Trasformazione
     * @returns hasTransformationMatrix {boolean} True se ha la matrice, False se non ce l'ha
     */
    get hasTransformationMatrix() {
        return this._hasTransformationMatrix;
    }

    /**
     * Parametro t che serve nel calcolo e + t*d
     * @returns t {Double} Paramtero t
     */
    get t() {
        return this._t;
    }

    /**
     * Punto di intersezione sulla superficie
     * @returns interception_point {Vec3} Punto di intersezione sulla superficie
     */
    get interception_point() {
        return this._interception_point;
    }

    /**
     * Normale al punto sulla superficie
     * @returns normal {Vec3} Normale alla superficie
     */
    get normal() {
        return this._normal;
    }


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
     * Funzione che mostra la Matrice di Traformazione.
     */
    showTransformationMatrix() {
        console.log("************************");
        console.log("TRANSFORMATION MATRIX: ");
        for (let i = 0; i < 4; i++) {
            console.log(this._TransformationMatrix[i * 4] + " " + this._TransformationMatrix[i * 4 + 1] + " " + this._TransformationMatrix[i * 4 + 2] + " " + this._TransformationMatrix[i * 4 + 3]);
        }
        console.log("************************")
    }

    /**
     * Trasla la matrice di trasformazione.
     * @param {Vec3} TransaltionVector Vettore di traslazione
     */
    setTranslation(TransaltionVector) {
        glMatrix.mat4.translate(this._TransformationMatrix, this._TransformationMatrix, TransaltionVector);
    }

    /**
     * Ruota la matrice di trasformazione.
     * @param {Vec3} RotationVector Vettore di rotazione
     */
    setRotation(RotationVector) {
        glMatrix.mat4.rotateX(this._TransformationMatrix, this._TransformationMatrix, rad(RotationVector[0]));
        glMatrix.mat4.rotateY(this._TransformationMatrix, this._TransformationMatrix, rad(RotationVector[1]));
        glMatrix.mat4.rotateZ(this._TransformationMatrix, this._TransformationMatrix, rad(RotationVector[2]));
    }

    /**
     * Scala la matrice di trasformazione.
     * @param {Vec3} ScalingVector Vettore di scalatura
     */
    setScaling(ScalingVector) {
        glMatrix.mat4.scale(this._TransformationMatrix, this._TransformationMatrix, ScalingVector);
    }

    /**
     * Funzione di inversione della matrice di Trasformazione
     */
    invertMatrix() {
        glMatrix.mat4.invert(this._inverseTransformationMatrix, this._TransformationMatrix);
    }

    /**Setter per definire se l'oggetto ha una matrice di Trasformazione associata */
    setTransformationMatrixValue() {
        this._hasTransformationMatrix = true;
    }

    /**
     * Funzione di inizializzazione del parametri di intersezione
     */
    initInterception() {
        this._t = 0;
        this._interception_point = 0;
        this._normal = 0;
    }

    /**
     * Setta i punti di intersezione Raggio-Figura
     * @param t {Double} parametro nel calcolo e+td, è uno scalare quindi vale in ogni SDR
     * @param interception_point {Vec3} punto di intersezione del raggio con l'oggetto
     * @param normal {Vec3} normale al punto sulla superficie
     */
    setInterception(t, interception_point, normal) {
        this._t = t;
        this._interception_point = interception_point;
        this._normal = normal;
    }


    set material(value) {
        this._material = value;
    }

    set index(value) {
        this._index = value;
    }

    set TransformationMatrix(value) {
        this._TransformationMatrix = value;
    }

    set inverseTransformationMatrix(value) {
        this._inverseTransformationMatrix = value;
    }

    set hasTransformationMatrix(value) {
        this._hasTransformationMatrix = value;
    }

    set t(value) {
        this._t = value;
    }

    set interception_point(value) {
        this._interception_point = value;
    }

    set normal(value) {
        this._normal = value;
    }
}
