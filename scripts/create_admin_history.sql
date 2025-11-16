-- Table pour l'historique des actions admin
CREATE TABLE IF NOT EXISTS admin_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  admin_username TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'ticket_closed', 'verification_approved', 'verification_rejected', 'report_resolved', 'profile_deleted', 'profile_verified'
  target_type TEXT NOT NULL, -- 'ticket', 'verification', 'report', 'profile'
  target_id UUID NOT NULL,
  target_username TEXT, -- Nom d'utilisateur concerné
  details TEXT, -- JSON avec les détails de l'action
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_admin_history_admin_id ON admin_history(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_history_action_type ON admin_history(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_history_target_type ON admin_history(target_type);
CREATE INDEX IF NOT EXISTS idx_admin_history_created_at ON admin_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_history_target_username ON admin_history(target_username);

-- Activer RLS
ALTER TABLE admin_history ENABLE ROW LEVEL SECURITY;

-- Policy : Seuls les admins peuvent voir l'historique
DROP POLICY IF EXISTS "Admins can view history" ON admin_history;
CREATE POLICY "Admins can view history"
  ON admin_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- Policy : Seuls les admins peuvent créer des entrées d'historique
DROP POLICY IF EXISTS "Admins can create history entries" ON admin_history;
CREATE POLICY "Admins can create history entries"
  ON admin_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );
