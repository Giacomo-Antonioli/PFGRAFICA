let canvas;
let context;
let imageBuffer;
let DEBUG = false; //whether to show debug messages
let EPSILON = 0.00001; //error margins
let mydebug = false;
let mincoloumn;
let maxcoloumn;
let minrow;
let maxrow;
let cropped = false;
//##################################################################
let file_path = "assets/TransformationTest.json";
//####################GLOBAL VALUES#################################
let scene;
let camera;
let surfaces = [];
let lights = [];
let materials = [];
let bounce_depth;
let shadow_bias;
let counterflag = 0;
//etc...
//####################GLOBAL VALUES#################################
//ProvaBranch

//on load, run the application
$(document).ready(function () {
    init();
    render();

    //load and render new scene
    $('#load_scene_button').click(function () {
        let filepath = 'assets/' + $('#scene_file_input').val() + '.json';
        loadSceneFile(filepath);
    });

    //debugging - cast a ray through the clicked pixel with DEBUG messaging on
    /* $('#canvas').click(function (e) {
         let x = e.pageX - $('#canvas').offset().left;
         let y = e.pageY - $('#canvas').offset().top;
         DEBUG = true;
         camera.castRay(x, y); //cast a ray through the point
         DEBUG = false;
     });*/

});

//____________________________________________________________________________________________________|


function setColor(ray) {
    /**
     * This function decides the color of a single pixel based on the nearest object to the camera and based on the lights positions and colors and the object material properties.
     * @param {Ray} ray This is a ray casted from the camera to the pixel
     * @return {float array} color RGB composition of the resulting color.
     *
     *
     * **/

    let color = [0, 0, 0];
    let setpixel; // variabile d'appoggio


    surfaces.forEach(function (element) {




        
        //TODO - calculate the intersection of that ray with the scene
        setpixel = element.intersection(ray); //setpixel mi dice se il raggio interseca la figura


        if (setpixel) {

            //this.hit_point = ray.point_at_parameter(element.interception_point);// tre coordinate punto nello spazio

            //*******************************************variabili Principali************************************
            let total = glMatrix.vec3.fromValues(0, 0, 0);
            let ambient_component = glMatrix.vec3.create(); //Ka*Ia
            let diffuse_component = glMatrix.vec3.create(); //Kd(Lm*N)*Id
            let specular_component = glMatrix.vec3.create(); //Ks(Rm*V)^alfa*Is
            //*******************************************End variabili Principali*******************************


            //*******************************************variabili Di Lavoro************************************

            let Ka = glMatrix.vec3.create();
            let Ia = glMatrix.vec3.create();
            //---------------------------------------------------------------------------------------------------
            let Kd = glMatrix.vec3.create();
            let N = glMatrix.vec3.create();
            let L = glMatrix.vec3.create();
            let NormNegL = glMatrix.vec3.create();
            let maxdot_diffuse;
            let Kd_MUL_I = glMatrix.vec3.create();
            //---------------------------------------------------------------------------------------------------
            let I = glMatrix.vec3.create(); //Condivisa dai due membri sopra e sotto
            //---------------------------------------------------------------------------------------------------

            let Ks = glMatrix.vec3.create();
            let V = glMatrix.vec3.create();
            let R = glMatrix.vec3.create();
            let alpha;
            let R_multiplyier;
            let maxdot_specular_powered;
            let Ks_MUL_I = glMatrix.vec3.create();

            //******Variabili Ombra************************************
            let shadowHit;
            let maxdistance = glMatrix.vec3.create();
            let negativeL = glMatrix.vec3.create();
            //******Fine Variabili Ombra*******************************


            //*******************************************End variabili Di Lavoro*******************************

            //Calcolo di ambient_component
            Ka = glMatrix.vec3.clone(materials[element.material].ka);
            Ia = glMatrix.vec3.clone(lights[0].color);
            glMatrix.vec3.multiply(ambient_component, Ka, Ia); //Calcolo KaIA e lo sommo al totale

            glMatrix.vec3.add(total, total, ambient_component);


            for (let i = 1; i < lights.length; i++) { // sommatoria per ogni luce
                //Calcolo di diffuse_component
                //Appunto negare r

                I = glMatrix.vec3.clone(lights[i].color);
                Kd = glMatrix.vec3.clone(materials[element.material].kd);

                if (lights[i] instanceof PointLight) {
                    glMatrix.vec3.subtract(L, ray.intersection_point, lights[i].position); //L
                    maxdistance = glMatrix.vec3.distance(ray.intersection_point, lights[i].position);
                } else {
                    L = glMatrix.vec3.clone(lights[i].direction);
                    maxdistance = Number.POSITIVE_INFINITY;
                }
                ///FUNZIONE CASTING OMBRA


                glMatrix.vec3.negate(negativeL, L);


                shadowHit = ShadowCast(new Ray(negativeL, ray.intersection_point, maxdistance, shadow_bias));
                if (!shadowHit) {
                    ///FINE FUNZIONE CASTING OMBRA
                    glMatrix.vec3.normalize(L, L); // normalizzo L

                    N = glMatrix.vec3.clone(ray.normalpoint);

                    glMatrix.vec3.normalize(N, N); // normalizzo N

                    glMatrix.vec3.negate(NormNegL, L);


                    maxdot_diffuse = Math.max(0.0, glMatrix.vec3.dot(NormNegL, N));

                    glMatrix.vec3.multiply(Kd_MUL_I, Kd, I); // Kd x I

                    glMatrix.vec3.scale(diffuse_component, Kd_MUL_I, maxdot_diffuse);

                    //Calcolo di diffuse_component

                    Ks = glMatrix.vec3.clone(materials[element.material].ks);
                    alpha = materials[element.material].shininess;

                    R_multiplyier = 2 * glMatrix.vec3.dot(L, N); //2(L * N)
                    glMatrix.vec3.scale(R, N, R_multiplyier); //(2(L * N) * N)
                    glMatrix.vec3.subtract(R, R, L); //(2(L * N) * N) - L
                    glMatrix.vec3.normalize(R, R); // normalizzo R

                    glMatrix.vec3.subtract(V, ray.intersection_point, camera.eye); //V
                    glMatrix.vec3.normalize(V, V); // normalizzo V

                    maxdot_specular_powered = Math.pow(Math.max(0.0, glMatrix.vec3.dot(R, V)), alpha);
                    glMatrix.vec3.multiply(Ks_MUL_I, Ks, I);
                    glMatrix.vec3.scale(specular_component, Ks_MUL_I, maxdot_specular_powered);


                    glMatrix.vec3.add(total, total, diffuse_component);
                    glMatrix.vec3.add(total, total, specular_component);
                }
            }
            if (mydebug) {
                showcolor();
            }

            if (ray.t_Nearest == ray.t_parameter) {
                color = [total[0], total[1], total[2]]; //Colore figura
            }
        }
    });
    return color;
}


