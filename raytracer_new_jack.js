
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

//CLASSI



//????????????????????????????????????????????????????????????????????????????????????????????????????|

//sets the pixel at the given x,y to the given color
/**
 * Sets the pixel at the given screen coordinates to the given color
 * @param {int} x     The x-coordinate of the pixel
 * @param {int} y     The y-coordinate of the pixel
 * @param {float[3]} color A length-3 array (or a vec3) representing the color. Color values should floating point values between 0 and 1
 */



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
                let total = glMatrix.vec3.fromValues(0, 0, 0);
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
                glMatrix.vec3.multiply(ambient_component, Ka, Ia);//Calcolo KaIA e lo sommo al totale
                if (DEBUG)
                    console.log("ambient_component: " + ambient_component);


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
                    glMatrix.vec3.normalize(R, R);// normalizzo R
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


