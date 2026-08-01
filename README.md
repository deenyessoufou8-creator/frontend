# Content Rewards Afrique — Frontend

Application React (Vite) connectée à l'API backend. Couvre les 4 espaces :
marketplace, création de campagne (marque), tableau de bord (créateur),
modération (admin).

## Installation

```bash
npm install
cp .env.example .env    # renseigner VITE_API_URL si le backend ne tourne pas sur localhost:4000
npm run dev
```

Le backend doit tourner en parallèle (voir le zip `backend-content-rewards-afrique`).

## Structure

```
src/
  api/client.js           client axios avec injection automatique du JWT
  context/AuthContext.jsx  état d'authentification global (connexion/inscription/déconnexion)
  components/Layout.jsx    barre de navigation, protège les routes (redirige vers /connexion)
  pages/
    Connexion.jsx
    Inscription.jsx
    Marketplace.jsx        liste des campagnes + soumission de contenu (créateur)
    CreerCampagne.jsx       formulaire marque + récap live + dépôt de fonds
    TableauDeBord.jsx       wallet créateur + historique + retrait
    Admin.jsx               review des soumissions en attente
```

## Ce qui reste à faire avant la production

- Remplacer le bouton "Déposer via MTN MoMo (démo)" par une vraie intégration
  de paiement (redirection ou SDK du fournisseur).
- Ajouter une page de gestion des litiges (le back-office backend expose déjà
  la table `litiges`, il manque la route + l'écran).
- Ajouter la pagination sur la marketplace et l'admin si le volume grandit.
- Créer le premier compte admin directement en base (aucune route publique
  ne permet de s'inscrire en tant qu'admin, volontairement).
