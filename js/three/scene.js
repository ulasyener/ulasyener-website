let scene, camera, renderer;

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

function animate() {
  requestAnimationFrame(animate);
  camera.position.z -= 0.015;
  if (camera.position.z < -300) camera.position.z = 60;
  camera.lookAt(0, 30, camera.position.z - 1);
  renderer.render(scene, camera);
}