function hexToRgb(hex) {
        var bigint = parseInt(hex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;

        return [r, g, b];
}

function rgbToHex(red, green, blue) {
            var rgb = blue | (green << 8) | (red << 16);
            return '#' + (0x1000000 + rgb).toString(16).slice(1)
}


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
          f.vertexColors[i] = new THREE.Color(this.color);
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

        // Get the R, G, B of our source (unlit)
        // and dest (lit) regions
        const rgbColors = hexToRgb(this.color.toString(16));
        const mapRgbColors = this.colorMapping.map(x => hexToRgb(x.toString(16)));
        

        for(var i = 0; i < 8; i++) {
          // This could be precalculated by the pre-mode step
          const dataArrI = Math.floor(i*(binCount/this.spacing)); // Evenly spaced over frequencies.
          
          // We calculate the differences of the source from the dest
          var sign = -1; // This sets whether we're going to dest from source or opposite

          if (this.color > this.colorMapping[i]) sign = -sign;
          const diffs = rgbColors.map((x, j) => sign*(x - mapRgbColors[i][j]))

          this.mesh.morphTargetInfluences[ i ] = dataArray[this.controlBins[i]]/255;
          this.vcMapping[i].forEach(([f,j])=>{
            const adds = diffs.map(d => d*(dataArray[this.controlBins[i]]/255));
            const totals = rgbColors.map((c,q) => c + adds[q]);
            const destColor = rgbToHex(totals[0], totals[1], totals[2]); 

            f.vertexColors[j].set(destColor);
          });
        };
        this.mesh.geometry.colorsNeedUpdate = true;
        
        this.material.reflectivity = 255;
      }
    }
  }
}
