'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
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

  const imageSizes = {
    sm: 20,
    md: 28,
    lg: 36,
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center ${className}`}
    >
      <Image
        src={badge.image}
        alt={badge.name}
        width={imageSizes[size]}
        height={imageSizes[size]}
        className="object-contain"
      />
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
          <Image
            src={current.image}
            alt={current.name}
            width={20}
            height={20}
            className="object-contain"
          />
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
          <Image
            src={next.image}
            alt={next.name}
            width={20}
            height={20}
            className="object-contain opacity-50"
          />
        )}
      </div>

      {/* Texte */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>{current ? (language === 'fr' ? current.nameFr : current.name) : ''}</span>
        {next ? (
          <span>
            {language === 'fr' ? 'Prochain :' : 'Next:'} {language === 'fr' ? next.nameFr : next.name}
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

  const imageSizes = {
    sm: 24,
    md: 32,
    lg: 40,
  }

  return (
    <div className="relative group">
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="flex items-center justify-center"
      >
        <Image
          src={badge.image}
          alt={badge.name}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="object-contain"
        />
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
