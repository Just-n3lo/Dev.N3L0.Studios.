/*dev.N3L0.Studios  script.js
   JavaScript and Leaflet for the map */
/* Reference list is in the read me file*/
'use strict';

  // 1. CONFIG the only section you need to edit for content
const CONFIG = {
  // Same address that is shown on the Contact page
  recipientEmail: 'tshwanelos120@gmail.com',

  // Web3Forms delivers every submission straight to my emails
  web3formsKey: '1ebe3d6e-ad6f-4606-9289-470748e26129',
  formEndpoint: 'https://api.web3forms.com/submit',

  currency: 'R',

  // Photography prices.
  pricing: {
    photography: { Bronze: 1800, Silver: 2500, Gold: 3300 },   // from the official price list
    videography: { Bronze: 1500, Silver: 3000, Gold: 5000 },
    development: { Bronze: 3000, Silver: 6000, Gold: 12000 }
  },
  extraHourRate: { photography: 300, videography: 450, development: 350 },
  rushFee: 0.15,                 // +15% if the date is less than 7 days away
  bookedDates: ['2026-11-14', '2026-12-05', '2026-12-24'],   // YYYY-MM-DD
  closedWeekdays: [0],           // 0 = Sunday

  //random location in Johannesburg
  map: { lat: -26.2041, lng: 28.0473, zoom: 11, serviceRadiusKm: 30 }
};

/* Dynamic content (rendered by JavaScript, not hard-coded in HTML) */
const SERVICES = [
  { key: 'photography', category: 'Photography', title: 'Portrait Photography', price: CONFIG.pricing.photography.Bronze,  available: true,  description: 'Studio and outdoor portraits that show you at your best.' },
  { key: 'photography', category: 'Photography', title: 'Event Photography',    price: CONFIG.pricing.photography.Bronze, available: true,  description: 'Birthdays, graduations and functions captured candidly.' },
  { key: 'photography', category: 'Photography', title: 'Lifestyle Photography',price: CONFIG.pricing.photography.Bronze, available: true,  description: 'Natural, story-driven shots for people and brands.' },
  { key: 'photography', category: 'Photography', title: 'Photo Editing',        price: CONFIG.pricing.photography.Bronze, priceLabel: 'Included in every package',  available: true,  description: 'Colour grading, retouching and clean-up of your images.' },
  { key: 'videography', category: 'Videography', title: 'Event Videography',    price: 2500, available: true,  description: 'Full event coverage with a polished highlight reel.' },
  { key: 'videography', category: 'Videography', title: 'Promotional Videos',   price: 3500, available: true,  description: 'Short brand videos that sell your product or service.' },
  { key: 'videography', category: 'Videography', title: 'Social Media Videos',  price: 1500, available: true,  description: 'Vertical, scroll-stopping clips for Instagram and TikTok.' },
  { key: 'videography', category: 'Videography', title: 'Cinematic Lifestyle Videos', price: 4000, available: true, description: 'Film-style visuals with a story and soundtrack.' },
  { key: 'videography', category: 'Videography', title: 'Video Editing',        price: 900,  available: true,  description: 'Cutting, colour, sound and subtitles for your footage.' },
  { key: 'development', category: 'Software Development', title: 'Website Development',  price: 3000, available: true,  description: 'Fast, responsive websites built for your business.' },
  { key: 'development', category: 'Software Development', title: 'Portfolio Websites',   price: 2500, available: true,  description: 'Show your work online with a clean personal portfolio.' },
  { key: 'development', category: 'Software Development', title: 'Software Development', price: 6000, available: true,  description: 'Custom tools and software built around your workflow.' },
  { key: 'development', category: 'Software Development', title: 'Web Applications',     price: 8000, available: false, description: 'Interactive web apps. Launching soon.' }
];

const NEWS = [
  { date: '2026-10-28', category: 'Launch',      title: 'Official launch coming soon', body: 'dev.N3L0.Studios is preparing for the official launch of our photography, videography and development services. Follow our social pages for launch updates.' },
  { date: '2026-10-15', category: 'Packages',    title: 'Bronze, Silver and Gold packages are live', body: 'Our Bronze, Silver and Gold photography packages are now available. View them on the Products & Services page.' },
  { date: '2026-10-10', category: 'Packages',    title: 'Platinum and Diamond packages coming', body: 'Platinum and Diamond packages are coming soon and will include video editing services.' },
  { date: '2026-09-30', category: 'Videography', title: 'Videography packages in progress', body: 'We are currently working on our professional videography packages.' },
  { date: '2026-09-20', category: 'Development', title: 'Website and software development', body: 'We also build websites and software for individuals and businesses.' },
  { date: '2026-09-01', category: 'Announcements', title: 'Client announcements', body: 'Important information about bookings, projects, services and special offers will be posted here.' }
];


   //2. helpers and utilities
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Stops user text being treated as HTML (prevents XSS when using innerHTML)
const escapeHTML = (str) => String(str).replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

