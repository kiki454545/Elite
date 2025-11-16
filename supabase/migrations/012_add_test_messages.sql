-- Script pour ajouter 10 conversations de test pour ekinokz1203

-- Trouver l'ID de ekinokz1203
DO $$
DECLARE
  target_user_id uuid;
  other_user_ids uuid[];
  other_user_id uuid;
  conv_id uuid;
  test_messages text[] := ARRAY[
    'Salut, ton annonce m''intéresse beaucoup !',
    'Bonjour, es-tu disponible aujourd''hui ?',
    'Hello, je voudrais plus d''informations',
    'Coucou, c''est possible de discuter ?',
    'Bonsoir, j''aimerais te rencontrer',
    'Hey, tu es dispo ce soir ?',
    'Salut, tu fais quels services ?',
    'Bonjour, quels sont tes tarifs ?',
    'Hello, tu es où exactement ?',
    'Coucou, on peut se voir quand ?'
  ];
  i int := 1;
BEGIN
  -- Récupérer l'ID de ekinokz1203
  SELECT id INTO target_user_id
  FROM profiles
  WHERE username = 'ekinokz1203'
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'Utilisateur ekinokz1203 non trouvé';
    RETURN;
  END IF;

  RAISE NOTICE 'Utilisateur trouvé: %', target_user_id;

  -- Récupérer 10 autres utilisateurs
  SELECT ARRAY(
    SELECT id
    FROM profiles
    WHERE id != target_user_id
    LIMIT 10
  ) INTO other_user_ids;

  -- Créer une conversation avec chaque utilisateur
  FOREACH other_user_id IN ARRAY other_user_ids
  LOOP
    -- Créer la conversation
    INSERT INTO conversations (user1_id, user2_id, last_message, last_message_at)
    VALUES (other_user_id, target_user_id, test_messages[i], NOW())
    RETURNING id INTO conv_id;

    RAISE NOTICE 'Conversation créée: %', conv_id;

    -- Ajouter un message
    INSERT INTO messages (conversation_id, sender_id, content, read)
    VALUES (conv_id, other_user_id, test_messages[i], false);

    RAISE NOTICE 'Message ajouté: %', test_messages[i];

    i := i + 1;
  END LOOP;

  RAISE NOTICE '10 conversations de test créées avec succès !';
END $$;
