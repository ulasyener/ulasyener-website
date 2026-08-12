// ─── 360° Equirectangular Panorama Viewer (lightbox içine gömülü) ────────
function createPanoramaViewer(container, imageSrc) {
  const width  = container.clientWidth;
  const height = container.clientHeight;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.domElement.style.cssText = 'display:block;cursor:grab;touch-action:none;';
  container.appendChild(renderer.domElement);

  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1); // içten bakılacak şekilde ters çevir

  const texture = new THREE.TextureLoader().load(imageSrc);
  texture.encoding = THREE.sRGBEncoding;
  const material = new THREE.MeshBasicMaterial({ map: texture });
  scene.add(new THREE.Mesh(geometry, material));

  let lon = 180, lat = 0;
  let targetFov = 75;
  let isDragging = false;
  let prevX = 0, prevY = 0;

  function pointerPos(e) {
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX, y: t.clientY };
  }

  function onDown(e) {
    isDragging = true;
    const p = pointerPos(e);
    prevX = p.x; prevY = p.y;
    renderer.domElement.style.cursor = 'grabbing';
  }
  function onMove(e) {
    if (!isDragging) return;
    const p = pointerPos(e);
    lon -= (p.x - prevX) * 0.15;
    lat += (p.y - prevY) * 0.15;
    lat  = Math.max(-85, Math.min(85, lat));
    prevX = p.x; prevY = p.y;
  }
  function onUp() {
    isDragging = false;
    renderer.domElement.style.cursor = 'grab';
  }
  function onWheel(e) {
    e.preventDefault();
    targetFov = Math.max(30, Math.min(90, targetFov + e.deltaY * 0.05));
  }

  renderer.domElement.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  renderer.domElement.addEventListener('touchstart', onDown, { passive: true });
  renderer.domElement.addEventListener('touchmove', onMove, { passive: true });
  renderer.domElement.addEventListener('touchend', onUp);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

  let rafId;
  function animate() {
    rafId = requestAnimationFrame(animate);
    camera.fov += (targetFov - camera.fov) * 0.1;
    camera.updateProjectionMatrix();

    const phi   = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon);
    camera.position.x = 0.01 * Math.sin(phi) * Math.cos(theta);
    camera.position.y = 0.01 * Math.cos(phi);
    camera.position.z = 0.01 * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  return {
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
}
