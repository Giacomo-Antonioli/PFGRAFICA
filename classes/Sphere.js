
class Sphere{

    constructor(center,radius,material) {
        this.center = glMatrix.vec3.fromValues(center[0], center[1], center[2]);
        this.radius = radius;
        this.material = material; //Indica l'indice all'interno dell'array materiali da applicare alla figura

    }
    intersection = function (ray) {
        /* *
         * Funzione per il calcolo delle intersezioni del raggio di luce con la sfera
         * INPUT
         * Ray (struct) --> ottenuto dal castray della camera
         * OUTPUT
         * t (array) --> array di punti di intersezione con l'oggetto
         * Funzionamento
         * Risolve il sistema tra l'equazione del raggio e quella della sfera, trovando il punto o i punti
         * di interesezione
         * Variabili
         * origin_center_sub --> Differenza tra origine circonferenza e origine del raggio (e-c)
         * direction_times_origin_center_sub --> d*(e-c)
         * direction_euclidean_norm_squared --> d*d
         *
         * */

        let flag_t1, flag_t2;
        var origin_center_sub = glMatrix.vec3.create(); //a

        var direction_times_origin_center_sub; // b
        var direction_euclidean_norm_squared; // f
        var origin_center_sub_euclidean_norm_squared; // a^2

        glMatrix.vec3.subtract(origin_center_sub, ray.origin, this.center); // a
        direction_times_origin_center_sub = glMatrix.vec3.dot(ray.direction, origin_center_sub); // b
        direction_euclidean_norm_squared = glMatrix.vec3.dot(ray.direction, ray.direction); // f
        origin_center_sub_euclidean_norm_squared = glMatrix.vec3.dot(origin_center_sub, origin_center_sub);


        // -b + sqrt(b^2 - f*(a^2) - R^2) / f
        flag_t1 = ((-direction_times_origin_center_sub + Math.sqrt(Math.pow(direction_times_origin_center_sub, 2) - direction_euclidean_norm_squared * (origin_center_sub_euclidean_norm_squared - Math.pow(this.radius, 2)))) / direction_euclidean_norm_squared);
        // -b + sqrt(b^2 - f*(a^2) - R^2) / f
        flag_t2 = ((-direction_times_origin_center_sub - Math.sqrt(Math.pow(direction_times_origin_center_sub, 2) - direction_euclidean_norm_squared * (origin_center_sub_euclidean_norm_squared - Math.pow(this.radius, 2)))) / direction_euclidean_norm_squared);

        //Posso fare il controllo solo un flag in quanto se i punti sono coincidenti i flag sono uguali
        // E se son diversi devono avere entrambi un valore non nullo se intersecano la sfera
        if (!isNaN(flag_t1)) {
            //console.log("INTERCEPTISSS");
            if (flag_t1 < 0 && flag_t2 < 0)
                return false;
            else if (flag_t1 >= flag_t2)
                this.interception_point = flag_t1;
            else
                this.interception_point = flag_t2;

            return true;
        } else
            return false;
    };

}

