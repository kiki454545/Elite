-- Script de nettoyage des colonnes en double dans la table profiles
-- À exécuter dans le SQL Editor de Supabase

-- ÉTAPE 1: Fusionner les données des colonnes en double avant de les supprimer

-- Fusionner phone_number et phone (garder phone_number)
UPDATE profiles
SET phone_number = COALESCE(phone_number, phone)
WHERE phone_number IS NULL AND phone IS NOT NULL;

-- Fusionner has_whatsapp et whatsapp (garder has_whatsapp)
UPDATE profiles
SET has_whatsapp = COALESCE(has_whatsapp, whatsapp)
WHERE has_whatsapp IS NULL AND whatsapp IS NOT NULL;

-- Fusionner contact_email et email_contact (garder contact_email)
UPDATE profiles
SET contact_email = COALESCE(contact_email, email_contact)
WHERE contact_email IS NULL AND email_contact IS NOT NULL;

-- ÉTAPE 2: Supprimer les colonnes en double (anciennes versions)

-- Supprimer la colonne phone (on garde phone_number)
ALTER TABLE profiles DROP COLUMN IF EXISTS phone;

-- Supprimer la colonne whatsapp (on garde has_whatsapp)
ALTER TABLE profiles DROP COLUMN IF EXISTS whatsapp;

-- Supprimer la colonne email_contact (on garde contact_email)
ALTER TABLE profiles DROP COLUMN IF EXISTS email_contact;

-- ÉTAPE 3: Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Nettoyage terminé !';
  RAISE NOTICE 'Colonnes supprimées: phone, whatsapp, email_contact';
  RAISE NOTICE 'Colonnes conservées: phone_number, has_whatsapp, contact_email';
END $$;
