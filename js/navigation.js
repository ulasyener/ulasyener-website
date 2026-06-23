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

// ─── Hash Routing ─────────────────────────────────────────────────────────

// Hash'i güncelle (history stack'e eklemeden)
function pushHash(hash) {
  const h = hash ? '#' + hash : '#';
  if (window.location.hash !== h) {
    history.pushState(null, '', h);
  }
}

// Mevcut hash'i parse edip sayfayı aç
async function parseAndNavigate() {
  const raw = window.location.hash.replace(/^#\/?/, '').trim();
  const parts = raw ? raw.split('/') : [];

  if (parts.length === 0 || parts[0] === '') {
    // Home
    clearPanel();
    getOv().style.opacity = '1';
    navState = { section: null, category: null, subcategory: null, project: null };
    return;
  }

  const [section, category, subcategory, project] = parts;
  const nestedSub = parts[3]; // alias for clarity in nested routing

  switch (section) {
    case 'works':
      getOv().style.opacity = '0';
      navState.section = 'works';
      if (!category) {
        clearPanel();
        renderWorks();
      } else if (!subcategory) {
        clearPanel();
        renderWorks();
        await showCategory(category);
      } else if (!project) {
        clearPanel();
        renderWorks();
        await showSubcategory(category, subcategory);
      } else {
        // parts[3] mevcut: nested subcategory mi (ai-residential vs) yoksa proje mi?
        const nestedSubIds = ['ai-residential', 'ai-retail', 'ai-hospitality', 'ai-workspace'];
        if (nestedSubIds.includes(project)) {
          // works/architecture-interior/ai-projects/ai-residential
          clearPanel();
          renderWorks();
          await showNestedSubcategory(category, subcategory, project);
        } else {
          // Normal: works/category/subcategory/projectId
          clearPanel();
          renderWorks();
          await showSubcategory(category, subcategory);
        }
      }
      break;

    case 'academic':
      getOv().style.opacity = '0';
      navState.section = 'academic';
      clearPanel();
      renderAcademic();
      if (category) {
        const acSections = {
          projects: { id: 'projects', label: 'Projects', subs: [{ id: 'bachelor', label: 'Bachelor' }, { id: 'master', label: 'Master' }, { id: 'phd', label: 'PhD' }] },
          articles: { id: 'articles', label: 'Articles', subs: [{ id: 'essays', label: 'Essays' }, { id: 'reviews', label: 'Reviews' }, { id: 'writings', label: 'Writings' }] },
          research: { id: 'research', label: 'Research', subs: [{ id: 'media-architecture', label: 'Media Architecture' }, { id: 'immersive-media', label: 'Immersive Media' }, { id: 'artistic-research', label: 'Artistic Research' }] },
          archive:  { id: 'archive',  label: 'Archive',  subs: [{ id: 'fremde-tueren', label: 'Fremde Türen / El Kapıları' }] }
        };
        if (acSections[category]) showAcademicSection(acSections[category]);
      }
      break;

    case 'about':
      getOv().style.opacity = '0';
      navState.section = 'about';
      clearPanel();
      renderAbout();
      break;

    case 'contact':
      getOv().style.opacity = '0';
      navState.section = 'contact';
      clearPanel();
      renderContact();
      break;
  }
}

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
    pushHash('');
    // Text'i temizle, sonra scramble başlat
    document.getElementById('name').textContent = '';
    document.getElementById('sub').textContent  = '';
    initHeroScramble();
  });
}

// ─── Section seçimi ───────────────────────────────────────────────────────
function showSection(sectionId) {
  runGlitch(() => {
    clearPanel();
    getOv().style.opacity = '0';
    navState = { section: sectionId, category: null, subcategory: null, project: null };
    pushHash(sectionId);

    switch (sectionId) {
      case 'works':    renderWorks();    break;
      case 'academic': renderAcademic(); break;
      case 'about':    renderAbout();    break;
      case 'contact':  renderContact();  break;
    }
  });
}

