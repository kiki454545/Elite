-- Création de 5000 nouveaux utilisateurs
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
  FOR i IN 1..5000 LOOP
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
    BEGIN
      INSERT INTO profiles (id, email, username, created_at, elite_coins)
      VALUES (user_id, email, username, created_date, 0);
    EXCEPTION WHEN OTHERS THEN
      -- Ignorer les erreurs de contrainte unique
      NULL;
    END;

    -- Log tous les 500 utilisateurs
    IF i % 500 = 0 THEN
      RAISE NOTICE 'Créé % utilisateurs...', i;
    END IF;
  END LOOP;

  RAISE NOTICE '5000 utilisateurs créés avec succès!';
END $$;
