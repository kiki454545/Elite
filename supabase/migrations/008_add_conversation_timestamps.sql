-- ==========================================
-- AJOUTER LES COLONNES DE TIMESTAMP MANQUANTES
-- ==========================================

-- Ajouter last_message_at si elle n'existe pas
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;

-- Initialiser last_message_at avec created_at pour les conversations existantes
UPDATE conversations
SET last_message_at = created_at
WHERE last_message_at IS NULL;

-- Créer un index pour améliorer les performances de tri
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at
ON conversations(last_message_at DESC);
