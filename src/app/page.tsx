'use client'

import { TopWeekGrid } from '@/components/TopWeekGrid'
import { ProfileGrid } from '@/components/ProfileGrid'
import { BottomNavigation } from '@/components/BottomNavigation'
import { Header } from '@/components/Header'
import { ScrollToTop } from '@/components/ScrollToTop'
import { AdsStats } from '@/components/AdsStats'
import { SeoHero, SeoFooterContent } from '@/components/SeoContent'
import { DynamicMetadata } from '@/components/DynamicMetadata'
import { useCountry } from '@/contexts/CountryContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function HomePage() {
  const { selectedCountry } = useCountry()
  const { t } = useLanguage()

  // Si "Choix du Pays" est sélectionné, afficher le Top Semaine
  const showTopWeek = selectedCountry.code === 'ALL'
  if (showTopWeek) {
    // Afficher le Top de la Semaine
    return (
      <main className="min-h-screen bg-gray-950 pb-20 md:pb-0">
        <Header />
        <BottomNavigation />

        {/* Hero Section */}
        <div className="max-w-screen-xl mx-auto px-4 pt-24 pb-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              🔥 {t('topWeek.title')}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('topWeek.description')}
            </p>
          </div>
        </div>

        <TopWeekGrid />
        <ScrollToTop />
      </main>
    )
  }

  // Afficher les annonces du pays sélectionné
  return (
    <main className="min-h-screen bg-gray-950 pb-20 md:pb-0">
      <DynamicMetadata />
      <Header />
      <BottomNavigation />
      <SeoHero />
      <AdsStats />
      <ProfileGrid />
      <SeoFooterContent />
      <ScrollToTop />
    </main>
  )
}
