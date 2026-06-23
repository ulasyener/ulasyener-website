// ─── ACADEMIC ─────────────────────────────────────────────────────────────
function renderAcademic() {
  const sections = [
    {
      id: 'articles',
      label: 'Publications',
      subs: [
        { id: 'essays',   label: 'Essays' },
        { id: 'reviews',  label: 'Reviews' },
        { id: 'writings', label: 'Writings' }
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
  if (section.id === 'archive')  { showArchiveSection(section); return; }
  if (section.id === 'articles') { showAcademicArticles(section); return; }

  runGlitch(() => {
    pushHash('academic/' + section.id);
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
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '— coming soon —';
    el.appendChild(empty);
    root.appendChild(el);
  });
}

// ─── Academic: Projects ────────────────────────────────────────────────────
function showAcademicProjects(section) {
  runGlitch(() => {
    pushHash('academic/' + section.id);
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
      item.addEventListener('click', () => showAcademicComingSoon(sub.label, section, showAcademicProjects));
      list.appendChild(item);
    });

    el.appendChild(list);
    root.appendChild(el);
  });
}

// ─── Academic: Articles (accordion) ───────────────────────────────────────
function showAcademicArticles(section) {
  runGlitch(() => {
    pushHash('academic/' + section.id);
    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel';

    el.appendChild(makePanelNav([
      { label: 'Academic', action: () => showSection('academic') },
      { label: 'Publications' }
    ]));

    const label = document.createElement('div');
    label.className = 'sec-label sec-label--home';
    label.textContent = 'Publications';
    label.addEventListener('click', () => runGlitch(() => showSection('academic')));
    el.appendChild(label);

    const list = document.createElement('div');
    list.className = 'category-list';

    section.subs.forEach(sub => {
      const item = document.createElement('div');
      item.className = 'category-item accordion-item';
      item.innerHTML = `
        <div class="cat-label">${sub.label}</div>
        <div class="cat-arrow accordion-arrow">&#x002B;</div>
        <div class="accordion-body"></div>
      `;

      function toggle() {
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
          body.innerHTML  = `<div class="accordion-content"><p class="empty-state" style="margin-top:16px;text-align:left;">— coming soon —</p></div>`;
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      }

      item.querySelector('.cat-label').addEventListener('click', toggle);
      item.querySelector('.accordion-arrow').addEventListener('click', toggle);
      list.appendChild(item);
    });

    el.appendChild(list);
    root.appendChild(el);
  });
}

// ─── Academic: Research ────────────────────────────────────────────────────
function showAcademicResearch(section) {
  runGlitch(() => {
    pushHash('academic/' + section.id);
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
      item.addEventListener('click', () => showAcademicComingSoon(sub.label, section, showAcademicResearch));
      list.appendChild(item);
    });

    el.appendChild(list);
    root.appendChild(el);
  });
}

// ─── Academic: Coming Soon sayfası ────────────────────────────────────────
function showAcademicComingSoon(title, parentSection, parentFn) {
  runGlitch(() => {
    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel';

    el.appendChild(makePanelNav([
      { label: 'Academic',          action: () => showSection('academic') },
      { label: parentSection.label, action: () => parentFn(parentSection) },
      { label: title }
    ]));

    const label = document.createElement('div');
    label.className = 'sec-label sec-label--home';
    label.textContent = title;
    label.addEventListener('click', () => parentFn(parentSection));
    el.appendChild(label);

    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '— coming soon —';
    el.appendChild(empty);

    root.appendChild(el);
  });
}

