# Guide de Migration - Ajout des colonnes Profile

## 📋 Résumé

Cette migration ajoute toutes les colonnes nécessaires à la table `profiles` pour gérer :
- ✅ **Coordonnées** (téléphone, WhatsApp, Telegram, email, SMS)
- ✅ **Disponibilités** (horaires, déplacement, réception)
- ✅ **Langues parlées** (array de codes ISO)
- ✅ **Attributs physiques** (taille, poids, mensurations, couleurs, etc.)
- ✅ **Informations complémentaires** (description, catégorie, services, localisation)

## 🗂️ Fichiers créés

1. **Migration SQL** : [supabase/migrations/013_add_profile_complete_info.sql](supabase/migrations/013_add_profile_complete_info.sql)
2. **Types TypeScript** : [src/types/profile.ts](src/types/profile.ts) (mis à jour)
3. **Constantes** : [src/types/constants.ts](src/types/constants.ts) (nouveau)

## 🚀 Comment exécuter la migration

### Méthode 1 : Via le Dashboard Supabase (RECOMMANDÉ)

1. Ouvrez votre dashboard Supabase : https://supabase.com/dashboard/project/upfsgpzcvdvtuygwaizd/editor

2. Cliquez sur **SQL Editor** dans le menu de gauche

3. Cliquez sur **New Query**

4. Copiez le contenu du fichier [supabase/migrations/013_add_profile_complete_info.sql](supabase/migrations/013_add_profile_complete_info.sql)

5. Collez-le dans l'éditeur SQL

6. Cliquez sur **Run** (ou appuyez sur Ctrl+Enter)

7. Vérifiez qu'il n'y a pas d'erreurs

### Méthode 2 : Via Supabase CLI

Si vous avez Supabase CLI installé et configuré :

\`\`\`bash
# Assurez-vous d'être dans le dossier du projet
cd c:\\Users\\ekino\\OneDrive\\Bureau\\site-modern

# Exécutez la migration
npx supabase db push --linked
\`\`\`

### Méthode 3 : Via psql (si disponible)

\`\`\`bash
psql "postgresql://postgres.upfsgpzcvdvtuygwaizd:Dieudo225@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" < supabase/migrations/013_add_profile_complete_info.sql
\`\`\`

## 📊 Colonnes ajoutées

### 📞 Coordonnées / Contact
| Colonne | Type | Description |
|---------|------|-------------|
| `phone` | TEXT | Numéro de téléphone |
| `whatsapp` | BOOLEAN | Disponible sur WhatsApp |
| `telegram` | BOOLEAN | Disponible sur Telegram |
| `email_contact` | BOOLEAN | Accepte les contacts par email |
| `accepts_sms` | BOOLEAN | Accepte les SMS |

### ⏰ Disponibilités
| Colonne | Type | Description |
|---------|------|-------------|
| `schedule` | TEXT | Horaires détaillés |
| `availability` | TEXT | Disponibilité générale |
| `available_24_7` | BOOLEAN | Disponible 24h/24 7j/7 |
| `outcall` | BOOLEAN | Se déplace chez le client |
| `incall` | BOOLEAN | Reçoit à son domicile/hôtel |

### 🗣️ Langues
| Colonne | Type | Description |
|---------|------|-------------|
| `languages` | TEXT[] | Langues parlées (codes ISO 639-1) |

### 👤 Attributs physiques
| Colonne | Type | Description |
|---------|------|-------------|
| `height` | INTEGER | Taille en centimètres |
| `weight` | INTEGER | Poids en kilogrammes |
| `measurements` | TEXT | Mensurations (ex: "95-65-95") |
| `cup_size` | TEXT | Taille de bonnet (ex: "D") |
| `hair_color` | TEXT | Couleur des cheveux |
| `eye_color` | TEXT | Couleur des yeux |
| `ethnicity` | TEXT | Origine ethnique |
| `body_type` | TEXT | Type de morphologie |
| `tattoos` | BOOLEAN | Possède des tatouages |
| `piercings` | BOOLEAN | Possède des piercings |

### 🎯 Autres informations
| Colonne | Type | Description |
|---------|------|-------------|
| `accepts_couples` | BOOLEAN | Accepte les couples |
| `description` | TEXT | Description du profil |
| `services` | TEXT[] | Services proposés |
| `category` | TEXT | Catégorie principale |
| `location` | TEXT | Ville/Localisation |
| `country` | TEXT | Code pays (FR, BE, CH, etc.) |

## ✅ Vérification

Après avoir exécuté la migration, vous pouvez vérifier que tout fonctionne :

### Via le Dashboard Supabase

1. Allez dans **Table Editor**
2. Sélectionnez la table **profiles**
3. Vérifiez que toutes les colonnes apparaissent

### Via une requête SQL

\`\`\`sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
\`\`\`

### Via votre application

\`\`\`typescript
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1)

console.log('Colonnes disponibles:', data ? Object.keys(data[0]) : [])
\`\`\`

## 📝 Types TypeScript mis à jour

Le fichier [src/types/profile.ts](src/types/profile.ts) a été mis à jour avec les nouvelles interfaces :

\`\`\`typescript
interface Profile {
  // ... champs existants

  // Nouvelles colonnes
  phone?: string
  whatsapp?: boolean
  telegram?: boolean
  languages?: string[]
  height?: number
  // ... etc
}
\`\`\`

## 🎨 Constantes disponibles

Le fichier [src/types/constants.ts](src/types/constants.ts) contient toutes les constantes utiles :

- `LANGUAGES` : 24 langues avec drapeaux
- `HAIR_COLORS` : 9 couleurs de cheveux
- `EYE_COLORS` : 8 couleurs d'yeux
- `ETHNICITIES` : 9 origines ethniques
- `BODY_TYPES` : 8 types de morphologie
- `CUP_SIZES` : 11 tailles de bonnet
- `COMMON_SCHEDULES` : 11 horaires prédéfinis
- `AVAILABILITY_OPTIONS` : 9 disponibilités courantes
- `COMMON_SERVICES` : 16 services

## 🔧 Helpers disponibles

\`\`\`typescript
import {
  getLanguageName,
  getLanguageFlag,
  formatLanguages,
  formatHeight,
  formatWeight,
  formatMeasurements
} from '@/types/constants'

// Exemples
getLanguageName('fr') // "Français"
getLanguageFlag('en') // "🇬🇧"
formatLanguages(['fr', 'en', 'es']) // "Français, English, Español"
formatHeight(170) // "170 cm"
formatWeight(65) // "65 kg"
\`\`\`

## 🚨 Important

- ⚠️ Toutes les nouvelles colonnes sont **optionnelles** (nullable)
- ✅ Les valeurs par défaut sont définies pour les colonnes BOOLEAN
- ✅ Les arrays (languages, services) ont un array vide par défaut
- ✅ Des index ont été créés pour optimiser les recherches
- ✅ La migration est idempotente (utilise `IF NOT EXISTS`)

## 📚 Prochaines étapes

1. ✅ Exécuter la migration SQL
2. ⏳ Mettre à jour les formulaires d'inscription/édition de profil
3. ⏳ Ajouter les composants UI pour éditer ces informations
4. ⏳ Mettre à jour les pages de profil pour afficher ces informations
5. ⏳ Ajouter des filtres de recherche sur ces nouveaux champs

---

**Besoin d'aide ?** Consultez la [documentation Supabase](https://supabase.com/docs) ou créez une issue sur GitHub.
