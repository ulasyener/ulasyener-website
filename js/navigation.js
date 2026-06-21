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
  category:    null,  // 'interior' vb.
  subcategory: null,  // 'interior-retail' vb.
  project:     null   // 'cafe' vb.
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
    if (isLast) return; // aktif sayfa nav'da gösterilmiyor, sadece back butonları

    const btn = document.createElement('span');
    btn.className = 'back-btn';
    btn.textContent = '← ' + item.label;
    btn.addEventListener('click', () => runGlitch(item.action));
    nav.appendChild(btn);
  });

  return nav;
}

// ─── WORKS ────────────────────────────────────────────────────────────────
async function renderWorks() {
  const res  = await fetch('data/works.json');
  const data = await res.json();
  const root = getPanelRoot();

  const el = document.createElement('div');
  el.className = 'panel';

  const label = document.createElement('div');
  label.className = 'sec-label sec-label--home';
  label.textContent = 'Works';
  label.addEventListener('click', goHome);
  el.appendChild(label);

  const list = document.createElement('div');
  list.className = 'category-list';
  list.innerHTML = data.categories.map(cat => `
    <div class="category-item" data-cat="${cat.id}">
      <div class="cat-label">${cat.label}</div>
      <div class="cat-desc">${cat.description}</div>
    </div>
  `).join('');
  el.appendChild(list);

  list.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => showCategory(item.dataset.cat));
  });

  root.appendChild(el);
}

// ─── Kategori (ör. Interior) ──────────────────────────────────────────────
async function showCategory(categoryId) {
  const res  = await fetch('data/works.json');
  const data = await res.json();
  const cat  = data.categories.find(c => c.id === categoryId);
  if (!cat) return;

  runGlitch(() => {
    navState.category    = categoryId;
    navState.subcategory = null;

    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel';

    // Geri butonu: ← WORKS
    el.appendChild(makePanelNav([
      { label: 'Works', action: () => showSection('works') },
      { label: cat.label }
    ]));

    // Başlık — tıklanınca Works'e döner
    const label = document.createElement('div');
    label.className = 'sec-label sec-label--home';
    label.textContent = cat.label;
    label.addEventListener('click', () => runGlitch(() => showSection('works')));
    el.appendChild(label);

    const list = document.createElement('div');
    list.className = 'subcategory-list';
    list.innerHTML = cat.subcategories.map(sub => `
      <div class="subcat-item" data-sub="${sub.id}">
        <div class="subcat-label">${sub.label}</div>
        ${sub.description ? `<div class="cat-desc">${sub.description}</div>` : ''}
      </div>
    `).join('');
    el.appendChild(list);

    list.querySelectorAll('.subcat-item').forEach(item => {
      item.addEventListener('click', () => showSubcategory(categoryId, item.dataset.sub));
    });

    root.appendChild(el);
  });
}

// ─── Alt kategori → Kademe 1 grid ─────────────────────────────────────────
async function showSubcategory(categoryId, subcategoryId) {
  const res  = await fetch('data/works.json');
  const data = await res.json();
  const cat  = data.categories.find(c => c.id === categoryId);
  const sub  = cat?.subcategories.find(s => s.id === subcategoryId);
  if (!sub) return;

  // Sound/Radio özel sayfası
  if (subcategoryId === 'sound-radio') {
    showRadio(categoryId, cat.label);
    return;
  }

  runGlitch(async () => {
    navState.subcategory = subcategoryId;
    navState.project     = null;

    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel panel-grid';

    // Geri butonları: ← WORKS  ← CAT
    el.appendChild(makePanelNav([
      { label: 'Works',   action: () => showSection('works') },
      { label: cat.label, action: () => showCategory(categoryId) },
      { label: sub.label }
    ]));

    // Başlık — tıklanınca category'e döner
    const label = document.createElement('div');
    label.className = 'sec-label sec-label--home';
    label.textContent = sub.label;
    label.addEventListener('click', () => runGlitch(() => showCategory(categoryId)));
    el.appendChild(label);

    root.appendChild(el);

    if (sub.projects.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = '— coming soon —';
      el.appendChild(empty);
      return;
    }

    const projects = await Promise.all(
      sub.projects.map(pid => fetch(`data/projects/${pid}.json`).then(r => r.json()))
    );

    window.grid3d = showProjectGrid(projects, (proj) => {
      openPhotoGrid(proj, categoryId, subcategoryId, cat.label, sub.label);
    });

  });
}

