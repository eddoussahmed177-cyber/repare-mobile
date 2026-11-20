# TP4 – Améliorer le référencement de Répare Mobile

**Matière :** E-Commerce – AU 2026-2027  
**Projet :** Répare Mobile  
**Date de préparation :** 20 novembre 2026

> Ce compte rendu décrit les fichiers reçus et les corrections appliquées localement. Le déploiement Vercel, les résultats Google Trends et les mesures Lighthouse doivent encore être vérifiés dans les outils en ligne ; aucune valeur n'est inventée.

## 1. Fiche du site

| Information | Réponse |
|---|---|
| Nom du site | Répare Mobile |
| Adresse publique | `https://reparation-mobile.vercel.app/` (adresse mentionnée dans le compte rendu fourni ; disponibilité actuelle à vérifier) |
| Plateforme | Vercel (indiquée dans le compte rendu fourni ; déploiement à confirmer) |
| Technologies utilisées | HTML, CSS, JavaScript, Supabase |
| But et public | Présenter des services de diagnostic et de réparation de smartphones : écran, batterie, connecteur de charge et autres pannes. Le contenu cible notamment les personnes recherchant ce service à Sousse. |

## 2. Audit SEO et corrections

| Élément | Constat sur les fichiers reçus | Correction / état après travail |
|---|---|---|
| Title | Les pages principales possèdent déjà des titres distincts et descriptifs. La page d'accueil cible Sousse. | Titres conservés après vérification : 48 à 54 caractères sur les pages principales. |
| Meta description | Les pages principales possèdent des descriptions distinctes. | Descriptions conservées : 125 à 152 caractères sur les pages principales. |
| H1 | Une seule balise H1 est maintenant présente par fichier HTML. Certains H1 de pages de service étaient trop génériques. | H1 précisés pour l'écran, la batterie, le connecteur de charge et les autres pannes, avec le service et Sousse. |
| H2 et H3 | Les sections utilisent H2 et H3 pour organiser le contenu. | Hiérarchie conservée. Sur `admin.html`, le titre de la zone de demandes est passé en H2 pour éviter deux H1 dans le document. |
| Images | Les images locales examinées ont un texte alternatif descriptif ; aucun `alt` manquant n'a été détecté. | Textes alternatifs conservés. Les images décrivent le sujet représenté. |
| Liens internes | Les liens locaux vers les pages et images référencées ont été vérifiés dans les fichiers. | Aucune cible locale manquante détectée lors du contrôle automatisé. |
| Affichage mobile | La balise viewport est présente sur les pages. | Balise conservée. Un test visuel réel sur mobile / Chrome DevTools reste à effectuer. |
| Indexation | Les pages de connexion, compte, inscription, panier, vérification et administration sont des pages fonctionnelles privées ou utilitaires. | Ajout de `noindex, nofollow` sur ces pages afin de ne pas les proposer dans les résultats de recherche. |
| Code HTML de l'accueil | Deux textes isolés se trouvaient dans le `<head>` et dans le hero. | Texte parasite retiré du `<head>` et phrase du hero placée dans un paragraphe. |

### Quatre améliorations identifiées

1. Préciser les titres H1 des pages de services pour que leur sujet soit immédiatement identifiable.
2. Éviter l'indexation des pages privées et fonctionnelles (connexion, compte, panier, administration, etc.).
3. Supprimer les textes isolés qui ne doivent pas se trouver dans le `<head>` et structurer le texte du hero.
4. Vérifier systématiquement les liens internes et les chemins des images pour éviter les pages ou ressources introuvables.

## 3. Choix des mots-clés

| Mot-clé | Intention de recherche | Page concernée |
|---|---|---|
| Réparation de téléphone à Sousse | Transactionnelle | Accueil (`index.html`) |
| Réparation écran téléphone à Sousse | Transactionnelle | Réparation écran (`reparation-ecran.html`) |
| Réparation batterie téléphone à Sousse | Transactionnelle | Réparation batterie (`reparation-batterie.html`) |

Le mot-clé principal est « réparation de téléphone à Sousse ». Il décrit le service et la zone visée par le site. **La comparaison Google Trends et sa capture d'écran restent à ajouter** : aucune tendance de recherche n'est affirmée sans cette vérification.

