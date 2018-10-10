class WorldIsACubeMode {
  constructor(spacing, colorDivisor){
    this.spacing = 255;
    this.colorDivisor = colorDivisor;

    this.modeEnter = (vRoot)=>{
      this.geometry = new THREE.SphereGeometry(100, 32, 32)
      this.material = new THREE.MeshPhongMaterial({ morphTargets: true });
      var texture = new THREE.TextureLoader().load( "img/earthmap1k.jpg" );
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1,1);
      this.material.map  = texture;

      // this.geometry = new THREE.BoxGeometry( 100, 100, 100 );
      // this.material = new THREE.MeshPhongMaterial( { color: 0xffffff, morphTargets: true } );
      // construct n blend shapes
      for ( var i = 0; i < this.geometry.vertices.length / 8; i ++ ) {
        var vertices = [];
        for ( var v = 0; v < this.geometry.vertices.length; v ++ ) {
          vertices.push( this.geometry.vertices[ v ].clone() );
          if ( v === i ) {
            vertices[ vertices.length - 1 ].x *= 1.2;
            vertices[ vertices.length - 1 ].y *= 1.2;
            vertices[ vertices.length - 1 ].z *= 1.2;
          }
        }
        this.geometry.morphTargets.push( { name: "target" + i, vertices: vertices } );
      }
      this.mesh = new THREE.Mesh(this.geometry, this.material)
      vRoot.scene.add(this.mesh)
    }

    this.modeExit = (vRoot)=>{
      vRoot.scene.remove( this.mesh )
    }

    this.modeAnimate = (vRoot, analyzer, dataArray)=>{
      var binCount = analyzer.frequencyBinCount;

      var onCount = 0;

      for(var i = 0; i < this.geometry.vertices.length / 8; i++) {
        var dataArrI = i % binCount; // Math.floor(i*(binCount/this.spacing)); // Evenly spaced over frequencies.
        //var dataArrI(i + 10) *2
        //material.uniforms.amplitude.value[i] = -(dataArray[(i + 10) * 2] / 255) + 1;
        //material.color.r = (dataArray[dataArrI]/255);
        this.mesh.morphTargetInfluences[ i ] = dataArray[dataArrI]/255;
      };
      // this.material.color.r = (dataArray[0]/this.colorDivisor)
      // this.material.reflectivity = (dataArray[0]/255)
      // }
    }
  }
}
