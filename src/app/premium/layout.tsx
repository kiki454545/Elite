import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Escorts Premium & VIP - Profils de luxe vérifiés | SexElite',
  description: 'Accédez aux profils Premium et VIP de SexElite. Escorts de luxe vérifiées, accompagnatrices haut de gamme, services exclusifs. La crème des escorts en Europe.',
  keywords: [
    'escort premium', 'escort VIP', 'escort luxe', 'escort haut de gamme',
    'escort exclusive', 'accompagnatrice luxe', 'escort 5 étoiles',
    'escort select', 'escort elite', 'escort top model', 'escort mannequin',
    'escort vérifié', 'escort certifié', 'escort de confiance'
  ],
  alternates: {
    canonical: 'https://www.sexelite.eu/premium',
  },
  openGraph: {
    title: 'Escorts Premium & VIP - Profils de luxe | SexElite',
    description: 'Escorts de luxe vérifiées, accompagnatrices haut de gamme. La crème des escorts en Europe.',
    url: 'https://www.sexelite.eu/premium',
    type: 'website',
  },
}

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