// ─── Kademe 2: Proje fotoğrafları ─────────────────────────────────────────
function openPhotoGrid(project, categoryId, subcategoryId, catLabel, subLabel) {
  runGlitch(() => {
    navState.project = project.id;

    const root        = getPanelRoot();
    const existingNav = root.querySelector('.panel-nav');

    if (existingNav) {
      existingNav.innerHTML = '';

      // ← WORKS
      const backWorks = document.createElement('span');
      backWorks.className   = 'back-btn';
      backWorks.textContent = '← Works';
      backWorks.addEventListener('click', () => runGlitch(() => showSection('works')));
      existingNav.appendChild(backWorks);

      // ← CAT
      const backCat = document.createElement('span');
      backCat.className   = 'back-btn';
      backCat.textContent = '← ' + catLabel;
      backCat.addEventListener('click', () => runGlitch(() => showCategory(categoryId)));
      existingNav.appendChild(backCat);

      // ← SUBCAT
      const backBtn = document.createElement('span');
      backBtn.className   = 'back-btn';
      backBtn.textContent = '← ' + subLabel;
      backBtn.addEventListener('click', () =>
        runGlitch(() => showSubcategory(categoryId, subcategoryId))
      );
      existingNav.appendChild(backBtn);

      // Proje başlığı
      const title = document.createElement('span');
      title.className = 'proj-nav-title';
      title.innerHTML = `${project.title} <span style="opacity:.4">${project.year}</span>`;
      existingNav.appendChild(title);
    }

    if (window.grid3d && window.grid3d.destroy) window.grid3d.destroy();
    window.grid3d = showPhotoGrid(project, (data) => {
      if (project.images && project.images.length) {
        openLightbox(project.images, data.index);
      }
    });

    // Sol bilgi paneli
    renderProjectInfoPanel(project);
  });
}

// ─── Scramble Text Efekti ─────────────────────────────────────────────────
function scrambleText(el, finalText, duration = 1800) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const steps = Math.floor(duration / 60);
  let step = 0;
  // Her pozisyon için sabit rastgele karakter — titremez, sadece reveal olur
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

  // Mobilde bilgi paneli gösterilmez — ekran çok küçük
  if (isMobile) return;
  const fovRad     = (50 * Math.PI) / 180;
  const visibleH   = 2 * Math.tan(fovRad / 2) * 7.5;
  const tileSize   = isMobile ? 2.2 : 2.8;
  const tilePx     = Math.round((tileSize / visibleH) * window.innerHeight);
  const panelTop   = isMobile ? 160 : 235;
  const panelLeft  = isMobile ? 16  : 100;
  const panelWidth = isMobile ? Math.min(160, window.innerWidth - 32) : 180;
  const panelPad   = isMobile ? '12px 14px 16px' : '20px 18px 22px';

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
  panel.style.position = 'fixed';
  panel.style.overflow = 'hidden';
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
    const delay = 3000 + Math.random() * 5000; // 3-8 sn arası
    glitchTimeout = setTimeout(() => {
      if (!document.body.contains(panel)) return;

      // Kısa bir kayma + opacity flash
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

  // Scramble efektleri — stagger ile sırayla
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

  // Fotoğraf
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
    // Sayaç güncelle
    counter.textContent = (index + 1) + ' / ' + images.length;
  }

  // ── Ok butonları ──
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

  // ── Sayaç ──
  const counter = document.createElement('div');
  counter.style.cssText = `
    position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
    font-family:'IBM Plex Mono',monospace;font-size:10px;
    letter-spacing:.25em;color:rgba(255,255,255,0.35);
    z-index:901;user-select:none;
  `;

  // ── Kapat butonu ──
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

  // ── Klavye ──
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

  // İlk fotoğrafı yükle
  loadImg(current);

  // Fade in
  box.style.opacity = '0';
  box.style.transition = 'opacity 0.25s ease';
  requestAnimationFrame(() => { box.style.opacity = '1'; });
}

