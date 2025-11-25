-- Mise à jour uniquement des favoris pour toutes les annonces
-- Favoris proportionnels aux vues (0.001% à 0.05%, sans limite max)

DO $$
DECLARE
  ad_record RECORD;
  new_favorites INT;
  ratio FLOAT;
BEGIN
  FOR ad_record IN
    SELECT id, views FROM ads WHERE status = 'approved'
  LOOP
    -- Favoris proportionnels aux vues (0.001% à 0.05%, sans limite max)
    ratio := 0.00001 + (random() * 0.0004999);
    new_favorites := floor(ad_record.views * ratio)::int;

    -- Mise à jour uniquement des favoris
    UPDATE ads
    SET favorites_count = new_favorites
    WHERE id = ad_record.id;
  END LOOP;

  RAISE NOTICE 'Favoris mis à jour avec succès!';
END $$;
