import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { CountryProvider } from '@/contexts/CountryContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { MessagesProvider } from '@/contexts/MessagesContext'
import { CityFilterProvider } from '@/contexts/CityFilterContext'
import { AdsProvider } from '@/contexts/AdsContext'
import { AgeVerificationModal } from '@/components/AgeVerificationModal'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'SexElite - Annonces d\'Escorts de Luxe',
  description: 'Plateforme d\'annonces libertines premium. Découvrez des profils vérifiés d\'escorts de luxe à Malte.',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'SexElite - Annonces d\'Escorts de Luxe',
    description: 'Plateforme d\'annonces libertines premium',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SexElite',
    url: 'https://sexelite.eu',
    description: 'Plateforme N°1 d\'annonces escortes et libertines à Malte',
    inLanguage: 'fr',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://sexelite.eu/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased overflow-x-hidden flex flex-col min-h-screen">
        <AuthProvider>
          <LanguageProvider>
            <FavoritesProvider>
              <MessagesProvider>
                <CountryProvider>
                  <CityFilterProvider>
                    <AdsProvider>
                      <AgeVerificationModal />
                      <div className="flex-1">
                        {children}
                      </div>
                      <Footer />
                    </AdsProvider>
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