// Waits until the user stops typing before running fn
const debounce = (fn, ms = 250) => {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
};

const money = (n) => `${CONFIG.currency}${n}`;

const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  // 3. navigation and scrolling
function initActiveNav() {
  const current = decodeURIComponent(location.pathname.split('/').pop() || 'index.html').toLowerCase();
  $$('nav a').forEach((link) => {
    const target = decodeURIComponent(link.getAttribute('href') || '').toLowerCase();
    if (target === current) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;   // old browsers just see content
  const targets = $$('main > h1, main > h2, main > p, main > section, main > ul, main .packages, main .booking, main video');
  targets.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);        //animates once 
      }
    });
  }, { threshold: 0.12 });

  targets.forEach((el) => observer.observe(el));
}


   //4. interactive elemenrs accordion, tabs, modal
function initAccordion() {
  $$('.accordion').forEach((accordion) => {
    const items = $$('.accordion-item', accordion);

    const setOpen = (item, open) => {
      const btn = $('.accordion-header', item);
      const panel = $('.accordion-panel', item);
      btn.setAttribute('aria-expanded', String(open));
      item.classList.toggle('open', open);
      panel.style.maxHeight = open ? `${panel.scrollHeight}px` : '0px';   // CSS transition animates this
    };

    items.forEach((item) => {
      setOpen(item, false);
      $('.accordion-header', item).addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        items.forEach((other) => setOpen(other, false));   // only one open at a time
        if (!wasOpen) setOpen(item, true);
      });
    });
  });
}

function initTabs() {
  $$('.tabs').forEach((group) => {
    const tabs = $$('[role="tab"]', group);
    const panels = $$('[role="tabpanel"]', group);

    const activate = (tab) => {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        t.classList.toggle('active', selected);
      });
      panels.forEach((p) => { p.hidden = p.id !== tab.dataset.tab; });
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', (e) => {          // arrow-key support
        let next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft')  next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (next) { e.preventDefault(); next.focus(); activate(next); }
      });
    });

    activate(tabs[0]);
  });
}

function initModals() {
  let lastFocused = null;

  const open = (modal) => {
    lastFocused = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('show'));
    document.body.classList.add('no-scroll');
    $('.modal-close', modal)?.focus();
  };

  const close = (modal) => {
    modal.classList.remove('show');
    setTimeout(() => { modal.hidden = true; }, 250);    // wait for fade-out
    document.body.classList.remove('no-scroll');
    lastFocused?.focus();
  };

  $$('[data-modal-target]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = document.getElementById(btn.dataset.modalTarget);
      if (modal) open(modal);
    });
  });

  $$('.modal').forEach((modal) => {
    modal.hidden = true;
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('.modal-close')) close(modal);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') $$('.modal.show').forEach(close);
  });
}

/* ---------------------------------------------------------
   5. GALLERY LIGHTBOX
   --------------------------------------------------------- */
function initLightbox() {
  const images = $$('.gallery img, .creative img');
  if (!images.length) return;

  // Page speed: load off-screen images only when needed
  images.forEach((img) => {
    img.loading = 'lazy';
    img.decoding = 'async';
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
  });

  const box = document.createElement('div');
  box.className = 'lightbox';
  box.hidden = true;
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Image viewer');
  box.innerHTML = `
    <button class="lb-close" aria-label="Close viewer">&times;</button>
    <button class="lb-prev" aria-label="Previous image">&#10094;</button>
    <figure><img alt=""><figcaption></figcaption></figure>
    <button class="lb-next" aria-label="Next image">&#10095;</button>`;
  document.body.appendChild(box);

  const bigImg = $('figure img', box);
  const caption = $('figcaption', box);
  let index = 0;

  const show = (i) => {
    index = (i + images.length) % images.length;        // wraps around
    const src = images[index];
    bigImg.src = src.currentSrc || src.src;
    bigImg.alt = src.alt;
    caption.textContent = `${src.alt} (${index + 1} of ${images.length})`;
  };
  const open = (i) => {
    show(i);
    box.hidden = false;
    requestAnimationFrame(() => box.classList.add('show'));
    document.body.classList.add('no-scroll');
    $('.lb-close', box).focus();
  };
  const close = () => {
    box.classList.remove('show');
    setTimeout(() => { box.hidden = true; }, 250);
    document.body.classList.remove('no-scroll');
    images[index].focus();
  };

  images.forEach((img, i) => {
    img.addEventListener('click', () => open(i));
    img.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
  });

  $('.lb-close', box).addEventListener('click', close);
  $('.lb-prev', box).addEventListener('click', () => show(index - 1));
  $('.lb-next', box).addEventListener('click', () => show(index + 1));
  box.addEventListener('click', (e) => { if (e.target === box) close(); });

  document.addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  // Swipe support on phones
  let startX = 0;
  box.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 50) show(diff > 0 ? index - 1 : index + 1);
  }, { passive: true });
}

  // 6. dynamic content
  // One reusable function powers the services list and the news feed