// ─── Ortak: panel-nav üretici ─────────────────────────────────────────────
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
function renderProjectInfoPanel(project, startCollapsed) {
  const existing = document.getElementById('proj-info-panel');
  if (existing) existing.remove();

const isMobile = window.innerWidth <= 768;

  // ─── MOBİL: grid-overlay içine inline panel ───────────────────────────
  if (isMobile) {
    // grid-overlay hazır olana kadar bekle
    let pollCount = 0;
    function injectMobileInfo() {
      const ov = document.getElementById('grid-overlay');
      if (!ov) {
        if (pollCount++ < 30) requestAnimationFrame(injectMobileInfo);
        return;
      }

      const mob = document.createElement('div');
      mob.id = 'proj-info-mobile';
      mob.style.cssText = `
        width: 100%;
        padding: 16px 0 24px;
        margin-bottom: 16px;
        border-bottom: 1px solid rgba(0,0,0,0.08);
        box-sizing: border-box;
      `;

      const titleEl = document.createElement('div');
      titleEl.style.cssText = `
        font-family: 'Space Grotesk', sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: .10em;
        text-transform: uppercase;
        color: rgba(0,0,0,0.78);
        margin-bottom: 14px;
        display: block;
        line-height: 1.5;
      `;
      mob.appendChild(titleEl);

      function addMobRow(key, val) {
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;flex-direction:column;margin-bottom:8px;';

        const keyEl = document.createElement('span');
        keyEl.style.cssText = `
          font-family: 'DM Mono', monospace;
          font-size: 8px;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.35);
          margin-bottom: 2px;
        `;
        keyEl.textContent = key;

        const valEl = document.createElement('span');
        valEl.style.cssText = `
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: .03em;
          color: rgba(0,0,0,0.65);
          line-height: 1.5;
        `;
        valEl.textContent = val;

        div.appendChild(keyEl);
        div.appendChild(valEl);
        mob.appendChild(div);
      }

      if (project.year)           addMobRow('Year', project.year);
      if (project.location)       addMobRow('Location', project.location);
      if (project.office)         addMobRow('Office', project.office);
      if (project.firm)           addMobRow('Firm', project.firm);
      if (project.program)        addMobRow('Program', project.program);
      if (project.responsibilities && project.responsibilities.length)
        addMobRow('Role', project.responsibilities.join(', '));
      if (project.description)    addMobRow('Info', project.description);

      // Grid container'ın önüne ekle
      const gridEl = ov.querySelector('div');
      ov.insertBefore(mob, gridEl);

      scrambleText(titleEl, project.title.toUpperCase(), 1200);
    }
    injectMobileInfo();
    return;
  }
  // ─────────────────────────────────────────────────────────────────────
  
  const panelTop   = 181;
  const panelLeft  = 100;
  const panelWidth = 520;
  const panelPad   = '20px 18px 22px';

  const panel = document.createElement('div');
  panel.id = 'proj-info-panel';
  panel.style.cssText = `
    position: fixed;
    left: ${panelLeft}px;
    top: ${panelTop}px;
    width: ${panelWidth}px;
    height: auto;
    z-index: 103;
    pointer-events: all;
    background: rgba(225,222,217,0.65);
    backdrop-filter: blur(3px);
    padding: ${panelPad};
    box-sizing: border-box;
    overflow: hidden;
    cursor: pointer;
  `;

  // Başlık
  const titleEl = document.createElement('span');
  titleEl.style.cssText = `
    font-family: 'Space Grotesk', sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .10em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.78);
    display: block;
    line-height: 1.5;
  `;
  panel.appendChild(titleEl);

  // Detay alanı — collapse olacak kısım
  const detailsEl = document.createElement('div');
  detailsEl.id = 'proj-info-details';
  detailsEl.style.cssText = `
    overflow: hidden;
    max-height: 300px;
    opacity: 1;
    transition: max-height 0.45s ease, opacity 0.35s ease, margin-top 0.35s ease;
    margin-top: 18px;
  `;
  panel.appendChild(detailsEl);

  const valueEls = [];

  function addRow(key, val) {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;flex-direction:column;margin-bottom:10px;';

    const keyEl = document.createElement('span');
    keyEl.style.cssText = `
      font-family: 'DM Mono', monospace;
      font-size: 8px;
      letter-spacing: .24em;
      text-transform: uppercase;
      color: rgba(0,0,0,0.38);
      margin-bottom: 2px;
    `;
    keyEl.textContent = key;

    const valEl = document.createElement('span');
    valEl.style.cssText = `
      font-family: 'Space Grotesk', sans-serif;
      font-size: 11px;
      font-weight: 300;
      letter-spacing: .04em;
      color: rgba(0,0,0,0.68);
      line-height: 1.5;
    `;
    valEl.textContent = val;

    div.appendChild(keyEl);
    div.appendChild(valEl);
    detailsEl.appendChild(div);
    valueEls.push({ el: valEl, text: val });
  }

  function addDoubleRow(left, right) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-direction:row;gap:24px;margin-bottom:10px;';

    [left, right].forEach(col => {
      if (!col) return;
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;flex-direction:column;';

      const keyEl = document.createElement('span');
      keyEl.style.cssText = `
        font-family: 'DM Mono', monospace;
        font-size: 8px;
        letter-spacing: .24em;
        text-transform: uppercase;
        color: rgba(0,0,0,0.38);
        margin-bottom: 2px;
      `;
      keyEl.textContent = col.key;

      const valEl = document.createElement('span');
      valEl.style.cssText = `
        font-family: 'Space Grotesk', sans-serif;
        font-size: 11px;
        font-weight: 300;
        letter-spacing: .04em;
        color: rgba(0,0,0,0.68);
        line-height: 1.5;
      `;
      valEl.textContent = col.val;

      div.appendChild(keyEl);
      div.appendChild(valEl);
      row.appendChild(div);
      valueEls.push({ el: valEl, text: col.val });
    });

    detailsEl.appendChild(row);
  }

  if (project.year)
    addRow('Year', project.year);

  const locationCol    = project.location ? { key: 'Location', val: project.location } : null;
  const coordinatesCol = project.coordinates && project.coordinates.length === 2
    ? { key: 'Coordinates', val: project.coordinates[0].toFixed(2) + ', ' + project.coordinates[1].toFixed(2) }
    : null;
  if (locationCol || coordinatesCol) {
    addDoubleRow(locationCol, coordinatesCol);
  }

  if (project.office)
    addRow('Office', project.office);
  if (project.firm)
    addRow('Firm', project.firm);
  if (project.program)
    addRow('Program', project.program);
  if (project.responsibilities && project.responsibilities.length)
    addRow('Role', project.responsibilities.join(', '));
  if (project.coworkers && project.coworkers.length)
    addRow('With', project.coworkers.join(', '));
  if (project.description)
    addRow('Info', project.description);

  document.body.appendChild(panel);

