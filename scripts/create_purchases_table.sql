-- Table pour historique des achats sur le site
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  purchase_type TEXT NOT NULL, -- 'rank', 'coins', 'boost', etc.
  item_name TEXT NOT NULL, -- Nom de l'article acheté (ex: "VIP", "1000 Elite Coins")
  amount INTEGER NOT NULL, -- Montant payé (en coins ou en centimes pour Stripe)
  currency TEXT NOT NULL DEFAULT 'coins', -- 'coins', 'eur', 'usd'
  payment_method TEXT, -- 'elite_coins', 'stripe', 'dedipass'
  metadata JSONB, -- Données supplémentaires (durée, quantité, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_type ON purchases(purchase_type);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);

-- Row Level Security
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres achats
CREATE POLICY "Users can view their own purchases"
  ON purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique : Seul le système peut créer des achats (via service role)
CREATE POLICY "Only service role can insert purchases"
  ON purchases
  FOR INSERT
  WITH CHECK (false); -- Empêche l'insertion directe depuis le client

-- Commentaires
COMMENT ON TABLE purchases IS 'Historique de tous les achats effectués par les utilisateurs';
COMMENT ON COLUMN purchases.purchase_type IS 'Type d''achat : rank, coins, boost, etc.';
COMMENT ON COLUMN purchases.item_name IS 'Nom lisible de l''article acheté';
COMMENT ON COLUMN purchases.amount IS 'Montant payé en coins ou centimes';
COMMENT ON COLUMN purchases.currency IS 'Devise utilisée : coins, eur, usd';
COMMENT ON COLUMN purchases.payment_method IS 'Méthode de paiement : elite_coins, stripe, dedipass';
COMMENT ON COLUMN purchases.metadata IS 'Données JSON supplémentaires (durée, quantité, détails)';
