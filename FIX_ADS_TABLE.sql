-- Supprimer les tables existantes (dans le bon ordre à cause des foreign keys)
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.ads CASCADE;

-- Recréer la table ads avec TOUTES les colonnes nécessaires
CREATE TABLE public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Informations de base
  title VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,

  -- Localisation
  location VARCHAR(255) NOT NULL,
  country VARCHAR(2) DEFAULT 'FR',
  nearby_cities TEXT[] DEFAULT '{}',

  -- Catégories et services
  categories TEXT[] NOT NULL DEFAULT '{}',
  meeting_places TEXT[] DEFAULT '{}',

  -- Prix
  price INTEGER,

  -- Photos (URLs)
  photos TEXT[] NOT NULL DEFAULT '{}',

  -- Statut
  status VARCHAR(20) DEFAULT 'pending',
  verified BOOLEAN DEFAULT false,

  -- Statistiques
  views INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,

  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Créer les index
CREATE INDEX ads_user_id_idx ON public.ads(user_id);
CREATE INDEX ads_location_idx ON public.ads(location);
CREATE INDEX ads_status_idx ON public.ads(status);
CREATE INDEX ads_created_at_idx ON public.ads(created_at DESC);
CREATE INDEX ads_categories_idx ON public.ads USING GIN(categories);

-- Activer RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
DROP POLICY IF EXISTS "Annonces approuvées visibles par tous" ON public.ads;
CREATE POLICY "Annonces approuvées visibles par tous"
  ON public.ads FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Utilisateurs peuvent créer leurs annonces" ON public.ads;
CREATE POLICY "Utilisateurs peuvent créer leurs annonces"
  ON public.ads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utilisateurs peuvent modifier leurs annonces" ON public.ads;
CREATE POLICY "Utilisateurs peuvent modifier leurs annonces"
  ON public.ads FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utilisateurs peuvent supprimer leurs annonces" ON public.ads;
CREATE POLICY "Utilisateurs peuvent supprimer leurs annonces"
  ON public.ads FOR DELETE
  USING (auth.uid() = user_id);

-- Créer la fonction pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS update_ads_updated_at ON public.ads;
CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Recréer la table favorites
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ad_id)
);

-- Index pour favorites
CREATE INDEX favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX favorites_ad_id_idx ON public.favorites(ad_id);

-- RLS pour favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Utilisateurs peuvent voir leurs favoris" ON public.favorites;
CREATE POLICY "Utilisateurs peuvent voir leurs favoris"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utilisateurs peuvent ajouter des favoris" ON public.favorites;
CREATE POLICY "Utilisateurs peuvent ajouter des favoris"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utilisateurs peuvent retirer des favoris" ON public.favorites;
CREATE POLICY "Utilisateurs peuvent retirer des favoris"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);
