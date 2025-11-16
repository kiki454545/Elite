-- ============================================
-- Migration: Ajout des filtres de recherche avancée
-- ============================================

-- Ajouter les nouveaux champs à la table profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('femme', 'homme', 'trans', 'couple', 'non-binaire')),
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS age INTEGER,
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
  ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['fr'],
  ADD COLUMN IF NOT EXISTS meeting_at_home BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS meeting_at_hotel BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS meeting_in_car BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS meeting_at_escort BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_comments BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Ajouter les mêmes champs à la table ads
ALTER TABLE ads
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('femme', 'homme', 'trans', 'couple', 'non-binaire')),
  ADD COLUMN IF NOT EXISTS nationality TEXT,
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
  ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['fr'],
  ADD COLUMN IF NOT EXISTS meeting_at_home BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS meeting_at_hotel BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS meeting_in_car BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS meeting_at_escort BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_comments BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Créer des index pour améliorer les performances de recherche (APRÈS avoir ajouté les colonnes)
DO $$
BEGIN
  -- Index pour profiles
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'profiles' AND indexname = 'idx_profiles_gender') THEN
    CREATE INDEX idx_profiles_gender ON profiles(gender);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'profiles' AND indexname = 'idx_profiles_age') THEN
    CREATE INDEX idx_profiles_age ON profiles(age);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'profiles' AND indexname = 'idx_profiles_ethnicity') THEN
    CREATE INDEX idx_profiles_ethnicity ON profiles(ethnicity);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'profiles' AND indexname = 'idx_profiles_nationality') THEN
    CREATE INDEX idx_profiles_nationality ON profiles(nationality);
  END IF;

  -- Index pour ads
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'ads' AND indexname = 'idx_ads_gender') THEN
    CREATE INDEX idx_ads_gender ON ads(gender);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'ads' AND indexname = 'idx_ads_ethnicity') THEN
    CREATE INDEX idx_ads_ethnicity ON ads(ethnicity);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'ads' AND indexname = 'idx_ads_nationality') THEN
    CREATE INDEX idx_ads_nationality ON ads(nationality);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'ads' AND indexname = 'idx_ads_has_comments') THEN
    CREATE INDEX idx_ads_has_comments ON ads(has_comments);
  END IF;

  -- Index composites
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'ads' AND indexname = 'idx_ads_status_country') THEN
    CREATE INDEX idx_ads_status_country ON ads(status, country);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'ads' AND indexname = 'idx_ads_status_verified') THEN
    CREATE INDEX idx_ads_status_verified ON ads(status, verified);
  END IF;
END $$;

-- Mettre à jour le compteur de commentaires pour les annonces existantes
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
);

-- Message de succès
DO $$
BEGIN
  RAISE NOTICE '✅ Migration terminée avec succès!';
  RAISE NOTICE '📊 Nouveaux champs ajoutés:';
  RAISE NOTICE '   - gender, nationality, age';
  RAISE NOTICE '   - height, weight, cup_size';
  RAISE NOTICE '   - hair_color, eye_color, ethnicity';
  RAISE NOTICE '   - body_type, tattoos, piercings, pubic_hair';
  RAISE NOTICE '   - languages, meeting_* (4 champs)';
  RAISE NOTICE '   - has_comments, comment_count';
  RAISE NOTICE '🎯 Prochaine étape: Activer la nouvelle page de recherche';
END $$;
