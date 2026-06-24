// ─── CONTACT ──────────────────────────────────────────────────────────────
const FORMSPREE_ID = 'mvzjpvda';

function _d(b) { return atob(b); }
const _C = {
  eA: 'aGVsbG8=',
  eB: 'QA==',
  eC: 'dWxhc3llbmVyLmNvbQ==',
  pA: 'KzQ5',
  pB: 'IDE2Mw==',
  pC: 'IDIwNyA4NjE2',
  wP: 'NDkxNjMyMDc4NjE2',
  tP: 'KzQ5MTYzMjA3ODYxNg==',
};
function _email()  { return _d(_C.eA) + _d(_C.eB) + _d(_C.eC); }
function _phone()  { return _d(_C.pA) + ' ' + _d(_C.pB).trim() + ' ' + _d(_C.pC).trim(); }
function _waHref() { return 'https://wa' + '.me/' + _d(_C.wP); }
function _tgHref() { return 'https://t'  + '.me/' + _d(_C.tP); }
function _telHref(){ return 'tel:' + _d(_C.pA) + _d(_C.pB).replace(/\s/g,'') + _d(_C.pC).replace(/\s/g,''); }

// ─── Accordion ────────────────────────────────────────────────────────────
function makeAccordion(titleText, contentEl, startOpen = false) {
  const wrap = document.createElement('div');
  wrap.className = 'category-item';
  wrap.style.cursor = 'pointer';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';

  const titleEl = document.createElement('div');
  titleEl.className = 'cat-label';
  titleEl.textContent = titleText;

  const arrow = document.createElement('span');
  arrow.style.cssText = 'font-family:var(--f-mono);font-size:11px;color:rgba(0,0,0,0.3);transition:transform 0.25s ease;';
  arrow.textContent = '↓';

  header.appendChild(titleEl);
  header.appendChild(arrow);

  const body = document.createElement('div');
  body.style.cssText = 'overflow:hidden;transition:max-height 0.4s ease, opacity 0.3s ease;';

  let open = startOpen;

  function setOpen(val) {
    open = val;
    if (open) {
      body.style.maxHeight = '2000px';
      body.style.opacity   = '1';
      arrow.style.transform = 'rotate(180deg)';
    } else {
      body.style.maxHeight = '0';
      body.style.opacity   = '0';
      arrow.style.transform = 'rotate(0deg)';
    }
  }

  setOpen(startOpen);
  body.appendChild(contentEl);
  header.addEventListener('click', () => setOpen(!open));
  wrap.appendChild(header);
  wrap.appendChild(body);
  return wrap;
}

