import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { CountryProvider } from '@/contexts/CountryContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { MessagesProvider } from '@/contexts/MessagesContext'
import { CityFilterProvider } from '@/contexts/CityFilterContext'
import { AdsProvider } from '@/contexts/AdsContext'
export const metadata: Metadata = {
  title: 'SexElite MinecraftBoost - Publicité Premium pour Serveurs Minecraft',
  description: 'Boostez la visibilité de votre serveur Minecraft avec nos packages publicitaires premium. Atteignez des milliers de joueurs en quelques heures.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'SexElite MinecraftBoost - Publicité Premium pour Serveurs Minecraft',
    description: 'Boostez la visibilité de votre serveur Minecraft',
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
    name: 'SexElite MinecraftBoost',
    url: 'https://sexelite.eu',
    description: 'Plateforme de publicité premium pour serveurs Minecraft',
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
                      <div className="flex-1">
                        {children}
                      </div>
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
