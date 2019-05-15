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
let animate = false;
let AntialiasDepth = 5;
//##################################################################

// let file_path = "assets/TriangleTest.json";
// let file_path = "assets/TriangleShadingTest.json";
// let file_path = "assets/TransformationTest.json";
// let file_path = "assets/SphereShadingTest2.json";
let file_path = "assets/SphereTest.json";
// let file_path = "assets/CornellBox.json";
// let file_path = "assets/RecursiveTest.json";
// let file_path = "assets/ShadowTest1.json";
// let file_path = "assets/ShadowTest2.json";
// let file_path = "assets/SphereShadingTest1.json";
// let file_path = "assets/FullTest.json";

//####################GLOBAL VALUES#################################
let scene;
let camera;
let surfaces = [];
let lights = [];
let materials = [];
let bounce_depth;
let shadow_bias;
let counterflag = 0;
let countRepetitionsGif;
let FRAMES;


if (animate) {
    FRAMES = 8;
} else {
    FRAMES = 0;
}

if (cropped) {
    mincoloumn = 164;
    maxcoloumn = 165;
    minrow = 430;
    maxrow = 431;
} else {
    mincoloumn = 0;
    maxcoloumn = 512;
    minrow = 0;
    maxrow = 512;
}

let cycletime = 500 / FRAMES;
let cycle_delay = 5000;
const gpu = new GPU();


let IMMAGEARRAY = [];
//_:::::::::::::::::::::::::::::::::::::::::::::::

//etc...
//####################GLOBAL VALUES#################################
//ProvaBranch
function ClearALL() {
    let camera;
    surfaces = [];
    lights = [];
    materials = [];
    bounce_depth = 0;
    shadow_bias = 0;
    counterflag = 0;
}

/**
 * Funzione di inizializzazione a documento pronto.
 */
$(document).ready(function () {

    let start = Date.now(); //for logging
    for (countRepetitionsGif = 0; countRepetitionsGif < FRAMES + 1; countRepetitionsGif++) {

        init();
        if (animate) {
            if (countRepetitionsGif < 5)
                surfaces[0].setcenter([1, 1.5 * Math.sin(countRepetitionsGif * Math.PI / (FRAMES - 3)), -1]);
            if (countRepetitionsGif > 3)
                surfaces[1].setcenter([-1, 1.5 * Math.sin((countRepetitionsGif - 3) * Math.PI / (FRAMES - 3)), 0]);
        }

        render();
        ClearALL();
    }
    //load and render new scene
    $('#load_scene_button').click(function () {
        let filepath = 'assets/' + $('#scene_file_input').val() + '.json';
        loadSceneFile(filepath);
    });
    let end = Date.now(); //for logging
    $('#log').html("rendered in: " + (end - start) + "ms");
    console.log("rendered in: " + (end - start) + "ms");
    if (animate)
        showImagesLikeVideo(0);

});


function showImagesLikeVideo(index) {
    if (index < IMMAGEARRAY.length) {
        document.getElementById("AnimatedVideo").src = IMMAGEARRAY[index];
        setTimeout(showImagesLikeVideo.bind(null, index + 1), cycletime);
    } else
        setTimeout(showImagesLikeVideo.bind(null, 0), cycletime + cycle_delay);
}
//____________________________________________________________________________________________________|

/**
 * Funzione di calcolo dei valori dello spazio RGB da applicare ai pixel.
 * @param {Ray} ray Raggio che dall'osservatore interseca gli oggetti visibili della scena e che puo' essere riflesso un numero finito di volte
 * @returns {Array} color Colore con cui illluminare il piexl
 */
