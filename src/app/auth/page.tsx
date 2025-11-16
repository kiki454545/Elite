'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '18',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailConfirmationNeeded, setEmailConfirmationNeeded] = useState(false)

  const { login, signup } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation pour l'inscription
    if (!isLogin) {
      // Vérifier l'acceptation des conditions
      if (!acceptTerms) {
        setError('Vous devez accepter le règlement pour vous inscrire')
        return
      }

      // Vérifier la correspondance des mots de passe
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas')
        return
      }

      // Vérifier l'âge
      const age = parseInt(formData.age)
      if (isNaN(age) || age < 18) {
        setError('Vous devez avoir au moins 18 ans')
        return
      }
    }

    setLoading(true)

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password)
        if (result.error) {
          setError(result.error)
        } else {
          router.push('/')
        }
      } else {
        const result = await signup(formData.email, formData.password, formData.username, parseInt(formData.age))
        if (result.error) {
          setError(result.error)
        } else {
          // Afficher le message de confirmation d'email
          setEmailConfirmationNeeded(true)
          setError('')
        }
      }
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <motion.button
          onClick={() => router.push('/')}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          whileHover={{ x: -4 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Retour aux annonces</span>
        </motion.button>

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            SexElite
          </h1>
          <p className="text-gray-400">Plateforme élite de rencontres</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="exemple@email.com"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pseudo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="johndoe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Âge
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="18"
                    min="18"
                    max="99"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-11 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-11 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-pink-500 focus:ring-pink-500 focus:ring-offset-gray-900"
                    required
                  />
                  <span className="text-sm text-gray-300 leading-relaxed">
                    J'accepte les{' '}
                    <a href="/terms" target="_blank" className="text-pink-500 hover:text-pink-400 underline">
                      conditions d'utilisation
                    </a>
                    {' '}et je confirme avoir au moins 18 ans. Je comprends que cette plateforme est réservée à un contenu pour adultes.
                  </span>
                </label>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm">
                {error}
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Chargement...' : isLogin ? 'Se connecter' : "S'inscrire"}
            </motion.button>
          </form>

          {/* Footer */}
          {isLogin && (
            <div className="mt-4 text-center">
              <a href="#" className="text-sm text-pink-500 hover:text-pink-400">
                Mot de passe oublié ?
              </a>
            </div>
          )}
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-500 mt-6">
          En continuant, vous acceptez nos{' '}
          <a href="/terms" target="_blank" className="text-pink-500 hover:underline">
            Conditions d'utilisation
          </a>{' '}
          et notre{' '}
          <a href="/privacy" target="_blank" className="text-pink-500 hover:underline">
            Politique de confidentialité
          </a>
        </p>
      </motion.div>

      {/* Modal de confirmation d'email */}
      {emailConfirmationNeeded && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icône Email */}
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-pink-500/50">
                <Mail className="w-10 h-10 text-white" />
              </div>

              {/* Titre */}
              <h3 className="text-2xl font-bold text-white mb-3">
                Vérifiez votre email
              </h3>

              {/* Message */}
              <p className="text-gray-300 mb-2 leading-relaxed">
                Un email de confirmation a été envoyé à :
              </p>
              <p className="text-pink-400 font-semibold mb-6 break-all">
                {formData.email}
              </p>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 mb-6 w-full">
                <p className="text-gray-400 text-sm leading-relaxed">
                  Veuillez consulter votre boîte de réception et cliquer sur le lien de confirmation pour activer votre compte.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  💡 <span className="text-gray-300">N'oubliez pas de vérifier vos spams !</span>
                </p>
              </div>

              {/* Boutons */}
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => {
                    setEmailConfirmationNeeded(false)
                    setIsLogin(true)
                  }}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
                >
                  Compris, aller à la connexion
                </button>
                <button
                  onClick={() => setEmailConfirmationNeeded(false)}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
