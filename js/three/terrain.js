function initTerrain() {
  const loader = new THREE.GLTFLoader();
  const canvas = document.getElementById('c');

  // Terrain gelmezse N saniye sonra canvas'ı yine de göster
  const fallbackTimer = setTimeout(() => {
    if (canvas && canvas.style.opacity !== '1') {
      canvas.style.opacity = '1';
    }
  }, 6000);

  loader.load(
    'Terrain.glb',
    (gltf) => {
      clearTimeout(fallbackTimer);
      const terrain = gltf.scene;
      terrain.scale.set(1000, 1000, 1000);
      terrain.position.set(0, -20, 0);
      scene.add(terrain);
      if (canvas) canvas.style.opacity = '1';
    },
    undefined,
    (err) => {
      clearTimeout(fallbackTimer);
      console.warn('Terrain yüklenemedi:', err);
      // Hata durumunda da canvas'ı göster
      if (canvas) canvas.style.opacity = '1';
    }
  );
}
