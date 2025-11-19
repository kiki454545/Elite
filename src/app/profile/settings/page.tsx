'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2, Check, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AccountSettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()

  // États pour l'email
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [emailError, setEmailError] = useState('')

  // États pour le mot de passe
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Redirection si non connecté
  if (!authLoading && !user) {
    router.push('/auth')
    return null
  }

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)
    setEmailError('')
    setEmailSuccess(false)

    try {
      // Valider l'email
      if (!newEmail || !newEmail.includes('@')) {
        setEmailError(t('settingsPage.enterValidEmail'))
        setEmailLoading(false)
        return
      }

      // Mettre à jour l'email via Supabase Auth
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (error) {
        throw error
      }

      setEmailSuccess(true)
      setNewEmail('')

      // Message de confirmation
      setTimeout(() => setEmailSuccess(false), 5000)

    } catch (error: any) {
      setEmailError(error.message || 'Erreur lors de la mise à jour de l\'email')
    } finally {
      setEmailLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError('')
    setPasswordSuccess(false)

    try {
      // Validations
      if (!newPassword || newPassword.length < 6) {
        setPasswordError(t('settingsPage.passwordMinLength'))
        setPasswordLoading(false)
        return
      }

      if (newPassword !== confirmPassword) {
        setPasswordError(t('settingsPage.passwordsDontMatch'))
        setPasswordLoading(false)
        return
      }

      // Mettre à jour le mot de passe via Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      // Message de confirmation
      setTimeout(() => setPasswordSuccess(false), 5000)

    } catch (error: any) {
      setPasswordError(error.message || 'Erreur lors de la mise à jour du mot de passe')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-white">
            {t('settingsPage.title')}
          </h1>
        </div>

        <div className="space-y-6">
          {/* Email actuel */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
            <p className="text-sm text-gray-400 mb-2">{t('settingsPage.currentEmail')}</p>
            <p className="text-white font-medium">{user?.email}</p>
          </div>

          {/* Modifier l'email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-pink-500" />
              {t('settingsPage.updateEmail')}
            </h2>

            <form onSubmit={handleEmailUpdate} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  {t('settingsPage.newEmail')}
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={t('settingsPage.newEmailPlaceholder')}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none transition-colors"
                />
              </div>

              {emailError && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 rounded-lg p-3">
                  <X className="w-4 h-4 flex-shrink-0" />
                  <p>{emailError}</p>
                </div>
              )}

              {emailSuccess && (
                <div className="flex items-center gap-2 text-green-500 text-sm bg-green-500/10 rounded-lg p-3">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <p>{t('settingsPage.confirmationSent')}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={emailLoading || !newEmail}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {emailLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('settingsPage.updating')}
                  </>
                ) : (
                  t('settingsPage.updateEmailButton')
                )}
              </button>
            </form>
          </motion.div>

          {/* Modifier le mot de passe */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-pink-500" />
              {t('settingsPage.updatePassword')}
            </h2>

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  {t('settingsPage.newPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('settingsPage.newPasswordPlaceholder')}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  {t('settingsPage.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('settingsPage.confirmPasswordPlaceholder')}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 rounded-lg p-3">
                  <X className="w-4 h-4 flex-shrink-0" />
                  <p>{passwordError}</p>
                </div>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-2 text-green-500 text-sm bg-green-500/10 rounded-lg p-3">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <p>{t('settingsPage.passwordUpdatedSuccess')}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={passwordLoading || !newPassword || !confirmPassword}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('settingsPage.updating')}
                  </>
                ) : (
                  t('settingsPage.updatePasswordButton')
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
