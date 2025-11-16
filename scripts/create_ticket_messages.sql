-- Table pour les messages des tickets de support
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at);

-- Activer RLS
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Policy : Les utilisateurs peuvent voir les messages de leurs tickets
DROP POLICY IF EXISTS "Users can view messages of their tickets" ON ticket_messages;
CREATE POLICY "Users can view messages of their tickets"
  ON ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- Policy : Les admins peuvent voir tous les messages
DROP POLICY IF EXISTS "Admins can view all messages" ON ticket_messages;
CREATE POLICY "Admins can view all messages"
  ON ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- Policy : Les utilisateurs peuvent créer des messages sur leurs tickets
DROP POLICY IF EXISTS "Users can create messages on their tickets" ON ticket_messages;
CREATE POLICY "Users can create messages on their tickets"
  ON ticket_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
    AND user_id = auth.uid()
    AND is_admin = FALSE
  );

-- Policy : Les admins peuvent créer des messages sur tous les tickets
DROP POLICY IF EXISTS "Admins can create messages on all tickets" ON ticket_messages;
CREATE POLICY "Admins can create messages on all tickets"
  ON ticket_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
    )
    AND user_id = auth.uid()
    AND is_admin = TRUE
  );
