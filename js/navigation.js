// ─── Glitch geçiş efekti ───────────────────────────────────────────────────
const glitchImgs = ['images/glitch-0.gif', 'images/glitch-1.gif', 'images/glitch-2.gif'];
let glitchIdx = 0;
let glitchActive = false;

function runGlitch(callback) {
  if (glitchActive) { if (callback) callback(); return; }
  glitchActive = true;

  const img = document.createElement('img');
  img.src = glitchImgs[glitchIdx % glitchImgs.length];
  glitchIdx++;

  img.style.cssText = [
    'position:fixed',
    'top:0', 'left:0',
    'width:100%', 'height:100%',
    'z-index:999',
    'pointer-events:none',
    'object-fit:cover',
    'opacity:0.32'
  ].join(';');

  document.body.appendChild(img);

  setTimeout(() => {
    if (document.body.contains(img)) document.body.removeChild(img);
    glitchActive = false;
    if (callback) callback();
  }, 220);
}

// ─── State ────────────────────────────────────────────────────────────────
let navState = {
  section:     null,  // 'works' | 'academic' | 'about' | 'contact'
  category:    null,
  subcategory: null,
  project:     null
};

// ─── Panel yardımcıları ───────────────────────────────────────────────────
function getPanelRoot() { return document.getElementById('panel-root'); }
function getOv()        { return document.getElementById('ov'); }

function clearPanel() {
  getPanelRoot().innerHTML = '';
  const infoPanel = document.getElementById('proj-info-panel');
  if (infoPanel) infoPanel.remove();
  if (window.grid3d && typeof window.grid3d.destroy === 'function') {
    window.grid3d.destroy();
    window.grid3d = null;
  }
}

// ─── Home ─────────────────────────────────────────────────────────────────
function goHome() {
  runGlitch(() => {
    clearPanel();
    getOv().style.opacity = '1';
    navState = { section: null, category: null, subcategory: null, project: null };
  });
}

// ─── Section seçimi ───────────────────────────────────────────────────────
function showSection(sectionId) {
  runGlitch(() => {
    clearPanel();
    getOv().style.opacity = '0';
    navState = { section: sectionId, category: null, subcategory: null, project: null };

    switch (sectionId) {
      case 'works':    renderWorks();    break;
      case 'academic': renderAcademic(); break;
      case 'about':    renderAbout();    break;
      case 'contact':  renderContact();  break;
    }
  });
}

// ─── Ortak: panel-nav üretici ─────────────────────────────────────────────
// items: [{ label, action }]  — soldan sağa, son item aktif sayfa
function makePanelNav(items) {
  const nav = document.createElement('div');
  nav.className = 'panel-nav';

  items.forEach((item, i) => {
    const isLast = i === items.length - 1;
    if (isLast) return;

    const btn = document.createElement('span');
    btn.className = 'back-btn';
    btn.textContent = '← ' + item.label;
    btn.addEventListener('click', () => runGlitch(item.action));
    nav.appendChild(btn);
  });

  return nav;
}

// ─── Scramble Text Efekti ─────────────────────────────────────────────────
function scrambleText(el, finalText, duration = 1800) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const steps = Math.floor(duration / 60);
  let step = 0;
  const fixedRandom = Array.from(finalText).map(c =>
    c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]
  );

  const interval = setInterval(() => {
    const progress = step / steps;
    const revealedCount = Math.floor(progress * finalText.length);
    let display = '';
    for (let i = 0; i < finalText.length; i++) {
      if (finalText[i] === ' ') { display += ' '; continue; }
      display += i < revealedCount ? finalText[i] : fixedRandom[i];
    }
    el.textContent = display;
    step++;
    if (step > steps) {
      el.textContent = finalText;
      clearInterval(interval);
    }
  }, 60);
}

