import { createClient } from '@supabase/supabase-js'

// Composant Server pour générer des liens internes vers les annonces (SEO)
// Ces liens sont visibles par les crawlers mais cachés visuellement

async function getApprovedAds() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return []
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data: ads, error } = await supabase
    .from('ads')
    .select('id, title, location, user_id')
    .eq('status', 'approved')
    .order('updated_at', { ascending: false })
    .limit(500) // Limiter à 500 annonces pour ne pas surcharger

  if (error || !ads) {
    return []
  }

  // Récupérer les usernames
  const userIds = ads.map(ad => ad.user_id)
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
}

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
