/**
 * Classe che rappresenta una generica sfera.
 */
class Figure {
    /**
     * @constructor
     * @param {Array} center Centro della sfera
     * @param {Float} radius Raggio della sfera
     * @param {Integer} material Indice della lista di materiali di cui è costituito l'oggetto
     */
    constructor(material,index) {
        this.material = material; //Indica l'indice all'interno dell'array materiali da applicare alla figura
        this.TransformationMatrix = glMatrix.mat4.create();
        this.inverseTransformationMatrix = glMatrix.mat4.create();
        this.hasTransformationMatrix = false;
        this.index=index;
    }
    /**
     * Funzione che mostra il tipo di oggettto corrente (Sfera).
     */
    me() {
        console.log("SPHERE");
    }
    /**
     * Funzione che mostra la Matrice di Traformazione.
     */
    showTransformationMatrix() {
        console.log("************************");
        console.log("TRANSFORMATION MATRIX: ");
        for (let i = 0; i < 4; i++) {
            console.log(this.TransformationMatrix[i * 4] + " " + this.TransformationMatrix[i * 4 + 1] + " " + this.TransformationMatrix[i * 4 + 2] + " " + this.TransformationMatrix[i * 4 + 3]);
        }
        console.log("************************")
    }
    /**
     * Trasla la matrice di trasformazione.
     * @param {Vec3} TransaltionVector Vettore di traslazione
     */
    setTranslation(TransaltionVector){
        glMatrix.mat4.translate(this.TransformationMatrix, this.TransformationMatrix, TransaltionVector);
    }
    /**
     * Ruota la matrice di trasformazione.
     * @param {Vec3} RotationVector Vettore di rotazione
     */
    setRotation(RotationVector) {
        glMatrix.mat4.rotateX(this.TransformationMatrix, this.TransformationMatrix, rad(RotationVector[0]));
        glMatrix.mat4.rotateY(this.TransformationMatrix, this.TransformationMatrix, rad(RotationVector[1]));
        glMatrix.mat4.rotateZ(this.TransformationMatrix, this.TransformationMatrix, rad(RotationVector[2]));
    }
    /**
     * Scala la matrice di trasformazione.
     * @param {Vec3} ScalingVector Vettore di scalatura
     */
    setScaling(ScalingVector) {
        glMatrix.mat4.scale(this.TransformationMatrix, this.TransformationMatrix, ScalingVector);
    }
    /**
     * Funzione di inversione della matrice di Trasformazione
     */
    invertMatrix() {
        glMatrix.mat4.invert(this.inverseTransformationMatrix, this.TransformationMatrix);
    }
    /**Setter per definire se l'oggetto ha una matrice di Trasformazione associata */
    setTransformationMatrixValue() {
        this.hasTransformationMatrix = true;
    }
    initInterception()
    {   this.t=0;
        this.interception_point=0;
        this.normal=0;
    }
    setInterception(t,interception_point,normal)
    {
        this.t=t;
        this.interception_point=interception_point;
        this.normal=normal;
    }
}