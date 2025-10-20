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

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.documentElement.classList.remove('mono', 'ocean', 'forest', 'dusk');
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', document.documentElement.className);
    });
  }

  if (easterEggBtn) {
    easterEggBtn.addEventListener('click', () => {
      const currentTheme = localStorage.getItem('theme') || '';
      const currentIndex = themes.indexOf(currentTheme);
      const nextIndex = (currentIndex + 1) % themes.length;
      const newTheme = themes[nextIndex];
      
      document.documentElement.className = newTheme;
      localStorage.setItem('theme', newTheme);
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

const apartmentData = {
  "A1": { area: 65.20, parking: 15000, pricePerSqMHistory: [{ date: "2025-10-18", price: 8000 }, { date: "2025-10-10", price: 8266 }, { date: "2025-09-25", price: 8130 }] },
  "A2": { area: 45.10, parking: 15000, pricePerSqMHistory: [{ date: "2025-10-15", price: 8200 }] },
  "A3": { area: 84.33, parking: 20000, pricePerSqMHistory: [{ date: "2025-09-30", price: 7800 }] },
  "A4": { area: 55.20, parking: 15000, pricePerSqMHistory: [{ date: "2025-10-17", price: 8150 }, { date: "2025-10-05", price: 8242 }] }
};

function formatPrice(price, isEnglish) {
    return `${price.toLocaleString(isEnglish ? 'en-US' : 'pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${isEnglish ? 'PLN' : 'zł'}`;
}

function updateRowPrices(aptId, isEnglish) {
    const data = apartmentData[aptId];
    if (!data) return;

    const latestPricePerSqM = data.pricePerSqMHistory[0].price;
    const apartmentPrice = latestPricePerSqM * data.area;
    const totalPrice = apartmentPrice + data.parking;

    const row = document.querySelector(`tr[data-apt-id="${aptId}"]`);
    if (!row) return;

    row.querySelector('[data-col="cena-m2"] span').textContent = formatPrice(latestPricePerSqM, isEnglish);
    row.querySelector('[data-col="cena-lokal"] span').textContent = formatPrice(apartmentPrice, isEnglish);
    row.querySelector('[data-col="cena-mp"] span').textContent = formatPrice(data.parking, isEnglish);
    row.querySelector('[data-col="cena-calosc"] span').textContent = formatPrice(totalPrice, isEnglish);
}


function initPriceTooltips() {
  const tooltip = document.getElementById('price-tooltip');
  if (!tooltip) return;

  const isEnglish = document.documentElement.lang === 'en';

  document.querySelectorAll('.price-cell').forEach(cell => {
    cell.addEventListener('mouseenter', (e) => {
      const aptId = e.target.closest('tr').dataset.aptId;
      const data = apartmentData[aptId];
      if (!data || data.pricePerSqMHistory.length === 0) return;

      const fullHistory = data.pricePerSqMHistory.map(h => ({
          date: h.date,
          totalPrice: (h.price * data.area) + data.parking
      }));

      const prices = fullHistory.map(h => h.totalPrice);
      const lowestPrice = Math.min(...prices);

      let historyHtml = fullHistory.map(item => `
        <li>
          <span>${item.date}</span>
          <span class="${item.totalPrice === lowestPrice ? 'lowest-price' : ''}">
            ${formatPrice(item.totalPrice, isEnglish)}
          </span>
        </li>
      `).join('');

      tooltip.innerHTML = `
        <h4>${isEnglish ? 'Price History' : 'Historia Ceny'}</h4>
        <ul>${historyHtml}</ul>
        <div class="lowest-price" style="margin-top: 8px; font-size: 12px;">
          ${isEnglish ? 'Lowest price (30 days):' : 'Najniższa cena (30 dni):'}
          ${formatPrice(lowestPrice, isEnglish)}
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

  Object.keys(apartmentData).forEach(aptId => updateRowPrices(aptId, isEnglish));

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
      } else { break; }
    }
    typeLine(span, logEntry.text, () => {
      // Intentionally left blank
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
    const availableApts = ['A1', 'A2', 'A3', 'A4'];
    const aptId = availableApts[Math.floor(Math.random() * availableApts.length)];
    const data = apartmentData[aptId];
    const row = table.querySelector(`tr[data-apt-id="${aptId}"]`);
    if (!row || !data) return;

    let newPricePerSqM;
    const latestHistory = data.pricePerSqMHistory[0];
    const changePercent = (Math.random() * 0.05) - 0.02;

    if (Math.random() > 0.5) {
      newPricePerSqM = latestHistory.price * (1 + changePercent);
    } else {
      const currentTotalPrice = (latestHistory.price * data.area) + data.parking;
      const newTotalPrice = currentTotalPrice * (1 + changePercent);
      newPricePerSqM = (newTotalPrice - data.parking) / data.area;
    }

    newPricePerSqM = Math.round(newPricePerSqM);
    if (newPricePerSqM === latestHistory.price) {
        return;
    }

    const newDate = new Date().toISOString().split('T')[0];
    data.pricePerSqMHistory.unshift({ date: newDate, price: newPricePerSqM });

    updateRowPrices(aptId, isEnglish);

    const cell = row.querySelector('[data-col="cena-calosc"]');
    const flashClass = newPricePerSqM > latestHistory.price ? 'price-flash-up' : 'price-flash-down';
    cell.classList.remove('price-flash-up', 'price-flash-down');
    void cell.offsetWidth;
    cell.classList.add(flashClass);

    addLog({
      class: 'log-change',
      text: `[${isEnglish ? 'PRICE_UPDATE' : 'ZMIANA_CENY'}] Apt ${aptId}: ${formatPrice(newPricePerSqM, isEnglish)}/m²`
    });

    addLog({
        class: 'log-info',
        text: `[info] ${isEnglish ? 'New price archived. Submitting update...' : 'Nowa cena zarchiwizowana. Wysyłanie aktualizacji...'}`
    });

    setTimeout(() => {
        if(logEl) logEl.scrollTop = logEl.scrollHeight;
    }, (typingSpeed * 60));

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