//????????????????????????????????????????????????????????????????????????????????????????????????????|
//CORE VARIABLES
var canvas;
var context;
var imageBuffer;

var DEBUG = false; //whether to show debug messages
var EPSILON = 0.00001; //error margins

//scene to render
var scene;
var camera;
var surfaces = [];
//etc...


//initializes the canvas and drawing buffers
function init() {
    canvas = $('#canvas')[0];
    context = canvas.getContext("2d");
    imageBuffer = context.createImageData(canvas.width, canvas.height); //buffer for pixels
    loadSceneFile("assets/TriangleTest.json");
}



//____________________________________________________________________________________________________|

// var Material = function (ka, kd, ks, shininess, kr) {
//     this.ka = ka;
//     this.kd = kd;
//     this.ks = ks;
//     this.shininess = shininess;
//     this.kr = kr;
// };
// //ambient light only has color (???)
// var AmbientLight = function (color) {
//     this.color = color;
// };
// var PointLight = function (position, color) {
//     this.position = position;
//     this.color = color;
// };
// var DirectionalLight = function (direction, color) {
//     this.direction = direction;
//     this.color = color;
// };
var Ray = function (direction, origin, tMax, tMin) {
    // non mi preoccupo di costruire direction come vec3 perche' arriva gia' come tale
    this.direction =glMatrix.vec3.clone(direction); // e' necessario usare clone e non assegnare solo il valore del vec3
    this.origin = glMatrix.vec3.clone(origin);
    this.tMax = tMax;
    this.tMin = tMin; // NON COMPLETO !!!!!!! t UNDEFINED non so a cosa servono e li setto in modo "a fiducia"
    
};//might not need
var Intersection = function (t, intersectionPoint, normal) {
    this.t = t;
    this.intersectionPoint = glMatrix.vec3.clone(intersectionPoint);
    this.normal = glMatrix.vec3.clone(normal);
};//might not need

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
    this.material = material;
};

var Triangle = function (p1, p2, p3) {
//    this.p1 = glMatrix.vec3.fromValues(p1[0], p1[1], p1[2]);
//    this.p2 = glMatrix.vec3.fromValues(p2[0], p2[1], p2[2]);
//    this.p3 = glMatrix.vec3.fromValues(p3[0], p3[1], p3[2]);
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
};

Ray.prototype.point_at_parameter = function (t) {
    // non mi preoccupo di costruire direction  e origin come vec3 perche' il costruttore
    // li prende gia' come tali
   return this.origin + t* this.direction;

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
function loadSceneFile(filepath) {
    scene = Utils.loadJSON(filepath); //load the scene


    //TODO - set up camera

    camera = new Camera(scene.camera.eye, scene.camera.at, scene.camera.up, scene.camera.fovy, scene.camera.aspect);



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
                surfaces.push(new Triangle(element.p1, element.p2, element.p3));
        }
    );
   // console.log(surfaces);


    render(); //render the scene

}

Sphere.prototype.intersection=function(ray){
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
flag_t1=((-direction_times_origin_center_sub + Math.sqrt(Math.pow(direction_times_origin_center_sub, 2) - direction_euclidean_norm_squared * (origin_center_sub_euclidean_norm_squared - Math.pow(this.radius, 2)))) / direction_euclidean_norm_squared);
// -b + sqrt(b^2 - f*(a^2) - R^2) / f
flag_t2=((-direction_times_origin_center_sub - Math.sqrt(Math.pow(direction_times_origin_center_sub, 2) - direction_euclidean_norm_squared * (origin_center_sub_euclidean_norm_squared - Math.pow(this.radius, 2)))) / direction_euclidean_norm_squared);


    if (!isNaN(flag_t1) | !isNaN(flag_t1))
        return true;
    else
        return false;
}
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
    let solutions=[];
    var A = [
        [this.p1[0] - this.p2[0], this.p1[0] - this.p3[0], ray.direction[0], this.p1[0] - ray.origin[0]],
        [this.p1[1] - this.p2[1], this.p1[1] - this.p3[1], ray.direction[1], this.p1[1] - ray.origin[1]],
        [this.p1[2] - this.p2[2], this.p1[2] - this.p3[2], ray.direction[2], this.p1[2] - ray.origin[2]],
    ];

    solutions=(gauss(A));


  //  let flag_t1, flag_t2;

    //if (beta>0 && gamma>0 &&(beta+gamma)<1 ) --> HIT!
    if (solutions[0] > 0 && solutions[1] > 0 && (solutions[0] + solutions[1])<1)
       return true;
    else
        return false;
}

//renders the scene
function render() {
    var start = Date.now(); //for logging
    let setpixel; // array d'appoggio
    let counter = 0; // TODELETE
    //Faccio un doppio for per prendere tutti i pixel del canvas
    for (let coloumn = 0; coloumn < 512; coloumn++) {
        for (let row = 0; row < 512; row++) {
            //TODO - fire a ray though each pixel
            ray = camera.castRay(coloumn, row);
            //TODO - calculate the intersection of that ray with the scene
            surfaces.forEach(function (element) {

                setpixel = element.intersection(ray);
                                    //TODO - set the pixel to be the color of that intersection (using setPixel() method)
                if (setpixel)
                    
                    setPixel(coloumn, row, [1, 1, 1]);
                else
                    setPixel(coloumn, row, [0, 0, 0]);
               
            }
            );
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
    $('#canvas').click(function (e) {
        var x = e.pageX - $('#canvas').offset().left;
        var y = e.pageY - $('#canvas').offset().top;
        DEBUG = true;
        camera.castRay(x, y); //cast a ray through the point
        DEBUG = false;
    });

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