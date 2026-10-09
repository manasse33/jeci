# JECI 2026 — Site événementiel
HTML5 + Tailwind (CDN) + JavaScript vanilla. Ouvrir `index.html` (ou servir le dossier : `python3 -m http.server`).

## Mise en route des inscriptions
1. Créer un Google Sheet → Extensions > Apps Script → coller `apps-script/Code.gs`.
2. Déployer > Application Web (exécuter : moi ; accès : tout le monde).
3. Coller l'URL `/exec` dans `js/inscription.js` (`APPS_SCRIPT_URL`).

## À personnaliser
- Email / téléphone / réseaux : haut de `js/main.js` (objet `SITE`).
- Programme, intervenants, actualités : `programme.html`, `intervenants.html`, `actualites.html`.
- Photos des intervenants : remplacer les images par des fichiers dans `assets/images/`.
