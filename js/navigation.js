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

    // Geri butonu
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

  runGlitch(async () => {
    navState.subcategory = subcategoryId;
    navState.project     = null;

    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel panel-grid';

    // Geri butonu
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

      // Geri: subcategory
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
    window.grid3d = showPhotoGrid(project);
  });
}

// ─── ACADEMIC ─────────────────────────────────────────────────────────────
function renderAcademic() {
  const sections = [
    {
      id: 'projects',
      label: 'Projects',
      subs: ['Bachelor', 'Master', 'PhD']
    },
    {
      id: 'articles',
      label: 'Articles',
      subs: ['Essays', 'Reviews', 'Writings']
    },
    {
      id: 'research',
      label: 'Research',
      subs: ['Media Architecture', 'Immersive Media', 'Artistic Research']
    },
    {
      id: 'archive',
      label: 'Archive',
      subs: ['Fremde Türen / El Kapıları']
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
  list.innerHTML = sections.map(s => `
    <div class="category-item">
      <div class="cat-label">${s.label}</div>
      <div class="subcat-list-inline">${s.subs.join(' &middot; ')}</div>
    </div>
  `).join('');
  el.appendChild(list);

  root.appendChild(el);
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

  // Accordion listesi
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
  const content = {
    bio:        '<p>— coming soon —</p>',
    education:  '<p>— coming soon —</p>',
    experience: '<p>— coming soon —</p>',
    teaching:   '<p>— coming soon —</p>',
    software:   '<p>— coming soon —</p>'
  };
  return `<div class="accordion-content">${content[sectionId] || ''}</div>`;
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
