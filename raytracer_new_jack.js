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
let file_path = "assets/FullTest.json";
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

/**
 * Funzione di inizializzazione a documento pronto.
 */
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

/**
 * Funzione di calcolo dei valori dello spazio RGB da applicare ai pixel.
 * @param {Ray} ray Raggio che dall'osservatore interseca gli oggetti visibili della scena e che puo' essere riflesso un numero finito di volte
 * @returns {Array} color Colore con cui illluminare il piexl
 */
function setPixelColor(ray) {

    let color = [0, 0, 0];
    let isNearest; // variabile d'appoggio
    let temporigin = glMatrix.vec4.create();
    let tempdirection = glMatrix.vec4.create();
    let tempRay;
    let NearestObject;
    let hitDetected = false;

    tempRay = new Ray([0, 0, 0], [0, 0, 0], Number.POSITIVE_INFINITY, shadow_bias);
    surfaces.forEach(function (element) {
        //  element.me();
        //#####################################################################################################################################à
        if (element.hasTransformationMatrix) {

            temporigin = glMatrix.vec4.fromValues(ray.origin[0], ray.origin[1], ray.origin[2], 1); //l’origine è un punto quindi il termine omogeneo deve essere 1
            tempdirection = glMatrix.vec4.fromValues(ray.direction[0], ray.direction[1], ray.direction[2], 0); //il vettore direzione il termine omogeneo deve essere 0

            glMatrix.vec4.transformMat4(tempdirection, tempdirection, element.inverseTransformationMatrix);
            glMatrix.vec4.transformMat4(temporigin, temporigin, element.inverseTransformationMatrix);



            tempRay.setValues(tempdirection, temporigin);

            isNearest = element.intersection(tempRay); //setpixel mi dice se il raggio interseca la figura

        } else {
            isNearest = element.intersection(ray); //setpixel mi dice se il raggio interseca la figura
            // console.log("NO TRANS: " + isNearest);

        }


        //#####################################################################################################################################
        //isNearest = element.intersection(ray);
        if (isNearest) {
            NearestObject = element;
            hitDetected = true;
        }


        //console.log(tempRay);

    });

    // console.log("FIRSTRAY: " + ray.direction + " | " + ray.origin);
    // console.log("TEMPRAY: " + tempRay.direction + " | " + tempRay.origin);

    // console.log(tempRay);
    if (hitDetected) {
        //  console.log(tempRay);
        if (NearestObject.hasTransformationMatrix) {
            if (tempRay.t_Nearest < ray.t_Nearest) { // se la figura piu' vicina e' una trasformata, aggiorno ray con i valori di tempRay
                ray.setNearestValue(tempRay);
                let reypoint = glMatrix.vec3.create();
                let reynormt = glMatrix.vec3.create();


                //   console.log("FIRSTRAY: " + ray.direction + " | " + ray.origin + " | " + ray.intersection_point + " | " + ray.normalpoint);



                // console.log("TRANSFORMING.....");
                ray.intersection_point = glMatrix.vec4.fromValues(ray.intersection_point[0], ray.intersection_point[1], ray.intersection_point[2], 1);
                //       glMatrix.mat4.multiply(reypoint, NearestObject.TransformationMatrix, [NearestObject.p1[0], NearestObject.p1[1], NearestObject.p1[2], 1]);
                //     console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n@@@@@@@@@@@@@@@@@@@@@@@\n RESULT: " + reypoint);
                glMatrix.vec4.transformMat4(reypoint, ray.intersection_point, NearestObject.TransformationMatrix);



                ray.normalpoint = glMatrix.vec4.fromValues(ray.normalpoint[0], ray.normalpoint[1], ray.normalpoint[2], 0);
                glMatrix.vec4.transformMat4(reynormt, ray.normalpoint, NearestObject.transposedInverseTransformationMatrix);
                //glMatrix.mat4.multiply(reynormt, NearestObject.transposedInverseTransformationMatrix, ray.normalpoint );

                //  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n@@@@@@@@@@@@@@@@@@@@@@@\n RESULT: " + reynormt);

                ray.intersection_point = glMatrix.vec3.clone(reypoint);
                ray.normalpoint = glMatrix.vec3.clone(reynormt);

                //  console.log("FIRSTRAY: " + ray.direction + " | " + ray.origin + " | " + ray.intersection_point + " | " + ray.normalpoint);

                //
                // console.log("Points post:");
                // console.log("Point " + ray.intersection_point);
                // console.log(" Normal "+ray.normalpoint)
                // console.log("°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°");


            }

        }


        color = setColor(ray, NearestObject);
    }
    return color;
}

function setColor(ray, element) {

    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

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

    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

    //Calcolo di ambient_component
    Ka = glMatrix.vec3.clone(materials[element.material].ka);
    Ia = glMatrix.vec3.clone(lights[0].color);
    glMatrix.vec3.multiply(ambient_component, Ka, Ia); //Calcolo KaIA e lo sommo al totale

    glMatrix.vec3.add(total, total, ambient_component);

    if (element.hasTransformationMatrix) {
        //   console.log("YES");
        // ray.restoreSDRPoints(element);
    }



    for (let i = 1; i < lights.length; i++) { // sommatoria per ogni luce
        //Calcolo di diffuse_component
        //Appunto negare r

        I = glMatrix.vec3.clone(lights[i].color);
        Kd = glMatrix.vec3.clone(materials[element.material].kd);


        if (lights[i] instanceof PointLight) {



            glMatrix.vec3.subtract(L, ray.intersection_point, lights[i].position); //L

            //  console.log("RAY: " + ray.intersection_point);
            //   console.log("LIGHT: " + lights[i].position);

            maxdistance = glMatrix.vec3.distance(ray.intersection_point, lights[i].position);
        } else {
            L = glMatrix.vec3.clone(lights[i].direction);
            maxdistance = Number.POSITIVE_INFINITY;
        }
        ///FUNZIONE CASTING OMBRA


        glMatrix.vec3.negate(negativeL, L);

        //element.me();
        // console.log("°°°°°°°°°°°°°°");
        shadowHit = ShadowCast(new Ray(negativeL, ray.intersection_point, maxdistance, shadow_bias), element);

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
        } else {
            //    console.log("Sono in ombra claudio gay");
        }
    }
    if (mydebug) {
        showcolor();
    }

    // if (ray.t_Nearest == ray.t_parameter) {
    //     color = [total[0], total[1], total[2]]; //Colore figura
    // }
    return total;
}


