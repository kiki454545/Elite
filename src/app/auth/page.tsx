'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function AuthContent() {
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
  const [autoLoginLoading, setAutoLoginLoading] = useState(true)
  const [emailConfirmationNeeded, setEmailConfirmationNeeded] = useState(false)

  const { login, signup, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Auto-login avec token depuis SexElite.eu
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      handleAutoLogin(token)
    } else {
      setAutoLoginLoading(false)
    }
  }, [searchParams])

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated && !autoLoginLoading) {
      const redirect = searchParams.get('redirect') || '/shop'
      router.push(redirect)
    }
  }, [isAuthenticated, autoLoginLoading, router, searchParams])

  const handleAutoLogin = async (token: string) => {
    setAutoLoginLoading(true)
    try {
      // Vérifier le token dans la base de données
      const { data: tokenData, error: tokenError } = await supabase
        .from('auth_tokens')
        .select('user_id, expires_at')
        .eq('token', token)
        .single()

      if (tokenError || !tokenData) {
        setError('Token invalide ou expiré. Veuillez vous connecter.')
        setAutoLoginLoading(false)
        return
      }

      // Vérifier si le token n'est pas expiré
      if (new Date(tokenData.expires_at) < new Date()) {
        setError('Token expiré. Veuillez vous connecter.')
        await supabase.from('auth_tokens').delete().eq('token', token)
        setAutoLoginLoading(false)
        return
      }

      // Supprimer le token (usage unique)
      await supabase.from('auth_tokens').delete().eq('token', token)

      // Rediriger vers la boutique (l'utilisateur est déjà connecté via le cookie partagé)
      const redirect = searchParams.get('redirect') || '/shop'
      router.push(redirect)
    } catch (err) {
      console.error('Auto-login error:', err)
      setError('Erreur lors de la connexion automatique')
      setAutoLoginLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isLogin) {
      if (!acceptTerms) {
        setError('Vous devez accepter les conditions d\'utilisation')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas')
        return
      }
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
          router.push('/shop')
        }
      } else {
        const result = await signup(formData.email, formData.password, formData.username, parseInt(formData.age))
        if (result.error) {
          setError(result.error)
        } else {
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

  // Afficher un loader pendant l'auto-login
  if (autoLoginLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Connexion en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <Link
          href="/"
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Retour à l'accueil</span>
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl">⛏️</span>
            <h1 className="text-4xl font-bold text-white">ShopElite</h1>
          </div>
          <p className="text-green-400 font-semibold">Plateforme de paiement sécurisée</p>
        </div>

        {/* Card */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-900 p-1 rounded-lg">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                isLogin
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                !isLogin
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Info box */}
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 mb-6">
            <p className="text-green-400 text-sm text-center">
              🔗 Utilisez le même compte que sur SexElite.eu
            </p>
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="votre@email.com"
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
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Votre pseudo"
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
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 pl-11 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 pl-11 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-300 leading-relaxed">
                      J'accepte les{' '}
                      <a href="/terms" target="_blank" className="text-green-500 hover:text-green-400 underline">
                        conditions d'utilisation
                      </a>
                      {' '}et je confirme avoir au moins 18 ans.
                    </span>
                  </label>
                </div>
              </>
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
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Chargement...' : isLogin ? 'Se connecter' : 'Créer un compte'}
            </motion.button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <a href="#" className="text-sm text-green-500 hover:text-green-400">
                Mot de passe oublié ?
              </a>
            </div>
          )}
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-500 mt-6">
          En continuant, vous acceptez nos{' '}
          <a href="/terms" target="_blank" className="text-green-500 hover:underline">
            Conditions d'utilisation
          </a>{' '}
          et notre{' '}
          <a href="/privacy" target="_blank" className="text-green-500 hover:underline">
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
            className="bg-gray-800 rounded-2xl border border-gray-700 p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                Vérifiez votre email
              </h3>

              <p className="text-gray-300 mb-2 leading-relaxed">
                Un email de confirmation a été envoyé à :
              </p>
              <p className="text-green-400 font-semibold mb-6 break-all">
                {formData.email}
              </p>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 mb-6 w-full">
                <p className="text-gray-400 text-sm leading-relaxed">
                  Cliquez sur le lien dans l'email pour activer votre compte.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  💡 <span className="text-gray-300">N'oubliez pas de vérifier vos spams !</span>
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => {
                    setEmailConfirmationNeeded(false)
                    setIsLogin(true)
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-all"
                >
                  Retour à la connexion
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

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}
