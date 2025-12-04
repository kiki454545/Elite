import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'

// Composant Server pour générer des liens internes vers les annonces (SEO)
// Ces liens sont visibles par les crawlers mais cachés visuellement

// Cache des annonces pour 1 heure (revalidation automatique)
const getApprovedAds = unstable_cache(
  async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return []
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Une seule requête optimisée - sélection minimale
    const { data: ads, error } = await supabase
      .from('ads')
      .select('id, title, location, user_id')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false })
      .limit(200) // Réduit à 200 pour le chargement initial

    if (error || !ads) {
      return []
    }

    // Récupérer les usernames en une seule requête (dédupliqués)
    const userIds = [...new Set(ads.map(ad => ad.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds)

    const profilesMap = new Map(profiles?.map(p => [p.id, p.username]) || [])

    return ads.map(ad => ({
      id: ad.id,
      title: profilesMap.get(ad.user_id) || ad.title || 'Escort',
      location: ad.location || 'Europe',
    }))
  },
  ['seo-ads-links'],
  { revalidate: 3600 } // Cache pour 1 heure
)

export async function SeoAdsLinks() {
  const ads = await getApprovedAds()

  if (ads.length === 0) {
    return null
  }

  return (
    // Liens SEO - visibles par les crawlers, cachés visuellement
    <nav className="sr-only" aria-label="Toutes les annonces">
      <h2>Annonces d&apos;escorts disponibles</h2>
      <ul>
        {ads.map(ad => (
          <li key={ad.id}>
            <a href={`/ads/${ad.id}`}>
              {ad.title} - Escort {ad.location}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
