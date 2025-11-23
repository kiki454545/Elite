# Configuration du Système de Top Hebdomadaire

## Vue d'ensemble

Ce système permet d'afficher un classement hebdomadaire des 20 escortes les plus vues, avec réinitialisation automatique tous les lundis à minuit UTC.

## Fonctionnalités

- ✅ **Compteur hebdomadaire** : Chaque annonce a un compteur `weekly_views` qui s'incrémente à chaque vue
- ✅ **Reset automatique** : Tous les lundis à 00:00 UTC, tous les compteurs sont remis à 0
- ✅ **Page dédiée** : `/top-week` affiche le top 20 basé sur les vues hebdomadaires
- ✅ **Mise à jour en temps réel** : Le classement se met à jour automatiquement en fonction des nouvelles vues
- ✅ **Log des resets** : Chaque reset est enregistré dans la table `weekly_reset_log`

## Installation

### Étape 1 : Exécuter le SQL dans Supabase

Connectez-vous à votre projet Supabase et allez dans l'éditeur SQL, puis exécutez :

```sql
-- 1. Ajouter la colonne weekly_views
ALTER TABLE ads ADD COLUMN IF NOT EXISTS weekly_views INTEGER DEFAULT 0;

-- 2. Créer la table de log
CREATE TABLE IF NOT EXISTS weekly_reset_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ads_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer l'index pour les performances
CREATE INDEX IF NOT EXISTS idx_ads_weekly_views ON ads(weekly_views DESC);

-- 4. Créer la fonction de reset
CREATE OR REPLACE FUNCTION reset_weekly_views()
RETURNS void AS $$
DECLARE
  ads_updated INTEGER;
BEGIN
  SELECT COUNT(*) INTO ads_updated FROM ads WHERE status = 'approved';
  UPDATE ads SET weekly_views = 0;
  INSERT INTO weekly_reset_log (reset_date, ads_count)
  VALUES (NOW(), ads_updated);
  RAISE NOTICE 'Weekly views reset completed for % ads', ads_updated;
END;
$$ LANGUAGE plpgsql;
```

### Étape 2 : Initialiser les compteurs

Exécutez ce script Node.js pour initialiser les compteurs :

```bash
node scripts/setup_weekly_views.mjs
```

### Étape 3 : Configurer la variable d'environnement CRON_SECRET

Ajoutez cette variable dans votre projet Vercel :

1. Allez sur le dashboard Vercel
2. Sélectionnez votre projet
3. Allez dans Settings > Environment Variables
4. Ajoutez `CRON_SECRET` avec une valeur secrète (par exemple un UUID)

Ajoutez aussi localement dans `.env.local` :

```env
CRON_SECRET=votre-secret-ici
```

### Étape 4 : Déployer sur Vercel

Le fichier `vercel.json` est déjà configuré avec le cron job :

```json
{
  "crons": [
    {
      "path": "/api/cron/reset-weekly-views",
      "schedule": "0 0 * * 1"
    }
  ]
}
```

Déployez simplement votre projet :

```bash
git add .
git commit -m "feat: Add weekly views ranking system"
git push
```

Le cron job sera automatiquement activé sur Vercel.

## Architecture

### Fichiers modifiés/créés

1. **scripts/create_weekly_views.sql** : Script SQL pour la structure de base
2. **scripts/setup_weekly_views.mjs** : Script d'initialisation
3. **src/app/api/cron/reset-weekly-views/route.ts** : API route pour le reset hebdomadaire
4. **src/app/api/views/route.ts** : Modifié pour incrémenter `weekly_views`
5. **src/components/TopWeekGrid.tsx** : Modifié pour utiliser `weekly_views`
6. **src/app/top-week/page.tsx** : Page du top hebdomadaire
7. **vercel.json** : Configuration du cron job

### Base de données

#### Table `ads`
- Nouvelle colonne : `weekly_views INTEGER DEFAULT 0`

#### Table `weekly_reset_log` (nouvelle)
- `id` : UUID
- `reset_date` : Timestamp du reset
- `ads_count` : Nombre d'annonces affectées
- `created_at` : Date de création du log

#### Fonction `reset_weekly_views()`
- Réinitialise tous les compteurs à 0
- Enregistre un log du reset
- Peut être appelée manuellement si nécessaire

### API Routes

#### POST/GET `/api/views`
Modifié pour incrémenter à la fois `views` et `weekly_views` :
```typescript
await supabase
  .from('ads')
  .update({
    views: (ad.views || 0) + 1,
    weekly_views: (ad.weekly_views || 0) + 1
  })
  .eq('id', adId)
```

#### GET/POST `/api/cron/reset-weekly-views`
- Appelé automatiquement tous les lundis à 00:00 UTC
- Requiert un header `Authorization: Bearer {CRON_SECRET}`
- Appelle la fonction SQL `reset_weekly_views()`
- Retourne les stats du reset

## Utilisation

### Voir le classement
Accédez à `/top-week` pour voir le top 20 de la semaine.

### Tester le reset manuellement

**Option 1 : Via l'API**
```bash
curl -X POST https://votre-domaine.com/api/cron/reset-weekly-views \
  -H "Authorization: Bearer votre-cron-secret"
```

**Option 2 : Via Supabase SQL Editor**
```sql
SELECT reset_weekly_views();
```

### Vérifier l'historique des resets
```sql
SELECT * FROM weekly_reset_log ORDER BY created_at DESC;
```

### Voir le classement actuel
```sql
SELECT
  username,
  location,
  weekly_views,
  views as total_views
FROM ads
WHERE status = 'approved'
ORDER BY weekly_views DESC
LIMIT 20;
```

## Planification du Cron

Le cron est configuré pour s'exécuter tous les **lundis à 00:00 UTC**.

Format cron : `0 0 * * 1`
- `0` : Minute 0
- `0` : Heure 0 (minuit)
- `*` : Tous les jours du mois
- `*` : Tous les mois
- `1` : Lundi (0 = dimanche, 1 = lundi, etc.)

## Dépannage

### Le compteur weekly_views n'existe pas
Exécutez le SQL de l'étape 1 dans Supabase.

### Le cron job ne s'exécute pas
1. Vérifiez que `CRON_SECRET` est défini dans Vercel
2. Vérifiez les logs de déploiement Vercel
3. Testez l'endpoint manuellement avec curl

### Le classement ne se met pas à jour
1. Vérifiez que les vues s'incrémentent bien (voir `/api/views`)
2. Rafraîchissez la page `/top-week`
3. Vérifiez les logs dans la console du navigateur

### Les vues ne s'incrémentent pas
Vérifiez que la colonne `weekly_views` existe :
```sql
SELECT weekly_views FROM ads LIMIT 1;
```

## Monitoring

### Voir les derniers resets
```sql
SELECT
  reset_date,
  ads_count,
  created_at
FROM weekly_reset_log
ORDER BY created_at DESC
LIMIT 10;
```

### Statistiques du top
```sql
SELECT
  AVG(weekly_views) as moyenne,
  MAX(weekly_views) as maximum,
  MIN(weekly_views) as minimum,
  COUNT(*) as total_ads
FROM ads
WHERE status = 'approved';
```

## Notes importantes

- ⚠️ **Ne pas déployer** sans avoir exécuté le SQL dans Supabase
- ⚠️ Le reset se fait tous les **lundis à minuit UTC** (pas heure locale)
- ✅ Les vues totales (`views`) ne sont **jamais réinitialisées**, seul `weekly_views` l'est
- ✅ Le classement se met à jour en temps réel au fur et à mesure des nouvelles vues
- ✅ L'historique des resets est conservé indéfiniment dans `weekly_reset_log`
