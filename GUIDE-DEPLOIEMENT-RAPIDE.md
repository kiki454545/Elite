# 🚀 Guide de Déploiement Rapide (5 minutes)

## ✅ Vérification Préalable

Lancez cette commande pour vérifier que tout est prêt :

```bash
npm run deploy:check
```

Si vous voyez "✅ ✅ ✅ TOUT EST PRÊT POUR LE DÉPLOIEMENT !", vous pouvez continuer.

---

## 📤 Étape 1 : GitHub (2 minutes)

### Si vous n'avez pas encore de compte GitHub :
1. Créez un compte sur https://github.com/signup

### Créer un dépôt et y pousser le code :

```bash
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit"

# Créer un nouveau dépôt sur GitHub (https://github.com/new)
# Puis lier votre projet :
git remote add origin https://github.com/VOTRE-USERNAME/VOTRE-REPO.git
git branch -M main
git push -u origin main
```

**Alternative simple :**
Utilisez GitHub Desktop (https://desktop.github.com/) pour faire tout ça en cliquant.

---

## 🌐 Étape 2 : Vercel (3 minutes)

### 1. Créer un compte Vercel
- Allez sur https://vercel.com/signup
- Choisissez "Continue with GitHub"

### 2. Importer votre projet
- Cliquez sur "Add New..." → "Project"
- Sélectionnez votre repository GitHub
- Cliquez sur "Import"

### 3. Configurer les variables d'environnement

Avant de déployer, cliquez sur "Environment Variables" et ajoutez ces 3 variables :

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://upfsgpzcvdvtuygwaizd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjUxMDksImV4cCI6MjA3ODU0MTEwOX0.4mnnD7pEG0mXmxCMdnnJMV0RocP8d7UIfxWFQu9Jwy0` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZnNncHpjdmR2dHV5Z3dhaXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk2NTEwOSwiZXhwIjoyMDc4NTQxMTA5fQ.QzeSZvbBIz-kL85FM_CoVTTQ6fRRtPl6GSGq4WqrZpU` |

### 4. Déployer
- Cliquez sur "Deploy"
- Attendez 2-3 minutes
- 🎉 Votre site est en ligne !

Vous recevrez une URL comme : `https://votre-projet.vercel.app`

---

## ⚙️ Étape 3 : Configuration Supabase (1 minute)

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans "Authentication" → "URL Configuration"
4. Ajoutez votre URL Vercel :

**Site URL :**
```
https://votre-projet.vercel.app
```

**Redirect URLs :** (cliquez sur "Add URL" pour chacune)
```
https://votre-projet.vercel.app/**
https://votre-projet.vercel.app/auth/callback
```

5. Cliquez sur "Save"

---

## 🎉 C'est terminé !

Votre site est maintenant en ligne et accessible à l'adresse :
```
https://votre-projet.vercel.app
```

---

## 🔄 Mettre à jour le site

À chaque fois que vous faites des modifications :

```bash
git add .
git commit -m "Description de vos changements"
git push
```

Vercel va **automatiquement** redéployer votre site en 2-3 minutes !

---

## 🌍 Ajouter un Domaine Personnalisé (Optionnel)

### Acheter un domaine
Achetez un nom de domaine sur :
- **OVH** : https://www.ovh.com/fr/ (recommandé en France)
- **Namecheap** : https://www.namecheap.com
- **GoDaddy** : https://www.godaddy.com

Prix : environ 10-15€/an pour un .com ou .fr

### Configurer le domaine sur Vercel

1. Dans votre projet Vercel, allez dans "Settings" → "Domains"
2. Cliquez sur "Add"
3. Entrez votre domaine (ex: `monsite.com`)
4. Vercel vous donnera des instructions DNS à configurer

### Configuration DNS chez votre registrar

Ajoutez ces enregistrements DNS :

| Type | Nom | Valeur |
|------|-----|--------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

**Temps de propagation :** 5 minutes à 48 heures (généralement ~1 heure)

### Mettre à jour Supabase

N'oubliez pas d'ajouter votre nouveau domaine dans les URL autorisées de Supabase :
```
https://monsite.com
https://monsite.com/**
https://www.monsite.com
```

---

## 🐛 Problèmes Fréquents

### Le build échoue sur Vercel
- Vérifiez les logs d'erreur dans l'interface Vercel
- Assurez-vous que `npm run build` fonctionne en local

### La connexion Supabase ne fonctionne pas
- Vérifiez que les 3 variables d'environnement sont bien configurées dans Vercel
- Vérifiez que votre URL Vercel est autorisée dans Supabase

### Les images ne s'affichent pas
- Vérifiez que les buckets Supabase Storage sont publics
- Vérifiez la configuration CORS dans Supabase

---

## 📊 Suivre le Trafic

Dans Vercel, vous pouvez :
- Voir le nombre de visiteurs dans "Analytics"
- Voir les erreurs dans "Logs"
- Voir les performances dans "Speed Insights"

---

## 🆘 Besoin d'Aide ?

- **Guide complet** : Consultez [DEPLOIEMENT.md](./DEPLOIEMENT.md)
- **Documentation Vercel** : https://vercel.com/docs
- **Documentation Supabase** : https://supabase.com/docs
- **Documentation Next.js** : https://nextjs.org/docs

---

## 🎯 Checklist Finale

Avant de partager votre site :

- [ ] Le site est accessible sur votre URL Vercel
- [ ] Vous pouvez vous inscrire/connecter
- [ ] Vous pouvez créer une annonce
- [ ] Vous pouvez uploader des photos
- [ ] La recherche fonctionne
- [ ] Les favoris fonctionnent
- [ ] L'arrondissement s'affiche (si Paris)
- [ ] Les vidéos s'uploadent correctement

Si tous les points sont cochés : **Bravo ! Votre site est prêt ! 🎉**