## 4. Extraits de code avant / après

### Page d'accueil – balises SEO

**Avant (extrait indiqué dans les notes de TP fournies avec le projet) :**

```html
<title>Répare Mobile — Assistance smartphone</title>
<meta name="description" content="Répare Mobile : exemple de site vitrine pour un service de réparation de téléphones mobiles.">
<h1>Votre téléphone mérite une seconde vie.</h1>
```

**Après (code actuellement présent dans `index.html`) :**

```html
<title>Réparation de téléphone à Sousse | Répare Mobile</title>
<meta name="description"
  content="Répare Mobile à Sousse répare les écrans, batteries et connecteurs de smartphones. Demandez un diagnostic et un devis avant intervention.">
<h1>Réparation de téléphone<br>à <span>Sousse.</span></h1>
```

### Pages de services – exemples de H1 après correction

```html
<!-- reparation-ecran.html -->
<h1>Réparation d’écran de téléphone à Sousse</h1>

<!-- reparation-batterie.html -->
<h1>Réparation de batterie de téléphone à Sousse</h1>

<!-- reparation-charge.html -->
<h1>Réparation du connecteur de charge à Sousse</h1>

<!-- autres-pannes.html -->
<h1>Diagnostic des autres pannes de téléphone à Sousse</h1>
```

### Pages privées / fonctionnelles

La directive ajoutée dans leur `<head>` :

```html
<meta name="robots" content="noindex, nofollow">
```

Elle est appliquée à `admin.html`, `connexion.html`, `inscription.html`, `mon-compte.html`, `nouveau-mot-de-passe.html`, `panier.html` et `verification.html`.

## 5. Vérifications techniques

| Contrôle | Résultat |
|---|---|
| Un H1 par page HTML | Vérifié localement : 1 H1 sur chacun des 15 fichiers HTML. |
| Attribut alt des images | Vérifié localement : aucun attribut alt manquant parmi les images examinées. |
| Liens et images locaux | Vérification des chemins locaux : aucune cible manquante détectée. |
| Balise viewport | Présente sur les 15 pages HTML. |
| Code HTTP en ligne | À vérifier après déploiement ; non mesuré depuis cette archive locale. |
| Lighthouse Mobile – Performance | À mesurer dans Chrome après déploiement. |
| Lighthouse Mobile – Accessibilité | À mesurer dans Chrome après déploiement. |
| Lighthouse Mobile – Bonnes pratiques | À mesurer dans Chrome après déploiement. |
| Lighthouse Mobile – SEO | À mesurer dans Chrome après déploiement. |

### Tableau Lighthouse à compléter

| Lighthouse (mobile) | Avant | Après | Écart |
|---|---:|---:|---:|
| Performance | À mesurer | À mesurer | À mesurer |
| Accessibilité | À mesurer | À mesurer | À mesurer |
| Bonnes pratiques | À mesurer | À mesurer | À mesurer |
| SEO | À mesurer | À mesurer | À mesurer |

Effectuer les deux mesures dans les mêmes conditions (Chrome, navigation privée, mode Mobile, extensions désactivées). Ajouter les captures d'écran au compte rendu.

## 6. Publication des modifications

Après avoir copié les fichiers corrigés dans le dépôt GitHub du projet, exécuter dans le terminal :

```bash
git add .
git commit -m "SEO : amélioration des titres et indexation"
git push
```

Attendre la fin du déploiement Vercel, puis ouvrir le site public et recharger sans cache (`Ctrl + Maj + R`). Vérifier le code source (`Ctrl + U`), les liens et les images. Les corrections présentes dans le dossier local ne sont pas automatiquement publiées.

## 7. Conclusion

Les pages principales de Répare Mobile disposent de titres et descriptions distincts orientés vers les services à Sousse. Les H1 des pages de services ont été rendus plus explicites, les pages privées ont reçu une directive `noindex`, et le code de la page d'accueil a été nettoyé. Les contrôles locaux des H1, des attributs alt et des liens locaux sont satisfaisants. Pour finaliser le TP, il reste à publier les changements, réaliser la capture Google Trends et relever les quatre scores Lighthouse avant/après dans des conditions identiques.
