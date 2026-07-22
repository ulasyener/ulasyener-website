// ─── Portrait Field — ghost/smoke depth point-cloud portraits ─────────────
// Academic > Archive (#academic/archive) sayfasına özel, statik bir içerik
// katmanı. Site'nin var olan terrain/kamera arkaplanına dokunmaz — bu sadece
// scene'e eklenip çıkarılan ayrı bir THREE.Group.
//
// Kaynak: comfyui/portrait_field_prototype.html'de onaylanmış shader
// (noise-driven scatter/regroup) + Ulaş'ın bu tur istediği düzeltme: cream
// arkaplanda AdditiveBlending sadece aydınlatabildiği için yüzler beyaza
// gömülüyordu — çekirdek katman NormalBlending + gerçek karartma (uDarken<1)
// ile koyu-gri okunaklı hale getirildi, glow katmanı ince bir hale olarak
// üstte kaldı. Navigasyon/WASD/otomatik uçuş/bilgi paneli YOK, sadece statik
// obje + kendi ambient animasyonu.
(function () {
  const PORTRAIT_BASE = 'images/portraits/';

  const SCATTER_AMOUNT = 0.55;
  const SCATTER_SPEED  = 0.64; // 0.8 * 0.8 -- Ulaş'ın isteğiyle genel animasyon hızı %20 azaltıldı
  const DEPTH_SCALE     = 3.2;
  const BG_THRESHOLD    = 0.22;
  const REF_DIST        = 70.0; // uPointSize'ın referans aldığı mesafe (site'nin kamera ölçeğine göre)

  // tek paylaşılan geometri (birim kare, 1:1) — her portrenin gerçek aspect'i
  // geometri değil, group.scale ile uygulanıyor (39 ayrı buffer yerine tek
  // buffer + daha yüksek nokta yoğunluğu mümkün oluyor)
  const GRID_COLS = 260, GRID_ROWS = 220;
  const PLANE_SIZE = 18; // portrait_field_prototype.html'deki onaylı 3x ölçekle aynı

  const PEOPLE = [
    { id: 'adaletagaoglu', aspect: 1.5023 },
    { id: 'arasoren', aspect: 1.5023 },
    { id: 'asikihsani', aspect: 0.6625 },
    { id: 'asikmahzuniserif', aspect: 1.0 },
    { id: 'aziznesin', aspect: 1.7827 },
    { id: 'cemkaraca', aspect: 0.8422 },
    { id: 'dursunakcam', aspect: 0.8031 },
    { id: 'edipcansever', aspect: 0.7141 },
    { id: 'eminesevgiozdamar', aspect: 1.7778 },
    { id: 'fakirbaykurt', aspect: 1.7827 },
    { id: 'fazilhusnudaglarca', aspect: 0.8656 },
    { id: 'fuatsaka', aspect: 1.0 },
    { id: 'halitrefig', aspect: 0.8344 },
    { id: 'hasanhuseyinkorkmazgil', aspect: 0.8 },
    { id: 'ihsanguvercin', aspect: 1.7778 },
    { id: 'johnberger', aspect: 0.6453 },
    { id: 'kadirinanir', aspect: 1.0 },
    { id: 'kemalsunal', aspect: 1.1963 },
    { id: 'melikedemirag', aspect: 0.6656 },
    { id: 'nazimhikmet', aspect: 0.7625 },
    { id: 'nevzatustun', aspect: 0.7406 },
    { id: 'orhantaylan', aspect: 1.7778 },
    { id: 'ozanatacanani', aspect: 1.7778 },
    { id: 'rahmisaltuk', aspect: 0.5625 },
    { id: 'rifatilgaz', aspect: 1.5023 },
    { id: 'ruhisu', aspect: 1.7778 },
    { id: 'sahturna', aspect: 1.7778 },
    { id: 'sanaryurdatapan', aspect: 1.7778 },
    { id: 'seldabagcan', aspect: 0.6953 },
    { id: 'serifgoren', aspect: 0.9141 },
    { id: 'sumeyracakir', aspect: 1.6 },
    { id: 'tahsinincirci', aspect: 1.0016 },
    { id: 'tuncelkurtiz', aspect: 0.6656 },
    { id: 'tuncokan', aspect: 1.7778 },
    { id: 'turgutuyar', aspect: 0.7172 },
    { id: 'turkansoray', aspect: 1.7778 },
    { id: 'yilmazguney', aspect: 0.6656 },
    { id: 'yukselpazarkaya', aspect: 0.75 },
    { id: 'zulfulivaneli', aspect: 0.7453 }
  ];

  // classic Ashima/webgl-noise 3D simplex noise — public domain, prototipten aynen alındı
  const GLSL_NOISE = `
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2  C = vec2(1.0/6.0, 1.0/3.0);
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod289(i);
      vec4 p = permute( permute( permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0));

      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);

      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 hh = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);

      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(hh, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

      vec3 p0 = vec3(a0.xy, hh.x);
      vec3 p1 = vec3(a0.zw, hh.y);
      vec3 p2 = vec3(a1.xy, hh.z);
      vec3 p3 = vec3(a1.zw, hh.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
  `;

  const VERTEX_SHADER = GLSL_NOISE + `
    uniform sampler2D uDepth;
    uniform float uDepthScale;
    uniform float uPointSize;
    uniform float uSizeMul;
    uniform float uPixelRatio;
    uniform float uTime;
    uniform float uScatterAmount;
    uniform float uScatterSpeed;
    uniform float uRefDist;
    uniform float uEdgeWander;
    varying vec2 vUv;
    varying float vDepth;

    void main() {
      vUv = uv;
      float d = texture2D(uDepth, uv).r;
      vDepth = d;

      vec3 pos = position;
      pos.z = (d - 1.0) * uDepthScale;

      // 0 tam merkezde, 1 portrenin dış/kenar bölgesinde -- merkez neredeyse hiç
      // kıpırdamıyor (yüz okunaklı kalsın), kenarlar tam genlikte hareket ediyor
      float edgeMask = smoothstep(0.12, 0.5, length(uv - 0.5));

      vec3 dirSeed = vec3(
        snoise(vec3(uv * 3.2, 11.0)),
        snoise(vec3(uv * 3.2, 23.0)),
        snoise(vec3(uv * 3.2, 47.0))
      );
      vec3 dir = normalize(dirSeed + 0.0001);
      float phase = snoise(vec3(uv * 2.4, 71.0)) * 6.2831853;
      float magBase = 0.55 + 0.45 * (0.5 + 0.5 * snoise(vec3(uv * 4.0, 91.0)));

      float wobble = snoise(vec3(uv * 2.0, uTime * 0.08 + phase));
      float raw = sin(uTime * uScatterSpeed + phase + wobble * 1.2) * 0.5 + 0.5;
      float cycle = raw * raw * raw;

      float edgeScatter = mix(0.12, 1.0, edgeMask);
      pos += dir * cycle * magBase * uScatterAmount * edgeScatter;

      // yavaş, geniş "uzaklaşıp geri gelme" gezinmesi -- sadece kenarlarda, ayrı
      // (daha düşük frekanslı) bir noise kanalından, dünya-birimi cinsinden genlik
      vec3 wander = vec3(
        snoise(vec3(uv * 5.0, uTime * 0.096)),
        snoise(vec3(uv * 5.0, uTime * 0.096 + 31.0)),
        snoise(vec3(uv * 5.0, uTime * 0.096 + 53.0))
      );
      pos += wander * edgeMask * uEdgeWander;

      pos.z += sin(uTime * 0.48) * 0.06;

      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mv;

      // her noktanın kendi fazıyla senkronsuz büyüyüp küçülmesi + scatter anında ekstra küçülme
      float sizeOsc = clamp(0.55 + 0.55 * sin(uTime * 1.28 + phase * 2.1), 0.15, 1.15);
      float sizePulse = sizeOsc * (1.0 - 0.3 * cycle);
      float safeDist = max(-mv.z, 1.0);
      gl_PointSize = clamp(uPointSize * uSizeMul * sizePulse * uPixelRatio * (uRefDist / safeDist), 0.0, 80.0);
    }
  `;

  // uDarken: cream (açık) arkaplanda AdditiveBlending sadece aydınlatabilir, hiç
  // karartamaz — bu yüzden asıl "okunaklı" katman NormalBlending + gerçek renk
  // karartması (<1) kullanıyor; glow katmanı üstte, tam parlaklıkla, düşük
  // opaklıkla ince bir ışık halesi bırakıyor.
  const FRAGMENT_SHADER = `
    uniform sampler2D uColor;
    uniform float uBgThreshold;
    uniform float uOpacity;
    uniform float uSoftInner;
    uniform float uDarken;
    varying vec2 vUv;
    varying float vDepth;

    void main() {
      if (vDepth < uBgThreshold) discard;

      vec2 c = gl_PointCoord - 0.5;
      float distc = length(c);
      if (distc > 0.5) discard;

      float soft = 1.0 - smoothstep(uSoftInner, 0.5, distc);

      vec3 col = texture2D(uColor, vUv).rgb * uDarken;
      gl_FragColor = vec4(col, soft * uOpacity);
    }
  `;

  function buildMaterial(opts) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor:         { value: null },
        uDepth:         { value: null },
        uDepthScale:    { value: DEPTH_SCALE },
        uBgThreshold:   { value: BG_THRESHOLD },
        uPointSize:     { value: 2.4 },
        uSizeMul:       { value: opts.sizeMul },
        uPixelRatio:    { value: Math.min(window.devicePixelRatio || 1, 2) },
        uTime:          { value: 0.0 },
        uOpacity:       { value: opts.opacity },
        uSoftInner:     { value: opts.softInner },
        uScatterAmount: { value: SCATTER_AMOUNT * opts.scatterMul },
        uScatterSpeed:  { value: SCATTER_SPEED },
        uRefDist:       { value: REF_DIST },
        uDarken:        { value: opts.darken },
        uEdgeWander:    { value: opts.edgeWander }
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: opts.blending
    });
  }

  // tek paylaşılan birim-kare geometri — her portrenin aspect'i group.scale ile uygulanıyor
  const sharedGeo = (() => {
    const cols = GRID_COLS, rows = GRID_ROWS;
    const positions = new Float32Array(cols * rows * 3);
    const uvs = new Float32Array(cols * rows * 2);
    let i = 0, j = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const u = x / (cols - 1);
        const v = 1 - y / (rows - 1);
        positions[i++] = (u - 0.5) * PLANE_SIZE;
        positions[i++] = (v - 0.5) * PLANE_SIZE;
        positions[i++] = 0;
        uvs[j++] = u;
        uvs[j++] = v;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), PLANE_SIZE * 1.5);
    return geo;
  })();

  const textureCache = {};
  function loadTexturePair(id) {
    if (textureCache[id]) return textureCache[id];
    const loader = new THREE.TextureLoader();
    const load = url => new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject));
    textureCache[id] = Promise.all([
      load(PORTRAIT_BASE + id + '_color.webp'),
      load(PORTRAIT_BASE + id + '_depth.webp')
    ]);
    return textureCache[id];
  }

  function buildPortrait(id, aspect) {
    return loadTexturePair(id).then(([colorTex, depthTex]) => {
      // koyu-gri okunaklı çekirdek (normal blending, gerçek karartma) + üstte
      // ince, tam parlaklıkta bir additive glow halesi
      const matSharp = buildMaterial({
        sizeMul: 1.3, opacity: 0.95, softInner: 0.4,
        scatterMul: 0.5, darken: 0.42, blending: THREE.NormalBlending, edgeWander: 2.0
      });
      const matGlow = buildMaterial({
        sizeMul: 2.0, opacity: 0.14, softInner: 0.05,
        scatterMul: 1.6, darken: 1.0, blending: THREE.AdditiveBlending, edgeWander: 4.5
      });
      [matSharp, matGlow].forEach(m => {
        m.uniforms.uColor.value = colorTex;
        m.uniforms.uDepth.value = depthTex;
      });

      const group = new THREE.Group();
      group.add(new THREE.Points(sharedGeo, matSharp));
      group.add(new THREE.Points(sharedGeo, matGlow));
      group.scale.set(aspect, 1, 1); // paylaşılan kare geometriyi bu portrenin gerçek aspect'ine göre yatayda uzat
      group.userData.materials = [matSharp, matGlow];
      return group;
    });
  }

  function disposeGroup(group) {
    if (!group || !group.userData || !group.userData.materials) return;
    group.userData.materials.forEach(m => m.dispose());
  }

  let fieldGroup = null;
  let fieldStartTime = 0;
  let generation = 0; // hide() sonrası geç gelen texture yüklemelerini iptal etmek için

  const SCALE_MUL    = 1.0; // ölçek zaten PLANE_SIZE ile geometriye gömülü — burada sadece aspect uygulanıyor (buildPortrait içinde)
  const COLS_PER_ROW = 6;
  const COL_SPACING  = 26;
  const ROW_SPACING  = 30;
  const NEAR_Z_OFFSET = 46;

  function show() {
    if (fieldGroup) return;
    if (typeof scene === 'undefined' || typeof camera === 'undefined') return;

    generation++;
    const myGen = generation;
    fieldGroup = new THREE.Group();
    scene.add(fieldGroup);
    fieldStartTime = performance.now();

    const anchorY = camera.position.y - 3;
    const anchorZ = camera.position.z;
    const startX = -((Math.min(COLS_PER_ROW, PEOPLE.length) - 1) * COL_SPACING) / 2;

    PEOPLE.forEach((p, idx) => {
      buildPortrait(p.id, p.aspect).then(group => {
        if (myGen !== generation) { disposeGroup(group); return; }
        const col = idx % COLS_PER_ROW;
        const row = Math.floor(idx / COLS_PER_ROW);
        const jitterX = (Math.sin(idx * 12.9898) * 43758.5453 % 1) * 5;
        const jitterY = (Math.cos(idx * 78.233) * 12345.678 % 1) * 2;

        group.position.set(
          startX + col * COL_SPACING + jitterX,
          anchorY + jitterY,
          anchorZ - NEAR_Z_OFFSET - row * ROW_SPACING
        );
        fieldGroup.add(group);
      }).catch(() => { /* eksik/başarısız doku sessizce atlanır */ });
    });
  }

  function hide() {
    generation++;
    if (fieldGroup) {
      const g = fieldGroup;
      fieldGroup = null;
      g.children.slice().forEach(disposeGroup);
      if (typeof scene !== 'undefined') scene.remove(g);
    }
  }

  function update() {
    if (!fieldGroup) return;
    const t = (performance.now() - fieldStartTime) / 1000;
    fieldGroup.children.forEach(portraitGroup => {
      if (portraitGroup.userData && portraitGroup.userData.materials) {
        portraitGroup.userData.materials.forEach(m => { m.uniforms.uTime.value = t; });
      }
    });
  }

  window.PortraitField = { show, hide, update };
})();