// ─── SOUND / RADIO — özel sayfa ───────────────────────────────────────────
function showRadio(categoryId, catLabel) {
  runGlitch(() => {
    navState.subcategory = 'sound-radio';
    navState.project     = null;

    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel';

    // Geri butonları: ← WORKS  ← SOUND
    el.appendChild(makePanelNav([
      { label: 'Works',   action: () => showSection('works') },
      { label: catLabel,  action: () => showCategory(categoryId) },
      { label: 'Radio' }
    ]));

    // Başlık — tıklanınca Sound kategorisine döner
    const label = document.createElement('div');
    label.className = 'sec-label sec-label--home';
    label.textContent = 'Radio';
    label.addEventListener('click', () => runGlitch(() => showCategory(categoryId)));
    el.appendChild(label);

    const radioSections = [
      { id: 'live',    label: 'Live',    desc: 'Live radio broadcasts and streaming sessions.' },
      { id: 'archive', label: 'Archive', desc: 'Archival recordings from past broadcasts and sessions.' },
      { id: 'pirate',  label: 'Pirate',  desc: 'Recordings and transmissions from independent pirate radio platforms.' }
    ];

    const list = document.createElement('div');
    list.className = 'subcategory-list';
    radioSections.forEach(s => {
      const item = document.createElement('div');
      item.className = 'subcat-item';
      item.innerHTML = `
        <div class="subcat-label">${s.label}</div>
        <div class="cat-desc">${s.desc}</div>
      `;
      item.addEventListener('click', () => showRadioSection(s, categoryId, catLabel));
      list.appendChild(item);
    });
    el.appendChild(list);

    root.appendChild(el);
  });
}

// ─── Radio alt sayfa ──────────────────────────────────────────────────────
function showRadioSection(section, categoryId, catLabel) {
  runGlitch(() => {
    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel';

    el.appendChild(makePanelNav([
      { label: 'Works',   action: () => showSection('works') },
      { label: catLabel,  action: () => showCategory(categoryId) },
      { label: 'Radio',   action: () => showRadio(categoryId, catLabel) },
      { label: section.label }
    ]));

    const label = document.createElement('div');
    label.className = 'sec-label sec-label--home';
    label.textContent = section.label;
    label.addEventListener('click', () => runGlitch(() => showRadio(categoryId, catLabel)));
    el.appendChild(label);

    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '— coming soon —';
    el.appendChild(empty);

    root.appendChild(el);
  });
}

