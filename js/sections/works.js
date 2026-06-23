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

  // Subcategory'si olmayan, direkt proje listesi olan kategoriler (craft-design vs.)
  if (!cat.subcategories && cat.projects) {
    runGlitch(async () => {
      navState.category    = categoryId;
      navState.subcategory = null;
      pushHash('works/' + categoryId);

      const root = getPanelRoot();
      clearPanel();

      const el = document.createElement('div');
      el.className = 'panel panel-grid';

      el.appendChild(makePanelNav([
        { label: 'Works', action: () => showSection('works') },
        { label: cat.label }
      ]));

      const label = document.createElement('div');
      label.className = 'sec-label sec-label--home';
      label.textContent = cat.label;
      label.addEventListener('click', () => runGlitch(() => showSection('works')));
      el.appendChild(label);

      root.appendChild(el);

      if (cat.projects.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = '— coming soon —';
        el.appendChild(empty);
        return;
      }

      const projects = await Promise.all(
        cat.projects.map(pid => fetch(`data/projects/\${pid}.json`).then(r => r.json()))
      );

      window.grid3d = showProjectGrid(projects, (proj) => {
        openPhotoGrid(proj, categoryId, null, cat.label, null);
      });
    });
    return;
  }

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
    name: 'KOHLER GROHE ARCHITEKTEN',
    role: 'Competition Management Architect',
    period: '2023 – 2025 · Stuttgart, Germany',
    projects: [
      { year: '2025',      project: 'Sparkassen Quartier Heilbronn',                                          type: 'Mixed-Use Urban Quarter',                    location: 'Heilbronn, Germany' },
      { year: '2025',      project: 'Neue Arbeitswelt AVAT',                                                  type: 'Office Campus Development',                  location: 'Tübingen, Germany' },
      { year: '2025',      project: 'Neubau Feuerwache mit Gefahrenabwehrzentrum',                            type: 'Fire Station & Emergency Management Center',  location: 'Baden-Baden, Germany' },
      { year: '2025',      project: 'Neubau Feuerwehr und Rettungsstandort',                                  type: 'Fire Station & Emergency Services',           location: 'Walldorf, Germany' },
      { year: '2025',      project: 'Neubau Feuerwehr Neustetten',                                            type: 'Fire Station',                               location: 'Neustetten, Germany' },
      { year: '2025',      project: 'Neubau Kinderhaus mit Erweiterung Schulgebäude, Bildungscampus Rainbrunnen', type: 'Educational Campus',                    location: 'Schorndorf, Germany' },
      { year: '2025',      project: 'Generalsanierung Hauptgebäude Dietrich-Bonhoeffer-Gymnasium',            type: 'School Renovation',                          location: 'Metzingen, Germany' },
      { year: '2025',      project: 'Bildungscampus Süd',                                                     type: 'Educational Campus',                         location: 'Heilbronn, Germany' },
      { year: '2025',      project: 'Neubau Bildungscampus West Baufeld G',                                   type: 'Educational Campus',                         location: 'Heilbronn, Germany' },
      { year: '2025',      project: 'Neubau Campus Fachraumzentrum',                                          type: 'Educational Campus',                         location: 'Bad Mergentheim, Germany' },
      { year: '2025',      project: 'Neubau Campus Kindertagesstätte und Grundschule mit Sporthalle Hafner',  type: 'Educational Campus',                         location: 'Konstanz, Germany' },
      { year: '2025',      project: 'Wohnungsbau Schafhof IV B',                                              type: 'Residential Development',                    location: 'Kirchheim unter Teck, Germany' },
      { year: '2025',      project: 'Wohnbau Kempf-Areal',                                                    type: 'Residential Development',                    location: 'Göppingen, Germany' },
      { year: '2025',      project: 'Neukonzeption Eberhardskirche und Wohnungsbau',                          type: 'Church Redevelopment & Residential',          location: 'Tübingen, Germany' },
      { year: '2025',      project: 'Areal „Heerstrasse 79"',                                                 type: 'Mixed-Use Development',                      location: 'Rottweil, Germany' },
      { year: '2025',      project: 'Neue Mitte Singen-Beuren a.d. Aach',                                     type: 'Urban Center Development',                   location: 'Singen, Germany' },
      { year: '2025',      project: 'Crailsheim findet Innenstadt',                                           type: 'Urban Public Space Development',             location: 'Crailsheim, Germany' },
      { year: '2025',      project: 'Neugestaltung Friedrichsplatz',                                          type: 'Urban Square Redevelopment',                 location: 'Rottweil, Germany' },
      { year: '2025',      project: 'Planungsleistung für den Neubau zweier Betriebsgebäude',                 type: 'Industrial Buildings',                       location: 'Germany' },
      { year: '2024–2025', project: 'Werkstätten der Ferdinand-von-Steinbeis Gewerbliche Schule',             type: 'Educational Building',                       location: 'Tuttlingen, Germany' },
      { year: '2024–2025', project: 'Neubau DRK Rettungswache',                                              type: 'Emergency Response Center',                  location: 'Kirchheim unter Teck, Germany' },
      { year: '2024',      project: 'Zentralbereich Gaisbach',                                                type: 'Mixed-Use Development',                      location: 'Künzelsau, Germany' },
      { year: '2024',      project: 'Wohnungsbau Veilchenweg / Halde',                                       type: 'Residential Development',                    location: 'Kirchheim unter Teck, Germany' },
      { year: '2024',      project: 'Lindachareal',                                                           type: 'Mixed-Use Urban Development',                location: 'Leinfelden-Echterdingen, Germany' },
      { year: '2024',      project: 'Neubau Kindertagesstätte St. Ambrosius',                                 type: 'Kindergarten',                               location: 'Hergensweiler, Germany' },
      { year: '2024',      project: 'Neubau Grundschule Kuppelnau',                                           type: 'Primary School',                             location: 'Ravensburg, Germany' },
      { year: '2024',      project: 'Neubau Sporthalle Schulzentrum Mössingen',                               type: 'Sports Hall',                                location: 'Mössingen, Germany' },
      { year: '2024',      project: 'Erweiterung und Neubau Sporthalle Heinrich-Suso-Gymnasium',              type: 'School Extension & Sports Hall',             location: 'Konstanz, Germany' },
      { year: '2024',      project: 'Erweiterung, Umbau und Sanierung Karl-Siegfried-Bader Schule',           type: 'School Extension & Renovation',              location: 'Elzach-Prechtal, Germany' },
      { year: '2023',      project: 'Neubau Pflegeheim Stadt Walldorf',                                       type: 'Healthcare Facility',                        location: 'Walldorf, Germany' },
      { year: '2023',      project: 'Neubau Kindertagesstätte Lindenstrasse',                                 type: 'Kindergarten',                               location: 'Ditzingen, Germany' },
      { year: '2023',      project: 'Erweiterung und Sanierung Kirbachschule Hohenhaslach',                   type: 'School Extension & Renovation',              location: 'Sachsenheim-Hohenhaslach, Germany' }
    ]
  },
  {
    name: 'SCHMITZ-RIOL ARCHITEKTEN',
    role: 'Architectural Designer · Interior Designer · Visualization Artist',
    period: '2017 – 2023 · Weimar, Germany',
    projects: [
      { year: '2023',      project: 'Villa Krähbühlstrasse 64',                   type: 'Villa Renovation & Interior Design',           location: 'Zürich, Switzerland' },
      { year: '2022',      project: 'An der Trift 2',                             type: 'Residential Building Renovation',              location: 'Weimar, Germany' },
      { year: '2021',      project: 'Wohnhaus Blanz / Schober',                   type: 'Residential Architecture & Interior Design',   location: 'Richterswil, Switzerland' },
      { year: '2021',      project: 'Eisen 2',                                    type: 'Office Interior Design',                       location: 'Rüsselsheim am Main, Germany' },
      { year: '2021',      project: 'Webicht House',                              type: 'Residential Architecture & Interior Design',   location: 'Weimar, Germany' },
      { year: '2020–2023', project: 'Vierseithof Burgwitz 8',                     type: 'Historic Farmhouse Restoration',               location: 'Kospoda, Germany' },
      { year: '2020–2022', project: 'Brunnhausgasse 3',                           type: 'Historic Residential Building Renovation',     location: 'Salzburg, Austria' },
      { year: '2020–2021', project: 'Wohnhaus Hinkelmann',                        type: 'Residential Architecture & Interior Design',   location: 'Weimar, Germany' },
      { year: '2020',      project: 'Widderbergweg 5',                            type: 'Residential Building',                         location: 'Weimar, Germany' },
      { year: '2020',      project: 'Familienhaus Kreuch',                        type: 'Residential Architecture & Interior Design',   location: 'Erfurt, Germany' },
      { year: '2020',      project: 'Ehemalige Schokoladenfabrik Wohnung 137',    type: 'Loft Apartment Interior Design',               location: 'Erfurt, Germany' },
      { year: '2020',      project: 'Maison du Rempart',                          type: 'Historic Residential Renovation & Interior',   location: 'Semur-en-Auxois, France' },
      { year: '2020',      project: 'Weg Helmstedter Strasse',                    type: 'Residential Interior',                         location: 'Schöningen, Germany' },
      { year: '2020',      project: 'Wohnhaus Müller',                            type: 'Residential Architecture & Interior Design',   location: 'Weimar, Germany' },
      { year: '2019–2023', project: 'Jagdschloss Mönchbruch Hotel & Restaurant',  type: 'Historic Hotel & Restaurant Restoration',      location: 'Mörfelden-Walldorf, Germany' },
      { year: '2019–2021', project: 'Ensemble Obere Pforte 7',                    type: 'Restoration of Residential Building Ensemble', location: 'Trebur, Germany' },
      { year: '2019–2020', project: 'Mehrfamilienhaus Liebigstrasse 54',          type: 'Multi-Family Residential Building',            location: 'Offenbach am Main, Germany' },
      { year: '2019',      project: 'Belvedere Allee',                            type: 'Historic Residential Renovation & Interior',   location: 'Weimar, Germany' },
      { year: '2019',      project: 'Jugendhaus Am Jakobskirchhof',               type: 'Youth Center Interior',                        location: 'Weimar, Germany' },
      { year: '2019',      project: 'Mehrfamilienhaus Scheidegg',                 type: 'Multi-Family Residential Building',             location: 'Scheidegg, Germany',          projectId: 'scheidegg' },
      { year: '2019',      project: 'Exhibition Space Schlossgasse 1',            type: 'Exhibition Space',                             location: 'Hahnheim, Germany' },
      { year: '2018–2020', project: 'Umgebung Neubauten im Zil',                  type: 'Renovation & New Residential Development',     location: 'Wetzikon, Switzerland' },
      { year: '2018–2019', project: 'Haus Am Kupferberg',                         type: 'Residential Retreat & Guest House',            location: 'Black Forest, Germany',       projectId: 'kupferberg' },
      { year: '2018',      project: 'Warnecke House',                             type: 'Residential Interior Renovation',              location: 'Frankfurt am Main, Germany' },
      { year: '2018',      project: 'Haus Schachener Strasse 153',                type: 'Historic Residence Restoration',               location: 'Lindau-Bad Schachen, Germany' },
      { year: '2017–2018', project: 'Gate Group Headquarters',                    type: 'Corporate Workplace Design',                   location: 'Opfikon, Switzerland' }
    ]
  },
  {
    name: '304 DESIGN',
    role: 'Brand Architect · Interior Architect',
    period: '2014 – 2016 · Istanbul, Turkey',
    projects: [
      { year: '2016',      project: 'Istanbul Coffee Festival',            type: 'Event Design',                        location: 'Istanbul' },
      { year: '2015–2016', project: 'Mambocino Coffee',                   type: 'Franchise Coffee Shops',              location: 'Istanbul · Tekirdağ · N. Cyprus' },
      { year: '2015–2016', project: 'Coffee Manifesto',                   type: 'Coffee Shops',                        location: 'Moda · Kadıköy, Istanbul' },
      { year: '2015–2016', project: "Cup'n Go Coffee",                    type: 'Franchise Coffee Kiosks',             location: 'Istanbul · Antalya' },
      { year: '2015–2016', project: 'Coffee Sapiens',                     type: 'Modular Coffee Kiosk',                location: 'Karaköy, Istanbul' },
      { year: '2015–2016', project: 'Probador Colectiva Coffee Roastery', type: 'Coffee Roastery',                     location: 'Karaköy, Istanbul' },
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
      { year: '2015',      project: 'Istanbul Coffee Festival',            type: 'Event Design',                        location: 'Istanbul' },
      { year: '2014–2016', project: 'Retail Store Products & Systems',    type: 'Product Design',                      location: 'Istanbul' },
      { year: '2014–2016', project: 'Custom Furniture & Product Systems', type: 'Furniture & Product Design',          location: 'Istanbul' },
      { year: '2014',      project: 'Istanbul Coffee Festival',            type: 'Event Design',                        location: 'Istanbul' }
    ]
  },
  {
    name: 'CISIMDESIGN',
    role: 'Interior Architect · Product Designer',
    period: '2013 – 2014 · Istanbul, Turkey',
    projects: [
      { year: '2014',      project: 'Read & Rest Bookstore Café',          type: 'Bookstore Café',                      location: 'Göktürk, Istanbul',        projectId: 'bookstore' },
      { year: '2014',      project: 'Mükellef Restaurant',                 type: 'Hospitality / Restaurant',            location: 'Karaköy, Istanbul' },
      { year: '2013–2014', project: 'Cafe Project for Portakal Family',    type: 'Hospitality',                         location: 'Karaköy, Istanbul' },
      { year: '2013–2014', project: 'Alafortanfoni Headquarters',          type: 'Office / Workplace',                  location: 'Maslak, Istanbul' },
      { year: '2013–2014', project: 'Dilek Seferoğlu House',               type: 'Residential',                         location: 'Şişli, Istanbul' },
      { year: '2013–2014', project: 'One Ortaköy Family House',            type: 'Residential',                         location: 'Ortaköy, Istanbul' },
      { year: '2013',      project: 'Forneria Restaurant',                 type: 'Hospitality / Restaurant',            location: 'Karaköy, Istanbul' },
      { year: '2013',      project: 'Mums Cafe',                           type: 'Hospitality',                         location: 'Karaköy, Istanbul',        projectId: 'cafe' }
    ]
  },
  {
    name: 'PROJECT MASIF',
    role: 'Interior Architect · Furniture Designer',
    period: '2012 – 2013 · Istanbul, Turkey',
    projects: [
      { year: '2012–2013', project: 'Bilgitek Headquarters',               type: 'Office / Workplace',                  location: 'Zeytinburnu, Istanbul' },
      { year: '2012–2013', project: 'AGCA House',                          type: 'Residential Restoration',             location: 'Istanbul' }
    ]
  },
  {
    name: 'INDEPENDENT PRACTICE',
    role: 'Architect · Visualization Artist · Media Designer',
    period: '2012 – Present · Turkey · Germany',
    projects: [
      { year: '2024',         project: 'Monogram Gastro Pub',              type: 'Restaurant · Café · Bar',             location: 'Ankara, Turkey' },
      { year: '2022–Present', project: 'Aesculap AG Media Experience',     type: 'Interactive Media · Immersive Experience', location: 'Tuttlingen, Germany' },
      { year: '2019',         project: 'Monogram Coffee',                  type: 'Coffee Shop',                         location: 'Samsun, Turkey' },
      { year: '2016',         project: 'Mustafa Üreyen Law Home Office',   type: 'Law Office & Residential Interior',   location: 'Antalya, Turkey' },
      { year: '2015',         project: 'No:75 Passage',                    type: 'Restaurant · Café · Bar',             location: 'Samsun, Turkey' }
    ]
  }
];

