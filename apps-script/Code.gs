/**
 * JECI 2026 — Pré-inscriptions, exposants, validation et envoi des tickets
 * Après toute modification : Déployer > Gérer les déploiements > crayon > Nouvelle version.
 */
const TEMPLATE_DOC_ID = "12o5EFNC4JNLmo_PuMicb9n6Dtz0ZS6HMozySq4mUVAY";      // ticket participant
const TEMPLATE_EXPOSANT_DOC_ID = "COLLE_ICI_L_ID_DU_TICKET_EXPOSANT";          // ticket exposant
const LIEU = "siège de la Maison Hongroise, King’s Appart, 34 rue Bergère, Bacongo (Brazzaville)";
const MAX_PAR_POLE = 3;

const COLONNES = {
  inscription: ['date_envoi','nom','prenom','telephone','email','ville','secteur','participation','description','statut','ticket_envoye','refus_envoye'],
  exposant:    ['date_envoi','entreprise','nom','prenom','fonction','telephone','email','ville','pole','activite','innovation','lien','kakemono','statut','ticket_envoye','refus_envoye'],
  contact:     ['date_envoi','nom','email','sujet','message']
};
const STATUTS = ['En attente', 'Accepté', 'Refusé'];

/* ===================== RÉCEPTION DES FORMULAIRES (site) ===================== */
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const type = COLONNES[d.formulaire] ? d.formulaire : 'inscription';
    if (type !== 'contact') d.statut = 'En attente';
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let feuille = ss.getSheetByName(type);
    if (!feuille) { feuille = ss.insertSheet(type); feuille.appendRow(COLONNES[type]); feuille.setFrozenRows(1); }
    const ligne = COLONNES[type].map(c => String(d[c] || '').replace(/^[=+\-@]/, "'$&"));
    feuille.appendRow(ligne);

    let email = false;
    if (type !== 'contact' && d.email) {
      try { type === 'exposant' ? envoyerConfirmationExposant(d) : envoyerConfirmationPreinscription(d); email = true; }
      catch (err) { console.error('Email non envoyé : ' + err); }
    }
    return sortie({ success: true, email: email });
  } catch (err) {
    return sortie({ success: false, message: String(err) });
  }
}

function envoyerConfirmationPreinscription(d) {
  MailApp.sendEmail({
    to: d.email, name: 'JECI 2026',
    subject: d.prenom + ', votre pré-inscription aux JECI 2026 est bien reçue',
    body: 'Bonjour ' + d.prenom + ',\n\n' +
      'Nous avons bien reçu votre pré-inscription aux Journées de l’Entrepreneur Créatif et Innovant (1ère édition).\n\n' +
      'Récapitulatif :\n• Axe : ' + (d.secteur || '') + '\n• Situation : ' + (d.participation || '') + '\n\n' +
      'Prochaine étape : l’équipe JECI vous contactera pour un entretien en présentiel. ' +
      'Votre inscription sera confirmée, et votre ticket d’entrée envoyé, à l’issue de cet entretien.\n\n' +
      'L’événement : du 10 au 14 novembre 2026, au ' + LIEU + '.\n\n' +
      'Une question ? Répondez à cet email ou appelez le +242 06 832 35 33 / 05 561 19 63.\n\n' +
      'À très bientôt,\n\nL’équipe JECI\nJECI 2026 — Créons ensemble.'
  });
}

function envoyerConfirmationExposant(d) {
  MailApp.sendEmail({
    to: d.email, name: 'JECI 2026',
    subject: d.prenom + ', votre candidature d’exposant aux JECI 2026 est bien reçue',
    body: 'Bonjour ' + d.prenom + ',\n\n' +
      'Nous avons bien reçu la candidature de ' + (d.entreprise || 'votre entreprise') + ' à l’appel à exposants des JECI 2026 (pôle : ' + (d.pole || '') + ').\n\n' +
      'Les places sont limitées à 3 exposants par pôle. L’équipe étudie les dossiers et reviendra vers vous. ' +
      'Si votre candidature est retenue, vous recevrez votre ticket exposant par email.\n\n' +
      'L’événement : du 10 au 14 novembre 2026, au ' + LIEU + '.\n\n' +
      'Une question ? Répondez à cet email ou appelez le +242 06 832 35 33 / 05 561 19 63.\n\n' +
      'Cordialement,\n\nL’équipe JECI\nJECI 2026 — Créons ensemble.'
  });
}

/* ===================== MENU DANS LE GOOGLE SHEET ===================== */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('JECI')
    .addItem('1. Préparer les feuilles (une seule fois)', 'preparerFeuilles')
    .addSeparator()
    .addItem('Participants : envoyer les tickets (Accepté)', 'envoyerTicketsAcceptes')
    .addItem('Participants : emails aux refusés', 'envoyerEmailsRefuses')
    .addSeparator()
    .addItem('Exposants : envoyer les tickets exposant (Accepté)', 'envoyerTicketsExposants')
    .addItem('Exposants : emails aux refusés', 'envoyerEmailsExposantsRefuses')
    .addToUi();
}

