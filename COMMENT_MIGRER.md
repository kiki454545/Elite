# 🚀 Guide de Migration - Recherche Avancée

## ⚠️ Méthode Simplifiée (RECOMMANDÉE)

Puisque vous utilisez **Supabase**, la migration doit être faite via l'interface web.

---

## 📋 Étapes à suivre (5 minutes)

### 1️⃣ Ouvrir le SQL Editor de Supabase

Cliquez sur ce lien pour ouvrir directement l'éditeur SQL :

👉 **https://supabase.com/dashboard/project/upfsgpzcvdvtuygwaizd/sql/new**

(Si le lien ne fonctionne pas : Supabase Dashboard → votre projet → SQL Editor)

---

### 2️⃣ Copier le SQL

Ouvrez le fichier : **`scripts/migration.sql`**

Copiez TOUT son contenu et collez-le dans l'éditeur Supabase.

---

### 3️⃣ Exécuter dans Supabase

1. Collez le SQL dans l'éditeur Supabase
2. Cliquez sur **"Run"** (bouton en bas à droite)
3. Attendez quelques secondes

**Résultat attendu :**
- ✅ "Success. No rows returned"

*Note : Les messages "column already exists" sont normaux si vous avez déjà des colonnes.*

---

### 4️⃣ Activer la nouvelle page de recherche

**Dans PowerShell ou CMD :**

```bash
Move-Item src\app\search\page.tsx src\app\search\page-old.tsx
Move-Item src\app\search\page-v2.tsx src\app\search\page.tsx
```

**OU créer une route de test :**

- Créer le dossier `src\app\search-v2\`
- Créer `src\app\search-v2\page.tsx`
- Copier le contenu de `src\app\search\page-v2.tsx`

---

### 5️⃣ Lancer le site

```bash
npm run dev
```

Puis ouvrir : **http://localhost:3000/search** (ou `/search-v2`)

---

## 📞 Résumé Ultra-Rapide

```
1. https://supabase.com/dashboard → SQL Editor
2. Copier scripts/migration.sql
3. Coller et cliquer "Run"
4. Move-Item src\app\search\page-v2.tsx src\app\search\page.tsx
5. npm run dev
6. http://localhost:3000/search
```

**C'est tout ! 🎉**