// ─── Practice'ten proje sayfasına yönlendir ────────────────────────────────
async function _navigateToProject(projectId) {
  const res  = await fetch('data/works.json');
  const data = await res.json();

  for (const cat of data.categories) {
    // subcategory'leri + nested subcategory'leri tara
    const allSubs = [];
    for (const sub of cat.subcategories) {
      allSubs.push({ sub, parentSub: null });
      if (sub.subcategories) {
        for (const nested of sub.subcategories) {
          allSubs.push({ sub: nested, parentSub: sub });
        }
      }
    }

    for (const { sub, parentSub } of allSubs) {
      if (!sub.projects || !sub.projects.includes(projectId)) continue;
      if (sub.id === 'arch-visualization' || sub.id === 'interior-practice' || sub.id === 'ai-practice') continue;

      runGlitch(async () => {
        clearPanel();
        const proj = await fetch(`data/projects/${projectId}.json`).then(r => r.json());
        navState.subcategory = sub.id;
        navState.project     = projectId;

        const hashSub = parentSub ? parentSub.id + '/' + sub.id : sub.id;
        pushHash('works/' + cat.id + '/' + hashSub + '/' + projectId);

        const root = getPanelRoot();
        const el   = document.createElement('div');
        el.className = 'panel panel-grid';

        const navItems = [
          { label: 'Works',   action: () => showSection('works') },
          { label: cat.label, action: () => showCategory(cat.id) },
        ];
        if (parentSub) {
          navItems.push({ label: parentSub.label, action: () => showSubcategory(cat.id, parentSub.id) });
          navItems.push({ label: sub.label, action: () => showNestedSubcategory(cat.id, parentSub.id, sub.id) });
        } else {
          navItems.push({ label: sub.label, action: () => showSubcategory(cat.id, sub.id) });
        }

        const nav = makePanelNav(navItems);
        el.appendChild(nav);

        const navTitle = document.createElement('span');
        navTitle.className = 'proj-nav-title';
        navTitle.innerHTML = `${proj.title} <span style="opacity:.4">${proj.year}</span>`;
        nav.appendChild(navTitle);

        const secLabel = document.createElement('div');
        secLabel.className = 'sec-label sec-label--home';
        secLabel.textContent = sub.label;
        if (parentSub) {
          secLabel.addEventListener('click', () => runGlitch(() => showNestedSubcategory(cat.id, parentSub.id, sub.id)));
        } else {
          secLabel.addEventListener('click', () => runGlitch(() => showSubcategory(cat.id, sub.id)));
        }
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

// ─── Nested subcategory (3. seviye) ───────────────────────────────────────
async function showNestedSubcategory(categoryId, parentSubId, nestedSubId) {
  const res  = await fetch('data/works.json');
  const data = await res.json();
  const cat  = data.categories.find(c => c.id === categoryId);
  const parentSub = cat?.subcategories.find(s => s.id === parentSubId);
  const sub = parentSub?.subcategories?.find(s => s.id === nestedSubId);
  if (!sub) return;

  runGlitch(async () => {
    navState.subcategory = nestedSubId;
    navState.project     = null;
    pushHash('works/' + categoryId + '/' + parentSubId + '/' + nestedSubId);

    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel panel-grid';

    el.appendChild(makePanelNav([
      { label: 'Works',          action: () => showSection('works') },
      { label: cat.label,        action: () => showCategory(categoryId) },
      { label: parentSub.label,  action: () => showSubcategory(categoryId, parentSubId) },
      { label: sub.label }
    ]));

    const label = document.createElement('div');
    label.className = 'sec-label sec-label--home';
    label.textContent = sub.label;
    label.addEventListener('click', () => runGlitch(() => showSubcategory(categoryId, parentSubId)));
    el.appendChild(label);

    root.appendChild(el);

    if (!sub.projects || sub.projects.length === 0) {
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
      openPhotoGridNested(proj, categoryId, parentSubId, nestedSubId, cat.label, parentSub.label, sub.label);
    });
  });
}

// ─── Nested photo grid açıcı ──────────────────────────────────────────────
function openPhotoGridNested(project, categoryId, parentSubId, nestedSubId, catLabel, parentSubLabel, subLabel) {
  runGlitch(() => {
    navState.project = project.id;
    pushHash('works/' + categoryId + '/' + parentSubId + '/' + nestedSubId + '/' + project.id);

    const root        = getPanelRoot();
    const existingNav = root.querySelector('.panel-nav');

    if (existingNav) {
      existingNav.innerHTML = '';

      [
        { text: '← Works',        fn: () => showSection('works') },
        { text: '← ' + catLabel,  fn: () => showCategory(categoryId) },
        { text: '← ' + parentSubLabel, fn: () => showSubcategory(categoryId, parentSubId) },
        { text: '← ' + subLabel,  fn: () => showNestedSubcategory(categoryId, parentSubId, nestedSubId) },
      ].forEach(({ text, fn }) => {
        const btn = document.createElement('span');
        btn.className   = 'back-btn';
        btn.textContent = text;
        btn.addEventListener('click', () => runGlitch(fn));
        existingNav.appendChild(btn);
      });

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
      renderProjectInfoPanel(project, false);
    }
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

  if (subcategoryId === 'ai-practice' || subcategoryId === 'arch-visualization' || subcategoryId === 'interior-practice') {
    showPracticeTable(categoryId, subcategoryId, cat.label, sub.label);
    return;
  }

  // ai-projects: nested subcategory list göster
  if (subcategoryId === 'ai-projects') {
    runGlitch(() => {
      navState.subcategory = subcategoryId;
      navState.project     = null;
      pushHash('works/' + categoryId + '/' + subcategoryId);

      const root = getPanelRoot();
      clearPanel();

      const el = document.createElement('div');
      el.className = 'panel';

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

      const list = document.createElement('div');
      list.className = 'subcategory-list';
      list.innerHTML = sub.subcategories.map(nested => `
        <div class="subcat-item" data-sub="${nested.id}">
          <div class="subcat-label">${nested.label}</div>
          ${nested.description ? `<div class="cat-desc">${nested.description}</div>` : ''}
        </div>
      `).join('');
      el.appendChild(list);

      list.querySelectorAll('.subcat-item').forEach(item => {
        item.addEventListener('click', () => showNestedSubcategory(categoryId, subcategoryId, item.dataset.sub));
      });

      root.appendChild(el);
    });
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
    const hashPath = subcategoryId
      ? 'works/' + categoryId + '/' + subcategoryId + '/' + project.id
      : 'works/' + categoryId + '/' + project.id;
    pushHash(hashPath);

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

      if (subcategoryId && subLabel) {
        const backBtn = document.createElement('span');
        backBtn.className   = 'back-btn';
        backBtn.textContent = '← ' + subLabel;
        backBtn.addEventListener('click', () =>
          runGlitch(() => showSubcategory(categoryId, subcategoryId))
        );
        existingNav.appendChild(backBtn);
      }

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