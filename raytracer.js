let canvas;
let context;
let imageBuffer;
let DEBUG = false; //whether to show debug messages
let EPSILON = 0.00001; //error margins
let mincoloumn;
let maxcoloumn;
let minrow;
let maxrow;
let cropped = false;
let animate = false;
let AntialiasDepth = 1;
let myanimate=0;
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
    FRAMES = 10;
} else {
    FRAMES = 0;
}
let cycletime = 500 / FRAMES;
let cycle_delay = 3000;
let IMMAGEARRAY = [];


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

//################################################################################################

// let file_path = "assets/TriangleTest.json";
// let file_path = "assets/TriangleShadingTest.json";
let file_path = "assets/TransformationTest.json";
// let file_path = "assets/SphereShadingTest2.json";
// let file_path = "assets/SphereTest.json";
// let file_path = "assets/CornellBox.json";
// let file_path = "assets/RecursiveTest.json";
// let file_path = "assets/ShadowTest1.json";
// let file_path = "assets/ShadowTest2.json";
// let file_path = "assets/SphereShadingTest1.json";
// let file_path = "assets/FullTest.json";

//################################################################################################

/*
    ######## ##     ## ##    ##  ######  ######## ####  #######  ##    ##  ######  
    ##       ##     ## ###   ## ##    ##    ##     ##  ##     ## ###   ## ##    ## 
    ##       ##     ## ####  ## ##          ##     ##  ##     ## ####  ## ##       
    ######   ##     ## ## ## ## ##          ##     ##  ##     ## ## ## ##  ######  
    ##       ##     ## ##  #### ##          ##     ##  ##     ## ##  ####       ## 
    ##       ##     ## ##   ### ##    ##    ##     ##  ##     ## ##   ### ##    ## 
    ##        #######  ##    ##  ######     ##    ####  #######  ##    ##  ###### 
*/

//_______________________________________________________________________________________________________________________

/**
 * Funzione di reset dei campi specificati.
 */
function ClearALL() {
    camera = [];
    scene = [];
    surfaces = [];
    lights = [];
    materials = [];

    bounce_depth = 0;
    shadow_bias = 0;
    counterflag = 0;

}

//_______________________________________________________________________________________________________________________

function renderCycle() {
console.log("RENDERING");



    if (animate) {
        switchAnimation(file_path);
    } else {
        console.log(canvas);
        render();
        ClearALL();
    }

}

/**
 * Funzione di inizializzazione a documento pronto.
 */
$(document).ready(function () {

    let start = Date.now(); //for logging
    init();
    renderCycle();

    //load and render new scene
    $('#load_scene_button').click(function () {
        init();
        ClearALL();
        document.getElementById("Status").innerHTML ="Rendering";

        animate=false;
        AntialiasDepth=1;
        IMMAGEARRAY=[];
        myanimate=0;
        let filepath = 'assets/' + $('#scene_file_input').val() + '.json';
        file_path=filepath;
        IMMAGEARRAY=[];
        loadSceneFile(filepath);
        renderCycle();
        document.getElementById("Status").innerHTML ="Rendered";
    });

    $("input[type='button']").click(function(){
        var radioValue1 = $("input[name='Aliasing']:checked").val();
        var radioValue2 = $("input[name='animate']:checked").val();


        myinit();
        if(radioValue1){
            AntialiasDepth=radioValue1;
        }
        if(radioValue2){
            if(radioValue2=='True')
            {

                animate=true;

            }
            else {

                animate=false;
            }
        }
        if (animate) {
            FRAMES = 10;
        } else {
            FRAMES = 0;
        }
        IMMAGEARRAY=[];
        cycletime = 500 / FRAMES;
        ClearALL();


        let start = Date.now(); //for logging
        document.getElementById("Status").innerHTML ="Rendering";
        loadSceneFile(file_path);
        renderCycle();
        //if (animate)
        let end = Date.now(); //for logging
        $('#log').html("rendered in: " + (end - start) + "ms");
        console.log("rendered in: " + (end - start) + "ms");
        console.log(IMMAGEARRAY.length);
        document.getElementById("Status").innerHTML ="Rendered";
            showImagesLikeVideo(0);

    });
    let end = Date.now(); //for logging
    $('#log').html("rendered in: " + (end - start) + "ms");
    console.log("rendered in: " + (end - start) + "ms");
/*
    if (animate)
        showImagesLikeVideo(0);*/

});

//_______________________________________________________________________________________________________________________

/**
 * Funzione che, partendo da un array di immagini, genera un animazione con tempi determinati.
 * @param {Int} index indice immagine corrente.
 */
