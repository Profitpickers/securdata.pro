(function(){
  if(document.getElementById('sdp-lead-overlay')) return;
  var STORAGE_KEY='sdp_leads';
  var shown=sessionStorage.getItem('sdp_popup_shown');

  var style=document.createElement('style');
  style.textContent='#sdp-lead-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:"Segoe UI",system-ui,sans-serif;backdrop-filter:blur(4px);}#sdp-lead-box{background:linear-gradient(135deg,#0d1530,#0a1628);border:1px solid rgba(99,179,237,0.3);border-radius:20px;padding:2.5rem 2rem;width:460px;max-width:95vw;max-height:90vh;overflow-y:auto;position:relative;}#sdp-lead-close{position:absolute;top:1rem;right:1.2rem;background:none;border:none;color:#718096;font-size:1.4rem;cursor:pointer;line-height:1;}#sdp-lead-logo{width:52px;height:52px;border-radius:10px;object-fit:contain;margin-bottom:0.8rem;}#sdp-lead-box h2{font-size:1.25rem;font-weight:700;color:#e8f4ff;margin-bottom:0.4rem;}#sdp-lead-box .sdp-sub{font-size:0.85rem;color:#718096;margin-bottom:1.5rem;line-height:1.5;}#sdp-lead-box label{display:block;font-size:0.77rem;color:#718096;margin-bottom:5px;margin-top:0.9rem;}#sdp-lead-box input{width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(99,179,237,0.25);border-radius:8px;padding:0.65rem 0.9rem;color:#e2e8f0;font-size:0.875rem;outline:none;transition:border 0.2s;}#sdp-lead-box input:focus{border-color:#63b3ed;}#sdp-lead-btn{width:100%;margin-top:1.5rem;background:linear-gradient(135deg,#1a56db,#1e40af);color:#fff;border:none;padding:0.85rem;border-radius:10px;font-size:1rem;font-weight:700;cursor:pointer;letter-spacing:0.02em;}#sdp-lead-btn:hover{opacity:0.9;}#sdp-lead-success{display:none;text-align:center;padding:1.5rem 0;}#sdp-lead-success .sdp-check{font-size:3rem;margin-bottom:0.8rem;}#sdp-lead-success p{color:#68d391;font-size:1rem;font-weight:600;}#sdp-lead-success span{color:#718096;font-size:0.85rem;}.sdp-required{color:#fc8181;}#sdp-lead-privacy{font-size:0.72rem;color:#4a5568;margin-top:1rem;text-align:center;}#sdp-lead-privacy a{color:#63b3ed;}';
  document.head.appendChild(style);

  var logoSrc='https://profitpickers.github.io/securdata.pro/logo-00-securdata-pro.svg';

  var html='<div id="sdp-lead-overlay"><div id="sdp-lead-box"><button id="sdp-lead-close" title="Chiudi">✕</button><img id="sdp-lead-logo" src="'+logoSrc+'" alt="SecurData.Pro"><h2>Accedi alle Risorse Gratuite</h2><div class="sdp-sub">Inserisci i tuoi dati per ricevere guide esclusive su sicurezza dati e AI aziendale.</div><div id="sdp-lead-form"><label>Nome e Cognome <span class="sdp-required">*</span></label><input type="text" id="sdp-l-nome" placeholder="Es. Mario Rossi"><label>Email <span class="sdp-required">*</span></label><input type="email" id="sdp-l-email" placeholder="mario@tuaazienda.it"><label>Telefono / WhatsApp</label><input type="tel" id="sdp-l-tel" placeholder="+39 320 000 0000"><label>Nome Attività</label><input type="text" id="sdp-l-attivita" placeholder="Es. Studio Rossi & Associati"><label>Settore / Attività svolta</label><input type="text" id="sdp-l-settore" placeholder="Es. Consulenza fiscale, E-commerce..."><button id="sdp-lead-btn">Accedi Subito →</button><p id="sdp-lead-privacy">Rispettiamo la tua privacy. Nessuno spam. <a href="/privacy-policy.html">Privacy Policy</a></p></div><div id="sdp-lead-success"><div class="sdp-check">✅</div><p>Grazie, sei dentro!</p><span>Controlla la tua email nelle prossime ore.</span></div></div></div>';

  var wrapper=document.createElement('div');
  wrapper.innerHTML=html;
  document.body.appendChild(wrapper.firstChild);

  document.getElementById('sdp-lead-close').onclick=function(){ document.getElementById('sdp-lead-overlay').remove(); };
  document.getElementById('sdp-lead-overlay').addEventListener('click',function(e){ if(e.target===this) this.remove(); });

  document.getElementById('sdp-lead-btn').onclick=function(){
    var nome=document.getElementById('sdp-l-nome').value.trim();
    var email=document.getElementById('sdp-l-email').value.trim();
    if(!nome||!email){ alert('Nome ed Email sono obbligatori.'); return; }
    var lead={
      nome:nome, email:email,
      tel:document.getElementById('sdp-l-tel').value,
      attivita:document.getElementById('sdp-l-attivita').value,
      settore:document.getElementById('sdp-l-settore').value,
      note:'', stato:'new',
      date:new Date().toLocaleDateString('it-IT'),
      source:'popup-sito'
    };
    var leads=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
    leads.push(lead);
    localStorage.setItem(STORAGE_KEY,JSON.stringify(leads));
    sessionStorage.setItem('sdp_popup_shown','1');
    document.getElementById('sdp-lead-form').style.display='none';
    document.getElementById('sdp-lead-success').style.display='block';
    setTimeout(function(){ document.getElementById('sdp-lead-overlay').remove(); },3000);
  };
})();