function initFilterList({ rootId, data, categories, searchKeys, sorts, renderItem, emptyText, placeholder }) {
  const root = document.getElementById(rootId);
  if (!root) return;

  root.innerHTML = `
    <div class="filter-bar">
      <input type="search" class="filter-search" placeholder="${escapeHTML(placeholder)}" aria-label="Search">
      <select class="filter-category" aria-label="Filter by category">
        <option value="all">All categories</option>
        ${categories.map((c) => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join('')}
      </select>
      <select class="filter-sort" aria-label="Sort results">
        ${sorts.map((s, i) => `<option value="${i}">${escapeHTML(s.label)}</option>`).join('')}
      </select>
    </div>
    <p class="filter-count" aria-live="polite"></p>
    <div class="card-grid"></div>`;

  const search = $('.filter-search', root);
  const category = $('.filter-category', root);
  const sort = $('.filter-sort', root);
  const grid = $('.card-grid', root);
  const count = $('.filter-count', root);

  const render = () => {
    const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);

    const results = data
      .filter((item) => category.value === 'all' || item.category === category.value)
      .filter((item) => {
        const haystack = searchKeys.map((k) => item[k]).join(' ').toLowerCase();
        return terms.every((t) => haystack.includes(t));        // every word must match
      })
      .sort(sorts[Number(sort.value)].fn);

    grid.innerHTML = results.length
      ? results.map(renderItem).join('')
      : `<p class="empty">${escapeHTML(emptyText)}</p>`;
    count.textContent = results.length ? `Showing ${results.length} of ${data.length}` : '';
  };

  search.addEventListener('input', debounce(render, 200));
  category.addEventListener('change', render);
  sort.addEventListener('change', render);
  render();
}

function initServicesList() {
  initFilterList({
    rootId: 'services-app',
    data: SERVICES,
    categories: ['Photography', 'Videography', 'Software Development'],
    searchKeys: ['title', 'description', 'category'],
    placeholder: 'Search services (e.g. wedding, video, website)...',
    emptyText: 'No services match your search. Try a different word.',
    sorts: [
      { label: 'Name: A to Z',        fn: (a, b) => a.title.localeCompare(b.title) },
      { label: 'Price: low to high',  fn: (a, b) => a.price - b.price },
      { label: 'Price: high to low',  fn: (a, b) => b.price - a.price }
    ],
    renderItem: (s) => `
      <article class="card">
        <span class="badge">${escapeHTML(s.category)}</span>
        <h3>${escapeHTML(s.title)}</h3>
        <p>${escapeHTML(s.description)}</p>
        <p class="price">${s.available ? escapeHTML(s.priceLabel || `From ${money(s.price)}`) : 'Coming soon'}</p>
        ${s.available
          ? `<a class="btn" href="enquiry.html?service=${encodeURIComponent(s.key)}">Enquire</a>`
          : '<span class="btn disabled" aria-disabled="true">Coming soon</span>'}
      </article>`
  });
}

function initNewsFeed() {
  const fmt = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });

  initFilterList({
    rootId: 'news-feed',
    data: NEWS,
    categories: ['Launch', 'Packages', 'Videography', 'Development', 'Announcements'],
    searchKeys: ['title', 'body', 'category'],
    placeholder: 'Search news and updates...',
    emptyText: 'No updates match your search.',
    sorts: [
      { label: 'Newest first', fn: (a, b) => b.date.localeCompare(a.date) },
      { label: 'Oldest first', fn: (a, b) => a.date.localeCompare(b.date) },
      { label: 'Title: A to Z', fn: (a, b) => a.title.localeCompare(b.title) }
    ],
    renderItem: (n) => `
      <article class="card">
        <span class="badge">${escapeHTML(n.category)}</span>
        <h3>${escapeHTML(n.title)}</h3>
        <p class="date">${fmt(n.date)}</p>
        <p>${escapeHTML(n.body)}</p>
      </article>`
  });
}
   //6b. INTERACTIVE PRICE LIST (replaces the old price-list picture)
   
const PACKAGES = [
  { name: 'Bronze', level: 'Basic', tier: 'bronze', photos: '10', price: CONFIG.pricing.photography.Bronze,
    badge: 'Best for personal use',
    features: ['Basic Color Correction', 'Crop & Straighten', 'Light Retouching', 'High Resolution Images'] },
  { name: 'Silver', level: 'Standard', tier: 'silver', photos: '20', price: CONFIG.pricing.photography.Silver,
    badge: 'Great for everyday moments',
    features: ['Advanced Color Correction', 'Skin Retouching', 'Adjustments & Enhancements', 'High Resolution Images'] },
  { name: 'Gold', level: 'Premium', tier: 'gold', photos: '35', price: CONFIG.pricing.photography.Gold,
    badge: 'Perfect for special occasions',
    features: ['Premium Color Grading', 'Detailed Retouching', 'Background Adjustments', 'Professional Enhancements', 'High Resolution Images'] },
  { name: 'Platinum', level: 'Professional', tier: 'platinum', photos: '50', price: null,
    videos: { count: 2, length: 'up to 2 min each' },
    features: ['Cinematic Color Grading', 'Advanced Retouching', 'Professional Enhancements', 'Titles, Transitions & Effects', 'High Quality Export'] },
  { name: 'Diamond', level: 'Ultimate', tier: 'diamond', photos: '75+', price: null,
    videos: { count: 5, length: 'up to 5 min each' },
    features: ['Cinematic Color Grading', 'Advanced Retouching', 'Custom Edits & Effects', 'Titles, Transitions & Effects', 'High Quality Export'] }
];

