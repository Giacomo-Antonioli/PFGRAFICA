
class Triangle {
    constructor(p1,p2,p3,material)
    {
        this.p1 = glMatrix.vec3.fromValues(p1[0], p1[1], p1[2]);
        this.p2 = glMatrix.vec3.fromValues(p2[0], p2[1], p2[2]);
        this.p3 = glMatrix.vec3.fromValues(p3[0], p3[1], p3[2]);
        this.material=material;
    };

    intersection = function (ray) {
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
        let solutions ;
        let A = [
            [this.p1[0] - this.p2[0], this.p1[0] - this.p3[0], ray.direction[0], this.p1[0] - ray.origin[0]],
            [this.p1[1] - this.p2[1], this.p1[1] - this.p3[1], ray.direction[1], this.p1[1] - ray.origin[1]],
            [this.p1[2] - this.p2[2], this.p1[2] - this.p3[2], ray.direction[2], this.p1[2] - ray.origin[2]],
        ];

        solutions = (gauss(A));//Calcola il vettore contenente la soluzione delle tre equazioni necessarie
        //per identificare intersezione triangolo-raggio


        //  let flag_t1, flag_t2;

        //if (beta>0 && gamma>0 &&(beta+gamma)<1 ) --> HIT!
        if (solutions[0] > 0 && solutions[1] > 0 && (solutions[0] + solutions[1]) < 1)
            return true;
        else
            return false;
    };


}
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

