document.addEventListener('DOMContentLoaded', () => {
  initScene();
  initGrain();
  initHeroScramble();
});

function initHeroScramble() {
  const nameEl = document.getElementById('name');
  const subEl  = document.getElementById('sub');

  const nameFinal = 'ULAS YENER';
  const subFinal  = 'Architect · Media Artist · PhD Researcher';

  // CSS opacity animasyonunu devre disi birak, scramble halleder
  nameEl.style.animation = 'none';
  nameEl.style.opacity   = '1';
  subEl.style.animation  = 'none';
  subEl.style.opacity    = '0';

  // 0.5s sonra name scramble baslar (sahne yuklenmesini bekle)
  setTimeout(() => {
    scrambleText(nameEl, nameFinal.toUpperCase(), 1800);
  }, 500);

  // 1.2s sonra sub scramble baslar
  setTimeout(() => {
    subEl.style.opacity = '1';
    scrambleText(subEl, subFinal, 1400);
  }, 1200);
}

function initGrain() {
  const canvas = document.getElementById('grain');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawGrain() {
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i]     = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 120;
    }

    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(drawGrain);
  }

  resize();
  window.addEventListener('resize', resize);
  drawGrain();
}