-- Migration pour ajouter toutes les informations de profil
-- Coordonnées, Disponibilités, Langues parlées, Attributs physiques

-- Ajouter les colonnes de coordonnées / contact
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_contact BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepts_sms BOOLEAN DEFAULT false;

-- Ajouter les colonnes de disponibilités
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS schedule TEXT; -- Horaires détaillés
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability TEXT; -- Disponibilité générale
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS available_24_7 BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS outcall BOOLEAN DEFAULT false; -- Déplacement
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS incall BOOLEAN DEFAULT false; -- Reçoit

-- Ajouter les langues parlées (array de codes de langues)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}';

-- Ajouter les attributs physiques
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height INTEGER; -- en cm
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weight INTEGER; -- en kg
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS measurements TEXT; -- ex: "95-65-95"
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cup_size TEXT; -- ex: "D"
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hair_color TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS eye_color TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ethnicity TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS body_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tattoos BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS piercings BOOLEAN DEFAULT false;

-- Ajouter d'autres informations utiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepts_couples BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS description TEXT; -- Description du profil
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS services TEXT[] DEFAULT '{}'; -- Services proposés
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS category TEXT; -- Catégorie principale

-- Ajouter une colonne pour la localisation complète
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'FR';

-- Créer des index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_category ON profiles(category);
CREATE INDEX IF NOT EXISTS idx_profiles_languages ON profiles USING GIN(languages);
CREATE INDEX IF NOT EXISTS idx_profiles_services ON profiles USING GIN(services);

-- Ajouter un commentaire pour documenter la table
COMMENT ON TABLE profiles IS 'Profils utilisateurs avec informations complètes (coordonnées, disponibilités, attributs physiques, langues)';
COMMENT ON COLUMN profiles.phone IS 'Numéro de téléphone de contact';
COMMENT ON COLUMN profiles.whatsapp IS 'Disponible sur WhatsApp';
COMMENT ON COLUMN profiles.telegram IS 'Disponible sur Telegram';
COMMENT ON COLUMN profiles.email_contact IS 'Accepte les contacts par email';
COMMENT ON COLUMN profiles.accepts_sms IS 'Accepte les SMS';
COMMENT ON COLUMN profiles.schedule IS 'Horaires de disponibilité détaillés';
COMMENT ON COLUMN profiles.availability IS 'Disponibilité générale (ex: "Lundi-Vendredi 9h-18h")';
COMMENT ON COLUMN profiles.available_24_7 IS 'Disponible 24h/24 7j/7';
COMMENT ON COLUMN profiles.outcall IS 'Se déplace chez le client';
COMMENT ON COLUMN profiles.incall IS 'Reçoit à son domicile/hôtel';
COMMENT ON COLUMN profiles.languages IS 'Langues parlées (codes ISO 639-1, ex: ["fr", "en", "es"])';
COMMENT ON COLUMN profiles.height IS 'Taille en centimètres';
COMMENT ON COLUMN profiles.weight IS 'Poids en kilogrammes';
COMMENT ON COLUMN profiles.measurements IS 'Mensurations (ex: "95-65-95")';
COMMENT ON COLUMN profiles.cup_size IS 'Taille de bonnet (ex: "D")';
COMMENT ON COLUMN profiles.hair_color IS 'Couleur des cheveux';
COMMENT ON COLUMN profiles.eye_color IS 'Couleur des yeux';
COMMENT ON COLUMN profiles.ethnicity IS 'Origine ethnique';
COMMENT ON COLUMN profiles.body_type IS 'Type de morphologie (ex: "athlétique", "mince", "pulpeuse")';
COMMENT ON COLUMN profiles.tattoos IS 'Possède des tatouages';
COMMENT ON COLUMN profiles.piercings IS 'Possède des piercings';
COMMENT ON COLUMN profiles.accepts_couples IS 'Accepte les couples';
COMMENT ON COLUMN profiles.description IS 'Description du profil';
COMMENT ON COLUMN profiles.services IS 'Services proposés (array)';
COMMENT ON COLUMN profiles.category IS 'Catégorie principale (escort, massage, trans, etc.)';
COMMENT ON COLUMN profiles.location IS 'Ville/Localisation';
COMMENT ON COLUMN profiles.country IS 'Code pays (FR, BE, CH, etc.)';
