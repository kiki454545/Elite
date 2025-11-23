import { TopWeekGrid } from '@/components/TopWeekGrid'
import { BottomNavigation } from '@/components/BottomNavigation'
import { Header } from '@/components/Header'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Top de la Semaine - Les Escortes les Plus Vues | SexElite',
  description: 'Découvrez les 20 escortes les plus populaires de la semaine sur SexElite. Classement basé sur le nombre de vues, tous pays confondus.',
  keywords: [
    'top escortes',
    'escortes populaires',
    'classement escortes',
    'meilleures escortes',
    'top semaine',
    'escorts tendance',
  ],
  openGraph: {
    title: 'Top de la Semaine - SexElite',
    description: 'Les 20 escortes les plus vues de la semaine',
    type: 'website',
  },
}

export default function TopWeekPage() {
  return (
    <main className="min-h-screen bg-gray-950 pb-20">
      <Header />

      {/* Hero Section */}
      <div className="max-w-screen-xl mx-auto px-4 pt-24 pb-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🔥 Top de la Semaine
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Découvrez les 20 escortes les plus populaires de la semaine, tous pays confondus
          </p>
        </div>
      </div>

      <TopWeekGrid />
      <BottomNavigation />
      <ScrollToTop />
    </main>
  )
}
