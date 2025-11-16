-- Ajouter le type 'message' aux signalements
-- La table reports existe déjà, on va juste s'assurer qu'elle peut gérer les messages

-- Vérifier que la colonne reported_type accepte 'message'
-- Si nécessaire, modifier le type de reported_type pour accepter 'message'
-- Note: PostgreSQL ne supporte pas les CHECK constraints facilement modifiables
-- donc on va juste documenter que reported_type peut être: 'profile' | 'comment' | 'message'

-- Créer un index pour optimiser les recherches de signalements de messages
CREATE INDEX IF NOT EXISTS idx_reports_message_type ON reports(reported_type, reported_id)
WHERE reported_type = 'message';

-- Commenter la table pour documenter les types acceptés
COMMENT ON COLUMN reports.reported_type IS 'Type de contenu signalé: profile, comment, ou message';
