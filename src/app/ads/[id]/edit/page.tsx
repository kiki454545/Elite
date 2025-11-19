'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { CreateAdFormData, AdCategory, AD_CATEGORIES, MEETING_PLACES, ESCORT_SERVICES } from '@/types/ad'
import { RANK_CONFIG } from '@/types/profile'
import { Upload, X, MapPin } from 'lucide-react'
import LocationSelector from '@/components/LocationSelector'
import { searchCities } from '@/data/cities'
import { supabase } from '@/lib/supabase'
import { translateAdData } from '@/i18n/config'

export default function EditAdPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const { t, language } = useLanguage()
  const [step, setStep] = useState(1)
  const [adId] = useState(params.id)
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState<CreateAdFormData>({
    title: '',
    description: '',
    location: '',
    categories: [], // Choix multiple vide au départ
    photos: [],
    price: undefined,
    services: [],
    availability: '',
    meetingPlaces: [],
  })
  const [country, setCountry] = useState('FR')
  const [city, setCity] = useState('')
  const [arrondissement, setArrondissement] = useState('')
  const [nearbyCities, setNearbyCities] = useState<string[]>([])
  const [nearbyCityInputs, setNearbyCityInputs] = useState<string[]>(['', '', '', ''])
  const [nearbyCitySuggestions, setNearbyCitySuggestions] = useState<string[][]>([[], [], [], []])
  const [showSuggestions, setShowSuggestions] = useState<boolean[]>([false, false, false, false])
  const [justSelected, setJustSelected] = useState<boolean[]>([false, false, false, false])
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)


  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Charger les données de l'annonce existante
  useEffect(() => {
    if (user && adId) {
      loadAdData()
    }
  }, [user, adId])

  async function loadAdData() {
    try {
      setIsLoading(true)

      const { data: ad, error } = await supabase
        .from('ads')
        .select('*')
        .eq('id', adId)
        .eq('user_id', user!.id) // Vérifier que c'est bien l'annonce de l'utilisateur
        .single()

      if (error) throw error

      if (!ad) {
        setErrorMessage(t('adEditPage.errors.notFound'))
        setTimeout(() => router.push('/my-ads'), 2000)
        return
      }

      // Remplir le formulaire avec les données existantes
      setFormData({
        title: ad.title || '',
        description: ad.description || '',
        location: ad.location || '',
        categories: ad.categories || [],
        photos: ad.photos || [],
        price: ad.price || undefined,
        services: [],
        availability: '',
        meetingPlaces: ad.meeting_places || [],
      })

      setCountry(ad.country || 'FR')
      setCity(ad.location || '')
      setArrondissement(ad.arrondissement || '')
      setExistingPhotos(ad.photos || [])
      setPhotoPreviews(ad.photos || [])

      // Charger la vidéo existante
      if (ad.video_url) {
        setExistingVideoUrl(ad.video_url)
        setVideoPreview(ad.video_url)
      }

      // Charger les villes autour
      if (ad.nearby_cities && ad.nearby_cities.length > 0) {
        const inputs = ['', '', '', '']
        ad.nearby_cities.forEach((city: string, index: number) => {
          if (index < 4) inputs[index] = city
        })
        setNearbyCityInputs(inputs)
      }


      setIsLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'annonce:', error)
      setErrorMessage(t('adEditPage.errors.loadFailed'))
      setIsLoading(false)
    }
  }


  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">{t('adEditPage.loading')}</div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  // Obtenir la limite de photos selon le grade
  const userRank = (profile.rank || 'standard') as keyof typeof RANK_CONFIG
  const maxPhotos = RANK_CONFIG[userRank].maxPhotos

  const handleSubmit = async () => {
    if (!user || isSubmitting) return

    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      // 1. Upload des nouvelles photos (si il y en a)
      let photoUrls: string[] = [...existingPhotos]

      if (photoFiles.length > 0) {
        const newPhotoUrls: string[] = []

        for (let i = 0; i < photoFiles.length; i++) {
          const file = photoFiles[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`

          const { data, error } = await supabase.storage
            .from('ad-photos')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (error) {
            console.error('Erreur upload photo:', error)
            throw new Error(`${t('adEditPage.errors.photoUpload')} ${i + 1}: ${error.message}. ${t('adEditPage.errors.checkBucket')}`)
          }

          // Récupérer l'URL publique
          const { data: { publicUrl } } = supabase.storage
            .from('ad-photos')
            .getPublicUrl(fileName)

          newPhotoUrls.push(publicUrl)
        }

        photoUrls = [...existingPhotos, ...newPhotoUrls]
      }

      console.log('✅ Photos uploadées:', photoUrls.length)

      // 1b. Upload de la nouvelle vidéo (si présente)
      let videoUrl: string | null = existingVideoUrl
      if (videoFile) {
        console.log('🎬 Upload de la vidéo...')
        const fileExt = videoFile.name.split('.').pop()
        const videoFileName = `${user.id}/${Date.now()}_video.${fileExt}`

        const { data, error } = await supabase.storage
          .from('ad-videos')
          .upload(videoFileName, videoFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('Erreur upload vidéo:', error)
          throw new Error(`${t('adEditPage.errors.videoUpload')}: ${error.message}`)
        }

        // Supprimer l'ancienne vidéo si elle existe
        if (existingVideoUrl) {
          try {
            const oldVideoPath = existingVideoUrl.split('/ad-videos/')[1]
            if (oldVideoPath) {
              await supabase.storage.from('ad-videos').remove([oldVideoPath])
            }
          } catch (err) {
            console.warn('Erreur lors de la suppression de l\'ancienne vidéo:', err)
          }
        }

        // Récupérer l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('ad-videos')
          .getPublicUrl(videoFileName)

        videoUrl = publicUrl
        console.log('✅ Vidéo uploadée')
      }

      // 2. Filtrer les villes autour (retirer les vides)
      const filteredNearbyCities = nearbyCityInputs.filter(c => c.trim() !== '')

      // 3. Mettre à jour l'annonce
      console.log('📝 Données à mettre à jour:', {
        categories: formData.categories,
        meeting_places: formData.meetingPlaces,
        services: formData.services,
        servicesCount: formData.services?.length || 0
      })

      const updateData = {
        user_id: user.id,
        title: profile.username || user.email || 'Utilisateur', // Utiliser le pseudo du profil
        description: formData.description,
        location: city,
        arrondissement: arrondissement || null,
        country: country,
        nearby_cities: filteredNearbyCities,
        categories: formData.categories,
        meeting_places: formData.meetingPlaces,
        services: formData.services,
        price: formData.price,
        photos: photoUrls,
        video_url: videoUrl
        // Note: availability et contact_info sont gérés dans le profil, pas dans l'annonce
      }

      console.log('🚀 Envoi de la mise à jour via API...')

      // Utiliser la route API pour éviter les problèmes CORS
      const response = await fetch('/api/ads/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adId,
          userId: user.id,
          updateData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erreur mise à jour annonce:', errorData)
        throw new Error(`${t('adEditPage.errors.updateFailed')}: ${errorData.error || t('adEditPage.errors.unknown')}`)
      }

      const { data: ad } = await response.json()
      console.log('✅ Annonce mise à jour:', ad)

      // 4. Afficher un message de succès
      setSuccessMessage(t('adEditPage.successMessage'))

      // Attendre 2 secondes puis rediriger
      setTimeout(() => {
        router.push('/my-ads')
      }, 2000)

    } catch (error: any) {
      console.error('❌ Erreur:', error)
      setErrorMessage(error.message || t('adEditPage.errors.general'))
      setIsSubmitting(false)
    }
  }

  const toggleCategory = (category: AdCategory) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const toggleMeetingPlace = (place: string) => {
    setFormData((prev) => ({
      ...prev,
      meetingPlaces: prev.meetingPlaces.includes(place)
        ? prev.meetingPlaces.filter((p) => p !== place)
        : [...prev.meetingPlaces, place],
    }))
  }

  const toggleService = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }))
  }

  const handleLocationChange = (countryCode: string, cityName: string) => {
    setCountry(countryCode)
    setCity(cityName)
    setFormData((prev) => ({
      ...prev,
      location: cityName,
    }))
  }

  const handleNearbyCityInput = (index: number, value: string) => {
    const newInputs = [...nearbyCityInputs]
    newInputs[index] = value
    setNearbyCityInputs(newInputs)

    // Si on vient de sélectionner une ville, ne pas afficher les suggestions
    if (justSelected[index]) {
      const newJustSelected = [...justSelected]
      newJustSelected[index] = false
      setJustSelected(newJustSelected)
      return
    }

    if (value.length >= 2) {
      const suggestions = searchCities(country, value)
      const newSuggestions = [...nearbyCitySuggestions]
      newSuggestions[index] = suggestions
      setNearbyCitySuggestions(newSuggestions)

      const newShowSuggestions = [...showSuggestions]
      newShowSuggestions[index] = suggestions.length > 0
      setShowSuggestions(newShowSuggestions)
    } else {
      const newShowSuggestions = [...showSuggestions]
      newShowSuggestions[index] = false
      setShowSuggestions(newShowSuggestions)
    }
  }

  const selectNearbyCity = (index: number, cityName: string) => {
    // Marquer qu'on vient de sélectionner pour éviter de réafficher les suggestions
    const newJustSelected = [...justSelected]
    newJustSelected[index] = true
    setJustSelected(newJustSelected)

    const newInputs = [...nearbyCityInputs]
    newInputs[index] = cityName
    setNearbyCityInputs(newInputs)

    const newShowSuggestions = [...showSuggestions]
    newShowSuggestions[index] = false
    setShowSuggestions(newShowSuggestions)

    // Mettre à jour la liste des villes autour
    const newNearbyCities = nearbyCityInputs.filter((c, i) =>
      (i === index ? cityName : c) && (i === index ? cityName : c) !== '' && (i === index ? cityName : c) !== city
    )
    setNearbyCities(newNearbyCities)
  }

  const clearNearbyCity = (index: number) => {
    const newInputs = [...nearbyCityInputs]
    newInputs[index] = ''
    setNearbyCityInputs(newInputs)

    const newShowSuggestions = [...showSuggestions]
    newShowSuggestions[index] = false
    setShowSuggestions(newShowSuggestions)

    // Mettre à jour la liste
    const newNearbyCities = nearbyCityInputs.filter((c, i) => i !== index && c !== '' && c !== city)
    setNearbyCities(newNearbyCities)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)

    // Obtenir la limite de photos selon le grade de l'utilisateur
    const userRank = (profile?.rank || 'standard') as keyof typeof RANK_CONFIG
    const maxPhotos = RANK_CONFIG[userRank].maxPhotos

    // Limiter selon le grade (total = photos existantes + nouvelles photos + files à ajouter)
    const totalPhotos = existingPhotos.length + photoFiles.length + newFiles.length
    if (totalPhotos > maxPhotos) {
      const rankLabel = RANK_CONFIG[userRank].label || 'Standard'
      alert(`Avec votre grade ${rankLabel}, vous ne pouvez ajouter que ${maxPhotos} photos maximum. Passez à un grade supérieur pour plus de photos !`)
      return
    }

    // Vérifier la taille des fichiers (max 10MB par photo)
    const maxSize = 10 * 1024 * 1024 // 10MB en bytes
    const invalidFiles = newFiles.filter(file => file.size > maxSize)
    if (invalidFiles.length > 0) {
      alert('Certaines photos dépassent 10MB. Veuillez choisir des photos plus petites.')
      return
    }

    // Ajouter les nouveaux fichiers
    setPhotoFiles(prev => [...prev, ...newFiles])

    // Créer les prévisualisations
    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    // Réinitialiser l'input pour permettre de sélectionner à nouveau les mêmes fichiers
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    const existingCount = existingPhotos.length

    if (index < existingCount) {
      // Supprimer une photo existante
      setExistingPhotos(prev => prev.filter((_, i) => i !== index))
      setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
    } else {
      // Supprimer une nouvelle photo
      const newIndex = index - existingCount
      setPhotoFiles(prev => prev.filter((_, i) => i !== newIndex))
      setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier que c'est une vidéo
    if (!file.type.startsWith('video/')) {
      alert('Veuillez sélectionner un fichier vidéo (MP4, MOV, WebM)')
      return
    }

    // Vérifier la taille (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      alert('La vidéo ne doit pas dépasser 50 MB')
      return
    }

    // Vérifier la durée de la vidéo
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      const duration = video.duration

      if (duration > 30) {
        alert('La vidéo ne doit pas dépasser 30 secondes')
        return
      }

      // Tout est OK, on peut ajouter la vidéo
      setVideoFile(file)

      // Créer la prévisualisation
      const reader = new FileReader()
      reader.onloadend = () => {
        setVideoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }

    video.src = URL.createObjectURL(file)
    e.target.value = ''
  }

  const removeVideo = () => {
    setVideoFile(null)
    setVideoPreview(null)
    setExistingVideoUrl(null)
  }

  const setAsMainPhoto = (index: number) => {
    if (index === 0) return // Déjà la photo principale

    const existingCount = existingPhotos.length

    if (index < existingCount) {
      // Déplacer une photo existante en première position
      setExistingPhotos(prev => {
        const newPhotos = [...prev]
        const [moved] = newPhotos.splice(index, 1)
        newPhotos.unshift(moved)
        return newPhotos
      })
    } else {
      // Déplacer une nouvelle photo
      const newIndex = index - existingCount
      setPhotoFiles(prev => {
        const newFiles = [...prev]
        const [moved] = newFiles.splice(newIndex, 1)
        newFiles.unshift(moved)
        return newFiles
      })

      // Si on déplace une nouvelle photo en première, elle doit être avant toutes les existantes
      // On inverse: toutes les nouvelles photos avant les existantes
      const allExisting = [...existingPhotos]
      const allNew = [photoFiles[newIndex], ...photoFiles.filter((_, i) => i !== newIndex)]
      setExistingPhotos([])
      // On met tout dans photoPreviews dans le bon ordre
    }

    // Reconstruire photoPreviews dans le bon ordre
    setPhotoPreviews(prev => {
      const newPreviews = [...prev]
      const [moved] = newPreviews.splice(index, 1)
      newPreviews.unshift(moved)
      return newPreviews
    })
  }


  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('adEditPage.title')}
          </h1>
          <p className="text-gray-400">{t('adEditPage.stepProgress', { step, total: 3 })}</p>
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full ${
                  s <= step
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600'
                    : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Informations de base */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-6">
                {t('adEditPage.step1.title')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('adEditPage.step1.categories')} <span className="text-xs text-gray-500">{t('adEditPage.step1.multipleChoice')}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(AD_CATEGORIES) as AdCategory[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`py-4 rounded-xl font-medium transition-all flex flex-col items-center justify-center gap-2 border-2 ${
                          formData.categories.includes(cat)
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent'
                            : 'bg-gray-800/50 text-gray-400 hover:text-white border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <span className="text-2xl">{AD_CATEGORIES[cat].icon}</span>
                        <span className="text-sm">{translateAdData(`categories.${cat}`, language)}</span>
                      </button>
                    ))}
                  </div>
                  {formData.categories.length > 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                      {t('adEditPage.step1.categoriesSelected', { count: formData.categories.length })}
                    </p>
                  )}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-400">ℹ️</div>
                    <div>
                      <p className="text-sm text-blue-200 font-medium">{t('adEditPage.step1.adTitle')}</p>
                      <p className="text-xs text-blue-300 mt-1">
                        {t('adEditPage.step1.adTitleInfo')} <span className="font-semibold">{profile?.username || user?.email || t('adEditPage.step1.yourUsername')}</span>
                      </p>
                      <p className="text-xs text-blue-300/80 mt-1">
                        {t('adEditPage.step1.adTitleChange')}
                      </p>
                    </div>
                  </div>
                </div>

                <LocationSelector
                  onLocationChange={handleLocationChange}
                  initialCountry={country}
                  initialCity={city}
                />

                {/* Arrondissement pour Paris */}
                {city.toLowerCase() === 'paris' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('adEditPage.step1.arrondissement')} <span className="text-xs text-gray-500">{t('adEditPage.step1.optional')}</span>
                    </label>
                    <select
                      value={arrondissement}
                      onChange={(e) => setArrondissement(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">{t('adEditPage.step1.selectArrondissement')}</option>
                      <option value="1er">{t('adEditPage.step1.arr1')}</option>
                      <option value="2ème">{t('adEditPage.step1.arr2')}</option>
                      <option value="3ème">{t('adEditPage.step1.arr3')}</option>
                      <option value="4ème">{t('adEditPage.step1.arr4')}</option>
                      <option value="5ème">{t('adEditPage.step1.arr5')}</option>
                      <option value="6ème">{t('adEditPage.step1.arr6')}</option>
                      <option value="7ème">{t('adEditPage.step1.arr7')}</option>
                      <option value="8ème">{t('adEditPage.step1.arr8')}</option>
                      <option value="9ème">{t('adEditPage.step1.arr9')}</option>
                      <option value="10ème">{t('adEditPage.step1.arr10')}</option>
                      <option value="11ème">{t('adEditPage.step1.arr11')}</option>
                      <option value="12ème">{t('adEditPage.step1.arr12')}</option>
                      <option value="13ème">{t('adEditPage.step1.arr13')}</option>
                      <option value="14ème">{t('adEditPage.step1.arr14')}</option>
                      <option value="15ème">{t('adEditPage.step1.arr15')}</option>
                      <option value="16ème">{t('adEditPage.step1.arr16')}</option>
                      <option value="17ème">{t('adEditPage.step1.arr17')}</option>
                      <option value="18ème">{t('adEditPage.step1.arr18')}</option>
                      <option value="19ème">{t('adEditPage.step1.arr19')}</option>
                      <option value="20ème">{t('adEditPage.step1.arr20')}</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('adEditPage.step1.travelZones')} <span className="text-xs text-gray-500">{t('adEditPage.step1.optionalMax4')}</span>
                  </label>

                  <div className="space-y-3">
                    {[0, 1, 2, 3].map((index) => (
                      <div key={index} className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={nearbyCityInputs[index]}
                          onChange={(e) => handleNearbyCityInput(index, e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-11 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                          placeholder={t('adEditPage.step1.cityPlaceholder', { number: index + 1 })}
                          autoComplete="off"
                        />
                        {nearbyCityInputs[index] && (
                          <button
                            type="button"
                            onClick={() => clearNearbyCity(index)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}

                        {/* Suggestions */}
                        {showSuggestions[index] && nearbyCitySuggestions[index].length > 0 && (
                          <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                            {nearbyCitySuggestions[index].map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  selectNearbyCity(index, suggestion)
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors text-white border-b border-gray-700 last:border-b-0"
                              >
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span>{suggestion}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    {t('adEditPage.step1.travelZonesInfo')}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!city || formData.categories.length === 0}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('adEditPage.continue')}
            </button>
          </motion.div>
        )}

        {/* Step 2: Description et services */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-6">
                {t('adEditPage.step2.title')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('adEditPage.step2.description')}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                    placeholder={t('adEditPage.step2.descriptionPlaceholder')}
                    rows={6}
                    maxLength={5000}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('adEditPage.step2.characterCount', { count: formData.description.length })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('adEditPage.step2.meetingPlaces')} <span className="text-xs text-gray-500">{t('adEditPage.step1.multipleChoice')}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {MEETING_PLACES.map((place) => (
                      <button
                        key={place}
                        type="button"
                        onClick={() => toggleMeetingPlace(place)}
                        className={`py-3 px-4 rounded-lg font-medium transition-all text-sm border-2 ${
                          formData.meetingPlaces.includes(place)
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent'
                            : 'bg-gray-800/50 text-gray-400 hover:text-white border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        {translateAdData(`meetingPlaces.${place}`, language)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    {t('adEditPage.step2.services')} <span className="text-xs text-gray-500">{t('adEditPage.step2.servicesInfo')}</span>
                  </label>
                  <div className="bg-gray-800/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ESCORT_SERVICES.map((service) => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => toggleService(service)}
                          className={`py-2 px-3 rounded-lg font-medium transition-all text-xs text-left border ${
                            formData.services.includes(service)
                              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent shadow-md'
                              : 'bg-gray-800/50 text-gray-400 hover:text-white border-gray-700 hover:border-gray-600 hover:bg-gray-700/50'
                          }`}
                        >
                          {translateAdData(`services.${service}`, language)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {formData.services.length > 0 && (
                    <p className="text-xs text-pink-400 mt-2">
                      {t('adEditPage.step2.servicesSelected', { count: formData.services.length })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-800 text-white py-4 rounded-lg font-medium hover:bg-gray-700 transition-all"
              >
                {t('adEditPage.back')}
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.description}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('adEditPage.continue')}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-2">
                {t('adEditPage.step3.title')}
              </h2>
              <p className="text-gray-400 mb-6">
                {t('adEditPage.step3.subtitle', { maxPhotos })}
              </p>

              {/* Zone d'upload */}
              <input
                type="file"
                id="photo-upload"
                accept="image/png,image/jpeg,image/jpg"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
              <label
                htmlFor="photo-upload"
                className="block border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-pink-500 transition-colors cursor-pointer"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white mb-2">
                  {t('adEditPage.step3.clickToAddPhotos')}
                </p>
                <p className="text-sm text-gray-400">
                  {t('adEditPage.step3.photoFormats')}
                </p>
              </label>

              {/* Prévisualisation des photos */}
              {photoPreviews.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-gray-400 mb-3">
                    {t('adEditPage.step3.photosAdded', { count: photoPreviews.length })}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {photoPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-700"
                        />

                        {/* Bouton supprimer */}
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          title="Supprimer cette photo"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Badge photo principale OU bouton pour définir comme principale */}
                        {index === 0 ? (
                          <div className="absolute bottom-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                            {t('adEditPage.step3.mainPhoto')}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAsMainPhoto(index)}
                            className="absolute bottom-2 left-2 bg-gray-900/90 text-white text-xs px-2 py-1 rounded hover:bg-pink-500 transition-colors opacity-0 group-hover:opacity-100"
                            title={t('adEditPage.step3.setAsMain')}
                          >
                            {t('adEditPage.step3.setAsMain')}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-4">
                {t('adEditPage.step3.photoVerificationInfo')}
              </p>
            </div>

            {/* Section Vidéo */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-2">
                {t('adEditPage.step3.videoTitle')}
              </h2>
              <p className="text-gray-400 mb-6">
                {t('adEditPage.step3.videoSubtitle')}
              </p>

              {!videoPreview ? (
                <>
                  <input
                    type="file"
                    id="video-upload"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="video-upload"
                    className="block border-2 border-dashed border-purple-700 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
                  >
                    <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-white mb-2">
                      {t('adEditPage.step3.clickToAddVideo')}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t('adEditPage.step3.videoFormats')}
                    </p>
                  </label>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full rounded-lg border border-gray-700"
                    >
                      {t('adEditPage.step3.browserNotSupported')}
                    </video>
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      title="Supprimer la vidéo"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-green-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {existingVideoUrl && !videoFile ? t('adEditPage.step3.existingVideo') : t('adEditPage.step3.videoAddedSuccess')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-800 text-white py-4 rounded-lg font-medium hover:bg-gray-700 transition-all"
              >
                {t('adEditPage.back')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('adEditPage.updating') : t('adEditPage.updateAd')}
              </button>
            </div>
          </motion.div>
        )}

      </div>

      {/* Messages d'erreur et de succès stylés */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 max-w-md w-full mx-4 z-50"
        >
          <div className="bg-red-500/10 border-2 border-red-500 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">{t('adEditPage.errorTitle')}</h3>
                <p className="text-sm text-gray-300">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {successMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-md w-full"
          >
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 border-2 border-pink-500 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{t('adEditPage.successTitle')}</h3>
                  <p className="text-sm text-gray-300">{successMessage}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
