document.addEventListener('DOMContentLoaded', () => {
  initScene();
  initGrain();
  initHeroScramble();
});

function initHeroScramble() {
  const nameEl = document.getElementById('name');
  const subEl  = document.getElementById('sub');

  const nameFinal = 'ULA\u015e YENER';
  const subFinal  = 'Architect \u00b7 Media Artist \u00b7 PhD Researcher';

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' +
                '\u2022\u2013\u2014\u00b7\u00d7\u25a0\u25b2\u25cf' +
                '\u2212\u002b\u003d\u007c\u002f\u005c\u005f' +
                'IV X L C D M' +
                '\u03b1\u03b2\u03b3\u03a3\u03a9\u0394\u03a6' +
                '.-/+=[]:;!?#%&';

  function scramble(el, finalText, duration, delay, fadeIn) {
    if (fadeIn) {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s ease';
    }

    setTimeout(() => {
      if (fadeIn) el.style.opacity = '1';

      const steps = Math.floor(duration / 30);
      let step = 0;

      const iv = setInterval(() => {
        const progress = step / steps;
        const revealed = Math.floor(progress * finalText.length);
        let out = '';
        for (let i = 0; i < finalText.length; i++) {
          if (finalText[i] === ' ' || finalText[i] === '\u00b7') { out += finalText[i]; continue; }
          out += i < revealed ? finalText[i] : chars[Math.floor(Math.random() * chars.length)];
        }
        el.textContent = out;
        step++;
        if (step > steps) { el.textContent = finalText; clearInterval(iv); }
      }, 30);
    }, delay);
  }

  const isFirstLoad = !nameEl.dataset.scrambled;
  nameEl.dataset.scrambled = '1';

  scramble(nameEl, nameFinal, 3200, 400, isFirstLoad);
  scramble(subEl,  subFinal,  3000, 900, isFirstLoad);
}

function initGrain() {
  const canvas = document.getElementById('grain');
  const ctx    = canvas.getContext('2d');

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