// ─── Collapse / Expand ───────────────────────────────────────────────
  let isCollapsed = false;
  let scrollListenerAttached = false;

  function collapse() {
    if (isCollapsed) return;
    isCollapsed = true;
    detailsEl.style.maxHeight = '0';
    detailsEl.style.opacity   = '0';
    detailsEl.style.marginTop = '0';
    const ov = document.getElementById('grid-overlay');
    if (ov) {
      ov.style.transition = 'top 0.45s ease';
      ov.style.top = (panelTop + 52) + 'px';
    }
  }

  function expand() {
    if (!isCollapsed) return;
    isCollapsed = false;
    detailsEl.style.maxHeight = '300px';
    detailsEl.style.opacity   = '1';
    detailsEl.style.marginTop = '18px';
    const ov = document.getElementById('grid-overlay');
    if (ov) {
      ov.style.transition = 'top 0.45s ease';
      ov.style.top = K2_OVERLAY_TOP + 'px';
    }
  }

  // Tıklayınca toggle
  panel.addEventListener('click', () => {
    isCollapsed ? expand() : collapse();
  });

  // grid-overlay hazır olunca scroll listener + timer bağla
  let pollCount = 0;
  function waitForOverlay() {
    const ov = document.getElementById('grid-overlay');
    if (ov) {
      // Scroll listener
      let lastScrollTop = 0;
      function onGridScroll() {
        const st = ov.scrollTop;
        if (st > lastScrollTop && st > 10) {
          collapse();
        } else if (st < lastScrollTop && st < 20) {
          expand();
        }
        lastScrollTop = st;
      }
      if (!scrollListenerAttached) {
        ov.addEventListener('scroll', onGridScroll);
        scrollListenerAttached = true;
      }

      // Observer: panel DOM'dan çıkınca temizle
      const observer = new MutationObserver(() => {
        if (!document.body.contains(panel)) {
          ov.removeEventListener('scroll', onGridScroll);
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true });

// Video sayfasında direkt collapsed başla, diğerlerinde 2.5sn sonra
      if (startCollapsed) {
        collapse();
      } else {
        setTimeout(collapse, 2500);
      }
      
    } else if (pollCount < 30) {
      pollCount++;
      requestAnimationFrame(waitForOverlay);
    }
  }
  waitForOverlay();


  // ─── Scan line ───────────────────────────────────────────────────────
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
    const panelH = panel.offsetHeight;
    if (scanPos > panelH) scanPos = -2;
    scanLine.style.top = scanPos + 'px';
    scanAnimId = requestAnimationFrame(animateScan);
  }
  scanAnimId = requestAnimationFrame(animateScan);

  // Panel DOM'dan çıkınca scan line'ı durdur
  const scanObserver = new MutationObserver(() => {
    if (!document.body.contains(panel)) {
      cancelAnimationFrame(scanAnimId);
      scanObserver.disconnect();
    }
  });
  scanObserver.observe(document.body, { childList: true, subtree: true });

  // ─── Glitch flash ────────────────────────────────────────────────────
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

  // ─── Scramble ────────────────────────────────────────────────────────
  scrambleText(titleEl, project.title.toUpperCase(), 1400);
  valueEls.forEach(({ el, text }, i) => {
    setTimeout(() => scrambleText(el, text, 1000), 400 + i * 200);
  });
}