// ─── Proje Bilgi Paneli ───────────────────────────────────────────────────
function renderProjectInfoPanel(project) {
  const existing = document.getElementById('proj-info-panel');
  if (existing) existing.remove();

  const isMobile = window.innerWidth <= 768;
  if (isMobile) return;

  const fovRad     = (50 * Math.PI) / 180;
  const visibleH   = 2 * Math.tan(fovRad / 2) * 7.5;
  const tileSize   = 2.8;
  const tilePx     = Math.round((tileSize / visibleH) * window.innerHeight);
  const panelTop   = 235;
  const panelLeft  = 100;
  const panelWidth = 180;
  const panelPad   = '20px 18px 22px';

  const panel = document.createElement('div');
  panel.id = 'proj-info-panel';
  panel.style.cssText = `
    position: fixed;
    left: ${panelLeft}px;
    top: ${panelTop}px;
    width: ${panelWidth}px;
    height: ${tilePx}px;
    z-index: 103;
    pointer-events: none;
    background: rgba(225,222,217,0.65);
    backdrop-filter: blur(3px);
    padding: ${panelPad};
    box-sizing: border-box;
    overflow: hidden;
  `;

  const titleEl = document.createElement('span');
  titleEl.style.cssText = `
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .10em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.78);
    margin-bottom: 18px;
    display: block;
    line-height: 1.5;
  `;
  panel.appendChild(titleEl);

  const rows = [];
  if (project.year)
    rows.push({ key: 'Year', val: project.year });
  if (project.location)
    rows.push({ key: 'Location', val: project.location });
  if (project.office)
    rows.push({ key: 'Office', val: project.office });
  if (project.responsibilities && project.responsibilities.length)
    rows.push({ key: 'Role', val: project.responsibilities.join(', ') });
  if (project.coworkers && project.coworkers.length)
    rows.push({ key: 'With', val: project.coworkers.join(', ') });
  if (project.description)
    rows.push({ key: 'Info', val: project.description });

  const valueEls = [];

  rows.forEach(row => {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;flex-direction:column;margin-bottom:10px;';

    const keyEl = document.createElement('span');
    keyEl.style.cssText = `
      font-family: 'IBM Plex Mono', monospace;
      font-size: 8px;
      letter-spacing: .24em;
      text-transform: uppercase;
      color: rgba(0,0,0,0.38);
      margin-bottom: 2px;
    `;
    keyEl.textContent = row.key;

    const valEl = document.createElement('span');
    valEl.style.cssText = `
      font-family: 'Space Grotesk', sans-serif;
      font-size: 11px;
      font-weight: 300;
      letter-spacing: .04em;
      color: rgba(0,0,0,0.68);
      line-height: 1.5;
    `;
    valEl.textContent = row.val;

    div.appendChild(keyEl);
    div.appendChild(valEl);
    panel.appendChild(div);
    valueEls.push({ el: valEl, text: row.val });
  });

  document.body.appendChild(panel);

  // ── Scan line ────────────────────────────────────────────────────────
  const scanLine = document.createElement('div');
  scanLine.style.cssText = `
    position: absolute;
    left: 0; top: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.08), rgba(0,0,0,0));
    pointer-events: none;
    z-index: 1;
  `;
  panel.appendChild(scanLine);

  let scanPos = 0;
  let scanAnimId = null;
  function animateScan() {
    scanPos += 0.4;
    if (scanPos > tilePx) scanPos = -2;
    scanLine.style.top = scanPos + 'px';
    scanAnimId = requestAnimationFrame(animateScan);
  }
  animateScan();

  // ── Glitch flash ─────────────────────────────────────────────────────
  let glitchTimeout = null;
  function scheduleGlitch() {
    const delay = 3000 + Math.random() * 5000;
    glitchTimeout = setTimeout(() => {
      if (!document.body.contains(panel)) return;

      const offsetX = (Math.random() - 0.5) * 6;
      const offsetY = (Math.random() - 0.5) * 3;
      panel.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      panel.style.opacity = '0.7';

      setTimeout(() => {
        if (!document.body.contains(panel)) return;
        panel.style.transform = 'translate(0,0)';
        panel.style.opacity = '1';
        scheduleGlitch();
      }, 80);
    }, delay);
  }
  scheduleGlitch();

  // Panel kaldırılınca animasyonları temizle
  const observer = new MutationObserver(() => {
    if (!document.body.contains(panel)) {
      if (scanAnimId) cancelAnimationFrame(scanAnimId);
      if (glitchTimeout) clearTimeout(glitchTimeout);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true });

  // Scramble efektleri
  scrambleText(titleEl, project.title.toUpperCase(), 1400);
  valueEls.forEach(({ el, text }, i) => {
    setTimeout(() => scrambleText(el, text, 1000), 400 + i * 200);
  });
}

// ─── Lightbox ─────────────────────────────────────────────────────────────
function openLightbox(images, startIndex) {
  const existing = document.getElementById('lightbox');
  if (existing) existing.remove();

  let current = startIndex;

  const box = document.createElement('div');
  box.id = 'lightbox';
  box.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    z-index:900;background:rgba(14,13,12,0.94);
    display:flex;align-items:center;justify-content:center;
  `;

  const img = document.createElement('img');
  img.style.cssText = `
    max-width:88vw;max-height:88vh;
    object-fit:contain;display:block;
    transition:opacity 0.2s ease;
    user-select:none;
  `;

  function loadImg(index) {
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = images[index].src;
      img.onload = () => { img.style.opacity = '1'; };
    }, 150);
    counter.textContent = (index + 1) + ' / ' + images.length;
  }

  function makeArrow(dir) {
    const btn = document.createElement('button');
    btn.style.cssText = `
      position:fixed;top:50%;transform:translateY(-50%);
      ${dir === 'left' ? 'left:32px' : 'right:32px'};
      background:none;border:none;cursor:pointer;
      color:rgba(255,255,255,0.5);font-size:28px;
      padding:12px;z-index:901;
      transition:color 0.15s ease;font-family:'IBM Plex Mono',monospace;
      font-weight:100;letter-spacing:0;
    `;
    btn.textContent = dir === 'left' ? '←' : '→';
    btn.addEventListener('mouseenter', () => { btn.style.color = 'rgba(255,255,255,0.95)'; });
    btn.addEventListener('mouseleave', () => { btn.style.color = 'rgba(255,255,255,0.5)'; });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dir === 'left')  current = (current - 1 + images.length) % images.length;
      else                 current = (current + 1) % images.length;
      loadImg(current);
    });
    return btn;
  }

  const counter = document.createElement('div');
  counter.style.cssText = `
    position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
    font-family:'IBM Plex Mono',monospace;font-size:10px;
    letter-spacing:.25em;color:rgba(255,255,255,0.35);
    z-index:901;user-select:none;
  `;

  const closeBtn = document.createElement('div');
  closeBtn.style.cssText = `
    position:fixed;top:24px;right:32px;
    font-family:'IBM Plex Mono',monospace;font-size:10px;
    letter-spacing:.25em;text-transform:uppercase;
    color:rgba(255,255,255,0.35);cursor:pointer;z-index:901;
    transition:color 0.15s ease;
  `;
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('mouseenter', () => { closeBtn.style.color = 'rgba(255,255,255,0.9)'; });
  closeBtn.addEventListener('mouseleave', () => { closeBtn.style.color = 'rgba(255,255,255,0.35)'; });

  function closeLightbox() {
    box.style.opacity = '0';
    box.style.transition = 'opacity 0.2s ease';
    setTimeout(() => box.remove(), 200);
    window.removeEventListener('keydown', onKey);
  }

  closeBtn.addEventListener('click', closeLightbox);
  box.addEventListener('click', (e) => {
    if (e.target === box) closeLightbox();
  });

  function onKey(e) {
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') { current = (current + 1) % images.length; loadImg(current); }
    if (e.key === 'ArrowLeft')  { current = (current - 1 + images.length) % images.length; loadImg(current); }
  }
  window.addEventListener('keydown', onKey);

  box.appendChild(img);
  box.appendChild(makeArrow('left'));
  box.appendChild(makeArrow('right'));
  box.appendChild(counter);
  box.appendChild(closeBtn);
  document.body.appendChild(box);

  loadImg(current);

  box.style.opacity = '0';
  box.style.transition = 'opacity 0.25s ease';
  requestAnimationFrame(() => { box.style.opacity = '1'; });
}

// ─── Menü bağlantıları ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('wb')?.addEventListener('click',   () => showSection('works'));
  document.getElementById('ab')?.addEventListener('click',   () => showSection('academic'));
  document.getElementById('abtb')?.addEventListener('click', () => showSection('about'));
  document.getElementById('cb')?.addEventListener('click',   () => showSection('contact'));
});
