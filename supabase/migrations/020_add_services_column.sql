-- Ajouter la colonne services pour stocker les services d'escorte proposés
ALTER TABLE public.ads
ADD COLUMN IF NOT EXISTS services TEXT[] DEFAULT '{}';

-- Créer un index GIN pour optimiser les recherches sur les services
CREATE INDEX IF NOT EXISTS ads_services_idx ON public.ads USING GIN(services);

-- Commentaire pour documenter la colonne
COMMENT ON COLUMN public.ads.services IS 'Services d''escorte proposés (GFE, PSE, massages, etc.)';
