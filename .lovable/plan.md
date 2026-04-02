

# Plan: Landing Page Nova

## Objectif
Créer une landing page publique qui s'affiche quand l'utilisateur n'est pas connecté, avec deux boutons (Sign in / Log in) qui ouvrent le dialogue d'authentification existant.

## Approche
Au lieu de montrer directement le `AuthDialog` quand `user` est null, afficher une landing page dédiée avec le branding Nova.

## Modifications

### 1. Créer `src/pages/Landing.tsx`
Page marketing Nova avec :
- Header avec logo Devoteam/Nova
- Hero section : titre accrocheur, description de la valeur Nova
- Deux boutons CTA : **Sign in** (connexion) et **Sign up** (inscription) qui ouvrent le `AuthDialog` avec l'onglet correspondant
- Section features rapide (3-4 points clés de Nova)
- Footer léger
- Design cohérent avec le thème Nova (couleurs primary, fond sombre)

### 2. Modifier `src/components/AuthDialog.tsx`
- Ajouter une prop `defaultTab` pour pouvoir pré-sélectionner l'onglet signin ou signup depuis la landing page

### 3. Modifier `src/pages/Index.tsx`
- Quand `!user && !loading` : afficher `<Landing />` au lieu de montrer le `AuthDialog` directement
- Supprimer le `useEffect` qui fait `setShowAuth(true)` quand pas d'utilisateur
- Passer les callbacks d'auth à la landing page

### 4. Mettre à jour `src/App.tsx`
- Ajouter route `/landing` optionnelle ou gérer le tout dans Index.tsx (approche inline préférée pour simplicité)

## Design Landing
- Fond avec gradient subtil (noir/bleu foncé Nova)
- Logo Devoteam en haut
- Titre : "Nova — L'environnement de travail augmenté par l'IA"
- Sous-titre expliquant la valeur PM
- Cards features : Sprint Intelligence, Impact Analysis, Discovery, etc.
- Boutons Sign in (outline) et Sign up (primary) bien visibles

