-- Table pour les annonces
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Informations de base
  title VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,

  -- Localisation
  location VARCHAR(255) NOT NULL,
  country VARCHAR(2) DEFAULT 'FR',
  nearby_cities TEXT[], -- Array de villes

  -- Catégories et services
  categories TEXT[] NOT NULL,
  meeting_places TEXT[], -- Incall, Hôtel, Outcall, Plan voiture

  -- Prix
  price INTEGER,

  -- Photos (URLs des photos uploadées)
  photos TEXT[] NOT NULL,

  -- Statut
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  verified BOOLEAN DEFAULT false,

  -- Statistiques
  views INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  CONSTRAINT ads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS ads_user_id_idx ON public.ads(user_id);
CREATE INDEX IF NOT EXISTS ads_location_idx ON public.ads(location);
CREATE INDEX IF NOT EXISTS ads_status_idx ON public.ads(status);
CREATE INDEX IF NOT EXISTS ads_created_at_idx ON public.ads(created_at DESC);
CREATE INDEX IF NOT EXISTS ads_categories_idx ON public.ads USING GIN(categories);

-- RLS (Row Level Security)
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut voir les annonces approuvées
CREATE POLICY "Annonces approuvées visibles par tous"
  ON public.ads
  FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent créer leurs propres annonces
CREATE POLICY "Utilisateurs peuvent créer leurs annonces"
  ON public.ads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent modifier leurs propres annonces
CREATE POLICY "Utilisateurs peuvent modifier leurs annonces"
  ON public.ads
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent supprimer leurs propres annonces
CREATE POLICY "Utilisateurs peuvent supprimer leurs annonces"
  ON public.ads
  FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_ads_updated_at ON public.ads;
CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Table pour les favoris
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, ad_id)
);

-- Index pour les favoris
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_ad_id_idx ON public.favorites(ad_id);

-- RLS pour les favoris
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs peuvent voir leurs favoris"
  ON public.favorites
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent ajouter des favoris"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent retirer des favoris"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);