/** Crée les onglets, ajoute les colonnes manquantes et la liste déroulante de statut. */
function preparerFeuilles() {
  ['inscription', 'exposant'].forEach(preparerFeuille);
  SpreadsheetApp.getUi().alert('Feuilles prêtes. Choisissez le statut de chaque candidat dans la colonne « statut ».');
}

function preparerFeuille(nom) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let f = ss.getSheetByName(nom) || ss.insertSheet(nom);
  if (f.getLastRow() === 0) f.appendRow(COLONNES[nom]);
  const h = f.getRange(1, 1, 1, Math.max(f.getLastColumn(), 1)).getValues()[0].map(x => String(x).trim());
  COLONNES[nom].forEach(c => { if (h.indexOf(c) === -1) { f.getRange(1, h.length + 1).setValue(c); h.push(c); } });
  const col = h.indexOf('statut') + 1;
  const regle = SpreadsheetApp.newDataValidation().requireValueInList(STATUTS, true).setAllowInvalid(false).build();
  f.getRange(2, col, 1000, 1).setDataValidation(regle);
  const n = f.getLastRow() - 1;
  if (n > 0) {
    const plage = f.getRange(2, col, n, 1), vals = plage.getValues();
    plage.setValues(vals.map(v => [v[0] === '' ? 'En attente' : v[0]]));
  }
  f.setFrozenRows(1);
}

/* ===================== ENVOI DES TICKETS / EMAILS ===================== */
function envoyerTicketsAcceptes()        { traiter('inscription', 'Accepté', 'ticket_envoye', envoyerTicket,         'ticket(s) participant'); }
function envoyerEmailsRefuses()          { traiter('inscription', 'Refusé',  'refus_envoye',  envoyerRefus,          'email(s) de refus'); }
function envoyerTicketsExposants()       { traiter('exposant',    'Accepté', 'ticket_envoye', envoyerTicketExposant, 'ticket(s) exposant'); }
function envoyerEmailsExposantsRefuses() { traiter('exposant',    'Refusé',  'refus_envoye',  envoyerRefusExposant,  'email(s) de refus exposant'); }

