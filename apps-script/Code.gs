/**
 * JECI 2026 — Google Apps Script (pré-inscriptions + contact)
 * Après toute modification : Déployer > Gérer les déploiements > crayon > Nouvelle version.
 */
const TEMPLATE_DOC_ID = "12o5EFNC4JNLmo_PuMicb9n6Dtz0ZS6HMozySq4mUVAY";
const ENVOYER_CONFIRMATION = true;   // email « pré-inscription bien reçue » (sans ticket)
const ENVOYER_TICKET = false;        // passer à true plus tard pour envoyer le ticket PDF

const COLONNES = {
  inscription: ['date_envoi','nom','prenom','telephone','email','ville','secteur','participation','description'],
  contact:     ['date_envoi','nom','email','sujet','message']
};

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const type = COLONNES[d.formulaire] ? d.formulaire : 'inscription';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let feuille = ss.getSheetByName(type);
    if (!feuille) { feuille = ss.insertSheet(type); feuille.appendRow(COLONNES[type]); feuille.setFrozenRows(1); }
    const ligne = COLONNES[type].map(c => String(d[c] || '').replace(/^[=+\-@]/, "'$&"));
    feuille.appendRow(ligne);

    let email = false;
    if (type === 'inscription' && d.email) {
      try {
        if (ENVOYER_TICKET) envoyerTicket(d);
        else if (ENVOYER_CONFIRMATION) envoyerConfirmation(d);
        email = true;
      } catch (err) { console.error('Email non envoyé : ' + err); }
    }
    return sortie({ success: true, email: email });
  } catch (err) {
    return sortie({ success: false, message: String(err) });
  }
}

function envoyerConfirmation(d) {
  MailApp.sendEmail({
    to: d.email,
    name: 'JECI 2026',
    subject: d.prenom + ', votre pré-inscription aux JECI 2026 est bien reçue',
    body: 'Bonjour ' + d.prenom + ',\n\n' +
      'Nous avons bien reçu votre pré-inscription aux Journées de l’Entrepreneur Créatif et Innovant (1ère édition).\n\n' +
      'Récapitulatif :\n' +
      '• Axe : ' + (d.secteur || '') + '\n' +
      '• Situation : ' + (d.participation || '') + '\n\n' +
      'Prochaine étape : l’équipe JECI vous contactera pour un entretien en présentiel. ' +
      'Votre inscription sera confirmée à l’issue de cet entretien.\n\n' +
      'L’événement : du 10 au 14 novembre 2026, au siège de la Maison Hongroise, King’s Appart, 34 rue Bergère, Bacongo (Brazzaville).\n\n' +
      'Une question ? Répondez simplement à cet email ou appelez le +242 06 832 35 33 / 05 561 19 63.\n\n' +
      'À très bientôt,\n\nL’équipe JECI\nJECI 2026 — Créons ensemble.'
  });
}

function envoyerTicket(d) {
  const nomFichier = 'Ticket JECI - ' + d.prenom + ' ' + d.nom;
  const copie = DriveApp.getFileById(TEMPLATE_DOC_ID).makeCopy(nomFichier);
  try {
    const doc = DocumentApp.openById(copie.getId());
    const corps = doc.getBody();
    corps.replaceText('\\{\\{prenom\\}\\}', String(d.prenom || ''));
    corps.replaceText('\\{\\{nom\\}\\}', String(d.nom || ''));
    corps.replaceText('\\{\\{participation\\}\\}', String(d.participation || ''));
    doc.saveAndClose();
    const pdf = copie.getAs('application/pdf').setName(nomFichier + '.pdf');
    MailApp.sendEmail({
      to: d.email, name: 'JECI 2026',
      subject: d.prenom + ', voici votre ticket pour les JECI 2026',
      body: 'Bonjour ' + d.prenom + ',\n\nVotre inscription est confirmée. Votre ticket d’entrée est en pièce jointe.\n\nL’équipe JECI',
      attachments: [pdf]
    });
  } finally { copie.setTrashed(true); }
}

// Test : exécuter cette fonction pour recevoir l'email de confirmation
function testConfirmation() {
  envoyerConfirmation({ prenom: 'Test', email: Session.getActiveUser().getEmail(), secteur: 'Santé et biotechnologie', participation: 'Porteur de projet' });
}

function autoriser() { MailApp.getRemainingDailyQuota(); SpreadsheetApp.getActiveSpreadsheet(); DriveApp.getRootFolder(); }
function doGet() { return sortie({ success: true, message: 'JECI API opérationnelle' }); }
function sortie(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
