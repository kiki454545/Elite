import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Top 50 Escorts - Classement des meilleures escorts | SexElite',
  description: 'Le classement officiel des 50 meilleures escorts sur SexElite. Basé sur les votes de la communauté. Découvrez les profils les plus appréciés d\'Europe.',
  keywords: [
    'top 50 escort', 'classement escort', 'meilleure escort Europe',
    'escort populaire', 'escort votée', 'escort recommandée',
    'escort préférée', 'escort numéro 1', 'best escort Europe',
    'escort ranking', 'escort award', 'escort star'
  ],
  alternates: {
    canonical: 'https://www.sexelite.eu/top-50',
  },
  openGraph: {
    title: 'Top 50 Escorts - Les meilleures escorts | SexElite',
    description: 'Le classement officiel des 50 meilleures escorts basé sur les votes de la communauté.',
    url: 'https://www.sexelite.eu/top-50',
    type: 'website',
  },
}

export default function Top50Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