// ─── ACADEMIC ─────────────────────────────────────────────────────────────
function renderAcademic() {
  const sections = [
    {
      id: 'projects',
      label: 'Projects',
      subs: [
        { id: 'bachelor', label: 'Bachelor' },
        { id: 'master',   label: 'Master' },
        { id: 'phd',      label: 'PhD' }
      ]
    },
    {
      id: 'articles',
      label: 'Articles',
      subs: [
        { id: 'essays',   label: 'Essays' },
        { id: 'reviews',  label: 'Reviews' },
        { id: 'writings', label: 'Writings' }
      ]
    },
    {
      id: 'research',
      label: 'Research',
      subs: [
        { id: 'media-architecture', label: 'Media Architecture' },
        { id: 'immersive-media',    label: 'Immersive Media' },
        { id: 'artistic-research',  label: 'Artistic Research' }
      ]
    },
    {
      id: 'archive',
      label: 'Archive',
      subs: [
        { id: 'fremde-tueren', label: 'Fremde Türen / El Kapıları' }
      ]
    }
  ];

  const root = getPanelRoot();
  const el   = document.createElement('div');
  el.className = 'panel';

  const label = document.createElement('div');
  label.className = 'sec-label sec-label--home';
  label.textContent = 'Academic';
  label.addEventListener('click', goHome);
  el.appendChild(label);

  const list = document.createElement('div');
  list.className = 'category-list';

  sections.forEach(s => {
    const item = document.createElement('div');
    item.className = 'category-item';
    item.innerHTML = `
      <div class="cat-label">${s.label}</div>
      <div class="subcat-list-inline">${s.subs.map(sub => sub.label).join(' &middot; ')}</div>
    `;
    item.addEventListener('click', () => showAcademicSection(s));
    list.appendChild(item);
  });

  el.appendChild(list);
  root.appendChild(el);
}

// ─── Academic alt sayfa ────────────────────────────────────────────────────
function showAcademicSection(section) {
  // Archive → Fremde Türen için özel sayfa
  if (section.id === 'archive') {
    showArchiveSection(section);
    return;
  }

  runGlitch(() => {
    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel';

    // Geri: ← ACADEMIC
    el.appendChild(makePanelNav([
      { label: 'Academic', action: () => showSection('academic') },
      { label: section.label }
    ]));

    // Başlık — tıklanınca Academic'e döner
    const label = document.createElement('div');
    label.className = 'sec-label sec-label--home';
    label.textContent = section.label;
    label.addEventListener('click', () => runGlitch(() => showSection('academic')));
    el.appendChild(label);

    const list = document.createElement('div');
    list.className = 'subcategory-list';

    section.subs.forEach(sub => {
      const item = document.createElement('div');
      item.className = 'subcat-item empty';
      item.innerHTML = `
        <div class="subcat-label">${sub.label}</div>
        <div class="cat-desc">— coming soon —</div>
      `;
      list.appendChild(item);
    });

    el.appendChild(list);
    root.appendChild(el);
  });
}

// ─── Archive → Fremde Türen listesi ───────────────────────────────────────
function showArchiveSection(section) {
  runGlitch(() => {
    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel';

    el.appendChild(makePanelNav([
      { label: 'Academic', action: () => showSection('academic') },
      { label: section.label }
    ]));

    const label = document.createElement('div');
    label.className = 'sec-label sec-label--home';
    label.textContent = section.label;
    label.addEventListener('click', () => runGlitch(() => showSection('academic')));
    el.appendChild(label);

    const list = document.createElement('div');
    list.className = 'subcategory-list';

    section.subs.forEach(sub => {
      const item = document.createElement('div');
      item.className = 'subcat-item';
      item.innerHTML = `<div class="subcat-label">${sub.label}</div>`;
      item.addEventListener('click', () => showFremdeTueren(section));
      list.appendChild(item);
    });

    el.appendChild(list);
    root.appendChild(el);
  });
}

// ─── Fremde Türen sayfası ─────────────────────────────────────────────────
function showFremdeTueren(archiveSection) {
  runGlitch(() => {
    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel';

    el.appendChild(makePanelNav([
      { label: 'Academic', action: () => showSection('academic') },
      { label: 'Archive',  action: () => showArchiveSection(archiveSection) },
      { label: 'Fremde Türen / El Kapıları' }
    ]));

    const label = document.createElement('div');
    label.className = 'sec-label sec-label--home';
    label.textContent = 'Fremde Türen / El Kapıları';
    label.addEventListener('click', () => runGlitch(() => showArchiveSection(archiveSection)));
    el.appendChild(label);

    const sections = [
      {
        title: 'Archive',
        items: [
          { label: 'Texts',         desc: 'Literature, poetry, stories, and written narratives related to Turkish migration to Germany.' },
          { label: 'Music',         desc: 'Albums, songs, records, and cassette tapes preserving sonic memories and cultural expressions.' },
          { label: 'Moving Images', desc: 'Films, television programmes, posters, video recordings, and visual representations of migration.' },
          { label: 'Printed Media', desc: 'Newspapers, magazines, brochures, and other printed materials documenting migration histories.' },
          { label: 'Voices',        desc: 'Interviews, testimonies, conversations, and audio recordings collected through oral history practices.' },
          { label: 'Documents',     desc: 'Letters, manuscripts, personal collections, and various archival materials.' },
          { label: 'Sources',       desc: 'Written, visual, and audiovisual references, bibliographies, and external archives.' }
        ]
      },
      {
        title: 'Research',
        items: [
          { label: 'Methods',   desc: 'Autoethnography · Oral History · Media Archaeology · Practice-Based Artistic Research · Marxist Research Methods' },
          { label: 'Theory',    desc: 'Marxist Theory · Memory Studies · Migration Studies · Media Theory · Spatial Theory' },
          { label: 'Practices', desc: 'Documentary Practices · Archival Reconstruction · Spatial Storytelling · Audiovisual Experiments · Interactive Media · Radio & Podcast Production · Digital Heritage · Worldbuilding' },
          { label: 'Outputs',   desc: 'PhD Project · Essays · Articles · Publications · Conference Papers · Lectures · Documents · Bibliographies' }
        ]
      },
      {
        title: 'Works',
        items: [
          { label: 'Films',            desc: 'Documentary Films · Video Essays' },
          { label: 'Audio',            desc: 'Radio Programmes · Podcasts · Sound Works' },
          { label: 'Installations',    desc: 'Multimedia Installations · Spatial Installations' },
          { label: 'Interactive Media',desc: 'XR Experiences · Interactive Narratives · Digital Archives' },
          { label: 'Games',            desc: 'Open World Environments · Narrative Experiments' },
          { label: 'Web',              desc: 'Websites · Online Platforms' },
          { label: 'Exhibitions',      desc: 'Exhibitions · Screenings · Presentations' }
        ]
      }
    ];

    sections.forEach(sec => {
      const secLabel = document.createElement('div');
      secLabel.className = 'sec-label';
      secLabel.textContent = sec.title;
      el.appendChild(secLabel);

      const list = document.createElement('div');
      list.className = 'subcategory-list';

      sec.items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'subcat-item empty';
        div.innerHTML = `
          <div class="subcat-label">${item.label}</div>
          <div class="cat-desc">${item.desc}</div>
        `;
        list.appendChild(div);
      });

      el.appendChild(list);
    });

    root.appendChild(el);
  });
}

// ─── ABOUT ────────────────────────────────────────────────────────────────
function renderAbout() {
  const sections = [
    { id: 'bio',        label: 'Bio' },
    { id: 'education',  label: 'Education' },
    { id: 'experience', label: 'Work Experience' },
    { id: 'teaching',   label: 'Teaching' },
    { id: 'software',   label: 'Software' }
  ];

  const root = getPanelRoot();
  const el   = document.createElement('div');
  el.className = 'panel';

  const label = document.createElement('div');
  label.className = 'sec-label sec-label--home';
  label.textContent = 'About';
  label.addEventListener('click', goHome);
  el.appendChild(label);

  const list = document.createElement('div');
  list.className = 'category-list';

  sections.forEach(s => {
    const item = document.createElement('div');
    item.className = 'category-item accordion-item';
    item.innerHTML = `
      <div class="cat-label">${s.label}</div>
      <div class="cat-arrow accordion-arrow">&#x002B;</div>
      <div class="accordion-body"></div>
    `;
    item.querySelector('.cat-label').addEventListener('click', () => toggleAccordion(item, s.id));
    item.querySelector('.accordion-arrow').addEventListener('click', () => toggleAccordion(item, s.id));
    list.appendChild(item);
  });

  // Download bölümü
  const dlItem = document.createElement('div');
  dlItem.className = 'category-item';
  dlItem.innerHTML = `
    <div class="cat-label">Download</div>
    <div class="download-btns">
      <a class="dl-btn" href="files/portfolio.pdf" download>Portfolio</a>
      <a class="dl-btn" href="files/cv.pdf" download>CV</a>
    </div>
  `;
  list.appendChild(dlItem);

  el.appendChild(list);
  root.appendChild(el);
}

