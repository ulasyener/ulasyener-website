// ─── 2.5D Kare Grid Sistemi ───────────────────────────────────────────────
// Kademe 1: showProjectGrid(projects, onProjectClick)
// Kademe 2: showPhotoGrid(project)

let gridAnimId   = null;
let gridOverlay  = null;

// ─── Sabitler ─────────────────────────────────────────────────────────────
const SCROLL_SPD  = 0.8;
const SCROLL_LERP = 0.1;
const LERP        = 0.09;

function destroyGrid() {
  if (gridAnimId)  { cancelAnimationFrame(gridAnimId); gridAnimId = null; }
  if (gridOverlay) { gridOverlay.remove(); gridOverlay = null; }
  document.querySelectorAll('.grid-label, .grid-info-panel').forEach(e => e.remove());
  // scene.js'e grid'in kapandığını bildir
  if (typeof setActiveGridState === 'function') setActiveGridState(null);
}

// ─── Scramble Text ────────────────────────────────────────────────────────
function gridScramble(el, finalText, duration = 1400) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const steps = Math.floor(duration / 60);
  let step = 0;
  const fixed = Array.from(finalText).map(c =>
    c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]
  );
  const iv = setInterval(() => {
    const revealed = Math.floor((step / steps) * finalText.length);
    let out = '';
    for (let i = 0; i < finalText.length; i++) {
      if (finalText[i] === ' ') { out += ' '; continue; }
      out += i < revealed ? finalText[i] : fixed[i];
    }
    el.textContent = out;
    step++;
    if (step > steps) { el.textContent = finalText; clearInterval(iv); }
  }, 60);
}

