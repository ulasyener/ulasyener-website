// ─── 3D Grid Sistemi — İki Kademeli ──────────────────────────────────────
// Kademe 1: showProjectGrid(projects)   — her proje için 1 kapak plane
// Kademe 2: showPhotoGrid(project)      — projenin tüm fotoğrafları

let gridRenderer = null;
let gridAnimId = null;

// ─── Renderer yönetimi ────────────────────────────────────────────────────
function getGridRenderer() {
  if (gridRenderer) return gridRenderer;
  const W = window.innerWidth, H = window.innerHeight;
  gridRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  gridRenderer.setSize(W, H);
  gridRenderer.setPixelRatio(window.devicePixelRatio);
  gridRenderer.setClearColor(0x000000, 0);
  gridRenderer.domElement.style.cssText = 'position:fixed;top:0;left:0;z-index:101;pointer-events:all;';
  document.body.appendChild(gridRenderer.domElement);
  window.addEventListener('resize', () => {
    const nW = window.innerWidth, nH = window.innerHeight;
    gridRenderer.setSize(nW, nH);
  });
  return gridRenderer;
}

function destroyGrid() {
  if (gridAnimId) { cancelAnimationFrame(gridAnimId); gridAnimId = null; }
  if (gridRenderer) {
    gridRenderer.dispose();
    if (document.body.contains(gridRenderer.domElement)) {
      document.body.removeChild(gridRenderer.domElement);
    }
    gridRenderer = null;
  }
  document.querySelectorAll('.grid-label').forEach(el => el.remove());
}

