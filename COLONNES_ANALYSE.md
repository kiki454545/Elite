# 📊 Analyse complète des colonnes de la table profiles

## ✅ Résultat de l'analyse

Après vérification approfondie, il y a **SEULEMENT 2 vrais doublons** :

### 🔴 Vrais doublons (à supprimer)

| ❌ À supprimer | ✅ À conserver | Type | Utilisation dans le code |
|---------------|----------------|------|--------------------------|
| `phone` | `phone_number` | TEXT | ✅ Utilisé (ligne 119, 182) |
| `whatsapp` | `has_whatsapp` | BOOLEAN | ✅ Utilisé (ligne 120, 183) |

### ✅ PAS des doublons (à garder toutes les deux)

| Colonne | Type | Rôle | Utilisation |
|---------|------|------|-------------|
| `email_contact` | BOOLEAN | "Accepte d'être contacté par email" (oui/non) | ⚠️ Défini dans types mais pas utilisé |
| `contact_email` | TEXT | "Adresse email de contact" (texte) | ✅ Utilisé (ligne 121, 184) |

**Explication** : Ces deux colonnes ont des rôles DIFFÉRENTS et complémentaires :
- `email_contact` = Une checkbox pour dire "oui j'accepte qu'on me contacte par email"
- `contact_email` = Le champ texte pour entrer l'adresse email

C'est comme avoir `has_phone` (booléen) et `phone_number` (texte).

## 🚀 Script SQL corrigé

Exécutez ce SQL pour nettoyer UNIQUEMENT les vrais doublons :

```sql
-- Fusionner phone_number et phone
UPDATE profiles
SET phone_number = COALESCE(phone_number, phone)
WHERE phone_number IS NULL AND phone IS NOT NULL;

-- Fusionner has_whatsapp et whatsapp
UPDATE profiles
SET has_whatsapp = COALESCE(has_whatsapp, whatsapp)
WHERE has_whatsapp IS NULL AND whatsapp IS NOT NULL;

-- Supprimer les doublons
ALTER TABLE profiles DROP COLUMN IF EXISTS phone;
ALTER TABLE profiles DROP COLUMN IF EXISTS whatsapp;
```

## 📋 Liste complète des colonnes (après nettoyage)

### Informations de base
- `id`, `username`, `email`, `age`
- `verified`, `rank`, `avatar_url`, `bio`
- `created_at`, `updated_at`

### Genre et orientation
- `gender`, `orientation`, `interested_in`

### Origine
- `ethnicity`, `nationality`

### Apparence physique
- `hair_color`, `eye_color`
- `height`, `weight`
- `bust`, `waist`, `hips`, `measurements`, `cup_size`, `breast_size`, `breast_type`
- `body_type`, `tattoos`, `piercings`, `hair_removal`

### Coordonnées
- ✅ `phone_number` (TEXT) - Numéro de téléphone
- ✅ `has_whatsapp` (BOOLEAN) - Possède WhatsApp
- `telegram` (BOOLEAN) - Possède Telegram
- `accepts_sms` (BOOLEAN) - Accepte les SMS
- ✅ `contact_email` (TEXT) - Adresse email de contact
- ✅ `email_contact` (BOOLEAN) - Accepte les contacts par email
- `contact_method` (TEXT) - Méthode de contact préférée

### Disponibilités
- `languages` (TEXT[]) - Langues parlées
- `availability` (JSONB) - Horaires détaillés
- `available24_7` (BOOLEAN) - Disponible 24/7
- `schedule` (TEXT) - Horaires en texte
- `outcall` (BOOLEAN) - Se déplace
- `incall` (BOOLEAN) - Reçoit

### Services
- `services` (TEXT[]) - Services proposés
- `category` (TEXT) - Catégorie principale
- `description` (TEXT) - Description
- `accepts_couples` (BOOLEAN) - Accepte les couples

### Localisation
- `location` (TEXT) - Ville
- `country` (TEXT) - Code pays

## 🔧 À faire (optionnel)

Le formulaire d'édition de profil n'utilise pas actuellement `email_contact` (BOOLEAN). Deux options :

### Option 1 : Ajouter le champ au formulaire
Ajouter une checkbox "Accepte les contacts par email" dans le formulaire.

### Option 2 : Supprimer la colonne
Si vous ne voulez pas utiliser cette fonctionnalité, vous pouvez supprimer la colonne :
```sql
ALTER TABLE profiles DROP COLUMN IF EXISTS email_contact;
```

**Recommandation** : Gardez-la pour l'instant, vous pourrez l'utiliser plus tard pour filtrer les profils qui acceptent d'être contactés par email.

## ✅ Conclusion

- **2 colonnes à supprimer** : `phone`, `whatsapp`
- **Toutes les autres colonnes sont correctes**
- Le code fonctionne déjà avec les bonnes colonnes
