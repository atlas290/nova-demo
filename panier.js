const NUMERO_WHATSAPP = "2290167020586";
let panier = JSON.parse(localStorage.getItem('panierNova')) || {};
let dernierAjout = null;
let modeActuel = 'livraison';

function ajouterAuPanier(nom, prix, id) {
    if(panier[id]) { panier[id].qte++; } else { panier[id] = { nom: nom, prix: prix, qte: 1 }; }
    dernierAjout = id; sauvegarderPanier(); mettreAJourUI(); afficherToast(`${nom} ajouté`);
    const container = document.getElementById(`btn-container-${id}`);
    if(container) { 
        container.querySelector('.btn-add').style.display = 'none'; 
        const ctrl = document.getElementById(`ctrl-${id}`);
        if(ctrl) { ctrl.style.display = 'flex'; document.getElementById(`qte-${id}`).innerText = panier[id].qte; }
    }
}

function modifierQte(id, changement) {
    if(!panier[id]) return; panier[id].qte += changement;
    if(panier[id].qte <= 0) {
        delete panier[id];
        const container = document.getElementById(`btn-container-${id}`);
        if(container) { container.querySelector('.btn-add').style.display = 'block'; document.getElementById(`ctrl-${id}`).style.display = 'none'; }
    } else {
        const qteEl = document.getElementById(`qte-${id}`);
        if(qteEl) qteEl.innerText = panier[id].qte;
    }
    sauvegarderPanier(); mettreAJourUI();
}

function supprimerArticle(id) {
    if(panier[id]) {
        delete panier[id];
        const container = document.getElementById(`btn-container-${id}`);
        if(container) { container.querySelector('.btn-add').style.display = 'block'; document.getElementById(`ctrl-${id}`).style.display = 'none'; }
        sauvegarderPanier(); mettreAJourUI();
    }
}

function viderPanier() {
    panier = {};
    document.querySelectorAll('.btn-qte-control').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.btn-add').forEach(el => el.style.display = 'block');
    sauvegarderPanier(); mettreAJourUI();
}

function sauvegarderPanier() { localStorage.setItem('panierNova', JSON.stringify(panier)); }
function annulerDernierAjout() { if(dernierAjout && panier[dernierAjout]) { modifierQte(dernierAjout, -1); cacherToast(); } }

function mettreAJourUI() {
    const container = document.getElementById('panier-items-container');
    const totalPrix = document.getElementById('panier-total-prix');
    const cartBar = document.getElementById('cart-bar');
    const cartBarText = document.getElementById('cart-bar-text');
    const btnWhatsapp = document.getElementById('btn-whatsapp');
    if(!container) return; // Sécurité si on est sur index.html (pas de panier visible)
    
    let total = 0; let qteTotale = 0; container.innerHTML = '';
    
    if (Object.keys(panier).length === 0) {
        container.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.4); margin-top:40px; font-style:italic;">Votre panier est vide.</p>';
        totalPrix.innerText = '0 F'; cartBar.classList.remove('active'); btnWhatsapp.setAttribute('disabled', 'true'); return;
    }
    
    cartBar.classList.add('active');
    for (let id in panier) {
        let item = panier[id]; total += item.prix * item.qte; qteTotale += item.qte;
        const div = document.createElement('div'); div.className = 'panier-item-card';
        div.innerHTML = `<div class="item-top"><span class="item-nom">${item.nom}</span><span class="item-prix">${(item.prix * item.qte).toLocaleString()} F</span></div><div class="item-bottom"><div class="qte-selector"><button onclick="modifierQte('${id}', -1)">−</button><span>${item.qte}</span><button onclick="modifierQte('${id}', 1)">+</button></div><button class="btn-trash" onclick="supprimerArticle('${id}')"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></div>`;
        container.appendChild(div);
    }
    totalPrix.innerText = total.toLocaleString() + ' F';
    cartBarText.innerHTML = `<strong>${qteTotale} art.</strong> · ${total.toLocaleString()} F`;
    preparerLienWhatsApp();
}

function preparerLienWhatsApp() {
    const btnWhatsapp = document.getElementById('btn-whatsapp');
    let total = 0; for(let id in panier) total += panier[id].prix * panier[id].qte; if(total === 0) return;
    const nom = document.getElementById('nom-input').value.trim() || 'Non renseigné';
    let msg = "NOUVELLE COMMANDE NOVA GRILL\n\n" + `Nom : ${nom}\n` + `Type : ${modeActuel}\n`;
    
    if(modeActuel === 'livraison') { 
        const adresse = document.getElementById('adresse-input').value.trim(); 
        if(!adresse) { btnWhatsapp.setAttribute('disabled', 'true'); return; } else { btnWhatsapp.removeAttribute('disabled'); } msg += `Lieu : ${adresse}\n`; 
    } else if(modeActuel === 'sur_place') { 
        const table = document.getElementById('table-input').value.trim(); 
        if(!table) { btnWhatsapp.setAttribute('disabled', 'true'); return; } else { btnWhatsapp.removeAttribute('disabled'); } msg += `Table : ${table}\n`; 
    } else { btnWhatsapp.removeAttribute('disabled'); }
    
    msg += "\n------------------------\n\n"; 
    for (let id in panier) msg += `• ${panier[id].qte}x ${panier[id].nom} (${(panier[id].prix * panier[id].qte).toLocaleString()} F)\n`; 
    msg += "\n------------------------\n\n" + `TOTAL : ${total.toLocaleString()} F\n\n`;
    const remarque = document.getElementById('remarque-input').value.trim(); if(remarque) msg += `Remarque : ${remarque}\n\n`; 
    msg += `(Merci de confirmer ma commande)`; 
    btnWhatsapp.href = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

function ouvrirPanier() { document.getElementById('panier-drawer').classList.add('active'); document.getElementById('panier-overlay').classList.add('active'); }
function fermerPanier() { document.getElementById('panier-drawer').classList.remove('active'); document.getElementById('panier-overlay').classList.remove('active'); }
function setMode(mode, btn) { modeActuel = mode; document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); document.querySelectorAll('.input-cond').forEach(el => el.classList.remove('active')); if(mode === 'livraison') document.getElementById('input-livraison').classList.add('active'); if(mode === 'sur_place') document.getElementById('input-sur_place').classList.add('active'); preparerLienWhatsApp(); }
function toggleRemarque() { document.getElementById('remarque-input').classList.toggle('active'); }
function afficherToast(message) { const toast = document.getElementById('toast'); document.getElementById('toast-message').innerText = message; toast.classList.add('active'); setTimeout(cacherToast, 4000); }
function cacherToast() { document.getElementById('toast').classList.remove('active'); }