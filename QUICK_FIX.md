# 🚨 FIX RAPIDE - Erreur "available24_7 column not found"

## ❌ Erreur actuelle
```
Could not find the 'available24_7' column of 'profiles' in the schema cache
```

## ✅ Solution (2 minutes)

### Étape 1 : Ouvrir le SQL Editor Supabase
Cliquez sur ce lien :
**https://supabase.com/dashboard/project/upfsgpzcvdvtuygwaizd/sql/new**

### Étape 2 : Copier-Coller le SQL
Ouvrez le fichier **`add_columns_quick.sql`** dans VS Code et copiez TOUT son contenu.

### Étape 3 : Exécuter
1. Collez le SQL dans l'éditeur Supabase
2. Cliquez sur le bouton **"Run"** (en haut à droite)
3. Attendez 2-3 secondes

### Étape 4 : Tester
1. Revenez sur votre formulaire d'édition de profil
2. Faites une modification
3. Cliquez sur "Enregistrer"
4. ✅ Ça devrait fonctionner !

---

## 📝 Alternative : Copier-Coller direct

Si vous voulez copier directement le SQL, le voici :

\`\`\`sql
-- Colonnes de base
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS orientation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interested_in JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ethnicity TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nationality TEXT;

-- Apparence physique
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hair_color TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS eye_color TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weight INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bust INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS waist INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hips INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS breast_size TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS breast_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hair_removal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tattoo BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS piercings BOOLEAN DEFAULT false;

-- Langues et disponibilités
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS available24_7 BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS schedule TEXT;

-- Coordonnées
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_whatsapp BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_method TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_contact BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepts_sms BOOLEAN DEFAULT false;

-- Services et catégorie
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS services TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS description TEXT;

-- Déplacement
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS outcall BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS incall BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepts_couples BOOLEAN DEFAULT false;

-- Localisation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'FR';

-- Mensurations
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS measurements TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cup_size TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS body_type TEXT;
\`\`\`

---

## ⚠️ Pourquoi cette erreur ?

Le formulaire essaie de sauvegarder des colonnes qui n'existent pas encore dans la table `profiles` de Supabase. Il faut les ajouter avant de pouvoir les utiliser.

---

## 📞 Besoin d'aide ?

Si ça ne fonctionne toujours pas après avoir exécuté le SQL :
1. Vérifiez qu'il n'y a pas d'erreurs dans le SQL Editor
2. Essayez de rafraîchir la page du formulaire (F5)
3. Vérifiez la console du navigateur pour voir les nouvelles erreurs
