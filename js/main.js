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

  // Analog / morse / sembol karakter havuzu
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' +
                '\u2022\u2013\u2014\u00b7\u00d7\u25a0\u25b2\u25cf' +
                '\u2212\u002b\u003d\u007c\u002f\u005c\u005f' +
                'IV X L C D M' +
                '\u03b1\u03b2\u03b3\u03a3\u03a9\u0394\u03a6' +
                '.-/+=[]:;!?#%&';

  function scramble(el, finalText, duration, delay) {
    el.style.opacity = '0';

    setTimeout(() => {
      // Fade in
      el.style.transition = 'opacity 0.3s ease';
      el.style.opacity = '1';

      const steps    = Math.floor(duration / 30); // 30ms interval — hızlı
      let step       = 0;
      const fixed    = Array.from(finalText).map(c =>
        (c === ' ' || c === '\u00b7')
          ? c
          : chars[Math.floor(Math.random() * chars.length)]
      );

      const iv = setInterval(() => {
        const progress  = step / steps;
        const revealed  = Math.floor(progress * finalText.length);
        let out = '';
        for (let i = 0; i < finalText.length; i++) {
          if (finalText[i] === ' ' || finalText[i] === '\u00b7') {
            out += finalText[i];
            continue;
          }
          if (i < revealed) {
            out += finalText[i];
          } else {
            // Her frame yeni random karakter — analog hissi
            out += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        el.textContent = out;
        step++;
        if (step > steps) {
          el.textContent = finalText;
          clearInterval(iv);
        }
      }, 30);
    }, delay);
  }

  scramble(nameEl, nameFinal, 1200, 400);
  scramble(subEl,  subFinal,  1000, 900);
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
