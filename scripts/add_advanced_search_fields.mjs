import 'dotenv/config'
import pg from 'pg'
const { Client } = pg

const client = new Client({
  connectionString: process.env.NEXT_PUBLIC_SUPABASE_DB_URL || process.env.DATABASE_URL
})

async function addAdvancedSearchFields() {
  try {
    await client.connect()
    console.log('✅ Connecté à la base de données')

    // Ajouter les nouveaux champs à la table profiles
    console.log('📝 Ajout des nouveaux champs de recherche à la table profiles...')

    await client.query(`
      -- Informations personnelles
      ALTER TABLE profiles
      ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('femme', 'homme', 'trans', 'couple', 'non-binaire')),
      ADD COLUMN IF NOT EXISTS nationality TEXT,
      ADD COLUMN IF NOT EXISTS age INTEGER,

      -- Attributs physiques
      ADD COLUMN IF NOT EXISTS height INTEGER, -- en cm
      ADD COLUMN IF NOT EXISTS weight INTEGER, -- en kg
      ADD COLUMN IF NOT EXISTS cup_size TEXT CHECK (cup_size IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J')),
      ADD COLUMN IF NOT EXISTS hair_color TEXT CHECK (hair_color IN ('blonde', 'brune', 'rousse', 'chatain', 'noire', 'grise', 'blanche', 'coloree', 'autre')),
      ADD COLUMN IF NOT EXISTS eye_color TEXT CHECK (eye_color IN ('bleus', 'verts', 'marrons', 'noirs', 'gris', 'noisette', 'autre')),
      ADD COLUMN IF NOT EXISTS ethnicity TEXT CHECK (ethnicity IN ('caucasienne', 'africaine', 'asiatique', 'latine', 'arabe', 'metisse', 'autre')),
      ADD COLUMN IF NOT EXISTS body_type TEXT CHECK (body_type IN ('mince', 'athletique', 'moyenne', 'ronde', 'pulpeuse', 'musclee')),
      ADD COLUMN IF NOT EXISTS tattoos BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS piercings BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS pubic_hair TEXT CHECK (pubic_hair IN ('rasee', 'taillee', 'naturelle', 'epilee')),

      -- Langues parlées (array de codes de langues)
      ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['fr'],

      -- Lieux de rendez-vous
      ADD COLUMN IF NOT EXISTS meeting_at_home BOOLEAN DEFAULT false, -- Chez vous
      ADD COLUMN IF NOT EXISTS meeting_at_hotel BOOLEAN DEFAULT false, -- Hôtel
      ADD COLUMN IF NOT EXISTS meeting_in_car BOOLEAN DEFAULT false, -- Plan voiture
      ADD COLUMN IF NOT EXISTS meeting_at_escort BOOLEAN DEFAULT false, -- Chez l'escorte

      -- Méta-données
      ADD COLUMN IF NOT EXISTS has_comments BOOLEAN DEFAULT false, -- A des commentaires
      ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0 -- Nombre de commentaires
    `)

    console.log('✅ Champs ajoutés à la table profiles')

    // Ajouter les mêmes champs à la table ads (pour la recherche rapide)
    console.log('📝 Ajout des nouveaux champs de recherche à la table ads...')

    await client.query(`
      -- Informations personnelles
      ALTER TABLE ads
      ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('femme', 'homme', 'trans', 'couple', 'non-binaire')),
      ADD COLUMN IF NOT EXISTS nationality TEXT,

      -- Attributs physiques
      ADD COLUMN IF NOT EXISTS height INTEGER,
      ADD COLUMN IF NOT EXISTS weight INTEGER,
      ADD COLUMN IF NOT EXISTS cup_size TEXT CHECK (cup_size IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J')),
      ADD COLUMN IF NOT EXISTS hair_color TEXT CHECK (hair_color IN ('blonde', 'brune', 'rousse', 'chatain', 'noire', 'grise', 'blanche', 'coloree', 'autre')),
      ADD COLUMN IF NOT EXISTS eye_color TEXT CHECK (eye_color IN ('bleus', 'verts', 'marrons', 'noirs', 'gris', 'noisette', 'autre')),
      ADD COLUMN IF NOT EXISTS ethnicity TEXT CHECK (ethnicity IN ('caucasienne', 'africaine', 'asiatique', 'latine', 'arabe', 'metisse', 'autre')),
      ADD COLUMN IF NOT EXISTS body_type TEXT CHECK (body_type IN ('mince', 'athletique', 'moyenne', 'ronde', 'pulpeuse', 'musclee')),
      ADD COLUMN IF NOT EXISTS tattoos BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS piercings BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS pubic_hair TEXT CHECK (pubic_hair IN ('rasee', 'taillee', 'naturelle', 'epilee')),

      -- Langues parlées
      ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['fr'],

      -- Lieux de rendez-vous
      ADD COLUMN IF NOT EXISTS meeting_at_home BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS meeting_at_hotel BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS meeting_in_car BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS meeting_at_escort BOOLEAN DEFAULT false,

      -- Méta-données
      ADD COLUMN IF NOT EXISTS has_comments BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0
    `)

    console.log('✅ Champs ajoutés à la table ads')

    // Créer des index pour améliorer les performances de recherche
    console.log('📝 Création des index de recherche...')

    await client.query(`
      -- Index pour les recherches fréquentes sur profiles
      CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
      CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);
      CREATE INDEX IF NOT EXISTS idx_profiles_ethnicity ON profiles(ethnicity);
      CREATE INDEX IF NOT EXISTS idx_profiles_nationality ON profiles(nationality);
      CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(verified);
      CREATE INDEX IF NOT EXISTS idx_profiles_has_comments ON profiles(has_comments);

      -- Index pour les recherches fréquentes sur ads
      CREATE INDEX IF NOT EXISTS idx_ads_gender ON ads(gender);
      CREATE INDEX IF NOT EXISTS idx_ads_age ON ads(age);
      CREATE INDEX IF NOT EXISTS idx_ads_ethnicity ON ads(ethnicity);
      CREATE INDEX IF NOT EXISTS idx_ads_nationality ON ads(nationality);
      CREATE INDEX IF NOT EXISTS idx_ads_verified ON ads(verified);
      CREATE INDEX IF NOT EXISTS idx_ads_has_comments ON ads(has_comments);
      CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);

      -- Index composites pour les recherches combinées
      CREATE INDEX IF NOT EXISTS idx_ads_status_country ON ads(status, country);
      CREATE INDEX IF NOT EXISTS idx_ads_status_verified ON ads(status, verified);
    `)

    console.log('✅ Index créés')

    // Mettre à jour le compteur de commentaires pour les annonces existantes
    console.log('📝 Mise à jour du compteur de commentaires...')

    await client.query(`
      UPDATE ads
      SET comment_count = (
        SELECT COUNT(*)
        FROM ad_comments
        WHERE ad_comments.ad_id = ads.id
      ),
      has_comments = (
        SELECT COUNT(*) > 0
        FROM ad_comments
        WHERE ad_comments.ad_id = ads.id
      )
      WHERE EXISTS (
        SELECT 1
        FROM ad_comments
        WHERE ad_comments.ad_id = ads.id
      )
    `)

    console.log('✅ Compteur de commentaires mis à jour')

    console.log('🎉 Migration terminée avec succès !')
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    await client.end()
  }
}

addAdvancedSearchFields()
