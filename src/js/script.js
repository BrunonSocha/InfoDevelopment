const delay = (ms) => new Promise(res => setTimeout(res, ms));

function initHero() {
  const heroSection = document.querySelector('.hero');
  const scrollTarget = document.getElementById('main-content-start');
  const heroLogo = document.querySelector('.hero-logo');
  if (!heroSection || !scrollTarget) return;

  let isHeroActive = true;

  const exitHero = () => {
    if (!isHeroActive) return;
    isHeroActive = false;

    const onScrollEnd = () => {
      if (heroSection) {
        heroSection.style.display = 'none';
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      document.removeEventListener('scrollend', onScrollEnd);
    };

    document.addEventListener('scrollend', onScrollEnd);
    heroSection.classList.add('is-hidden');
    scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.addEventListener('wheel', (e) => {
    const scrollThreshold = window.innerHeight * 0.1;
    if (isHeroActive && e.deltaY > 0 && window.scrollY > scrollThreshold) {
      e.preventDefault();
      exitHero();
    }
  }, { passive: false });

  const scrollArrow = document.querySelector('.scroll-down-arrow');
  if (scrollArrow) {
    scrollArrow.addEventListener('click', (e) => {
      e.preventDefault();
      exitHero();
    });
  }

  window.addEventListener('scroll', () => {
    if (isHeroActive && heroLogo) {
      if (window.scrollY > 20) {
        heroLogo.classList.add('is-hidden');
      } else {
        heroLogo.classList.remove('is-hidden');
      }
    }
  });
}

function initStickyBanner() {
  const heroLogo = document.querySelector('.hero-logo');

  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;

    if (scrollPosition > 50) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }

    if (heroLogo && !document.querySelector('.hero:not(.is-hidden)')) {
      if (scrollPosition > 20) {
        heroLogo.classList.add('is-hidden');
      } else {
        heroLogo.classList.remove('is-hidden');
      }
    }
  });
}

function initFormHandler() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('status');
  const isEnglish = document.documentElement.lang === 'en';

  const messages = {
    sending: isEnglish ? 'Sending…' : 'Wysyłanie…',
    success: isEnglish ? 'Thank you. We will be in touch shortly.' : 'Dziękujemy. Skontaktujemy się wkrótce.',
    error: isEnglish ? 'Submission error. Please try again later.' : 'Błąd wysyłki. Spróbuj ponownie później.',
    networkError: isEnglish ? 'Network error. Please try again later.' : 'Błąd sieci. Spróbuj ponownie później.'
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = messages.sending;
    const data = new FormData(form);

    try {
      const r = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (r.ok) {
        form.reset();
        status.classList.remove('error');
        status.textContent = messages.success;
      } else {
        status.classList.add('error');
        status.textContent = messages.error;
      }
    } catch {
      status.classList.add('error');
      status.textContent = messages.networkError;
    }
  });
}

function initThemeSwitcher() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const easterEggBtn = document.getElementById('cyberpunk-toggle');
  const themes = ['', 'dark', 'mono', 'ocean', 'forest', 'dusk'];
  let currentThemeIndex = 0;

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.documentElement.classList.remove('mono', 'ocean', 'forest', 'dusk');
      document.documentElement.classList.toggle('dark');
    });
  }

  if (easterEggBtn) {
    easterEggBtn.addEventListener('click', () => {
      currentThemeIndex = (currentThemeIndex + 1) % themes.length;
      document.documentElement.className = themes[currentThemeIndex];
    });
  }
}

function initPageTransitions() {
  document.querySelectorAll('.lang-switcher a, .footer-links a, a.button-like').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.href;

      if (link.classList.contains('lang-active')) {
        e.preventDefault();
        return;
      }

      if (href.endsWith('.html')) {
        e.preventDefault();
        document.body.classList.add('fade-out');
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      }
    });
  });
}

const mockPriceData = {
  "A1": {
    "cena-calosc": [
      { date: "2025-10-18", price: 536600 },
      { date: "2025-10-10", price: 539000 },
      { date: "2025-09-25", price: 530000 },
    ]
  },
  "A2": {
    "cena-calosc": [
      { date: "2025-10-15", price: 384820 }
    ]
  },
  "A3": {
    "cena-calosc": [
      { date: "2025-09-30", price: 677774 }
    ]
  },
  "A4": {
    "cena-calosc": [
      { date: "2025-10-17", price: 464880 },
      { date: "2025-10-05", price: 470000 },
    ]
  }
};

function initPriceTooltips() {
  const tooltip = document.getElementById('price-tooltip');
  if (!tooltip) return;

  const isEnglish = document.documentElement.lang === 'en';

  document.querySelectorAll('.price-cell').forEach(cell => {
    cell.addEventListener('mouseenter', (e) => {
      const aptId = e.target.closest('tr').dataset.aptId;
      const colId = e.target.dataset.col;
      const history = (mockPriceData[aptId] && mockPriceData[aptId][colId]) ||
                      (mockPriceData[aptId] && mockPriceData[aptId]['cena-calosc']);

      if (!history || history.length === 0) return;

      const prices = history.map(h => h.price);
      const lowestPrice = Math.min(...prices);

      let historyHtml = history.map(item => `
        <li>
          <span>${item.date}</span>
          <span class="${item.price === lowestPrice ? 'lowest-price' : ''}">
            ${item.price.toLocaleString(isEnglish ? 'en-US' : 'pl-PL')} ${isEnglish ? 'PLN' : 'zł'}
          </span>
        </li>
      `).join('');

      tooltip.innerHTML = `
        <h4>${isEnglish ? 'Price History' : 'Historia Ceny'}</h4>
        <ul>${historyHtml}</ul>
        <div class="lowest-price" style="margin-top: 8px; font-size: 12px;">
          ${isEnglish ? 'Lowest price (30 days):' : 'Najniższa cena (30 dni):'}
          ${lowestPrice.toLocaleString(isEnglish ? 'en-US' : 'pl-PL')} ${isEnglish ? 'PLN' : 'zł'}
        </div>
      `;
      tooltip.style.display = 'block';
    });

    cell.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });

    cell.addEventListener('mousemove', (e) => {
      const xOffset = window.innerWidth - e.pageX < 300 ? -300 : 15;
      tooltip.style.left = `${e.pageX + xOffset}px`;
      tooltip.style.top = `${e.pageY + 15}px`;
    });
  });
}

