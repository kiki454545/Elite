import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  console.error('Vérifiez que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addAdvancedSearchFields() {
  try {
    console.log('🚀 Début de la migration...')
    console.log('📡 Connexion à Supabase:', supabaseUrl)

    // Exécuter le SQL via l'API Supabase
    const sqlScript = `
      -- Ajouter les nouveaux champs à la table profiles
      DO $$
      BEGIN
        -- Informations personnelles
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('femme', 'homme', 'trans', 'couple', 'non-binaire'));
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nationality TEXT;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age INTEGER;

        -- Attributs physiques
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height INTEGER;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weight INTEGER;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cup_size TEXT CHECK (cup_size IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'));
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hair_color TEXT CHECK (hair_color IN ('blonde', 'brune', 'rousse', 'chatain', 'noire', 'grise', 'blanche', 'coloree', 'autre'));
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS eye_color TEXT CHECK (eye_color IN ('bleus', 'verts', 'marrons', 'noirs', 'gris', 'noisette', 'autre'));
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ethnicity TEXT CHECK (ethnicity IN ('caucasienne', 'africaine', 'asiatique', 'latine', 'arabe', 'metisse', 'autre'));
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS body_type TEXT CHECK (body_type IN ('mince', 'athletique', 'moyenne', 'ronde', 'pulpeuse', 'musclee'));
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tattoos BOOLEAN DEFAULT false;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS piercings BOOLEAN DEFAULT false;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pubic_hair TEXT CHECK (pubic_hair IN ('rasee', 'taillee', 'naturelle', 'epilee'));

        -- Langues parlées
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['fr'];

        -- Lieux de rendez-vous
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS meeting_at_home BOOLEAN DEFAULT false;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS meeting_at_hotel BOOLEAN DEFAULT false;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS meeting_in_car BOOLEAN DEFAULT false;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS meeting_at_escort BOOLEAN DEFAULT false;

        -- Méta-données
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_comments BOOLEAN DEFAULT false;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

        RAISE NOTICE '✅ Champs ajoutés à la table profiles';

      EXCEPTION
        WHEN duplicate_column THEN
          RAISE NOTICE 'Colonne déjà existe, on continue...';
      END $$;

      -- Ajouter les mêmes champs à la table ads
      DO $$
      BEGIN
        -- Informations personnelles
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('femme', 'homme', 'trans', 'couple', 'non-binaire'));
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS nationality TEXT;

        -- Attributs physiques
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS height INTEGER;
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS weight INTEGER;
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS cup_size TEXT CHECK (cup_size IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'));
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS hair_color TEXT CHECK (hair_color IN ('blonde', 'brune', 'rousse', 'chatain', 'noire', 'grise', 'blanche', 'coloree', 'autre'));
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS eye_color TEXT CHECK (eye_color IN ('bleus', 'verts', 'marrons', 'noirs', 'gris', 'noisette', 'autre'));
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS ethnicity TEXT CHECK (ethnicity IN ('caucasienne', 'africaine', 'asiatique', 'latine', 'arabe', 'metisse', 'autre'));
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS body_type TEXT CHECK (body_type IN ('mince', 'athletique', 'moyenne', 'ronde', 'pulpeuse', 'musclee'));
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS tattoos BOOLEAN DEFAULT false;
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS piercings BOOLEAN DEFAULT false;
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS pubic_hair TEXT CHECK (pubic_hair IN ('rasee', 'taillee', 'naturelle', 'epilee'));

        -- Langues parlées
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['fr'];

        -- Lieux de rendez-vous
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS meeting_at_home BOOLEAN DEFAULT false;
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS meeting_at_hotel BOOLEAN DEFAULT false;
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS meeting_in_car BOOLEAN DEFAULT false;
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS meeting_at_escort BOOLEAN DEFAULT false;

        -- Méta-données
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS has_comments BOOLEAN DEFAULT false;
        ALTER TABLE ads ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

        RAISE NOTICE '✅ Champs ajoutés à la table ads';

      EXCEPTION
        WHEN duplicate_column THEN
          RAISE NOTICE 'Colonne déjà existe, on continue...';
      END $$;

      -- Créer des index pour améliorer les performances
      CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
      CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);
      CREATE INDEX IF NOT EXISTS idx_profiles_ethnicity ON profiles(ethnicity);
      CREATE INDEX IF NOT EXISTS idx_profiles_nationality ON profiles(nationality);
      CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(verified);
      CREATE INDEX IF NOT EXISTS idx_profiles_has_comments ON profiles(has_comments);

      CREATE INDEX IF NOT EXISTS idx_ads_gender ON ads(gender);
      CREATE INDEX IF NOT EXISTS idx_ads_age ON ads(age);
      CREATE INDEX IF NOT EXISTS idx_ads_ethnicity ON ads(ethnicity);
      CREATE INDEX IF NOT EXISTS idx_ads_nationality ON ads(nationality);
      CREATE INDEX IF NOT EXISTS idx_ads_verified ON ads(verified);
      CREATE INDEX IF NOT EXISTS idx_ads_has_comments ON ads(has_comments);
      CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);

      -- Index composites
      CREATE INDEX IF NOT EXISTS idx_ads_status_country ON ads(status, country);
      CREATE INDEX IF NOT EXISTS idx_ads_status_verified ON ads(status, verified);
    `

    console.log('📝 Exécution du script SQL...')

    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlScript })

    if (error) {
      // Si la fonction exec_sql n'existe pas, on va essayer une autre méthode
      if (error.message.includes('exec_sql')) {
        console.log('⚠️  La fonction exec_sql n\'existe pas.')
        console.log('📋 Vous devez exécuter le SQL manuellement dans Supabase.')
        console.log('')
        console.log('👉 Allez sur: https://supabase.com/dashboard/project/upfsgpzcvdvtuygwaizd/editor')
        console.log('👉 Cliquez sur "SQL Editor"')
        console.log('👉 Créez une nouvelle requête')
        console.log('👉 Copiez-collez le contenu du fichier: scripts/migration.sql')
        console.log('👉 Cliquez sur "Run"')
        console.log('')
        console.log('💾 Je vais créer le fichier migration.sql pour vous...')

        // Créer le fichier SQL
        const fs = await import('fs/promises')
        await fs.writeFile('scripts/migration.sql', sqlScript, 'utf-8')
        console.log('✅ Fichier créé: scripts/migration.sql')
        console.log('')
        console.log('📖 Instructions complètes dans MIGRATION_MANUAL.md')

        // Créer un guide
        const guide = `# 📋 Migration Manuelle - Guide

## Pourquoi cette migration manuelle ?

Supabase ne permet pas d'exécuter du SQL directement via l'API pour des raisons de sécurité.
Vous devez le faire via l'interface web de Supabase.

## 🚀 Étapes à suivre

### 1. Aller sur le SQL Editor de Supabase

Ouvrez ce lien :
👉 https://supabase.com/dashboard/project/upfsgpzcvdvtuygwaizd/sql/new

### 2. Copier le SQL

Le fichier SQL a été créé ici : \`scripts/migration.sql\`

Ouvrez-le et copiez tout son contenu.

### 3. Coller dans Supabase

- Collez le SQL dans l'éditeur Supabase
- Cliquez sur le bouton "Run" (en bas à droite)

### 4. Vérifier

Vous devriez voir :
- ✅ Query successful
- Les nouveaux champs ont été ajoutés

### 5. Continuer

Une fois la migration réussie, vous pouvez :

\`\`\`bash
# Activer la nouvelle page de recherche
Move-Item src\\app\\search\\page.tsx src\\app\\search\\page-old.tsx
Move-Item src\\app\\search\\page-v2.tsx src\\app\\search\\page.tsx

# Lancer
npm run dev
\`\`\`

## ❓ En cas de problème

Si vous voyez des erreurs :
- "column already exists" → Normal, ignorez (les colonnes existent déjà)
- "relation does not exist" → Vérifiez que les tables 'profiles' et 'ads' existent
- Autres erreurs → Envoyez-moi le message d'erreur

## 🎯 Après la migration

Allez sur \`http://localhost:3000/search\` et testez les nouveaux filtres !
`

        await fs.writeFile('MIGRATION_MANUAL.md', guide, 'utf-8')
        console.log('✅ Guide créé: MIGRATION_MANUAL.md')

        return
      }

      throw error
    }

    console.log('✅ Migration réussie!')
    console.log('🎉 Tous les champs ont été ajoutés avec succès!')
    console.log('')
    console.log('📝 Prochaine étape:')
    console.log('   Move-Item src\\app\\search\\page.tsx src\\app\\search\\page-old.tsx')
    console.log('   Move-Item src\\app\\search\\page-v2.tsx src\\app\\search\\page.tsx')
    console.log('   npm run dev')

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message)

    if (error.message.includes('exec_sql') || error.message.includes('function')) {
      console.log('')
      console.log('⚠️  Vous devez exécuter la migration manuellement.')
      console.log('📖 Suivez les instructions dans: MIGRATION_MANUAL.md')
    } else {
      throw error
    }
  }
}

addAdvancedSearchFields()
