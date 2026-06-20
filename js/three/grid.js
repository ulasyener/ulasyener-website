// ─── 2.5D Kare Grid Sistemi ───────────────────────────────────────────────
// Kademe 1: showProjectGrid(projects, onProjectClick)
// Kademe 2: showPhotoGrid(project)

let gridRenderer = null;
let gridAnimId   = null;
let gridOverlay  = null;

// ─── Sabitler ─────────────────────────────────────────────────────────────
const PER_ROW     = 3;
const GAP         = 0.18;
const TILE        = 2.8;
const CAM_Z       = 7.5;
const NAV_SAFE    = 235;   // px — overlay başlangıcı (butonlar buraya kadar serbest)
const CLIP_SAFE   = 120;   // px — canvas clip, plane'ler buraya kadar görünür
const SCROLL_SPD  = 0.8;
const SCROLL_LERP = 0.1;
const LERP        = 0.09;

// ─── Renderer ─────────────────────────────────────────────────────────────
function getGridRenderer() {
  if (gridRenderer) return gridRenderer;
  gridRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  gridRenderer.setSize(window.innerWidth, window.innerHeight);
  gridRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  gridRenderer.setClearColor(0x000000, 0);
  // clip-path: CLIP_SAFE px'den kes — plane'ler dönerken nav altına taşabilir
  gridRenderer.domElement.style.cssText =
    'position:fixed;top:0;left:0;z-index:101;pointer-events:none;' +
    'clip-path:inset(' + CLIP_SAFE + 'px 0 0 0);';
  document.body.appendChild(gridRenderer.domElement);
  window.addEventListener('resize', onGridResize);
  return gridRenderer;
}

function onGridResize() {
  if (!gridRenderer) return;
  gridRenderer.setSize(window.innerWidth, window.innerHeight);
}

function destroyGrid() {
  if (gridAnimId)  { cancelAnimationFrame(gridAnimId); gridAnimId = null; }
  if (gridOverlay) { gridOverlay.remove(); gridOverlay = null; }
  document.querySelectorAll('.grid-label').forEach(e => e.remove());
  if (gridRenderer) {
    window.removeEventListener('resize', onGridResize);
    gridRenderer.dispose();
    gridRenderer.domElement.remove();
    gridRenderer = null;
  }
}

// ─── Çekirdek builder ─────────────────────────────────────────────────────
function buildGrid(items, onSelect) {
  destroyGrid();

  const W = window.innerWidth;
  const H = window.innerHeight;
  const renderer = getGridRenderer();

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);
  camera.position.set(0, 0, CAM_Z);
  camera.lookAt(0, 0, 0);

  const loader = new THREE.TextureLoader();
  const meshes = [];
  const scales = {};
  let selected  = null;

  // ── Mouse paralaks state ──────────────────────────────────────────────
  let mouseNX = 0, mouseNY = 0;      // hedef — normalize -1..1
  let smoothMX = 0, smoothMY = 0;    // smooth değerler
  const MOUSE_LERP   = 0.035;
  const CAM_ROT_MAX  = 0.08;         // max kamera tilt        // max kamera tilt (radyan ~3°)
  const PLANE_ROT    = 0.28;         // ~16° — belirgin 3D his         // plane'lerin sabit base rotasyonu (radyan ~7°)

  function onMouseMove(e) {
    mouseNX =  (e.clientX / window.innerWidth)  * 2 - 1;
    mouseNY = -(e.clientY / window.innerHeight) * 2 + 1;
  }
  window.addEventListener('mousemove', onMouseMove);

  // ── Scroll state ──────────────────────────────────────────────────────
  let scrollY      = 0;
  let scrollTarget = 0;

  // ── Viewport yüksekliği Three.js biriminde ────────────────────────────
  const fovRad   = (50 * Math.PI) / 180;
  const visibleH = 2 * Math.tan(fovRad / 2) * CAM_Z;
  const visibleW = visibleH * (W / H);

  // NAV_SAFE px → Three.js Y birimi
  const navUnits = (NAV_SAFE / H) * visibleH;

  // ── Plane'leri oluştur ────────────────────────────────────────────────
  const ROWS = Math.ceil(items.length / PER_ROW);

  // İlk satır: viewport'un üst kenarından navUnits + yarım tile aşağıda
  const topEdge = visibleH / 2;
  const startY  = topEdge - navUnits - TILE / 2;

  // Max scroll: son satır görünene kadar
  const gridH       = ROWS * TILE + (ROWS - 1) * GAP;
  const visibleGrid = visibleH - navUnits;
  const maxScroll   = Math.max(0, gridH - visibleGrid + TILE * 0.3);

  const DEPTH = 0.08; // kutu kalınlığı (Three.js birimi)
  // Kenar rengi: mat, koyu gri — fotoğrafın yanında derinlik verir
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0x2a2825 });

  items.forEach((item, i) => {
    const col = i % PER_ROW;
    const row = Math.floor(i / PER_ROW);

    // Bu satırdaki item sayısı
    const rowStart  = row * PER_ROW;
    const rowCount  = Math.min(PER_ROW, items.length - rowStart);
    const rowW      = rowCount * TILE + (rowCount - 1) * GAP;
    const rowStartX = -rowW / 2 + TILE / 2;

    const x = rowStartX + col * (TILE + GAP);
    const y = startY - row * (TILE + GAP);

    // BoxGeometry: ön yüz fotoğraf, diğer 5 yüz kenar rengi
    const geo = new THREE.BoxGeometry(TILE, TILE, DEPTH);
    let frontMat;
    if (item.src) {
      const tex = loader.load(item.src);
      tex.minFilter = THREE.LinearFilter;
      frontMat = new THREE.MeshBasicMaterial({ map: tex });
    } else {
      const grays = [0xc8c5be, 0xbcb9b2, 0xd0cdc6, 0xc0bdb6, 0xd4d1ca];
      frontMat = new THREE.MeshBasicMaterial({ color: grays[i % grays.length] });
    }

    // BoxGeometry yüz sırası: +X, -X, +Y, -Y, +Z (ön), -Z (arka)
    const materials = [
      edgeMat,    // sağ kenar
      edgeMat,    // sol kenar
      edgeMat,    // üst kenar
      edgeMat,    // alt kenar
      frontMat,   // ön yüz — fotoğraf
      edgeMat     // arka yüz
    ];

    const mesh = new THREE.Mesh(geo, materials);
    mesh.position.set(x, y, 0);
    mesh.rotation.y = PLANE_ROT;
    mesh.userData = { item, index: i, baseY: y };
    scene.add(mesh);
    meshes.push(mesh);
    scales[i] = 1;
  });

  // ── HTML label'lar ────────────────────────────────────────────────────
  function renderLabels() {
    document.querySelectorAll('.grid-label').forEach(e => e.remove());
    meshes.forEach(mesh => {
      const { item } = mesh.userData;
      if (!item.label) return;

      const screenPos = mesh.position.clone().project(camera);
      const sx = ( screenPos.x * 0.5 + 0.5) * W;
      const sy = (-screenPos.y * 0.5 + 0.5) * H;
      const labelY = sy + (TILE / 2 / visibleH) * H + 8;

      if (labelY < NAV_SAFE || labelY > H + 40) return;

      const div = document.createElement('div');
      div.className = 'grid-label';
      div.style.cssText = `
        position:fixed;left:${sx}px;top:${labelY}px;
        transform:translateX(-50%);
        z-index:103;pointer-events:none;text-align:center;
      `;
      div.innerHTML = `
        <div style="font-family:'Helvetica Neue',sans-serif;font-size:9px;
          letter-spacing:.25em;text-transform:uppercase;color:rgba(0,0,0,0.5)">
          ${item.label}</div>
        ${item.sublabel ? `<div style="font-family:'Helvetica Neue',sans-serif;
          font-size:9px;letter-spacing:.12em;color:rgba(0,0,0,0.3);margin-top:2px">
          ${item.sublabel}</div>` : ''}
      `;
      document.body.appendChild(div);
    });
  }

  // ── Overlay: NAV_SAFE altı, tıklamaları yakalar ───────────────────────
  gridOverlay = document.createElement('div');
  gridOverlay.id = 'grid-overlay';
  gridOverlay.style.cssText =
    'position:fixed;top:' + NAV_SAFE + 'px;left:0;' +
    'width:100%;height:calc(100% - ' + NAV_SAFE + 'px);' +
    'z-index:102;cursor:default;';
  document.body.appendChild(gridOverlay);

  // ── Raycaster ─────────────────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  const mouse     = new THREE.Vector2();

  function toNDC(e) {
    mouse.x =  (e.clientX / W) * 2 - 1;
    mouse.y = -(e.clientY  / H) * 2 + 1;
  }

  // Her mesh için ayrı hover rotasyon hedefi
  const hoverRotY = {}; // hedef Y rotasyonu
  const hoverRotX = {}; // hedef X rotasyonu
  const smoothRotY = {};
  const smoothRotX = {};
  meshes.forEach((_, i) => {
    hoverRotY[i] = PLANE_ROT;
    hoverRotX[i] = 0;
    smoothRotY[i] = PLANE_ROT;
    smoothRotX[i] = 0;
  });

  let hoveredIndex = -1; // şu an hover'daki mesh index'i

  function onMove(e) {
    toNDC(e);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(meshes, false);
    gridOverlay.style.cursor = hits.length ? 'pointer' : 'default';

    if (hits.length) {
      const hit  = hits[0];
      const mesh = hit.object;
      const idx  = mesh.userData.index;
      hoveredIndex = idx;

      // UV'den mouse'un plane üzerindeki lokal pozisyonunu al (-0.5..0.5)
      const uv = hit.uv;
      if (uv) {
        const localX = uv.x - 0.5; // -0.5 sol, +0.5 sağ
        const localY = uv.y - 0.5; // -0.5 alt, +0.5 üst
        const MAX_ROT = 0.26; // ~15°
        hoverRotY[idx] = PLANE_ROT + localX * MAX_ROT * 2;
        hoverRotX[idx] = localY * MAX_ROT * -1;
      }

      if (!selected) scales[idx] = 1.06;
    } else {
      // Hover çıkınca base rotasyona dön
      if (hoveredIndex >= 0) {
        hoverRotY[hoveredIndex] = PLANE_ROT;
        hoverRotX[hoveredIndex] = 0;
        if (!selected) scales[hoveredIndex] = 1;
      }
      hoveredIndex = -1;
      if (!selected) meshes.forEach((_, i) => { scales[i] = 1; });
    }
  }

  function onClick(e) {
    toNDC(e);
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(meshes);
    if (!hits.length) { deselect(); return; }
    const hit = hits[0].object;
    if (hit === selected) { deselect(); return; }
    selected = hit;
    meshes.forEach((m, i) => {
      scales[i] = m === hit ? 1.12 : 0.9;
    });
    if (onSelect) onSelect(hit.userData.item.data);
  }

  function deselect() {
    selected = null;
    meshes.forEach((_, i) => { scales[i] = 1; });
  }

  // ── Scroll: deltaY > 0 (aşağı) → meshler yukarı kayar ───────────────
  function onWheel(e) {
    e.preventDefault();
    scrollTarget += e.deltaY * 0.003 * SCROLL_SPD;
    scrollTarget = Math.max(0, Math.min(maxScroll, scrollTarget));
  }

  // ── LED Glitch Video Texture ──────────────────────────────────────────
  const GLITCH_SRCS = [
    'images/effects/ledglitch/01.mp4',
    'images/effects/ledglitch/02.mp4',
    'images/effects/ledglitch/03.mp4',
    'images/effects/ledglitch/04.mp4'
  ];
  const GLITCH_OPACITY = 0.5;

  // 4 video için texture havuzu
  const gifPool = GLITCH_SRCS.map(src => {
    const video = document.createElement('video');
    video.src     = src;
    video.loop    = true;
    video.muted   = true;
    video.autoplay = true;
    video.playsInline = true;
    video.style.cssText = 'position:fixed;top:-9999px;left:-9999px;pointer-events:none;';
    document.body.appendChild(video);
    video.play().catch(() => {});

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    return { video, texture };
  });

  // Her frame texture otomatik güncellenir (VideoTexture bunu halleder)
  function updateGifTextures() {
    gifPool.forEach(({ texture }) => { texture.needsUpdate = true; });
  }

  // Glitch mesh'leri — her plane'in önünde
  const glitchMeshes = meshes.map((mesh, i) => {
    const pool = gifPool[i % gifPool.length];
    const geo  = new THREE.PlaneGeometry(TILE, TILE);
    const mat  = new THREE.MeshBasicMaterial({
      map:         pool.texture,
      transparent: true,
      opacity:     GLITCH_OPACITY,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false
    });
    const gMesh = new THREE.Mesh(geo, mat);
    gMesh.position.set(mesh.position.x, mesh.userData.baseY, DEPTH / 2 + 0.01);
    gMesh.userData = { parentIndex: i };
    scene.add(gMesh);
    return gMesh;
  });

  function syncGlitchMeshes() {
    glitchMeshes.forEach((gMesh, i) => {
      const parent = meshes[i];
      gMesh.position.x = parent.position.x;
      gMesh.position.y = parent.position.y;
      gMesh.position.z = DEPTH / 2 + 0.01;
      gMesh.rotation.copy(parent.rotation);
      gMesh.scale.copy(parent.scale);
    });
  }

  const _destroyGlitch = () => {
    glitchMeshes.forEach(gm => scene.remove(gm));
    gifPool.forEach(({ video, texture }) => {
      video.pause();
      if (document.body.contains(video)) video.remove();
      texture.dispose();
    });
  };

  gridOverlay.addEventListener('mousemove', onMove);
  gridOverlay.addEventListener('click',     onClick);
  gridOverlay.addEventListener('wheel',     onWheel, { passive: false });

  // ── Render loop ───────────────────────────────────────────────────────
  function loop() {
    gridAnimId = requestAnimationFrame(loop);

    // Smooth mouse
    smoothMX += (mouseNX - smoothMX) * MOUSE_LERP;
    smoothMY += (mouseNY - smoothMY) * MOUSE_LERP;

    // Smooth scroll
    scrollY += (scrollTarget - scrollY) * SCROLL_LERP;

    // Kamera: position ile paralaks — rotation yok, lookAt sabit
    const camX = smoothMX * CAM_ROT_MAX * -1.2;
    const camY = smoothMY * CAM_ROT_MAX *  0.6;
    camera.position.set(camX, camY, CAM_Z);
    camera.lookAt(0, 0, 0);

    // Mesh: scroll + bireysel hover rotasyonu + global paralaks
    meshes.forEach((m, i) => {
      m.position.y = m.userData.baseY + scrollY;

      // Global paralaks rotasyonu (tüm plane'ler)
      const globalY = smoothMX * -0.08;
      const globalX = smoothMY * -0.04;

      // Hover rotasyonu smooth lerp
      smoothRotY[i] += (hoverRotY[i] - smoothRotY[i]) * 0.08;
      smoothRotX[i] += (hoverRotX[i] - smoothRotX[i]) * 0.08;

      m.rotation.y = smoothRotY[i] + globalY;
      m.rotation.x = smoothRotX[i] + globalX;

      m.scale.x += (scales[i] - m.scale.x) * LERP;
      m.scale.y += (scales[i] - m.scale.y) * LERP;
    });

    renderer.render(scene, camera);
    updateGifTextures();
    syncGlitchMeshes();
    renderLabels();
    updateGifTextures();
    syncGlitchMeshes();
  }
  loop();

  return {
    destroy: () => {
      window.removeEventListener('mousemove', onMouseMove);
      gridOverlay?.removeEventListener('mousemove', onMove);
      gridOverlay?.removeEventListener('click',     onClick);
      gridOverlay?.removeEventListener('wheel',     onWheel);
      _destroyGlitch();
      destroyGrid();
    }
  };
}

// ─── Kademe 1: Proje kapak grid'i ─────────────────────────────────────────
function showProjectGrid(projects, onProjectClick) {
  const items = projects.map(proj => ({
    src:      proj.cover || null,
    label:    proj.title,
    sublabel: proj.year,
    data:     proj
  }));
  return buildGrid(items, onProjectClick);
}

// ─── Kademe 2: Proje fotoğraf grid'i ──────────────────────────────────────
function showPhotoGrid(project, onPhotoClick) {
  const imgs = project.images && project.images.length > 0
    ? project.images
    : Array.from({ length: 6 }, () => ({ src: null }));

  const items = imgs.map((img, i) => ({
    src:      img.src || null,
    label:    null,
    sublabel: null,
    data:     { index: i, project }
  }));

  return buildGrid(items, onPhotoClick);
}