function computePixel(ray, current_bounce) {

    let color = [0, 0, 0];
    let setpixel; // variabile d'appoggio
    let tempRay;
    let Recorded_HIT = false;
    let Recorded_color = [0, 0, 0];

    surfaces.forEach(function (shape) {

        //TODO - calculate the intersection of that ray with the scene

        tempRay = transformRay(ray, shape);
        setpixel = shape.intersection(tempRay); //setpixel mi dice se il raggio interseca la figura



        if (setpixel) {
            Recorded_HIT = true;
            if (shape.t < ray.t_Nearest) {
                ray.NearestObject = shape.index;
                ray.t_Nearest = shape.t;
            }
        }
    });

    if (Recorded_HIT) {

        let intercepted_shape = surfaces[ray.NearestObject];
        if (intercepted_shape.hasTransformationMatrix)
            intercepted_shape.RestoreSDR();
        //  console.log("Nearest Object: "+intercepted_shape.name);
        // console.log("HITTED POINT:");
        //console.log(intercepted_shape.interception_point);

        //console.log("HIT");
        color = getPixelColor(ray, surfaces[ray.NearestObject]);

        bounce_depth = -1; //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //console.log(color);
        if (current_bounce < bounce_depth) {
            //    console.log("ENTRO");
            current_bounce++;

            //************************************************/
            //Reflect Ray
            if (materials[intercepted_shape.material].kr[0] != 0 && materials[intercepted_shape.material].kr[1] != 0 && materials[intercepted_shape.material].kr[2] != 0) {

                let local_normal = glMatrix.vec3.clone(intercepted_shape.normal);
                glMatrix.vec3.normalize(local_normal, local_normal);

                let double_d_MUL_n = 2 * glMatrix.vec3.dot(ray.direction, local_normal);
                let scaled_n = glMatrix.vec3.create();

                if (glMatrix.vec3.dot(ray.direction, intercepted_shape.normal) > rad(90)) //NON SO IL VERSO DELLA NORMALE QUINDI LO ADATTO ALLA POS DELLA CAMERA
                    glMatrix.vec3.negate(local_normal, local_normal);

                glMatrix.vec3.scale(scaled_n, local_normal, double_d_MUL_n);
                let bounced_ray_direction = glMatrix.vec3.create();
                glMatrix.vec3.subtract(bounced_ray_direction, ray.direction, scaled_n);

                let newBouncedRay = new Ray(bounced_ray_direction, intercepted_shape.interception_point, Number.POSITIVE_INFINITY, shadow_bias);
                newBouncedRay.isBounced = true;
                Recorded_color = computePixel(newBouncedRay, current_bounce);


                color[0] = color[0] + materials[intercepted_shape.material].kr[0] * Recorded_color[0];
                color[1] = color[1] + materials[intercepted_shape.material].kr[1] * Recorded_color[1];
                color[2] = color[2] + materials[intercepted_shape.material].kr[2] * Recorded_color[2];

            }


            //************************************************/


        }
    }


    return color;
}





function transformRay(ray, shape) {
    if (shape.hasTransformationMatrix) {
        let temporigin;
        let tempdirection;

        temporigin = glMatrix.vec4.fromValues(ray.origin[0], ray.origin[1], ray.origin[2], 1); //l’origine è un punto quindi il termine omogeneo deve essere 1
        tempdirection = glMatrix.vec4.fromValues(ray.direction[0], ray.direction[1], ray.direction[2], 0); //il vettore direzione il termine omogeneo deve essere 0

        glMatrix.vec4.transformMat4(tempdirection, tempdirection, shape.inverseTransformationMatrix);
        glMatrix.vec4.transformMat4(temporigin, temporigin, shape.inverseTransformationMatrix);

        return new Ray(tempdirection, temporigin, ray.tMax, ray.tMin);
    } else {
        return ray;
    }

}

//##########################################################FUNCTIONS#####################################################


//##########################################################DEBUG FUNCTIONS#####################################################


