-- Script rapide pour ajouter toutes les colonnes manquantes au profil
-- À exécuter dans le SQL Editor de Supabase Dashboard

-- Colonnes de base (si manquantes)
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

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_category ON profiles(category);
CREATE INDEX IF NOT EXISTS idx_profiles_languages ON profiles USING GIN(languages);
CREATE INDEX IF NOT EXISTS idx_profiles_services ON profiles USING GIN(services);

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration terminée avec succès !';
END $$;