// ─── Archive → Fremde Türen listesi ───────────────────────────────────────
function showArchiveSection(section) {
  runGlitch(() => {
    pushHash('academic/archive');
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
const FREMDE_SECTIONS = [
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
      { label: 'Films',             desc: 'Documentary Films · Video Essays' },
      { label: 'Audio',             desc: 'Radio Programmes · Podcasts · Sound Works' },
      { label: 'Installations',     desc: 'Multimedia Installations · Spatial Installations' },
      { label: 'Interactive Media', desc: 'XR Experiences · Interactive Narratives · Digital Archives' },
      { label: 'Games',             desc: 'Open World Environments · Narrative Experiments' },
      { label: 'Web',               desc: 'Websites · Online Platforms' },
      { label: 'Exhibitions',       desc: 'Exhibitions · Screenings · Presentations' }
    ]
  }
];

function showFremdeTueren(archiveSection) {
  runGlitch(() => {
    pushHash('academic/archive/fremde-tueren');
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

    FREMDE_SECTIONS.forEach(sec => {
      const secItem = document.createElement('div');
      secItem.className = 'category-item fremde-sec-item';
      secItem.innerHTML = `
        <div class="cat-label">${sec.title}</div>
        <div class="fremde-sec-body"></div>
      `;

      const body = secItem.querySelector('.fremde-sec-body');

      function buildBody() {
        if (body.children.length) return;
        const list = document.createElement('div');
        list.className = 'subcategory-list';
        sec.items.forEach(item => {
          const div = document.createElement('div');
          div.className = 'subcat-item';
          div.innerHTML = `
            <div class="subcat-label">${item.label}</div>
            <div class="cat-desc">${item.desc}</div>
          `;
          div.addEventListener('click', (e) => {
            e.stopPropagation();
            showFremdeTuerenItem(item, sec, archiveSection);
          });
          list.appendChild(div);
        });
        body.appendChild(list);
      }

      secItem.addEventListener('click', () => {
        buildBody();
        const isOpen = secItem.classList.contains('is-open');
        if (isOpen) {
          body.style.maxHeight = '0';
          secItem.classList.remove('is-open');
        } else {
          body.style.maxHeight = body.scrollHeight + 'px';
          secItem.classList.add('is-open');
        }
      });

      el.appendChild(secItem);
    });

    root.appendChild(el);
  });
}

// ─── Fremde Türen bölüm sayfası ───────────────────────────────────────────
function showFremdeTuerenSection(sec, archiveSection) {
  runGlitch(() => {
    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel';

    el.appendChild(makePanelNav([
      { label: 'Academic',                    action: () => showSection('academic') },
      { label: 'Archive',                     action: () => showArchiveSection(archiveSection) },
      { label: 'Fremde Türen / El Kapıları',  action: () => showFremdeTueren(archiveSection) },
      { label: sec.title }
    ]));

    const label = document.createElement('div');
    label.className = 'sec-label sec-label--home';
    label.textContent = sec.title;
    label.addEventListener('click', () => showFremdeTueren(archiveSection));
    el.appendChild(label);

    const list = document.createElement('div');
    list.className = 'subcategory-list';

    sec.items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'subcat-item';
      div.innerHTML = `
        <div class="subcat-label">${item.label}</div>
        <div class="cat-desc">${item.desc}</div>
      `;
      div.addEventListener('click', () =>
        showFremdeTuerenItem(item, sec, archiveSection)
      );
      list.appendChild(div);
    });

    el.appendChild(list);
    root.appendChild(el);
  });
}

// ─── Fremde Türen alt öğe sayfası (coming soon) ───────────────────────────
function showFremdeTuerenItem(item, sec, archiveSection) {
  runGlitch(() => {
    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel';

    el.appendChild(makePanelNav([
      { label: 'Academic',                    action: () => showSection('academic') },
      { label: 'Archive',                     action: () => showArchiveSection(archiveSection) },
      { label: 'Fremde Türen / El Kapıları',  action: () => showFremdeTueren(archiveSection) },
      { label: sec.title,                     action: () => showFremdeTuerenSection(sec, archiveSection) },
      { label: item.label }
    ]));

    const label = document.createElement('div');
    label.className = 'sec-label sec-label--home';
    label.textContent = item.label;
    label.addEventListener('click', () => showFremdeTuerenSection(sec, archiveSection));
    el.appendChild(label);

    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '— coming soon —';
    el.appendChild(empty);

    root.appendChild(el);
  });
}