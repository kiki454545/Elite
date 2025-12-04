import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

type Props = {
  params: { id: string }
  children: React.ReactNode
}

// Fonction pour récupérer les données de l'annonce (utilisée par generateMetadata et le layout)
async function getAdData(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data: ad, error: adError } = await supabase
    .from('ads')
    .select('id, title, description, location, photos, user_id')
    .eq('id', id)
    .single()

  if (adError || !ad) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, age')
    .eq('id', ad.user_id)
    .single()

  return {
    username: profile?.username || 'Escort',
    age: profile?.age || '',
    location: ad.location || 'Europe',
    description: ad.description?.substring(0, 160) || '',
    photo: ad.photos?.[0] || 'https://www.sexelite.eu/apple-touch-icon.png',
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getAdData(params.id)

  if (!data) {
    return {
      title: 'Escort de luxe | SexElite',
      description: 'Découvrez cette escort de luxe sur SexElite.eu, la plateforme N°1 en Europe.',
    }
  }

  const { username, age, location, description, photo } = data
  const title = `${username}${age ? `, ${age} ans` : ''} - Escort ${location} | SexElite`
  const desc = description || `Découvrez le profil de ${username} sur SexElite.eu`

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
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
      description: desc,
      images: [photo],
    },
  }
}

export default async function AdLayout({ params, children }: Props) {
  const data = await getAdData(params.id)

  // H1 SEO visible par les crawlers mais caché visuellement (le composant client affiche son propre H1 stylisé)
  const h1Text = data
    ? `${data.username}${data.age ? `, ${data.age} ans` : ''} - Escort ${data.location}`
    : 'Escort de luxe'

  return (
    <>
      {/* H1 SEO - visible par les crawlers, caché visuellement car le composant client a son propre H1 stylisé */}
      <h1 className="sr-only">{h1Text}</h1>
      {children}
    </>
  )
}
