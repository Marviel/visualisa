class WorldIsACubeMode {
  constructor(spacing, colorDivisor){
    this.spacing = 255;
    this.colorDivisor = colorDivisor;

    this.modeEnter = (vRoot)=>{
      this.geometry = new THREE.SphereGeometry(100, 32, 32)
      this.material = new THREE.MeshPhongMaterial({ morphTargets: true });
      var texture = new THREE.TextureLoader().load( "img/8081_earthmap4k.jpg" );
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1,1);
      this.material.map  = texture;
      this.material.bumpMap    = new THREE.TextureLoader().load( "img/earthbump1k.jpg" );
      this.material.bumpScale = 0.1
      this.material.specularMap    = new THREE.TextureLoader().load( "img/earthspec1k.jpg" );
      this.material.specular  = new THREE.Color('grey')

      // Sort our vertices into the octants.
      // ---
      // --+
      // -+-
      // -++
      // +--
      // +-+
      // ++-
      // +++
      this.vMapping = this.geometry.vertices.reduce(
        (acc, v, i) => {
          // Convert x,y,z into a binary number based on positivity or negativity
          const pos = v.toArray().map((ve) => ve > 0);
          const num = pos.reduce((res, x) => res << 1 | x);
          acc[num].add(i);
          return acc
        },
        [
          new Set(),
          new Set(),
          new Set(),
          new Set(),
          new Set(),
          new Set(),
          new Set(),
          new Set()
        ]
      )

      this.vMapping.map((vertsSet, octMapI) => {
        this.geometry.morphTargets.push({
          name: "target" + octMapI,
          vertices: this.geometry.vertices.map((v, vi) => {
            if(vertsSet.has(vi)){
              // Basically we're gonna do a stupid mapping
              // Where we take every vector and shoot it out by a multiplier
              // And then we truncate all the axes to whatever our max is.
              //return v.clone().multiplyScalar(100).clamp(-101, 101);
              return v.clone().multiplyScalar(3).clampScalar(-100, 100);
            }
            else{
              return v;
            }
          })
        })
      })

      this.mesh = new THREE.Mesh(this.geometry, this.material)
      vRoot.scene.add(this.mesh)
    }

    this.modeExit = (vRoot)=>{
      vRoot.scene.remove( this.mesh )
    }

    this.modeAnimate = (vRoot, analyzer, dataArray)=>{
      var binCount = analyzer.frequencyBinCount;

      var onCount = 0;

      for ( var i = 0; i < 8; i ++ ) {
        var dataArrI = i % binCount; // Math.floor(i*(binCount/this.spacing)); // Evenly spaced over frequencies.
        this.mesh.morphTargetInfluences[ i ] = dataArray[dataArrI]/255;
      }
    }
  }
}
