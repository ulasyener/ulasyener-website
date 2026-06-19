// Glitch gecis efekti
const glitchImgs = [
  'images/glitch-0.gif',
  'images/glitch-1.gif',
  'images/glitch-2.gif'
];
let glitchIdx = 0;
let glitchActive = false;

function runGlitch(callback) {
  if (glitchActive) { if (callback) callback(); return; }
  glitchActive = true;

  const img = document.createElement('img');
  img.src = glitchImgs[glitchIdx % glitchImgs.length];
  glitchIdx++;
  img.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:999;pointer-events:none;object-fit:cover;opacity:0.85;';
  document.body.appendChild(img);

  setTimeout(() => {
    document.body.removeChild(img);
    glitchActive = false;
    if (callback) callback();
  }, 120);
}

// Panel sistemi - Works, Academic, About, Contact

const PANELS = {
  works: {
    label: 'Works',
    type: 'category-list',
    dataFile: 'data/works.json'
  },
  academic: {
    label: 'Academic',
    type: 'static'
  },
  about: {
    label: 'About',
    type: 'static'
  },
  contact: {
    label: 'Contact',
    type: 'static'
  }
};

let currentPanel = null;
let currentSub = null;

function showPanel(panelId) {
  runGlitch(() => {
    document.getElementById('ov').style.opacity = '0';
    const root = document.getElementById('panel-root');
    root.innerHTML = '';
    currentPanel = panelId;
    currentSub = null;

    const panel = PANELS[panelId];
    if (!panel) return;

    if (panel.type === 'category-list') {
      loadCategoryPanel(panelId, panel, root);
    } else {
      loadStaticPanel(panelId, panel, root);
    }
  });
}
function goHome() {
  runGlitch(() => {
    document.getElementById('ov').style.opacity = '1';
    const root = document.getElementById('panel-root');
    root.innerHTML = '';
    currentPanel = null;
    currentSub = null;
  });
}

// Works: kategori listesi
async function loadCategoryPanel(panelId, panel, root) {
  const res = await fetch(panel.dataFile);
  const data = await res.json();

  const el = document.createElement('div');
  el.id = 'wp';
  el.className = 'panel';
  el.innerHTML = `
    <span class="home-btn" onclick="goHome()">&#8962; Home</span>
    <div class="sec-label">${panel.label}</div>
    ${data.categories.map(cat => `
      <div class="work-item" id="${cat.id}-item" onclick="showSubPanel('${cat.id}')">
        <div class="wt">${cat.label}</div>
        <div class="wd">${cat.description}</div>
        <div class="wa">&#x2197;</div>
      </div>
    `).join('')}
  `;
  root.appendChild(el);
}

// Alt panel: kategori içindeki projeler
async function showSubPanel(categoryId) {
  const res = await fetch('data/works.json');
  const data = await res.json();
  const cat = data.categories.find(c => c.id === categoryId);
  if (!cat) return;

  const root = document.getElementById('panel-root');
  root.innerHTML = '';
  currentSub = categoryId;

  const el = document.createElement('div');
  el.id = `${categoryId}-panel`;
  el.className = 'panel';
  el.innerHTML = `
    <div class="panel-back" onclick="showPanel('works')">&#8592; Works</div>
    <span class="home-btn" onclick="goHome()">&#8962; Home</span>
    <div class="sec-label">${cat.label}</div>
    <div id="project-grid" class="project-grid"></div>
  `;
  root.appendChild(el);

  if (cat.projects && cat.projects.length > 0) {
    loadProjects(cat.projects);
  }
}

// Statik paneller (About, Contact vs.)
function loadStaticPanel(panelId, panel, root) {
  const el = document.createElement('div');
  el.className = 'panel';
  el.innerHTML = `
    <span class="home-btn" onclick="goHome()">&#8962; Home</span>
    <div class="sec-label">${panel.label}</div>
    <div class="panel-content" id="${panelId}-content"></div>
  `;
  root.appendChild(el);
}

// Menü bağlantıları
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('wb')?.addEventListener('click', () => showPanel('works'));
  document.getElementById('ab')?.addEventListener('click', () => showPanel('academic'));
  document.getElementById('abtb')?.addEventListener('click', () => showPanel('about'));
  document.getElementById('cb')?.addEventListener('click', () => showPanel('contact'));
});