// ─── Çekirdek builder ─────────────────────────────────────────────────────
function buildGrid(items, onSelect) {
  destroyGrid();

  const W = window.innerWidth;
  const H = window.innerHeight;

  // ── Mobil responsive sabitler ─────────────────────────────────────────
  const IS_MOB    = W <= 768;
  const PER_ROW   = IS_MOB ? 1 : 3;
  const GAP       = IS_MOB ? 0.10 : 0.18;
  const TILE      = IS_MOB ? 1.4  : 2.8;
  const CAM_Z     = IS_MOB ? 5.0  : 7.5;
  const NAV_SAFE  = IS_MOB ? 120  : 235;
  const CLIP_SAFE = IS_MOB ? 60   : 120;
  const PLANE_ROT = IS_MOB ? 0.0  : 0.28;

  const gridScene = new THREE.Scene();
  const gridCam   = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);
  gridCam.position.set(0, 0, CAM_Z);
  gridCam.lookAt(0, 0, 0);

  // scene.js'teki animate()'e bu scene+camera'yı ver
  if (typeof setActiveGridState === 'function') {
    setActiveGridState({ scene: gridScene, camera: gridCam });
  }

  const loader = new THREE.TextureLoader();
  const meshes = [];
  const scales = {};
  let selected  = null;

  // ── Mouse paralaks ────────────────────────────────────────────────────
  let mouseNX = 0, mouseNY = 0;
  let smoothMX = 0, smoothMY = 0;
  const MOUSE_LERP  = 0.035;
  const CAM_ROT_MAX = IS_MOB ? 0.0 : 0.08;

  function onMouseMove(e) {
    mouseNX =  (e.clientX / window.innerWidth)  * 2 - 1;
    mouseNY = -(e.clientY / window.innerHeight) * 2 + 1;
  }
  window.addEventListener('mousemove', onMouseMove);

  // ── Scroll state ──────────────────────────────────────────────────────
  let scrollY      = 0;
  let scrollTarget = 0;

  const fovRad   = (50 * Math.PI) / 180;
  const visibleH = 2 * Math.tan(fovRad / 2) * CAM_Z;
  const visibleW = visibleH * (W / H);
  const navUnits = (NAV_SAFE / H) * visibleH;

  const ROWS      = Math.ceil(items.length / PER_ROW);
  const topEdge   = visibleH / 2;
  const startY    = topEdge - navUnits - TILE / 2;
  const gridH     = ROWS * TILE + (ROWS - 1) * GAP;
  const maxScroll = Math.max(0, gridH - (visibleH - navUnits) + TILE * 0.3);
  const scrollMax = maxScroll;

  const DEPTH   = 0.08;
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0x2a2825 });

  // ── Giriş animasyonu state ────────────────────────────────────────────
  const useIntro = items.length > 0 && items[0].intro === true;
  const INTRO_DURATION = 1400;
  const INTRO_STAGGER  = 80;
  let   introStartTime = useIntro ? performance.now() : null;
  let   introComplete  = !useIntro;

  const directions = [
    { x: -4,  y:  3, z: -4, rx:  0.3, ry: -0.5 },
    { x:  0,  y:  5, z: -5, rx:  0.5, ry:  0.0 },
    { x:  4,  y:  3, z: -4, rx:  0.3, ry:  0.5 },
    { x: -4,  y: -3, z: -4, rx: -0.3, ry: -0.5 },
    { x:  0,  y: -5, z: -5, rx: -0.5, ry:  0.0 },
    { x:  4,  y: -3, z: -4, rx: -0.3, ry:  0.5 },
    { x: -5,  y:  0, z: -6, rx:  0.2, ry: -0.7 },
    { x:  5,  y:  0, z: -6, rx: -0.2, ry:  0.7 },
    { x:  0,  y:  0, z: -8, rx:  0.2, ry:  0.3 },
  ];

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  items.forEach((item, i) => {
    const col      = i % PER_ROW;
    const row      = Math.floor(i / PER_ROW);
    const rowStart = row * PER_ROW;
    const rowCount = Math.min(PER_ROW, items.length - rowStart);
    const rowW     = rowCount * TILE + (rowCount - 1) * GAP;
    const rowStartX = -rowW / 2 + TILE / 2;
    const targetX = rowStartX + col * (TILE + GAP);
    const targetY = startY - row * (TILE + GAP);

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

    const mesh = new THREE.Mesh(geo, [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, edgeMat]);

    if (useIntro) {
      const dir = directions[i % directions.length];
      mesh.position.set(targetX + dir.x, targetY + dir.y, dir.z);
      mesh.rotation.set(dir.rx, dir.ry + PLANE_ROT, 0);
      mesh.userData = {
        item, index: i, baseY: targetY,
        targetX, targetY,
        startX: targetX + dir.x,
        startY: targetY + dir.y,
        startZ: dir.z,
        startRX: dir.rx, startRY: dir.ry + PLANE_ROT,
        staggerDelay: i * INTRO_STAGGER
      };
    } else {
      mesh.position.set(targetX, targetY, 0);
      mesh.rotation.y = PLANE_ROT;
      mesh.userData = { item, index: i, baseY: targetY, targetX, targetY, staggerDelay: 0 };
    }
    gridScene.add(mesh);
    meshes.push(mesh);
    scales[i] = 1;
  });

  // ── 3D Alt Bant (Label Band) ──────────────────────────────────────────
  const BAND_H   = 0.42;
  const BAND_Z   = DEPTH / 2 + 0.06;
  const CHARS    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const labelBands = [];
  const bandInited = new Set();

  function makeCanvasTex() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 80;
    const t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter;
    return { canvas: c, texture: t };
  }

  function drawBand(canvas, texture, title, sub, progress) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 80);

    ctx.fillStyle = 'rgba(218,215,210,0.90)';
    ctx.fillRect(0, 0, 512, 80);

    const sy = ((Date.now() % 1800) / 1800) * 80;
    const g  = ctx.createLinearGradient(0, sy-2, 0, sy+2);
    g.addColorStop(0,   'rgba(0,0,0,0)');
    g.addColorStop(0.5, 'rgba(0,0,0,0.07)');
    g.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, sy-2, 512, 4);

    const revCount = Math.ceil(progress * title.length);
    let display = '';
    for (let k = 0; k < title.length; k++) {
      if (title[k] === ' ') { display += ' '; continue; }
      display += k < revCount ? title[k] : (canvas._fixed || [])[k] || CHARS[0];
    }

    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.fillText(display, 16, 30);

    if (sub) {
      const subCount = Math.ceil(Math.max(0, progress * 2 - 1) * sub.length);
      ctx.font = '13px monospace';
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      ctx.fillText(sub.slice(0, subCount), 16, 54);
    }

    texture.needsUpdate = true;
  }

  meshes.forEach((mesh, i) => {
    const { item } = mesh.userData;
    if (!item.label) { labelBands.push(null); return; }

    const { canvas, texture } = makeCanvasTex();
    canvas._fixed = Array.from(item.label.toUpperCase()).map(c =>
      c === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]
    );

    const geo  = new THREE.PlaneGeometry(TILE, BAND_H);
    const mat  = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
    const band = new THREE.Mesh(geo, mat);
    const bandBaseY = mesh.userData.baseY - TILE / 2 - BAND_H / 2 - 0.18;
    band.position.set(mesh.position.x, bandBaseY, BAND_Z);
    band.rotation.y = PLANE_ROT;
    gridScene.add(band);

    labelBands.push({ band, canvas, texture, progress: 0, animating: false, bandBaseY,
                      title: item.label.toUpperCase(), sub: item.sublabel || '' });
  });

  function updateLabelBands() {
    const now = Date.now();
    labelBands.forEach((lb, i) => {
      if (!lb) return;
      const mesh = meshes[i];

      lb.band.position.x = mesh.position.x;
      lb.band.position.y = mesh.position.y - TILE / 2 - BAND_H / 2 - 0.18;
      lb.band.position.z = mesh.position.z + BAND_Z;
      lb.band.rotation.copy(mesh.rotation);
      lb.band.scale.x = mesh.scale.x;
      lb.band.scale.y = mesh.scale.y;

      if (!bandInited.has(i)) {
        const pos = mesh.position.clone().project(gridCam);
        const sy  = (-pos.y * 0.5 + 0.5) * H;
        if (sy > CLIP_SAFE && sy < H + 60) {
          bandInited.add(i);
          lb.animating = true;
          lb.startTime = now;
          lb.duration  = 1600;
        }
      }

      if (lb.animating) {
        lb.progress = Math.min(1, (now - lb.startTime) / lb.duration);
        if (lb.progress >= 1) lb.animating = false;
      }

      drawBand(lb.canvas, lb.texture, lb.title, lb.sub, lb.progress);
    });
  }

  // ── Overlay ───────────────────────────────────────────────────────────
  // clip-path artık bu overlay div'inde — canvas#c'ye dokunmuyoruz
  gridOverlay = document.createElement('div');
  gridOverlay.id = 'grid-overlay';
  gridOverlay.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;' +
    'z-index:102;cursor:default;' +
    'clip-path:inset(' + CLIP_SAFE + 'px 0 0 0);';
  document.body.appendChild(gridOverlay);

  // pointer olayları için üst kısımda (nav alanı) geçirgen bir div
  const navBlocker = document.createElement('div');
  navBlocker.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:' + NAV_SAFE + 'px;' +
    'z-index:103;pointer-events:none;';
  document.body.appendChild(navBlocker);

  // ── Raycaster ─────────────────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  const mouse     = new THREE.Vector2();

  function toNDC(e) {
    mouse.x =  (e.clientX / W) * 2 - 1;
    mouse.y = -(e.clientY  / H) * 2 + 1;
  }

  const hoverRotY  = {}, hoverRotX  = {};
  const smoothRotY = {}, smoothRotX = {};
  meshes.forEach((_, i) => {
    hoverRotY[i] = PLANE_ROT; hoverRotX[i] = 0;
    smoothRotY[i] = PLANE_ROT; smoothRotX[i] = 0;
  });
  let hoveredIndex = -1;

  function onMove(e) {
    toNDC(e);
    raycaster.setFromCamera(mouse, gridCam);
    const hits = raycaster.intersectObjects(meshes, false);
    gridOverlay.style.cursor = hits.length ? 'pointer' : 'default';
    if (hits.length) {
      const hit = hits[0], mesh = hit.object, idx = mesh.userData.index;
      hoveredIndex = idx;
      const uv = hit.uv;
      if (uv) {
        const lx = uv.x - 0.5, ly = uv.y - 0.5;
        hoverRotY[idx] = PLANE_ROT + lx * 0.52;
        hoverRotX[idx] = ly * -0.26;
      }
      if (!selected) scales[idx] = 1.06;
    } else {
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
    if (!introComplete) return;
    toNDC(e);
    raycaster.setFromCamera(mouse, gridCam);
    const hits = raycaster.intersectObjects(meshes);
    if (!hits.length) { deselect(); return; }
    const hit = hits[0].object;
    if (hit === selected) { deselect(); return; }
    selected = hit;
    meshes.forEach((m, i) => { scales[i] = m === hit ? 1.12 : 0.9; });
    if (onSelect) onSelect(hit.userData.item.data);
  }

  function deselect() {
    selected = null;
    meshes.forEach((_, i) => { scales[i] = 1; });
  }

  function onWheel(e) {
    e.preventDefault();
    scrollTarget += e.deltaY * 0.003 * SCROLL_SPD;
    const upLimit = navUnits * 0.15;
    scrollTarget = Math.max(-upLimit, Math.min(maxScroll, scrollTarget));
  }

  // ── LED Glitch ────────────────────────────────────────────────────────
  const GLITCH_SRCS = [
    'images/effects/ledglitch/01.mp4',
    'images/effects/ledglitch/02.mp4',
    'images/effects/ledglitch/03.mp4',
    'images/effects/ledglitch/04.mp4'
  ];
  const GLITCH_OPACITY = 0.5;

  const gifPool = GLITCH_SRCS.map(src => {
    const video = document.createElement('video');
    video.src = src; video.loop = true; video.muted = true;
    video.autoplay = true; video.playsInline = true;
    video.style.cssText = 'position:fixed;top:-9999px;left:-9999px;pointer-events:none;';
    document.body.appendChild(video);
    video.play().catch(() => {});
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return { video, texture };
  });

  function updateGifTextures() {
    gifPool.forEach(({ texture }) => { texture.needsUpdate = true; });
  }

  const glitchMeshes = meshes.map((mesh, i) => {
    const pool  = gifPool[i % gifPool.length];
    const geo   = new THREE.PlaneGeometry(TILE, TILE);
    const mat   = new THREE.MeshBasicMaterial({
      map: pool.texture, transparent: true,
      opacity: GLITCH_OPACITY, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const gMesh = new THREE.Mesh(geo, mat);
    gMesh.position.set(mesh.position.x, mesh.userData.baseY, DEPTH / 2 + 0.01);
    gridScene.add(gMesh);
    return gMesh;
  });

  function syncGlitchMeshes() {
    glitchMeshes.forEach((gMesh, i) => {
      const p = meshes[i];
      gMesh.position.copy(p.position);
      gMesh.position.z = p.position.z + DEPTH / 2 + 0.01;
      gMesh.rotation.copy(p.rotation);
      gMesh.scale.copy(p.scale);
    });
  }

  const _destroyGlitch = () => {
    glitchMeshes.forEach(gm => gridScene.remove(gm));
    gifPool.forEach(({ video, texture }) => {
      video.pause();
      if (document.body.contains(video)) video.remove();
      texture.dispose();
    });
    labelBands.forEach(lb => {
      if (!lb) return;
      gridScene.remove(lb.band);
      lb.texture.dispose();
    });
  };

  gridOverlay.addEventListener('mousemove', onMove);
  gridOverlay.addEventListener('click',     onClick);
  gridOverlay.addEventListener('wheel',     onWheel, { passive: false });

  // ── Touch desteği ─────────────────────────────────────────────────────
  let touchStartY = 0, touchLastY = 0, touchMoved = false;

  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    touchStartY = touchLastY = e.touches[0].clientY;
    touchMoved = false;
  }

  function onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length !== 1) return;
    const dy = touchLastY - e.touches[0].clientY;
    if (Math.abs(e.touches[0].clientY - touchStartY) > 8) touchMoved = true;
    scrollTarget += dy * 0.012 * SCROLL_SPD;
    scrollTarget  = Math.max(0, Math.min(maxScroll, scrollTarget));
    touchLastY    = e.touches[0].clientY;
    mouseNX = (e.touches[0].clientX / W) * 2 - 1;
    mouseNY = -(e.touches[0].clientY / H) * 2 + 1;
  }

  function onTouchEnd(e) {
    if (touchMoved) return;
    if (!introComplete) return;
    const touch = e.changedTouches[0];
    mouse.x =  (touch.clientX / W) * 2 - 1;
    mouse.y = -(touch.clientY / H) * 2 + 1;
    raycaster.setFromCamera(mouse, gridCam);
    const hits = raycaster.intersectObjects(meshes);
    if (!hits.length) { deselect(); return; }
    const hit = hits[0].object;
    if (hit === selected) { deselect(); return; }
    selected = hit;
    meshes.forEach((m, i) => { scales[i] = m === hit ? 1.12 : 0.9; });
    if (onSelect) onSelect(hit.userData.item.data);
  }

  gridOverlay.addEventListener('touchstart', onTouchStart, { passive: true });
  gridOverlay.addEventListener('touchmove',  onTouchMove,  { passive: false });
  gridOverlay.addEventListener('touchend',   onTouchEnd,   { passive: true });

  // ── State güncelleme loop'u (render scene.js'de) ──────────────────────
  function loop() {
    gridAnimId = requestAnimationFrame(loop);

    smoothMX += (mouseNX - smoothMX) * MOUSE_LERP;
    smoothMY += (mouseNY - smoothMY) * MOUSE_LERP;
    scrollY  += (scrollTarget - scrollY) * SCROLL_LERP;

    const camX = smoothMX * CAM_ROT_MAX * -1.2;
    const camY = smoothMY * CAM_ROT_MAX *  0.6;
    gridCam.position.set(camX, camY, CAM_Z);
    gridCam.lookAt(0, 0, 0);

    meshes.forEach((m, i) => {
      const ud  = m.userData;
      const now = performance.now();

      if (!introComplete) {
        const elapsed = now - introStartTime - ud.staggerDelay;
        if (elapsed < 0) {
          m.position.set(ud.startX, ud.startY + scrollY, ud.startZ);
          m.rotation.set(ud.startRX, ud.startRY, 0);
          return;
        }
        const t = Math.min(1, elapsed / INTRO_DURATION);
        const e = easeOut(t);

        m.position.x = ud.startX + (ud.targetX - ud.startX) * e;
        m.position.y = ud.startY + (ud.targetY - ud.startY) * e + scrollY;
        m.position.z = ud.startZ * (1 - e);
        m.rotation.x = ud.startRX * (1 - e) + (smoothMY * -0.04) * e;
        m.rotation.y = ud.startRY + (PLANE_ROT - ud.startRY) * e + (smoothMX * -0.08) * e;

        const lastDone = now - introStartTime - (meshes.length - 1) * INTRO_STAGGER;
        if (lastDone > INTRO_DURATION) introComplete = true;
      } else {
        m.position.y = ud.baseY + scrollY;
        smoothRotY[i] += (hoverRotY[i] - smoothRotY[i]) * 0.08;
        smoothRotX[i] += (hoverRotX[i] - smoothRotX[i]) * 0.08;
        m.rotation.y = smoothRotY[i] + smoothMX * -0.08;
        m.rotation.x = smoothRotX[i] + smoothMY * -0.04;
      }

      m.scale.x += (scales[i] - m.scale.x) * LERP;
      m.scale.y += (scales[i] - m.scale.y) * LERP;
    });

    // render scene.js/animate()'den geliyor — burada sadece state güncellenir
    updateGifTextures();
    syncGlitchMeshes();
    updateLabelBands();
  }
  loop();

  return {
    destroy: () => {
      window.removeEventListener('mousemove', onMouseMove);
      gridOverlay?.removeEventListener('mousemove',  onMove);
      gridOverlay?.removeEventListener('click',      onClick);
      gridOverlay?.removeEventListener('wheel',      onWheel);
      gridOverlay?.removeEventListener('touchstart', onTouchStart);
      gridOverlay?.removeEventListener('touchmove',  onTouchMove);
      gridOverlay?.removeEventListener('touchend',   onTouchEnd);
      if (navBlocker && document.body.contains(navBlocker)) navBlocker.remove();
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
    data:     proj,
    intro:    true
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
    data:     { index: i, project },
    intro:    false
  }));

  return buildGrid(items, onPhotoClick);
}
