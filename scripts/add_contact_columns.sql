-- Migration pour ajouter les colonnes de contact à la table profiles

-- Ajouter les colonnes de contact
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS has_whatsapp BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_method TEXT;

-- Ajouter des commentaires pour la documentation
COMMENT ON COLUMN profiles.phone_number IS 'Numéro de téléphone de l''utilisateur';
COMMENT ON COLUMN profiles.has_whatsapp IS 'Indique si l''utilisateur possède WhatsApp';
COMMENT ON COLUMN profiles.contact_email IS 'Email de contact de l''utilisateur';
COMMENT ON COLUMN profiles.contact_method IS 'Méthode de contact préférée (sms_only, call_only, call_and_sms)';

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_has_whatsapp ON profiles(has_whatsapp);
CREATE INDEX IF NOT EXISTS idx_profiles_contact_method ON profiles(contact_method);
