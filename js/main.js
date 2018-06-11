class VisualisaRoot {
  constructor(){
    // standard global variables

    // SCENE
    this.scene = new THREE.Scene();


    // CAMERA
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
    this.scene.add( this.camera );
    this.camera.position.set(300,300,-300);
    this.camera.lookAt( this.scene.position );

    // RENDERER
    this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    this.renderer.setClearColor( 0xffffff, 0 );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    this.container = document.body;


    this.scene.background = new THREE.Color(0x000000);
    var light = new THREE.PointLight( 0xff2200 );
    light.position.set( 100, 100, 100 );
    this.scene.add( light );
    var light = new THREE.AmbientLight( 0x666666);
    this.scene.add( light );

    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    this.controls.autoRotate = true;

    navigator.getUserMedia  = navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia;



    this.changeMode = (newMode) => {
      this.mode.modeExit(this);
      newMode.modeEnter(this);
      this.mode = newMode;
    }

    this.start_mic = () => {
      if (navigator.getUserMedia) {
        var el = document.getElementById('enable-microphone-button');
        el.remove();


        this.container.appendChild( this.renderer.domElement );
        navigator.getUserMedia({ audio: true, video: false }, (stream) => {
          this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          this.analyser = this.audioCtx.createAnalyser();
          this.source = this.audioCtx.createMediaStreamSource( stream );

          this.source.connect(this.analyser);

          this.analyser.fftSize = 2048;
          this.bufferLength = this.analyser.frequencyBinCount;
          this.dataArray = new Uint8Array( this.bufferLength );

          this.animate();
        }, function(){});
      } else {
        // fallback.
      }
    }

    this.animate = () => {
      requestAnimationFrame( this.animate );

      this.analyser.getByteFrequencyData(this.dataArray);

      // Use the current mode to animate...
      this.mode.modeAnimate(this, this.analyser, this.dataArray);

      // Update objects that care...
      this.controls.update();

      this.render();
    }

    this.render = ()=>{
      this.renderer.render( this.scene, this.camera );
    }

    // Set mode..
    this.mode = new CubeMode(8, 255);
    this.mode.modeEnter(this);

    // Render.
    this.render();
  }


}

const vRoot = new VisualisaRoot();
