# TODO — Nexus bugfix + UI refondre

## Bug backend / persist affichage recruteur
- [ ] Vérifier la cause : GET `/api/jobs` renvoie des offres mais filtrées par `recruiter_user_id` (nouveau code ajouté récemment) OU données non persistées.
- [ ] Ajouter persistance : éviter “effacement” à l’exécution (ne pas réinitialiser la DB destructivement au démarrage).
- [ ] Confirmer que les offres recruteur publiées persistent et s’affichent après refresh et après redémarrage.

## Refondre la page d’accueil Nexus (Modern Tech & Depth)
- [ ] Mettre à jour `frontend/src/pages/Dashboard.jsx` : nouvelle Top Bar + structure 3 cartes verticales.
- [ ] Mettre à jour `frontend/src/pages/Dashboard.css` : thème sombre + glassmorphism + accents.
- [ ] Mettre à jour `frontend/src/data/modules.js` : remplacer `—` par valeurs factuelles (ex: “140+ OFFRES ACTIVES”).
- [ ] Construire et tester (`npm --prefix frontend run build`).

