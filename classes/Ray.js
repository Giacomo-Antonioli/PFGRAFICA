
class Ray{


    constructor(direction, origin, tMax, tMin) {
        this.direction = glMatrix.vec3.clone(direction); // e' necessario usare clone e non assegnare solo il valore del vec3
        this.origin = glMatrix.vec3.clone(origin);
        this.t_Nearest = tMax;
        this.tMax = tMax;
        this.tMin = tMin;
       }

//#########################################METHODS########################################################

show(){
    console.log("direction: " + this.direction);
    console.log("origin: " + this.origin);
    console.log("t_Nearest: " + this.t_Nearest);
    console.log("tMin: " + this.tMin);
    console.log("tMax: " + this.tMax);
}
showme(){
    console.log("direction: " + this.direction);
  //  console.log("origin: " + this.origin);
    }


    ray_Intersect(t,point,n) {
        /*
        * INPUT
        * t         scalare
        * point     Vettore
        * n         Vettore
        * */
         if (glMatrix.vec3.dot(n, this.direction)>rad(90))//NON SO IL VERSO DELLA NORMALE QUINDI LO ADATTO ALLA POS DELLA CAMERA
                glMatrix.vec3.negate(n, n);
        this.t_parameter=t;
        this.intersection_point=glMatrix.vec3.clone(point);
        this.normalpoint = glMatrix.vec3.clone(n);
        if (t <= this.t_Nearest && t >= this.tMin)
            this.t_Nearest = t;

    }

}

