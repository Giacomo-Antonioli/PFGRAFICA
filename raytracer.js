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
var surfaces;
//etc...


//initializes the canvas and drawing buffers
function init() {
  canvas = $('#canvas')[0];
  context = canvas.getContext("2d");
  imageBuffer = context.createImageData(canvas.width, canvas.height); //buffer for pixels
  loadSceneFile("assets/SphereTest.json");
}
//____________________________________________________________________________________________________|

var Material = function(ka, kd, ks, shininess, kr){
  this.ka = ka;
  this.kd = kd;
  this.ks = ks;
  this.shininess = shininess;
  this.kr = kr;
};
//ambient light only has color (???)
var AmbientLight = function(color){
  this.color = color;
};
var PointLight = function(position, color){
  this.position = position;
  this.color = color;
};
var DirectionalLight = function(direction, color){
  this.direction = direction;
  this.color = color;
};
var Ray = function(direction, origin, tMax, tMin){
  this.direction = direction;
  this.origin = origin;
  this.tMax = tMax;
  this.tMin = tMin;
};//might not need
var Intersection = function(t, intersectionPoint, normal){
  this.t = t;
  this.intersectionPoint = vec3.clone(intersectionPoint);
  this.normal = vec3.clone(normal);
};//might not need

//CLASSI

var Camera = function (eye, at, up, fovy, aspect) { //definisco la classe Camera _______ INCOMPLETO!!!
    var h, w, u, v;

    this.eye = eye;
    this.at = at;
    this.fovy = fovy;
    this.up = up;
    this.aspect = aspect;


    h = 2 * Math.tan(rad(fovy / 2.0));
    w = h * aspect;

}

Camera.prototype.castRay = function(x, y){ //aggiungo alla classe Camera la funzione castRay_______ INCOMPLETO!!!
  var u = (this.w * x/(canvas.width - 1)) - (this.w/2.0);
  var v = (-this.h * y/(canvas.height - 1)) + (this.h/2.0);


  //where is eye used??
  var direction = vec3.fromValues(u, v, -1);
  var origin = vec3.clone(this.eye);//vec3.clone(this.at);// vec3.fromValues(0, 0, 0);
  return new Ray(direction, origin, undefined, shadowBias);
  //return new ray with origin at (0,0,0) and direction
};



//loads and "parses" the scene file at the given path
function loadSceneFile(filepath) {
  scene = Utils.loadJSON(filepath); //load the scene


    //TODO - set up camera

    camera = new Camera(scene.camera.eye, scene.camera.at, scene.camera.up, scene.camera.fovy, scene.camera.aspect);


    //TODO - set up surfaces



  render(); //render the scene

}


//renders the scene
function render() {
  var start = Date.now(); //for logging

   //TODO - fire a ray though each pixel

  //TODO - calculate the intersection of that ray with the scene

  //TODO - set the pixel to be the color of that intersection (using setPixel() method)


  //render the pixels that have been set
  context.putImageData(imageBuffer,0,0);

  var end = Date.now(); //for logging
  $('#log').html("rendered in: "+(end-start)+"ms");
  console.log("rendered in: "+(end-start)+"ms");

}

//????????????????????????????????????????????????????????????????????????????????????????????????????|

//sets the pixel at the given x,y to the given color
/**
 * Sets the pixel at the given screen coordinates to the given color
 * @param {int} x     The x-coordinate of the pixel
 * @param {int} y     The y-coordinate of the pixel
 * @param {float[3]} color A length-3 array (or a vec3) representing the color. Color values should floating point values between 0 and 1
 */
function setPixel(x, y, color){
  var i = (y*imageBuffer.width + x)*4;
  imageBuffer.data[i] = (color[0]*255) | 0;
  imageBuffer.data[i+1] = (color[1]*255) | 0;
  imageBuffer.data[i+2] = (color[2]*255) | 0;
  imageBuffer.data[i+3] = 255; //(color[3]*255) | 0; //switch to include transparency
}

//converts degrees to radians
function rad(degrees){
  return degrees*Math.PI/180;
}

//on load, run the application
$(document).ready(function(){
  init();
  render();

  //load and render new scene
  $('#load_scene_button').click(function(){
    var filepath = 'assets/'+$('#scene_file_input').val()+'.json';
    loadSceneFile(filepath);
  });

  //debugging - cast a ray through the clicked pixel with DEBUG messaging on
  $('#canvas').click(function(e){
    var x = e.pageX - $('#canvas').offset().left;
    var y = e.pageY - $('#canvas').offset().top;
    DEBUG = true;
    camera.castRay(x,y); //cast a ray through the point
    DEBUG = false;
  });

});
//____________________________________________________________________________________________________|