const ICONS = {
  camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 8h3.2l1.6-2.5h7.4L17.3 8h3.2v11h-17z"/><circle cx="12" cy="13.2" r="3.4"/></svg>',
  video:  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6.5" width="13" height="11" rx="2"/><path d="M16 10.5l5-3v9l-5-3z"/></svg>',
  check:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  clock:  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 2"/></svg>',
  star:   '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  aperture: '<svg class="emblem" viewBox="0 0 64 64" aria-hidden="true"><polygon points="32,4 56,18 56,46 32,60 8,46 8,18"/><circle cx="32" cy="32" r="13"/><path d="M32 19l8 13M45 32l-13 13M32 45l-8-13M19 32l13-13"/></svg>',
  gem:    '<svg class="emblem" viewBox="0 0 64 64" aria-hidden="true"><polygon points="32,4 56,18 56,46 32,60 8,46 8,18"/><path d="M19 27h26L32 46zM19 27l6-8h14l6 8M32 27v19"/></svg>'
};

function packageCard(p) {
  const priced = p.price !== null;
  return `
    <article class="price-card tier-${p.tier}" tabindex="0" data-package="${escapeHTML(p.name)}" aria-label="${escapeHTML(p.name)} package">
      <div class="pc-head">
        ${p.tier === 'diamond' ? ICONS.gem : ICONS.aperture}
        <h3>${escapeHTML(p.name.toUpperCase())}</h3>
        <span class="pc-level">${escapeHTML(p.level)}</span>
      </div>
      <ul class="pc-stats">
        <li>${ICONS.camera}<span><strong>${escapeHTML(p.photos)}</strong>Edited photos</span></li>
        ${p.videos ? `<li>${ICONS.video}<span><strong>${p.videos.count}</strong>Edited videos<small>(${escapeHTML(p.videos.length)})</small></span></li>` : ''}
      </ul>
      <div class="pc-price">
        ${priced
          ? `<span class="amount" data-value="${p.price}">${money(p.price)}</span><small>ZAR</small>`
          : '<span class="amount">TBC</span><small>Price to be confirmed</small>'}
      </div>
      <ul class="pc-features">
        ${p.features.map((f) => `<li>${ICONS.check}${escapeHTML(f)}</li>`).join('')}
      </ul>
      ${priced
        ? `<a class="btn pc-cta" href="enquiry.html?service=photography&amp;package=${encodeURIComponent(p.name)}">Choose ${escapeHTML(p.name)}</a>
           <div class="pc-foot">${ICONS.star}<span>${escapeHTML(p.badge)}</span></div>`
        : `<div class="pc-foot soon">${ICONS.clock}<span><strong>TBC</strong>Coming soon</span></div>`}
    </article>`;
}

function initPricingCards() {
  const root = document.getElementById('pricing-cards');
  if (!root) return;

  root.innerHTML = `
    <div class="pricing-title">
      <span class="pricing-brand">dev.N3L0.Studios</span>
      <span class="pricing-heading">PRICE LIST</span>
      <span class="pricing-tagline">Capture moments. Create memories.</span>
    </div>
    <div class="price-grid">${PACKAGES.map(packageCard).join('')}</div>
    <p class="pricing-summary" id="pricing-summary" aria-live="polite">Click or tap a package to see a summary.</p>
    <div class="pricing-notes">
      <span>High quality. Attention to detail. Delivered with passion.</span>
      <span>Prices may vary based on project requirements.</span>
    </div>`;

  const cards = $$('.price-card', root);
  const summary = $('#pricing-summary', root);

  // Select a card and describe it underneath
  const select = (card) => {
    cards.forEach((c) => c.classList.toggle('selected', c === card));
    const p = PACKAGES.find((x) => x.name === card.dataset.package);
    const videos = p.videos ? ` and ${p.videos.count} edited videos (${p.videos.length})` : '';
    summary.innerHTML = p.price !== null
      ? `You selected <strong>${escapeHTML(p.name)}</strong>: ${escapeHTML(p.photos)} edited photos${escapeHTML(videos)} for <strong>${money(p.price)}</strong>. <a href="enquiry.html?service=photography&amp;package=${encodeURIComponent(p.name)}">Get a quote for ${escapeHTML(p.name)}</a>`
      : `<strong>${escapeHTML(p.name)}</strong> is coming soon. <a href="contact.html">Contact us</a> to be the first to know.`;
  };

  cards.forEach((card) => {
    card.addEventListener('click', (e) => { if (!e.target.closest('a')) select(card); });
    card.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); select(card); }
    });
  });

  // Count up animation when a price scrolls into view
  const animate = 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!animate) return;

  const amounts = $$('.amount[data-value]', root);
  amounts.forEach((el) => { el.textContent = money(0); });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.value);
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / 900, 1);
        el.textContent = money(Math.round(target * (1 - Math.pow(1 - t, 3))));   // ease-out
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.4 });
  amounts.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   7. INTERACTIVE MAP (Leaflet + OpenStreetMap)
    switchable map styles (street / dark / satellite), click anywhere to
   measure the distance to the studio, "find distance from me" with a route
   line, directions link and a reset button.
    --------------------------------------------------------- */
