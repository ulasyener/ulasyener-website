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

// ─── Kategori ─────────────────────────────────────────────────────────────
async function showCategory(categoryId) {
  const res  = await fetch('data/works.json');
  const data = await res.json();
  const cat  = data.categories.find(c => c.id === categoryId);
  if (!cat) return;

  runGlitch(() => {
    navState.category    = categoryId;
    navState.subcategory = null;
    pushHash('works/' + categoryId);

    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel';

    el.appendChild(makePanelNav([
      { label: 'Works', action: () => showSection('works') },
      { label: cat.label }
    ]));

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

// ─── Practice firma verisi ─────────────────────────────────────────────────
const PRACTICE_FIRMS = [
  {
    name: 'SCHMITZ-RIOL ARCHITEKTEN',
    role: 'Architectural Designer · Interior Designer · Visualisation',
    period: '2017 – 2023 · Weimar, Germany',
    projects: [
      { year: '2017–2018', project: 'Gate Group Headquarters',                    type: 'Corporate Workplace Design',                    location: 'Opfikon, Switzerland' },
      { year: '2018',      project: 'Warnecke House',                             type: 'Residential Interior Renovation',               location: 'Frankfurt am Main, Germany' },
      { year: '2018',      project: 'Haus Schachener Straße 153',                 type: 'Historic Residence Restoration',                location: 'Lindau-Bad Schachen, Germany' },
      { year: '2018–2019', project: 'Haus Am Kupferberg',                         type: 'Residential Retreat & Guest House',             location: 'Black Forest, Germany',       projectId: 'kupferberg' },
      { year: '2018–2020', project: 'Umgebung Neubauten im Zil',                  type: 'Renovation & New Residential Development',      location: 'Wetzikon, Switzerland' },
      { year: '2019',      project: 'Belvedere Allee',                            type: 'Historic Residential Renovation & Interior',    location: 'Weimar, Germany' },
      { year: '2019',      project: 'Jugendhaus Am Jakobskirchhof',               type: 'Youth Center Interior',                        location: 'Weimar, Germany' },
      { year: '2019',      project: 'Mehrfamilienhaus Scheidegg',                 type: 'Multi-Family Residential Building',             location: 'Scheidegg, Germany',          projectId: 'scheidegg' },
      { year: '2019',      project: 'Exhibition Space Schlossgasse 1',            type: 'Exhibition Space',                             location: 'Hahnheim, Germany' },
      { year: '2019–2023', project: 'Jagdschloss Mönchbruch Hotel & Restaurant',  type: 'Historic Hotel & Restaurant Restoration',      location: 'Mörfelden-Walldorf, Germany' },
      { year: '2019–2020', project: 'Mehrfamilienhaus Liebigstraße 54',           type: 'Multi-Family Residential Building',             location: 'Offenbach am Main, Germany' },
      { year: '2019–2021', project: 'Ensemble Obere Pforte 7',                    type: 'Restoration of Residential Building Ensemble', location: 'Trebur, Germany' },
      { year: '2020',      project: 'Widderbergweg 5',                            type: 'Residential Building',                         location: 'Weimar, Germany' },
      { year: '2020',      project: 'Familienhaus Kreuch',                        type: 'Residential Architecture & Interior Design',   location: 'Erfurt, Germany' },
      { year: '2020',      project: 'Ehemalige Schokoladenfabrik Wohnung 137',    type: 'Loft Apartment Interior Design',               location: 'Erfurt, Germany' },
      { year: '2020',      project: 'Maison du Rempart',                          type: 'Historic Residential Renovation & Interior',   location: 'Semur-en-Auxois, France' },
      { year: '2020–2022', project: 'Brunnhausgasse 3',                           type: 'Historic Residential Building Renovation',     location: 'Salzburg, Austria' },
      { year: '2020–2023', project: 'Vierseithof Burgwitz 8',                     type: 'Historic Farmhouse Restoration',               location: 'Kospoda, Germany' },
      { year: '2020',      project: 'WEG Helmstedter Straße',                     type: 'Residential Interior',                         location: 'Schöningen, Germany' },
      { year: '2020',      project: 'Wohnhaus Müller',                            type: 'Residential Architecture & Interior Design',   location: 'Weimar, Germany' },
      { year: '2020–2021', project: 'Wohnhaus Hinkelmann',                        type: 'Residential Architecture & Interior Design',   location: 'Weimar, Germany' },
      { year: '2021',      project: 'Wohnhaus Blanz / Schober',                   type: 'Residential Architecture & Interior Design',   location: 'Richterswil, Switzerland' },
      { year: '2021',      project: 'Eisen 2',                                    type: 'Office Interior Design',                       location: 'Rüsselsheim am Main, Germany' },
      { year: '2021',      project: 'Webicht House',                              type: 'Residential Architecture & Interior Design',   location: 'Weimar, Germany' },
      { year: '2022',      project: 'An der Trift 2',                             type: 'Residential Building Renovation',              location: 'Weimar, Germany' },
      { year: '2023',      project: 'Villa Krähbühlstrasse 64',                   type: 'Villa Renovation & Interior Design',           location: 'Zürich, Switzerland' }
    ]
  },
  {
    name: '304 DESIGN',
    role: 'Brand Architect · Interior Architect',
    period: '2014 – 2016 · Istanbul, Turkey',
    projects: [
      { year: '2015–2016', project: 'Mambocino Coffee',                   type: 'Franchise Coffee Shops',              location: 'Istanbul · Tekirdağ · N. Cyprus' },
      { year: '2015–2016', project: 'Coffee Manifesto',                   type: 'Coffee Shops',                        location: 'Moda · Kadıköy, Istanbul' },
      { year: '2015–2016', project: "Cup'n Go Coffee",                    type: 'Franchise Coffee Kiosks',             location: 'Istanbul · Antalya' },
      { year: '2015–2016', project: 'Coffee Sapiens',                     type: 'Modular Coffee Kiosk',                location: 'Karaköy, Istanbul' },
      { year: '2015–2016', project: 'Probador Colectiva Coffee Roastery', type: 'Roastery',                            location: 'Karaköy, Istanbul' },
      { year: '2015–2016', project: 'Tramplen Roastery & Headquarters',   type: 'Office / Roastery',                   location: 'Ataşehir, Istanbul' },
      { year: '2015–2016', project: 'Kaffesa Headquarters',               type: 'Office / Workplace',                  location: 'Istanbul' },
      { year: '2015–2016', project: 'Isis Restaurant',                    type: 'Restaurant',                          location: 'Moda, Istanbul',           projectId: 'isis' },
      { year: '2015–2016', project: 'Bahane Cafe & Bar',                  type: 'Café · Bar',                          location: 'Moda, Istanbul' },
      { year: '2015–2016', project: 'Paria Restaurant',                   type: 'Restaurant',                          location: 'Bostancı, Istanbul' },
      { year: '2015–2016', project: 'Drip Third Wave Coffee Shop',        type: 'Coffee Shop',                         location: 'Istanbul' },
      { year: '2015–2016', project: 'Karaköy Gümrük Restaurant',          type: 'Restaurant',                          location: 'Karaköy, Istanbul' },
      { year: '2015–2016', project: 'Take Five Jazz Bar',                 type: 'Jazz Bar',                            location: 'Alaçatı, İzmir' },
      { year: '2015–2016', project: 'Serdar-i Ekrem Boutique Hotel',      type: 'Boutique Hotel',                      location: 'Beyoğlu, Istanbul' },
      { year: '2015–2016', project: 'Gökçe Kozanoğlu House',              type: 'Residential',                         location: 'Göztepe, Istanbul' },
      { year: '2015–2016', project: 'Ali Osman Yener House',              type: 'Residential',                         location: 'Kadıköy, Istanbul' },
      { year: '2015–2016', project: 'Lisani Atasayan House',              type: 'Residential',                         location: 'Istanbul' },
      { year: '2015–2016', project: 'İbrahim Şimşek House',               type: 'Residential',                         location: 'Göztepe, Istanbul' },
      { year: '2015–2016', project: 'Gökçe & Selim Kocaoğlu House',       type: 'Residential',                         location: 'Ulus, Istanbul' },
      { year: '2015–2016', project: 'Soy Copper Shop Loft',               type: 'Retail / Loft',                       location: 'Istanbul' },
      { year: '2015–2016', project: 'Uniq Shop',                          type: 'Pop-up Store',                        location: 'Maslak, Istanbul' },
      { year: '2014–2016', project: 'Retail Store Products & Systems',    type: 'Product Design',                      location: 'Istanbul' },
      { year: '2014–2016', project: 'Custom Furniture & Product Systems', type: 'Furniture & Product Design',          location: 'Istanbul' },
      { year: '2014',      project: 'Istanbul Coffee Festival',            type: 'Event Design',                        location: 'Istanbul' },
      { year: '2015',      project: 'Istanbul Coffee Festival',            type: 'Event Design',                        location: 'Istanbul' },
      { year: '2016',      project: 'Istanbul Coffee Festival',            type: 'Event Design',                        location: 'Istanbul' }
    ]
  },
  {
    name: 'CISIMDESIGN',
    role: 'Interior Architect · Product Designer',
    period: '2013 – 2014 · Istanbul, Turkey',
    projects: [
      { year: '2013',      project: "Mum's Cafe",                         type: 'Hospitality / Café',                  location: 'Karaköy, Istanbul',        projectId: 'cafe' },
      { year: '2013',      project: 'Forneria Restaurant',                 type: 'Hospitality / Restaurant',            location: 'Karaköy, Istanbul' },
      { year: '2014',      project: 'Mükellef Restaurant',                 type: 'Hospitality / Restaurant',            location: 'Karaköy, Istanbul' },
      { year: '2014',      project: 'Read & Rest Bookstore Café',          type: 'Hospitality / Bookstore Café',        location: 'Göktürk, Istanbul',        projectId: 'bookstore' },
      { year: '2013–2014', project: 'One Ortaköy Family House',            type: 'Residential',                         location: 'Ortaköy, Istanbul' },
      { year: '2013–2014', project: 'Dilek Seferoğlu House',               type: 'Residential',                         location: 'Şişli, Istanbul' },
      { year: '2013–2014', project: 'Alafortanfoni Headquarters',          type: 'Office / Workplace',                  location: 'Maslak, Istanbul' },
      { year: '2013–2014', project: 'Portakal Family',                     type: 'Hospitality / Café · Restaurant · Bar', location: 'Karaköy, Istanbul' }
    ]
  },
  {
    name: 'PROJEMASIF',
    role: 'Interior Architect · Furniture Designer',
    period: '2012 – 2013 · Istanbul, Turkey',
    projects: [
      { year: '2012–2013', project: 'Bilgitek Headquarters',               type: 'Office / Workplace',                  location: 'Zeytinburnu, Istanbul' },
      { year: '2012–2013', project: 'AGCA House',                          type: 'Residential / Restoration',           location: 'Istanbul' }
    ]
  }
];

// ─── Practice'ten proje sayfasına yönlendir ────────────────────────────────
async function _navigateToProject(projectId) {
  const res  = await fetch('data/works.json');
  const data = await res.json();

  for (const cat of data.categories) {
    for (const sub of cat.subcategories) {
      if (!sub.projects || !sub.projects.includes(projectId)) continue;
      if (sub.id === 'arch-visualization' || sub.id === 'interior-practice') continue;
      runGlitch(async () => {
        clearPanel();
        const proj = await fetch(`data/projects/${projectId}.json`).then(r => r.json());
        navState.subcategory = sub.id;
        navState.project     = projectId;
        pushHash('works/' + cat.id + '/' + sub.id + '/' + projectId);

        const root = getPanelRoot();
        const el   = document.createElement('div');
        el.className = 'panel panel-grid';

        const nav = makePanelNav([
          { label: 'Works',    action: () => showSection('works') },
          { label: cat.label,  action: () => showCategory(cat.id) },
          { label: sub.label,  action: () => showSubcategory(cat.id, sub.id) },
        ]);
        el.appendChild(nav);

        const navTitle = document.createElement('span');
        navTitle.className = 'proj-nav-title';
        navTitle.innerHTML = `${proj.title} <span style="opacity:.4">${proj.year}</span>`;
        nav.appendChild(navTitle);

        const secLabel = document.createElement('div');
        secLabel.className = 'sec-label sec-label--home';
        secLabel.textContent = sub.label;
        secLabel.addEventListener('click', () => runGlitch(() => showSubcategory(cat.id, sub.id)));
        el.appendChild(secLabel);

        root.appendChild(el);

        if (window.grid3d && window.grid3d.destroy) window.grid3d.destroy();
        window.grid3d = showPhotoGrid(proj, (d) => {
          if (proj.images && proj.images.length) openLightbox(proj.images, d.index, proj);
        });
        renderProjectInfoPanel(proj, false);
      });
      return;
    }
  }
}

// ─── Practice tablo render ─────────────────────────────────────────────────
function showPracticeTable(categoryId, subcategoryId, catLabel, subLabel) {
  runGlitch(() => {
    navState.subcategory = subcategoryId;
    navState.project     = null;
    pushHash('works/' + categoryId + '/' + subcategoryId);

    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel';

    el.appendChild(makePanelNav([
      { label: 'Works',  action: () => showSection('works') },
      { label: catLabel, action: () => showCategory(categoryId) },
      { label: subLabel }
    ]));

    const label = document.createElement('div');
    label.className = 'sec-label sec-label--home';
    label.textContent = subLabel;
    label.addEventListener('click', () => runGlitch(() => showCategory(categoryId)));
    el.appendChild(label);

    const practiceList = document.createElement('div');
    practiceList.className = 'accordion-content practice-list';

    PRACTICE_FIRMS.forEach(f => {
      const firmEl = document.createElement('div');
      firmEl.className = 'practice-firm';

      const header = document.createElement('div');
      header.className = 'practice-firm-header';
      header.innerHTML = `
        <div class="practice-firm-name">${f.name}</div>
        <div class="practice-firm-meta">${f.role} · ${f.period}</div>
      `;
      firmEl.appendChild(header);

      f.projects.forEach(p => {
        const row = document.createElement('div');
        row.className = 'practice-row' + (p.projectId ? ' is-link' : '');

        const yearEl = document.createElement('div');
        yearEl.className = 'practice-year';
        yearEl.textContent = p.year;

        const detailEl = document.createElement('div');
        detailEl.innerHTML = `
          <div class="practice-proj-name">${p.project}${p.projectId ? ' <span class="practice-row-arrow">→</span>' : ''}</div>
          <div class="practice-proj-meta">${p.type} · ${p.location}</div>
        `;

        row.appendChild(yearEl);
        row.appendChild(detailEl);

        if (p.projectId) {
          row.addEventListener('click', () => _navigateToProject(p.projectId));
        }
        firmEl.appendChild(row);
      });

      practiceList.appendChild(firmEl);
    });

    el.appendChild(practiceList);
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

  if (subcategoryId === 'sound-radio') {
    showRadio(categoryId, cat.label);
    return;
  }

  if (subcategoryId === 'arch-visualization' || subcategoryId === 'interior-practice') {
    showPracticeTable(categoryId, subcategoryId, cat.label, sub.label);
    return;
  }

  runGlitch(async () => {
    navState.subcategory = subcategoryId;
    navState.project     = null;
    pushHash('works/' + categoryId + '/' + subcategoryId);

    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel panel-grid';

    el.appendChild(makePanelNav([
      { label: 'Works',   action: () => showSection('works') },
      { label: cat.label, action: () => showCategory(categoryId) },
      { label: sub.label }
    ]));

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
    pushHash('works/' + categoryId + '/' + subcategoryId + '/' + project.id);

    const root        = getPanelRoot();
    const existingNav = root.querySelector('.panel-nav');

    if (existingNav) {
      existingNav.innerHTML = '';

      const backWorks = document.createElement('span');
      backWorks.className   = 'back-btn';
      backWorks.textContent = '← Works';
      backWorks.addEventListener('click', () => runGlitch(() => showSection('works')));
      existingNav.appendChild(backWorks);

      const backCat = document.createElement('span');
      backCat.className   = 'back-btn';
      backCat.textContent = '← ' + catLabel;
      backCat.addEventListener('click', () => runGlitch(() => showCategory(categoryId)));
      existingNav.appendChild(backCat);

      const backBtn = document.createElement('span');
      backBtn.className   = 'back-btn';
      backBtn.textContent = '← ' + subLabel;
      backBtn.addEventListener('click', () =>
        runGlitch(() => showSubcategory(categoryId, subcategoryId))
      );
      existingNav.appendChild(backBtn);

      const title = document.createElement('span');
      title.className = 'proj-nav-title';
      title.innerHTML = `${project.title} <span style="opacity:.4">${project.year}</span>`;
      existingNav.appendChild(title);
    }

    if (window.grid3d && window.grid3d.destroy) window.grid3d.destroy();

    if (project.content_type === 'video') {
      window.grid3d = showVideoEmbed(project);
    } else {
      window.grid3d = showPhotoGrid(project, (data) => {
        if (project.images && project.images.length) {
          openLightbox(project.images, data.index, project);
        }
      });
    }

    if (project.content_type !== 'video') {
      renderProjectInfoPanel(project, project.content_type === 'video');
    }
  });
}

// ─── SOUND / RADIO — özel sayfa ───────────────────────────────────────────
function showRadio(categoryId, catLabel) {
  runGlitch(() => {
    navState.subcategory = 'sound-radio';
    navState.project     = null;
    pushHash('works/' + categoryId + '/sound-radio');

    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel';

    el.appendChild(makePanelNav([
      { label: 'Works',   action: () => showSection('works') },
      { label: catLabel,  action: () => showCategory(categoryId) },
      { label: 'Radio' }
    ]));

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
    pushHash('works/' + categoryId + '/sound-radio/' + section.id);

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