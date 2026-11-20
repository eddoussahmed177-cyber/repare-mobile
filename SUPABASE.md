# TP Supabase et Vercel — Répare Mobile

Cette réalisation reprend les parties pertinentes du TP pour un atelier de réparation : les services remplacent les produits, le panier de réparations remplace le panier d’achat et une demande remplace une commande. Il n’y a pas de paiement en ligne ni de vente de téléphones. Les tarifs sont des estimations, confirmées par l’atelier après diagnostic.

## Ce qui est déjà préparé

- Création de compte, confirmation d’adresse email, connexion et déconnexion avec Supabase Auth.
- Catalogue `repair_services` administrable dans `admin.html`, avec marque, modèle, réparation, prix indicatif ou prix à confirmer.
- Catalogue visible publiquement en lecture seule; seuls les comptes portant le rôle admin peuvent le modifier.
- Panier conservé dans le navigateur et demandes enregistrées dans `repair_requests`.
- Historique client limité aux demandes de son propre compte; l’atelier peut consulter les demandes et changer leur statut.
- La base recalcule les prix à partir du catalogue actif. Les tarifs transmis par le navigateur ne sont pas considérés comme fiables.
- Création d’une demande idempotente par compte et identifiant de tentative, afin d’éviter un doublon lors d’une nouvelle tentative réseau.
- Clé Publishable uniquement dans le navigateur; les clés secrètes restent hors du site.

## Configuration Supabase à faire

1. Créez un projet Supabase, puis ouvrez **Project Settings → API**. Copiez son URL et sa clé **Publishable** (ou la clé `anon` historique).
2. L’URL du projet et la clé **Publishable** sont déjà configurées dans `supabase-client.js`. N’insérez jamais une clé `secret` ou `service_role` dans le site.
3. Dans **SQL Editor**, exécutez la version actuelle de `supabase-setup.sql`. Elle crée le catalogue `repair_services`, ses règles RLS et la fonction admin nécessaire.
4. Dans une nouvelle requête SQL, exécutez ensuite `supabase-orders.sql`. Ce fichier crée/configure les demandes `repair_requests`, les règles RLS et la fonction sécurisée qui enregistre une demande. Il peut être relancé sans effacer les comptes ni les demandes.
5. Exécutez `supabase-seed.sql` pour ajouter des exemples de téléphones et de tarifs. Le fichier crée aussi `repair_services` si cette table manque. Les prix sont indicatifs et le fichier peut être relancé sans écraser les services déjà présents ou les prix modifiés.
6. Inscrivez votre compte admin dans le site, confirmez son email, puis copiez son UUID depuis **Authentication → Users**.
7. Remplacez `VOTRE-UUID` dans `supabase-admin.sql` et exécutez ce fichier dans **SQL Editor**.
8. Connectez-vous avec ce compte et ouvrez `admin.html`. Vous pourrez ajouter, modifier ou supprimer des exemples de services et gérer les demandes. Vérifiez tous les prix proposés avant de les afficher à vos clients.
9. Dans **Authentication → URL Configuration**, gardez votre Site URL locale et autorisez les redirections de confirmation et de récupération : `http://localhost:8000/verification.html`, `http://localhost:8000/nouveau-mot-de-passe.html` et `https://reparation-mobile.vercel.app/nouveau-mot-de-passe.html`.

## Emails de confirmation (SMTP)

Pour que Supabase envoie les confirmations de compte à vos clients, configurez un fournisseur SMTP dans **Supabase → Project Settings → Authentication → SMTP Settings** : activez le SMTP personnalisé et indiquez l’hôte, le port, l’identifiant, le mot de passe et l’adresse expéditeur fournis par votre service (Zoho Mail, par exemple). Vérifiez le domaine expéditeur et testez la confirmation d’un nouveau compte.

Les identifiants SMTP sont des secrets : saisissez-les uniquement dans les réglages protégés de Supabase; ne les ajoutez jamais à `supabase-client.js`, au dépôt ou à ce guide. Cette configuration exige les identifiants et la validation du domaine du propriétaire, que le projet ne contient pas. FormSubmit reste un service séparé utilisé pour les demandes envoyées à l’atelier.

`repair_requests` est l’équivalent adapté de `orders` pour les demandes de réparation. Le fichier `supabase-orders.sql` configure cette table et son enregistrement sécurisé; aucune table de vente ni aucun paiement en ligne ne sont créés.

`supabase-seed.sql` crée le catalogue s’il manque puis le remplit avec des exemples de modèles et de prix en DT. Il s’appuie sur `user_roles` pour les règles d’administration, donc exécutez d’abord le setup si cette table manque. Les montants doivent être validés par l’atelier et confirmés après diagnostic. Le fichier seed n’ajoute pas de compte admin : celui-ci doit être créé avec le véritable UUID d’un compte présent dans **Authentication → Users**.

## Mot de passe oublié

Depuis `connexion.html`, saisissez votre email puis cliquez sur **Mot de passe oublié ?**. Supabase envoie un lien vers `nouveau-mot-de-passe.html`; l’utilisateur choisit alors un nouveau mot de passe (8 caractères minimum). Cette adresse doit figurer dans la liste **Redirect URLs**. L’envoi peut être bloqué par la limite email du projet ou nécessiter un SMTP personnalisé.

## Vérifications demandées par le TP

Ouvrez le site avec un serveur local (pas directement par `file://`) après avoir configuré Supabase.

1. Inscrivez deux comptes différents, confirmez les adresses email et connectez-vous.
2. Avec le compte A, ajoutez une réparation au panier et envoyez une demande. Notez sa référence.
3. Vérifiez que le compte A voit la demande dans **Mon compte**, et que le compte B ne la voit pas.
4. Connectez-vous avec le compte admin : la demande doit être visible et son statut modifiable.
5. Ajoutez ou modifiez un service dans le catalogue admin et vérifiez que le tarif de la carte correspondante sur `reparations.html` change.
6. Vérifiez dans Supabase que RLS est activé et que la demande conserve le compte propriétaire.
7. Le formulaire email atelier FormSubmit peut nécessiter une première confirmation de l’adresse destinataire. Cette confirmation est distincte de l’enregistrement Supabase.

L’URL et la clé du projet sont déjà configurées. Après avoir exécuté `supabase-setup.sql`, `supabase-orders.sql` et `supabase-seed.sql`, testez le compte, le catalogue de services et l’envoi d’une demande. La livraison des emails de confirmation dépend aussi de la configuration email de Supabase.

## Publication Vercel

1. Pour un premier déploiement, téléversez le dossier complet (avec `index.html`, `images/` et `audio/`) ou son ZIP sur Vercel Drop. Pour des mises à jour automatiques, reliez plutôt un dépôt Git personnel.
2. Le projet est statique en HTML/CSS/JavaScript : aucune commande de build n’est nécessaire.
3. Après le déploiement, ajoutez l’adresse HTTPS Vercel dans **Supabase → Authentication → URL Configuration** comme **Site URL** et URL de redirection autorisée.
4. Reprenez les vérifications ci-dessus sur l’adresse HTTPS finale.
