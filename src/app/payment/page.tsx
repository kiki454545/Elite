'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const packages = {
  starter: {
    name: 'Starter',
    price: 5,
    coinPrice: 75,
    duration: '24 heures',
    icon: '🌱',
    features: [
      'Publicité homepage 24h',
      '~5000 vues garanties',
      'Statistiques basiques',
      'Support standard'
    ]
  },
  pro: {
    name: 'Pro',
    price: 12,
    coinPrice: 180,
    duration: '3 jours',
    icon: '🔥',
    features: [
      'Publicité homepage 3 jours',
      '~20000 vues garanties',
      'Position prioritaire',
      'Statistiques avancées',
      'Support prioritaire'
    ]
  },
  premium: {
    name: 'Premium',
    price: 20,
    coinPrice: 300,
    duration: '7 jours',
    icon: '👑',
    features: [
      'Publicité homepage 7 jours',
      '~50000 vues garanties',
      'Position TOP 1',
      'Analytics complets',
      'Support VIP 24/7',
      'Badge "Featured"'
    ]
  }
}

function PaymentContent() {
  const searchParams = useSearchParams()
  const [selectedPackage, setSelectedPackage] = useState<'starter' | 'pro' | 'premium'>('pro')
  const [formData, setFormData] = useState({
    serverName: '',
    serverIP: '',
    description: '',
    version: '',
    mode: '',
    email: '',
    discord: ''
  })
  const [step, setStep] = useState(1)

  useEffect(() => {
    const pkg = searchParams.get('package')
    if (pkg && (pkg === 'starter' || pkg === 'pro' || pkg === 'premium')) {
      setSelectedPackage(pkg)
    }
  }, [searchParams])

  const currentPackage = packages[selectedPackage]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      setStep(2)
    } else {
      // Ici tu peux ajouter l'intégration PayPal/Stripe
      alert('Paiement en cours de développement. Pour commander, contactez-nous par email !')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-3xl">⛏️</span>
            <h1 className="text-2xl font-bold text-white">ServerBoost</h1>
          </Link>
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Retour
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-green-600' : 'bg-gray-700'}`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <span className="ml-2 font-semibold hidden sm:inline">Informations</span>
            </div>
            <div className="w-12 h-1 bg-gray-700"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-green-600' : 'bg-gray-700'}`}>
                2
              </div>
              <span className="ml-2 font-semibold hidden sm:inline">Paiement</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                {step === 1 ? '📝 Informations du serveur' : '💳 Paiement'}
              </h2>

              <form onSubmit={handleSubmit}>
                {step === 1 ? (
                  <>
                    {/* Package Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Choisissez votre package
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(packages).map(([key, pkg]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedPackage(key as any)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              selectedPackage === key
                                ? 'border-green-500 bg-green-900/20'
                                : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                            }`}
                          >
                            <div className="text-2xl mb-1">{pkg.icon}</div>
                            <div className="text-sm font-bold text-white">{pkg.name}</div>
                            <div className="text-xs text-gray-400">{pkg.price}€</div>
                            <div className="text-xs text-amber-400">💰 {pkg.coinPrice} EC</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Server Info */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Nom du serveur *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.serverName}
                          onChange={(e) => setFormData({ ...formData, serverName: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                          placeholder="Ex: MegaCraft Network"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          IP du serveur *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.serverIP}
                          onChange={(e) => setFormData({ ...formData, serverIP: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                          placeholder="Ex: play.megacraft.net"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Description *
                        </label>
                        <textarea
                          required
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none resize-none"
                          placeholder="Décrivez votre serveur en quelques phrases..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Version Minecraft *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.version}
                            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                            placeholder="Ex: 1.20.4"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Mode de jeu *
                          </label>
                          <select
                            required
                            value={formData.mode}
                            onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                          >
                            <option value="">Sélectionner...</option>
                            <option value="survival">Survie</option>
                            <option value="creative">Créatif</option>
                            <option value="pvp">PvP</option>
                            <option value="faction">Faction</option>
                            <option value="skyblock">Skyblock</option>
                            <option value="minigames">Mini-jeux</option>
                            <option value="roleplay">Roleplay</option>
                            <option value="modded">Moddé</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Email de contact *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                          placeholder="votre@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Discord (optionnel)
                        </label>
                        <input
                          type="text"
                          value={formData.discord}
                          onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                          placeholder="discord.gg/votre-serveur"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg transition-colors shadow-lg"
                    >
                      Continuer vers le paiement →
                    </button>
                  </>
                ) : (
                  <>
                    {/* Payment Step */}
                    <div className="space-y-6">
                      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-bold text-white mb-4">Récapitulatif</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Serveur:</span>
                            <span className="text-white font-semibold">{formData.serverName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">IP:</span>
                            <span className="text-white">{formData.serverIP}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Package:</span>
                            <span className="text-white font-semibold">{currentPackage.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Durée:</span>
                            <span className="text-white">{currentPackage.duration}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
                        <div className="flex items-start">
                          <span className="text-2xl mr-3">ℹ️</span>
                          <div className="text-sm text-blue-200">
                            <p className="font-semibold mb-1">Paiement sécurisé</p>
                            <p>Le système de paiement sera bientôt disponible. Pour commander dès maintenant, envoyez-nous un email à <strong>contact@serverboost.com</strong> avec les informations ci-dessus.</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-lg font-bold transition-colors"
                        >
                          ← Retour
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold transition-colors shadow-lg"
                        >
                          Envoyer la commande
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 sticky top-4">
              <h3 className="text-lg font-bold text-white mb-4">Résumé de commande</h3>

              <div className="bg-gray-900 p-4 rounded-lg mb-4">
                <div className="text-center mb-3">
                  <span className="text-3xl">{currentPackage.icon}</span>
                </div>
                <h4 className="text-xl font-bold text-white text-center mb-2">
                  {currentPackage.name}
                </h4>
                <div className="text-center text-gray-400 text-sm mb-4">
                  {currentPackage.duration}
                </div>
                <ul className="space-y-2">
                  {currentPackage.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="text-green-400 mr-2">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-700 pt-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">Prix en €</span>
                  <span className="text-white font-bold">{currentPackage.price}€</span>
                </div>
                <div className="flex justify-between items-center mb-4 text-lg font-bold border-t border-gray-700 pt-4">
                  <span className="text-amber-400">Prix en EliteCoins</span>
                  <span className="text-amber-400">💰 {currentPackage.coinPrice} EC</span>
                </div>
                <Link
                  href="/shop"
                  className="block w-full text-center bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg font-semibold transition-colors mb-2"
                >
                  Acheter des EliteCoins
                </Link>
              </div>

              <div className="bg-green-900/20 border border-green-700 p-3 rounded-lg">
                <div className="flex items-start">
                  <span className="text-xl mr-2">🛡️</span>
                  <div className="text-xs text-green-200">
                    <p className="font-semibold mb-1">Garantie satisfait ou remboursé</p>
                    <p>Si vous n'obtenez pas les résultats promis, nous vous remboursons intégralement.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
