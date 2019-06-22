/**Classe che definisce un materiale che verrà usato da un oggetto.*/
class Material {
    /**
     * @constructor
     * @param ka {Array(3)} Componente ambientale
     * @param kd {Array(3)} Componente diffusa
     * @param ks {Array(3)} Componente speculare
     * @param shininess {Float} Grado di riflessività
     * @param kr {Array(3)} Intensità della luce
     */
    constructor(ka, kd, ks, shininess, kr) {
        this.ka = glMatrix.vec3.fromValues(ka[0], ka[1], ka[2]); // riflessione ambientale
        this.kd = glMatrix.vec3.fromValues(kd[0], kd[1], kd[2]); // riflessione diffusa
        this.ks = glMatrix.vec3.fromValues(ks[0], ks[1], ks[2]); // riflessione speculare
        this.shininess=shininess;
        this.kr = glMatrix.vec3.fromValues(kr[0], kr[1], kr[2]);// intensità della luce riflessa restituita
    }


}

