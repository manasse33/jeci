/* =====================================================================
   JECI 2026 — inscription.js
   Envoi des formulaires vers Google Apps Script → Google Sheets
   (aucune clé secrète côté front : l'URL du déploiement web suffit)
   ===================================================================== */

// URL de déploiement « Application Web » de l'Apps Script (inchangée après « Nouvelle version »)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw12aFOtXZh8-Al4gv0iLvI-mcadK3J6rS_ORZ5XwtKlOLzmbbWhVc7gra79TGi_GM0/exec";

(() => {
  'use strict';

  const URL_NON_CONFIGUREE = () => !APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'VOTRE_URL_APPS_SCRIPT';

  /** Envoie un objet de données à l'Apps Script et retourne la réponse JSON. */
  async function envoyer(payload) {
    if (URL_NON_CONFIGUREE()) {
      throw new Error('Le formulaire n’est pas encore connecté (APPS_SCRIPT_URL à renseigner dans js/inscription.js).');
    }
    // "text/plain" évite la requête préliminaire CORS (preflight), non gérée par Apps Script.
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });
    if (!res.ok) throw new Error('Réponse du serveur : ' + res.status);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Enregistrement refusé par le serveur.');
    return json;
  }

  function valider(form) {
    let ok = true;
    form.querySelectorAll('[required]').forEach(champ => {
      const vide = !champ.value.trim();
      let invalide = vide;
      if (!vide && champ.type === 'email') invalide = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(champ.value);
      if (champ.type === 'radio') return;
      if (!vide && champ.type === 'tel') invalide = champ.value.replace(/\D/g, '').length < 8;
      champ.classList.toggle('invalide', invalide);
      champ.setAttribute('aria-invalid', String(invalide));
      if (invalide) ok = false;
    });
    // Groupes de boutons radio obligatoires
    form.querySelectorAll('fieldset[data-required-radio]').forEach(fs => {
      const coche = fs.querySelector('input[type="radio"]:checked');
      fs.classList.toggle('invalide', !coche);
      if (!coche) ok = false;
    });
    return ok;
  }

  function message(zone, type, texte) {
    zone.hidden = false;
    zone.className = 'mt-5 rounded-xl px-5 py-4 font-medium ' +
      (type === 'ok' ? 'bg-emeraude/12 text-emeraude-dark border border-emeraude/40'
        : type === 'err' ? 'bg-red-50 text-red-800 border border-red-300'
        : 'bg-marine/5 text-marine border border-marine/20');
    zone.textContent = texte;
    zone.setAttribute('role', type === 'err' ? 'alert' : 'status');
  }

  document.querySelectorAll('form[data-jeci-form]').forEach(form => {
    const type = form.dataset.jeciForm;                 // "inscription" | "contact"
    const zone = form.querySelector('[data-feedback]');
    const bouton = form.querySelector('button[type="submit"]');
    const libelle = bouton.innerHTML;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();                               // pas de rechargement de page
      if (form.website && form.website.value) return;   // piège anti-spam (honeypot)
      if (!valider(form)) { message(zone, 'err', 'Merci de vérifier les champs en rouge.'); return; }

      const data = Object.fromEntries(new FormData(form).entries());
      delete data.website;
      data.formulaire = type;
      data.date_envoi = new Date().toISOString();
      data.page = location.pathname;

      bouton.disabled = true;
      bouton.textContent = 'Envoi en cours…';
      message(zone, 'info', 'Envoi en cours…');

      try {
        await envoyer(data);
        message(zone, 'ok', type === 'inscription'
          ? 'Merci ! Votre pré-inscription est bien enregistrée. L’équipe JECI vous contactera pour un entretien en présentiel.'
          : 'Merci ! Votre message a bien été transmis à l’équipe JECI.');
        form.reset();
      } catch (err) {
        console.error('[JECI] Échec de l’envoi :', err);
        message(zone, 'err', 'L’envoi a échoué. ' + (URL_NON_CONFIGUREE() ? err.message : 'Vérifiez votre connexion et réessayez.'));
      } finally {
        bouton.disabled = false;
        bouton.innerHTML = libelle;
      }
    });

    form.querySelectorAll('.champ').forEach(c => c.addEventListener('input', () => c.classList.remove('invalide')));
  });
})();