function initMap() {
  const el = document.getElementById('map');
  if (!el) return;

  const { lat, lng, zoom, serviceRadiusKm } = CONFIG.map;
  const studio = [lat, lng];

  if (typeof L === 'undefined') {       
    el.innerHTML = `<p class="map-fallback">The interactive map could not load. We are based in Johannesburg, Gauteng.
      <a href="https://www.openstreetmap.org/?mlat=${lat}&amp;mlon=${lng}#map=${zoom}/${lat}/${lng}" target="_blank" rel="noopener noreferrer">Open in OpenStreetMap</a></p>`;
    return;
  }

  const map = L.map(el, { scrollWheelZoom: false }).setView(studio, zoom);

  //Map styles the visitor can switch between
  const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19, subdomains: 'abcd',
    attribution: '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  });
  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics'
  });
  street.addTo(map);
  L.control.layers({ Street: street, Dark: dark, Satellite: satellite }, null, { collapsed: true }).addTo(map);
  L.control.scale({ imperial: false }).addTo(map);

  //Studio marker, popup and service area
  const directionsTo = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  L.circle(studio, {
    radius: serviceRadiusKm * 1000,
    color: '#7011b4', weight: 2, fillColor: '#7011b4', fillOpacity: 0.08
  }).addTo(map).bindTooltip(`We cover about ${serviceRadiusKm} km around Johannesburg`, { sticky: true });

  L.marker(studio, { title: 'dev.N3L0.Studios', alt: 'dev.N3L0.Studios location marker' }).addTo(map)
    .bindPopup(`<strong>dev.N3L0.Studios</strong><br>Johannesburg, Gauteng<br>
      <a href="${directionsTo}" target="_blank" rel="noopener noreferrer">Get directions</a>`)
    .openPopup();

  // Leaflet needed the real size of its box
  const refresh = () => map.invalidateSize();
  window.addEventListener('load', refresh);
  window.addEventListener('resize', debounce(refresh, 200));
  setTimeout(refresh, 300);

  //Buttons (the locate button and status text already exist in contact.html)
  const locateBtn = document.getElementById('locate-btn');
  const status = document.getElementById('map-status');
  const setStatus = (msg) => { if (status) status.textContent = msg; };

  let extras = [];                       // pin, user marker and route line, so they can be cleared
  const clearExtras = () => { extras.forEach((layer) => layer.remove()); extras = []; };

  // Extra buttons are created here so no HTML change is needed
  let directionsLink = null;
  if (locateBtn) {
    const actions = locateBtn.parentElement;
    actions.classList.add('map-actions');

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'btn alt';
    resetBtn.textContent = 'Reset map';

    directionsLink = document.createElement('a');
    directionsLink.className = 'btn alt';
    directionsLink.textContent = 'Get directions';
    directionsLink.href = directionsTo;
    directionsLink.target = '_blank';
    directionsLink.rel = 'noopener noreferrer';

    actions.append(' ', resetBtn, ' ', directionsLink);

    resetBtn.addEventListener('click', () => {
      clearExtras();
      directionsLink.href = directionsTo;
      map.setView(studio, zoom);
      map.scrollWheelZoom.disable();
      setStatus('Map reset. Click anywhere on the map to measure the distance to the studio.');
    });
  }

  // Click the map: drop a pin and show the straight-line distance to the studio
  map.on('click', (e) => {
    map.scrollWheelZoom.enable();        // scroll-zoom only after the user clicks (page scrolling is not hijacked)
    const km = map.distance(studio, e.latlng) / 1000;
    const inside = km <= serviceRadiusKm;

    clearExtras();
    const pin = L.circleMarker(e.latlng, { radius: 8, color: '#c9b8ff', weight: 2, fillColor: '#7011b4', fillOpacity: 0.9 })
      .addTo(map)
      .bindPopup(`<strong>${km.toFixed(1)} km</strong> from the studio (straight line)<br>${inside ? 'Inside our service area.' : 'Outside our usual service area. Contact us for travel options.'}`)
      .openPopup();
    const line = L.polyline([studio, [e.latlng.lat, e.latlng.lng]], { color: '#c9b8ff', weight: 3, dashArray: '6 8' }).addTo(map);
    extras = [pin, line];
    setStatus(`That spot is about ${km.toFixed(1)} km from the studio. ${inside ? 'It is inside our service area.' : 'It is outside our usual service area.'}`);
  });
  map.on('mouseout', () => map.scrollWheelZoom.disable());

  // "How far am I from the studio?"  location based feature
  if (!locateBtn) return;

  locateBtn.addEventListener('click', () => {
    if (!navigator.geolocation) { setStatus('Your browser does not support location.'); return; }
    setStatus('Finding your location...');
    locateBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        locateBtn.disabled = false;
        const me = [coords.latitude, coords.longitude];
        const km = map.distance(studio, me) / 1000;

        clearExtras();
        const marker = L.marker(me, { title: 'Your location' }).addTo(map).bindPopup('You are here').openPopup();
        const line = L.polyline([studio, me], { color: '#c9b8ff', weight: 3, dashArray: '6 8' }).addTo(map);
        extras = [marker, line];

        map.fitBounds([studio, me], { padding: [40, 40] });
        if (directionsLink) directionsLink.href = `${directionsTo}&origin=${coords.latitude},${coords.longitude}`;
        setStatus(`You are about ${km.toFixed(1)} km from the studio (straight line). Use "Get directions" for the road route.`);
      },
      (err) => {
        locateBtn.disabled = false;
        setStatus(err.code === 1
          ? 'Location access was blocked. Allow location for this site in your browser and try again.'
          : 'We could not get your location. Please try again.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}

   //8. FORM VALIDATION (shared by contact + enquiry forms)
const required = (msg) => (v) => (v ? '' : msg);

const COMMON_RULES = {
  name: (v) => {
    if (!v) return 'Please enter your full name.';
    if (v.length < 2) return 'Your name must be at least 2 characters.';
    if (!/^[\p{L}][\p{L}' -]*$/u.test(v)) return 'Use letters, spaces, hyphens or apostrophes only.';
    return '';
  },
  phone: (v) => {
    const digits = v.replace(/[\s()-]/g, '');
    if (!digits) return 'Please enter your phone number.';
    if (!/^(\+27|0)[1-9]\d{8}$/.test(digits)) return 'Enter a valid SA number, e.g. 067 951 7008 or +27 67 951 7008.';
    return '';
  },
  email: (v) => {
    if (!v) return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email, e.g. name@example.com.';
    return '';
  },
  message: (v) => {
    if (!v) return 'Please tell us a little about your booking or project.';
    if (v.length < 10) return 'Please write at least 10 characters.';
    if (v.length > 1000) return 'Please keep your message under 1000 characters.';
    return '';
  },
  consent: (v) => (v ? '' : 'Please tick the box so we may contact you about this message.')
};

function showError(field, message) {
  const id = `${field.id}-error`;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('small');
    el.id = id;
    el.className = 'error-msg';
    el.setAttribute('role', 'alert');
    const anchor = field.type === 'checkbox' ? (field.closest('.check-row') || field) : field;
    anchor.insertAdjacentElement('afterend', el);
  }
  el.textContent = message;
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  field.setAttribute('aria-describedby', id);
  field.classList.toggle('invalid', Boolean(message));
  field.classList.toggle('valid', !message && field.value.trim() !== '');
}

// Wires up live validation; returns a function that validates the whole form.
function setupValidation(form, rules) {
  form.noValidate = true;       // turn off browser pop-ups so OUR messages show
  const fields = $$('input, select, textarea', form).filter((f) => rules[f.name]);

  const check = (field) => {
    const value = field.type === 'checkbox' ? (field.checked ? 'checked' : '') : field.value.trim();
    const message = rules[field.name](value, form);
    showError(field, message);
    return !message;
  };

  fields.forEach((field) => {
    field.addEventListener('blur', () => check(field));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') check(field);   // re-check as they fix it
    });
  });

  return () => {
    const results = fields.map(check);                                   // validates ALL fields
    fields.find((f) => f.getAttribute('aria-invalid') === 'true')?.focus();
    return results.every(Boolean);
  };
}


  // 8b. SEND TO EMAIL (Web3Forms) used by both forms
 //  Posts the fields to Web3Forms, which emails them to the owner.
  // Throws an error if the message could not be delivered.
async function sendToEmail(fields) {
  const formData = new FormData();
  formData.append('access_key', CONFIG.web3formsKey);
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value));

  const res = await fetch(CONFIG.formEndpoint, { method: 'POST', body: formData });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || `Server responded with ${res.status}`);
  return data;
}

  // 9. CONTACT FORM -> sent straight to the owner's email  
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const validate = setupValidation(form, {
    name: COMMON_RULES.name,
    phone: COMMON_RULES.phone,
    email: COMMON_RULES.email,
    messageType: required('Please choose what type of message this is.'),
    services: required('Please choose a service.'),
    message: COMMON_RULES.message,
    consent: COMMON_RULES.consent
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const f = form.elements;
    const label = (select) => select.selectedOptions[0].textContent.trim();
    const type = label(f.messageType);
    const service = label(f.services);
    const method = form.querySelector('input[name="contactMethod"]:checked')?.value || 'Email';

    const subject = `${type}: ${service} - ${f.name.value.trim()}`;
    const body = [
      'Hi dev.N3L0.Studios,', '',
      f.message.value.trim(), '',
      '--- My details ---',
      `Name: ${f.name.value.trim()}`,
      `Phone: ${f.phone.value.trim()}`,
      `Email: ${f.email.value.trim()}`,
      `Message type: ${type}`,
      `Service: ${service}`,
      `Preferred contact method: ${method}`,
      `Sent: ${new Date().toLocaleString('en-ZA')}`
    ].join('\r\n');

    const btn = $('button[type="submit"]', form);
    const btnText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';

    let sent = true;
    try {
      await sendToEmail({
        subject,                          // email subject line
        from_name: f.name.value.trim(),   // shown as the sender name
        name: f.name.value.trim(),
        email: f.email.value.trim(),      // Web3Forms uses this as the reply to address
        phone: f.phone.value.trim(),
        messageType: type,
        service,
        contactMethod: method,
        message: f.message.value.trim()
      });
    } catch { sent = false; }

    btn.disabled = false;
    btn.textContent = btnText;

    showEmailPreview(form, subject, body, sent);
    if (sent) {
      form.reset();
      $$('.valid, .invalid', form).forEach((el) => el.classList.remove('valid', 'invalid'));
    }
  });
}

