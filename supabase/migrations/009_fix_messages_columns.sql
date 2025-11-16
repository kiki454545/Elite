-- ==========================================
-- CORRIGER LA STRUCTURE DE LA TABLE MESSAGES
-- ==========================================

-- Vérifier si la colonne 'message' existe et la renommer en 'content'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'messages'
        AND column_name = 'message'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE messages RENAME COLUMN message TO content;
    END IF;
END $$;

-- Ajouter la colonne content si elle n'existe pas du tout
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '';

-- S'assurer que la table a toutes les colonnes nécessaires
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
