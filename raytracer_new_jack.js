let canvas;
let context;
let imageBuffer;

let DEBUG = false; //whether to show debug messages
let EPSILON = 0.00001; //error margins
//##################################################################
let file_path = "assets/ShadowTest1.json";
//####################GLOBAL VALUES#################################
let scene;
let camera;
let surfaces = [];
let lights = [];
let materials = [];
let bounce_depth;
let shadow_bias;
let counterflag=0;
//etc...
//####################GLOBAL VALUES#################################


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

            //console.log(isNaN(element.interception_point));
            if (setpixel) {

                //this.hit_point = ray.point_at_parameter(element.interception_point);// tre coordinate punto nello spazio

                //*******************************************letiabili Principali************************************
                let total = glMatrix.vec3.fromValues(0, 0, 0);
                let ambient_component = glMatrix.vec3.create(); //Ka*Ia
                let diffuse_component = glMatrix.vec3.create(); //Kd(Lm*N)*Id
                let specular_component = glMatrix.vec3.create(); //Ks(Rm*V)^alfa*Is
                //*******************************************End letiabili Principali*******************************


                //*******************************************letiabili Di Lavoro************************************

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
                //*******************************************End letiabili Di Lavoro*******************************

                //Calcolo di ambient_component
                Ka = glMatrix.vec3.clone(materials[element.material].ka);
                Ia = glMatrix.vec3.clone(lights[0].color);
                glMatrix.vec3.multiply(ambient_component, Ka, Ia);//Calcolo KaIA e lo sommo al totale
                if (DEBUG)
                    console.log("ambient_component: " + ambient_component);


                for (let i = 1; i < lights.length; i++) { // sommatoria per ogni luce
                    //Calcolo di diffuse_component
                    //Appunto negare r

                    I = glMatrix.vec3.clone(lights[i].color);
                    Kd = glMatrix.vec3.clone(materials[element.material].kd);

                    if (lights[i] instanceof PointLight)
                        glMatrix.vec3.subtract(L, ray.intersection_point, lights[i].position);//L
                    else
                        L = glMatrix.vec3.clone(lights[i].direction);
                    glMatrix.vec3.normalize(L, L);// normalizzo L
                    //console.log("L:" + L);

                    N = glMatrix.vec3.clone(ray.normalpoint);
                    //console.log("N:" + N);

                    glMatrix.vec3.normalize(N, N);// normalizzo N
                    //glMatrix.vec3.negate(L, L); // ??????????????????????
                    let tempL = glMatrix.vec3.create();
                    glMatrix.vec3.negate(tempL, L);


                    maxdot_diffuse = Math.max(0.0, glMatrix.vec3.dot(tempL, N));

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
                    glMatrix.vec3.normalize(R, R);// normalizzo R
                    //glMatrix.vec3.negate(R, R); //??????????????????
                    glMatrix.vec3.subtract(V, ray.intersection_point, camera.eye);//V
                    glMatrix.vec3.normalize(V, V);// normalizzo V

                    maxdot_specular_powered = Math.pow(Math.max(0.0, glMatrix.vec3.dot(R, V)), alpha);
                    glMatrix.vec3.multiply(Ks_MUL_I, Ks, I);
                    glMatrix.vec3.scale(specular_component, Ks_MUL_I, maxdot_specular_powered);


                }

                glMatrix.vec3.add(total, total, ambient_component);
                glMatrix.vec3.add(total, total, diffuse_component);
                glMatrix.vec3.add(total, total, specular_component);
                //console.log("ambient_component: " + ambient_component);
                //console.log("diffuse_component: " + diffuse_component);
                //console.log("specular_component " + specular_component);
                //console.log("________________________________________________");
                //ray.show();

                //console.log("________________________________________________");
                //console.log("diffuse_component: " + diffuse_component);
                if (ray.t_Nearest == ray.t_parameter) {
                // console.log("BOOOOM");
                    color = [total[0], total[1], total[2]];//Colore figura
                }
                //console.log("color: "+color);
        } 



    
        });

    return color;


}


//##########################################################FUNCTIONS#####################################################
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
        }
    );

    bounce_depth = scene.bounce_depth;
    shadow_bias = scene.shadow_bias;

    scene.materials.forEach(function (element) {
        materials.push(new Material(element.ka, element.kd, element.ks, element.shininess, element.kr));

    });

    //TODO - set up surfaces
    scene.surfaces.forEach(function (element) {

            if (element.shape == "Sphere")
                surfaces.push(new Sphere(element.center, element.radius, element.material));

            if (element.shape == "Triangle")
                surfaces.push(new Triangle(element.p1, element.p2, element.p3, element.material));
        }
    );



}

function render() {

    let start = Date.now(); //for logging


    //Faccio un doppio for per prendere tutti i pixel del canvas
    for (let coloumn = 0; coloumn < 512; coloumn++) {
        for (let row = 0; row < 512 ; row++) {
            //TODO - fire a ray though each pixel

            ray = camera.castRay(coloumn, row);

            setPixel(coloumn, row, setColor(ray));

        }
    }
    // console.log("T non nulli:" + counter);

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