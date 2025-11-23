-- Ajouter des rangs premium aux annonces avec expiration dans 1 mois
-- 7 Elite, 9 VIP, 12 Plus

DO $$
DECLARE
  expiry_date TIMESTAMP;
  elite_count INT := 0;
  vip_count INT := 0;
  plus_count INT := 0;
  ad_record RECORD;
BEGIN
  -- Date d'expiration: 1 mois à partir de maintenant
  expiry_date := NOW() + INTERVAL '1 month';

  RAISE NOTICE 'Date d expiration des rangs: %', expiry_date;

  -- 1. Ajouter 7 annonces Elite
  RAISE NOTICE 'Attribution de 7 rangs Elite...';
  FOR ad_record IN
    SELECT a.id, a.user_id
    FROM ads a
    JOIN profiles p ON a.user_id = p.id
    WHERE a.status = 'approved'
      AND p.rank = 'standard'
    ORDER BY RANDOM()
    LIMIT 7
  LOOP
    -- Mettre à jour le profil avec le rang Elite
    UPDATE profiles
    SET rank = 'elite', rank_expiry = expiry_date
    WHERE id = ad_record.user_id;

    elite_count := elite_count + 1;
    RAISE NOTICE '  Elite %/7: Profil % mis à jour', elite_count, ad_record.user_id;
  END LOOP;

  -- 2. Ajouter 9 annonces VIP
  RAISE NOTICE 'Attribution de 9 rangs VIP...';
  FOR ad_record IN
    SELECT a.id, a.user_id
    FROM ads a
    JOIN profiles p ON a.user_id = p.id
    WHERE a.status = 'approved'
      AND p.rank = 'standard'
    ORDER BY RANDOM()
    LIMIT 9
  LOOP
    -- Mettre à jour le profil avec le rang VIP
    UPDATE profiles
    SET rank = 'vip', rank_expiry = expiry_date
    WHERE id = ad_record.user_id;

    vip_count := vip_count + 1;
    RAISE NOTICE '  VIP %/9: Profil % mis à jour', vip_count, ad_record.user_id;
  END LOOP;

  -- 3. Ajouter 12 annonces Plus
  RAISE NOTICE 'Attribution de 12 rangs Plus...';
  FOR ad_record IN
    SELECT a.id, a.user_id
    FROM ads a
    JOIN profiles p ON a.user_id = p.id
    WHERE a.status = 'approved'
      AND p.rank = 'standard'
    ORDER BY RANDOM()
    LIMIT 12
  LOOP
    -- Mettre à jour le profil avec le rang Plus
    UPDATE profiles
    SET rank = 'plus', rank_expiry = expiry_date
    WHERE id = ad_record.user_id;

    plus_count := plus_count + 1;
    RAISE NOTICE '  Plus %/12: Profil % mis à jour', plus_count, ad_record.user_id;
  END LOOP;

  -- Résumé final
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'RÉSUMÉ';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '✅ % profils Elite ajoutés (expire le %)', elite_count, expiry_date::DATE;
  RAISE NOTICE '✅ % profils VIP ajoutés (expire le %)', vip_count, expiry_date::DATE;
  RAISE NOTICE '✅ % profils Plus ajoutés (expire le %)', plus_count, expiry_date::DATE;
  RAISE NOTICE '===========================================';

END $$;
