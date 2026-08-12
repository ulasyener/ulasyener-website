// ─── Name Forest — 3D text totems planted on the terrain, click-drag freeflight ──
// Standalone THREE.Group layer, same show()/hide()/update() pattern as
// portraitField.js. Reuses portraitField.js's point-cloud shader as-is via
// window.PortraitField.buildPortrait() for the per-person popup portrait —
// no shader code is duplicated here. See fremde/nameforest_brief_2026-08-10.md.
(function () {
  const PEOPLE_JSON_URL = 'data/people.json';
  // Google's own Space Grotesk source (OFL) — same family used site-wide (css2?family=Space+Grotesk).
  // Converted to a THREE.Font at runtime via opentype.js because none of three.js's bundled
  // typeface.json example fonts include Turkish (ş ğ ı İ ü ö ç) glyphs.
  const SPACE_GROTESK_TTF_URL = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf';
  const FALLBACK_FONT_URL = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_regular.typeface.json';

  // ─── Placement (brief §2 default spread) ─────────────────────────────────
  const Z_MAX = 60;     // TERRAIN_LOOP_START in scene.js
  const Z_MIN = -280;   // TERRAIN_LOOP_THRESHOLD in scene.js
  const X_HALF = 90;
  const MIN_DIST = 20;

  // ─── Totem geometry ───────────────────────────────────────────────────────
  const TEXT_SIZE = 3.4;
  const TEXT_DEPTH = 0.4;
  const TRUNK_HEIGHT = 5;
  const TRUNK_RADIUS_TOP = 0.11;
  const TRUNK_RADIUS_BOTTOM = 0.18;
  const YAW_FOLLOW_LERP = 0.06;

  // ─── Crop field (brief §2b) ────────────────────────────────────────────────
  const IS_MOB = window.innerWidth <= 768;
  const CROP_COUNT = IS_MOB ? 8000 : 24000;
  const CROP_DENSE_RATIO = 0.4;
  const CROP_DENSE_RADIUS = 12;
  const HEIGHT_GRID_COLS = 24;
  const HEIGHT_GRID_ROWS = 18;

  // ─── Camera freeflight ─────────────────────────────────────────────────────
  const YAW_SPEED = 0.0028;
  const PITCH_SPEED = 0.0022;
  const PITCH_LIMIT = 0.62;
  const DRAG_MOVE_SPEED = 0.012;
  const DRAG_MOVE_MAX = 0.7;
  const CLICK_DRAG_THRESHOLD = 6; // px — below this, pointerup is treated as a click

  let group = null;          // totems + crop field
  let generation = 0;
  let people = null;
  let font = null;
  let placements = [];       // { id, name, x, y, z, hitMesh, textPivot, textMesh, highlighted }
  let hitMeshes = [];
  let raycaster = new THREE.Raycaster();
  let ndc = new THREE.Vector2();
  let hovered = null;

  let sharedTextMaterial, hoverTextMaterial, trunkMaterial, bladeGeometry;

  // camera state (owned entirely by NameForest while active — see scene.js's
  // window.__driftPaused gate)
  let yaw = 0, pitch = 0;
  let dragging = false, dragMoveSpeed = 0, dragDist = 0, lastX = 0, lastY = 0;

  // popup / selection
  let panelEl = null;
  let selectedGroup = null;   // single lazy-loaded PortraitField point-cloud
  let selectedGeneration = 0;
  let camTween = null;        // { fromPos, toPos, fromLook, toLook, t0, dur }

  // ─── Data / font loading ────────────────────────────────────────────────
  function loadPeople() {
    if (people) return Promise.resolve(people);
    return fetch(PEOPLE_JSON_URL).then(r => r.json()).then(data => { people = data; return data; });
  }

  // builds a minimal THREE.Font typeface JSON containing only the glyphs actually
  // used, from a real .ttf, via opentype.js — see facetype.js for the format this mirrors
  function buildTypefaceFont(otFont, chars) {
    const unitsPerEm = otFont.unitsPerEm;
    const glyphs = {};
    chars.forEach(ch => {
      const glyph = otFont.charToGlyph(ch);
      if (!glyph) return;
      const path = glyph.getPath(0, 0, unitsPerEm);
      let o = '';
      path.commands.forEach(c => {
        switch (c.type) {
          case 'M': o += 'm ' + c.x + ' ' + c.y + ' '; break;
          case 'L': o += 'l ' + c.x + ' ' + c.y + ' '; break;
          case 'Q': o += 'q ' + c.x1 + ' ' + c.y1 + ' ' + c.x + ' ' + c.y + ' '; break;
          case 'C': o += 'b ' + c.x1 + ' ' + c.y1 + ' ' + c.x2 + ' ' + c.y2 + ' ' + c.x + ' ' + c.y + ' '; break;
          case 'Z': o += 'z '; break;
        }
      });
      glyphs[ch] = { ha: glyph.advanceWidth, o: o };
    });
    return new THREE.Font({
      glyphs: glyphs,
      familyName: 'Space Grotesk',
      resolution: unitsPerEm,
      boundingBox: { yMin: otFont.tables.head.yMin, yMax: otFont.tables.head.yMax },
      underlineThickness: Math.round(unitsPerEm * 0.02)
    });
  }

  function collectCharset(peopleData) {
    const set = new Set([' ', '?']);
    peopleData.forEach(p => { for (const ch of p.name) set.add(ch); });
    return Array.from(set);
  }

  function loadFallbackFont() {
    return new Promise((resolve, reject) => {
      new THREE.FontLoader().load(FALLBACK_FONT_URL, f => resolve(f), undefined, reject);
    });
  }

  function loadFont(peopleData) {
    if (font) return Promise.resolve(font);
    const chars = collectCharset(peopleData);
    if (!window.opentype) return loadFallbackFont().then(f => { font = f; return f; });
    // fetch + opentype.parse (not opentype.load) — opentype.load's own async
    // wrapper never resolves in this environment (silent hang), parse() is fine
    return fetch(SPACE_GROTESK_TTF_URL)
      .then(r => r.arrayBuffer())
      .then(buf => buildTypefaceFont(opentype.parse(buf), chars))
      .catch(() => null)
      .then(f => f || loadFallbackFont())
      .then(f => { font = f; return f; });
  }

  function waitForTerrain(maxMs) {
    return new Promise(resolve => {
      const t0 = performance.now();
      (function poll() {
        if (window.TerrainRoot || performance.now() - t0 > maxMs) { resolve(window.TerrainRoot || null); return; }
        setTimeout(poll, 150);
      })();
    });
  }

  // ─── Placement helpers ──────────────────────────────────────────────────
  function poissonPoints(n) {
    const pts = [];
    let attempts = 0;
    while (pts.length < n && attempts < 6000) {
      attempts++;
      const x = (Math.random() * 2 - 1) * X_HALF;
      const z = Z_MIN + Math.random() * (Z_MAX - Z_MIN);
      let ok = true;
      for (let i = 0; i < pts.length; i++) {
        const dx = pts[i].x - x, dz = pts[i].z - z;
        if (dx * dx + dz * dz < MIN_DIST * MIN_DIST) { ok = false; break; }
      }
      if (ok) pts.push({ x, z });
    }
    while (pts.length < n) {
      pts.push({ x: (Math.random() * 2 - 1) * X_HALF, z: Z_MIN + Math.random() * (Z_MAX - Z_MIN) });
    }
    return pts;
  }

  function raycastGroundY(x, z, fallback) {
    if (!window.TerrainRoot) return fallback;
    raycaster.set(new THREE.Vector3(x, 500, z), new THREE.Vector3(0, -1, 0));
    raycaster.far = 2000;
    const hits = raycaster.intersectObject(window.TerrainRoot, true);
    return hits.length ? hits[0].point.y : fallback;
  }

  // like raycastGroundY but also returns the surface normal (world space) so
  // totems can stand perpendicular to a sloped terrain instead of always
  // pointing world-up
  const WORLD_UP = new THREE.Vector3(0, 1, 0);
  function raycastGround(x, z, fallbackY) {
    if (!window.TerrainRoot) return { y: fallbackY, normal: WORLD_UP.clone() };
    raycaster.set(new THREE.Vector3(x, 500, z), new THREE.Vector3(0, -1, 0));
    raycaster.far = 2000;
    const hits = raycaster.intersectObject(window.TerrainRoot, true);
    if (!hits.length) return { y: fallbackY, normal: WORLD_UP.clone() };
    const hit = hits[0];
    let normal = WORLD_UP.clone();
    if (hit.face) {
      normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
      if (normal.y < 0) normal.negate(); // face winding can give the underside normal
    }
    return { y: hit.point.y, normal: normal };
  }

  // coarse height grid + bilinear lookup — used by the crop field so we don't
  // raycast per-blade (thousands of casts against the terrain mesh would be slow)
  function buildHeightSampler(fallbackY) {
    const grid = [];
    for (let j = 0; j <= HEIGHT_GRID_ROWS; j++) {
      const row = [];
      const z = Z_MIN + (Z_MAX - Z_MIN) * (j / HEIGHT_GRID_ROWS);
      for (let i = 0; i <= HEIGHT_GRID_COLS; i++) {
        const x = -X_HALF + (2 * X_HALF) * (i / HEIGHT_GRID_COLS);
        row.push(raycastGroundY(x, z, fallbackY));
      }
      grid.push(row);
    }
    return function sample(x, z) {
      const u = THREE.MathUtils.clamp((x + X_HALF) / (2 * X_HALF), 0, 1);
      const v = THREE.MathUtils.clamp((z - Z_MIN) / (Z_MAX - Z_MIN), 0, 1);
      const fx = u * HEIGHT_GRID_COLS, fz = v * HEIGHT_GRID_ROWS;
      const ix = Math.floor(fx), iz = Math.floor(fz);
      const tx = fx - ix, tz = fz - iz;
      const ix1 = Math.min(ix + 1, HEIGHT_GRID_COLS), iz1 = Math.min(iz + 1, HEIGHT_GRID_ROWS);
      const h00 = grid[iz][ix], h10 = grid[iz][ix1], h01 = grid[iz1][ix], h11 = grid[iz1][ix1];
      return (h00 * (1 - tx) + h10 * tx) * (1 - tz) + (h01 * (1 - tx) + h11 * tx) * tz;
    };
  }

  // ─── Totem construction ─────────────────────────────────────────────────
  function buildTotem(person, groundY, groundNormal) {
    // the totem group itself stays world-aligned so the name always stands upright
    // (readable, not leaning) — only the trunk below tilts to plant perpendicular
    // into a sloped terrain surface, like a tree trunk rooting into a hillside
    const g = new THREE.Group();
    g.position.set(person.x, groundY, person.z);
    const normal = groundNormal || WORLD_UP;

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(TRUNK_RADIUS_TOP, TRUNK_RADIUS_BOTTOM, TRUNK_HEIGHT, 6),
      trunkMaterial
    );
    trunk.quaternion.setFromUnitVectors(WORLD_UP, normal);
    trunk.position.copy(normal).multiplyScalar(TRUNK_HEIGHT / 2);
    g.add(trunk);

    const textGeo = new THREE.TextGeometry(person.name, {
      font: font, size: TEXT_SIZE, height: TEXT_DEPTH,
      curveSegments: 3, bevelEnabled: false
    });
    textGeo.computeBoundingBox();
    const bbox = textGeo.boundingBox;
    const w = bbox.max.x - bbox.min.x;
    textGeo.translate(-(bbox.min.x + w / 2), -bbox.min.y, -TEXT_DEPTH / 2);

    const textMesh = new THREE.Mesh(textGeo, sharedTextMaterial);

    const textPivot = new THREE.Group();
    textPivot.position.y = TRUNK_HEIGHT; // world-up offset — stands upright regardless of slope
    textPivot.add(textMesh);
    g.add(textPivot);

    // invisible wider hit target — the extruded text alone is too thin to click reliably
    const hitMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(Math.max(w, TEXT_SIZE) * 0.65, Math.max(w, TEXT_SIZE) * 0.65, TRUNK_HEIGHT + TEXT_SIZE * 1.4, 8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitMesh.position.y = (TRUNK_HEIGHT + TEXT_SIZE * 1.4) / 2;
    hitMesh.userData.personId = person.id;
    g.add(hitMesh);

    return { group: g, textPivot, textMesh, hitMesh };
  }

  // ─── Crop field ──────────────────────────────────────────────────────────
  function buildBladeGeometry() {
    const w = 0.55, h = 1.0;
    const positions = new Float32Array([
      -w / 2, 0, 0,
       w / 2, 0, 0,
      -w / 8, h, 0,
       w / 8, h, 0
    ]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setIndex([0, 1, 3, 0, 3, 2]);
    geo.computeVertexNormals();
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, h / 2, 0), h);
    return geo;
  }

  function buildCropMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uWindStrength: { value: 0.4 },
        uColorBase: { value: new THREE.Color(0x9a9440) },  // Olive
        uColorTip: { value: new THREE.Color(0xc9a227) }    // Steppe Mustard (brand)
      },
      vertexShader: window.SNOISE_GLSL + `
        uniform float uTime;
        uniform float uWindStrength;
        attribute float aPhase;
        varying float vH;
        void main() {
          vH = position.y;
          vec3 transformed = position;
          float sway = snoise(vec3(aPhase * 3.1, uTime * 0.55, 0.0));
          float sway2 = snoise(vec3(aPhase * 3.1 + 50.0, uTime * 0.42, 0.0));
          transformed.x += sway * uWindStrength * transformed.y;
          transformed.z += sway2 * uWindStrength * 0.6 * transformed.y;
          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(transformed, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorBase;
        uniform vec3 uColorTip;
        varying float vH;
        void main() {
          gl_FragColor = vec4(mix(uColorBase, uColorTip, clamp(vH, 0.0, 1.0)), 1.0);
        }
      `,
      side: THREE.DoubleSide
    });
  }

  function buildCropPositions() {
    const pts = [];
    const denseTotal = Math.floor(CROP_COUNT * CROP_DENSE_RATIO);
    const perName = placements.length ? Math.max(1, Math.floor(denseTotal / placements.length)) : 0;
    placements.forEach(p => {
      for (let i = 0; i < perName; i++) {
        const r = CROP_DENSE_RADIUS * Math.sqrt(Math.random());
        const th = Math.random() * Math.PI * 2;
        pts.push({ x: p.x + Math.cos(th) * r, z: p.z + Math.sin(th) * r });
      }
    });
    const sparseTotal = CROP_COUNT - pts.length;
    for (let i = 0; i < sparseTotal; i++) {
      pts.push({ x: (Math.random() * 2 - 1) * X_HALF, z: Z_MIN + Math.random() * (Z_MAX - Z_MIN) });
    }
    return pts;
  }

  function buildCropField(heightSampler) {
    const positions = buildCropPositions();
    const geo = bladeGeometry;
    const material = buildCropMaterial();
    const mesh = new THREE.InstancedMesh(geo, material, positions.length);
    const dummy = new THREE.Object3D();
    const phases = new Float32Array(positions.length);
    for (let i = 0; i < positions.length; i++) {
      const p = positions[i];
      const y = heightSampler(p.x, p.z);
      const s = 0.6 + Math.random() * 0.9;
      dummy.position.set(p.x, y, p.z);
      dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
      dummy.scale.set(s, s * (0.8 + Math.random() * 0.6), s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      phases[i] = Math.random() * Math.PI * 2;
    }
    mesh.instanceMatrix.needsUpdate = true;
    geo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1));
    mesh.userData.material = material;
    return mesh;
  }

  // ─── Popup panel (DOM) ───────────────────────────────────────────────────
  function ensurePanelStyles() {
    if (document.getElementById('nf-styles')) return;
    const style = document.createElement('style');
    style.id = 'nf-styles';
    style.textContent = `
      .nf-panel{position:fixed;right:24px;bottom:24px;width:320px;max-width:calc(100vw - 48px);
        background:rgba(236,233,225,0.96);color:#222A2A;font-family:'DM Mono',monospace;
        border:1px solid rgba(34,42,42,0.14);padding:22px 22px 24px;box-sizing:border-box;z-index:800;
        box-shadow:0 12px 40px rgba(0,0,0,0.28);}
      .nf-close{position:absolute;top:10px;right:12px;background:none;border:none;font-size:16px;
        color:#6D7A79;cursor:pointer;line-height:1;}
      .nf-close:hover{color:#222A2A;}
      .nf-kicker{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#3E5F8A;}
      .nf-name{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:22px;
        letter-spacing:-.01em;margin:6px 0 2px;text-transform:uppercase;line-height:1.05;}
      .nf-role{font-size:12px;color:#6D7A79;margin-bottom:14px;min-height:1.4em;}
      .nf-meta{width:100%;border-collapse:collapse;font-size:11.5px;margin-bottom:6px;}
      .nf-meta tr{border-top:1px solid rgba(34,42,42,0.1);}
      .nf-meta tr:first-child{border-top:none;}
      .nf-meta td{padding:6px 0;vertical-align:top;}
      .nf-meta td:first-child{color:#6D7A79;text-transform:uppercase;letter-spacing:.06em;width:70px;font-size:10px;}
      .nf-sec{font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:#6D7A79;
        margin:14px 0 6px;padding-top:12px;border-top:1px solid rgba(34,42,42,0.1);}
      .nf-note{font-size:12.5px;line-height:1.6;color:#3a4444;}
      .nf-todo{color:rgba(34,42,42,0.4);font-style:italic;}
    `;
    document.head.appendChild(style);
  }

  function buildPanel() {
    ensurePanelStyles();
    const el = document.createElement('div');
    el.className = 'nf-panel';
    el.hidden = true;
    el.innerHTML =
      '<button class="nf-close" aria-label="Close">&times;</button>' +
      '<div class="nf-kicker">PERSON</div>' +
      '<h2 class="nf-name"></h2>' +
      '<div class="nf-role"></div>' +
      '<table class="nf-meta"><tr><td>Born</td><td class="nf-born"></td></tr></table>' +
      '<div class="nf-sec">Note</div>' +
      '<div class="nf-note"></div>';
    document.body.appendChild(el);
    el.querySelector('.nf-close').addEventListener('click', closeSelection);
    return el;
  }

  function fillOrTodo(val) {
    return val && val.trim() ? val : '<span class="nf-todo">— TODO —</span>';
  }

  function openPanelFor(person) {
    if (!panelEl) panelEl = buildPanel();
    panelEl.querySelector('.nf-name').textContent = person.name;
    panelEl.querySelector('.nf-role').innerHTML = fillOrTodo(person.role);
    panelEl.querySelector('.nf-born').innerHTML = fillOrTodo(person.born);
    panelEl.querySelector('.nf-note').innerHTML = fillOrTodo(person.note);
    panelEl.hidden = false;
  }

  function closeSelection() {
    if (panelEl) panelEl.hidden = true;
    selectedGeneration++;
    if (selectedGroup) {
      if (window.PortraitField && typeof window.PortraitField.disposeGroup === 'function') {
        window.PortraitField.disposeGroup(selectedGroup);
      }
      scene.remove(selectedGroup);
      selectedGroup = null;
    }
  }

  function selectPerson(placement) {
    closeSelection();
    const myGen = ++selectedGeneration;
    openPanelFor(placement);

    // camera tween toward the totem
    const dirToCam = camera.position.clone().sub(new THREE.Vector3(placement.x, placement.y, placement.z));
    dirToCam.y = 0;
    if (dirToCam.lengthSq() < 0.01) dirToCam.set(0, 0, 1);
    dirToCam.normalize();
    const toPos = new THREE.Vector3(placement.x, placement.y + 9, placement.z).addScaledVector(dirToCam, 16);
    const toLook = new THREE.Vector3(placement.x, placement.y + 6, placement.z);
    camTween = {
      fromPos: camera.position.clone(),
      toPos: toPos,
      fromYaw: yaw, fromPitch: pitch,
      toLook: toLook,
      t0: performance.now(), dur: 700
    };

    const personData = placement.data;
    if (window.PortraitField && typeof window.PortraitField.buildPortrait === 'function') {
      window.PortraitField.buildPortrait(personData.id, personData.aspect).then(portraitGroup => {
        if (myGen !== selectedGeneration) {
          if (window.PortraitField.disposeGroup) window.PortraitField.disposeGroup(portraitGroup);
          return;
        }
        portraitGroup.position.set(
          placement.x + dirToCam.x * 6,
          placement.y + 9,
          placement.z + dirToCam.z * 6
        );
        scene.add(portraitGroup);
        selectedGroup = portraitGroup;
      }).catch(() => {});
    }
  }

  // ─── Hover / click raycasting ────────────────────────────────────────────
  function updateNdc(e, canvas) {
    const r = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  }

  function pickTotem() {
    raycaster.setFromCamera(ndc, camera);
    raycaster.far = 2000;
    const hits = raycaster.intersectObjects(hitMeshes, false);
    return hits.length ? placements.find(p => p.hitMesh === hits[0].object) : null;
  }

  function setHover(p) {
    if (hovered === p) return;
    if (hovered) {
      hovered.textMesh.material = sharedTextMaterial;
      hovered.textPivot.scale.setScalar(1);
    }
    hovered = p;
    if (hovered) {
      hovered.textMesh.material = hoverTextMaterial;
      hovered.textPivot.scale.setScalar(1.12);
    }
  }

  // ─── Pointer handlers (click-drag freeflight, brief §4) ──────────────────
  function onPointerDown(e) {
    dragging = true; dragDist = 0; lastX = e.clientX; lastY = e.clientY;
  }
  function onPointerMove(e) {
    const canvas = renderer.domElement;
    updateNdc(e, canvas);
    if (dragging) {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      dragDist += Math.abs(dx) + Math.abs(dy);
      lastX = e.clientX; lastY = e.clientY;
      yaw -= dx * YAW_SPEED;
      pitch = THREE.MathUtils.clamp(pitch - dy * PITCH_SPEED, -PITCH_LIMIT, PITCH_LIMIT);
      dragMoveSpeed = THREE.MathUtils.clamp(-dy * DRAG_MOVE_SPEED, -DRAG_MOVE_MAX, DRAG_MOVE_MAX);
    } else {
      dragMoveSpeed = 0;
    }
    const hit = camTween ? null : pickTotem();
    setHover(hit);
    canvas.style.cursor = hit ? 'pointer' : (dragging ? 'grabbing' : 'grab');
  }
  function onPointerUp(e) {
    dragging = false; dragMoveSpeed = 0;
    if (dragDist < CLICK_DRAG_THRESHOLD) {
      updateNdc(e, renderer.domElement);
      const hit = pickTotem();
      if (hit) selectPerson(hit);
    }
  }
  function onKeyDown(e) {
    if (e.key === 'Escape') closeSelection();
  }

  function attachControls() {
    const canvas = renderer.domElement;
    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    document.addEventListener('keydown', onKeyDown);
  }
  function detachControls() {
    const canvas = renderer.domElement;
    canvas.style.cursor = '';
    canvas.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('keydown', onKeyDown);
  }

  // ─── show / hide / update ────────────────────────────────────────────────
  function show() {
    if (group) return;
    if (typeof scene === 'undefined' || typeof camera === 'undefined' || typeof renderer === 'undefined') return;

    generation++;
    const myGen = generation;
    group = new THREE.Group();
    placements = [];
    hitMeshes = [];
    yaw = 0; pitch = 0; dragging = false; dragMoveSpeed = 0; camTween = null;
    window.__driftPaused = true;

    Promise.all([loadPeople(), waitForTerrain(8000)]).then(([peopleData]) =>
      loadFont(peopleData).then(() => peopleData)
    ).then(peopleData => {
      if (myGen !== generation) return;

      sharedTextMaterial = new THREE.MeshStandardMaterial({ color: 0x222a2a, roughness: 0.85, metalness: 0 });
      hoverTextMaterial = new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.6, metalness: 0 });
      trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x6d7a79, roughness: 0.9, metalness: 0 });
      bladeGeometry = buildBladeGeometry();

      const spots = poissonPoints(peopleData.length);
      peopleData.forEach((person, i) => {
        const spot = spots[i];
        const ground = raycastGround(spot.x, spot.z, -18);
        const y = ground.y;
        const totem = buildTotem({ ...spot, name: person.name }, y, ground.normal);
        group.add(totem.group);
        hitMeshes.push(totem.hitMesh);
        placements.push({
          id: person.id, name: person.name, data: person,
          x: spot.x, y: y, z: spot.z,
          textPivot: totem.textPivot, textMesh: totem.textMesh, hitMesh: totem.hitMesh
        });
      });

      const heightSampler = buildHeightSampler(-18);
      const cropMesh = buildCropField(heightSampler);
      group.add(cropMesh);

      scene.add(group);
      attachControls();
    });
  }

  function hide() {
    generation++;
    window.__driftPaused = false;
    detachControls();
    closeSelection();
    if (group) {
      const g = group;
      group = null;
      scene.remove(g);
      g.traverse(obj => {
        if (obj.geometry && obj.geometry !== bladeGeometry) obj.geometry.dispose();
        if (obj.material && obj.material.dispose && obj.material !== sharedTextMaterial &&
            obj.material !== hoverTextMaterial && obj.material !== trunkMaterial) {
          obj.material.dispose();
        }
      });
    }
    placements = [];
    hitMeshes = [];
    hovered = null;
  }

  function update() {
    if (!group) return;
    const t = performance.now() / 1000;

    group.children.forEach(child => {
      if (child.userData && child.userData.material) child.userData.material.uniforms.uTime.value = t;
    });

    placements.forEach(p => {
      const dx = camera.position.x - p.textPivot.parent.position.x;
      const dz = camera.position.z - p.textPivot.parent.position.z;
      const targetYaw = Math.atan2(dx, dz) + Math.PI; // TextGeometry's readable face normal is -Z
      let diff = targetYaw - p.textPivot.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      p.textPivot.rotation.y += diff * YAW_FOLLOW_LERP;
    });

    if (selectedGroup && selectedGroup.userData && selectedGroup.userData.materials) {
      selectedGroup.userData.materials.forEach(m => { m.uniforms.uTime.value = t; });
    }

    if (camTween) {
      const dt = performance.now() - camTween.t0;
      const k = THREE.MathUtils.clamp(dt / camTween.dur, 0, 1);
      const ek = 1 - Math.pow(1 - k, 3); // ease-out cubic
      camera.position.lerpVectors(camTween.fromPos, camTween.toPos, ek);
      camera.lookAt(camTween.toLook);
      if (k >= 1) camTween = null;
    } else {
      const forward = new THREE.Vector3(
        Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        -Math.cos(yaw) * Math.cos(pitch)
      );
      if (dragging && dragMoveSpeed) camera.position.addScaledVector(forward, dragMoveSpeed);
      camera.position.y = THREE.MathUtils.clamp(camera.position.y, 6, 90);
      camera.lookAt(camera.position.clone().add(forward));
    }
  }

  window.NameForest = { show, hide, update };
})();
