// ─── WORKS ────────────────────────────────────────────────────────────────
let _worksData = null;
async function getWorksData() {
  if (!_worksData) _worksData = await fetch('data/works.json').then(r => r.json());
  return _worksData;
}

async function renderWorks() {
  const data = await getWorksData();
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
  const data = await getWorksData();
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
        cat.projects.map(pid => fetch(`data/projects/${pid}.json`).then(r => r.json()).catch(() => null)).filter(Boolean)
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

// ─── Practice'ten proje sayfasına yönlendir ────────────────────────────────
// NOT: PRACTICE_FIRMS verisi about.js'de tek kaynak olarak tanımlıdır.
// Bu fonksiyon oradaki PRACTICE_FIRMS dizisini kullanır.
async function _navigateToProject(projectId) {
  const data = await getWorksData();

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
      if (sub.id === 'ai-practice') continue;

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
  const data = await getWorksData();
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
      sub.projects.map(pid => fetch(`data/projects/${pid}.json`).then(r => r.json()).catch(() => null)).filter(Boolean)
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
  const data = await getWorksData();
  const cat  = data.categories.find(c => c.id === categoryId);
  const sub  = cat?.subcategories.find(s => s.id === subcategoryId);
  if (!sub) return;

  if (subcategoryId === 'sound-radio') {
    showRadio(categoryId, cat.label);
    return;
  }

  if (subcategoryId === 'ai-practice') {
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
      sub.projects.map(pid => fetch(`data/projects/${pid}.json`).then(r => r.json()).catch(() => null)).filter(Boolean)
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