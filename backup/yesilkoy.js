const yesilkoyProject = {

    title: "Yeşilköy Residence",

    location: "Yeşilköy, Istanbul",

    year: "2023",

    category: "Interior · Residential",

    images: [
        "1.jpg",
        "2.jpg",
        "3.jpg",
        "4.jpg",
        "5.jpg",
        "6.jpg",
        "7.jpg",
        "8.jpg",
        "9.jpg",
        "10.jpg",
        "11.jpg",
        "12.jpg",
        "13.jpg",
        "14.jpg",
        "15.jpg"
    ]

};

function buildYesilkoyGrid() {
  const grid = document.getElementById('yesilkoy-grid');
  if (!grid) return;

  // Layout tanımı: her entry bir satır; "span2" = 2 sütun, "solo" = tek
  const layout = [
    { files: ['1','2','3'] },          // 3 eşit
    { files: ['4','5'], types: ['span2','solo'] }, // 2+1
    { files: ['6','7','8'] },          // 3 eşit
    { files: ['9','10'], types: ['solo','span2'] }, // 1+2
    { files: ['11','12','13'] },          // 3 eşit
    { files: ['14','15'], types: ['span2','solo'] }, // 2+1
  ];

  let html = '';
  layout.forEach(function(row) {
    row.files.forEach(function(f, i) {
      const cls = (row.types && row.types[i]) ? row.types[i] : '';
      html += `<div class="${cls}"><img src="images/yesilkoy/${f}.jpg" alt="Yeşilköy Residence ${f}" loading="lazy" onclick="openLightbox(event, this)" onerror="this.parentNode.style.display='none'"></div>`;
    });
  });
grid.innerHTML = html;
}
function showProjHeader(backLabel, backFn, title) {
  var h = document.getElementById('global-proj-header');
  var b = document.getElementById('gph-back');
  var t = document.getElementById('gph-title');
  b.textContent = '\u2190 ' + backLabel;
  b.onclick = backFn;
  h.classList.add('visible');
}
function hideProjHeader() {
  var h = document.getElementById('global-proj-header');
  if(h) h.classList.remove('visible');
}

function openProjectYesilkoy() {
  runGlitch(function() {
    hideAllPanels();
    showProjHeader('Residential', closeProjectYesilkoy, 'Interior · Residential');
    document.getElementById('project-yesilkoy').classList.add('on');
    document.getElementById('project-yesilkoy').scrollTop = 0;
  });
}

function closeProjectYesilkoy() {
  runGlitch(function() {
    hideProjHeader();
    document.getElementById('project-yesilkoy').classList.remove('on');
    hideAllPanels();
    document.getElementById('interior-residential').classList.add('on');
    btns.w.classList.add('active');
  });
}