function getPixelColor(ray, element) {

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
            glMatrix.vec3.subtract(L, element.interception_point, lights[i].position); //L
            maxdistance = glMatrix.vec3.distance(element.interception_point, lights[i].position);
            /*
             * p(t)=lights[i].position
             * e=element.interception_point
             * d=negativeL
             * p(t)=e+td
             *
             * t=(p(t)-e)/d
             *
             *
             *
             * */
        } else {
            L = glMatrix.vec3.clone(lights[i].direction);
            maxdistance = Number.POSITIVE_INFINITY;
        }
        ///FUNZIONE CASTING OMBRA
        glMatrix.vec3.negate(negativeL, L);

        //console.log("SHADOW CASTER: "+element.name);


        // console.log("NEGATIVE L :"+ negativeL);
        // console.log(maxdistance);

        shadowHit = false;
        // shadowHit = ShadowCast(new Ray(negativeL, element.interception_point, maxdistance, shadow_bias), element);
        //console.log(shadowHit);
        if (!shadowHit) {
            ///FINE FUNZIONE CASTING OMBRA
            glMatrix.vec3.normalize(L, L); // normalizzo L

            N = glMatrix.vec3.clone(element.normal);

            // console.log("N:" + N);
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

            if (ray.isBounced) { // se il raggio e' un raggio di riflessione, calcolo V dalla sua origine (ovvero dalla superficie riflettente) anziche' dalla camera
                glMatrix.vec3.subtract(V, element.interception_point, ray.origin); //V
                glMatrix.vec3.normalize(V, V); // normalizzo V
            } else {
                glMatrix.vec3.subtract(V, element.interception_point, camera.eye); //V
                glMatrix.vec3.normalize(V, V); // normalizzo V
            }

            maxdot_specular_powered = Math.pow(Math.max(0.0, glMatrix.vec3.dot(R, V)), alpha);
            glMatrix.vec3.multiply(Ks_MUL_I, Ks, I);
            glMatrix.vec3.scale(specular_component, Ks_MUL_I, maxdot_specular_powered);


            glMatrix.vec3.add(total, total, diffuse_component);
            glMatrix.vec3.add(total, total, specular_component);


        }
    }
    if (mydebug) {
        showcolor(ambient_component, diffuse_component, specular_component);
    }

    return total;


}


/**
 * Funzione di valutazione della presenza o assenza del contributo luminoso di una data sorgente luminosa in un dato pixel.
 * @param {Ray} castedRay Raggio con origine sulla superficie con direzione verso la luce (Direzionale o Posizionale)
 * @returns {Boolean} Hit Ritorna true se il raggio interseca una figura lungo il suo percorso
 */
function ShadowCast(castedRay, element) {

    //console.log("SHADOWFUNCTION");
    let tempRay;
    for (var i = 0; i < surfaces.length; i++) {
        if (!element.isTheSame(surfaces[i])) {
            //
            //
            //console.log(surfaces[i].name);
            tempRay = transformRay(castedRay, surfaces[i]);
            //console.log("RAYMAX: "+castedRay.tMax);
            if (surfaces[i].intersection(tempRay)) {
                //console.log("END SHADOWFUNCTION");
                return true;
            }
        }
    }
    //console.log("END SHADOWFUNCTION");
    return false;
}

/**
 * Funzione di conversione in gradi del valore di un angolo espresso in radianti.
 * @param {Float} degrees Valore in gradi dell'angolo da convertire
 */
