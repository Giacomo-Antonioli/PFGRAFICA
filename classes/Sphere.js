/**
 * Classe che rappresenta una generica sfera.
 */
class Sphere {
    /**
     * @constructor
     * @param {Array} center Centro della sfera
     * @param {Float} radius Raggio della sfera
     * @param {Integer} material Indice della lista di materiali di cui è costituito l'oggetto
     */
    constructor(center, radius, material,index) {
        this.center = glMatrix.vec3.fromValues(center[0], center[1], center[2]);
        this.radius = radius;
        this.material = material; //Indica l'indice all'interno dell'array materiali da applicare alla figura
        this.TransformationMatrix = glMatrix.mat4.create();
        this.inverseTransformationMatrix = glMatrix.mat4.create();
        this.transposedInverseTransformationMatrix = glMatrix.mat4.create();
        this.hasTransformationMatrix = false;
        this.transformedLights=[];
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
        console.log("************************")
        console.log("TRANSFORMATION MATRIX: ");
        for (let i = 0; i < 4; i++) {
            console.log(this.TransformationMatrix[i * 4] + " " + this.TransformationMatrix[i * 4 + 1] + " " + this.TransformationMatrix[i * 4 + 2] + " " + this.TransformationMatrix[i * 4 + 3]);
        }
        console.log("************************")
    }


    setTransformedLights(lights)
    {
        let tempvec3Light;
        for(let i = 0; i < lights.length; i++)
         {
            if (lights[i].type == "Ambient") {
                this.transformedLights.push([0,0,0]);
            }
            if (lights[i].type == "Point") {
                tempvec3Light = glMatrix.vec4.fromValues(lights.origin[0], lights.origin[1], lights.origin[2], 1);
                glMatrix.vec4.TransformMat4(tempvec3Light,tempvec3Light,this.inverseTransformationMatrix);
                this.transformedLights.push([tempvec3Light[0],tempvec3Light[1],tempvec3Light[2]]);
            }
            if (lights[i].type == "Directional")
                {  tempvec3Light = glMatrix.vec4.fromValues(lights.origin[0], lights.origin[1], lights.origin[2], 0);
                    glMatrix.vec4.TransformMat4(tempvec3Light,tempvec3Light,this.inverseTransformationMatrix);
                    this.transformedLights.push([tempvec3Light[0],tempvec3Light[1],tempvec3Light[2]]);}
        }
    
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

        glMatrix.vec3.subtract(origin_center_sub, ray.origin, this.center); // a
        direction_times_origin_center_sub = glMatrix.vec3.dot(ray.direction, origin_center_sub); // b
        direction_euclidean_norm_squared = glMatrix.vec3.dot(ray.direction, ray.direction); // f
        origin_center_sub_euclidean_norm_squared = glMatrix.vec3.dot(origin_center_sub, origin_center_sub);

        let discriminant = Math.pow(direction_times_origin_center_sub, 2) - direction_euclidean_norm_squared * (origin_center_sub_euclidean_norm_squared - Math.pow(this.radius, 2));

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
        if (t === -1 | t <= ray.tMin) {
            return false;
        } else {
            let point = glMatrix.vec3.create();
            glMatrix.vec3.scaleAndAdd(point, ray.origin, ray.direction, t);
            let normal = glMatrix.vec3.create();
            glMatrix.vec3.subtract(normal, point, this.center);
            let unitNormal = glMatrix.vec3.create();
            glMatrix.vec3.scale(unitNormal, normal, 1 / this.radius);

            console.log("T Sphere:" +t);
            return ray.ray_Intersect(t, point, unitNormal);
        }


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
    /**
     * Funzione di trasposizione dell'inversa della matrice di Trasformazione
     */
    transposeMatrix() {
        glMatrix.mat4.transpose(this.transposedInverseTransformationMatrix, this.inverseTransformationMatrix);
    }
    /**Setter per definire se l'oggetto ha una matrice di Trasformazione associata */
    setTransformationMatrixValue() {
        this.hasTransformationMatrix = true;
    }

    isTheSame(secondObject) {
        if (this.index==secondObject.index)
            return true;
        else
            return false;
    }

}