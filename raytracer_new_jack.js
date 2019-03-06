
var canvas;
var context;
var imageBuffer;

var DEBUG = false; //whether to show debug messages
var EPSILON = 0.00001; //error margins

//scene to render
var scene;
var camera;
var surfaces = [];
var lights = [];
var materials = [];
var bounce_depth;
var shadow_bias;
//etc...


//initializes the canvas and drawing buffers
function init() {
    canvas = $('#canvas')[0];
    context = canvas.getContext("2d");
    imageBuffer = context.createImageData(canvas.width, canvas.height); //buffer for pixels
    loadSceneFile("assets/SphereShadingTest1.json");
}


//____________________________________________________________________________________________________|

var Material = function (ka, kd, ks, shininess, kr) {
    this.ka = glMatrix.vec3.fromValues(ka[0], ka[1], ka[2]); // riflessione ambientale
    this.kd = glMatrix.vec3.fromValues(kd[0], kd[1], kd[2]); // riflessione diffusa
    this.ks = glMatrix.vec3.fromValues(ks[0], ks[1], ks[2]); // riflessione speculare
    this.shininess = shininess;
    this.kr = glMatrix.vec3.fromValues(kr[0], kr[1], kr[2]); // intensità della luce riflessa restituita
};

var AmbientLight = function (color) {
    this.color = glMatrix.vec3.fromValues(color[0], color[1], color[2]);
};
var PointLight = function (position, color) {
    this.position = glMatrix.vec3.fromValues(position[0], position[1], position[2]);
    this.color = glMatrix.vec3.fromValues(color[0], color[1], color[2]);
};
var DirectionalLight = function (direction, color) {
    this.direction = glMatrix.vec3.fromValues(direction[0], direction[1], direction[2]);
    this.color = glMatrix.vec3.fromValues(color[0], color[1], color[2]);
};
var Ray = function (direction, origin, tMax, tMin) {
    // non mi preoccupo di costruire direction come vec3 perche' arriva gia' come tale
    this.direction = glMatrix.vec3.clone(direction); // e' necessario usare clone e non assegnare solo il valore del vec3
    this.origin = glMatrix.vec3.clone(origin);
    this.tMax = tMax;
    this.tMin = tMin; // NON COMPLETO !!!!!!! t UNDEFINED non so a cosa servono e li setto in modo "a fiducia"

};
var Intersection = function (t, intersectionPoint, normal) {
    this.t = t;
    this.intersectionPoint = glMatrix.vec3.clone(intersectionPoint);
    this.normal = glMatrix.vec3.clone(normal);
};

//CLASSI

var Camera = function (eye, at, up, fovy, aspect) { //definisco la classe Camera _______ INCOMPLETO!!!
    this.eye = eye;
    this.at = at;
    this.fovy = fovy;
    this.up = up;
    this.aspect = aspect;

    this.h = 2 * Math.tan(rad(fovy / 2.0));
    this.w = this.h * aspect;

};

var Sphere = function (center, radius, material) {
    this.center = glMatrix.vec3.fromValues(center[0], center[1], center[2]);
    this.radius = radius;
    this.material = material; //Indica l'indice all'interno dell'array materiali da applicare alla figura
    this.interception_point;
};

var Triangle = function (p1, p2, p3, material) {
    //    this.p1 = glMatrix.vec3.fromValues(p1[0], p1[1], p1[2]);
    //    this.p2 = glMatrix.vec3.fromValues(p2[0], p2[1], p2[2]);
    //    this.p3 = glMatrix.vec3.fromValues(p3[0], p3[1], p3[2]);
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.material = material; //Indica l'indice all'interno dell'array materiali da applicare alla figura
};

Ray.prototype.point_at_parameter = function (t) {
    // non mi preoccupo di costruire direction  e origin come vec3 perche' il costruttore
    // li prende gia' come tali

    //*********************************VARIABILI D'APPOGGIO*************/
    let Orig_MUl_scaledDir = glMatrix.vec3.create();
    let ScaledDir = glMatrix.vec3.create();
    //*****************************************************************/

    glMatrix.vec3.scale(ScaledDir, this.direction, t);
    glMatrix.vec3.add(Orig_MUl_scaledDir, ScaledDir, this.origin);

    return Orig_MUl_scaledDir;


};

