-- SCRIPT DE CONFIGURATION COMPLET
-- Exécutez ce script dans le SQL Editor de Supabase

-- 1. Supprimer les tables existantes (si elles existent)
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.ads CASCADE;

-- 2. Supprimer les fonctions et triggers existants
DROP TRIGGER IF EXISTS update_ads_updated_at ON public.ads;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 3. Créer la table des annonces
CREATE TABLE public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Informations de base
  title VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,

  -- Localisation
  location VARCHAR(255) NOT NULL,
  country VARCHAR(2) DEFAULT 'FR',
  nearby_cities TEXT[],

  -- Catégories et services
  categories TEXT[] NOT NULL,
  meeting_places TEXT[],

  -- Prix
  price INTEGER,

  -- Photos (URLs des photos uploadées)
  photos TEXT[] NOT NULL,

  -- Statut
  status VARCHAR(20) DEFAULT 'pending',
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

-- 4. Créer les index pour améliorer les performances
CREATE INDEX ads_user_id_idx ON public.ads(user_id);
CREATE INDEX ads_location_idx ON public.ads(location);
CREATE INDEX ads_status_idx ON public.ads(status);
CREATE INDEX ads_created_at_idx ON public.ads(created_at DESC);
CREATE INDEX ads_categories_idx ON public.ads USING GIN(categories);

-- 5. Activer RLS (Row Level Security)
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- 6. Créer les politiques de sécurité
CREATE POLICY "Annonces approuvées visibles par tous"
  ON public.ads
  FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent créer leurs annonces"
  ON public.ads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leurs annonces"
  ON public.ads
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent supprimer leurs annonces"
  ON public.ads
  FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Créer la fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Créer le trigger pour updated_at
CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Créer la table des favoris
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, ad_id)
);

-- 10. Créer les index pour les favoris
CREATE INDEX favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX favorites_ad_id_idx ON public.favorites(ad_id);

-- 11. Activer RLS pour les favoris
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 12. Créer les politiques pour les favoris
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
