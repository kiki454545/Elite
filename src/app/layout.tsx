import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { CountryProvider } from '@/contexts/CountryContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { MessagesProvider } from '@/contexts/MessagesContext'
import { CityFilterProvider } from '@/contexts/CityFilterContext'
import { AgeVerificationModal } from '@/components/AgeVerificationModal'

export const metadata: Metadata = {
  title: 'SexElite',
  description: 'Plateforme d\'annonce Libertine',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="antialiased overflow-x-hidden">
        <AuthProvider>
          <LanguageProvider>
            <FavoritesProvider>
              <MessagesProvider>
                <CountryProvider>
                  <CityFilterProvider>
                    <AgeVerificationModal />
                    {children}
                  </CityFilterProvider>
                </CountryProvider>
              </MessagesProvider>
            </FavoritesProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
