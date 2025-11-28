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
import CookieBanner from '@/components/CookieBanner'
import { VisitorTracker } from '@/components/VisitorTracker'

// Fonction pour générer les metadata dynamiques
export async function generateMetadata(): Promise<Metadata> {
  const description = `Rejoins des dizaines de milliers de membres et découvre des milliers d'annonces d'escorts et libertines de luxe en Europe. Plateforme N°1 avec profils vérifiés et communauté active.`

  return {
    title: 'SexElite - Plateforme N°1 d\'Escorts et Libertines en Europe',
    description,
    icons: {
      icon: [
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    openGraph: {
      title: 'SexElite - Plateforme N°1 d\'Escorts en Europe',
      description,
      type: 'website',
      url: 'https://www.sexelite.eu',
      images: [
        {
          url: 'https://www.sexelite.eu/apple-touch-icon.png',
          width: 180,
          height: 180,
          alt: 'SexElite Logo',
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: 'SexElite - Plateforme N°1 d\'Escorts en Europe',
      description,
      images: ['https://www.sexelite.eu/apple-touch-icon.png'],
    },
  }
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
    url: 'https://www.sexelite.eu',
    description: `Rejoins des dizaines de milliers de membres et découvre des centaines d'annonces d'escorts et libertines de luxe en Europe. Plateforme N°1 avec profils vérifiés et communauté active.`,
    inLanguage: 'fr',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.sexelite.eu/search?q={search_term_string}',
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
                      <VisitorTracker />
                      <div className="flex-1">
                        {children}
                      </div>
                      <Footer />
                      <CookieBanner />
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
