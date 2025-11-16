# 🚀 Guide de Déploiement

Ce guide vous explique comment mettre votre site en ligne sur Vercel.

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir :

1. Un compte GitHub (pour héberger votre code)
2. Un compte Vercel (gratuit)
3. Un projet Supabase configuré
4. Les colonnes de base de données ajoutées (arrondissement, video_url)

## 🔍 Étape 1 : Vérification Pré-Déploiement

Exécutez le script de vérification pour vous assurer que tout est prêt :

```bash
node scripts/pre-deploy-check.mjs
```

Si des erreurs apparaissent, corrigez-les avant de continuer.

## 📤 Étape 2 : Pousser le Code sur GitHub

Si vous n'avez pas encore de dépôt Git :

```bash
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - Ready for deployment"

# Créer un dépôt sur GitHub et le lier
git remote add origin https://github.com/VOTRE-USERNAME/VOTRE-REPO.git
git branch -M main
git push -u origin main
```

## 🌐 Étape 3 : Déployer sur Vercel

### 3.1 Créer un compte Vercel

1. Allez sur https://vercel.com/signup
2. Inscrivez-vous avec votre compte GitHub

### 3.2 Importer votre projet

1. Cliquez sur "Add New..." > "Project"
2. Sélectionnez votre repository GitHub
3. Vercel détectera automatiquement que c'est un projet Next.js

### 3.3 Configurer les variables d'environnement

Dans les paramètres du projet, ajoutez ces variables :

```
NEXT_PUBLIC_SUPABASE_URL=https://upfsgpzcvdvtuygwaizd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjUxMDksImV4cCI6MjA3ODU0MTEwOX0.4mnnD7pEG0mXmxCMdnnJMV0RocP8d7UIfxWFQu9Jwy0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk2NTEwOSwiZXhwIjoyMDc4NTQxMTA5fQ.QzeSZvbBIz-kL85FM_CoVTTQ6fRRtPl6GSGq4WqrZpU
```

### 3.4 Déployer

1. Cliquez sur "Deploy"
2. Attendez la fin du build (2-5 minutes)
3. Votre site sera accessible sur `https://votre-projet.vercel.app`

## ⚙️ Étape 4 : Configuration Supabase

### 4.1 Ajouter les URL autorisées

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans "Authentication" > "URL Configuration"
4. Ajoutez ces URLs :

**Site URL:**
```
https://votre-projet.vercel.app
```

**Redirect URLs:**
```
https://votre-projet.vercel.app/**
https://votre-projet.vercel.app/auth/callback
```

### 4.2 Configurer le Storage CORS

1. Allez dans "Storage" > "Configuration"
2. Ajoutez votre domaine Vercel dans les origines autorisées

## 🌍 Étape 5 : Domaine Personnalisé (Optionnel)

### Acheter un domaine

Achetez un nom de domaine sur :
- OVH (https://www.ovh.com)
- Namecheap (https://www.namecheap.com)
- GoDaddy (https://www.godaddy.com)

### Configurer le domaine sur Vercel

1. Dans Vercel, allez dans "Settings" > "Domains"
2. Cliquez sur "Add"
3. Entrez votre domaine (ex: `monsite.com`)
4. Suivez les instructions pour configurer les DNS

**Configuration DNS typique:**

Type | Nom | Valeur
-----|-----|-------
A | @ | 76.76.21.21
CNAME | www | cname.vercel-dns.com

### Mettre à jour Supabase

N'oubliez pas d'ajouter votre domaine personnalisé dans les URL autorisées de Supabase.

## 🔒 Étape 6 : Sécurité

### Vérifier les RLS (Row Level Security)

Assurez-vous que les politiques de sécurité sont activées sur toutes vos tables Supabase :

- `ads` : Lecture publique, modification par le propriétaire uniquement
- `profiles` : Lecture publique, modification par l'utilisateur uniquement
- `favorites` : Accès uniquement par l'utilisateur propriétaire
- `messages` : Accès uniquement par l'expéditeur et le destinataire

### Variables sensibles

**IMPORTANT:** Ne commitez JAMAIS le fichier `.env.local` sur Git !

Vérifiez que `.gitignore` contient :
```
.env.local
.env*.local
```

## 📊 Étape 7 : Monitoring

### Analytics Vercel

1. Dans votre projet Vercel, allez dans "Analytics"
2. Activez les analytics pour voir le trafic en temps réel

### Logs

Pour voir les logs de votre application :
1. Allez dans "Deployments"
2. Sélectionnez un déploiement
3. Cliquez sur "View Function Logs"

## 🔄 Déploiements Automatiques

Vercel déploie automatiquement à chaque push sur la branche `main` :

```bash
# Faire des modifications
git add .
git commit -m "Description des changements"
git push

# Vercel déploiera automatiquement
```

### Branches de prévisualisation

Créez une branche pour tester avant de déployer en production :

```bash
git checkout -b nouvelle-fonctionnalite
# Faire vos modifications
git push origin nouvelle-fonctionnalite
```

Vercel créera automatiquement une URL de prévisualisation.

## 🛠️ Dépannage

### Erreur de build

Si le build échoue :
1. Vérifiez les logs dans Vercel
2. Assurez-vous que le build fonctionne localement : `npm run build`
3. Vérifiez que toutes les dépendances sont dans `package.json`

### Erreur de connexion Supabase

Si l'app ne se connecte pas à Supabase :
1. Vérifiez que les variables d'environnement sont bien configurées
2. Vérifiez que les URL sont autorisées dans Supabase
3. Vérifiez les politiques RLS

### Images ne s'affichent pas

Si les images du Storage ne s'affichent pas :
1. Vérifiez la configuration CORS dans Supabase
2. Vérifiez que les buckets sont publics (si nécessaire)

## 📱 Tester le Déploiement

Après le déploiement, testez :

- ✅ Page d'accueil charge correctement
- ✅ Connexion / Inscription fonctionne
- ✅ Création d'annonce fonctionne
- ✅ Upload de photos fonctionne
- ✅ Upload de vidéo fonctionne
- ✅ Recherche fonctionne
- ✅ Favoris fonctionnent
- ✅ Messages fonctionnent
- ✅ Affichage de l'arrondissement fonctionne

## 🎉 C'est en ligne !

Votre site est maintenant accessible à l'adresse :
```
https://votre-projet.vercel.app
```

Partagez le lien et commencez à recevoir des utilisateurs !

## 📧 Support

En cas de problème :
- Vercel : https://vercel.com/support
- Supabase : https://supabase.com/support
- Next.js : https://nextjs.org/docs
