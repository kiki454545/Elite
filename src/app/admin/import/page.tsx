'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  Link,
  Search,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  X,
  ArrowLeft,
  Copy,
  ExternalLink,
  Pencil,
  Check
} from 'lucide-react'

interface ScrapedData {
  username: string
  age: number
  location: string
  country: string
  phone: string
  hasWhatsapp: boolean
  acceptsCalls: boolean
  acceptsSMS: boolean
  gender: string
  ethnicity: string
  height: number
  weight: number
  hairColor: string
  eyeColor: string
  measurements: string
  nationality: string
  languages: string[]
  available247: boolean
  incall: boolean
  outcall: boolean
}

interface ImportResult {
  success: boolean
  email: string
  password: string
  userId: string
  adId: string
  adUrl: string
}

export default function AdminImportPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const [scraping, setScraping] = useState(false)
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null)
  const [scrapeError, setScrapeError] = useState('')

  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState('')

  const [editingPhone, setEditingPhone] = useState(false)
  const [phoneValue, setPhoneValue] = useState('')

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

  const handleScrape = async () => {
    if (!url) return

    setScraping(true)
    setScrapeError('')
    setScrapedData(null)
    setImportResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ url })
      })

      const result = await response.json()

      if (result.error && !result.data) {
        setScrapeError(result.error)
      } else {
        setScrapedData(result.data)
        setPhoneValue(result.data.phone || '')
      }
    } catch (error: any) {
      setScrapeError(error.message)
    } finally {
      setScraping(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newPhotos: string[] = []
    const errors: string[] = []

    for (const file of Array.from(files)) {
      try {
        // Vérifier le type MIME
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!validTypes.includes(file.type)) {
          errors.push(`${file.name}: Type non supporté (${file.type})`)
          continue
        }

        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const fileName = `import-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

        console.log('Uploading file:', fileName, 'Size:', file.size, 'Type:', file.type)

        // Utiliser fetch directement (comme dans ads/create)
        const uploadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/ad-photos/${fileName}`
        const session = await supabase.auth.getSession()

        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.data.session?.access_token}`,
            'Content-Type': file.type,
            'x-upsert': 'false'
          },
          body: file
        })

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error('Upload error:', errorText)
          errors.push(`${file.name}: ${errorText}`)
          continue
        }

        console.log('Upload success')

        const { data: urlData } = supabase.storage
          .from('ad-photos')
          .getPublicUrl(fileName)

        console.log('Public URL:', urlData.publicUrl)
        newPhotos.push(urlData.publicUrl)
      } catch (error: any) {
        console.error('Error uploading photo:', error)
        errors.push(`${file.name}: ${error.message}`)
      }
    }

    if (errors.length > 0) {
      alert(`Erreurs d'upload:\n${errors.join('\n')}`)
    }

    if (newPhotos.length > 0) {
      setPhotos(prev => [...prev, ...newPhotos])
    }
    setUploading(false)
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const setMainPhoto = (index: number) => {
    if (index === 0) return // Déjà la principale
    setPhotos(prev => {
      const newPhotos = [...prev]
      const [photo] = newPhotos.splice(index, 1)
      newPhotos.unshift(photo)
      return newPhotos
    })
  }

  const handleImport = async () => {
    if (!scrapedData) return

    setImporting(true)
    setImportError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          data: scrapedData,
          description,
          photos,
          sourceUrl: url
        })
      })

      const result = await response.json()

      if (result.error) {
        setImportError(result.error)
      } else {
        setImportResult(result)
      }
    } catch (error: any) {
      setImportError(error.message)
    } finally {
      setImporting(false)
    }
  }

  const resetForm = () => {
    setUrl('')
    setDescription('')
    setPhotos([])
    setScrapedData(null)
    setImportResult(null)
    setScrapeError('')
    setImportError('')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold">Import d'annonce</h1>
          </div>

          {/* Success Result */}
          {importResult && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h2 className="text-xl font-bold text-green-500">Import réussi !</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono">{importResult.email}</p>
                    <button onClick={() => copyToClipboard(importResult.email)} className="p-1 hover:bg-white/10 rounded">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Mot de passe</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono">{importResult.password}</p>
                    <button onClick={() => copyToClipboard(importResult.password)} className="p-1 hover:bg-white/10 rounded">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <a
                  href={importResult.adUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Voir l'annonce
                </a>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Nouvelle importation
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 1: URL */}
          {!importResult && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Link className="w-5 h-5 text-purple-500" />
                1. Lien de l'annonce source
              </h2>

              <div className="flex gap-4">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.sexemodel.com/escort/..."
                  className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleScrape}
                  disabled={!url || scraping}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition-colors"
                >
                  {scraping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  Analyser
                </button>
              </div>

              {scrapeError && (
                <div className="mt-4 flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  {scrapeError}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Scraped Data */}
          {scrapedData && !importResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                2. Données extraites
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Nom</p>
                  <p className="font-semibold">{scrapedData.username}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Âge</p>
                  <p className="font-semibold">{scrapedData.age} ans</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Ville</p>
                  <p className="font-semibold">{scrapedData.location}</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Téléphone</p>
                  {editingPhone ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={phoneValue}
                        onChange={(e) => setPhoneValue(e.target.value.replace(/[^0-9+]/g, ''))}
                        className="flex-1 bg-black/50 border border-purple-500 rounded px-2 py-1 text-sm focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          setScrapedData({ ...scrapedData, phone: phoneValue })
                          setEditingPhone(false)
                        }}
                        className="p-1 bg-green-500 hover:bg-green-600 rounded transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{scrapedData.phone || 'Non trouvé'}</p>
                      <button
                        onClick={() => setEditingPhone(true)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <Pencil className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Taille</p>
                  <p className="font-semibold">{scrapedData.height} cm</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Poids</p>
                  <p className="font-semibold">{scrapedData.weight} kg</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">WhatsApp</p>
                  <p className="font-semibold">{scrapedData.hasWhatsapp ? 'Oui' : 'Non'}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Colle la description ici..."
                  rows={5}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Photos */}
              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">
                  Photos {photos.length > 0 && <span className="text-purple-400">({photos.length} photo{photos.length > 1 ? 's' : ''})</span>}
                </label>
                <p className="text-xs text-gray-500 mb-3">Clique sur une photo pour la définir comme principale (première position)</p>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
                  {photos.map((photo, index) => (
                    <div
                      key={photo}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden ${index === 0 ? 'ring-2 ring-purple-500' : ''}`}
                      onClick={() => setMainPhoto(index)}
                    >
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-28 object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-purple-500 text-white text-xs px-2 py-0.5 rounded">
                          Principale
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removePhoto(index)
                        }}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-xs py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {index === 0 ? 'Photo principale' : 'Cliquer = principale'}
                      </div>
                    </div>
                  ))}

                  <label className="h-28 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-500/10 transition-all">
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-400">Ajouter</span>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              {/* Import Button */}
              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-lg font-semibold transition-all"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Créer l'annonce
                  </>
                )}
              </button>

              {importError && (
                <div className="mt-4 flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  {importError}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
