# 🧹 Nettoyage des colonnes en double

## 🔍 Colonnes en double identifiées

Lors de la migration, certaines colonnes ont été créées en double avec des noms légèrement différents :

| ❌ À supprimer | ✅ À conserver | Raison |
|---------------|----------------|--------|
| `phone` | `phone_number` | Plus explicite |
| `whatsapp` | `has_whatsapp` | Convention booléenne `has_*` |
| `email_contact` | `contact_email` | Ordre logique (type avant catégorie) |

## ✅ État actuel du code

Le code utilise **déjà les bonnes colonnes** :
- ✅ `phone_number` (utilisé dans edit page ligne 119, 182)
- ✅ `has_whatsapp` (utilisé dans edit page ligne 120, 183)
- ✅ `contact_email` (utilisé dans edit page ligne 121, 184)

## 🚀 Action requise

### Exécuter le script de nettoyage

1. **Ouvrez** : https://supabase.com/dashboard/project/upfsgpzcvdvtuygwaizd/sql/new

2. **Copiez le fichier** : [cleanup_duplicate_columns.sql](cleanup_duplicate_columns.sql)

3. **Cliquez sur "Run"**

### OU copiez-collez directement ce SQL :

\`\`\`sql
-- Fusionner les données avant suppression
UPDATE profiles SET phone_number = COALESCE(phone_number, phone)
WHERE phone_number IS NULL AND phone IS NOT NULL;

UPDATE profiles SET has_whatsapp = COALESCE(has_whatsapp, whatsapp)
WHERE has_whatsapp IS NULL AND whatsapp IS NOT NULL;

UPDATE profiles SET contact_email = COALESCE(contact_email, email_contact)
WHERE contact_email IS NULL AND email_contact IS NOT NULL;

-- Supprimer les colonnes en double
ALTER TABLE profiles DROP COLUMN IF EXISTS phone;
ALTER TABLE profiles DROP COLUMN IF EXISTS whatsapp;
ALTER TABLE profiles DROP COLUMN IF EXISTS email_contact;
\`\`\`

## 📊 Résultat attendu

Après exécution :
- ✅ Les données sont préservées (fusionnées dans les bonnes colonnes)
- ✅ Les colonnes redondantes sont supprimées
- ✅ Le code continue de fonctionner normalement (il utilise déjà les bonnes colonnes)

## ⚠️ Sécurité

Le script utilise `COALESCE` pour fusionner les données :
- Si `phone_number` a une valeur, elle est conservée
- Si `phone_number` est NULL mais `phone` a une valeur, on copie `phone` vers `phone_number`
- Ensuite seulement, on supprime la colonne `phone`

Aucune donnée ne sera perdue ! 🔒

## 🎯 Autres colonnes à vérifier

Voici toutes les colonnes actuellement dans `profiles` qui sont correctes :

### ✅ Colonnes uniques (pas de doublon)
- `gender`, `orientation`, `interested_in`
- `ethnicity`, `nationality`
- `hair_color`, `eye_color`
- `height`, `weight`, `bust`, `waist`, `hips`
- `breast_size`, `breast_type`
- `hair_removal`, `tattoo`, `piercings`
- `languages`, `availability`, `available24_7`, `schedule`
- `contact_method`, `telegram`, `accepts_sms`
- `services`, `category`, `description`
- `outcall`, `incall`, `accepts_couples`
- `location`, `country`
- `measurements`, `cup_size`, `body_type`

Toutes ces colonnes sont bonnes et ne nécessitent pas de nettoyage.