// ─── renderContact ─────────────────────────────────────────────────────────
function renderContact() {
  pushHash('contact');
  const root = getPanelRoot();
  const el   = document.createElement('div');
  el.className = 'panel';

  const label = document.createElement('div');
  label.className = 'sec-label sec-label--home';
  label.textContent = 'Contact';
  label.addEventListener('click', goHome);
  el.appendChild(label);

  // ─── Contact & Info accordion ────────────────────────────────────────────
  const ciContent = document.createElement('div');
  ciContent.style.cssText = 'padding:4px 0 16px;';

  // Form
  const formWrap = document.createElement('div');
  formWrap.innerHTML = `
    <div class="contact-form">
      <input type="text"  class="cf-input" id="cf-name"    placeholder="Name" />
      <input type="email" class="cf-input" id="cf-email"   placeholder="Email" />
      <input type="text"  class="cf-input" id="cf-subject" placeholder="Subject" />
      <textarea           class="cf-input cf-textarea" id="cf-message" placeholder="Message" rows="5"></textarea>
      <button class="cf-btn" id="cf-submit">Send</button>
    </div>
  `;
  ciContent.appendChild(formWrap);

  // Ayraç çizgisi
  const divider = document.createElement('div');
  divider.style.cssText = 'border-top:1px solid rgba(0,0,0,0.08);margin:20px 0;';
  ciContent.appendChild(divider);

  // Info satırları
  const infoList = document.createElement('div');
  const rows = [
    { key: 'Email',        tag: 'a',    getHref: () => 'mailto:' + _email(), getText: () => (_d(_C.eA) + '[AT]' + _d(_C.eC)).toUpperCase() },
    { key: 'Phone',        tag: 'a',    getHref: _telHref,                   getText: _phone },
    { key: 'WhatsApp',     tag: 'a',    getHref: _waHref,                    getText: () => 'OPEN WHATSAPP', target: '_blank' },
    { key: 'Telegram',     tag: 'a',    getHref: _tgHref,                    getText: () => 'OPEN TELEGRAM', target: '_blank' },
    { key: 'Based',        tag: 'span',                                       getText: () => 'WEIMAR · STUTTGART · ISTANBUL' },
    { key: 'Currently',    tag: 'span',                                       getText: () => '70599 STUTTGART' },
    { key: 'Availability', tag: 'span',                                       getText: () => 'OPEN TO COLLABORATION' },
  ];

  rows.forEach(r => {
    const row = document.createElement('div');
    row.className = 'contact-row';

    const keyEl = document.createElement('span');
    keyEl.className = 'contact-key';
    keyEl.textContent = r.key;

    const valEl = document.createElement(r.tag);
    valEl.className = 'contact-val';
    valEl.textContent = r.getText();
    if (r.getHref) valEl.href = r.getHref();
    if (r.target)  valEl.target = r.target;

    row.appendChild(keyEl);
    row.appendChild(valEl);
    infoList.appendChild(row);
  });

  const dlRow = document.createElement('div');
  dlRow.className = 'contact-row';
  dlRow.style.paddingTop = '16px';
  dlRow.innerHTML = `
    <span class="contact-key"></span>
    <div class="download-btns">
      <a class="dl-btn" href="files/motivation.pdf" download>Motivation Letter</a>
      <a class="dl-btn" href="files/cv.pdf" download>CV</a>
    </div>
  `;
  infoList.appendChild(dlRow);
  ciContent.appendChild(infoList);

  const list = document.createElement('div');
  list.className = 'category-list';
  list.appendChild(makeAccordion('Contact & Info', ciContent, false));
  list.appendChild(makeAccordion('Social', socialContent, false));
  el.appendChild(list);
  const socialContent = document.createElement('div');
  socialContent.style.cssText = 'padding:4px 0 16px;';

  const groups = [
    {
      label: 'Social',
      links: [
        { label: 'Instagram',  href: 'https://www.instagram.com/ulasynr/' },
        { label: 'Twitter / X',href: 'https://x.com/ulasynr' },
        { label: 'Facebook',   href: 'https://www.facebook.com/ulasynr' },
        { label: 'Bluesky',    href: 'https://bsky.app/profile/ulasyener.bsky.social' },
        { label: 'Tumblr',     href: 'https://ulasynr.tumblr.com/' },
      ]
    },
    {
      label: 'Portfolio & Creative',
      links: [
        { label: 'Behance',  href: 'https://www.behance.net/ulasynr' },
        { label: 'Flickr',   href: 'https://www.flickr.com/photos/ulasyener' },
        { label: 'Vimeo',    href: 'https://vimeo.com/ulasyener' },
        { label: 'YouTube',  href: 'https://www.youtube.com/@theulasyener' },
        { label: 'Patreon',  href: 'https://www.patreon.com/c/ulasyener' },
      ]
    },
    {
      label: 'Music & Audio',
      links: [
        { label: 'SoundCloud', href: 'https://soundcloud.com/ulasyener-1' },
        { label: 'Mixcloud',   href: 'https://www.mixcloud.com/ula%C5%9F-yener/' },
      ]
    },
    {
      label: 'Live',
      links: [
        { label: 'Twitch', href: 'https://www.twitch.tv/barbar__turk' },
        { label: 'Kick',   href: 'https://kick.com/barbarturko' },
      ]
    },
    {
      label: 'Academic & Writing',
      links: [
        { label: 'Academia.edu', href: 'https://uni-weimar.academia.edu/Ula%C5%9FYener' },
        { label: 'Medium',       href: 'https://medium.com/@ulasyener' },
        { label: 'Substack',     href: 'https://substack.com/@ulasyener' },
      ]
    },
    {
      label: 'Professional',
      links: [
        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ulasynr/' },
        { label: 'Xing',     href: 'https://www.xing.com/profile/Ulas_Yener2/web_profiles?nwt_nav=profile_icon' },
        { label: 'GitHub',   href: 'https://github.com/ulasyener' },
      ]
    },
  ];

  groups.forEach(group => {
    const groupEl = document.createElement('div');
    groupEl.style.cssText = 'margin-bottom:20px;';

    const groupLabel = document.createElement('div');
    groupLabel.style.cssText = 'font-family:var(--f-mono);font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(0,0,0,0.32);margin-bottom:8px;';
    groupLabel.textContent = group.label;
    groupEl.appendChild(groupLabel);

    const btnWrap = document.createElement('div');
    btnWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';

    group.links.forEach(l => {
      const a = document.createElement('a');
      a.className = 'social-link-btn';
      a.href = l.href;
      a.target = '_blank';
      a.textContent = l.label;
      btnWrap.appendChild(a);
    });

    groupEl.appendChild(btnWrap);
    socialContent.appendChild(groupEl);
  });

  root.appendChild(el);

  el.querySelector('#cf-submit').addEventListener('click', handleContactSubmit);
}

// ─── Form submit ───────────────────────────────────────────────────────────
async function handleContactSubmit() {
  const btn     = document.getElementById('cf-submit');
  const name    = document.getElementById('cf-name')?.value.trim();
  const email   = document.getElementById('cf-email')?.value.trim();
  const subject = document.getElementById('cf-subject')?.value.trim();
  const message = document.getElementById('cf-message')?.value.trim();

  if (!name || !email || !message) {
    btn.textContent = 'Fill in required fields';
    setTimeout(() => { btn.textContent = 'Send'; }, 2000);
    return;
  }

  btn.textContent = 'Sending…';
  btn.disabled = true;

  try {
    const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify({ name, email, subject, message })
    });

    if (res.ok) {
      btn.textContent = 'Sent —';
      document.querySelectorAll('.cf-input').forEach(i => { i.disabled = true; });
    } else {
      btn.textContent = 'Error — try again';
      btn.disabled = false;
    }
  } catch {
    btn.textContent = 'Error — try again';
    btn.disabled = false;
  }
}