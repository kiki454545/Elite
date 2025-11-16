# SexElite - Plateforme d'Annonces Premium

Plateforme moderne d'annonces avec système de profils, favoris, messagerie et gestion d'annonces.

## 🚀 Démarrage Rapide

### Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le site sera accessible sur http://localhost:3000

### Configuration

1. Créez un fichier `.env.local` à la racine du projet
2. Ajoutez vos variables d'environnement Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=votre-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
SUPABASE_SERVICE_ROLE_KEY=votre-cle-service-role
```

## 📦 Scripts Disponibles

- `npm run dev` - Lancer le serveur de développement
- `npm run build` - Compiler l'application pour la production
- `npm run start` - Lancer l'application compilée
- `npm run lint` - Vérifier le code avec ESLint
- `npm run deploy:check` - Vérifier que tout est prêt pour le déploiement

## 🌐 Déploiement

Pour mettre le site en ligne, consultez le guide complet : [DEPLOIEMENT.md](./DEPLOIEMENT.md)

**Résumé rapide :**

1. Vérifiez que tout est prêt : `npm run deploy:check`
2. Poussez votre code sur GitHub
3. Importez le projet sur [Vercel](https://vercel.com)
4. Configurez les variables d'environnement
5. Déployez !

## 🛠️ Technologies Utilisées

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Framer Motion** - Animations fluides
- **Supabase** - Backend (BaaS)
  - PostgreSQL Database
  - Authentication
  - Storage
  - Real-time subscriptions
- **Lucide React** - Icônes

## 📋 Fonctionnalités

### Utilisateurs
- ✅ Inscription / Connexion
- ✅ Profils personnalisables
- ✅ Avatar et photos de profil
- ✅ Vérification de profil
- ✅ Système de rangs (Standard, Plus, VIP, Elite)

### Annonces
- ✅ Création d'annonces avec photos (max 5)
- ✅ Upload de vidéo (30 secondes max)
- ✅ Localisation par pays et ville
- ✅ Support des arrondissements (Paris)
- ✅ Catégories multiples
- ✅ Prix et disponibilités
- ✅ Statut en ligne/hors ligne
- ✅ Badge de vérification

### Recherche & Filtres
- ✅ Recherche par pays
- ✅ Filtrage par ville
- ✅ Filtrage par catégorie
- ✅ Tri par pertinence/date/popularité

### Interactions
- ✅ Système de favoris
- ✅ Compteur de vues
- ✅ Messagerie privée
- ✅ Notifications en temps réel

### Sécurité
- ✅ Row Level Security (RLS)
- ✅ Validation des uploads
- ✅ Protection contre les injections SQL
- ✅ Authentification sécurisée

## 🗂️ Structure du Projet

```
site-modern/
├── src/
│   ├── app/                  # Pages Next.js (App Router)
│   │   ├── ads/             # Pages des annonces
│   │   ├── auth/            # Authentification
│   │   ├── create/          # Création d'annonce
│   │   ├── favorites/       # Favoris
│   │   ├── messages/        # Messagerie
│   │   ├── profile/         # Profil utilisateur
│   │   └── search/          # Recherche
│   ├── components/          # Composants réutilisables
│   ├── contexts/            # Contextes React
│   ├── hooks/              # Hooks personnalisés
│   ├── lib/                # Utilitaires et config
│   └── types/              # Types TypeScript
├── scripts/                # Scripts de maintenance
├── public/                 # Fichiers statiques
├── .env.local             # Variables d'environnement (ne pas commit)
├── DEPLOIEMENT.md         # Guide de déploiement
└── package.json           # Dépendances
```

## 📝 Scripts de Migration

### Ajouter les colonnes manquantes

Si vous avez des erreurs de colonnes manquantes :

```bash
node scripts/add_missing_columns.mjs
```

Puis exécutez le SQL généré dans votre dashboard Supabase.

### Créer une annonce de démonstration

```bash
node scripts/create_demo_ad.mjs
```

## 🔧 Configuration Supabase

### Tables Requises

- `profiles` - Profils utilisateurs
- `ads` - Annonces
- `favorites` - Favoris
- `messages` - Messages privés
- `french_cities` - Villes françaises avec coordonnées GPS
- `message_reports` - Signalements de messages
- `user_warnings` - Avertissements utilisateurs
- `blocked_users` - Utilisateurs bloqués

### Storage Buckets

- `avatars` - Photos de profil
- `ad-photos` - Photos des annonces
- `ad-videos` - Vidéos des annonces
- `verification-photos` - Photos de vérification d'identité

### Functions SQL

- `increment_views(ad_id)` - Incrémenter les vues
- `increment_favorites(ad_id)` - Incrémenter les favoris
- `decrement_favorites(ad_id)` - Décrémenter les favoris

## 🐛 Dépannage

### L'application ne se connecte pas à Supabase

1. Vérifiez vos variables d'environnement dans `.env.local`
2. Vérifiez que votre projet Supabase est actif
3. Vérifiez les politiques RLS dans Supabase

### Les uploads ne fonctionnent pas

1. Vérifiez que les buckets existent dans Supabase Storage
2. Vérifiez les permissions des buckets (publics ou privés)
3. Vérifiez la taille maximale des fichiers

### Erreur de colonne manquante

Exécutez le script de migration :
```bash
node scripts/add_missing_columns.mjs
```

## 📞 Support

Pour toute question ou problème :
- Consultez le guide de déploiement : [DEPLOIEMENT.md](./DEPLOIEMENT.md)
- Vérifiez les logs Vercel en cas de problème de déploiement
- Vérifiez les logs Supabase pour les erreurs de base de données

## 📄 Licence

Ce projet est privé et propriétaire.
