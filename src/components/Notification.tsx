'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useEffect } from 'react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationProps {
  type: NotificationType
  title: string
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function Notification({
  type,
  title,
  message,
  isVisible,
  onClose,
  duration = 5000
}: NotificationProps) {

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  const config = {
    success: {
      icon: CheckCircle,
      bgGradient: 'from-emerald-500/20 to-green-500/20',
      borderColor: 'border-emerald-400/30',
      iconColor: 'text-emerald-400',
      titleColor: 'text-emerald-400'
    },
    error: {
      icon: XCircle,
      bgGradient: 'from-red-500/20 to-pink-500/20',
      borderColor: 'border-red-400/30',
      iconColor: 'text-red-400',
      titleColor: 'text-red-400'
    },
    warning: {
      icon: AlertCircle,
      bgGradient: 'from-amber-500/20 to-yellow-500/20',
      borderColor: 'border-amber-400/30',
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-400'
    },
    info: {
      icon: Info,
      bgGradient: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-400/30',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-400'
    }
  }

  const { icon: Icon, bgGradient, borderColor, iconColor, titleColor } = config[type]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-4 left-1/2 z-50 w-full max-w-md px-4"
        >
          <div className={`bg-gradient-to-br ${bgGradient} backdrop-blur-sm rounded-xl border ${borderColor} p-4 shadow-2xl`}>
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`flex-shrink-0 ${iconColor}`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold ${titleColor} text-sm mb-1`}>
                  {title}
                </h3>
                <p className="text-gray-300 text-sm">
                  {message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            {duration > 0 && (
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className={`h-1 ${bgGradient} mt-3 rounded-full`}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