// ─── Ortak grid builder ───────────────────────────────────────────────────
function buildGrid(items, onSelect) {
  destroyGrid();

  const W = window.innerWidth, H = window.innerHeight;
  const renderer = getGridRenderer();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);

  // Plane'leri kameraya yaklaştır: z=12 → z=7
  camera.position.z = 7;

  const COLS   = Math.min(items.length, 3);
  const GAP_X  = 0.28;
  const GAP_Y  = 0.55;
  // Plane boyutu büyütüldü: BASE_W 2.6 → 3.4
  const BASE_W = 3.4;
  const loader = new THREE.TextureLoader();

  const meshes = [];
  const targetScales = {};
  let selected = null;

  items.forEach((item, i) => {
    const col    = i % COLS;
    const row    = Math.floor(i / COLS);
    const aspect = item.width / item.height;
    const pw     = BASE_W;
    const ph     = pw / aspect;

    const geo = new THREE.PlaneGeometry(pw, ph);
    let mat;
    if (item.src) {
      const tex = loader.load(item.src);
      tex.minFilter = THREE.LinearFilter;
      mat = new THREE.MeshBasicMaterial({ map: tex });
    } else {
      const grays = [0xc8c5be, 0xbcb9b2, 0xd0cdc6, 0xc0bdb6, 0xd4d1ca];
      mat = new THREE.MeshBasicMaterial({ color: grays[i % grays.length] });
    }

    const mesh    = new THREE.Mesh(geo, mat);
    const totalW  = COLS * BASE_W + (COLS - 1) * GAP_X;
    const x       = col * (BASE_W + GAP_X) - totalW / 2 + BASE_W / 2;
    const y       = -row * (ph + GAP_Y);
    mesh.position.set(x, y, 0);
    mesh.userData = { item, pw, ph, col, row, index: i };
    scene.add(mesh);
    meshes.push(mesh);
    targetScales[i] = 1;
  });

  // Dikey ortala
  if (meshes.length > 0) {
    const rows = Math.ceil(items.length / COLS);
    let totalH = 0;
    for (let r = 0; r < rows; r++) {
      const p = meshes[r * COLS];
      if (p) totalH += p.userData.ph + GAP_Y;
    }
    const offsetY = totalH / 2 - meshes[0].userData.ph / 2;
    meshes.forEach(m => { m.position.y += offsetY; });
  }

  // HTML label overlay'leri
  function updateLabels() {
    document.querySelectorAll('.grid-label').forEach(el => el.remove());
    meshes.forEach((mesh) => {
      const item = mesh.userData.item;
      if (!item.label) return;

      const pos = mesh.position.clone();
      pos.project(camera);
      const sx = (pos.x * 0.5 + 0.5) * W;

      const ph     = mesh.userData.ph;
      const bottom = new THREE.Vector3(mesh.position.x, mesh.position.y - ph / 2, 0);
      bottom.project(camera);
      const by = (-bottom.y * 0.5 + 0.5) * H;

      const div = document.createElement('div');
      div.className = 'grid-label';
      div.style.cssText = `
        position:fixed;
        left:${sx}px;
        top:${by + 10}px;
        transform:translateX(-50%);
        z-index:102;
        pointer-events:none;
        text-align:center;
      `;
      div.innerHTML = `
        <div style="font-family:'Helvetica Neue',sans-serif;font-size:9px;letter-spacing:.25em;text-transform:uppercase;color:rgba(0,0,0,0.55)">${item.label}</div>
        ${item.sublabel ? `<div style="font-family:'Helvetica Neue',sans-serif;font-size:9px;letter-spacing:.15em;color:rgba(0,0,0,0.3);margin-top:2px">${item.sublabel}</div>` : ''}
      `;
      document.body.appendChild(div);
    });
  }

  // Raycaster
  const raycaster = new THREE.Raycaster();
  const mouse     = new THREE.Vector2();

  function setMouse(e) {
    mouse.x =  (e.clientX / W) * 2 - 1;
    mouse.y = -(e.clientY / H) * 2 + 1;
  }

  const SCALE_SEL = 1.4, SCALE_OTH = 0.7, LERP = 0.08;

  function onMove(e) {
    setMouse(e);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(meshes);
    renderer.domElement.style.cursor = hits.length ? 'pointer' : 'default';
  }

  function onClick(e) {
    setMouse(e);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(meshes);
    if (!hits.length) { deselect(); return; }
    const hit = hits[0].object;
    if (hit === selected) { deselect(); return; }
    selected = hit;
    meshes.forEach((m, i) => { targetScales[i] = m === hit ? SCALE_SEL : SCALE_OTH; });
    if (onSelect) onSelect(hit.userData.item.data);
  }

  function deselect() {
    selected = null;
    meshes.forEach((_, i) => { targetScales[i] = 1; });
  }

  renderer.domElement.addEventListener('mousemove', onMove);
  renderer.domElement.addEventListener('click', onClick);

  let labelsReady = false;
  gridAnimId = requestAnimationFrame(function loop() {
    gridAnimId = requestAnimationFrame(loop);
    meshes.forEach((m, i) => {
      const t   = targetScales[i];
      m.scale.x += (t - m.scale.x) * LERP;
      m.scale.y += (t - m.scale.y) * LERP;
    });
    renderer.render(scene, camera);
    if (!labelsReady) { updateLabels(); labelsReady = true; }
  });

  return {
    destroy: () => {
      renderer.domElement.removeEventListener('mousemove', onMove);
      renderer.domElement.removeEventListener('click', onClick);
      destroyGrid();
    }
  };
}

// ─── Kademe 1: Proje kapak grid'i ─────────────────────────────────────────
function showProjectGrid(projects, onProjectClick) {
  const items = projects.map(proj => {
    const cover = proj.images && proj.images.length > 0 ? proj.images[0] : null;
    return {
      src:      cover ? cover.src   : null,
      width:    cover ? cover.width  : 1920,
      height:   cover ? cover.height : 1080,
      label:    proj.title,
      sublabel: proj.year,
      data:     proj
    };
  });
  return buildGrid(items, onProjectClick);
}

// ─── Kademe 2: Proje fotoğraf grid'i ──────────────────────────────────────
function showPhotoGrid(project) {
  const items = project.images && project.images.length > 0
    ? project.images.map((img, i) => ({
        src:      img.src,
        width:    img.width,
        height:   img.height,
        label:    null,
        sublabel: null,
        data:     { index: i, project }
      }))
    : [[1920,1080],[1080,1350],[1920,1280],[1080,1080],[1920,1080],[1080,1350]]
        .map(([w,h], i) => ({
          src: null, width: w, height: h,
          label: null, sublabel: null,
          data: { index: i, project }
        }));

  return buildGrid(items, null);
}