function showEmailPreview(form, subject, body, sent = false) {
  const to = CONFIG.recipientEmail;
  const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const gmail = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  let box = document.getElementById('email-preview');
  if (!box) {
    box = document.createElement('section');
    box.id = 'email-preview';
    box.className = 'email-preview';
    box.setAttribute('aria-live', 'polite');
    form.closest('.contact-form').insertAdjacentElement('afterend', box);
  }

  box.innerHTML = `
    <h2>${sent ? 'Message sent!' : 'We could not send it automatically'}</h2>
    ${sent
      ? '<p class="ok">Thank you! Your message has been delivered and we will get back to you soon.</p>'
      : '<p class="bad">Something went wrong. Please use a button below to send it by email instead.</p>'}
    <dl>
      <dt>To</dt><dd>${escapeHTML(to)}</dd>
      <dt>Subject</dt><dd>${escapeHTML(subject)}</dd>
    </dl>
    <pre>${escapeHTML(body)}</pre>
    <div class="preview-actions">
      <a class="btn" href="${escapeHTML(mailto)}">Open in email app</a>
      <a class="btn alt" href="${escapeHTML(gmail)}" target="_blank" rel="noopener noreferrer">Open in Gmail</a>
      <button type="button" class="btn alt" id="copy-email">Copy message</button>
    </div>
    <p class="copy-status" aria-live="polite"></p>`;

  $('#copy-email', box).addEventListener('click', async () => {
    const status = $('.copy-status', box);
    try {
      await navigator.clipboard.writeText(`To: ${to}\nSubject: ${subject}\n\n${body}`);
      status.textContent = 'Copied to clipboard.';
    } catch {
      status.textContent = 'Could not copy automatically. Please select the text and copy it.';
    }
  });

  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (!sent) window.location.href = mailto;      // only open the email app when automatic sending failed
}


   //10. ENQUIRY FORM validation + email + cost/availability reply
  
