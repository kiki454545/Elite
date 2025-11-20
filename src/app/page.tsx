import { ProfileGrid } from '@/components/ProfileGrid'
import { BottomNavigation } from '@/components/BottomNavigation'
import { Header } from '@/components/Header'
import { ScrollToTop } from '@/components/ScrollToTop'
import { AdsStats } from '@/components/AdsStats'
import { SeoHero, SeoFooterContent } from '@/components/SeoContent'
import { DynamicMetadata } from '@/components/DynamicMetadata'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SexElite - Annonces Escortes & Libertines Premium | Plus de 270 Profils',
  description: 'SexElite : Plateforme N°1 d\'annonces escortes et libertines. Découvrez plus de 270 profils vérifiés d\'escorts de luxe, accompagnatrices et libertines. Discrétion absolue garantie.',
  keywords: [
    'sexelite',
    'escorte',
    'escort',
    'libertine',
    'annonces escortes',
    'escort premium',
    'escorts vérifiées',
    'accompagnatrice',
    'rencontre libertine',
    'annonces libertines',
    'escort girl',
    'plateforme escort',
    'la valette',
    'st julians',
    'sliema',
    'malte'
  ],
  openGraph: {
    title: 'SexElite - Annonces Escortes & Libertines Premium',
    description: 'Plus de 270 profils vérifiés d\'escorts et libertines de luxe',
    type: 'website',
    url: 'https://sexelite.eu',
    siteName: 'SexElite',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 pb-20 overflow-x-hidden">
      <DynamicMetadata />
      <Header />
      <SeoHero />
      <AdsStats />
      <ProfileGrid />
      <SeoFooterContent />
      <BottomNavigation />
      <ScrollToTop />
    </main>
  )
}
