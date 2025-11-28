-- Table pour tracker les visites
CREATE TABLE IF NOT EXISTS visitor_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL, -- Support IPv6
  user_agent TEXT,
  page_path TEXT,
  referrer TEXT,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_visitor_stats_ip ON visitor_stats(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitor_stats_visited_at ON visitor_stats(visited_at);
CREATE INDEX IF NOT EXISTS idx_visitor_stats_date ON visitor_stats(DATE(visited_at));

-- Vue pour les stats quotidiennes
CREATE OR REPLACE VIEW daily_visitor_stats AS
SELECT
  DATE(visited_at) as visit_date,
  COUNT(*) as total_visits,
  COUNT(DISTINCT ip_address) as unique_visitors
FROM visitor_stats
GROUP BY DATE(visited_at)
ORDER BY visit_date DESC;

-- Fonction pour obtenir les stats
CREATE OR REPLACE FUNCTION get_visitor_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_unique_visitors', (SELECT COUNT(DISTINCT ip_address) FROM visitor_stats),
    'total_visits', (SELECT COUNT(*) FROM visitor_stats),
    'today_unique_visitors', (SELECT COUNT(DISTINCT ip_address) FROM visitor_stats WHERE DATE(visited_at) = CURRENT_DATE),
    'today_total_visits', (SELECT COUNT(*) FROM visitor_stats WHERE DATE(visited_at) = CURRENT_DATE),
    'yesterday_unique_visitors', (SELECT COUNT(DISTINCT ip_address) FROM visitor_stats WHERE DATE(visited_at) = CURRENT_DATE - 1),
    'yesterday_total_visits', (SELECT COUNT(*) FROM visitor_stats WHERE DATE(visited_at) = CURRENT_DATE - 1)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
