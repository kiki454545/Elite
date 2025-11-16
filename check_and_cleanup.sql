-- Script intelligent pour vérifier et nettoyer les doublons
-- À exécuter dans le SQL Editor de Supabase

-- ÉTAPE 1: Vérifier quelles colonnes existent
DO $$
DECLARE
    has_phone BOOLEAN;
    has_phone_number BOOLEAN;
    has_whatsapp BOOLEAN;
    has_has_whatsapp BOOLEAN;
BEGIN
    -- Vérifier l'existence des colonnes
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'phone'
    ) INTO has_phone;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'phone_number'
    ) INTO has_phone_number;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'whatsapp'
    ) INTO has_whatsapp;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'has_whatsapp'
    ) INTO has_has_whatsapp;

    -- Afficher le résultat
    RAISE NOTICE '=== ANALYSE DES COLONNES ===';
    RAISE NOTICE '';
    RAISE NOTICE 'Colonnes liées au téléphone:';
    RAISE NOTICE '  phone: %', CASE WHEN has_phone THEN '✅ Existe' ELSE '❌ N''existe pas' END;
    RAISE NOTICE '  phone_number: %', CASE WHEN has_phone_number THEN '✅ Existe' ELSE '❌ N''existe pas' END;
    RAISE NOTICE '';
    RAISE NOTICE 'Colonnes liées à WhatsApp:';
    RAISE NOTICE '  whatsapp: %', CASE WHEN has_whatsapp THEN '✅ Existe' ELSE '❌ N''existe pas' END;
    RAISE NOTICE '  has_whatsapp: %', CASE WHEN has_has_whatsapp THEN '✅ Existe' ELSE '❌ N''existe pas' END;
    RAISE NOTICE '';

    -- Actions à faire
    IF has_phone AND has_phone_number THEN
        RAISE NOTICE '⚠️  DOUBLON DÉTECTÉ: phone ET phone_number existent';
        RAISE NOTICE '   Action: Fusionner puis supprimer phone';
    ELSIF has_phone AND NOT has_phone_number THEN
        RAISE NOTICE '⚠️  INCOHÉRENCE: Seul phone existe (devrait être phone_number)';
        RAISE NOTICE '   Action: Renommer phone en phone_number';
    ELSIF NOT has_phone AND has_phone_number THEN
        RAISE NOTICE '✅ OK: Seul phone_number existe';
    END IF;

    RAISE NOTICE '';

    IF has_whatsapp AND has_has_whatsapp THEN
        RAISE NOTICE '⚠️  DOUBLON DÉTECTÉ: whatsapp ET has_whatsapp existent';
        RAISE NOTICE '   Action: Fusionner puis supprimer whatsapp';
    ELSIF has_whatsapp AND NOT has_has_whatsapp THEN
        RAISE NOTICE '⚠️  INCOHÉRENCE: Seul whatsapp existe (devrait être has_whatsapp)';
        RAISE NOTICE '   Action: Renommer whatsapp en has_whatsapp';
    ELSIF NOT has_whatsapp AND has_has_whatsapp THEN
        RAISE NOTICE '✅ OK: Seul has_whatsapp existe';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '=== FIN DE L''ANALYSE ===';
END $$;

-- ÉTAPE 2: Liste de TOUTES les colonnes de la table profiles
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
