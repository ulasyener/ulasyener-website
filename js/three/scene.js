let scene, camera, renderer;

// Grid entegrasyonu: grid.js bu değişkeni doldurur, animate() okur
let _activeGridState = null;

function setActiveGridState(state) {
  _activeGridState = state;
}

function initScene() {
  const canvas = document.getElementById('c');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe8e6e1);
  scene.fog = new THREE.FogExp2(0xe8e6e1, 0.0035);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(0, 30, 60);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.3);
  dirLight.position.set(0, 100, 50);
  scene.add(dirLight);

  initTerrain();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
}

// Terrain loop eşiği: kamera bu değere ulaşınca glitch ile sıfırla
const TERRAIN_LOOP_THRESHOLD = -280;
const TERRAIN_LOOP_START     = 60;
let   terrainLooping         = false;

function animate() {
  requestAnimationFrame(animate);

  camera.position.z -= 0.015;

  // Loop noktasına yaklaşıldığında glitch tetikle, sonra sıfırla
  if (!terrainLooping && camera.position.z < TERRAIN_LOOP_THRESHOLD) {
    terrainLooping = true;
    const doReset = () => { camera.position.z = TERRAIN_LOOP_START; terrainLooping = false; };
    if (typeof runGlitch === 'function') {
      runGlitch(doReset);
    } else {
      doReset();
    }
  }

  camera.lookAt(0, 30, camera.position.z - 1);

  // Terrain render
  renderer.autoClear = true;
  renderer.render(scene, camera);

  // Grid aktifse aynı canvas'a üst üste render et — ikinci WebGL context yok
  if (_activeGridState) {
    const gs       = _activeGridState;
    const W        = window.innerWidth;
    const H        = window.innerHeight;
    const dpr      = renderer.getPixelRatio();
    const clipTop  = gs.clipSafe || 0;          // px — nav alanı yüksekliği
    const scissorY = 0;                          // canvas altından başla (Three.js Y: aşağı = 0)
    const scissorH = Math.round((H - clipTop) * dpr);
    const scissorW = Math.round(W * dpr);
    const scissorX = 0;
    // Scissor: clipTop px'in altını render et, üstünü atla
    renderer.setScissorTest(true);
    renderer.setScissor(scissorX, scissorY, scissorW, scissorH);
    renderer.setViewport(0, 0, W, H);
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.render(gs.scene, gs.camera);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, W, H);
    renderer.autoClear = true;
  }
}
