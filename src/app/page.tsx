import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SexElite MinecraftBoost - Publicité Premium pour Serveurs Minecraft',
  description: 'Boostez la visibilité de votre serveur Minecraft avec nos packages publicitaires. Des milliers de joueurs actifs chaque jour. Résultats garantis !',
  keywords: [
    'minecraft',
    'serveur minecraft',
    'publicité minecraft',
    'promotion serveur',
    'sexelite',
    'minecraftboost',
    'pub serveur minecraft',
    'minecraft advertising',
    'serveur pvp',
    'serveur survie',
  ],
  openGraph: {
    title: 'SexElite MinecraftBoost - Publicité Premium pour Serveurs Minecraft',
    description: 'Boostez votre serveur Minecraft avec nos packages publicitaires premium',
    type: 'website',
    url: 'https://sexelite.eu',
    siteName: 'SexElite MinecraftBoost',
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
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-3xl">⛏️</span>
            <div>
              <h1 className="text-2xl font-bold text-white">SexElite</h1>
              <p className="text-xs text-green-400 font-semibold">MinecraftBoost</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <span>💰</span>
              <span>Boutique</span>
            </Link>
            <Link
              href="/payment"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Commander
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <span className="text-6xl mb-4 block">🎮</span>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Boostez Votre Serveur<br />
            <span className="text-green-500">Minecraft</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Atteignez des <strong className="text-green-400">milliers de joueurs actifs</strong> et développez votre communauté avec nos packages publicitaires premium.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/payment"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg hover:shadow-green-600/50"
            >
              🚀 Commencer Maintenant
            </Link>
            <a
              href="#pricing"
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
            >
              Voir les Prix
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="text-4xl mb-2">👥</div>
            <div className="text-3xl font-bold text-green-400 mb-2">50K+</div>
            <div className="text-gray-300">Joueurs actifs/jour</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="text-4xl mb-2">⚡</div>
            <div className="text-3xl font-bold text-green-400 mb-2">98%</div>
            <div className="text-gray-300">Taux de satisfaction</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-bold text-green-400 mb-2">500+</div>
            <div className="text-gray-300">Serveurs promus</div>
          </div>
        </div>
      </section>

      {/* Featured Servers */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold text-white">
            🔥 Serveurs en Vedette
          </h3>
          <Link
            href="/payment"
            className="text-green-400 hover:text-green-300 font-semibold text-sm"
          >
            Être en vedette →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Server 1 - Featured */}
          <div className="bg-gradient-to-b from-yellow-900/20 to-gray-800 p-6 rounded-lg border-2 border-yellow-500 relative hover:border-yellow-400 transition-all">
            <div className="absolute -top-3 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
              ⭐ FEATURED
            </div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-white mb-1">MegaCraft Network</h4>
                <p className="text-sm text-gray-400">play.megacraft.net</p>
              </div>
              <div className="bg-green-600 px-2 py-1 rounded text-xs font-bold text-white">
                ONLINE
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Serveur PvP/Faction avec économie avancée. Rejoignez 500+ joueurs actifs ! Events quotidiens et récompenses exclusives.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">🎮 PvP</span>
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">⚔️ Faction</span>
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">📦 1.20.4</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">👥 587 joueurs</span>
              <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold text-white transition-colors">
                Rejoindre
              </button>
            </div>
          </div>

          {/* Server 2 - Premium */}
          <div className="bg-gray-800 p-6 rounded-lg border border-green-500 hover:border-green-400 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-white mb-1">SkyLegends</h4>
                <p className="text-sm text-gray-400">skylegends.fr</p>
              </div>
              <div className="bg-green-600 px-2 py-1 rounded text-xs font-bold text-white">
                ONLINE
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Le meilleur serveur Skyblock francophone ! Île personnalisable, quêtes uniques et boss raids. Communauté active.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">☁️ Skyblock</span>
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">🏆 Compétitif</span>
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">📦 1.19.4</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">👥 342 joueurs</span>
              <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold text-white transition-colors">
                Rejoindre
              </button>
            </div>
          </div>

          {/* Server 3 - Pro */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-green-500 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-white mb-1">UltraVanilla</h4>
                <p className="text-sm text-gray-400">ultra-vanilla.net</p>
              </div>
              <div className="bg-green-600 px-2 py-1 rounded text-xs font-bold text-white">
                ONLINE
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Serveur Survie 100% Vanilla. Pas de mods, juste du Minecraft pur ! Communauté mature et bienveillante.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">🌲 Survie</span>
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">✨ Vanilla</span>
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">📦 1.20.2</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">👥 156 joueurs</span>
              <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold text-white transition-colors">
                Rejoindre
              </button>
            </div>
          </div>

          {/* Server 4 */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-green-500 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-white mb-1">PrisonEscape</h4>
                <p className="text-sm text-gray-400">prison-escape.eu</p>
              </div>
              <div className="bg-green-600 px-2 py-1 rounded text-xs font-bold text-white">
                ONLINE
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Mode Prison unique avec système de prestige. Mine, vends et deviens le plus riche ! Cellules personnalisables.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">🔒 Prison</span>
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">💰 Économie</span>
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">📦 1.20.1</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">👥 289 joueurs</span>
              <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold text-white transition-colors">
                Rejoindre
              </button>
            </div>
          </div>

          {/* Server 5 */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-green-500 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-white mb-1">ArcadeGames+</h4>
                <p className="text-sm text-gray-400">arcadegames.net</p>
              </div>
              <div className="bg-green-600 px-2 py-1 rounded text-xs font-bold text-white">
                ONLINE
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Hub de mini-jeux : BedWars, SkyWars, BuildBattle, Murder Mystery et plus ! Nouveaux jeux chaque mois.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">🎪 Mini-jeux</span>
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">🏃 Rapide</span>
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">📦 1.19.2</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">👥 421 joueurs</span>
              <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold text-white transition-colors">
                Rejoindre
              </button>
            </div>
          </div>

          {/* Server 6 */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-green-500 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-white mb-1">Pixelmon FR</h4>
                <p className="text-sm text-gray-400">pixelmon-fr.com</p>
              </div>
              <div className="bg-green-600 px-2 py-1 rounded text-xs font-bold text-white">
                ONLINE
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Serveur Pixelmon français #1. Capture tous les Pokémon dans Minecraft ! Arènes, events et économie équilibrée.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">⚡ Pixelmon</span>
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">🎮 Moddé</span>
              <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">📦 1.16.5</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">👥 198 joueurs</span>
              <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold text-white transition-colors">
                Rejoindre
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/payment"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-lg"
          >
            🚀 Promouvoir Mon Serveur
          </Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-white text-center mb-12">
          ⭐ Pourquoi SexElite MinecraftBoost ?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
            <div className="text-3xl mb-4">🎯</div>
            <h4 className="text-xl font-bold text-white mb-3">Audience Ciblée</h4>
            <p className="text-gray-300">
              Votre serveur sera visible par des milliers de joueurs Minecraft actifs chaque jour, spécifiquement intéressés par de nouveaux serveurs.
            </p>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
            <div className="text-3xl mb-4">⚡</div>
            <h4 className="text-xl font-bold text-white mb-3">Résultats Rapides</h4>
            <p className="text-gray-300">
              Votre publicité est activée instantanément après paiement. Commencez à recevoir des joueurs dans les minutes qui suivent !
            </p>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
            <div className="text-3xl mb-4">📊</div>
            <h4 className="text-xl font-bold text-white mb-3">Statistiques Détaillées</h4>
            <p className="text-gray-300">
              Suivez en temps réel les performances de votre campagne : vues, clics, et conversions.
            </p>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700">
            <div className="text-3xl mb-4">💎</div>
            <h4 className="text-xl font-bold text-white mb-3">Support Premium</h4>
            <p className="text-gray-300">
              Notre équipe est disponible 24/7 pour vous aider à optimiser votre campagne et maximiser vos résultats.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-white text-center mb-4">
          💰 Nos Packages
        </h3>
        <p className="text-gray-400 text-center mb-12">
          Choisissez la formule qui correspond à vos besoins
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter */}
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 hover:border-green-500 transition-colors">
            <div className="text-center mb-6">
              <div className="text-2xl mb-2">🌱</div>
              <h4 className="text-2xl font-bold text-white mb-2">Starter</h4>
              <div className="text-4xl font-bold text-green-400 mb-2">5€</div>
              <div className="text-gray-400">24 heures</div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span className="text-gray-300">Publicité homepage 24h</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span className="text-gray-300">~5000 vues garanties</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span className="text-gray-300">Statistiques basiques</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span className="text-gray-300">Support standard</span>
              </li>
            </ul>
            <Link
              href="/payment?package=starter"
              className="block w-full bg-gray-700 hover:bg-gray-600 text-white text-center px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Choisir Starter
            </Link>
          </div>

          {/* Popular */}
          <div className="bg-gradient-to-b from-green-900/20 to-gray-800 p-8 rounded-lg border-2 border-green-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold">
              ⭐ POPULAIRE
            </div>
            <div className="text-center mb-6">
              <div className="text-2xl mb-2">🔥</div>
              <h4 className="text-2xl font-bold text-white mb-2">Pro</h4>
              <div className="text-4xl font-bold text-green-400 mb-2">12€</div>
              <div className="text-gray-400">3 jours</div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span className="text-gray-300">Publicité homepage 3 jours</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span className="text-gray-300">~20000 vues garanties</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span className="text-gray-300">Position prioritaire</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span className="text-gray-300">Statistiques avancées</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span className="text-gray-300">Support prioritaire</span>
              </li>
            </ul>
            <Link
              href="/payment?package=pro"
              className="block w-full bg-green-600 hover:bg-green-700 text-white text-center px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
            >
              Choisir Pro
            </Link>
          </div>

          {/* Premium */}
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 hover:border-green-500 transition-colors">
            <div className="text-center mb-6">
              <div className="text-2xl mb-2">👑</div>
              <h4 className="text-2xl font-bold text-white mb-2">Premium</h4>
              <div className="text-4xl font-bold text-green-400 mb-2">20€</div>
              <div className="text-gray-400">7 jours</div>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span className="text-gray-300">Publicité homepage 7 jours</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span className="text-gray-300">~50000 vues garanties</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span className="text-gray-300">Position TOP 1</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span className="text-gray-300">Analytics complets</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span className="text-gray-300">Support VIP 24/7</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span className="text-gray-300">Badge "Featured"</span>
              </li>
            </ul>
            <Link
              href="/payment?package=premium"
              className="block w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white text-center px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
            >
              Choisir Premium
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-white text-center mb-12">
          🔧 Comment ça marche ?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
              1
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Choisissez</h4>
            <p className="text-gray-400">Sélectionnez le package qui vous convient</p>
          </div>
          <div className="text-center">
            <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
              2
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Payez</h4>
            <p className="text-gray-400">Paiement sécurisé en quelques clics</p>
          </div>
          <div className="text-center">
            <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
              3
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Configurez</h4>
            <p className="text-gray-400">Ajoutez les infos de votre serveur</p>
          </div>
          <div className="text-center">
            <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
              4
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Boostez!</h4>
            <p className="text-gray-400">Votre pub est live instantanément</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-12 rounded-2xl text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Prêt à faire exploser votre serveur ? 🚀
          </h3>
          <p className="text-xl text-green-100 mb-8">
            Rejoignez les 500+ serveurs qui nous font confiance
          </p>
          <Link
            href="/payment"
            className="inline-block bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl"
          >
            Commencer Maintenant →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">© 2025 ServerBoost - Publicité Premium pour Serveurs Minecraft</p>
            <p className="text-sm">Boostez votre communauté avec la plateforme n°1</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
