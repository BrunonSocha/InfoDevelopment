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

function initAnimations() {
  const table = document.getElementById('data-table');
  const logEl = document.getElementById('log');
  if (!table || !logEl) return;

  const isEnglish = document.documentElement.lang === 'en';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function scrambleCell(cell, finalText, duration = 900) {
    return new Promise(resolve => {
      if (prefersReduced) {
        cell.textContent = finalText;
        return resolve();
      }

      const NUMS = '0123456789';
      const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const POWERS = '²³⁴⁵⁶⁷⁸⁹';

      const getRandomChar = (originalChar) => {
        if (NUMS.includes(originalChar)) return NUMS[Math.floor(Math.random() * NUMS.length)];
        if (ALPHA.includes(originalChar.toUpperCase())) return ALPHA[Math.floor(Math.random() * ALPHA.length)];
        if (POWERS.includes(originalChar)) return POWERS[Math.floor(Math.random() * POWERS.length)];
        return originalChar;
      };

      const start = performance.now();

      function tick(now) {
        const linearT = Math.min(1, (now - start) / duration);
        const t = 0.5 * (1 - Math.cos(Math.PI * linearT));
        
        const keep = Math.floor(finalText.length * t);
        const tail = Array.from(finalText.slice(keep))
                           .map(char => getRandomChar(char))
                           .join('');
        
        cell.textContent = finalText.slice(0, keep) + tail;
        
        if (linearT < 1) {
          requestAnimationFrame(tick);
        } else {
          cell.textContent = finalText;
          resolve();
        }
      }
      requestAnimationFrame(tick);
    });
  }

  async function scrambleTable() {
    const cells = Array.from(table.querySelectorAll('tbody td'));
    const rows = [];
    const columns = table.querySelector('thead th').length || 5;
    for (let i = 0; i < cells.length; i += columns) rows.push(cells.slice(i, i + columns));
    
    for (const row of rows) {
      for (const td of row) {
        scrambleCell(td, td.getAttribute('data-final') || td.textContent);
        await delay(75);
      }
      await delay(300); 
    }
  }

  const logLines = isEnglish ? [
    '[info] initializing InfoDevelopment pipeline...',
    '[ok]  connected to dane.gov.pl endpoint',
    '[info] validating dataset: 3 rows, 5 fields',
    '[ok]  schema: valid (v1.2)',
    '[info] transforming prices → PLN/m²',
    '[ok]  payload ready (842 bytes)',
    '[info] price archive ready for export...',
    '[send] POST /api/report 200 OK',
    '[done] task completed'
  ] : [
    '[info] inicjalizacja potoku InfoDevelopment...',
    '[ok]  połączono z punktem końcowym dane.gov.pl',
    '[info] walidacja zbioru danych: 3 wiersze, 5 pól',
    '[ok]  schemat: poprawny (v1.2)',
    '[info] transformacja cen → PLN/m²',
    '[ok]  ładunek gotowy (842 bajty)',
    '[info] archiwum cen gotowe do eksportu...',
    '[send] POST /api/report 200 OK',
    '[done] zadanie zakończone'
  ];

  function typeLog(lines, speed = 18) {
    return new Promise(resolve => {
      if (prefersReduced) {
        logEl.textContent = lines.join('\n');
        return resolve();
      }
      let i = 0, j = 0;
      function step() {
        if (i >= lines.length) {
          logEl.textContent = lines.join('\n');
          return resolve();
        }
        const line = lines[i];
        if (j <= line.length) {
          const current = line.slice(0, j);
          logEl.textContent = lines.slice(0, i).join('\n') + (i ? '\n' : '') + current + '▌';
          j++;
          setTimeout(step, speed);
        } else {
          logEl.textContent = lines.slice(0, i + 1).join('\n');
          i++;
          j = 0;
          setTimeout(step, 160);
        }
      }
      step();
    });
  }

  if (prefersReduced) {
    const tds = table.querySelectorAll('tbody td');
    tds.forEach(td => td.textContent = td.getAttribute('data-final') || td.textContent);
    logEl.textContent = logLines.join('\n');
    return;
  }
  
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        obs.disconnect();
        setTimeout(() => {
          scrambleTable();
          typeLog(logLines);
        }, 1000);
      }
    });
  }, { threshold: 0.75 }).observe(table);
}

document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initStickyBanner();
  initFormHandler();
  initThemeSwitcher();
  initPageTransitions();
  initAnimations();
});