class Ray{
    constructor(direction, origin, tMax, tMin) {
        this.direction = glMatrix.vec3.clone(direction); // e' necessario usare clone e non assegnare solo il valore del vec3
        this.origin = glMatrix.vec3.clone(origin);
        this.tMax = tMax;
        this.tMin = tMin; // NON COMPLETO !!!!!!! t UNDEFINED non so a cosa servono e li setto in modo "a fiducia"
    }
};

export default Ray;