function rad(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Funzione di inizializzazione della scena.
 */
function init() {
    canvas = $('#canvas')[0];
    context = canvas.getContext("2d");
    imageBuffer = context.createImageData(canvas.width, canvas.height); //buffer for pixels
    loadSceneFile(file_path);
}

/**
 * Funzione di caricamento degli elementi di ogni asset.
 * @param {String} filepath Path assoluto o relativo dell'asset da caricare
 */
function loadSceneFile(filepath) {
    scene = Utils.loadJSON(filepath); //load the scene


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
    let counter = 0;
    scene.surfaces.forEach(function (element) {

        let currentObject;


        if (element.shape == "Sphere")
            currentObject = new Sphere(element.center, element.radius, element.material, counter, element.name);

        if (element.shape == "Triangle")
            currentObject = new Triangle(element.p1, element.p2, element.p3, element.material, counter, element.name);

        counter++;
        if (element.transforms != undefined) {
            element.transforms.forEach(function (transformsArrayMember) {
                //  console.log(transformsArrayMember[1]);
                switch (transformsArrayMember[0]) {
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
            currentObject.transposeInvertedMatrix();
            currentObject.setTransformationMatrixValue();
        }

        surfaces.push(currentObject);
        //currentObject.showTransformationMatrix();

    });
    console.log("Computing Image Number: " + countRepetitionsGif);
}

/**
 * Funzione di rendering del canvas.
 */



function render() {
    let current_bounce;
    let colormean = [0, 0, 0];
    let tempcolor = colormean;

    //#############################################
    //SENZA ANTIALIASING

    const multiplyMatrix = gpu.createKernel(function (coloumn, row) {

        let colorgpu = [0, 0, 0];
        current_bounce = 0;

        ray = camera.castRay(coloumn, row);

        colorgpu = computePixel(ray, current_bounce);


        return colorgpu;
    }).setOutput([1]);

    
    let megamatrix = [];
    // //Faccio un doppio for per prendere tutti i pixel del canvas
    for (let coloumn = mincoloumn; coloumn < maxcoloumn; coloumn++) {
        for (let row = minrow; row < maxrow; row++) {
            //TODO - fire a ray though each pixel


            megamatrix.push(multiplyMatrix(coloumn, row));

        }
    }



    for (let coloumn = mincoloumn; coloumn < maxcoloumn; coloumn++) {
        for (let row = minrow; row < maxrow; row++) {
            setPixel(x, y, megamatrix.pop());
        }
    }
    //#############################################

    //#############################################
    //CON ANTIALIASING
    //Faccio un doppio for per prendere tutti i pixel del canvas
    // for (let coloumn = mincoloumn; coloumn < maxcoloumn; coloumn++) {
    //     for (let row = minrow; row < maxrow; row++) {

    //         current_bounce = 0;

    //         let xOffset, yOffset;

    //         for (let xDepth = 0; xDepth < AntialiasDepth; xDepth++)
    //             for (let yDepth = 0; yDepth < AntialiasDepth; yDepth++) {

    //                 xOffset = (xDepth / AntialiasDepth) - (1 / (2 * AntialiasDepth));
    //                 yOffset = (yDepth / AntialiasDepth) - (1 / (2 * AntialiasDepth));

    //                 xOffset += Math.random() * (1 / AntialiasDepth);
    //                 yOffset += Math.random() * (1 / AntialiasDepth);


    //                 ray = camera.castRay(coloumn + xOffset, row + yOffset);
    //                 tempcolor = computePixel(ray, current_bounce);

    //                 colormean[0] += tempcolor[0];
    //                 colormean[1] += tempcolor[1];
    //                 colormean[2] += tempcolor[2];

    //                 surfaces.forEach(function (element) {
    //                         element.initInterception();
    //                     } // azzera i campi
    //                 );
    //             }




    //         colormean[0] = colormean[0] / (AntialiasDepth * AntialiasDepth);
    //         colormean[1] = colormean[1] / (AntialiasDepth * AntialiasDepth);
    //         colormean[2] = colormean[2] / (AntialiasDepth * AntialiasDepth);
    //         // }
    //         setPixel(coloumn, row, colormean);
    //         colormean[0] = 0;
    //         colormean[1] = 0;
    //         colormean[2] = 0;
    //     }
    // }
    //#############################################


    //render the pixels that have been set
    context.putImageData(imageBuffer, 0, 0);


    //var canvas = document.getElementById('canvas');
    //var fullQuality = canvas.toDataURL('image/jpeg', 1.0);
    //IMMAGEARRAY.push(fullQuality);



}



/**
 * Funzione di assegnazione del colore ad ogni singolo elemento del canvas.
 * @param {Integer} x Riga del canvas
 * @param {Integer} y Colonna del canvas
 * @param {Array} color Array di tre elementi nella quale ciascuno rappresenta una delle componenti RGB. I valori appartengono all'intervallo [0,1]
 */
function setPixel(x, y, color) {
    let i = (y * imageBuffer.width + x) * 4;
    imageBuffer.data[i] = (color[0] * 255) | 0;
    imageBuffer.data[i + 1] = (color[1] * 255) | 0;
    imageBuffer.data[i + 2] = (color[2] * 255) | 0;
    imageBuffer.data[i + 3] = 255; //(color[3]*255) | 0; //switch to include transparency
}

//##########################################################FUNCTIONS#####################################################


//##########################################################DEBUG FUNCTIONS#####################################################
/**
 * Funzione di Debug. Mostra le varie compontenti luminose.
 */
function showcolor(ambient_component, diffuse_component, specular_component) {
    /*    console.log("ambient_component: " + ambient_component);
        console.log("diffuse_component: " + diffuse_component);
        console.log("specular_component " + specular_component);
        console.log("________________________________________________");*/
}