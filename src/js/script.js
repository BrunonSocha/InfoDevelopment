document.addEventListener('DOMContentLoaded', () => {

  const heroSection = document.querySelector('.hero');
  const scrollTarget = document.getElementById('main-content-start');
  const heroLogo = document.querySelector('.hero-logo');
  let isHeroActive = true;

  const exitHero = () => {
    if (!isHeroActive) return;
    isHeroActive = false;

    const onScrollEnd = () => {
      if (heroSection) {
        heroSection.style.display = 'none';
      }
      document.removeEventListener('scrollend', onScrollEnd);
    };

    document.addEventListener('scrollend', onScrollEnd);

    if (heroSection) {
      heroSection.classList.add('is-hidden');
    }

    if (scrollTarget) {
      scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
    const scrollPosition = window.scrollY;

    if (scrollPosition > 50) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }

    if (heroLogo) {
      if (scrollPosition > 20) {
        heroLogo.classList.add('is-hidden');
      } else {
        heroLogo.classList.remove('is-hidden');
      }
    }
  });


  const form = document.getElementById('contact-form');
  const status = document.getElementById('status');

  if (form && status) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = 'Wysyłanie…';
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
          status.textContent = 'Dziękujemy. Skontaktujemy się wkrótce.';
        } else {
          status.classList.add('error');
          status.textContent = 'Błąd wysyłki. Spróbuj ponownie później.';
        }
      } catch {
        status.classList.add('error');
        status.textContent = 'Błąd sieci. Spróbuj ponownie później.';
      }
    });
  }

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

  (function() {
    const table = document.getElementById('data-table');
    const logEl = document.getElementById('log');

    if (!table || !logEl) {
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let scrambleDone = false;
    
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

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
      scrambleDone = true;
    }

    const logLines = [
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

  })();

  document.querySelectorAll('.faq-container details').forEach((detail) => {
    const summary = detail.querySelector('summary');
    const content = detail.querySelector('.faq-content');

    summary.addEventListener('click', (event) => {
      event.preventDefault();
      if (detail.open) {
        const height = content.scrollHeight;
        requestAnimationFrame(() => {
          content.style.maxHeight = `${height}px`;
          requestAnimationFrame(() => {
            content.style.maxHeight = '0px';
          });
        });
        setTimeout(() => detail.removeAttribute('open'), 300);
      } else {
        detail.setAttribute('open', '');
        const height = content.scrollHeight;
        content.style.maxHeight = `${height}px`;
        
        content.addEventListener('transitionend', () => {
          if (detail.open) {
            content.style.maxHeight = 'none';
          }
        }, { once: true });
      }
    });
  });

});