function toggleAccordion(item, sectionId) {
  const isOpen = item.classList.contains('is-open');
  const arrow  = item.querySelector('.accordion-arrow');
  const body   = item.querySelector('.accordion-body');

  if (isOpen) {
    item.classList.remove('is-open');
    arrow.innerHTML = '&#x002B;';
    body.innerHTML  = '';
    body.style.maxHeight = '0';
  } else {
    item.classList.add('is-open');
    arrow.innerHTML = '&#x2212;';
    body.innerHTML  = getAboutContent(sectionId);
    body.style.maxHeight = body.scrollHeight + 'px';
  }
}

function getAboutContent(sectionId) {
  if (sectionId === 'bio') {
    return `
      <div class="accordion-content">
        <p>Ulas Yener is an architect, 3D artist, and interdisciplinary media researcher based in Germany. With nearly fifteen years of experience in architecture, visualization, and digital media production, his practice combines spatial design with moving images, photography, sound, and immersive technologies. His work explores memory, migration, and cultural narratives through documentary practices, archives, and interactive storytelling, creating experiences that move between physical and virtual spaces.</p>
        <p style="margin-top:12px;">Alongside his professional work in architecture and visualization, he develops artistic and research-based projects that investigate new forms of storytelling and the relationship between media, memory, and space.</p>
      </div>`;
  }

  if (sectionId === 'education') {
    const items = [
      { period: '2022 – Present', title: 'PhD Candidate, Practice-Based Artistic Research', sub: 'Bauhaus-Universität Weimar' },
      { period: '2017 – 2021',    title: 'M.Sc., MediaArchitecture',                        sub: 'Bauhaus-Universität Weimar' },
      { period: '2014 – 2017',    title: 'M.Sc., Architectural Design Computing',            sub: 'Istanbul Technical University' },
      { period: '2013',           title: 'Guest Student, M.Sc. Industrial Design',           sub: 'Istanbul Technical University' },
      { period: '2008 – 2012',    title: 'B.F.A., Interior Architecture and Environmental Design', sub: 'Hacettepe University' }
    ];
    return `<div class="accordion-content">${items.map(it => `
      <div class="about-row">
        <div class="about-period">${it.period}</div>
        <div class="about-detail">
          <div class="about-title">${it.title}</div>
          <div class="about-sub">${it.sub}</div>
        </div>
      </div>`).join('')}</div>`;
  }

  if (sectionId === 'experience') {
    const items = [
      { period: '2023 – 2026', title: 'Competition Management Architect (Pre-Examiner)', sub: 'Kohler Grohe Architekten, Stuttgart' },
      { period: '2022 – 2023', title: 'Freelance XR Designer',                           sub: 'Aesculap AG, Tuttlingen' },
      { period: '2018 – 2024', title: 'Freelance Lecturer',                              sub: 'Bauhaus-Universität Weimar, Faculty of Architecture and Urbanism' },
      { period: '2017 – 2023', title: 'Freelance Architectural Designer',                sub: 'Schmitz-Riol Architekten, Weimar' },
      { period: '2014 – 2016', title: 'Interior Architect and Product Designer',         sub: '304 Design, Istanbul' },
      { period: '2013 – 2014', title: 'Interior Architect and Product Designer',         sub: 'cisimdesign, Istanbul' },
      { period: '2012 – 2013', title: 'Interior Architect and Product Designer',         sub: 'projemasif, Istanbul' }
    ];
    return `<div class="accordion-content">${items.map(it => `
      <div class="about-row">
        <div class="about-period">${it.period}</div>
        <div class="about-detail">
          <div class="about-title">${it.title}</div>
          <div class="about-sub">${it.sub}</div>
        </div>
      </div>`).join('')}</div>`;
  }

  if (sectionId === 'teaching') {
    const items = [
      { period: '2023 – 2024', title: 'Spatial Narratives, Lecturer',                    sub: 'Bauhaus Spring School 2024, Bauhaus-Universität Weimar' },
      { period: '2023 – 2024', title: 'Re-Located Stories, Lecturer',                    sub: 'Faculty of Architecture and Urbanism, Bauhaus-Universität Weimar' },
      { period: '2021 – 2022', title: 'Contemporary Tools for Design, Lecturer',         sub: 'Faculty of Architecture and Urbanism, Bauhaus-Universität Weimar' },
      { period: '2020 – 2021', title: 'Modelling Bauhaus Workshop, Workshop Instructor', sub: 'Faculty of Art and Design, Kadir Has University' },
      { period: '2019 – 2020', title: 'Professional Presentation Methods, Lecturer',     sub: 'Faculty of Architecture and Urbanism, Bauhaus-Universität Weimar' },
      { period: '2018 – 2019', title: 'Bauhaus-Oasen-trans-lokal vernetzen, Workshop Instructor', sub: 'Faculty of Architecture and Urbanism, Bauhaus-Universität Weimar' },
      { period: '2018 – 2019', title: 'Introduction to Architectural Modelling, Lecturer', sub: 'Faculty of Architecture and Urbanism, Bauhaus-Universität Weimar' }
    ];
    return `<div class="accordion-content">${items.map(it => `
      <div class="about-row">
        <div class="about-period">${it.period}</div>
        <div class="about-detail">
          <div class="about-title">${it.title}</div>
          <div class="about-sub">${it.sub}</div>
        </div>
      </div>`).join('')}</div>`;
  }

  if (sectionId === 'software') {
    const categories = [
      { label: '2D · 3D · BIM',        items: ['Autodesk 3ds Max', 'Autodesk AutoCAD', 'Vectorworks', 'Blender', 'Cinema 4D', 'V-Ray Renderer'] },
      { label: 'Image · Video · Sound', items: ['Adobe Photoshop', 'Adobe Lightroom', 'Adobe Illustrator', 'Adobe InDesign', 'Adobe After Effects', 'Adobe Premiere Pro', 'Adobe Audition', 'Reaper', 'Audacity', 'Ableton Live', 'Serato'] },
      { label: 'Game Engine',           items: ['Unreal Engine', 'Unity 3D'] },
      { label: '3D & Photogrammetry',   items: ['Adobe Substance 3D Painter', 'Adobe Substance 3D Designer', 'Autodesk Recap Pro', 'Reality Capture', 'Polycam'] },
      { label: 'Computational Tools',   items: ['Python', 'TouchDesigner', 'Three.js', 'ChatGPT', 'Claude', 'Leonardo AI', 'Midjourney', 'RunwayML'] },
      { label: 'Digital Tools',         items: ['Microsoft Office', 'Canva', 'WordPress'] }
    ];
    return `<div class="accordion-content">${categories.map(cat => `
      <div class="about-row">
        <div class="about-period">${cat.label}</div>
        <div class="about-detail">
          <div class="about-sub">${cat.items.join(', ')}</div>
        </div>
      </div>`).join('')}</div>`;
  }

  return `<div class="accordion-content"><p>— coming soon —</p></div>`;
}

