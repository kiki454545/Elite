-- Script de nettoyage des VRAIES colonnes en double dans la table profiles
-- À exécuter dans le SQL Editor de Supabase

-- ANALYSE DES COLONNES :
-- phone (TEXT) et phone_number (TEXT) = DOUBLON (même rôle)
-- whatsapp (BOOLEAN) et has_whatsapp (BOOLEAN) = DOUBLON (même rôle)
-- email_contact (BOOLEAN) et contact_email (TEXT) = PAS UN DOUBLON (rôles différents)
--   - email_contact = "Accepte les contacts par email" (oui/non)
--   - contact_email = "Adresse email de contact" (texte)

-- ÉTAPE 1: Fusionner les données des VRAIES colonnes en double

-- Fusionner phone_number et phone (garder phone_number)
UPDATE profiles
SET phone_number = COALESCE(phone_number, phone)
WHERE phone_number IS NULL AND phone IS NOT NULL;

-- Fusionner has_whatsapp et whatsapp (garder has_whatsapp)
UPDATE profiles
SET has_whatsapp = COALESCE(has_whatsapp, whatsapp)
WHERE has_whatsapp IS NULL AND whatsapp IS NOT NULL;

-- ÉTAPE 2: Supprimer UNIQUEMENT les vraies colonnes en double

-- Supprimer la colonne phone (on garde phone_number)
ALTER TABLE profiles DROP COLUMN IF EXISTS phone;

-- Supprimer la colonne whatsapp (on garde has_whatsapp)
ALTER TABLE profiles DROP COLUMN IF EXISTS whatsapp;

-- NE PAS supprimer email_contact car elle a un rôle différent de contact_email !

-- ÉTAPE 3: Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Nettoyage terminé !';
  RAISE NOTICE 'Colonnes supprimées: phone, whatsapp';
  RAISE NOTICE 'Colonnes conservées: phone_number, has_whatsapp';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  ATTENTION: email_contact et contact_email sont DIFFÉRENTES:';
  RAISE NOTICE '   - email_contact (BOOLEAN) = Accepte les contacts par email';
  RAISE NOTICE '   - contact_email (TEXT) = Adresse email de contact';
  RAISE NOTICE '   Les deux colonnes sont conservées.';
END $$;
