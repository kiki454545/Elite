'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info' | 'success'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'danger'
}: ConfirmModalProps) {
  const config = {
    danger: {
      icon: <AlertCircle className="w-12 h-12 text-red-500" />,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      buttonColor: 'bg-red-500 hover:bg-red-600'
    },
    warning: {
      icon: <AlertTriangle className="w-12 h-12 text-orange-500" />,
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      buttonColor: 'bg-orange-500 hover:bg-orange-600'
    },
    info: {
      icon: <AlertCircle className="w-12 h-12 text-blue-500" />,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      buttonColor: 'bg-blue-500 hover:bg-blue-600'
    },
    success: {
      icon: <CheckCircle className="w-12 h-12 text-green-500" />,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      buttonColor: 'bg-green-500 hover:bg-green-600'
    }
  }

  const currentConfig = config[type]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className={`p-6 ${currentConfig.bgColor} border-b ${currentConfig.borderColor}`}>
                <div className="flex items-center gap-4">
                  {currentConfig.icon}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
                    <p className="text-gray-300 text-sm">{message}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  className={`flex-1 px-4 py-3 ${currentConfig.buttonColor} text-white rounded-xl font-medium transition-all`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
