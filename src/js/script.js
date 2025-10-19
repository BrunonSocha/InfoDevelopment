const delay = (ms) => new Promise((res) => setTimeout(res, ms));

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

    window.addEventListener(
        'wheel',
        (e) => {
            const scrollThreshold = window.innerHeight * 0.1;
            if (
                isHeroActive &&
                e.deltaY > 0 &&
                window.scrollY > scrollThreshold
            ) {
                e.preventDefault();
                exitHero();
            }
        },
        { passive: false }
    );

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
        success: isEnglish
            ? 'Thank you. We will be in touch shortly.'
            : 'Dziękujemy. Skontaktujemy się wkrótce.',
        error: isEnglish
            ? 'Submission error. Please try again later.'
            : 'Błąd wysyłki. Spróbuj ponownie później.',
        networkError: isEnglish
            ? 'Network error. Please try again later.'
            : 'Błąd sieci. Spróbuj ponownie później.',
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        status.textContent = messages.sending;
        const data = new FormData(form);

        try {
            const r = await fetch(form.action, {
                method: 'POST',
                body: data,
                headers: { Accept: 'application/json' },
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
            document.documentElement.classList.remove(
                'mono',
                'ocean',
                'forest',
                'dusk'
            );
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
    document
        .querySelectorAll('.lang-switcher a, .footer-links a, a.button-like')
        .forEach((link) => {
            link.addEventListener('click', (e) => {
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
    A1: {
        area: 65.2,
        parking: 15000,
        pricePerSqMHistory: [
            { date: '2025-10-18', price: 8000 },
            { date: '2025-10-10', price: 8266 },
            { date: '2025-09-25', price: 8130 },
        ],
    },
    A2: {
        area: 45.1,
        parking: 15000,
        pricePerSqMHistory: [{ date: '2025-10-15', price: 8200 }],
    },
    A3: {
        area: 84.33,
        parking: 20000,
        pricePerSqMHistory: [{ date: '2025-09-30', price: 7800 }],
    },
    A4: {
        area: 55.2,
        parking: 15000,
        pricePerSqMHistory: [
            { date: '2025-10-17', price: 8150 },
            { date: '2025-10-05', price: 8242 },
        ],
    },
};

function formatPrice(price, isEnglish) {
    return `${price.toLocaleString(isEnglish ? 'en-US' : 'pl-PL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} ${isEnglish ? 'PLN' : 'zł'}`;
}

function updateRowPrices(aptId, isEnglish) {
    const data = apartmentData[aptId];
    if (!data) return;

    const latestPricePerSqM = data.pricePerSqMHistory[0].price;
    const apartmentPrice = latestPricePerSqM * data.area;
    const totalPrice = apartmentPrice + data.parking;

    const row = document.querySelector(`tr[data-apt-id="${aptId}"]`);
    if (!row) return;

    row.querySelector('[data-col="cena-m2"] span').textContent = formatPrice(
        latestPricePerSqM,
        isEnglish
    );
    row.querySelector('[data-col="cena-lokal"] span').textContent = formatPrice(
        apartmentPrice,
        isEnglish
    );
    row.querySelector('[data-col="cena-mp"] span').textContent = formatPrice(
        data.parking,
        isEnglish
    );
    row.querySelector('[data-col="cena-calosc"] span').textContent =
        formatPrice(totalPrice, isEnglish);
}

function initPriceTooltips() {
    const tooltip = document.getElementById('price-tooltip');
    if (!tooltip) return;

    const isEnglish = document.documentElement.lang === 'en';

    function getPriceHistory(aptId, colId) {
        const data = apartmentData[aptId];
        if (!data) return [];

        switch (colId) {
            case 'cena-m2':
                return data.pricePerSqMHistory;
            case 'cena-lokal':
                return data.pricePerSqMHistory.map((h) => ({
                    date: h.date,
                    price: h.price * data.area,
                }));
            case 'cena-mp':
                return [{ date: 'current', price: data.parking }];
            case 'cena-calosc':
                return data.pricePerSqMHistory.map((h) => ({
                    date: h.date,
                    price: h.price * data.area + data.parking,
                }));
            default:
                return [];
        }
    }

    function getTooltipTitle(colId) {
        switch (colId) {
            case 'cena-m2':
                return isEnglish
                    ? 'Price per m² history'
                    : 'Historia ceny za m²';
            case 'cena-lokal':
                return isEnglish
                    ? 'Apartment price history'
                    : 'Historia ceny za lokal';
            case 'cena-mp':
                return isEnglish
                    ? 'Parking space price'
                    : 'Cena miejsca postojowego';
            case 'cena-calosc':
                return isEnglish
                    ? 'Total price history'
                    : 'Historia ceny za całość';
            default:
                return isEnglish ? 'Price history' : 'Historia ceny';
        }
    }

    document.querySelectorAll('.price-cell').forEach((cell) => {
        cell.addEventListener('mouseenter', (e) => {
            const aptId = e.target.closest('tr').dataset.aptId;
            const colId = e.target.dataset.col;
            const history = getPriceHistory(aptId, colId);

            if (!history || history.length === 0) return;

            const title = getTooltipTitle(colId);
            const prices = history.map((h) => h.price);
            const lowestPrice = Math.min(...prices);

            let historyHtml = history
                .map(
                    (item) => `
        <li>
          <span>${
              item.date === 'current'
                  ? isEnglish
                      ? 'Current'
                      : 'Aktualna'
                  : item.date
          }</span>
          <span class="${
              history.length > 1 && item.price === lowestPrice
                  ? 'lowest-price'
                  : ''
          }">
            ${formatPrice(item.price, isEnglish)}
          </span>
        </li>
      `
                )
                .join('');

            let lowestPriceHtml = '';
            if (history.length > 1) {
                lowestPriceHtml = `
          <div class="lowest-price" style="margin-top: 8px; font-size: 12px;">
            ${
                isEnglish
                    ? 'Lowest price (30 days):'
                    : 'Najniższa cena (30 dni):'
            }
            ${formatPrice(lowestPrice, isEnglish)}
          </div>`;
            } else if (colId === 'cena-mp') {
                lowestPriceHtml = `<div style="margin-top: 8px; font-size: 12px;">${
                    isEnglish ? 'Current Price' : 'Aktualna Cena'
                }</div>`;
            }

            tooltip.innerHTML = `
        <h4>${title}</h4>
        <ul>${historyHtml}</ul>
        ${lowestPriceHtml}
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
    const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;
    let logLinesCount = 0;
    const maxLogLines = 10;
    let simulationInterval;
    let isTyping = false;
    let isSimulationRunning = false;
    const typingSpeed = 15;

    Object.keys(apartmentData).forEach((aptId) =>
        updateRowPrices(aptId, isEnglish)
    );

    const initialLogs = isEnglish
        ? [
              {
                  class: 'log-info',
                  text: '[info] InfoDevelopment pipeline initializing...',
              },
              {
                  class: 'log-ok',
                  text: '[ok] Connected to dane.gov.pl endpoint.',
              },
              {
                  class: 'log-info',
                  text: '[info] Watching 4 apartments for price changes...',
              },
          ]
        : [
              {
                  class: 'log-info',
                  text: '[info] Inicjalizacja potoku InfoDevelopment...',
              },
              {
                  class: 'log-ok',
                  text: '[ok] Połączono z punktem końcowym dane.gov.pl.',
              },
              {
                  class: 'log-info',
                  text: '[info] Obserwowanie 4 mieszkań pod kątem zmian cen...',
              },
          ];

    function typeLine(spanElement, fullText) {
        return new Promise((resolve) => {
            if (prefersReduced || !fullText) {
                spanElement.textContent = fullText;
                resolve();
                return;
            }
            let i = 0;
            isTyping = true;
            function step() {
                if (i < fullText.length) {
                    spanElement.textContent =
                        fullText.substring(0, i + 1) + '▌';
                    i++;
                    setTimeout(step, typingSpeed);
                } else {
                    spanElement.textContent = fullText;
                    isTyping = false;
                    resolve();
                }
            }
            step();
        });
    }

    async function addLog(logEntry) {
        if (!logEl) return;

        while (isTyping) {
            await delay(typingSpeed * 2);
        }

        const span = document.createElement('span');
        span.className = logEntry.class;

        while (logLinesCount >= maxLogLines) {
            if (logEl.firstChild) {
                logEl.removeChild(logEl.firstChild);
                logLinesCount--;
            } else {
                break;
            }
        }

        logEl.appendChild(span);
        logLinesCount++;
        logEl.scrollTop = logEl.scrollHeight; // Scroll BEFORE typing

        await typeLine(span, logEntry.text); // Wait for typing to finish
    }

    async function runInitialLogs() {
        isSimulationRunning = true; // Prevent simulation during initial logs
        for (const log of initialLogs) {
            await addLog(log);
        }
        isSimulationRunning = false; // Allow simulation after initial logs
    }

    runInitialLogs();

    if (prefersReduced) {
        addLog({
            class: 'log-info',
            text: isEnglish
                ? '[info] Animations disabled (prefers-reduced-motion).'
                : '[info] Animacje wyłączone (prefers-reduced-motion).',
        });
        return;
    }

    async function simulatePriceChange() {
        if (isSimulationRunning || isTyping) return; // Wait if previous logs still typing
        isSimulationRunning = true;

        const availableApts = ['A1', 'A2', 'A3', 'A4'];
        const aptId =
            availableApts[Math.floor(Math.random() * availableApts.length)];
        const data = apartmentData[aptId];
        const row = table.querySelector(`tr[data-apt-id="${aptId}"]`);
        if (!row || !data) {
            isSimulationRunning = false;
            return;
        }

        let newPricePerSqM;
        const latestHistory = data.pricePerSqMHistory[0];
        const changePercent = Math.random() * 0.05 - 0.02;

        if (Math.random() > 0.5) {
            newPricePerSqM = latestHistory.price * (1 + changePercent);
        } else {
            const currentTotalPrice =
                latestHistory.price * data.area + data.parking;
            const newTotalPrice = currentTotalPrice * (1 + changePercent);
            newPricePerSqM = (newTotalPrice - data.parking) / data.area;
        }

        newPricePerSqM = Math.round(newPricePerSqM / 200) * 200;

        if (newPricePerSqM === latestHistory.price || newPricePerSqM <= 0) {
            isSimulationRunning = false;
            return;
        }

        const newDate = new Date().toISOString().split('T')[0];
        data.pricePerSqMHistory.unshift({
            date: newDate,
            price: newPricePerSqM,
        });

        updateRowPrices(aptId, isEnglish);

        const cell = row.querySelector('[data-col="cena-calosc"]');
        const flashClass =
            newPricePerSqM > latestHistory.price
                ? 'price-flash-up'
                : 'price-flash-down';
        cell.classList.remove('price-flash-up', 'price-flash-down');
        void cell.offsetWidth;
        cell.classList.add(flashClass);

        await addLog({
            class: 'log-change',
            text: `[${
                isEnglish ? 'PRICE_UPDATE' : 'ZMIANA_CENY'
            }] Apt ${aptId}: ${formatPrice(newPricePerSqM, isEnglish)}/m²`,
        });

        await addLog({
            class: 'log-info',
            text: `[info] ${
                isEnglish
                    ? 'New price archived. Submitting update...'
                    : 'Nowa cena zarchiwizowana. Wysyłanie aktualizacji...'
            }`,
        });

        await addLog({
            class: 'log-ok',
            text: `[send] ${
                isEnglish
                    ? 'Sending report to dane.gov.pl...'
                    : 'Wysyłanie raportu do dane.gov.pl...'
            }`,
        });

        isSimulationRunning = false;
    }

    const simulationIntervalTime = 3500; // Set to 3.5 seconds

    simulationInterval = setInterval(
        simulatePriceChange,
        simulationIntervalTime
    );

    new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((e) => {
                if (!e.isIntersecting && simulationInterval) {
                    clearInterval(simulationInterval);
                    simulationInterval = null;
                } else if (
                    e.isIntersecting &&
                    !simulationInterval &&
                    !prefersReduced
                ) {
                    simulationInterval = setInterval(
                        simulatePriceChange,
                        simulationIntervalTime
                    );
                }
            });
        },
        { threshold: 0.1 }
    ).observe(table);
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
