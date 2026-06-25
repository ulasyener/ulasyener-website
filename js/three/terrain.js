function initTerrain() {
  const loader = new THREE.GLTFLoader();

  loader.load(
    'Terrain.glb',
    (gltf) => {
      const terrain = gltf.scene;
      terrain.scale.set(1000, 1000, 1000);
      terrain.position.set(0, -20, 0);
      scene.add(terrain);
      // Terrain yüklenince canvas'ı fade in yap
      const c = document.getElementById('c');
      if (c) c.style.opacity = '1';
    },
    undefined,
    (err) => {
      console.warn('Terrain yüklenemedi:', err);
    }
  );
}
