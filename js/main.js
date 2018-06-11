// standard global variables
var container, scene, camera, renderer;

// SCENE
scene = new THREE.Scene();

// CAMERA
camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
scene.add( camera );
camera.position.set(300,300,-300);
camera.lookAt( scene.position );

// RENDERER
renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
renderer.setClearColor( 0xffffff, 0 );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

container = document.body;


scene.background = new THREE.Color(0x000000);
var light = new THREE.PointLight( 0xff2200 );
light.position.set( 100, 100, 100 );
scene.add( light );
var light = new THREE.AmbientLight( 0x666666);
scene.add( light );
var geometry = new THREE.BoxGeometry( 100, 100, 100 );
var material = new THREE.MeshPhongMaterial( { color: 0xffffff, morphTargets: true } );
// construct 8 blend shapes
for ( var i = 0; i < 8; i ++ ) {
  var vertices = [];
  for ( var v = 0; v < geometry.vertices.length; v ++ ) {
  vertices.push( geometry.vertices[ v ].clone() );
  if ( v === i ) {
  vertices[ vertices.length - 1 ].x *= 4;
  vertices[ vertices.length - 1 ].y *= 4;
  vertices[ vertices.length - 1 ].z *= 4;
  }
  }
  geometry.morphTargets.push( { name: "target" + i, vertices: vertices } );
}
mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.autoRotate = true;


mesh = new THREE.Mesh(
  geometry,
  material
);

threeobj = new THREE.Object3D();
threeobj.add( mesh );

scene.add( threeobj );

navigator.getUserMedia  = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia;

var audioCtx;
var analyser;
var source;
var bufferLength;
var dataArray;

function animate(){
  requestAnimationFrame( animate );

  analyser.getByteFrequencyData(dataArray);
  var binCount = analyser.frequencyBinCount;

  for(var i = 0; i < 8; i++) {
    var dataArrI = Math.floor(i*(binCount/8)); // Evenly spaced over frequencies.
    //var dataArrI(i + 10) *2
    //material.uniforms.amplitude.value[i] = -(dataArray[(i + 10) * 2] / 255) + 1;
    //material.color.r = (dataArray[dataArrI]/255);
    mesh.morphTargetInfluences[ i ] = dataArray[dataArrI]/255;
  };
  material.color.r = (dataArray[0]/255)
  material.reflectivity = (dataArray[0]/255)
  controls.update();

  render();
}

function render(){
  renderer.render( scene, camera );
}

render();

function start_mic(){
  if (navigator.getUserMedia) {
  var el = document.getElementById('enable-microphone-button');
  el.remove(); // Removes the div with the 'div-02' id

  container.appendChild( renderer.domElement );
    navigator.getUserMedia({ audio: true, video: false }, function( stream ) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      source = audioCtx.createMediaStreamSource( stream );

      source.connect(analyser);

      analyser.fftSize = 2048;
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array( bufferLength );

      animate();
    }, function(){});
  } else {
    // fallback.
  }
}
