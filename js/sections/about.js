// ─── ABOUT ────────────────────────────────────────────────────────────────
function renderAbout() {
  const sections = [
    { id: 'bio',        label: 'Bio' },
    { id: 'education',  label: 'Education' },
    { id: 'experience', label: 'Work Experience' },
    { id: 'teaching',   label: 'Teaching' },
    { id: 'practice',   label: 'Practice' },
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

  // Area of Work — ayrı accordion
  const aowItem = document.createElement('div');
  aowItem.className = 'category-item accordion-item';
  aowItem.innerHTML = `
    <div class="cat-label">Area of Work</div>
    <div class="cat-arrow accordion-arrow">&#x002B;</div>
    <div class="accordion-body"></div>
  `;
  function toggleAow() {
    const isOpen = aowItem.classList.contains('is-open');
    const arrow  = aowItem.querySelector('.accordion-arrow');
    const body   = aowItem.querySelector('.accordion-body');

    // Diğer açık accordion'ları kapat
    list.querySelectorAll('.accordion-item.is-open').forEach(other => {
      if (other === aowItem) return;
      const otherArrow = other.querySelector('.accordion-arrow');
      const otherBody  = other.querySelector('.accordion-body');
      other.classList.remove('is-open');
      otherArrow.innerHTML = '&#x002B;';
      otherBody.style.maxHeight = '0';
      setTimeout(() => { otherBody.innerHTML = ''; }, 350);
    });

    if (isOpen) {
      aowItem.classList.remove('is-open');
      arrow.innerHTML      = '&#x002B;';
      body.style.maxHeight = '0';
      setTimeout(() => { body.innerHTML = ''; }, 350);
    } else {
      aowItem.classList.add('is-open');
      arrow.innerHTML = '&#x2212;';
      const areas = [
        { label: 'Architecture', desc: 'Spatial design across architecture, interior design, planning, restoration and competition projects.' },
        { label: 'Computation',  desc: 'Interactive and immersive experiences using new tools relating architecture, media and art.' },
        { label: 'Culture',      desc: 'Documentary practices, archival research, migration narratives and media archaeology.' },
        { label: 'Teaching',     desc: 'Lectures and workshops at Bauhaus-Universität Weimar and international institutions.' },
        { label: 'Event',        desc: 'Curatorial and production experience across exhibitions, screenings and installations.' }
      ];
      body.innerHTML = `<div class="accordion-content">${areas.map(a => `
        <div class="about-row">
          <div class="about-period" style="font-family:var(--f-mono);font-size:11px;font-weight:700;text-transform:uppercase;color:rgba(0,0,0,0.55);letter-spacing:.06em;">${a.label}</div>
          <div class="about-detail"><div class="about-sub">${a.desc}</div></div>
        </div>`).join('')}</div>`;
      body.style.maxHeight = body.scrollHeight + 'px';
    }
  }
  aowItem.querySelector('.cat-label').addEventListener('click', toggleAow);
  aowItem.querySelector('.accordion-arrow').addEventListener('click', toggleAow);
  list.appendChild(aowItem);

  // Download bölümü
  const dlItem = document.createElement('div');
  dlItem.className = 'category-item';
  dlItem.innerHTML = `
    <div class="cat-label">Download</div>
    <div class="download-btns">
      <a class="dl-btn" href="files/cv.pdf" download>CV</a>
      <a class="dl-btn" href="files/portfolio-architectural.pdf" download>Architectural Portfolio</a>
      <a class="dl-btn" href="files/portfolio-artistic.pdf" download>Artistic Portfolio</a>
      <a class="dl-btn" href="files/portfolio-academic.pdf" download>Academic Portfolio</a>
    </div>
  `;
  list.appendChild(dlItem);

  el.appendChild(list);
  root.appendChild(el);
}

function toggleAccordion(item, sectionId) {
  const isOpen = item.classList.contains('is-open');
  const list   = item.closest('.category-list');

  // Diğer açık accordion'ları kapat
  if (list) {
    list.querySelectorAll('.accordion-item.is-open').forEach(other => {
      if (other === item) return;
      const otherArrow = other.querySelector('.accordion-arrow');
      const otherBody  = other.querySelector('.accordion-body');
      other.classList.remove('is-open');
      otherArrow.innerHTML = '&#x002B;';
      otherBody.style.maxHeight = '0';
      setTimeout(() => { otherBody.innerHTML = ''; }, 350);
    });
  }

  const arrow = item.querySelector('.accordion-arrow');
  const body  = item.querySelector('.accordion-body');

  if (isOpen) {
    item.classList.remove('is-open');
    arrow.innerHTML = '&#x002B;';
    body.style.maxHeight = '0';
    setTimeout(() => { body.innerHTML = ''; }, 350);
  } else {
    item.classList.add('is-open');
    arrow.innerHTML = '&#x2212;';
    body.innerHTML  = getAboutContent(sectionId);
    body.style.maxHeight = body.scrollHeight + 'px';

    // Practice satırlarına tıklama ekle
    body.querySelectorAll('.practice-row.is-link').forEach(row => {
      row.addEventListener('click', () => {
        if (typeof _navigateToProject === 'function') {
          _navigateToProject(row.dataset.pid);
        }
      });
    });
  }
}

function getAboutContent(sectionId) {
  if (sectionId === 'bio') {
    return `
      <div class="accordion-content">
        <p style="font-family:'DM Mono',monospace;font-weight:500;font-size:13px;letter-spacing:.01em;text-transform:none;line-height:1.85;color:rgba(0,0,0,0.68);">Ulas Yener is an architect, 3D artist, and interdisciplinary media researcher based in Germany. With nearly fifteen years of experience in architecture, visualization, and digital media production, his practice combines spatial design with moving images, photography, sound, and immersive technologies. His work explores memory, migration, and cultural narratives through documentary practices, archives, and interactive storytelling, creating experiences that move between physical and virtual spaces.</p>
        <p style="margin-top:16px;font-family:'DM Mono',monospace;font-weight:500;font-size:13px;letter-spacing:.01em;text-transform:none;line-height:1.85;color:rgba(0,0,0,0.68);">Alongside his professional work in architecture and visualization, he develops artistic and research-based projects that investigate new forms of storytelling and the relationship between media, memory, and space.</p>
      </div>`;
  }

  if (sectionId === 'education') {
    const items = [
      { period: '2022 – Present', title: 'Ph.D. Candidate, Practice-Based Artistic Research', sub: 'Bauhaus-Universität Weimar' },
      { period: '2017 – 2021',    title: 'M.Sc. Media Architecture',                          sub: 'Bauhaus-Universität Weimar' },
      { period: '2014 – 2017',    title: 'M.Sc. Architectural Design Computing',              sub: 'Istanbul Technical University' },
      { period: '2013',           title: 'M.Sc. Industrial Design, Guest Student',            sub: 'Istanbul Technical University' },
      { period: '2008 – 2012',    title: 'B.F.A. Interior Architecture and Environmental Design', sub: 'Hacettepe University' }
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
      { period: '2018 – 2024', title: 'Freelance Lecturer',                              sub: 'Bauhaus-Universität Weimar, Weimar' },
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
      { period: '2023 – 2024', title: 'Spatial Narratives,<br>Lecturer',                    sub: 'Bauhaus Spring School 2024,<br>Bauhaus-Universität Weimar' },
      { period: '2023 – 2024', title: 'Re-Located Stories,<br>Lecturer',                    sub: 'Bauhaus-Universität Weimar, Weimar' },
      { period: '2021 – 2022', title: 'Contemporary Tools for Design,<br>Lecturer',         sub: 'Bauhaus-Universität Weimar, Weimar' },
      { period: '2020 – 2021', title: 'Modelling Bauhaus Workshop,<br>Workshop Instructor', sub: 'Faculty of Art and Design,<br>Kadir Has University' },
      { period: '2019 – 2020', title: 'Professional Presentation Methods,<br>Lecturer',     sub: 'Bauhaus-Universität Weimar, Weimar' },
      { period: '2018 – 2019', title: 'Bauhaus-Oasen-trans-lokal vernetzen,<br>Workshop Instructor', sub: 'Bauhaus-Universität Weimar, Weimar' },
      { period: '2018 – 2019', title: 'Introduction to Architectural Modelling,<br>Lecturer', sub: 'Bauhaus-Universität Weimar, Weimar' }
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

  if (sectionId === 'practice') {
    const firms = [
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

    return `<div class="accordion-content practice-list">
      ${firms.map(f => `
        <div class="practice-firm">
          <div class="practice-firm-header">
            <div class="practice-firm-name">${f.name}</div>
            <div class="practice-firm-meta">${f.role} · ${f.period}</div>
          </div>
          ${f.projects.map(p => `
            <div class="practice-row${p.projectId ? ' is-link' : ''}" ${p.projectId ? `data-pid="${p.projectId}"` : ''}>
              <div class="practice-year">${p.year}</div>
              <div>
                <div class="practice-proj-name">${p.project}${p.projectId ? ' <span class="practice-row-arrow">→</span>' : ''}</div>
                <div class="practice-proj-meta">${p.type} · ${p.location}</div>
              </div>
            </div>`).join('')}
        </div>`).join('')}
    </div>`;
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
