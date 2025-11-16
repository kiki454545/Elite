-- Migration pour ajouter les colonnes de profil manquantes
-- À exécuter dans le SQL Editor de Supabase

-- Ajouter les colonnes de base
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('female', 'male', 'couple', 'transsexual')),
ADD COLUMN IF NOT EXISTS orientation TEXT CHECK (orientation IN ('heterosexual', 'bisexual', 'homosexual')),
ADD COLUMN IF NOT EXISTS interested_in JSONB DEFAULT '{"men": false, "women": false, "couples": false, "transsexuals": false, "over25": false, "gays": false}'::jsonb,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS ethnicity TEXT CHECK (ethnicity IN ('asian', 'black', 'caucasian', 'latin', 'indian', 'oriental', 'mixed')),
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS hair_color TEXT CHECK (hair_color IN ('blond', 'chestnut', 'brown', 'red', 'black')),
ADD COLUMN IF NOT EXISTS eye_color TEXT CHECK (eye_color IN ('blue', 'gray', 'brown', 'hazel', 'green')),
ADD COLUMN IF NOT EXISTS height INTEGER, -- en cm
ADD COLUMN IF NOT EXISTS weight INTEGER, -- en kg
ADD COLUMN IF NOT EXISTS bust INTEGER, -- tour de poitrine en cm
ADD COLUMN IF NOT EXISTS waist INTEGER, -- tour de taille en cm
ADD COLUMN IF NOT EXISTS hips INTEGER, -- tour de hanches en cm
ADD COLUMN IF NOT EXISTS breast_size TEXT, -- taille de bonnet (A, B, C, etc.)
ADD COLUMN IF NOT EXISTS breast_type TEXT CHECK (breast_type IN ('natural', 'silicone')),
ADD COLUMN IF NOT EXISTS hair_removal TEXT CHECK (hair_removal IN ('fully', 'partially', 'circumcised', 'natural')),
ADD COLUMN IF NOT EXISTS tattoo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preferred_lang TEXT DEFAULT 'fr';

-- Créer des index pour améliorer les performances des recherches
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_orientation ON profiles(orientation);
CREATE INDEX IF NOT EXISTS idx_profiles_ethnicity ON profiles(ethnicity);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_height ON profiles(height);

-- Ajouter des commentaires pour la documentation
COMMENT ON COLUMN profiles.gender IS 'Genre de l''utilisateur: female, male, couple, transsexual';
COMMENT ON COLUMN profiles.orientation IS 'Orientation sexuelle: heterosexual, bisexual, homosexual';
COMMENT ON COLUMN profiles.interested_in IS 'Intérêts (JSON): men, women, couples, transsexuals, over25, gays';
COMMENT ON COLUMN profiles.age IS 'Âge de l''utilisateur en années';
COMMENT ON COLUMN profiles.ethnicity IS 'Origine ethnique: asian, black, caucasian, latin, indian, oriental, mixed';
COMMENT ON COLUMN profiles.nationality IS 'Nationalité de l''utilisateur';
COMMENT ON COLUMN profiles.hair_color IS 'Couleur de cheveux: blond, chestnut, brown, red, black';
COMMENT ON COLUMN profiles.eye_color IS 'Couleur des yeux: blue, gray, brown, hazel, green';
COMMENT ON COLUMN profiles.height IS 'Taille en centimètres';
COMMENT ON COLUMN profiles.weight IS 'Poids en kilogrammes';
COMMENT ON COLUMN profiles.bust IS 'Tour de poitrine en centimètres';
COMMENT ON COLUMN profiles.waist IS 'Tour de taille en centimètres';
COMMENT ON COLUMN profiles.hips IS 'Tour de hanches en centimètres';
COMMENT ON COLUMN profiles.breast_size IS 'Taille de bonnet (A, B, C, D, etc.)';
COMMENT ON COLUMN profiles.breast_type IS 'Type de poitrine: natural, silicone';
COMMENT ON COLUMN profiles.hair_removal IS 'Épilation: fully, partially, circumcised, natural';
COMMENT ON COLUMN profiles.tattoo IS 'Présence de tatouages';
COMMENT ON COLUMN profiles.preferred_lang IS 'Langue préférée (fr, en, etc.)';
