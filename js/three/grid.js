// ─── DOM Grid Sistemi ─────────────────────────────────────────────────────
// Kademe 1: showProjectGrid(projects, onProjectClick)
// Kademe 2: showPhotoGrid(project, onPhotoClick)

let gridAnimId  = null;
let gridOverlay = null;

const GLITCH_SRCS    = [
  'images/effects/ledglitch/01.mp4',
  'images/effects/ledglitch/02.mp4',
  'images/effects/ledglitch/03.mp4',
  'images/effects/ledglitch/04.mp4'
];
const GLITCH_OPACITY = 0.38;

// ─── Yerleşim sabitleri ───────────────────────────────────────────────────
// RESIDENTIAL bottom : 147px
// Boşluk ritmi       : 88px
//
// Kademe 1 (proje kapak — bilgi paneli yok):
//   Grid top         : 147 + 88 = 235px
//   Fade başlangıcı  : 235 - 44 = 191px  → OVERLAY_TOP
//   Fade mesafesi    : 44px
//
// Kademe 2 (fotoğraf — bilgi paneli var):
//   Bilgi paneli top : 235px  (navigation.js'te)
//   Bilgi paneli h   : 204px
//   Bilgi paneli bot : 439px
//   Grid top         : 439 + 88 = 527px
//   Fade başlangıcı  : 527 - 44 = 483px  → OVERLAY_TOP
//   Fade mesafesi    : 44px
//
// Mobil (bilgi paneli yok her iki kademede):
//   RESIDENTIAL bot  : ~80px (orantılı)
//   Grid top         : 80 + 48 = 128px
//   Fade başlangıcı  : 128 - 24 = 104px

const FADE_PX        = 44;
const FADE_PX_MOB    = 24;

// Kademe 1 desktop overlay top
const K1_OVERLAY_TOP = 191;
// Kademe 2 desktop overlay top
const K2_OVERLAY_TOP = 483;
// Mobil overlay top (her iki kademe)
const MOB_OVERLAY_TOP = 104;

// ─── Temizleme ────────────────────────────────────────────────────────────
function destroyGrid() {
  if (gridAnimId) { cancelAnimationFrame(gridAnimId); gridAnimId = null; }
  if (gridOverlay && gridOverlay.parentNode) gridOverlay.remove();
  gridOverlay = null;
  document.querySelectorAll('.grid-glitch-video').forEach(function(v) {
    v.pause(); v.remove();
  });
}