function buildQuote({ service, pkg, date, hours }) {
  const base = CONFIG.pricing[service][pkg];
  const extra = hours * CONFIG.extraHourRate[service];
  const daysAhead = Math.ceil((date - startOfToday()) / 86400000);
  const rush = daysAhead < 7 ? Math.round((base + extra) * CONFIG.rushFee) : 0;
  return { base, extra, rush, total: base + extra + rush };
}

function checkAvailability(date) {
  if (CONFIG.closedWeekdays.includes(date.getDay())) return { ok: false, reason: 'We do not take bookings on Sundays.' };
  if (CONFIG.bookedDates.includes(toISO(date))) return { ok: false, reason: 'That date is already booked.' };
  return { ok: true, reason: '' };
}

function nextAvailable(date, count = 3) {
  const found = [];
  const d = new Date(date);
  while (found.length < count) {
    d.setDate(d.getDate() + 1);
    if (checkAvailability(d).ok) found.push(new Date(d));
  }
  return found;
}

function initEnquiryForm() {
  const form = document.getElementById('enquiry-form');
  if (!form) return;

  const f = form.elements;
  const result = document.getElementById('enquiry-result');
  const submitBtn = $('button[type="submit"]', form);
  const longDate = (d) => d.toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Pre-select service when arriving from a "Enquire" button (enquiry.html?service=videography)
  const preset = new URLSearchParams(location.search).get('service');
  if ([...f.service.options].some((o) => o.value === preset)) f.service.value = preset;

  const presetPackage = new URLSearchParams(location.search).get('package');
  if ([...f.package.options].some((o) => o.value === presetPackage)) f.package.value = presetPackage;

  f.date.min = toISO(startOfToday());          // browser date picker blocks past dates

  const validate = setupValidation(form, {
    name: COMMON_RULES.name,
    email: COMMON_RULES.email,
    phone: COMMON_RULES.phone,
    service: required('Please choose a service.'),
    package: required('Please choose a package.'),
    date: (v) => {
      if (!v) return 'Please choose your preferred date.';
      if (new Date(`${v}T00:00:00`) < startOfToday()) return 'The date cannot be in the past.';
      return '';
    },
    hours: (v) => {
      const n = Number(v);
      if (v === '') return 'Enter 0 if you need no extra hours.';
      if (!Number.isInteger(n) || n < 0 || n > 10) return 'Enter a whole number from 0 to 10.';
      return '';
    },
    message: COMMON_RULES.message,
    consent: COMMON_RULES.consent
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(),
      service: f.service.value, pkg: f.package.value, date: f.date.value,
      hours: Number(f.hours.value), message: f.message.value.trim(),
      contactMethod: form.querySelector('input[name="contactMethod"]:checked')?.value || 'Email',
      newsletter: f.newsletter.checked
    };
    const date = new Date(`${data.date}T00:00:00`);
    const quote = buildQuote({ ...data, date });

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    let sent = true;
    try {
      await sendToEmail({
        subject: `Enquiry: ${data.service} (${data.pkg}) - ${data.name}`,
        from_name: data.name,
        name: data.name,
        email: data.email,
        phone: data.phone,
        service: data.service,
        package: data.pkg,
        preferredDate: data.date,
        extraHours: data.hours,
        estimatedTotal: money(quote.total),
        contactMethod: data.contactMethod,
        newsletter: data.newsletter ? 'Yes' : 'No',
        message: data.message
      });
    } catch { sent = false; }     // AJAX: page never reloads
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Enquiry';

    const serviceLabel = f.service.selectedOptions[0]?.textContent.trim() || data.service;
    const avail = checkAvailability(date);
    const alternatives = avail.ok ? [] : nextAvailable(date);

    result.hidden = false;
    result.innerHTML = `
      <h2>Thanks, ${escapeHTML(data.name.split(' ')[0])}!</h2>
      ${sent
        ? '<p class="ok">Your enquiry has been sent to us.</p>'
        : `<p class="warn">We could not send your enquiry automatically, so please also email it to ${escapeHTML(CONFIG.recipientEmail)}. Your quote is still shown below.</p>`}
      <h3>Availability</h3>
      ${avail.ok
        ? `<p class="ok">Good news: ${escapeHTML(longDate(date))} is available.</p>`
        : `<p class="bad">${escapeHTML(avail.reason)} Nearest available dates:</p>
           <ul class="alt-dates">${alternatives.map((d) => `<li>${escapeHTML(longDate(d))}</li>`).join('')}</ul>`}
      <h3>Estimated cost</h3>
      <table class="quote">
        <tr><td>${escapeHTML(serviceLabel)} - ${escapeHTML(data.pkg)} package</td><td>${money(quote.base)}</td></tr>
        <tr><td>Extra hours (${data.hours})</td><td>${money(quote.extra)}</td></tr>
        ${quote.rush ? `<tr><td>Short-notice fee (under 7 days)</td><td>${money(quote.rush)}</td></tr>` : ''}
        <tr class="total"><td>Estimated total</td><td>${money(quote.total)}</td></tr>
      </table>
      <p class="note">This is an estimate. We will confirm the final price and contact you by ${escapeHTML(data.contactMethod.toLowerCase())} within a day.</p>`;

    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (sent) {                    // keep the form filled in if sending failed, so nothing has to be retyped
      form.reset();
      $$('.valid, .invalid', form).forEach((el) => el.classList.remove('valid', 'invalid'));
    }
  });
}


   //10b. LIVE CHARACTER COUNTER on every textarea with maxlength
 
function initCharCounters() {
  $$('textarea[maxlength]').forEach((area) => {
    const counter = document.createElement('small');
    counter.className = 'char-counter';
    counter.setAttribute('aria-live', 'polite');
    area.insertAdjacentElement('afterend', counter);
    const update = () => { counter.textContent = `${area.value.length} / ${area.maxLength} characters`; };
    area.addEventListener('input', update);
    area.form?.addEventListener('reset', () => setTimeout(update));
    update();
  });
}


   //11. START EVERYTHING
  
document.addEventListener('DOMContentLoaded', () => {
  // Build dynamic content first so later modules (reveal, lightbox) see it
  initServicesList();
  initNewsFeed();
  initPricingCards();

  initActiveNav();
  initScrollReveal();
  initAccordion();
  initTabs();
  initModals();
  initLightbox();
  initMap();
  initCharCounters();
  initContactForm();
  initEnquiryForm();
});
