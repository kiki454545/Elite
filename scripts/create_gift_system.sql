-- Création du système de cadeaux virtuels

-- 1. Table des transactions de cadeaux
CREATE TABLE IF NOT EXISTS gift_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gift_id TEXT NOT NULL,
  gift_name TEXT NOT NULL,
  gift_emoji TEXT NOT NULL,
  coins_amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_gift_transactions_sender ON gift_transactions(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_recipient ON gift_transactions(recipient_id, created_at DESC);

-- 2. Fonction pour déduire des coins d'un utilisateur
CREATE OR REPLACE FUNCTION deduct_coins(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET elite_coins = elite_coins - amount
  WHERE id = user_id AND elite_coins >= amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solde insuffisant ou utilisateur introuvable';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fonction pour ajouter des coins à un utilisateur
CREATE OR REPLACE FUNCTION add_coins(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET elite_coins = elite_coins + amount
  WHERE id = user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur introuvable';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fonction pour obtenir l'historique des cadeaux reçus
CREATE OR REPLACE FUNCTION get_received_gifts(user_id UUID, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  sender_id UUID,
  sender_username TEXT,
  gift_id TEXT,
  gift_name TEXT,
  gift_emoji TEXT,
  coins_amount INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gt.id,
    gt.sender_id,
    p.username as sender_username,
    gt.gift_id,
    gt.gift_name,
    gt.gift_emoji,
    gt.coins_amount,
    gt.created_at
  FROM gift_transactions gt
  JOIN profiles p ON gt.sender_id = p.id
  WHERE gt.recipient_id = user_id
  ORDER BY gt.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Fonction pour obtenir l'historique des cadeaux envoyés
CREATE OR REPLACE FUNCTION get_sent_gifts(user_id UUID, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  recipient_id UUID,
  recipient_username TEXT,
  gift_id TEXT,
  gift_name TEXT,
  gift_emoji TEXT,
  coins_amount INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gt.id,
    gt.recipient_id,
    p.username as recipient_username,
    gt.gift_id,
    gt.gift_name,
    gt.gift_emoji,
    gt.coins_amount,
    gt.created_at
  FROM gift_transactions gt
  JOIN profiles p ON gt.recipient_id = p.id
  WHERE gt.sender_id = user_id
  ORDER BY gt.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Fonction pour obtenir le total de coins reçus
CREATE OR REPLACE FUNCTION get_total_coins_received(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT COALESCE(SUM(coins_amount), 0) INTO total
  FROM gift_transactions
  WHERE recipient_id = user_id;

  RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Row Level Security (RLS)
ALTER TABLE gift_transactions ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir les transactions où ils sont sender ou recipient
CREATE POLICY "Users can view their own gift transactions"
  ON gift_transactions
  FOR SELECT
  USING (
    auth.uid() = sender_id OR
    auth.uid() = recipient_id
  );

-- Politique : Les utilisateurs peuvent créer des transactions uniquement en tant que sender
CREATE POLICY "Users can create gift transactions as sender"
  ON gift_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Commentaires
COMMENT ON TABLE gift_transactions IS 'Historique des cadeaux virtuels envoyés entre utilisateurs';
COMMENT ON FUNCTION deduct_coins IS 'Déduit des EliteCoins du solde d''un utilisateur';
COMMENT ON FUNCTION add_coins IS 'Ajoute des EliteCoins au solde d''un utilisateur';
COMMENT ON FUNCTION get_received_gifts IS 'Récupère l''historique des cadeaux reçus par un utilisateur';
COMMENT ON FUNCTION get_sent_gifts IS 'Récupère l''historique des cadeaux envoyés par un utilisateur';
COMMENT ON FUNCTION get_total_coins_received IS 'Calcule le total de coins reçus par un utilisateur';