// ─── Scramble text ────────────────────────────────────────────────────────
function gridScramble(el, finalText, duration) {
  duration = duration || 1200;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const steps = Math.floor(duration / 60);
  let step = 0;
  const fixed = Array.from(finalText).map(function(c) {
    return c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)];
  });
  const iv = setInterval(function() {
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
// overlayTop: hangi kademede çağrıldığına göre K1 veya K2 değeri gelir
function buildGrid(items, onSelect, overlayTop) {
  destroyGrid();

  const IS_MOB  = window.innerWidth <= 768;
  const COLS    = IS_MOB ? 1 : 3;
  const GAP     = IS_MOB ? 12 : 16;
  const PAD_H   = IS_MOB ? '16px' : '80px';
  const FADE    = IS_MOB ? FADE_PX_MOB : FADE_PX;
  const OV_TOP  = IS_MOB ? MOB_OVERLAY_TOP : overlayTop;

  // Overlay
  gridOverlay = document.createElement('div');
  gridOverlay.id = 'grid-overlay';
  gridOverlay.style.cssText =
    'position:fixed;' +
    'top:' + OV_TOP + 'px;' +
    'left:0;right:0;bottom:0;' +
    'z-index:102;' +
    'overflow-y:auto;overflow-x:hidden;' +
    '-webkit-overflow-scrolling:touch;' +
    'padding:' + FADE + 'px ' + PAD_H + ' 80px;' +
    'box-sizing:border-box;' +
    '-webkit-mask-image:linear-gradient(to bottom,transparent 0px,black ' + FADE + 'px);' +
    'mask-image:linear-gradient(to bottom,transparent 0px,black ' + FADE + 'px);';

  // Grid container
  const grid = document.createElement('div');
  grid.style.cssText =
    'display:grid;' +
    'grid-template-columns:repeat(' + COLS + ',1fr);' +
    'gap:' + GAP + 'px;' +
    'width:100%;';
  gridOverlay.appendChild(grid);
  document.body.appendChild(gridOverlay);

  // Video glitch havuzu
  const glitchVideos = GLITCH_SRCS.map(function(src) {
    const v = document.createElement('video');
    v.src = src; v.loop = true; v.muted = true;
    v.autoplay = true; v.playsInline = true;
    v.className = 'grid-glitch-video';
    v.style.cssText = 'position:fixed;top:-9999px;left:-9999px;pointer-events:none;';
    document.body.appendChild(v);
    v.play().catch(function(){});
    return v;
  });

  // Kartlar
  items.forEach(function(item, i) {
    const card = document.createElement('div');
    card.className = 'grid-card';
    card.style.cssText =
      'position:relative;' +
      'aspect-ratio:1/1;' +
      'overflow:hidden;' +
      'cursor:pointer;' +
      'background:#c8c5be;' +
      'transform-style:preserve-3d;' +
      'will-change:transform;';

    // Fotoğraf
    if (item.src) {
      const img = document.createElement('img');
      img.src = item.src;
      img.style.cssText =
        'position:absolute;inset:0;' +
        'width:100%;height:100%;' +
        'object-fit:cover;display:block;pointer-events:none;';
      card.appendChild(img);
    }

    // LED Glitch overlay
    const gv = document.createElement('video');
    gv.src = glitchVideos[i % glitchVideos.length].src;
    gv.loop = true; gv.muted = true;
    gv.autoplay = true; gv.playsInline = true;
    gv.style.cssText =
      'position:absolute;inset:0;' +
      'width:100%;height:100%;' +
      'object-fit:cover;pointer-events:none;' +
      'opacity:' + GLITCH_OPACITY + ';' +
      'mix-blend-mode:screen;';
    gv.play().catch(function(){});
    card.appendChild(gv);

    // Label band
    if (item.label) {
      const band = document.createElement('div');
      band.style.cssText =
        'position:absolute;bottom:0;left:0;right:0;' +
        'padding:10px 14px 12px;' +
        'background:rgba(218,215,210,0.90);' +
        'backdrop-filter:blur(2px);' +
        'pointer-events:none;';

      const titleEl = document.createElement('div');
      titleEl.style.cssText =
        'font-family:"Space Grotesk",sans-serif;' +
        'font-size:' + (IS_MOB ? '13px' : '14px') + ';' +
        'font-weight:700;letter-spacing:.10em;' +
        'text-transform:uppercase;color:rgba(0,0,0,0.78);' +
        'line-height:1.3;';
      band.appendChild(titleEl);

      if (item.sublabel) {
        const subEl = document.createElement('div');
        subEl.style.cssText =
          'font-family:"IBM Plex Mono",monospace;' +
          'font-size:' + (IS_MOB ? '9px' : '10px') + ';' +
          'letter-spacing:.18em;color:rgba(0,0,0,0.38);margin-top:3px;';
        band.appendChild(subEl);

        const obs = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) {
            if (e.isIntersecting) {
              gridScramble(titleEl, item.label.toUpperCase(), 1200);
              setTimeout(function() { gridScramble(subEl, String(item.sublabel), 900); }, 300);
              obs.disconnect();
            }
          });
        }, { threshold: 0.2 });
        obs.observe(card);
      } else {
        const obs = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) {
            if (e.isIntersecting) {
              gridScramble(titleEl, item.label.toUpperCase(), 1200);
              obs.disconnect();
            }
          });
        }, { threshold: 0.2 });
        obs.observe(card);
      }

      card.appendChild(band);
    }

    // Desktop: CSS 3D tilt
    if (!IS_MOB) {
      card.addEventListener('mousemove', function(e) {
        const r  = card.getBoundingClientRect();
        const lx = (e.clientX - r.left) / r.width  - 0.5;
        const ly = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform =
          'perspective(600px) rotateY(' + (lx * 16) + 'deg) ' +
          'rotateX(' + (-ly * 8) + 'deg) scale(1.03)';
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)';
      });
    }

    card.addEventListener('click', function() {
      if (onSelect) onSelect(item.data);
    });

    grid.appendChild(card);
  });

  return { destroy: destroyGrid };
}

// ─── Kademe 1: Proje kapak grid'i ─────────────────────────────────────────
function showProjectGrid(projects, onProjectClick) {
  const items = projects.map(function(proj) {
    return {
      src:      proj.cover || null,
      label:    proj.title,
      sublabel: proj.year,
      data:     proj
    };
  });
  return buildGrid(items, onProjectClick, K1_OVERLAY_TOP);
}

// ─── Kademe 2: Proje fotoğraf grid'i ──────────────────────────────────────
function showPhotoGrid(project, onPhotoClick) {
  const imgs = (project.images && project.images.length > 0)
    ? project.images
    : Array.from({ length: 6 }, function(_, i) { return { src: null, index: i }; });

  const items = imgs.map(function(img, i) {
    return {
      src:      img.src || null,
      label:    null,
      sublabel: null,
      data:     { index: i, project: project }
    };
  });

  return buildGrid(items, onPhotoClick, K2_OVERLAY_TOP);
}