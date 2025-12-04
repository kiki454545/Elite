import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Top de la Semaine - Escorts les plus populaires | SexElite',
  description: 'Découvrez les 20 escorts les plus vues cette semaine en Europe. Classement hebdomadaire des profils les plus populaires sur SexElite. Escorts de luxe, profils vérifiés.',
  keywords: [
    'top escort', 'escort populaire', 'meilleure escort', 'escort de la semaine',
    'escort tendance', 'escort hot', 'escort sexy', 'classement escort',
    'escort Europe top', 'escort premium', 'escort luxe', 'best escort'
  ],
  alternates: {
    canonical: 'https://www.sexelite.eu/top-week',
  },
  openGraph: {
    title: 'Top de la Semaine - Escorts les plus populaires | SexElite',
    description: 'Découvrez les 20 escorts les plus vues cette semaine en Europe.',
    url: 'https://www.sexelite.eu/top-week',
    type: 'website',
  },
}

export default function TopWeekLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
