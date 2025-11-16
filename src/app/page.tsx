import { ProfileGrid } from '@/components/ProfileGrid'
import { BottomNavigation } from '@/components/BottomNavigation'
import { Header } from '@/components/Header'
import { ScrollToTop } from '@/components/ScrollToTop'
import { AdsStats } from '@/components/AdsStats'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 pb-20">
      <Header />
      <AdsStats />
      <ProfileGrid />
      <BottomNavigation />
      <ScrollToTop />
    </main>
  )
}