function initAnimations() {
  const logEl = document.getElementById('log');
  const table = document.getElementById('data-table');
  if (!logEl || !table) return;

  const isEnglish = document.documentElement.lang === 'en';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let logLinesCount = 0;
  const maxLogLines = 10;
  let simulationInterval;
  let typingInProgress = false;
  const typingSpeed = 15;

  const initialLogs = isEnglish ? [
    { class: 'log-info', text: '[info] InfoDevelopment pipeline initializing...' },
    { class: 'log-ok', text: '[ok] Connected to dane.gov.pl endpoint.' },
    { class: 'log-info', text: '[info] Watching 4 apartments for price changes...' }
  ] : [
    { class: 'log-info', text: '[info] Inicjalizacja potoku InfoDevelopment...' },
    { class: 'log-ok', text: '[ok] Połączono z punktem końcowym dane.gov.pl.' },
    { class: 'log-info', text: '[info] Obserwowanie 4 mieszkań pod kątem zmian cen...' }
  ];

  function typeLine(spanElement, fullText, callback) {
    if (prefersReduced || !fullText) {
      spanElement.textContent = fullText;
      if (callback) callback();
      return;
    }

    let i = 0;
    typingInProgress = true;
    function step() {
      if (i < fullText.length) {
        spanElement.textContent = fullText.substring(0, i + 1) + '▌';
        i++;
        setTimeout(step, typingSpeed);
      } else {
        spanElement.textContent = fullText;
        typingInProgress = false;
        if (callback) callback();
      }
    }
    step();
  }

  function addLog(logEntry) {
    if (!logEl) return;

    if (typingInProgress) {
        setTimeout(() => addLog(logEntry), typingSpeed * 5);
        return;
    }

    const span = document.createElement('span');
    span.className = logEntry.class;
    logEl.appendChild(span);
    logLinesCount++;

    while (logLinesCount > maxLogLines) {
      if (logEl.firstChild) {
         logEl.removeChild(logEl.firstChild);
         logLinesCount--;
      } else {
         break;
      }
    }

    typeLine(span, logEntry.text, () => {
        logEl.scrollTop = logEl.scrollHeight;
    });
  }

  initialLogs.forEach(addLog);

  if (prefersReduced) {
    addLog({
      class: 'log-info',
      text: isEnglish ? '[info] Animations disabled (prefers-reduced-motion).' : '[info] Animacje wyłączone (prefers-reduced-motion).'
    });
    return;
  }

  function simulatePriceChange() {
    const availableApts = ['A1', 'A4'];
    const aptId = availableApts[Math.floor(Math.random() * availableApts.length)];
    const row = table.querySelector(`tr[data-apt-id="${aptId}"]`);
    if (!row) return;

    const cell = row.querySelector('[data-col="cena-calosc"]');
    const history = mockPriceData[aptId]['cena-calosc'];
    if (!history || history.length === 0) return;
    const currentPrice = history[0].price;

    const changePercent = (Math.random() * 0.05) - 0.02;
    let newPrice = Math.round(currentPrice * (1 + changePercent));
    newPrice = Math.round(newPrice / 100) * 100;

    if (newPrice === currentPrice) return;

    const flashClass = newPrice > currentPrice ? 'price-flash-up' : 'price-flash-down';
    const newPriceString = `${newPrice.toLocaleString(isEnglish ? 'en-US' : 'pl-PL')} ${isEnglish ? 'PLN' : 'zł'}`;

    cell.textContent = newPriceString;
    cell.classList.remove('price-flash-up', 'price-flash-down');
    void cell.offsetWidth;
    cell.classList.add(flashClass);

    const newDate = new Date().toISOString().split('T')[0];
    history.unshift({ date: newDate, price: newPrice });

    addLog({
      class: 'log-change',
      text: `[${isEnglish ? 'PRICE_UPDATE' : 'ZMIANA_CENY'}] Apt ${aptId}: ${newPriceString}`
    });
    setTimeout(() => {
        addLog({
          class: 'log-info',
          text: `[info] ${isEnglish ? 'New price archived. Submitting update...' : 'Nowa cena zarchiwizowana. Wysyłanie aktualizacji...'}`
        });
    }, 50);

  }

  simulationInterval = setInterval(simulatePriceChange, 4500);

  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting && simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
      } else if (e.isIntersecting && !simulationInterval && !prefersReduced) {
         simulationInterval = setInterval(simulatePriceChange, 4500);
      }
    });
  }, { threshold: 0.1 }).observe(table);
}

document.addEventListener('DOMContentLoaded', () => {
  const tooltip = document.createElement('div');
  tooltip.id = 'price-tooltip';
  document.body.appendChild(tooltip);

  initHero();
  initStickyBanner();
  initFormHandler();
  initThemeSwitcher();
  initPageTransitions();
  initPriceTooltips();
  initAnimations();
});