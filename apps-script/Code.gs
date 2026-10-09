/**
 * JECI 2026 — Google Apps Script (backend d'inscription)
 * 1. Créez un Google Sheet, puis Extensions > Apps Script, collez ce code.
 * 2. Déployer > Nouveau déploiement > Application Web
 *    - Exécuter en tant que : Moi
 *    - Qui a accès : Tout le monde
 * 3. Copiez l'URL « /exec » dans js/inscription.js (APPS_SCRIPT_URL).
 */
const COLONNES = {
  inscription: ['date_envoi','nom','prenom','telephone','email','ville','secteur','participation'],
  idee:        ['date_envoi','nom','email','idee'],
  contact:     ['date_envoi','nom','email','sujet','message']
};

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const type = COLONNES[d.formulaire] ? d.formulaire : 'inscription';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let feuille = ss.getSheetByName(type);
    if (!feuille) { feuille = ss.insertSheet(type); feuille.appendRow(COLONNES[type]); feuille.setFrozenRows(1); }
    const ligne = COLONNES[type].map(c => String(d[c] || '').replace(/^[=+\-@]/, "'$&")); // anti-injection de formules
    feuille.appendRow(ligne);
    return sortie({ success: true });
  } catch (err) {
    return sortie({ success: false, message: String(err) });
  }
}

function doGet() { return sortie({ success: true, message: 'JECI API opérationnelle' }); }

function sortie(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