// ─── CONTACT ──────────────────────────────────────────────────────────────
function renderContact() {
  const root = getPanelRoot();
  const el   = document.createElement('div');
  el.className = 'panel';

  const label = document.createElement('div');
  label.className = 'sec-label sec-label--home';
  label.textContent = 'Contact';
  label.addEventListener('click', goHome);
  el.appendChild(label);

  const list = document.createElement('div');
  list.className = 'category-list';

  // INFO
  const infoItem = document.createElement('div');
  infoItem.className = 'category-item accordion-item';
  infoItem.innerHTML = `
    <div class="cat-label">Info</div>
    <div class="cat-arrow accordion-arrow">&#x002B;</div>
    <div class="accordion-body"></div>
  `;
  infoItem.querySelector('.cat-label').addEventListener('click', () => toggleContactAccordion(infoItem, 'info'));
  infoItem.querySelector('.accordion-arrow').addEventListener('click', () => toggleContactAccordion(infoItem, 'info'));
  list.appendChild(infoItem);

  // SOCIAL
  const socialItem = document.createElement('div');
  socialItem.className = 'category-item accordion-item';
  socialItem.innerHTML = `
    <div class="cat-label">Social</div>
    <div class="cat-arrow accordion-arrow">&#x002B;</div>
    <div class="accordion-body"></div>
  `;
  socialItem.querySelector('.cat-label').addEventListener('click', () => toggleContactAccordion(socialItem, 'social'));
  socialItem.querySelector('.accordion-arrow').addEventListener('click', () => toggleContactAccordion(socialItem, 'social'));
  list.appendChild(socialItem);

  el.appendChild(list);
  root.appendChild(el);
}

