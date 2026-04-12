/**
 * SecurData.Pro – Lead Popup con salvataggio su GitHub
 *
 * CONFIGURAZIONE (da fare una volta sola):
 *  1. Crea un Fine-Grained PAT su https://github.com/settings/tokens
 *     · Repository access: solo "securdata.pro"
 *     · Permissions: Contents → Read and Write
 *  2. Incolla il token qui sotto al posto di '__INSERISCI_TOKEN_QUI__'
 *
 * SICUREZZA:
 *  · Il token è visibile nel sorgente – è accettabile perché può SOLO
 *    appendere righe a data/leads.csv in questo repository.
 *  · Le altre repo sono matematicamente inaccessibili.
 *  · In caso di abuso: revoca il token su github.com/settings/tokens
 *    e generane uno nuovo (30 secondi).
 *
 * UTILIZZO:
 *  · Il popup NON appare automaticamente al caricamento della pagina.
 *  · Si apre chiamando window.sdpOpenLeadPopup() oppure tramite il
 *    pulsante CTA presente nel biglietto digitale.
 *  · Se l'URL contiene il parametro ?via=xxx (link referral), il popup
 *    si apre automaticamente per accogliere il visitatore invitato.
 */
(function () {
  /* ─── CONFIGURAZIONE ─────────────────────────────────────────── */
  var GITHUB_TOKEN  = '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';
  var GITHUB_OWNER  = 'Profitpickers';
  var GITHUB_REPO   = 'securdata.pro';
  var GITHUB_FILE   = 'data/leads.csv';

  /* ─── COSTANTI INTERNE ───────────────────────────────────────── */
  var STORAGE_KEY      = 'sdp_leads';
  var LAST_SUBMIT_KEY  = 'sdp_last_submit';
  var RATE_LIMIT_MS    = 30000;  // 30 secondi tra un invio e l'altro

  /* ─── REFERRAL: legge ?via= dall'URL ────────────────────────── */
  var _rawVia = new URLSearchParams(window.location.search).get('via') || '';
  var refVia  = _rawVia.replace(/[^a-zA-Z0-9._-]/g, '').substring(0, 50);

  /* ─── CARD MODE: quando l'utente ha appena completato la registrazione ── */
  // ?card=1 indica che l'utente sta visualizzando il proprio biglietto digitale
  // e NON deve riaprire il popup (altrimenti si creerebbe un loop infinito).
  var isCardMode = new URLSearchParams(window.location.search).get('card') === '1';

  /* ─── FUNZIONE PUBBLICA PER APRIRE IL POPUP ──────────────────── */
  // Esposta globalmente per essere chiamata dal pulsante CTA
  window.sdpOpenLeadPopup = function () {
    if (document.getElementById('sdp-lead-overlay')) return; // già aperto
    _buildAndShowPopup();
  };

  /* ─── AUTO-APRI SE VISITA DA REFERRAL ────────────────────────── */
  // Se l'URL contiene ?via=xxx l'utente è arrivato da un invito: mostra
  // subito il popup così comprende cosa può ottenere.
  // NON aprire il popup in card mode (l'utente ha appena registrato).
  if (refVia && !isCardMode) {
    document.addEventListener('DOMContentLoaded', function () {
      window.sdpOpenLeadPopup();
    });
  }

  /* ─── FUNZIONE INTERNA: costruisce e mostra il popup ─────────── */
  function _buildAndShowPopup() {
    if (document.getElementById('sdp-lead-overlay')) return;

  /* ─── STILI ──────────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = [
    '#sdp-lead-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:99999;',
    'display:flex;align-items:center;justify-content:center;',
    'font-family:"Segoe UI",system-ui,sans-serif;backdrop-filter:blur(4px);}',
    '#sdp-lead-box{background:linear-gradient(135deg,#0d1530,#0a1628);',
    'border:1px solid rgba(99,179,237,0.3);border-radius:20px;',
    'padding:2.5rem 2rem;width:460px;max-width:95vw;max-height:90vh;',
    'overflow-y:auto;position:relative;}',
    '#sdp-lead-close{position:absolute;top:1rem;right:1.2rem;background:none;',
    'border:none;color:#718096;font-size:1.4rem;cursor:pointer;line-height:1;}',
    '#sdp-lead-logo{width:52px;height:52px;border-radius:10px;object-fit:contain;margin-bottom:0.8rem;}',
    '#sdp-lead-box h2{font-size:1.25rem;font-weight:700;color:#e8f4ff;margin-bottom:0.4rem;}',
    '#sdp-lead-box .sdp-sub{font-size:0.85rem;color:#718096;margin-bottom:1.5rem;line-height:1.5;}',
    '#sdp-lead-box label{display:block;font-size:0.77rem;color:#718096;margin-bottom:5px;margin-top:0.9rem;}',
    '#sdp-lead-box input:not(.sdp-hp){width:100%;',
    'background:rgba(255,255,255,0.05);border:1px solid rgba(99,179,237,0.25);',
    'border-radius:8px;padding:0.65rem 0.9rem;color:#e2e8f0;font-size:0.875rem;',
    'outline:none;transition:border 0.2s;box-sizing:border-box;}',
    '#sdp-lead-box input:not(.sdp-hp):focus{border-color:#63b3ed;}',
    '.sdp-hp{display:none !important;}',
    '#sdp-lead-btn{width:100%;margin-top:1.5rem;',
    'background:linear-gradient(135deg,#1a56db,#1e40af);color:#fff;border:none;',
    'padding:0.85rem;border-radius:10px;font-size:1rem;font-weight:700;',
    'cursor:pointer;letter-spacing:0.02em;}',
    '#sdp-lead-btn:hover{opacity:0.9;}',
    '#sdp-lead-btn:disabled{opacity:0.5;cursor:not-allowed;}',
    '#sdp-lead-success{display:none;text-align:center;padding:1.5rem 0;}',
    '#sdp-lead-success .sdp-check{font-size:3rem;margin-bottom:0.8rem;}',
    '#sdp-lead-success p{color:#68d391;font-size:1rem;font-weight:600;}',
    '#sdp-lead-success span{color:#718096;font-size:0.85rem;}',
    '.sdp-required{color:#fc8181;}',
    '#sdp-lead-privacy{font-size:0.72rem;color:#4a5568;margin-top:1rem;text-align:center;}',
    '#sdp-lead-privacy a{color:#63b3ed;}',
    '#sdp-lead-error{display:none;margin-top:0.8rem;padding:0.6rem 0.9rem;',
    'background:rgba(252,129,129,0.1);border:1px solid rgba(252,129,129,0.3);',
    'border-radius:8px;color:#fc8181;font-size:0.82rem;}'
  ].join('');
  document.head.appendChild(style);

  /* ─── HTML ───────────────────────────────────────────────────── */
  var logoSrc = 'https://profitpickers.github.io/securdata.pro/logo-00-securdata-pro.svg';
  var html = [
    '<div id="sdp-lead-overlay">',
    '<div id="sdp-lead-box">',
    '<button id="sdp-lead-close" title="Chiudi">\u2715</button>',
    '<img id="sdp-lead-logo" src="' + logoSrc + '" alt="SecurData.Pro">',
    '<h2>Accedi alle Risorse Gratuite</h2>',
    '<div class="sdp-sub">Inserisci i tuoi dati per ricevere guide esclusive su sicurezza dati e AI aziendale.</div>',
    '<div id="sdp-lead-form">',
    '  <label>Nome e Cognome <span class="sdp-required">*</span></label>',
    '  <input type="text" id="sdp-l-nome" placeholder="Es. Mario Rossi" maxlength="100" autocomplete="name">',
    '  <label>Email <span class="sdp-required">*</span></label>',
    '  <input type="email" id="sdp-l-email" placeholder="mario@tuaazienda.it" maxlength="150" autocomplete="email">',
    '  <label>Telefono / WhatsApp</label>',
    '  <input type="tel" id="sdp-l-tel" placeholder="+39 320 000 0000" maxlength="30" autocomplete="tel">',
    '  <label>Nome Attivit\u00e0</label>',
    '  <input type="text" id="sdp-l-attivita" placeholder="Es. Studio Rossi &amp; Associati" maxlength="150">',
    '  <label>Settore / Attivit\u00e0 svolta</label>',
    '  <input type="text" id="sdp-l-settore" placeholder="Es. Consulenza fiscale, E-commerce..." maxlength="150">',
    '  <input type="text" class="sdp-hp" id="sdp-l-hp" tabindex="-1" aria-hidden="true" autocomplete="off">',
    '  <button id="sdp-lead-btn">Accedi Subito \u2192</button>',
    '  <div id="sdp-lead-error"></div>',
    '  <p id="sdp-lead-privacy">Rispettiamo la tua privacy. Nessuno spam.',
    '    <a href="/privacy-policy.html">Privacy Policy</a></p>',
    '</div>',
    '<div id="sdp-lead-success">',
    '  <div class="sdp-check">\u2705</div>',
    '  <p>Grazie, sei dentro!</p>',
    '  <span>Controlla la tua email nelle prossime ore.</span>',
    '  <div id="sdp-share-block" style="display:none;margin-top:1.5rem;text-align:left;">',
    '    <p style="color:#718096;font-size:0.82rem;margin-bottom:0.5rem;">\uD83D\uDD17 Condividi il tuo link invito:</p>',
    '    <div id="sdp-share-link" style="background:rgba(255,255,255,0.05);border:1px solid rgba(99,179,237,0.2);border-radius:8px;padding:0.6rem 0.9rem;color:#63b3ed;font-size:0.78rem;word-break:break-all;margin-bottom:0.75rem;"></div>',
    '    <div style="display:flex;gap:0.5rem;">',
    '      <button id="sdp-copy-btn" style="flex:1;padding:0.55rem;background:rgba(99,179,237,0.15);border:1px solid rgba(99,179,237,0.3);border-radius:8px;color:#63b3ed;font-size:0.82rem;cursor:pointer;">\uD83D\uDCCB Copia</button>',
    '      <button id="sdp-wa-btn" style="flex:1;padding:0.55rem;background:rgba(72,187,120,0.15);border:1px solid rgba(72,187,120,0.3);border-radius:8px;color:#68d391;font-size:0.82rem;cursor:pointer;">\uD83D\uDCAC WhatsApp</button>',
    '    </div>',
    '  </div>',
    '</div>',
    '</div></div>'
  ].join('');

  var wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper.firstChild);

  /* ─── HELPERS ────────────────────────────────────────────────── */
  function showError(msg) {
    var el = document.getElementById('sdp-lead-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  function hideError() {
    var el = document.getElementById('sdp-lead-error');
    if (el) el.style.display = 'none';
  }

  /**
   * Rimuove HTML (completo e incompleto), caratteri CSV-breaking e
   * limita la lunghezza per prevenire injection e XSS.
   */
  function sanitize(val) {
    if (!val) return '';
    return String(val)
      .substring(0, 250)
      .replace(/<[^>]*>?/gm, '')   // strip tag HTML completi E incompleti (es. <script)
      .replace(/["\r\n]/g, ' ')    // rimuove virgolette e a-capo (CSV-breaking)
      .trim();
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /** Codifica una stringa UTF-8 in Base64 senza usare escape/unescape deprecati */
  function toBase64(str) {
    var bytes = new TextEncoder().encode(str);
    var binary = '';
    bytes.forEach(function (b) { binary += String.fromCharCode(b); });
    return btoa(binary);
  }

  /** Decodifica Base64 in stringa UTF-8 senza usare escape/unescape deprecati */
  function fromBase64(b64) {
    var binary = atob(b64.replace(/\n/g, ''));
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  }

  /** Invia la riga al CSV su GitHub via API */
  function saveToGitHub(row) {
    if (!GITHUB_TOKEN || GITHUB_TOKEN === '__INSERISCI_TOKEN_QUI__') {
  console.warn('sdp: token GitHub non configurato – salvataggio solo locale.');
  return;
}
    

    var apiUrl = 'https://api.github.com/repos/' +
      GITHUB_OWNER + '/' + GITHUB_REPO + '/contents/' + GITHUB_FILE;
    var headers = {
      'Authorization': 'Bearer ' + GITHUB_TOKEN,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };

    fetch(apiUrl, { headers: headers })
      .then(function (r) { return r.json(); })
      .then(function (fileData) {
        var current = '';
        try {
          current = fromBase64(fileData.content);
        } catch (_) { current = ''; }

        var newContent = current + row + '\n';

        return fetch(apiUrl, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify({
            message: 'lead: nuova registrazione',
            content: toBase64(newContent),
            sha: fileData.sha
          })
        });
      })
      .then(function (r) {
        if (!r.ok) {
          r.text().then(function (t) { console.warn('sdp: GitHub PUT error:', t); });
        }
      })
      .catch(function (err) {
        console.warn('sdp: errore salvataggio GitHub:', err);
      });
  }

  /* ─── EVENT LISTENERS ────────────────────────────────────────── */
  var overlay = document.getElementById('sdp-lead-overlay');

  document.getElementById('sdp-lead-close').onclick = function () {
    overlay.remove();
  };
  overlay.addEventListener('click', function (e) {
    if (e.target === this) this.remove();
  });

  document.getElementById('sdp-lead-btn').onclick = function () {
    hideError();

    var lastSubmit = parseInt(localStorage.getItem(LAST_SUBMIT_KEY) || '0', 10);
    if (Date.now() - lastSubmit < RATE_LIMIT_MS) {
      showError('Attendi qualche secondo prima di inviare di nuovo.');
      return;
    }

    if (document.getElementById('sdp-l-hp').value) {
      overlay.remove();
      return;
    }

    var nome  = sanitize(document.getElementById('sdp-l-nome').value);
    var email = sanitize(document.getElementById('sdp-l-email').value);

    if (!nome) { showError('Il campo Nome è obbligatorio.'); return; }
    if (!email || !isValidEmail(email)) {
      showError("Inserisci un'email valida (es. mario@azienda.it).");
      return;
    }

    var lead = {
      timestamp: new Date().toISOString(),
      nome:      nome,
      email:     email,
      tel:       sanitize(document.getElementById('sdp-l-tel').value),
      attivita:  sanitize(document.getElementById('sdp-l-attivita').value),
      settore:   sanitize(document.getElementById('sdp-l-settore').value),
      source:    refVia ? 'referral:' + refVia : 'popup-sito',
      referrer:  refVia  // chi ha referenziato questo lead (vuoto se organico)
    };

    var leads = [];
    try { leads = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (_) {}
    leads.push(lead);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));

    var csvRow = [
      lead.timestamp,
      lead.nome,
      lead.email,
      lead.tel,
      lead.attivita,
      lead.settore,
      lead.source,
      lead.referrer
    ].map(function (v) {
      return '"' + String(v).replace(/"/g, '""') + '"';
    }).join(',');

    saveToGitHub(csvRow);

    document.getElementById('sdp-lead-form').style.display = 'none';
    document.getElementById('sdp-lead-success').style.display = 'block';

    // Genera il link di invito personale dell'utente appena registrato.
    // ViralCard™ Loop – Passaparola Digitale Infinito a Cascata:
    // Il link di condivisione punta a questa stessa pagina ma con i dati
    // dell'utente nell'URL (senza card=1) così chi lo visita vede il
    // profilo dell'utente e il popup si apre automaticamente.
    var refId = nome.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '').substring(0, 30);
    var shareParams = new URLSearchParams({ nome: lead.nome, via: refId });
    if (lead.email)    shareParams.set('email',    lead.email);
    if (lead.tel)      shareParams.set('tel',       lead.tel);
    if (lead.attivita) shareParams.set('attivita',  lead.attivita);
    if (lead.settore)  shareParams.set('settore',   lead.settore);
    var shareUrl = window.location.origin + window.location.pathname + '?' + shareParams.toString();

    var shareBlock = document.getElementById('sdp-share-block');
    var shareLinkEl = document.getElementById('sdp-share-link');
    if (shareBlock && shareLinkEl) {
      shareLinkEl.textContent = shareUrl;
      shareBlock.style.display = 'block';
      document.getElementById('sdp-copy-btn').onclick = function () {
        navigator.clipboard.writeText(shareUrl).then(function () {
          document.getElementById('sdp-copy-btn').textContent = '\u2705 Copiato!';
        }).catch(function () {
          // fallback per browser senza clipboard API
          var tmp = document.createElement('textarea');
          tmp.value = shareUrl;
          document.body.appendChild(tmp);
          tmp.select();
          document.execCommand('copy');
          document.body.removeChild(tmp);
          document.getElementById('sdp-copy-btn').textContent = '\u2705 Copiato!';
        });
      };
      document.getElementById('sdp-wa-btn').onclick = function () {
        var msg = 'Ciao! Ti invito a scoprire le risorse gratuite su sicurezza dati e AI aziendale: ' + shareUrl;
        window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
      };
    }

    // Reindirizza al mini-backoffice personale dell'utente appena registrato.
    // Il backoffice-utente.html permette all'utente di:
    //  - personalizzare e visualizzare il proprio biglietto digitale
    //  - scaricare il QR e la vCard
    //  - condividere il proprio link referral con i pulsanti social
    setTimeout(function () {
      var bkParams = new URLSearchParams({ nome: lead.nome, via: refId });
      if (lead.email)    bkParams.set('email',    lead.email);
      if (lead.tel)      bkParams.set('tel',       lead.tel);
      if (lead.attivita) bkParams.set('attivita',  lead.attivita);
      if (lead.settore)  bkParams.set('settore',   lead.settore);
      // Remove the filename from the current pathname to obtain the directory base,
      // so the redirect works both on subdirectory (github.io/repo/) and root domains.
      var basePath = window.location.pathname.replace(/\/[^\/]*$/, '');
      window.location.href = window.location.origin + basePath + '/backoffice-utente.html?' + bkParams.toString();
    }, 4000);
  };
  } // fine _buildAndShowPopup
})();
