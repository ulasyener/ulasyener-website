// Proje grid ve detay sayfaları

async function loadProjects(projectIds) {
  const grid = document.getElementById('project-grid');
  if (!grid) return;

  for (const id of projectIds) {
    try {
      const res = await fetch(`data/projects/${id}.json`);
      const project = await res.json();
      const card = createProjectCard(project);
      grid.appendChild(card);
    } catch (e) {
      console.warn(`Proje yüklenemedi: ${id}`);
    }
  }
}

function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.onclick = () => openProject(project.id);

  card.innerHTML = `
    <div class="project-thumb">
      ${project.images[0]
        ? `<img src="${project.images[0]}" alt="${project.title}">`
        : `<div class="project-thumb-empty"></div>`}
    </div>
    <div class="project-card-title">${project.title}</div>
    <div class="project-card-year">${project.year}</div>
  `;

  return card;
}

async function openProject(id) {
  const res = await fetch(`data/projects/${id}.json`);
  const project = await res.json();

  const root = document.getElementById('panel-root');
  root.innerHTML = '';

  const el = document.createElement('div');
  el.className = 'panel project-detail';
  el.innerHTML = `
    <div class="proj-detail-header">
      <span class="home-btn" onclick="goHome()">&#8962; Home</span>
      <span class="panel-back" onclick="showSubPanel('${project.category}')">&#8592; ${project.category}</span>
    </div>
    <div class="sec-label">${project.title}</div>
    <div class="proj-year">${project.year}</div>
    <div class="proj-description">${project.description}</div>
    <div class="proj-photo-grid" id="proj-photos-${id}"></div>
  `;
  root.appendChild(el);

  // Fotoğrafları yükle
  const photoGrid = document.getElementById(`proj-photos-${id}`);
  if (project.images && project.images.length > 0) {
    project.images.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.className = 'proj-photo';
      img.onclick = (e) => openLightbox(e, img);
      photoGrid.appendChild(img);
    });
  }
}