Camera.prototype.castRay = function (x, y) { //aggiungo alla classe Camera la funzione castRay_______ INCOMPLETO!!!
    var u = (this.w * x / (canvas.width - 1)) - (this.w / 2.0);
    var v = (-this.h * y / (canvas.height - 1)) + (this.h / 2.0);


    //where is eye used??
    var direction = glMatrix.vec3.fromValues(u, v, -1);
    var origin = glMatrix.vec3.clone(this.eye);//vec3.clone(this.at);// vec3.fromValues(0, 0, 0);
    return new Ray(direction, origin, undefined, 0);
    //return new ray with origin at (0,0,0) and direction
};


//loads and "parses" the scene file at the given path

Sphere.prototype.intersection = function (ray) {
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
Triangle.prototype.intersection = function (ray) {
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
    let solutions = [];
    var A = [
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


function setColor(ray) {

    var color;
    let setpixel; // variabile d'appoggio
    /*
     ambient_component              OK
     diffuse_component              Da fare
     specular_component             Da fare        
     */

    surfaces.forEach(function (element) {

            //TODO - calculate the intersection of that ray with the scene
            setpixel = element.intersection(ray); //setpixel mi dice se il raggio interseca la figura

            //console.log(isNaN(element.interception_point));
            if (!isNaN(element.interception_point)) {


                this.hit_point = ray.point_at_parameter(element.interception_point);// tre coordinate punto nello spazio

                //*******************************************Variabili Principali************************************
                let total = glMatrix.vec3.fromValues(0,0,0);
                let ambient_component = glMatrix.vec3.create(); //Ka*Ia
                let diffuse_component = glMatrix.vec3.create(); //Kd(Lm*N)*Id
                let specular_component = glMatrix.vec3.create(); //Ks(Rm*V)^alfa*Is
                //*******************************************End Variabili Principali*******************************


                //*******************************************Variabili Di Lavoro************************************

                let Ka = glMatrix.vec3.create();
                let Ia = glMatrix.vec3.create();
                //---------------------------------------------------------------------------------------------------
                let Kd = glMatrix.vec3.create();
                let N = glMatrix.vec3.create();
                let L = glMatrix.vec3.create();
                let maxdot_diffuse;
                let Kd_MUL_I = glMatrix.vec3.create();
                //---------------------------------------------------------------------------------------------------
                let I = glMatrix.vec3.create();//Condivisa dai due membri sopra e sotto
                //---------------------------------------------------------------------------------------------------

                let Ks = glMatrix.vec3.create();
                let V = glMatrix.vec3.create();
                let R = glMatrix.vec3.create();
                let alpha;
                let R_multiplyier;
                let maxdot_specular_powered;
                let Ks_MUL_I = glMatrix.vec3.create();
                //*******************************************End Variabili Di Lavoro*******************************

                //Calcolo di ambient_component
                Ka = glMatrix.vec3.clone(materials[element.material].ka);
                Ia = glMatrix.vec3.clone(lights[0].color);
                glMatrix.vec3.multiply(ambient_component, Ka,Ia);//Calcolo KaIA e lo sommo al totale
                if(DEBUG)
                    console.log("ambient_component: "+ambient_component);


                for (let i = 1; i < lights.length; i++) { // sommatoria per ogni luce
                //Calcolo di diffuse_component
                    //Appunto negare r
                    I = glMatrix.vec3.clone(lights[i].color);
                    Kd = glMatrix.vec3.clone(materials[element.material].kd);

                    glMatrix.vec3.subtract(L, this.hit_point, lights[i].position);//L
                    glMatrix.vec3.normalize(L, L);// normalizzo L
                   // console.log("L:" + L);

                    glMatrix.vec3.subtract(N, this.hit_point, element.center);// N
                    glMatrix.vec3.scale(N, N, 1 / element.radius);
                    glMatrix.vec3.normalize(N, N);// normalizzo N
                   //glMatrix.vec3.negate(L, L); // ??????????????????????

                    /*
            $$$$$$$\   $$$$$$\        $$$$$$$\  $$$$$$\ $$\      $$\ $$$$$$$$\ $$$$$$$$\ $$$$$$$$\ $$$$$$$$\ $$$$$$$\  $$$$$$$$\
            $$  __$$\ $$  __$$\       $$  __$$\ \_$$  _|$$$\    $$$ |$$  _____|\__$$  __|\__$$  __|$$  _____|$$  __$$\ $$  _____|
            $$ |  $$ |$$ /  $$ |      $$ |  $$ |  $$ |  $$$$\  $$$$ |$$ |         $$ |      $$ |   $$ |      $$ |  $$ |$$ |
            $$ |  $$ |$$$$$$$$ |      $$$$$$$  |  $$ |  $$\$$\$$ $$ |$$$$$\       $$ |      $$ |   $$$$$\    $$$$$$$  |$$$$$\
            $$ |  $$ |$$  __$$ |      $$  __$$<   $$ |  $$ \$$$  $$ |$$  __|      $$ |      $$ |   $$  __|   $$  __$$< $$  __|
            $$ |  $$ |$$ |  $$ |      $$ |  $$ |  $$ |  $$ |\$  /$$ |$$ |         $$ |      $$ |   $$ |      $$ |  $$ |$$ |
            $$$$$$$  |$$ |  $$ |      $$ |  $$ |$$$$$$\ $$ | \_/ $$ |$$$$$$$$\    $$ |      $$ |   $$$$$$$$\ $$ |  $$ |$$$$$$$$\
            \_______/ \__|  \__|      \__|  \__|\______|\__|     \__|\________|   \__|      \__|   \________|\__|  \__|\________|
            Asset modificato :)
             */

                    maxdot_diffuse = Math.max(0.0, glMatrix.vec3.dot(L, N));

                    glMatrix.vec3.multiply(Kd_MUL_I, Kd, I); // Kd x I

                    glMatrix.vec3.scale(diffuse_component, Kd_MUL_I, maxdot_diffuse);
                    if (DEBUG)
                        console.log("diffuse_component: " + diffuse_component);

                 //Calcolo di diffuse_component
                 //Appunto negare r
                    Ks = glMatrix.vec3.clone(materials[element.material].ks);
                    alpha = materials[element.material].shininess;

                    R_multiplyier = 2 * glMatrix.vec3.dot(L, N);//2(L * N)
                    glMatrix.vec3.scale(R, N, R_multiplyier);//(2(L * N) * N)
                    glMatrix.vec3.subtract(R, R, L);//(2(L * N) * N) - L
                    glMatrix.vec3.normalize(R, R);// normalizzo L
                    //glMatrix.vec3.negate(R, R); ??????????????????
                    glMatrix.vec3.subtract(V, this.hit_point, camera.eye);//V
                    glMatrix.vec3.normalize(V, V);// normalizzo V
                    
                    maxdot_specular_powered = Math.pow(Math.max(0.0, glMatrix.vec3.dot(R, V)), alpha);
                    glMatrix.vec3.multiply(Ks_MUL_I, Ks, I);
                    glMatrix.vec3.scale(specular_component, Ks_MUL_I, maxdot_specular_powered);


                }

                glMatrix.vec3.add(total, total, ambient_component);
                glMatrix.vec3.add(total, total, diffuse_component);
                glMatrix.vec3.add(total, total, specular_component);
                //console.log("diffuse_component: " + diffuse_component);
                if (setpixel) {
                    color = [total[0], total[1], total[2]];//Colore figura

                } else
                    color = [0, 0, 0];//Colore background

            } else
                color = [0, 0, 0];
        }
    );

    return color;


}


function loadSceneFile(filepath) {
    scene = Utils.loadJSON(filepath); //load the scene


    //TODO - set up camera

    camera = new Camera(scene.camera.eye, scene.camera.at, scene.camera.up, scene.camera.fovy, scene.camera.aspect);

    scene.lights.forEach(function (element) {
            if (element.source == "Ambient")
                lights.push(new AmbientLight(element.color));
            if (element.source == "Point") {
                lights.push(new PointLight(element.position, element.color));
            }

            if (element.source == "Directional")
                lights.push(new DirectionalLight(element.direction, element.color));


        }
    );

    bounce_depth = scene.bounce_depth;
    shadow_bias = scene.shadow_bias;

    scene.materials.forEach(function (element) {
        materials.push(new Material(element.ka, element.kd, element.ks, element.shininess, element.kr));

    });


    //  console.log(camera.castRay(0, 0));
    //  console.log(camera.castRay(width, height));
    //  console.log(camera.castRay(0, height));
    //  console.log(camera.castRay(width, 0));
    //  console.log(camera.castRay(width / 2, height / 2));

    //TODO - set up surfaces
    scene.surfaces.forEach(function (element) {

            if (element.shape == "Sphere")
                surfaces.push(new Sphere(element.center, element.radius, element.material));

            if (element.shape == "Triangle")
                surfaces.push(new Triangle(element.p1, element.p2, element.p3, element.material));
        }
    );
    // console.log(surfaces);


    render(); //render the scene

}

//renders the scene
function render() {
    var start = Date.now(); //for logging

    let counter = 0; // TODELETE
    //Faccio un doppio for per prendere tutti i pixel del canvas
    for (let coloumn = 0; coloumn < 512; coloumn++) {
        for (let row = 0; row < 512; row++) {
            //TODO - fire a ray though each pixel
            ray = camera.castRay(coloumn, row);

            setPixel(coloumn, row, setColor(ray));


            //????????????????????????????????????????????
            //var v_Color = glMatrix.vec4.create();

            var u_AmbientLight = glMatrix.vec3.create();
            var u_AmbientLight = glMatrix.vec3.create();


            //v_Color = vec4(atten *(diffuse + specular)  + ambient, 1.0);
            //????????????????????????????????????????????


        }
    }
    // console.log("T non nulli:" + counter);

    //render the pixels that have been set
    context.putImageData(imageBuffer, 0, 0);

    var end = Date.now(); //for logging
    $('#log').html("rendered in: " + (end - start) + "ms");
    console.log("rendered in: " + (end - start) + "ms");

}

//????????????????????????????????????????????????????????????????????????????????????????????????????|

//sets the pixel at the given x,y to the given color
/**
 * Sets the pixel at the given screen coordinates to the given color
 * @param {int} x     The x-coordinate of the pixel
 * @param {int} y     The y-coordinate of the pixel
 * @param {float[3]} color A length-3 array (or a vec3) representing the color. Color values should floating point values between 0 and 1
 */
function setPixel(x, y, color) {
    var i = (y * imageBuffer.width + x) * 4;
    imageBuffer.data[i] = (color[0] * 255) | 0;
    imageBuffer.data[i + 1] = (color[1] * 255) | 0;
    imageBuffer.data[i + 2] = (color[2] * 255) | 0;
    imageBuffer.data[i + 3] = 255; //(color[3]*255) | 0; //switch to include transparency
}

//converts degrees to radians
function rad(degrees) {
    return degrees * Math.PI / 180;
}

//on load, run the application
$(document).ready(function () {
    init();
    render();

    //load and render new scene
    $('#load_scene_button').click(function () {
        var filepath = 'assets/' + $('#scene_file_input').val() + '.json';
        loadSceneFile(filepath);
    });

    //debugging - cast a ray through the clicked pixel with DEBUG messaging on
   /* $('#canvas').click(function (e) {
        var x = e.pageX - $('#canvas').offset().left;
        var y = e.pageY - $('#canvas').offset().top;
        DEBUG = true;
        camera.castRay(x, y); //cast a ray through the point
        DEBUG = false;
    });*/

});
//____________________________________________________________________________________________________|

//****************************************************************************************************|
/** Solve a linear system of equations given by a n&times;n matrix
 with a result vector n&times;1. */
function gauss(A) {
    var n = A.length;

    for (var i = 0; i < n; i++) {
        // Search for maximum in this column
        var maxEl = Math.abs(A[i][i]);
        var maxRow = i;
        for (var k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > maxEl) {
                maxEl = Math.abs(A[k][i]);
                maxRow = k;
            }
        }

        // Swap maximum row with current row (column by column)
        for (var k = i; k < n + 1; k++) {
            var tmp = A[maxRow][k];
            A[maxRow][k] = A[i][k];
            A[i][k] = tmp;
        }

        // Make all rows below this one 0 in current column
        for (k = i + 1; k < n; k++) {
            var c = -A[k][i] / A[i][i];
            for (var j = i; j < n + 1; j++) {
                if (i == j) {
                    A[k][j] = 0;
                } else {
                    A[k][j] += c * A[i][j];
                }
            }
        }
    }

    // Solve equation Ax=b for an upper triangular matrix A
    var x = new Array(n);
    for (var i = n - 1; i > -1; i--) {
        x[i] = A[i][n] / A[i][i];
        for (var k = i - 1; k > -1; k--) {
            A[k][n] -= A[k][i] * x[i];
        }
    }
    return x;
}

//____________________________________________________________________________________________________|
