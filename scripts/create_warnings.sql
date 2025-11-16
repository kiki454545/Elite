-- Table pour les avertissements utilisateur
CREATE TABLE IF NOT EXISTS user_warnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_warnings_user_id ON user_warnings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_warnings_admin_id ON user_warnings(admin_id);
CREATE INDEX IF NOT EXISTS idx_user_warnings_created_at ON user_warnings(created_at DESC);

-- Activer RLS
ALTER TABLE user_warnings ENABLE ROW LEVEL SECURITY;

-- Policy : Les utilisateurs peuvent voir leurs propres avertissements
DROP POLICY IF EXISTS "Users can view their own warnings" ON user_warnings;
CREATE POLICY "Users can view their own warnings"
  ON user_warnings FOR SELECT
  USING (auth.uid() = user_id);

-- Policy : Les admins peuvent voir tous les avertissements
DROP POLICY IF EXISTS "Admins can view all warnings" ON user_warnings;
CREATE POLICY "Admins can view all warnings"
  ON user_warnings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- Policy : Les admins peuvent créer des avertissements
DROP POLICY IF EXISTS "Admins can create warnings" ON user_warnings;
CREATE POLICY "Admins can create warnings"
  ON user_warnings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- Table pour les notifications d'avertissement
CREATE TABLE IF NOT EXISTS warning_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  warning_id UUID NOT NULL REFERENCES user_warnings(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_warning_notifications_user_id ON warning_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_warning_notifications_is_read ON warning_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_warning_notifications_created_at ON warning_notifications(created_at DESC);

-- Activer RLS
ALTER TABLE warning_notifications ENABLE ROW LEVEL SECURITY;

-- Policy : Les utilisateurs peuvent voir leurs propres notifications
DROP POLICY IF EXISTS "Users can view their own warning notifications" ON warning_notifications;
CREATE POLICY "Users can view their own warning notifications"
  ON warning_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent marquer leurs notifications comme lues
DROP POLICY IF EXISTS "Users can update their own warning notifications" ON warning_notifications;
CREATE POLICY "Users can update their own warning notifications"
  ON warning_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy : Les admins peuvent créer des notifications
DROP POLICY IF EXISTS "Admins can create warning notifications" ON warning_notifications;
CREATE POLICY "Admins can create warning notifications"
  ON warning_notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );
