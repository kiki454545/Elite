import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recherche Escorts - Trouvez votre escort idéale | SexElite',
  description: 'Recherchez parmi des milliers d\'annonces d\'escorts en France, Belgique et Suisse. Filtres avancés par ville, catégorie, caractéristiques physiques. Trouvez l\'escort parfaite près de chez vous.',
  keywords: [
    'recherche escort', 'trouver escort', 'escort près de moi', 'escort par ville',
    'escort Paris', 'escort Lyon', 'escort Marseille', 'escort Bruxelles', 'escort Genève',
    'escort blonde', 'escort brune', 'escort trans', 'escort massage',
    'annonces escort France', 'escort disponible', 'escort maintenant'
  ],
  alternates: {
    canonical: 'https://www.sexelite.eu/search',
  },
  openGraph: {
    title: 'Recherche Escorts - Trouvez votre escort idéale | SexElite',
    description: 'Recherchez parmi des milliers d\'annonces d\'escorts. Filtres avancés par ville et caractéristiques.',
    url: 'https://www.sexelite.eu/search',
    type: 'website',
  },
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
