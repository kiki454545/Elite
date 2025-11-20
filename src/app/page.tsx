import { ProfileGrid } from '@/components/ProfileGrid'
import { BottomNavigation } from '@/components/BottomNavigation'
import { Header } from '@/components/Header'
import { ScrollToTop } from '@/components/ScrollToTop'
import { AdsStats } from '@/components/AdsStats'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SexElite - Plateforme d\'Annonces d\'Escorts Premium à Malte',
  description: 'SexElite : Découvrez des annonces d\'escorts de luxe vérifiées à Malte. Profils premium, discrétion assurée. Plus de 270 annonces disponibles.',
  keywords: ['sexelite', 'escort malte', 'escort premium', 'annonces escorts', 'escorts vérifiées', 'malte'],
  openGraph: {
    title: 'SexElite - Escorts Premium à Malte',
    description: 'Plateforme d\'annonces d\'escorts de luxe à Malte',
    type: 'website',
  },
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 pb-20 overflow-x-hidden">
      <Header />
      <AdsStats />
      <ProfileGrid />
      <BottomNavigation />
      <ScrollToTop />
    </main>
  )
}
