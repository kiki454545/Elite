import { Metadata } from 'next'
import { CITY_SEO_DATA, getCityFromSlug } from '@/lib/citySeoData'

type Props = {
  params: Promise<{ city: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const cityData = getCityFromSlug(city)

  if (!cityData) {
    return {
      title: 'Page non trouvée | SexElite',
      description: 'La page que vous recherchez n\'existe pas.',
    }
  }

  const countryName = cityData.country === 'FR' ? 'France' :
    cityData.country === 'BE' ? 'Belgique' :
    cityData.country === 'CH' ? 'Suisse' : 'Europe'

  return {
    title: `Escorts ${cityData.name} - Escort girls et accompagnatrices ${cityData.name} | SexElite`,
    description: `Annonces d'escorts à ${cityData.name}. Trouvez des escort girls, accompagnatrices de luxe et escorts indépendantes à ${cityData.name}, ${countryName}. Profils vérifiés sur SexElite.`,
    keywords: [
      `escort ${cityData.name}`, `escort girl ${cityData.name}`, `escorts ${cityData.name}`,
      `accompagnatrice ${cityData.name}`, `escort de luxe ${cityData.name}`, `escort VIP ${cityData.name}`,
      `escort indépendante ${cityData.name}`, `annonces escort ${cityData.name}`,
      `escort ${countryName}`, `escort près de ${cityData.name}`,
      `massage ${cityData.name}`, `escort trans ${cityData.name}`,
      `escort blonde ${cityData.name}`, `escort brune ${cityData.name}`,
      `rencontre ${cityData.name}`, `escort premium ${cityData.name}`,
      ...cityData.keywords
    ],
    alternates: {
      canonical: `https://www.sexelite.eu/escort/${city}`,
    },
    openGraph: {
      title: `Escorts ${cityData.name} - Les meilleures escorts | SexElite`,
      description: `Trouvez des escort girls et accompagnatrices à ${cityData.name}. Profils vérifiés, escorts de luxe.`,
      url: `https://www.sexelite.eu/escort/${city}`,
      type: 'website',
      siteName: 'SexElite',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary',
      title: `Escorts ${cityData.name} | SexElite`,
      description: `Annonces d'escorts à ${cityData.name}. Escort girls, accompagnatrices de luxe.`,
    },
  }
}

export async function generateStaticParams() {
  return Object.keys(CITY_SEO_DATA).map((city) => ({
    city: city,
  }))
}

export default function CityLayout({ children }: { children: React.ReactNode }) {
  return children
}