function toggleContactAccordion(item, sectionId) {
  const isOpen = item.classList.contains('is-open');
  const arrow  = item.querySelector('.accordion-arrow');
  const body   = item.querySelector('.accordion-body');

  if (isOpen) {
    item.classList.remove('is-open');
    arrow.innerHTML      = '&#x002B;';
    body.innerHTML       = '';
    body.style.maxHeight = '0';
  } else {
    item.classList.add('is-open');
    arrow.innerHTML = '&#x2212;';
    body.innerHTML  = getContactContent(sectionId);
    body.style.maxHeight = body.scrollHeight + 'px';
  }
}

function getContactContent(sectionId) {
  if (sectionId === 'info') {
    return `
      <div class="accordion-content">
        <div class="contact-row"><span class="contact-key">Email</span><a href="mailto:hello@ulasyener.com" class="contact-val">hello@ulasyener.com</a></div>
        <div class="contact-row"><span class="contact-key">Location</span><span class="contact-val">—</span></div>
        <div class="contact-row"><span class="contact-key">Availability</span><span class="contact-val">—</span></div>
      </div>
    `;
  }
  if (sectionId === 'social') {
    const links = [
      { label: 'Instagram', href: '#' },
      { label: 'LinkedIn',  href: 'https://linkedin.com/in/ulasynr' },
      { label: 'Behance',   href: 'https://behance.net/ulasynr' },
      { label: 'Vimeo',     href: 'https://vimeo.com/ulasyener' },
      { label: 'Patreon',   href: '#' },
      { label: 'Substack',  href: '#' },
      { label: 'GitHub',    href: '#' },
      { label: 'bauhaus.fm',href: '#' }
    ];
    return `
      <div class="accordion-content social-links">
        ${links.map(l => `<a class="social-link-btn" href="${l.href}" target="_blank">${l.label}</a>`).join('')}
      </div>
    `;
  }
  return '';
}

// ─── Menü bağlantıları ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('wb')?.addEventListener('click',   () => showSection('works'));
  document.getElementById('ab')?.addEventListener('click',   () => showSection('academic'));
  document.getElementById('abtb')?.addEventListener('click', () => showSection('about'));
  document.getElementById('cb')?.addEventListener('click',   () => showSection('contact'));
});