//##########################################################FUNCTIONS#####################################################


//##########################################################DEBUG FUNCTIONS#####################################################


function ShadowCast(castedRay) {
    /**
     * Funzione per la verifica delle intersezioni di shadow ray con le figure
     * INPUT
     * @param {Ray} ray costruito con  L calcolato in setcolor (negato ma non normalizzato), punto di
     * intersezione sulla superficie della figura,
     * OUTPUT
     * @return {boolean} TRUE o FALSE (interseca/non interseca)
     * Funzionamento
     *
     *
     **/

    for (var i = 0; i < surfaces.length; i++) {
        if (surfaces[i].intersection(castedRay)) return true;
    }
    return false;
}

//converts degrees to radians
function rad(degrees) {
    return degrees * Math.PI / 180;
}

function init() {
    canvas = $('#canvas')[0];
    context = canvas.getContext("2d");
    imageBuffer = context.createImageData(canvas.width, canvas.height); //buffer for pixels
    loadSceneFile(file_path);
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
    });

    bounce_depth = scene.bounce_depth;
    shadow_bias = scene.shadow_bias;

    scene.materials.forEach(function (element) {
        materials.push(new Material(element.ka, element.kd, element.ks, element.shininess, element.kr));

    });

    //TODO - set up surfaces
    scene.surfaces.forEach(function (element) {

        let currentObject;

        if (element.shape == "Sphere")
            currentObject= new Sphere(element.center, element.radius, element.material);

        if (element.shape == "Triangle")
           currentObject= new Triangle(element.p1, element.p2, element.p3, element.material);
           
        if (element.transforms != undefined) {
            element.transforms.forEach(function(transformsArrayMember){
                console.log(transformsArrayMember[1]);
                switch(transformsArrayMember[0]) {
                    case "Translate":
                      currentObject.setTranslation(transformsArrayMember[1]);
                      break;
                    case "Rotate":
                    currentObject.setRotation(transformsArrayMember[1]);
                    break;
                    case "Scale":
                    currentObject.setScaling(transformsArrayMember[1]);
                      break;
                  }
            });
            currentObject.invertMatrix();
            currentObject.setTransformationMatrixValue();
        }

        surfaces.push(currentObject);
        currentObject.showTransformationMatrix();
    });
}

function render() {

    let start = Date.now(); //for logging

    if (cropped) {
        mincoloumn = 150;
        maxcoloumn = 200;
        minrow = 230;
        maxrow = 280;
    } else {
        mincoloumn = 0;
        maxcoloumn = 512;
        minrow = 0;
        maxrow = 512;
    }

    //Faccio un doppio for per prendere tutti i pixel del canvas
    for (let coloumn = mincoloumn; coloumn < maxcoloumn; coloumn++) {
        for (let row = minrow; row < maxrow; row++) {
            //TODO - fire a ray though each pixel

            ray = camera.castRay(coloumn, row);

            setPixel(coloumn, row, setColor(ray));

        }
    }


    //render the pixels that have been set
    context.putImageData(imageBuffer, 0, 0);

    let end = Date.now(); //for logging
    $('#log').html("rendered in: " + (end - start) + "ms");
    console.log("rendered in: " + (end - start) + "ms");

}

function setPixel(x, y, color) {
    let i = (y * imageBuffer.width + x) * 4;
    imageBuffer.data[i] = (color[0] * 255) | 0;
    imageBuffer.data[i + 1] = (color[1] * 255) | 0;
    imageBuffer.data[i + 2] = (color[2] * 255) | 0;
    imageBuffer.data[i + 3] = 255; //(color[3]*255) | 0; //switch to include transparency
}

//##########################################################FUNCTIONS#####################################################


//##########################################################DEBUG FUNCTIONS#####################################################

function showcolor() {
    console.log("ambient_component: " + ambient_component);
    console.log("diffuse_component: " + diffuse_component);
    console.log("specular_component " + specular_component);
    console.log("________________________________________________");
}