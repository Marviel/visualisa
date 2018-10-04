class BrainMode {
  constructor(spacing, colorDivisor){
    console.log(spacing, colorDivisor)
    this.spacing = spacing;
    this.colorDivisor = colorDivisor;

    this.brainPartNames = [
      "Brain-brain_stem-medulla_oblongata.js-fixed.stl",
      "Brain-brain_stem-midbrain.js-fixed.stl",
      "Brain-brain_stem-pons.js-fixed.stl",
      "Brain-cranial_nerves-cranial_nerve_III_oculomotor.js-fixed.stl",
      "Brain-cranial_nerves-cranial_nerve_II_optic.js-fixed.stl",
      "Brain-cranial_nerves-cranial_nerve_IV_trochlear.js-fixed.stl",
      "Brain-cranial_nerves-cranial_nerve_IX_glossopharyngeal.js-fixed.stl",
      "Brain-cranial_nerves-cranial_nerve_I_olfactory.js-fixed.stl",
      "Brain-cranial_nerves-cranial_nerve_VIII_vestibulocochlear.js-fixed.stl",
      "Brain-cranial_nerves-cranial_nerve_VII_facial.js-fixed.stl",
      "Brain-cranial_nerves-cranial_nerve_VI_abducens.js-fixed.stl",
      "Brain-cranial_nerves-cranial_nerve_V_trigeminal.js-fixed.stl",
      "Brain-cranial_nerves-cranial_nerve_XII_hypoglossal.js-fixed.stl",
      "Brain-cranial_nerves-cranial_nerve_XI_accessory.js-fixed.stl",
      "Brain-cranial_nerves-cranial_nerve_X_vagus.js-fixed.stl",
      "Brain-basal_ganglia-caudate_nucleus.js-fixed.stl",
      "Brain-basal_ganglia-globus_pallidus.js-fixed.stl",
      "Brain-basal_ganglia-nucleus_accumbens.js-fixed.stl",
      "Brain-basal_ganglia-putamen.js-fixed.stl",
      "Brain-basal_ganglia-putamen.stl",
      "Brain-basal_ganglia-substantia_nigra.stl",
      "Brain-basal_ganglia-subthalamic_nucleus.js-fixed.stl",
      "Brain-corpus_callosum.js-fixed.stl",
      "Brain-limbic_system-amygdala.js-fixed.stl",
      "Brain-limbic_system-entorhinal_cortex.js-fixed.stl",
      "Brain-limbic_system-hippocampus-dentate_gyrus.js-fixed.stl",
      "Brain-limbic_system-hippocampus-hippocampus.js-fixed.stl",
      "Brain-limbic_system-hippocampus-subiculum.js-fixed.stl",
      "Brain-limbic_system-hypothalamus.js-fixed.stl",
      "Brain-olfactory_bulb.js-fixed.stl",
      "Brain-pituitary_gland.js-fixed.stl",
      "Brain-primary_auditory_cortex.js-fixed.stl",
      "Brain-thalamus.js-fixed.stl",
      "Brain-ventricles.js-fixed.stl",
      "Brain-cerebral_hemisphere-left.js-fixed.stl",
      "Brain-cerebral_hemisphere-right.js-fixed.stl",
    ]

    this.brainParts = []

    this.modeEnter = (vRoot)=>{
      var loader = new THREE.STLLoader();

      this.brainPartNames.map((name)=>{
        loader.load('./mesh/' + name,(geometry)=> {
          const material = new THREE.MeshPhongMaterial( { color: 0xffffff, transparent: true } );
          const mesh = new THREE.Mesh( geometry, material )

          mesh.scale.fromArray([10,10,10])

          this.brainParts.push(mesh);
          vRoot.scene.add(mesh);
        });
      })
    }

    this.modeExit = (vRoot)=>{
      vRoot.scene.remove( this.mesh )
    }

    this.modeAnimate = (vRoot, analyzer, dataArray)=>{
      //console.log(this.spacing, this.colorDivisor)
      var binCount = analyzer.frequencyBinCount;


      for(var i = 0; i < this.brainPartNames.length; i++) {
        var dataArrI = Math.floor(i*(binCount/this.brainPartNames.length)); // Evenly spaced over frequencies.
        //var dataArrI(i + 10) *2
        //material.uniforms.amplitude.value[i] = -(dataArray[(i + 10) * 2] / 255) + 1;
        //material.color.r = (dataArray[dataArrI]/255);
        if (this.brainParts[i]){
          this.brainParts[i].material.color.r = dataArray[dataArrI]/255;
          this.brainParts[i].material.opacity = (dataArray[dataArrI] + 10)/255;
        }
      };
      // this.material.color.r = (dataArray[0]/this.colorDivisor)
      // this.material.reflectivity = (dataArray[0]/255)
    }
  }
}
