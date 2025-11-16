# Configuration de la base de données Supabase

## Étape 1: Créer la table des annonces

1. Allez sur [Supabase](https://supabase.com)
2. Ouvrez votre projet
3. Allez dans **SQL Editor**
4. Copiez et exécutez le SQL suivant :

```sql
-- Copier le contenu du fichier: supabase/migrations/003_create_ads_table.sql
```

Ou copiez directement ce SQL :

```sql
-- Table pour les annonces
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  country VARCHAR(2) DEFAULT 'FR',
  nearby_cities TEXT[],
  categories TEXT[] NOT NULL,
  meeting_places TEXT[],
  price INTEGER,
  photos TEXT[] NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  verified BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  CONSTRAINT ads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ads_user_id_idx ON public.ads(user_id);
CREATE INDEX IF NOT EXISTS ads_location_idx ON public.ads(location);
CREATE INDEX IF NOT EXISTS ads_status_idx ON public.ads(status);
CREATE INDEX IF NOT EXISTS ads_created_at_idx ON public.ads(created_at DESC);
CREATE INDEX IF NOT EXISTS ads_categories_idx ON public.ads USING GIN(categories);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Annonces approuvées visibles par tous"
  ON public.ads FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent créer leurs annonces"
  ON public.ads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leurs annonces"
  ON public.ads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent supprimer leurs annonces"
  ON public.ads FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ads_updated_at ON public.ads;
CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ad_id)
);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_ad_id_idx ON public.favorites(ad_id);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs peuvent voir leurs favoris"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent ajouter des favoris"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent retirer des favoris"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);
```

## Étape 2: Créer le bucket de storage pour les photos

1. Dans Supabase, allez dans **Storage**
2. Cliquez sur **New bucket**
3. Nom du bucket: `ad-photos`
4. **Public bucket**: ✅ Coché
5. **File size limit**: 10MB
6. **Allowed MIME types**: image/png, image/jpeg, image/jpg
7. Cliquez sur **Create bucket**

## Étape 3: Configurer les politiques de storage

1. Cliquez sur le bucket `ad-photos`
2. Allez dans **Policies**
3. Créez une politique pour l'upload :

```sql
CREATE POLICY "Utilisateurs authentifiés peuvent uploader"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ad-photos');
```

4. Créez une politique pour la lecture publique :

```sql
CREATE POLICY "Photos publiques"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ad-photos');
```

5. Créez une politique pour la suppression :

```sql
CREATE POLICY "Utilisateurs peuvent supprimer leurs photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ad-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## ✅ Vérification

Une fois ces étapes terminées, vous devriez pouvoir :
- Créer des annonces avec photos
- Les photos sont uploadées dans Supabase Storage
- Les annonces sont sauvegardées dans la table `ads`
- Les utilisateurs peuvent voir leurs propres annonces
