/**
 * Classe che rappresenta un generico triangolo.
 */
class Triangle {
    /**
     * @constructor
     * @param {Array} p1 Primo vertice
     * @param {Array} p2 Secondo vertice
     * @param {Array} p3 Terzo vertice
     * @param {Integer} material Indice della lista di materiali di cui è costituito l'oggetto
     */
    constructor(p1, p2, p3, material) {
        this.p1 = glMatrix.vec3.fromValues(p1[0], p1[1], p1[2]);
        this.p2 = glMatrix.vec3.fromValues(p2[0], p2[1], p2[2]);
        this.p3 = glMatrix.vec3.fromValues(p3[0], p3[1], p3[2]);
        this.material = material;
        this.TransformationMatrix = glMatrix.mat4.create();
        this.inverseTransformationMatrix = glMatrix.mat4.create();
        this.hasTransformationMatrix = false;
    }
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
         *
         *
         * */
        let solutions;
        let A = [
            [this.p1[0] - this.p2[0], this.p1[0] - this.p3[0], ray.direction[0], this.p1[0] - ray.origin[0]],
            [this.p1[1] - this.p2[1], this.p1[1] - this.p3[1], ray.direction[1], this.p1[1] - ray.origin[1]],
            [this.p1[2] - this.p2[2], this.p1[2] - this.p3[2], ray.direction[2], this.p1[2] - ray.origin[2]],
        ];

        solutions = (gauss(A)); //Calcola il vettore contenente la soluzione delle tre equazioni necessarie
        //per identificare intersezione triangolo-raggio


        //[beta,gamma,t]trasposta

        //TODO epsilon per +/- 0 e 1

        //if (beta>0 && gamma>0 &&(beta+gamma)<1 ) --> HIT!
        if (solutions[0] > -EPSILON && solutions[1] > -EPSILON && (solutions[0] + solutions[1]) < 1 && solutions[2] > ray.tMin) {
            let point = glMatrix.vec3.create();
            glMatrix.vec3.scaleAndAdd(point, ray.origin, ray.direction, solutions[2]); // calcolo punto di intersezione

            let lato1 = glMatrix.vec3.create(); // vettore appoggio lato1 triangolo
            let lato2 = glMatrix.vec3.create(); // vettore appoggio lato2 triangolo
            glMatrix.vec3.subtract(lato1, this.p2, this.p1); // calcolo lato1 triangolo 
            glMatrix.vec3.subtract(lato2, this.p3, this.p2); // calcolo lato2 triangolo 

            let normal = glMatrix.vec3.create();
            glMatrix.vec3.cross(normal, lato1, lato2); //prodotto vettoriale dei due lati, normale per definizione
            //if (glMatrix.vec3.dot(normal, ray.direction)>rad(90))//NON SO IL VERSO DELLA NORMALE QUINDI LO ADATTO ALLA POS DELLA CAMERA
            //  glMatrix.vec3.negate(normal, normal);
            //spotata in ray_Intersect
            ray.ray_Intersect(solutions[2], point, normal);
            return true;

        } else
            return false;
    }
    /**
     * Funzione che mostra il tipo di oggettto corrente (Triangolo).
     */

    me() {
        console.log("TRIANGLE");
    }
    /**
     * Funzione che mostra la Matrice di Traformazione.
     */
    showTransformationMatrix() {
        console.log("************************")
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
    setTranslation(TransaltionVector) {
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

}
/**
 * Fattorizzazzione di Gauss con pivoting parziale per la risoluzione di un sistema lineare di dimensione pari al numero di colonne di A.
 * A deve essere quadrata.
 * @param {Array} A Matrice associata al sistema
 */
function gauss(A) {
    let n = A.length;

    for (let i = 0; i < n; i++) {
        // Search for maximum in this column
        let maxEl = Math.abs(A[i][i]);
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > maxEl) {
                maxEl = Math.abs(A[k][i]);
                maxRow = k;
            }
        }

        // Swap maximum row with current row (column by column)
        for (let k = i; k < n + 1; k++) {
            let tmp = A[maxRow][k];
            A[maxRow][k] = A[i][k];
            A[i][k] = tmp;
        }

        // Make all rows below this one 0 in current column
        for (let k = i + 1; k < n; k++) {
            let c = -A[k][i] / A[i][i];
            for (let j = i; j < n + 1; j++) {
                if (i === j) {
                    A[k][j] = 0;
                } else {
                    A[k][j] += c * A[i][j];
                }
            }
        }
    }

    // Solve equation Ax=b for an upper triangular matrix A
    let x = new Array(n);
    for (let i = n - 1; i > -1; i--) {
        x[i] = A[i][n] / A[i][i];
        for (let k = i - 1; k > -1; k--) {
            A[k][n] -= A[k][i] * x[i];
        }
    }
    return x;
}