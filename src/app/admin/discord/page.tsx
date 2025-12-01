'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  ArrowLeft,
  Send,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Hash,
  Upload,
  FileVideo,
  FileImage
} from 'lucide-react'

interface Channel {
  id: string
  name: string
  position: number
}

interface UploadProgress {
  currentFile: number
  totalFiles: number
  currentFileName: string
  percentage: number
  status: 'uploading' | 'sending' | 'done'
}

export default function AdminDiscordPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isAdmin, setIsAdmin] = useState(false)
  const [channels, setChannels] = useState<Channel[]>([])
  const [loadingChannels, setLoadingChannels] = useState(true)
  const [selectedChannel, setSelectedChannel] = useState<string>('')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [sentCount, setSentCount] = useState(0)

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    async function checkAdmin() {
      if (!user?.id) {
        router.push('/auth')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        router.push('/')
        return
      }

      setIsAdmin(true)
    }

    if (!loading) {
      checkAdmin()
    }
  }, [user, loading, router])

  // Charger les canaux Discord
  useEffect(() => {
    async function loadChannels() {
      if (!isAdmin) return

      try {
        const { data: { session } } = await supabase.auth.getSession()

        const response = await fetch('/api/admin/discord/channels', {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        })

        const result = await response.json()

        if (result.channels) {
          setChannels(result.channels)
          if (result.channels.length > 0) {
            setSelectedChannel(result.channels[0].id)
          }
        } else if (result.error) {
          setError(result.error)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoadingChannels(false)
      }
    }

    loadChannels()
  }, [isAdmin])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return

    const newFiles: File[] = []

    for (const file of Array.from(selectedFiles)) {
      // Vérifier la taille (max 100 Mo par fichier)
      if (file.size > 100 * 1024 * 1024) {
        alert(`${file.name} dépasse 100 Mo`)
        continue
      }

      // Vérifier le type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert(`${file.name} n'est pas une image ou vidéo`)
        continue
      }

      newFiles.push(file)
    }

    setFiles(prev => [...prev, ...newFiles])

    // Reset l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getTotalSize = () => {
    return files.reduce((acc, f) => acc + f.size, 0)
  }

  // Envoyer les fichiers par lots de 10 max (limite Discord)
  const handleSend = async () => {
    if (!selectedChannel) {
      setError('Sélectionne un canal')
      return
    }

    if (!message.trim() && files.length === 0) {
      setError('Ajoute un message ou des fichiers')
      return
    }

    setSending(true)
    setError('')
    setSuccess(false)
    setSentCount(0)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      // Si seulement un message sans fichiers
      if (files.length === 0) {
        setProgress({
          currentFile: 0,
          totalFiles: 0,
          currentFileName: '',
          percentage: 50,
          status: 'sending'
        })

        const formData = new FormData()
        formData.append('channelId', selectedChannel)
        formData.append('message', message.trim())

        const response = await fetch('/api/admin/discord/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: formData
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Erreur lors de l\'envoi')
        }

        setProgress({ ...progress!, percentage: 100, status: 'done' })
      } else {
        // Envoyer les fichiers par lots de 10
        const BATCH_SIZE = 10
        const batches = []

        for (let i = 0; i < files.length; i += BATCH_SIZE) {
          batches.push(files.slice(i, i + BATCH_SIZE))
        }

        let totalSent = 0

        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex]

          // Calculer la taille totale du lot
          const batchSize = batch.reduce((acc, f) => acc + f.size, 0)

          setProgress({
            currentFile: totalSent + 1,
            totalFiles: files.length,
            currentFileName: batch.map(f => f.name).join(', '),
            percentage: Math.round((totalSent / files.length) * 100),
            status: 'uploading'
          })

          const formData = new FormData()
          formData.append('channelId', selectedChannel)

          // Ajouter le message seulement au premier lot
          if (batchIndex === 0 && message.trim()) {
            formData.append('message', message.trim())
          }

          for (const file of batch) {
            formData.append('files', file)
          }

          // Utiliser XMLHttpRequest pour avoir la progression
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest()

            xhr.upload.addEventListener('progress', (e) => {
              if (e.lengthComputable) {
                const fileProgress = (e.loaded / e.total) * 100
                const overallProgress = ((totalSent + (batch.length * (e.loaded / e.total))) / files.length) * 100

                setProgress({
                  currentFile: totalSent + 1,
                  totalFiles: files.length,
                  currentFileName: `Lot ${batchIndex + 1}/${batches.length} (${batch.length} fichier${batch.length > 1 ? 's' : ''})`,
                  percentage: Math.round(overallProgress),
                  status: 'uploading'
                })
              }
            })

            xhr.addEventListener('load', () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const result = JSON.parse(xhr.responseText)
                  if (result.success) {
                    totalSent += batch.length
                    setSentCount(totalSent)
                    resolve()
                  } else {
                    reject(new Error(result.error || 'Erreur lors de l\'envoi'))
                  }
                } catch {
                  reject(new Error('Réponse invalide du serveur'))
                }
              } else {
                reject(new Error(`Erreur ${xhr.status}`))
              }
            })

            xhr.addEventListener('error', () => {
              reject(new Error('Erreur réseau'))
            })

            xhr.open('POST', '/api/admin/discord/send')
            xhr.setRequestHeader('Authorization', `Bearer ${session?.access_token}`)
            xhr.send(formData)
          })

          // Petite pause entre les lots pour ne pas spam Discord
          if (batchIndex < batches.length - 1) {
            setProgress({
              currentFile: totalSent,
              totalFiles: files.length,
              currentFileName: 'Préparation du lot suivant...',
              percentage: Math.round((totalSent / files.length) * 100),
              status: 'sending'
            })
            await new Promise(r => setTimeout(r, 1000))
          }
        }

        setProgress({
          currentFile: files.length,
          totalFiles: files.length,
          currentFileName: '',
          percentage: 100,
          status: 'done'
        })
      }

      setSuccess(true)
      setMessage('')
      setFiles([])

      // Reset après 3 secondes
      setTimeout(() => {
        setSuccess(false)
        setProgress(null)
        setSentCount(0)
      }, 3000)

    } catch (err: any) {
      setError(err.message)
      setProgress(null)
    } finally {
      setSending(false)
    }
  }

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Discord</h1>
              <p className="text-gray-400 text-sm">Envoyer des médias sur Discord</p>
            </div>
          </div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
          >
            {/* Sélecteur de canal */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">Canal Discord</label>
              {loadingChannels ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Chargement des canaux...
                </div>
              ) : channels.length === 0 ? (
                <div className="text-red-400">Aucun canal trouvé. Vérifie que le bot est bien sur le serveur.</div>
              ) : (
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                  >
                    {channels.map(channel => (
                      <option key={channel.id} value={channel.id}>
                        {channel.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">Message (optionnel)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écris ton message ici..."
                rows={4}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 resize-none"
                disabled={sending}
              />
            </div>

            {/* Upload zone */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-400 text-sm">
                  Photos / Vidéos
                  <span className="text-gray-500 ml-2">(max 100 Mo par fichier)</span>
                </label>
                {files.length > 0 && (
                  <span className="text-sm text-purple-400">
                    {files.length} fichier{files.length > 1 ? 's' : ''} • {formatFileSize(getTotalSize())}
                  </span>
                )}
              </div>

              {/* Liste des fichiers */}
              {files.length > 0 && (
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-black/30 rounded-lg p-3"
                    >
                      {file.type.startsWith('image/') ? (
                        <FileImage className="w-8 h-8 text-blue-400 flex-shrink-0" />
                      ) : (
                        <FileVideo className="w-8 h-8 text-purple-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        disabled={sending}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Bouton d'upload */}
              <label className={`flex items-center justify-center gap-3 border-2 border-dashed border-white/20 rounded-lg p-6 cursor-pointer hover:border-purple-500 hover:bg-purple-500/10 transition-all ${sending ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-gray-400">Cliquer pour ajouter des fichiers (10 max par envoi)</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={sending}
                />
              </label>
            </div>

            {/* Barre de progression */}
            {progress && (
              <div className="mb-4 bg-black/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {progress.status === 'uploading' && 'Envoi en cours...'}
                    {progress.status === 'sending' && 'Traitement...'}
                    {progress.status === 'done' && 'Terminé !'}
                  </span>
                  <span className="text-sm text-gray-400">{progress.percentage}%</span>
                </div>

                {/* Barre de progression */}
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${progress.status === 'done' ? 'bg-green-500' : 'bg-[#5865F2]'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.percentage}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Détails */}
                {progress.totalFiles > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    {progress.currentFileName}
                    {sentCount > 0 && ` • ${sentCount}/${progress.totalFiles} envoyé${sentCount > 1 ? 's' : ''}`}
                  </p>
                )}
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="mb-4 flex items-center gap-2 text-red-400 bg-red-500/10 rounded-lg p-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Succès */}
            {success && (
              <div className="mb-4 flex items-center gap-2 text-green-400 bg-green-500/10 rounded-lg p-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>
                  {sentCount > 0
                    ? `${sentCount} fichier${sentCount > 1 ? 's' : ''} envoyé${sentCount > 1 ? 's' : ''} avec succès !`
                    : 'Message envoyé avec succès !'
                  }
                </span>
              </div>
            )}

            {/* Bouton Envoyer */}
            <button
              onClick={handleSend}
              disabled={sending || loadingChannels || channels.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-lg font-semibold transition-colors"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Envoyer sur Discord
                  {files.length > 0 && ` (${files.length} fichier${files.length > 1 ? 's' : ''})`}
                </>
              )}
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
