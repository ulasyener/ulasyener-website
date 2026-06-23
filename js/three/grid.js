// ─── DOM Grid Sistemi ─────────────────────────────────────────────────────
// Kademe 1: showProjectGrid(projects, onProjectClick)
// Kademe 2: showPhotoGrid(project, onPhotoClick)

let gridAnimId  = null;
let gridOverlay = null;
let scanAnimIds = [];

const GLITCH_SRCS    = [
  'images/effects/ledglitch/01.mp4',
  'images/effects/ledglitch/02.mp4',
  'images/effects/ledglitch/03.mp4',
  'images/effects/ledglitch/04.mp4'
];
const GLITCH_OPACITY = 0.38;

// ─── Yerlesim sabitleri ───────────────────────────────────────────────────
const FADE_PX        = 44;
const FADE_PX_MOB    = 24;

const K1_OVERLAY_TOP  = 129;
const K2_OVERLAY_TOP  = 429;
const MOB_OVERLAY_TOP = 104;

// ─── Temizleme ────────────────────────────────────────────────────────────
function destroyGrid() {
  if (gridAnimId) { cancelAnimationFrame(gridAnimId); gridAnimId = null; }
  scanAnimIds.forEach(function(id) { cancelAnimationFrame(id); });
  scanAnimIds = [];
  if (gridOverlay && gridOverlay.parentNode) { gridOverlay.remove(); gridOverlay = null; }
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

// ─── Cekirdek builder ─────────────────────────────────────────────────────
function buildGrid(items, onSelect, overlayTop) {
  destroyGrid();

  const IS_MOB = window.innerWidth <= 768;
  const COLS   = IS_MOB ? 1 : 3;
  const GAP    = IS_MOB ? 12 : 16;
  const FADE   = IS_MOB ? FADE_PX_MOB : FADE_PX;
  const OV_TOP = IS_MOB ? MOB_OVERLAY_TOP : overlayTop;
  const PAD_H  = IS_MOB ? '16px' : '80px';

  gridOverlay = document.createElement('div');
  gridOverlay.id = 'grid-overlay';
  gridOverlay.style.cssText =
    'position:fixed;' +
    'top:' + OV_TOP + 'px;' +
    'left:0;right:0;' +
    'bottom:0;' +
    'z-index:210;' +
    'overflow-y:auto;overflow-x:hidden;' +
    '-webkit-overflow-scrolling:touch;' +
    'padding:' + FADE + 'px ' + PAD_H + ' 80px;' +
    'box-sizing:border-box;' +
    '-webkit-mask-image:linear-gradient(to bottom,transparent 0px,black ' + FADE + 'px);' +
    'mask-image:linear-gradient(to bottom,transparent 0px,black ' + FADE + 'px);';

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

    if (item.src) {
      const img = document.createElement('img');
      img.src     = item.src;
      img.loading = i < 3 ? 'eager' : 'lazy'; // ilk 3 kart aninda, gerisi lazy
      img.decoding = 'async';
      img.style.cssText =
        'position:absolute;inset:0;' +
        'width:100%;height:100%;' +
        'object-fit:cover;display:block;pointer-events:none;';
      card.appendChild(img);
    }

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
          'font-family:"DM Mono",monospace;' +
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

// ─── Kademe 2: Proje fotograf grid'i ──────────────────────────────────────
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

// ─── Video Embed Sayfasi ──────────────────────────────────────────────────
function showVideoEmbed(project) {
  destroyGrid();

  const IS_MOB   = window.innerWidth <= 768;
  const TOP_PX   = IS_MOB ? 60 : 185;
  const PAD_SIDE = IS_MOB ? 16 : 100;

  gridOverlay = document.createElement('div');
  gridOverlay.id = 'grid-overlay';
  gridOverlay.style.cssText =
    'position:fixed;' +
    'top:' + TOP_PX + 'px;' +
    'left:0;right:0;bottom:0;' +
    'z-index:210;' +
    'display:flex;' +
    'flex-direction:' + (IS_MOB ? 'column' : 'row') + ';' +
    'align-items:' + (IS_MOB ? 'stretch' : 'flex-start') + ';' +
    'padding:' + (IS_MOB ? '16px 16px 60px' : '0 216px 40px ' + PAD_SIDE + 'px') + ';' +
    'gap:' + (IS_MOB ? '20px' : '0') + ';' +
    'box-sizing:border-box;' +
    'overflow:hidden;';

  // ─── Sol: Bilgi Paneli ───────────────────────────────────────────────
  if (!IS_MOB) {
    const infoPanel = document.createElement('div');
    infoPanel.style.cssText =
      'flex-shrink:0;width:220px;margin-right:32px;' +
      'background:rgba(225,222,217,0.65);backdrop-filter:blur(3px);' +
      'padding:20px 18px 22px;box-sizing:border-box;' +
      'pointer-events:all;cursor:pointer;overflow:hidden;';

    const titleEl = document.createElement('span');
    titleEl.style.cssText =
      'font-family:"Space Grotesk",sans-serif;' +
      'font-size:12px;font-weight:700;letter-spacing:.10em;' +
      'text-transform:uppercase;color:rgba(0,0,0,0.78);display:block;line-height:1.5;';
    infoPanel.appendChild(titleEl);

    const detailsEl = document.createElement('div');
    detailsEl.style.cssText =
      'overflow:hidden;max-height:0;opacity:0;' +
      'transition:max-height 0.45s ease, opacity 0.35s ease, margin-top 0.35s ease;' +
      'margin-top:0;';
    infoPanel.appendChild(detailsEl);

    function addRow(key, val) {
      if (!val) return;
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;flex-direction:column;margin-bottom:10px;';
      const keyEl = document.createElement('span');
      keyEl.style.cssText =
        'font-family:"DM Mono",monospace;' +
        'font-size:8px;letter-spacing:.24em;text-transform:uppercase;' +
        'color:rgba(0,0,0,0.38);margin-bottom:2px;';
      keyEl.textContent = key;
      const valEl = document.createElement('span');
      valEl.style.cssText =
        'font-family:"Space Grotesk",sans-serif;' +
        'font-size:11px;font-weight:300;letter-spacing:.04em;' +
        'color:rgba(0,0,0,0.68);line-height:1.5;';
      valEl.textContent = val;
      div.appendChild(keyEl);
      div.appendChild(valEl);
      detailsEl.appendChild(div);
    }

    if (project.year)        addRow('Year', project.year);
    if (project.subtitle)    addRow('Format', project.subtitle);
    if (project.location)    addRow('Location', project.location);
    if (project.office)      addRow('Office', project.office);
    if (project.firm)        addRow('Firm', project.firm);
    if (project.description) addRow('Info', project.description);
    if (project.credits && project.credits.length) addRow('Credits', project.credits.join(' / '));
    if (project.exhibition && project.exhibition.length) addRow('Exhibition', project.exhibition.join(', '));
    if (project.software)    addRow('Software', project.software);

    let isOpen = false;
    function openPanel() {
      if (isOpen) return; isOpen = true;
      detailsEl.style.maxHeight = '400px';
      detailsEl.style.opacity   = '1';
      detailsEl.style.marginTop = '14px';
    }
    function closePanel() {
      if (!isOpen) return; isOpen = false;
      detailsEl.style.maxHeight = '0';
      detailsEl.style.opacity   = '0';
      detailsEl.style.marginTop = '0';
    }
    infoPanel.addEventListener('click', function() { isOpen ? closePanel() : openPanel(); });
    setTimeout(openPanel,  1000);
    setTimeout(closePanel, 4000);

    gridOverlay.appendChild(infoPanel);

    setTimeout(function() { gridScramble(titleEl, project.title.toUpperCase(), 1200); }, 100);

    const scanLine = document.createElement('div');
    scanLine.style.cssText =
      'position:absolute;left:0;top:0;width:100%;height:2px;' +
      'background:linear-gradient(to bottom,rgba(0,0,0,0),rgba(0,0,0,0.08),rgba(0,0,0,0));' +
      'pointer-events:none;z-index:1;';
    infoPanel.appendChild(scanLine);
    let scanPos = 0;
    function animateScan() {
      scanPos += 0.4;
      if (scanPos > infoPanel.offsetHeight) scanPos = -2;
      scanLine.style.top = scanPos + 'px';
      scanAnimIds.push(requestAnimationFrame(animateScan));
    }
    scanAnimIds.push(requestAnimationFrame(animateScan));
  }

  // ─── Sag: Video ──────────────────────────────────────────────────────
  const videoCol = document.createElement('div');
  videoCol.style.cssText =
    'flex:1;display:flex;flex-direction:column;justify-content:center;min-width:0;';

  const wrapper = document.createElement('div');
  wrapper.style.cssText =
    'width:100%;max-height:65vh;position:relative;' +
    'padding-bottom:min(56.25%, 65vh);height:0;overflow:hidden;flex-shrink:0;';

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;';
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
  iframe.setAttribute('loading', 'lazy');

  if (project.video_provider === 'vimeo' && project.vimeo_id) {
    iframe.src = 'https://player.vimeo.com/video/' + project.vimeo_id +
      '?title=0&byline=0&portrait=0&badge=0';
  } else if (project.video_provider === 'youtube' && project.youtube_id) {
    iframe.src = 'https://www.youtube.com/embed/' + project.youtube_id +
      '?rel=0&modestbranding=1';
  }

  wrapper.appendChild(iframe);
  videoCol.appendChild(wrapper);

  // Mobilde bilgi paneli videonun altinda
  if (IS_MOB) {
    const mobInfo = document.createElement('div');
    mobInfo.style.cssText =
      'margin-top:12px;background:rgba(225,222,217,0.65);backdrop-filter:blur(3px);' +
      'padding:16px 16px 18px;box-sizing:border-box;pointer-events:all;cursor:pointer;' +
      'overflow:hidden;flex-shrink:0;position:relative;';

    const mobTitleEl = document.createElement('span');
    mobTitleEl.style.cssText =
      'font-family:"Space Grotesk",sans-serif;font-size:11px;font-weight:700;' +
      'letter-spacing:.10em;text-transform:uppercase;color:rgba(0,0,0,0.78);' +
      'display:block;line-height:1.5;';
    mobInfo.appendChild(mobTitleEl);

    const mobDetailsEl = document.createElement('div');
    mobDetailsEl.style.cssText =
      'overflow:hidden;max-height:0;opacity:0;' +
      'transition:max-height 0.45s ease, opacity 0.35s ease, margin-top 0.35s ease;' +
      'margin-top:0;';
    mobInfo.appendChild(mobDetailsEl);

    function addMobRow(key, val) {
      if (!val) return;
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;flex-direction:column;margin-bottom:8px;';
      const keyEl = document.createElement('span');
      keyEl.style.cssText =
        'font-family:"DM Mono",monospace;font-size:8px;letter-spacing:.22em;' +
        'text-transform:uppercase;color:rgba(0,0,0,0.38);margin-bottom:2px;';
      keyEl.textContent = key;
      const valEl = document.createElement('span');
      valEl.style.cssText =
        'font-family:"Space Grotesk",sans-serif;font-size:11px;font-weight:300;' +
        'letter-spacing:.03em;color:rgba(0,0,0,0.68);line-height:1.5;';
      valEl.textContent = val;
      div.appendChild(keyEl);
      div.appendChild(valEl);
      mobDetailsEl.appendChild(div);
    }

    if (project.year)        addMobRow('Year', project.year);
    if (project.subtitle)    addMobRow('Format', project.subtitle);
    if (project.location)    addMobRow('Location', project.location);
    if (project.office)      addMobRow('Office', project.office);
    if (project.firm)        addMobRow('Firm', project.firm);
    if (project.description) addMobRow('Info', project.description);
    if (project.credits && project.credits.length) addMobRow('Credits', project.credits.join(' / '));
    if (project.exhibition && project.exhibition.length) addMobRow('Exhibition', project.exhibition.join(', '));
    if (project.software)    addMobRow('Software', project.software);

    let mobIsOpen = false;
    function mobOpen() {
      if (mobIsOpen) return; mobIsOpen = true;
      mobDetailsEl.style.maxHeight = '300px';
      mobDetailsEl.style.opacity   = '1';
      mobDetailsEl.style.marginTop = '12px';
    }
    function mobClose() {
      if (!mobIsOpen) return; mobIsOpen = false;
      mobDetailsEl.style.maxHeight = '0';
      mobDetailsEl.style.opacity   = '0';
      mobDetailsEl.style.marginTop = '0';
    }
    mobInfo.addEventListener('click', function() { mobIsOpen ? mobClose() : mobOpen(); });
    setTimeout(mobOpen,  1000);
    setTimeout(mobClose, 4000);

    const mobScanLine = document.createElement('div');
    mobScanLine.style.cssText =
      'position:absolute;left:0;top:0;width:100%;height:2px;' +
      'background:linear-gradient(to bottom,rgba(0,0,0,0),rgba(0,0,0,0.08),rgba(0,0,0,0));' +
      'pointer-events:none;z-index:1;';
    mobInfo.appendChild(mobScanLine);
    let mobScanPos = 0;
    function mobAnimateScan() {
      mobScanPos += 0.4;
      if (mobScanPos > mobInfo.offsetHeight) mobScanPos = -2;
      mobScanLine.style.top = mobScanPos + 'px';
      scanAnimIds.push(requestAnimationFrame(mobAnimateScan));
    }
    scanAnimIds.push(requestAnimationFrame(mobAnimateScan));

    setTimeout(function() { gridScramble(mobTitleEl, project.title.toUpperCase(), 1200); }, 100);

    videoCol.appendChild(mobInfo);
  }

  gridOverlay.appendChild(videoCol);
  document.body.appendChild(gridOverlay);

  return { destroy: destroyGrid };
}