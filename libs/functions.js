//converts degrees to radians
function rad(degrees) {
    return degrees * Math.PI / 180;
}

function init() {
    canvas = $('#canvas')[0];
    context = canvas.getContext("2d");
    imageBuffer = context.createImageData(canvas.width, canvas.height); //buffer for pixels
    loadSceneFile("assets/SphereShadingTest1.json");
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

function render() {
    var start = Date.now(); //for logging

    let counter = 0; // TODELETE
    //Faccio un doppio for per prendere tutti i pixel del canvas
    for (let coloumn = 0; coloumn < 512; coloumn++) {
        for (let row = 0; row < 512; row++) {
            //TODO - fire a ray though each pixel
            ray = camera.castRay(coloumn, row);

            setPixel(coloumn, row, setColor(ray));




        }
    }
    // console.log("T non nulli:" + counter);

    //render the pixels that have been set
    context.putImageData(imageBuffer, 0, 0);

    var end = Date.now(); //for logging
    $('#log').html("rendered in: " + (end - start) + "ms");
    console.log("rendered in: " + (end - start) + "ms");

}

function setPixel(x, y, color) {
    var i = (y * imageBuffer.width + x) * 4;
    imageBuffer.data[i] = (color[0] * 255) | 0;
    imageBuffer.data[i + 1] = (color[1] * 255) | 0;
    imageBuffer.data[i + 2] = (color[2] * 255) | 0;
    imageBuffer.data[i + 3] = 255; //(color[3]*255) | 0; //switch to include transparency
}


