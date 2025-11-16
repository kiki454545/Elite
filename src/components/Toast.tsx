'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { useEffect } from 'react'

interface ToastProps {
  isOpen: boolean
  onClose: () => void
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export function Toast({
  isOpen,
  onClose,
  message,
  type = 'info',
  duration = 3000
}: ToastProps) {
  const config = {
    success: {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    },
    info: {
      icon: <Info className="w-5 h-5 text-blue-500" />,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    }
  }

  const currentConfig = config[type]

  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className="fixed top-4 left-1/2 z-[100] max-w-md w-full px-4"
        >
          <div className={`${currentConfig.bgColor} border ${currentConfig.borderColor} rounded-xl p-4 backdrop-blur-sm bg-gray-900/90 shadow-2xl`}>
            <div className="flex items-center gap-3">
              {currentConfig.icon}
              <p className="text-white text-sm font-medium flex-1">{message}</p>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
