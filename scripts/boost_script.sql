-- Boost des annonces actives
-- Mise à jour des dates de création, vues et favoris

DO $$
DECLARE
  ad_record RECORD;
  new_date TIMESTAMP;
  new_views INT;
  new_favorites INT;
  ratio FLOAT;
BEGIN
  FOR ad_record IN
    SELECT id FROM ads WHERE status = 'approved'
  LOOP
    -- Date aléatoire entre 5 et 15 novembre 2025
    new_date := '2025-11-05 00:00:00'::timestamp +
                (random() * ('2025-11-15 23:59:59'::timestamp - '2025-11-05 00:00:00'::timestamp));

    -- Vues aléatoires entre 1500 et 50000
    new_views := 1500 + floor(random() * (50000 - 1500 + 1))::int;

    -- Favoris proportionnels aux vues (0.1% à 1%, max 150)
    ratio := 0.001 + (random() * 0.009);
    new_favorites := LEAST(floor(new_views * ratio)::int, 150);

    -- Mise à jour
    UPDATE ads
    SET
      created_at = new_date,
      views = new_views,
      favorites_count = new_favorites
    WHERE id = ad_record.id;
  END LOOP;

  RAISE NOTICE 'Annonces boostées avec succès!';
END $$;

-- Création de 3546 nouveaux utilisateurs
DO $$
DECLARE
  i INT;
  username TEXT;
  email TEXT;
  created_date TIMESTAMP;
  user_id UUID;
  prefixes TEXT[] := ARRAY['Vip', 'Star', 'Angel', 'Bella', 'Luna', 'Diva', 'Queen', 'Princess', 'Lady', 'Sofia', 'Maya', 'Emma', 'Mia', 'Aria'];
  suffixes TEXT[] := ARRAY['Malta', 'Island', 'Dream', 'Passion', 'Love', 'Beauty', 'Charm', 'Style', 'Luxury', 'Premium', 'Goddess', 'Pearl', 'Ruby', 'Diamond'];
  prefix TEXT;
  suffix TEXT;
BEGIN
  FOR i IN 1..3546 LOOP
    -- Générer un UUID pour l'utilisateur
    user_id := gen_random_uuid();

    -- Générer un nom d'utilisateur aléatoire
    prefix := prefixes[1 + floor(random() * array_length(prefixes, 1))::int];
    suffix := suffixes[1 + floor(random() * array_length(suffixes, 1))::int];
    username := prefix || suffix || i::text;

    -- Générer un email unique
    email := 'user' || i::text || '_' || extract(epoch from now())::bigint::text || '@elite-malta.com';

    -- Date aléatoire entre 5 et 24 novembre 2025
    created_date := '2025-11-05 00:00:00'::timestamp +
                    (random() * ('2025-11-24 23:59:59'::timestamp - '2025-11-05 00:00:00'::timestamp));

    -- Insertion avec ID
    INSERT INTO profiles (id, email, username, created_at, elite_coins)
    VALUES (user_id, email, username, created_date, 0);

    -- Log tous les 500 utilisateurs
    IF i % 500 = 0 THEN
      RAISE NOTICE 'Créé % utilisateurs...', i;
    END IF;
  END LOOP;

  RAISE NOTICE '3546 utilisateurs créés avec succès!';
END $$;
