/* ==========================================================================
   SCRIPT.JS - Main JavaScript file for the InfoDevelopment website.
   Handles animations, form submissions, and interactive UI elements.
   ========================================================================== */

// This event listener ensures that the entire script runs only after the
// HTML document has been fully loaded and parsed by the browser. This prevents
// errors from trying to access elements that do not yet exist.
document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. Hero & Scroll Handling
     Manages the initial full-screen hero section and its scroll-out behavior.
     ========================================================================== */
  
  // Get references to the necessary DOM elements.
  const heroSection = document.querySelector('.hero');
  const scrollTarget = document.getElementById('main-content-start');
  const heroLogo = document.querySelector('.hero-logo');
  let isHeroActive = true; // A flag to prevent the scroll-out from running multiple times.

  // This function orchestrates the smooth transition away from the hero section.
  const exitHero = () => {
    // If the transition has already been triggered, do nothing.
    if (!isHeroActive) return;
    isHeroActive = false;

    // This function runs only after the smooth scroll animation has completely finished.
    const onScrollEnd = () => {
      // Once the page has arrived at its destination, remove the hero section
      // from the document entirely. This prevents the scrollbar from jumping and
      // makes it impossible for the user to scroll back up to a blank space.
      if (heroSection) {
        heroSection.style.display = 'none';
      }
      // Clean up the event listener to prevent it from firing on subsequent scrolls.
      document.removeEventListener('scrollend', onScrollEnd);
    };

    // 1. Set up the 'scrollend' event listener to wait for the animation to finish.
    document.addEventListener('scrollend', onScrollEnd);

    // 2. Add the 'is-hidden' class to begin the hero's CSS fade-out transition.
    if (heroSection) {
      heroSection.classList.add('is-hidden');
    }

    // 3. Start the smooth scroll animation towards the main content area.
    if (scrollTarget) {
      scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Listen for the mouse wheel event to trigger the automatic scroll-out.
  window.addEventListener('wheel', (e) => {
    const scrollThreshold = window.innerHeight * 0.1;
    // Trigger only if the hero is active, the user is scrolling down, and
    // they have scrolled past a small threshold (10% of the screen height).
    if (isHeroActive && e.deltaY > 0 && window.scrollY > scrollThreshold) {
      e.preventDefault(); // Prevents the default, jumpy scroll behavior.
      exitHero();
    }
  }, { passive: false }); // 'passive: false' is required for preventDefault() to work.

  // The arrow click in the hero also triggers the same scroll-out function.
  const scrollArrow = document.querySelector('.scroll-down-arrow');
  if (scrollArrow) {
    scrollArrow.addEventListener('click', (e) => {
      e.preventDefault();
      exitHero();
    });
  }

  // This listener handles purely visual effects that occur during any scroll.
  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;

    // Add/remove the 'scrolled' class to the body, which makes the sticky banner
    // change from transparent to solid.
    if (scrollPosition > 50) {
      document.body.classList.add('scrolled');
    } else {
      document.body.classList.remove('scrolled');
    }

    // Add/remove the 'is-hidden' class to the hero logo as the user scrolls.
    if (heroLogo) {
      if (scrollPosition > 20) {
        heroLogo.classList.add('is-hidden');
      } else {
        heroLogo.classList.remove('is-hidden');
      }
    }
  });


  /* ==========================================================================
     2. Contact Form Handler
     Handles the submission of the contact form without a page reload (AJAX).
     ========================================================================== */
  const form = document.getElementById('contact-form');
  const status = document.getElementById('status');

  if (form && status) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevent the default browser form submission.
      status.textContent = 'Wysyłanie…';
      const data = new FormData(form);

      // Use the Fetch API to send the form data to the Formspree endpoint.
      try {
        const r = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });

        // Handle the response from the server.
        if (r.ok) { // If submission was successful...
          form.reset();
          status.classList.remove('error');
          status.textContent = 'Dziękujemy. Skontaktujemy się wkrótce.';
        } else { // If there was a server-side error...
          status.classList.add('error');
          status.textContent = 'Błąd wysyłki. Spróbuj ponownie później.';
        }
      } catch { // If there was a network error...
        status.classList.add('error');
        status.textContent = 'Błąd sieci. Spróbuj ponownie później.';
      }
    });
  }

  /* ==========================================================================
     3. Theme Toggle Handler
     Manages the light/dark mode theme switcher.
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle');

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      // Simply toggles the 'dark' class on the root <html> element.
      // The CSS variables handle the rest of the theme change.
      document.documentElement.classList.toggle('dark');
    });
  }

  /* ==========================================================================
     4. Animations Handler
     Controls the data table and log animations. Encapsulated in an IIFE.
     ========================================================================== */
  (function() {
    // Get references to animation elements.
    const table = document.getElementById('data-table');
    const logEl = document.getElementById('log');

    // If any required element is missing, stop the script to prevent errors.
    if (!table || !logEl) {
      return;
    }

    // Accessibility: Check if the user prefers reduced motion.
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let scrambleDone = false;
    
    // Helper function to create a delay using Promises.
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    // This function animates a single table cell from '•••' to its final text.
    function scrambleCell(cell, finalText, duration = 900) {
      return new Promise(resolve => {
        if (prefersReduced) {
          cell.textContent = finalText;
          return resolve();
        }

        // Define the character sets used for scrambling.
        const NUMS = '0123456789';
        const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const POWERS = '²³';

        // Returns a random character of the same type as the original.
        const getRandomChar = (originalChar) => {
          if (NUMS.includes(originalChar)) return NUMS[Math.floor(Math.random() * NUMS.length)];
          if (ALPHA.includes(originalChar.toUpperCase())) return ALPHA[Math.floor(Math.random() * ALPHA.length)];
          if (POWERS.includes(originalChar)) return POWERS[Math.floor(Math.random() * POWERS.length)];
          return originalChar; // Keep symbols and spaces fixed.
        };

        const start = performance.now();

        // The main animation loop, powered by requestAnimationFrame for smoothness.
        function tick(now) {
          const linearT = Math.min(1, (now - start) / duration);
          // Apply an easing function for a slow-start, slow-end effect.
          const t = 0.5 * (1 - Math.cos(Math.PI * linearT));
          
          // Determine how many characters to reveal vs. how many to scramble.
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

    // This function orchestrates the animation of the entire table.
    async function scrambleTable() {
      const cells = Array.from(table.querySelectorAll('tbody td'));
      const rows = [];
      const columns = table.querySelector('thead th').length || 5;
      for (let i = 0; i < cells.length; i += columns) rows.push(cells.slice(i, i + columns));
      
      // Animate row by row.
      for (const row of rows) {
        // Animate each cell in the row with a slight stagger for a cascade effect.
        for (const td of row) {
          scrambleCell(td, td.getAttribute('data-final') || td.textContent);
          await delay(75);
        }
        await delay(300); // Wait for the row to finish before starting the next.
      }
      scrambleDone = true;
    }

    // The text content for the log typing animation.
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

    // This function creates the "typing" effect in the log box.
    function typeLog(lines, speed = 18) {
      return new Promise(resolve => {
        if (prefersReduced) {
          logEl.textContent = lines.join('\n');
          return resolve();
        }
        let i = 0, j = 0;
        function step() {
          if (i >= lines.length) {
            logEl.textContent = lines.join('\n'); // Remove cursor at the end.
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
            setTimeout(step, 160); // Pause between lines.
          }
        }
        step();
      });
    }

    // If the user prefers reduced motion, skip all animations and show the final state.
    if (prefersReduced) {
      const tds = table.querySelectorAll('tbody td');
      tds.forEach(td => td.textContent = td.getAttribute('data-final') || td.textContent);
      logEl.textContent = logLines.join('\n');
      return;
    }
    
    // This observer triggers the animations once the table section scrolls into view.
    new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          obs.disconnect(); // Run only once.
          // Wait for 1 second after the section is visible before starting.
          setTimeout(() => {
            scrambleTable();
            typeLog(logLines); // Start both animations simultaneously.
          }, 1000);
        }
      });
    }, { threshold: 0.5 }).observe(table); // Trigger when 50% of the table is visible.

  })();

});