'use client'

import { PremiumGrid } from '@/components/PremiumGrid'
import { BottomNavigation } from '@/components/BottomNavigation'
import { Header } from '@/components/Header'
import { ScrollToTop } from '@/components/ScrollToTop'
import { useLanguage } from '@/contexts/LanguageContext'
import { Crown } from 'lucide-react'

export default function PremiumPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-gray-950 pb-20 md:pb-0">
      <Header />
      <BottomNavigation />

      {/* Hero Section */}
      <div className="max-w-screen-xl mx-auto px-4 pt-24 pb-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-10 h-10 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {t('nav.premium')}
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Découvrez les profils premium
          </p>
        </div>
      </div>

      <PremiumGrid />
      <ScrollToTop />
    </main>
  )
}
