/**
 * SECURDATA.PRO – Cookie Consent
 * Vanilla JS, zero dependencies
 * Dispatches CustomEvent 'sd:consent-updated' on every save
 */
(function () {
  'use strict';

  /* ── Constants ── */
  var STORAGE_KEY = 'sd_cookie_consent';
  var EXPIRY_DAYS = 365;

  var CATEGORIES = [
    {
      id: 'necessary',
      label: 'Necessari',
      desc: 'Funzioni essenziali del sito: sicurezza, gestione sessione, preferenze di base. Non possono essere disattivati.',
      required: true,
    },
    {
      id: 'preferences',
      label: 'Preferenze / Funzionali',
      desc: 'Memorizzano le tue preferenze (lingua, layout, ecc.) per migliorare l\'esperienza di navigazione.',
      required: false,
    },
    {
      id: 'analytics',
      label: 'Analitici',
      desc: 'Raccolgono dati anonimi su come utilizzi il sito per aiutarci a migliorare contenuti e prestazioni.',
      required: false,
    },
    {
      id: 'marketing',
      label: 'Marketing',
      desc: 'Utilizzati per mostrare annunci pertinenti e misurare l\'efficacia delle campagne pubblicitarie.',
      required: false,
    },
  ];

  /* ── Helpers ── */
  function readPrefs() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !data.savedAt) return null;
      var age = (Date.now() - data.savedAt) / (1000 * 60 * 60 * 24);
      if (age > EXPIRY_DAYS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return data.consent;
    } catch (_) {
      return null;
    }
  }

  function savePrefs(consent) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), consent: consent }));
    } catch (_) {}
  }

  function buildConsentAll(value) {
    var obj = {};
    CATEGORIES.forEach(function (c) { obj[c.id] = c.required ? true : value; });
    return obj;
  }

  function dispatchEvent(consent) {
    try {
      var ev = new CustomEvent('sd:consent-updated', {
        bubbles: true,
        detail: { consent: consent, timestamp: new Date().toISOString() },
      });
      document.dispatchEvent(ev);
    } catch (_) {}
  }

  /* ── Focus trap ── */
  function getFocusable(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
  }

  function trapFocus(container, e) {
    var focusable = getFocusable(container);
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  }

  /* ── Build UI ── */
  function buildBanner() {
    var el = document.createElement('div');
    el.id = 'sd-cc-banner';
    el.className = 'sd-cc-banner';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Consenso cookie');
    el.innerHTML = [
      '<div class="sd-cc-banner-inner">',
      '  <p class="sd-cc-banner-text">',
      '    Utilizziamo cookie e tecnologie simili per migliorare la tua esperienza, analizzare il traffico e',
      '    mostrare contenuti pertinenti. Leggi la nostra <a href="./privacy-policy.html">Privacy Policy</a>.',
      '  </p>',
      '  <div class="sd-cc-banner-actions">',
      '    <button class="sd-cc-btn sd-cc-btn-accept" id="sd-cc-accept-all" aria-label="Accetta tutti i cookie">Accetta tutti</button>',
      '    <button class="sd-cc-btn sd-cc-btn-manage" id="sd-cc-manage"     aria-label="Gestisci preferenze cookie">Gestisci impostazioni</button>',
      '    <button class="sd-cc-btn sd-cc-btn-reject" id="sd-cc-reject"     aria-label="Accetta solo i cookie tecnici necessari">Solo tecnici</button>',
      '  </div>',
      '</div>',
    ].join('');
    return el;
  }

  function buildModal(consent) {
    var overlay = document.createElement('div');
    overlay.id = 'sd-cc-modal-overlay';
    overlay.className = 'sd-cc-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'sd-cc-modal-title');
    overlay.setAttribute('tabindex', '-1');

    var rows = CATEGORIES.map(function (cat) {
      var checked = consent ? !!consent[cat.id] : !cat.required ? false : true;
      return [
        '<div class="sd-cc-category">',
        '  <div class="sd-cc-category-info">',
        '    <div class="sd-cc-category-name">' + cat.label + (cat.required ? ' <span style="font-size:0.7rem;color:#64748b;font-weight:400;">(sempre attivo)</span>' : '') + '</div>',
        '    <div class="sd-cc-category-desc">' + cat.desc + '</div>',
        '  </div>',
        '  <div class="sd-cc-toggle-wrap">',
        '    <label class="sd-cc-toggle" aria-label="' + cat.label + '">',
        '      <input type="checkbox" data-cat="' + cat.id + '"' + (checked ? ' checked' : '') + (cat.required ? ' disabled' : '') + '>',
        '      <span class="sd-cc-toggle-slider"></span>',
        '    </label>',
        '  </div>',
        '</div>',
      ].join('');
    }).join('');

    overlay.innerHTML = [
      '<div class="sd-cc-modal" role="document" tabindex="-1" id="sd-cc-modal">',
      '  <div class="sd-cc-modal-header">',
      '    <h2 class="sd-cc-modal-title" id="sd-cc-modal-title">Preferenze Cookie</h2>',
      '    <button class="sd-cc-modal-close" id="sd-cc-modal-close" aria-label="Chiudi preferenze cookie">',
      '      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">',
      '        <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      '      </svg>',
      '    </button>',
      '  </div>',
      '  <div class="sd-cc-modal-body">',
      '    <p class="sd-cc-modal-desc">',
      '      Personalizza il tuo consenso per categoria. I cookie necessari non possono essere disattivati in quanto',
      '      indispensabili al funzionamento del sito.',
      '    </p>',
      rows,
      '  </div>',
      '  <div class="sd-cc-modal-footer">',
      '    <button class="sd-cc-btn sd-cc-btn-reject"  id="sd-cc-modal-reject"     aria-label="Salva solo cookie tecnici">Solo tecnici</button>',
      '    <button class="sd-cc-btn sd-cc-btn-manage"  id="sd-cc-modal-save"       aria-label="Salva le preferenze selezionate">Salva preferenze</button>',
      '    <button class="sd-cc-btn sd-cc-btn-accept"  id="sd-cc-modal-accept-all" aria-label="Accetta tutti i cookie">Accetta tutti</button>',
      '  </div>',
      '</div>',
    ].join('');

    return overlay;
  }

  function buildReopenBtn() {
    var btn = document.createElement('button');
    btn.id = 'sd-cc-reopen-injected';
    btn.className = 'sd-cc-reopen-btn sd-cc-hidden';
    btn.setAttribute('aria-label', 'Apri impostazioni cookie');
    btn.textContent = '🍪 Impostazioni cookie';
    return btn;
  }

  /* ── Controller ── */
  function init() {
    var banner = buildBanner();
    var savedConsent = readPrefs();
    var modal = buildModal(savedConsent);
    var reopenBtn = buildReopenBtn();

    document.body.appendChild(banner);
    document.body.appendChild(modal);

    /* Wire reopen: prefer existing #sd-cookie-reopen, otherwise inject btn */
    var existingReopen = document.getElementById('sd-cookie-reopen');
    if (!existingReopen) {
      document.body.appendChild(reopenBtn);
    }

    /* Show/hide banner */
    if (savedConsent) {
      hideBanner();
      showReopenBtn();
    }

    /* ── Banner buttons ── */
    document.getElementById('sd-cc-accept-all').addEventListener('click', function () {
      accept(buildConsentAll(true));
    });

    document.getElementById('sd-cc-reject').addEventListener('click', function () {
      accept(buildConsentAll(false));
    });

    document.getElementById('sd-cc-manage').addEventListener('click', function () {
      openModal();
    });

    /* ── Modal buttons ── */
    document.getElementById('sd-cc-modal-close').addEventListener('click', closeModal);

    document.getElementById('sd-cc-modal-accept-all').addEventListener('click', function () {
      accept(buildConsentAll(true));
    });

    document.getElementById('sd-cc-modal-reject').addEventListener('click', function () {
      accept(buildConsentAll(false));
    });

    document.getElementById('sd-cc-modal-save').addEventListener('click', function () {
      var consent = {};
      CATEGORIES.forEach(function (cat) {
        if (cat.required) {
          consent[cat.id] = true;
        } else {
          var input = modal.querySelector('input[data-cat="' + cat.id + '"]');
          consent[cat.id] = input ? input.checked : false;
        }
      });
      accept(consent);
    });

    /* ── Click outside modal ── */
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });

    /* ── ESC key ── */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeModal(); }
      if (!modal.classList.contains('sd-cc-hidden')) { trapFocus(modal, e); }
    });

    /* ── Reopen from footer or injected button ── */
    function wireReopen(el) {
      if (!el) return;
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    }
    wireReopen(existingReopen);
    wireReopen(reopenBtn);

    /* ── Internal helpers ── */
    function accept(consent) {
      savePrefs(consent);
      dispatchEvent(consent);
      hideBanner();
      closeModal();
      showReopenBtn();
    }

    function hideBanner() {
      banner.classList.add('sd-cc-hidden');
    }

    function showReopenBtn() {
      if (existingReopen) return;
      reopenBtn.classList.remove('sd-cc-hidden');
    }

    var previousFocus = null;

    function openModal() {
      previousFocus = document.activeElement;
      /* Rebuild toggles with current saved consent */
      var current = readPrefs();
      CATEGORIES.forEach(function (cat) {
        var input = modal.querySelector('input[data-cat="' + cat.id + '"]');
        if (input && !cat.required) {
          input.checked = current ? !!current[cat.id] : false;
        }
      });
      modal.classList.remove('sd-cc-hidden');
      var focusable = getFocusable(modal);
      if (focusable.length) focusable[0].focus();
    }

    function closeModal() {
      modal.classList.add('sd-cc-hidden');
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    }
  }

  /* ── Bootstrap ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