function showImagesLikeVideo(index) {
    console.log(cycle_delay);
    if (index < IMMAGEARRAY.length) {
        document.getElementById("AnimatedVideo").src = IMMAGEARRAY[index];
        setTimeout(showImagesLikeVideo.bind(null, index + 1), cycletime);
    } else
        setTimeout(showImagesLikeVideo.bind(null, 0), cycletime + cycle_delay);
}

//_______________________________________________________________________________________________________________________


/**
 * Funzione di calcolo dei valori dello spazio RGB da applicare ai pixel.
 * @param {Ray} ray Raggio che dall'osservatore interseca gli oggetti visibili della scena e che puo' essere riflesso un numero finito di volte
 * @param {Int} current_bounce numero riflessione corrente
 * @returns {Array} color Colore con cui illuminare il pixel
 */
function computePixel(ray, current_bounce) {

    let color = [0, 0, 0];
    let setpixel; // variabile d'appoggio
    let tempRay;
    let Recorded_HIT = false;
    let Recorded_color = [0, 0, 0];

    surfaces.forEach(function (shape) {

        tempRay = transformRay(ray, shape);
        setpixel = shape.intersection(tempRay); //true se il raggio interseca la figura

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

        color = getPixelColor(ray, surfaces[ray.NearestObject]);

        if (current_bounce < bounce_depth) {
            current_bounce++;

            //**************************************************************/
            //Calcolo del Raggio Riflesso
            if (materials[intercepted_shape.material].kr[0] != 0 && materials[intercepted_shape.material].kr[1] != 0 && materials[intercepted_shape.material].kr[2] != 0) {

                let local_normal = glMatrix.vec3.clone(intercepted_shape.normal);
                glMatrix.vec3.normalize(local_normal, local_normal);

                let double_d_MUL_n = 2 * glMatrix.vec3.dot(ray.direction, local_normal);
                let scaled_n = glMatrix.vec3.create();

                if (glMatrix.vec3.dot(ray.direction, intercepted_shape.normal) > rad(90)) //non conosco il verso della normale, quindi lo adatto alla posizione della camera
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
            //**************************************************************/


        }
    }

    return color;
}

//_______________________________________________________________________________________________________________________

/**
 * Funzione di trasformazione di un raggio
 * @param {Ray} ray Raggio a cui applicare la trasformazione
 * @param {Figure} shape figura rispetto alla quale eventualmete si trasforma il raggio
 * @returns {Ray} ray Raggio trasformato (se la figura corrente ha campo "hasTransformationMatrix" true)
 */
function transformRay(ray, shape) {
    if (shape.hasTransformationMatrix) {
        let temporigin;
        let tempdirection;

        temporigin = glMatrix.vec4.fromValues(ray.origin[0], ray.origin[1], ray.origin[2], 1); //l’origine è un punto, il termine omogeneo deve essere 1
        tempdirection = glMatrix.vec4.fromValues(ray.direction[0], ray.direction[1], ray.direction[2], 0); //la direzione e' un vettore, il termine omogeneo deve essere 0

        glMatrix.vec4.transformMat4(tempdirection, tempdirection, shape.inverseTransformationMatrix);
        glMatrix.vec4.transformMat4(temporigin, temporigin, shape.inverseTransformationMatrix);

        return new Ray(tempdirection, temporigin, ray.tMax, ray.tMin);
    } else {
        return ray;
    }

}

//_______________________________________________________________________________________________________________________

/**
 * Funzione di calcolo del colore in base al raggio e figura intersecata.
 * @param {Ray} ray raggio tracciato
 * @param {Figure} element figura intersecata
 * @returns {Vec3} total apporto cromatico
 */
function getPixelColor(ray, element) {

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

        I = glMatrix.vec3.clone(lights[i].color);
        Kd = glMatrix.vec3.clone(materials[element.material].kd);

        if (lights[i] instanceof PointLight) {
            glMatrix.vec3.subtract(L, element.interception_point, lights[i].position); //L
            maxdistance = glMatrix.vec3.distance(element.interception_point, lights[i].position);

        } else {
            L = glMatrix.vec3.clone(lights[i].direction);
            maxdistance = Number.POSITIVE_INFINITY;
        }
        //**************************************************************/
        /// EVENTUALE CASTING OMBRA
        glMatrix.vec3.negate(negativeL, L);
        shadowHit = ShadowCast(new Ray(negativeL, element.interception_point, maxdistance, shadow_bias), element);

        if (!shadowHit) {

            glMatrix.vec3.normalize(L, L); // normalizzo L

            N = glMatrix.vec3.clone(element.normal);

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
        //**************************************************************/
    }

    return total;
}

//_______________________________________________________________________________________________________________________


/**
 * Funzione di valutazione della presenza o assenza del contributo luminoso di una data sorgente luminosa in un dato pixel.
 * @param {Ray} castedRay Raggio con origine sulla superficie con direzione verso la luce (Direzionale o Posizionale)
 * @param {Figure} element figura corrente
 * @returns {Boolean} Hit Ritorna true se il raggio interseca una figura lungo il suo percorso
 */
function ShadowCast(castedRay, element) {

    let tempRay;
    for (var i = 0; i < surfaces.length; i++) {
        if (!element.isTheSame(surfaces[i])) {

            tempRay = transformRay(castedRay, surfaces[i]);

            if (surfaces[i].intersection(tempRay)) {
                return true;
            }
        }
    }
    return false;
}

//_______________________________________________________________________________________________________________________


/**
 * Funzione di conversione in gradi del valore di un angolo espresso in radianti.
 * @param {Float} degrees Valore in gradi dell'angolo da convertire
 */
function rad(degrees) {
    return degrees * Math.PI / 180;
}

//_______________________________________________________________________________________________________________________


/**
 * Funzione di inizializzazione della scena.
 */
function init() {
    canvas=[];
    context=[];
    imageBuffer=[];
    myanimate=0;
    canvas = $('#canvas')[0];
    context = canvas.getContext("2d");
    imageBuffer = context.createImageData(canvas.width, canvas.height); //buffer for pixels
    loadSceneFile(file_path);
}
function myinit() {
    canvas=[];
    context=[];
    imageBuffer=[];
    myanimate=1;
    canvas = $('#canvashidden')[0];
    context = canvas.getContext("2d");
    imageBuffer = context.createImageData(canvas.width, canvas.height); //buffer for pixels
    loadSceneFile(file_path);
}
//_______________________________________________________________________________________________________________________


/**
 * Funzione di caricamento degli elementi di ogni asset.
 * @param {String} filepath Path assoluto o relativo dell'asset da caricare
 */
function loadSceneFile(filepath) {

    scene = Utils.loadJSON(filepath);


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
        let kr = element.kr;
        if (kr == undefined)
            kr = [0, 0, 0];
        materials.push(new Material(element.ka, element.kd, element.ks, element.shininess, kr));

    });
    let counter = 0;
    scene.surfaces.forEach(function (element) {

        let currentObject;


        if (element.shape == "Sphere")
            currentObject = new Sphere(element.center, element.radius, element.material, counter);

        if (element.shape == "Triangle")
            currentObject = new Triangle(element.p1, element.p2, element.p3, element.material, counter);

        counter++;
        if (element.transforms != undefined) {
            element.transforms.forEach(function (transformsArrayMember) {

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

    });

}

//_______________________________________________________________________________________________________________________


/**
 * Funzione di rendering del canvas.
 */
function render() {
    let current_bounce;
    let colormean = [0, 0, 0];
    let tempcolor = colormean;


    // doppio FOR che include tutti i pixel del canvas
    for (let coloumn = mincoloumn; coloumn < maxcoloumn; coloumn++) {
        for (let row = minrow; row < maxrow; row++) {

            current_bounce = 0;

            let xOffset, yOffset;

            //**************************************************************/
            /// ANTIALIASING
            for (let xDepth = 0; xDepth < AntialiasDepth; xDepth++)
                for (let yDepth = 0; yDepth < AntialiasDepth; yDepth++) {


                    xOffset = (xDepth / AntialiasDepth) - (1 / (2 * AntialiasDepth));
                    yOffset = (yDepth / AntialiasDepth) - (1 / (2 * AntialiasDepth));

                    if (AntialiasDepth > 1) {
                        xOffset += Math.random() * (1 / AntialiasDepth); // generazione componente randomica (jitter)
                        yOffset += Math.random() * (1 / AntialiasDepth); // generazione componente randomica (jitter)
                    }

                    ray = camera.castRay(coloumn + xOffset, row + yOffset);
                    tempcolor = computePixel(ray, current_bounce);

                    colormean[0] += tempcolor[0];
                    colormean[1] += tempcolor[1];
                    colormean[2] += tempcolor[2];

                    surfaces.forEach(function (element) {
                            element.initInterception();// azzera i campi
                        }
                    );
                }


            colormean[0] = colormean[0] / (AntialiasDepth * AntialiasDepth);
            colormean[1] = colormean[1] / (AntialiasDepth * AntialiasDepth);
            colormean[2] = colormean[2] / (AntialiasDepth * AntialiasDepth);

            setPixel(coloumn, row, colormean);
            colormean[0] = 0;
            colormean[1] = 0;
            colormean[2] = 0;
            //**************************************************************/

        }
    }

    //render the pixels that have been set
    context.putImageData(imageBuffer, 0, 0);
if(myanimate==1) {
    var canvas = document.getElementById('canvashidden');
    var fullQuality = canvas.toDataURL('image/jpeg', 1.0);

    IMMAGEARRAY.push(fullQuality);
}

}

//_______________________________________________________________________________________________________________________


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

//_______________________________________________________________________________________________________________________


