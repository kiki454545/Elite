import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type Props = {
  params: { id: string }
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Récupérer l'annonce
  const { data: ad } = await supabase
    .from('ads')
    .select('id, title, description, location, photos, user_id')
    .eq('id', params.id)
    .single()

  if (!ad) {
    return {
      title: 'Annonce non trouvée - SexElite',
      description: 'Cette annonce n\'existe plus ou a été supprimée.',
    }
  }

  // Récupérer le profil séparément
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, age')
    .eq('id', ad.user_id)
    .single()

  const username = profile?.username || 'Escort'
  const age = profile?.age || ''
  const location = ad.location || 'Europe'
  const description = ad.description?.substring(0, 160) || `Découvrez le profil de ${username} sur SexElite.eu`
  const photo = ad.photos?.[0] || 'https://www.sexelite.eu/apple-touch-icon.png'

  const title = `${username}${age ? `, ${age} ans` : ''} - Escort ${location} | SexElite`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `https://www.sexelite.eu/ads/${params.id}`,
      images: [
        {
          url: photo,
          width: 800,
          height: 600,
          alt: `Photo de ${username}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [photo],
    },
  }
}

export default function AdLayout({ children }: Props) {
  return children
}