function norm(x) { return String(x || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }

function traiter(nomFeuille, statutCible, colMarque, fonctionEnvoi, libelle) {
  const ui = SpreadsheetApp.getUi();
  const f = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nomFeuille);
  if (!f) { ui.alert('Onglet « ' + nomFeuille + ' » introuvable. Lancez d’abord « 1. Préparer les feuilles ».'); return; }
  const vals = f.getDataRange().getValues();
  const h = vals[0].map(x => String(x).trim());
  const iStatut = h.indexOf('statut'), iMarque = h.indexOf(colMarque), iEmail = h.indexOf('email');
  if (iStatut < 0 || iMarque < 0) { ui.alert('Colonnes manquantes. Lancez d’abord « 1. Préparer les feuilles ».'); return; }

  // Exposants : 3 acceptés maximum par pôle
  if (nomFeuille === 'exposant' && statutCible === 'Accepté') {
    const iPole = h.indexOf('pole'), compte = {};
    for (let i = 1; i < vals.length; i++) if (norm(vals[i][iStatut]) === 'accepte') compte[vals[i][iPole]] = (compte[vals[i][iPole]] || 0) + 1;
    const trop = Object.keys(compte).filter(p => compte[p] > MAX_PAR_POLE);
    if (trop.length) { ui.alert('Trop d’exposants acceptés (maximum ' + MAX_PAR_POLE + ' par pôle) dans : ' + trop.join(', ') + '.\nCorrigez les statuts avant l’envoi.'); return; }
  }

  const aTraiter = [];
  for (let i = 1; i < vals.length; i++) {
    if (norm(vals[i][iStatut]) === norm(statutCible) && String(vals[i][iMarque]).trim() === '' && String(vals[i][iEmail]).trim() !== '') aTraiter.push(i);
  }
  if (!aTraiter.length) { ui.alert('Aucun candidat « ' + statutCible + ' » en attente d’envoi.'); return; }
  if (ui.alert('Envoyer ' + aTraiter.length + ' ' + libelle + ' ?\n(Quota d’emails restant aujourd’hui : ' + MailApp.getRemainingDailyQuota() + ')', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;

  let ok = 0, ko = 0;
  for (const i of aTraiter) {
    if (MailApp.getRemainingDailyQuota() < 1) { ui.alert('Quota d’emails du jour atteint. Relancez demain : les candidats restants seront traités.'); break; }
    const d = {}; h.forEach((c, j) => d[c] = vals[i][j]);
    try { fonctionEnvoi(d); f.getRange(i + 1, iMarque + 1).setValue(new Date()); ok++; }
    catch (err) { f.getRange(i + 1, iMarque + 1).setValue('ERREUR : ' + String(err).slice(0, 80)); ko++; }
  }
  ui.alert(ok + ' envoyé(s), ' + ko + ' erreur(s).' + (ko ? '\nPour réessayer une erreur, videz la cellule correspondante.' : ''));
}

/** Copie le template, remplace les {{champs}}, exporte en PDF et envoie. */
function genererEtEnvoyerPdf(templateId, nomFichier, champs, mail) {
  const copie = DriveApp.getFileById(templateId).makeCopy(nomFichier);
  try {
    const doc = DocumentApp.openById(copie.getId());
    const corps = doc.getBody();
    Object.keys(champs).forEach(k => corps.replaceText('\\{\\{' + k + '\\}\\}', String(champs[k] || '')));
    doc.saveAndClose();
    mail.attachments = [copie.getAs('application/pdf').setName(nomFichier + '.pdf')];
    mail.name = 'JECI 2026';
    MailApp.sendEmail(mail);
  } finally { copie.setTrashed(true); }
}

function envoyerTicket(d) {
  genererEtEnvoyerPdf(TEMPLATE_DOC_ID, 'Ticket JECI - ' + d.prenom + ' ' + d.nom,
    { prenom: d.prenom, nom: d.nom, participation: d.participation },
    { to: d.email,
      subject: d.prenom + ', votre inscription est confirmée : voici votre ticket JECI 2026',
      body: 'Bonjour ' + d.prenom + ',\n\n' +
        'Suite à votre entretien, nous avons le plaisir de confirmer votre inscription aux Journées de l’Entrepreneur Créatif et Innovant. ' +
        'Votre ticket d’entrée personnel est en pièce jointe (PDF).\n\n' +
        '• Dates : du 10 au 14 novembre 2026\n• Lieu : ' + LIEU + '\n\n' +
        'Présentez votre ticket à l’entrée, imprimé ou sur votre téléphone. Il est personnel et nominatif.\n\n' +
        'À très bientôt,\n\nL’équipe JECI\nJECI 2026 — Créons ensemble.' });
}

function envoyerTicketExposant(d) {
  genererEtEnvoyerPdf(TEMPLATE_EXPOSANT_DOC_ID, 'Ticket exposant JECI - ' + d.entreprise,
    { prenom: d.prenom, nom: d.nom, entreprise: d.entreprise, pole: d.pole },
    { to: d.email,
      subject: d.prenom + ', votre candidature est retenue : ticket exposant JECI 2026',
      body: 'Bonjour ' + d.prenom + ',\n\n' +
        'Nous avons le plaisir de vous annoncer que la candidature de ' + d.entreprise + ' est retenue pour exposer aux Journées de l’Entrepreneur Créatif et Innovant (pôle : ' + d.pole + '). ' +
        'Votre ticket exposant est en pièce jointe (PDF).\n\n' +
        'En tant qu’exposant, vous bénéficiez de :\n' +
        '• l’accès à toutes les interventions ;\n' +
        '• une interview de présentation de votre entreprise, de votre créativité et de votre innovation ;\n' +
        '• votre kakémono sur votre stand ;\n' +
        '• une diffusion sur les canaux JECI pendant l’événement.\n\n' +
        '• Dates : du 10 au 14 novembre 2026\n• Lieu : ' + LIEU + '\n\n' +
        'L’équipe vous contactera pour les modalités d’installation de votre stand.\n\n' +
        'À très bientôt,\n\nL’équipe JECI\nJECI 2026 — Créons ensemble.' });
}

function envoyerRefus(d) {
  MailApp.sendEmail({ to: d.email, name: 'JECI 2026',
    subject: d.prenom + ', suite de votre pré-inscription aux JECI 2026',
    body: 'Bonjour ' + d.prenom + ',\n\nNous vous remercions de l’intérêt porté aux Journées de l’Entrepreneur Créatif et Innovant et du temps consacré à votre pré-inscription.\n\n' +
      'Après étude de votre dossier, nous ne sommes malheureusement pas en mesure de la retenir pour cette 1ère édition. ' +
      'Nous vous encourageons à suivre nos actualités et à renouveler votre démarche lors des prochaines éditions.\n\nBien cordialement,\n\nL’équipe JECI' });
}

function envoyerRefusExposant(d) {
  MailApp.sendEmail({ to: d.email, name: 'JECI 2026',
    subject: d.prenom + ', suite de votre candidature d’exposant aux JECI 2026',
    body: 'Bonjour ' + d.prenom + ',\n\nNous vous remercions de la candidature de ' + d.entreprise + ' à l’appel à exposants des JECI 2026.\n\n' +
      'Le nombre de places étant limité à 3 exposants par pôle, nous ne pouvons malheureusement pas la retenir pour cette 1ère édition. ' +
      'Nous vous invitons à suivre nos actualités et à candidater aux prochaines éditions.\n\nBien cordialement,\n\nL’équipe JECI' });
}

/* ===================== OUTILS ===================== */
function autoriser() { MailApp.getRemainingDailyQuota(); SpreadsheetApp.getActiveSpreadsheet(); DriveApp.getRootFolder(); DocumentApp.openById(TEMPLATE_DOC_ID); }
function doGet() { return sortie({ success: true, message: 'JECI API opérationnelle' }); }
function sortie(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
