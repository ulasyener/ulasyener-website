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
    if (isOpen) {
      aowItem.classList.remove('is-open');
      arrow.innerHTML      = '&#x002B;';
      body.innerHTML       = '';
      body.style.maxHeight = '0';
    } else {
      aowItem.classList.add('is-open');
      arrow.innerHTML = '&#x2212;';
      const areas = [
        { label: 'Architecture', desc: 'Spatial design, restoration, visualization and competition projects.' },
        { label: 'Computation',  desc: 'Three.js, TouchDesigner, Unreal Engine, parametric and generative tools.' },
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