//##########################################################FUNCTIONS#####################################################


//##########################################################DEBUG FUNCTIONS#####################################################

/**
 * Funzione di valutazione della presenza o assenza del contributo luminoso di una data sorgente luminosa in un dato pixel. 
 * @param {Ray} castedRay Raggio con origine sulla superficie con direzione verso la luce (Direzionale o Posizionale) 
 * @returns {Boolean} Hit Ritorna true se il raggio interseca una figura lungo il suo percorso
 */
function ShadowCast(castedRay, castingObject) {
    let hit = false;
    let transformedcastedRay = castedRay;

    let temporigin;
    let tempdirection;


    //*******************************************************************************/
    for (var i = 0; i < surfaces.length; i++) {
        console.log("#######################################");
        console.log("Confronto la figura "+ castingObject.name);
        if (surfaces[i].constructor.name == castingObject.constructor.name) {
            if (!castingObject.isTheSame(surfaces[i])) {

                console.log(" con " + surfaces[i].name);
                console.log("#######################################");
                if (surfaces[i].hasTransformationMatrix) {

                    temporigin = glMatrix.vec4.fromValues(castedRay.origin[0], castedRay.origin[1], castedRay.origin[2], 1); //l’origine è un punto quindi il termine omogeneo deve essere 1
                    tempdirection = glMatrix.vec4.fromValues(castedRay.direction[0], castedRay.direction[1], castedRay.direction[2], 0); //il vettore direzione il termine omogeneo deve essere 0

                    glMatrix.vec4.transformMat4(tempdirection, tempdirection, surfaces[i].inverseTransformationMatrix);
                    glMatrix.vec4.transformMat4(temporigin, temporigin, surfaces[i].inverseTransformationMatrix);



                    transformedcastedRay.setValues(tempdirection, temporigin);
                    hit = surfaces[i].intersection(transformedcastedRay);
                } else
                    hit = surfaces[i].intersection(castedRay);

                if (hit) return true;
            }
        } else {

            
            console.log(" con " + surfaces[i].name);
            console.log("#######################################");

            if (surfaces[i].hasTransformationMatrix) {

                temporigin = glMatrix.vec4.fromValues(castedRay.origin[0], castedRay.origin[1], castedRay.origin[2], 1); //l’origine è un punto quindi il termine omogeneo deve essere 1
                tempdirection = glMatrix.vec4.fromValues(castedRay.direction[0], castedRay.direction[1], castedRay.direction[2], 0); //il vettore direzione il termine omogeneo deve essere 0

                glMatrix.vec4.transformMat4(tempdirection, tempdirection, surfaces[i].inverseTransformationMatrix);
                glMatrix.vec4.transformMat4(temporigin, temporigin, surfaces[i].inverseTransformationMatrix);



                transformedcastedRay.setValues(tempdirection, temporigin);
                hit = surfaces[i].intersection(transformedcastedRay);

            } else
                hit = surfaces[i].intersection(castedRay);

            if (hit) return true;
        }



    }

    console.log(" NO HIT ");
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
    //shadow_bias=0.11111111111111111112;
    scene.materials.forEach(function (element) {
        materials.push(new Material(element.ka, element.kd, element.ks, element.shininess, element.kr));

    });

    let counter = 0;

    scene.surfaces.forEach(function (element) {

        let currentObject;

        if (element.shape == "Sphere")
            currentObject = new Sphere(element.center, element.radius, element.material, counter);

        if (element.shape == "Triangle") {
            currentObject = new Triangle(element.p1, element.p2, element.p3, element.material, counter);
            currentObject.setname(element.name);
        }
        counter++;
        if (element.transforms != undefined) {
            element.transforms.forEach(function (transformsArrayMember) {
                // console.log(transformsArrayMember[1]);
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
            currentObject.transposeMatrix();
            currentObject.setTransformationMatrixValue();


        }

        surfaces.push(currentObject);
      //  currentObject.showTransformationMatrix();
    });
}
/**
 * Funzione di rendering del canvas.
 */
function render() {

    let start = Date.now(); //for logging

    if (cropped) {
        mincoloumn = 251;
        maxcoloumn = 252;
        minrow = 178;
        maxrow = 179;
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
            // console.log("x: " + coloumn + " y: " + row);
            ray = camera.castRay(coloumn, row);

            setPixel(coloumn, row, setPixelColor(ray));

        }
    }


    //render the pixels that have been set
    context.putImageData(imageBuffer, 0, 0);

    let end = Date.now(); //for logging
    $('#log').html("rendered in: " + (end - start) + "ms");
    console.log("rendered in: " + (end - start) + "ms");

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
function showcolor() {
    console.log("ambient_component: " + ambient_component);
    console.log("diffuse_component: " + diffuse_component);
    console.log("specular_component " + specular_component);
    console.log("________________________________________________");
}