'use client'

import { motion } from 'framer-motion'
import { getCurrentBadge, getNextBadge, getBadgeProgress, Badge } from '@/types/badges'
import { useLanguage } from '@/contexts/LanguageContext'

interface XPBadgeProps {
  xp: number
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function XPBadge({ xp, showProgress = false, size = 'md', className = '' }: XPBadgeProps) {
  const { language } = useLanguage()
  const badge = getCurrentBadge(xp)

  if (!badge || xp === 0) return null

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1 ${badge.bgColor} border ${badge.borderColor} rounded-full ${sizeClasses[size]} shadow-lg ${badge.glowColor} ${className}`}
    >
      <span className={iconSizes[size]}>{badge.icon}</span>
      <span className={`font-semibold bg-gradient-to-r ${badge.color} bg-clip-text text-transparent`}>
        {language === 'fr' ? badge.nameFr : badge.name}
      </span>
    </motion.div>
  )
}

interface XPProgressProps {
  xp: number
  className?: string
}

export function XPProgress({ xp, className = '' }: XPProgressProps) {
  const { language } = useLanguage()
  const { current, next, progress } = getBadgeProgress(xp)

  if (!current && !next) return null

  return (
    <div className={`${className}`}>
      {/* Barre de progression */}
      <div className="flex items-center gap-2 mb-1">
        {current && (
          <span className="text-sm">
            {current.icon}
          </span>
        )}
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r ${current?.color || 'from-gray-400 to-gray-500'} rounded-full`}
          />
        </div>
        {next && (
          <span className="text-sm opacity-50">
            {next.icon}
          </span>
        )}
      </div>

      {/* Texte */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>{xp} XP</span>
        {next ? (
          <span>
            {language === 'fr' ? 'Prochain :' : 'Next:'} {language === 'fr' ? next.nameFr : next.name} ({next.minXP} XP)
          </span>
        ) : (
          <span className="text-amber-400">{language === 'fr' ? 'Niveau max atteint !' : 'Max level reached!'}</span>
        )}
      </div>
    </div>
  )
}

interface BadgeDisplayProps {
  badge: Badge
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

export function BadgeDisplay({ badge, size = 'md', showTooltip = true }: BadgeDisplayProps) {
  const { language } = useLanguage()

  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-lg',
    lg: 'w-10 h-10 text-xl',
  }

  return (
    <div className="relative group">
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`${sizeClasses[size]} flex items-center justify-center ${badge.bgColor} border ${badge.borderColor} rounded-full shadow-lg ${badge.glowColor}`}
      >
        <span>{badge.icon}</span>
      </motion.div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-2 shadow-xl whitespace-nowrap">
            <p className={`font-semibold text-sm bg-gradient-to-r ${badge.color} bg-clip-text text-transparent`}>
              {language === 'fr' ? badge.nameFr : badge.name}
            </p>
            <p className="text-xs text-gray-400">
              {language === 'fr' ? badge.descriptionFr : badge.description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
