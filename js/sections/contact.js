// ─── CONTACT ──────────────────────────────────────────────────────────────
// Formspree form ID — https://formspree.io adresinden hesap açıp form oluşturduktan
// sonra aldığın ID'yi aşağıya yapıştır (örn: 'xpzgkwqr')
const FORMSPREE_ID = 'mvzjpvda';

function renderContact() {
  const root = getPanelRoot();
  const el   = document.createElement('div');
  el.className = 'panel';

  const label = document.createElement('div');
  label.className = 'sec-label sec-label--home';
  label.textContent = 'Contact';
  label.addEventListener('click', goHome);
  el.appendChild(label);

  const list = document.createElement('div');
  list.className = 'category-list';

  const sections = [
    { id: 'info',    label: 'Info' },
    { id: 'social',  label: 'Social' },
    { id: 'contact', label: 'Contact' }
  ];

  sections.forEach(s => {
    const item = document.createElement('div');
    item.className = 'category-item';
    item.innerHTML = `<div class="cat-label">${s.label}</div>`;
    item.addEventListener('click', () => showContactSection(s));
    list.appendChild(item);
  });

  el.appendChild(list);
  root.appendChild(el);
}

// ─── Contact alt sayfa ────────────────────────────────────────────────────
function showContactSection(s) {
  runGlitch(() => {
    pushHash('contact/' + s.id);
    const root = getPanelRoot();
    clearPanel();

    const el = document.createElement('div');
    el.className = 'panel';

    el.appendChild(makePanelNav([
      { label: 'Contact', action: () => showSection('contact') },
      { label: s.label }
    ]));

    const label = document.createElement('div');
    label.className = 'sec-label sec-label--home';
    label.textContent = s.label;
    label.addEventListener('click', () => runGlitch(() => showSection('contact')));
    el.appendChild(label);

    if (s.id === 'info') {
      const list = document.createElement('div');
      list.className = 'category-list';
      list.innerHTML = `
        <div class="contact-row"><span class="contact-key">Email</span><span class="contact-val">HELLO [AT] ULASYENER.COM</span></div>
        <div class="contact-row"><span class="contact-key">Phone</span><a href="tel:+491632078616" class="contact-val">+49 163 207 8616</a></div>
        <div class="contact-row"><span class="contact-key">WhatsApp</span><a href="https://wa.me/491632078616" target="_blank" class="contact-val">OPEN WHATSAPP</a></div>
        <div class="contact-row"><span class="contact-key">Telegram</span><a href="https://t.me/+491632078616" target="_blank" class="contact-val">OPEN TELEGRAM</a></div>
        <div class="contact-row"><span class="contact-key">Based</span><span class="contact-val">WEIMAR · STUTTGART · ISTANBUL</span></div>
        <div class="contact-row"><span class="contact-key">Currently</span><span class="contact-val">70599 STUTTGART</span></div>
        <div class="contact-row"><span class="contact-key">Availability</span><span class="contact-val">OPEN TO COLLABORATION</span></div>
        <div class="contact-row" style="padding-top:20px;">
          <span class="contact-key"></span>
          <div class="download-btns">
            <a class="dl-btn" href="files/motivation.pdf" download>Motivation Letter</a>
            <a class="dl-btn" href="files/cv.pdf" download>CV</a>
          </div>
        </div>
      `;
      el.appendChild(list);
    }

    if (s.id === 'social') {
      const groups = [
        {
          label: 'Social',
          links: [
            { label: 'Instagram', href: 'https://www.instagram.com/ulasynr/' },
            { label: 'Twitter / X', href: 'https://x.com/ulasynr' },
            { label: 'Facebook',  href: 'https://www.facebook.com/ulasynr' },
            { label: 'Bluesky',   href: 'https://bsky.app/profile/ulasyener.bsky.social' },
            { label: 'Tumblr',    href: 'https://ulasynr.tumblr.com/' },
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

      const wrap = document.createElement('div');
      wrap.style.paddingTop = '8px';

      groups.forEach(group => {
        const groupEl = document.createElement('div');
        groupEl.style.cssText = 'margin-bottom:24px;';

        const groupLabel = document.createElement('div');
        groupLabel.style.cssText = 'font-family:var(--f-mono);font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(0,0,0,0.32);margin-bottom:10px;';
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
        wrap.appendChild(groupEl);
      });

      el.appendChild(wrap);
    }

    if (s.id === 'contact') {
      const wrap = document.createElement('div');
      wrap.style.paddingTop = '16px';
      wrap.innerHTML = `
   <div style="padding:0 0 12px;">
          <span style="font-size:11px;line-height:1.8;font-family:'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase;font-weight:500;color:rgba(0,0,0,0.65);">
            Feel free to send me a message!
          </span>
        </div>
        <div class="contact-form">
          <input type="text"  class="cf-input" id="cf-name"    placeholder="Name" />
          <input type="email" class="cf-input" id="cf-email"   placeholder="Email" />
          <input type="text"  class="cf-input" id="cf-subject" placeholder="Subject" />
          <textarea           class="cf-input cf-textarea" id="cf-message" placeholder="Message" rows="5"></textarea>
          <button class="cf-btn" id="cf-submit">Send</button>
        </div>
      `;
      el.appendChild(wrap);

      // Formspree submit
      el.querySelector('#cf-submit').addEventListener('click', handleContactSubmit);
    }

    root.appendChild(el);
  });
}

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