// ─── Lightbox ─────────────────────────────────────────────────────────────
function openLightbox(images, startIndex, project) {
  const existing = document.getElementById('lightbox');
  if (existing) existing.remove();

  const isVideo = project && project.content_type === 'video' && project.video_provider === 'vimeo';

  let current = startIndex;

  const box = document.createElement('div');
  box.id = 'lightbox';
  box.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    z-index:900;background:rgba(14,13,12,0.94);
    display:flex;align-items:center;justify-content:center;
  `;

  const closeBtn = document.createElement('div');
  closeBtn.style.cssText = `
    position:fixed;top:24px;right:32px;
    font-family:'DM Mono',monospace;font-size:10px;
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
    if (e.key === 'Escape') closeLightbox();
    if (!isVideo) {
      if (e.key === 'ArrowRight') { current = (current + 1) % images.length; loadImg(current); }
      if (e.key === 'ArrowLeft')  { current = (current - 1 + images.length) % images.length; loadImg(current); }
    }
  }
  window.addEventListener('keydown', onKey);

  if (isVideo) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `width:80vw;max-width:1100px;position:relative;`;
    const ratio = document.createElement('div');
    ratio.style.cssText = 'padding:56.25% 0 0 0;position:relative;';
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${project.vimeo_id}?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479`;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
    ratio.appendChild(iframe);
    wrapper.appendChild(ratio);

    const vimeoScript = document.createElement('script');
    vimeoScript.src = 'https://player.vimeo.com/api/player.js';
    document.head.appendChild(vimeoScript);

    box.appendChild(wrapper);

  } else {
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
        transition:color 0.15s ease;font-family:'DM Mono',monospace;
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
      font-family:'DM Mono',monospace;font-size:10px;
      letter-spacing:.25em;color:rgba(255,255,255,0.35);
      z-index:901;user-select:none;
    `;

    box.appendChild(img);
    box.appendChild(makeArrow('left'));
    box.appendChild(makeArrow('right'));
    box.appendChild(counter);

    loadImg(current);
  }

  box.appendChild(closeBtn);
  document.body.appendChild(box);

  box.style.opacity = '0';
  box.style.transition = 'opacity 0.25s ease';
  requestAnimationFrame(() => { box.style.opacity = '1'; });
}

// ─── Menü bağlantıları + Hash Routing init ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('wb')?.addEventListener('click',   () => showSection('works'));
  document.getElementById('ab')?.addEventListener('click',   () => showSection('academic'));
  document.getElementById('abtb')?.addEventListener('click', () => showSection('about'));
  document.getElementById('cb')?.addEventListener('click',   () => showSection('contact'));

  // Footer email linki → contact formu
  document.getElementById('email-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    runGlitch(() => {
      clearPanel();
      getOv().style.opacity = '0';
      navState = { section: 'contact', category: null, subcategory: null, project: null };
      pushHash('contact');
      renderContact();
    });
  });

  // Geri/ileri buton desteği
  window.addEventListener('popstate', () => parseAndNavigate());

  // Sayfa ilk yüklendiğinde URL'deki hash'e git
  if (window.location.hash && window.location.hash !== '#') {
    parseAndNavigate();
  }
});