-- Mettre 25% des annonces approuvées en vérifié aléatoirement

DO $$
DECLARE
  total_ads INT;
  target_verified INT;
  current_verified INT;
  ads_to_verify INT;
BEGIN
  -- Compter le nombre total d'annonces approuvées
  SELECT COUNT(*) INTO total_ads
  FROM ads
  WHERE status = 'approved';

  -- Calculer 25% du total
  target_verified := CEIL(total_ads * 0.25);

  -- Compter combien sont déjà vérifiées
  SELECT COUNT(*) INTO current_verified
  FROM ads
  WHERE status = 'approved' AND verified = true;

  -- Calculer combien il faut en vérifier
  ads_to_verify := target_verified - current_verified;

  RAISE NOTICE 'Total annonces: %', total_ads;
  RAISE NOTICE 'Cible 25%%: %', target_verified;
  RAISE NOTICE 'Déjà vérifiées: %', current_verified;
  RAISE NOTICE 'À vérifier: %', ads_to_verify;

  -- Si on doit en vérifier plus
  IF ads_to_verify > 0 THEN
    -- Sélectionner aléatoirement des annonces non vérifiées et les marquer comme vérifiées
    UPDATE ads
    SET verified = true
    WHERE id IN (
      SELECT id
      FROM ads
      WHERE status = 'approved' AND verified = false
      ORDER BY RANDOM()
      LIMIT ads_to_verify
    );

    RAISE NOTICE '✅ % annonces marquées comme vérifiées!', ads_to_verify;
  -- Si on en a trop de vérifiées
  ELSIF ads_to_verify < 0 THEN
    -- Retirer la vérification de certaines annonces aléatoirement
    UPDATE ads
    SET verified = false
    WHERE id IN (
      SELECT id
      FROM ads
      WHERE status = 'approved' AND verified = true
      ORDER BY RANDOM()
      LIMIT ABS(ads_to_verify)
    );

    RAISE NOTICE '✅ % annonces dé-vérifiées!', ABS(ads_to_verify);
  ELSE
    RAISE NOTICE '✅ Déjà à 25%% de vérification!';
  END IF;

  -- Afficher le résultat final
  SELECT COUNT(*) INTO current_verified
  FROM ads
  WHERE status = 'approved' AND verified = true;

  RAISE NOTICE 'Résultat final: % annonces vérifiées sur % (%.2%%)',
    current_verified,
    total_ads,
    (current_verified::FLOAT / total_ads * 100);

END $$;
