class CubeModeRainbow {
  constructor(spacing, colorDivisor){
    this.spacing = spacing;
    this.colorDivisor = colorDivisor;
    this.color = 0xFFFFFF;

    this.vcMapping = {};
    this.colorMapping = [0xff00ff, 0xff0000, 0xffff00,0x0000ff,
                         0x00ff00, 0x00ffff, 0x0f0f0f,0xf0ff0f]

    this.calibrationRuns = 100;
    this.calibrationI = 0;
    this.controlBins = [0,0,0,0,0,0,0,0];
    this.calibAcc = {};

    this.modeEnter = (vRoot)=>{
      this.geometry = new THREE.BoxGeometry( 100, 100, 100 );
      this.material = new THREE.MeshPhongMaterial( { color: 0xffffff, morphTargets: true } );
      this.material.vertexColors = THREE.VertexColors;

      // construct 8 blend shapes
      this.geometry.faces.forEach((f)=>{
        const arr = ['a','b','c'];

        arr.forEach((k, i)=>{
          if (f[k] in this.vcMapping){
            this.vcMapping[f[k]].push([f, i]);
          }
          else{
            this.vcMapping[f[k]] = [[f,i]];
          }
          f.vertexColors[i] = new THREE.Color(0x00ffff);
        });
      });


      for ( var i = 0; i < 8; i ++ ) {
        var vertices = [];
        for ( var v = 0; v < this.geometry.vertices.length; v ++ ) {
          vertices.push( this.geometry.vertices[ v ].clone() );
          if ( v === i ) {
            vertices[ vertices.length - 1 ].x *= 4;
            vertices[ vertices.length - 1 ].y *= 4;
            vertices[ vertices.length - 1 ].z *= 4;
          }
        }
        this.geometry.morphTargets.push( { name: "target" + i, vertices: vertices } );
      }
      this.mesh = new THREE.Mesh( this.geometry, this.material );
      vRoot.scene.add( this.mesh );
    }

    this.modeExit = (vRoot)=>{
      vRoot.scene.remove( this.mesh )
    }

    this.modeAnimate = (vRoot, analyzer, dataArray)=>{
      var binCount = analyzer.frequencyBinCount;


      if (this.calibrationI < this.calibrationRuns){
        for(var i = 0; i < binCount; i++){
          if (i in this.calibAcc) this.calibAcc[i] += dataArray[i];
          else this.calibAcc[i] = dataArray[i];
        }
        this.calibrationI++;
      }
      else{
        if (this.calibrationI == this.calibrationRuns){
          var ks = Object.keys(this.calibAcc).sort((a,b)=>{return this.calibAcc[a]-this.calibAcc[b]});
          this.controlBins = ks.slice(Math.max(ks.length - 8, 1))
        }
        for(var i = 0; i < 8; i++) {
          const dataArrI = Math.floor(i*(binCount/this.spacing)); // Evenly spaced over frequencies.

          var sign = -1;
          if (this.color > this.colorMapping[i]) sign = -sign;
          const diff = sign*(this.color - this.colorMapping[i]);

          //var dataArrI(i + 10) *2
          //material.uniforms.amplitude.value[i] = -(dataArray[(i + 10) * 2] / 255) + 1;
          //material.color.r = (dataArray[dataArrI]/255);
          this.mesh.morphTargetInfluences[ i ] = dataArray[this.controlBins[i]]/255;
          this.vcMapping[i].forEach(([f,j])=>{
            f.vertexColors[j].set(this.color+diff*(dataArray[this.controlBins[i]]/10));
            // f.vertexColors[j].r = dataArray[dataArrI]/100;
            // f.vertexColors[j].g = dataArray[dataArrI]/255;
          });
        };
        //this.material.color.r = (dataArray[0]/this.colorDivisor)
        this.mesh.geometry.colorsNeedUpdate = true;
        this.material.reflectivity = (dataArray[0]/255)
      }
    }
  }
}
