'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { CreateAdFormData, AdCategory, AD_CATEGORIES, MEETING_PLACES, ESCORT_SERVICES, DAYS_OF_WEEK, ContactInfo, Availability } from '@/types/ad'
import { RANK_CONFIG } from '@/types/profile'
import { Upload, X, MapPin, Phone, MessageCircle, Mail, Clock } from 'lucide-react'
import LocationSelector from '@/components/LocationSelector'
import { searchCities } from '@/data/cities'
import { supabase } from '@/lib/supabase'
import { translateAdData } from '@/i18n/config'

export default function CreateAdPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const { t, language } = useLanguage()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CreateAdFormData>({
    title: '', // Sera ignoré et remplacé par le username au moment de la création
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // États pour disponibilités et contact
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '',
    whatsapp: false,
    telegram: false,
    acceptsEmail: false,
    acceptsCalls: true,
    acceptsSMS: false,
    email: '',
    mymUrl: '',
    onlyfansUrl: '',
    availability: {
      available247: false,
      days: [],
      hours: ''
    }
  })

  // États pour les coordonnées GPS
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">{t('createAdPage.loading')}</div>
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
    if (!user || isSubmitting || photoFiles.length === 0) return

    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      // 1. Upload des photos
      console.log('📤 Upload de', photoFiles.length, 'photos...')
      const photoUrls: string[] = []

      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`

        // Utiliser fetch directement pour éviter le problème multipart
        const uploadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/ad-photos/${fileName}`

        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': file.type,
            'x-upsert': 'false'
          },
          body: file
        })

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error('Erreur upload photo:', errorText)
          throw new Error(`Erreur lors de l'upload de la photo ${i + 1}: ${errorText}`)
        }

        // Récupérer l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('ad-photos')
          .getPublicUrl(fileName)

        photoUrls.push(publicUrl)
      }

      console.log('✅ Photos uploadées:', photoUrls.length)

      // 1b. Upload de la vidéo (si présente)
      let videoUrl: string | null = null
      if (videoFile) {
        console.log('🎬 Upload de la vidéo...')
        const fileExt = videoFile.name.split('.').pop()
        const videoFileName = `${user.id}/${Date.now()}_video.${fileExt}`

        // Utiliser fetch directement pour éviter le problème multipart
        const uploadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/ad-videos/${videoFileName}`

        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': videoFile.type,
            'x-upsert': 'false'
          },
          body: videoFile
        })

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error('Erreur upload vidéo:', errorText)
          throw new Error(`Erreur lors de l'upload de la vidéo: ${errorText}`)
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

      // 3. Créer l'annonce
      const { data: ad, error: adError } = await supabase
        .from('ads')
        .insert({
          user_id: user.id,
          title: profile.username || user.email || 'Utilisateur', // Utiliser le pseudo du profil
          description: formData.description,
          location: city,
          arrondissement: arrondissement || null,
          country: country,
          nearby_cities: filteredNearbyCities,
          categories: formData.categories,
          // Transformer meeting_places en champs booléens
          meeting_at_home: formData.meetingPlaces.includes('home'),
          meeting_at_hotel: formData.meetingPlaces.includes('hotel'),
          meeting_in_car: formData.meetingPlaces.includes('car'),
          meeting_at_escort: formData.meetingPlaces.includes('escort'),
          services: formData.services,
          price: formData.price,
          photos: photoUrls,
          video_url: videoUrl,
          latitude: latitude,
          longitude: longitude,
          // Informations de contact
          phone_number: contactInfo.phone || null,
          has_whatsapp: contactInfo.whatsapp || false,
          has_telegram: contactInfo.telegram || false,
          accepts_sms: contactInfo.acceptsSMS || false,
          accepts_calls: contactInfo.acceptsCalls || false,
          contact_email: contactInfo.email || null,
          mym_url: contactInfo.mymUrl || null,
          onlyfans_url: contactInfo.onlyfansUrl || null,
          available24_7: contactInfo.availability?.available247 || false,
          availability_days: contactInfo.availability?.days || [],
          availability_hours: contactInfo.availability?.hours || null,
          status: 'approved' // Publié directement
        })
        .select()
        .single()

      if (adError) {
        console.error('Erreur création annonce:', adError)
        throw new Error(`Erreur lors de la création de l'annonce: ${adError.message}`)
      }

      console.log('✅ Annonce créée:', ad)

      // 4. Afficher un message de succès
      setSuccessMessage(t('createAdPage.adPublishedSuccess'))

      // Attendre 2 secondes puis rediriger
      setTimeout(() => {
        router.push('/my-ads')
      }, 2000)

    } catch (error: any) {
      console.error('❌ Erreur:', error)
      setErrorMessage(error.message || t('createAdPage.adCreationError'))
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

  const handleLocationChange = async (countryCode: string, cityName: string) => {
    setCountry(countryCode)
    setCity(cityName)
    setFormData((prev) => ({
      ...prev,
      location: cityName,
    }))

    // Récupérer les coordonnées GPS de la ville
    try {
      const { data, error } = await supabase
        .from('french_cities')
        .select('latitude, longitude')
        .ilike('name', cityName)
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Erreur lors de la récupération des coordonnées:', error)
        return
      }

      if (data) {
        setLatitude(data.latitude)
        setLongitude(data.longitude)
        console.log(`📍 Coordonnées GPS récupérées pour ${cityName}:`, data.latitude, data.longitude)
      } else {
        console.warn(`⚠️ Aucune coordonnée GPS trouvée pour la ville: ${cityName}`)
        setLatitude(null)
        setLongitude(null)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setLatitude(null)
      setLongitude(null)
    }
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

    // Limiter selon le grade
    if (photoFiles.length + newFiles.length > maxPhotos) {
      const rankLabel = RANK_CONFIG[userRank].label || 'Standard'
      alert(t('createAdPage.photoLimitAlert', { rank: rankLabel, max: maxPhotos }))
      return
    }

    // Vérifier la taille des fichiers (max 10MB par photo)
    const maxSize = 10 * 1024 * 1024 // 10MB en bytes
    const invalidFiles = newFiles.filter(file => file.size > maxSize)
    if (invalidFiles.length > 0) {
      alert(t('createAdPage.photoSizeAlert'))
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
    setPhotoFiles(prev => prev.filter((_, i) => i !== index))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const setAsMainPhoto = (index: number) => {
    if (index === 0) return // Déjà la photo principale

    // Déplacer la photo sélectionnée en première position
    setPhotoFiles(prev => {
      const newFiles = [...prev]
      const [movedFile] = newFiles.splice(index, 1)
      newFiles.unshift(movedFile)
      return newFiles
    })

    setPhotoPreviews(prev => {
      const newPreviews = [...prev]
      const [movedPreview] = newPreviews.splice(index, 1)
      newPreviews.unshift(movedPreview)
      return newPreviews
    })
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier que c'est une vidéo
    if (!file.type.startsWith('video/')) {
      alert(t('createAdPage.videoTypeAlert'))
      return
    }

    // Vérifier la taille (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      alert(t('createAdPage.videoSizeAlert'))
      return
    }

    // Vérifier la durée de la vidéo
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      const duration = video.duration

      if (duration > 30) {
        alert(t('createAdPage.videoDurationAlert'))
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
  }

  // Gérer le toggle 24/7
  const toggleAvailable247 = () => {
    setContactInfo(prev => {
      const newAvailable247 = !prev.availability?.available247
      return {
        ...prev,
        availability: {
          available247: newAvailable247,
          days: newAvailable247 ? DAYS_OF_WEEK : [],
          hours: prev.availability?.hours || ''
        }
      }
    })
  }

  // Gérer la sélection d'un jour
  const toggleDay = (day: string) => {
    setContactInfo(prev => {
      const currentDays = prev.availability?.days || []
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day]

      return {
        ...prev,
        availability: {
          available247: newDays.length === DAYS_OF_WEEK.length,
          days: newDays,
          hours: prev.availability?.hours || ''
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('createAdPage.title')}
          </h1>
          <p className="text-gray-400">{t('createAdPage.stepIndicator', { step })}</p>
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
                {t('createAdPage.step1Title')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('createAdPage.categoriesLabel')} <span className="text-xs text-gray-500">{t('createAdPage.multipleChoice')}</span>
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
                      {t('createAdPage.categoriesSelected', { count: formData.categories.length })}
                    </p>
                  )}
                </div>

                {/* Le titre sera automatiquement le pseudo de l'utilisateur */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-400">ℹ️</div>
                    <div>
                      <p className="text-sm text-blue-200 font-medium">{t('createAdPage.adTitleInfo')}</p>
                      <p className="text-xs text-blue-300 mt-1">
                        {t('createAdPage.adTitleDesc')} <span className="font-semibold">{profile?.username || user?.email || t('createAdPage.yourUsername')}</span>
                      </p>
                      <p className="text-xs text-blue-300/80 mt-1">
                        {t('createAdPage.changePseudoInfo')}
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
                      {t('createAdPage.arrondissementLabel')} <span className="text-xs text-gray-500">{t('createAdPage.optional')}</span>
                    </label>
                    <select
                      value={arrondissement}
                      onChange={(e) => setArrondissement(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">{t('createAdPage.selectArrondissement')}</option>
                      <option value="1er">{t('createAdPage.arrondissement1')}</option>
                      <option value="2ème">{t('createAdPage.arrondissement2')}</option>
                      <option value="3ème">{t('createAdPage.arrondissement3')}</option>
                      <option value="4ème">{t('createAdPage.arrondissement4')}</option>
                      <option value="5ème">{t('createAdPage.arrondissement5')}</option>
                      <option value="6ème">{t('createAdPage.arrondissement6')}</option>
                      <option value="7ème">{t('createAdPage.arrondissement7')}</option>
                      <option value="8ème">{t('createAdPage.arrondissement8')}</option>
                      <option value="9ème">{t('createAdPage.arrondissement9')}</option>
                      <option value="10ème">{t('createAdPage.arrondissement10')}</option>
                      <option value="11ème">{t('createAdPage.arrondissement11')}</option>
                      <option value="12ème">{t('createAdPage.arrondissement12')}</option>
                      <option value="13ème">{t('createAdPage.arrondissement13')}</option>
                      <option value="14ème">{t('createAdPage.arrondissement14')}</option>
                      <option value="15ème">{t('createAdPage.arrondissement15')}</option>
                      <option value="16ème">{t('createAdPage.arrondissement16')}</option>
                      <option value="17ème">{t('createAdPage.arrondissement17')}</option>
                      <option value="18ème">{t('createAdPage.arrondissement18')}</option>
                      <option value="19ème">{t('createAdPage.arrondissement19')}</option>
                      <option value="20ème">{t('createAdPage.arrondissement20')}</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('createAdPage.travelZonesLabel')} <span className="text-xs text-gray-500">{t('createAdPage.optionalMax4')}</span>
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
                          placeholder={t('createAdPage.cityPlaceholder', { index: index + 1 })}
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
                    {t('createAdPage.travelZonesHelp')}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!city || formData.categories.length === 0}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('createAdPage.continue')}
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
                {t('createAdPage.step2Title')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('createAdPage.descriptionLabel')}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                    placeholder={t('createAdPage.descriptionPlaceholder')}
                    rows={6}
                    maxLength={5000}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('createAdPage.charactersCount', { count: formData.description.length })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('createAdPage.meetingPlacesLabel')} <span className="text-xs text-gray-500">{t('createAdPage.multipleChoice')}</span>
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
                    {t('createAdPage.servicesOfferedLabel')} <span className="text-xs text-gray-500">{t('createAdPage.servicesMultipleChoice')}</span>
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
                      {t('createAdPage.servicesSelected', { count: formData.services.length, plural: formData.services.length > 1 ? 's' : '' })}
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
                {t('createAdPage.back')}
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.description}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('createAdPage.continue')}
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
                {t('createAdPage.step3Title')}
              </h2>
              <p className="text-gray-400 mb-6">
                {t('createAdPage.photosSubtitle', { max: maxPhotos })}
              </p>

              {/* Zone d'upload photos */}
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
                  {t('createAdPage.clickToAddPhotos')}
                </p>
                <p className="text-sm text-gray-400">
                  {t('createAdPage.photoUploadDetails')}
                </p>
              </label>

              {/* Prévisualisation des photos */}
              {photoPreviews.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-gray-400 mb-3">
                    {t('createAdPage.photosAdded', { count: photoPreviews.length, plural: photoPreviews.length > 1 ? 's' : '' })}
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
                          title={t('createAdPage.removePhoto')}
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Badge photo principale OU bouton pour définir comme principale */}
                        {index === 0 ? (
                          <div className="absolute bottom-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                            {t('createAdPage.mainPhoto')}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAsMainPhoto(index)}
                            className="absolute bottom-2 left-2 bg-gray-900/90 text-white text-xs px-2 py-1 rounded hover:bg-pink-500 transition-colors opacity-0 group-hover:opacity-100"
                            title={t('createAdPage.setAsMainPhoto')}
                          >
                            {t('createAdPage.setAsMain')}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-4">
                {t('createAdPage.photosInfo')}
              </p>
            </div>

            {/* Section Vidéo */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-2">
                {t('createAdPage.videoOptional')}
              </h2>
              <p className="text-gray-400 mb-6">
                {t('createAdPage.videoSubtitle')}
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
                      {t('createAdPage.clickToAddVideo')}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t('createAdPage.videoUploadDetails')}
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
                      {t('createAdPage.browserNoVideoSupport')}
                    </video>
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      title={t('createAdPage.removeVideo')}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-green-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('createAdPage.videoAddedSuccess')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-800 text-white py-4 rounded-lg font-medium hover:bg-gray-700 transition-all"
              >
                {t('createAdPage.back')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={photoPreviews.length === 0 || isSubmitting}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('createAdPage.creating') : t('createAdPage.publishAd')}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Disponibilité et Contact */}
        {step === 999 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-2">
                {t('createAdPage.step4Title')}
              </h2>
              <p className="text-gray-400 mb-6">
                {t('createAdPage.step4Subtitle')}
              </p>

              <div className="space-y-6">
                {/* Disponibilité 24/7 */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={contactInfo.availability?.available247 || false}
                        onChange={toggleAvailable247}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                    </div>
                    <div>
                      <span className="text-white font-medium">{t('createAdPage.available247')}</span>
                      <p className="text-sm text-gray-400">{t('createAdPage.available247Help')}</p>
                    </div>
                  </label>
                </div>

                {/* Jours de la semaine */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    {t('createAdPage.daysAvailability')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`py-3 px-4 rounded-lg font-medium transition-all text-sm border-2 ${
                          contactInfo.availability?.days?.includes(day)
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent'
                            : 'bg-gray-800/50 text-gray-400 hover:text-white border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Horaires */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    {t('createAdPage.scheduleLabel')}
                  </label>
                  <input
                    type="text"
                    value={contactInfo.availability?.hours || ''}
                    onChange={(e) => setContactInfo(prev => ({
                      ...prev,
                      availability: {
                        available247: prev.availability?.available247 || false,
                        days: prev.availability?.days || [],
                        hours: e.target.value
                      }
                    }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder={t('createAdPage.schedulePlaceholder')}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('createAdPage.scheduleHelp')}
                  </p>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    {t('createAdPage.phoneLabel')}
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.phone || ''}
                    onChange={(e) => setContactInfo(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder={t('createAdPage.phonePlaceholder')}
                  />
                </div>

                {/* Moyens de contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    {t('createAdPage.preferredContactMethods')}
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contactInfo.whatsapp || false}
                        onChange={(e) => setContactInfo(prev => ({
                          ...prev,
                          whatsapp: e.target.checked
                        }))}
                        className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-pink-600 focus:ring-2 focus:ring-pink-500"
                      />
                      <MessageCircle className="w-5 h-5 text-green-500" />
                      <span className="text-white">WhatsApp</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contactInfo.telegram || false}
                        onChange={(e) => setContactInfo(prev => ({
                          ...prev,
                          telegram: e.target.checked
                        }))}
                        className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-pink-600 focus:ring-2 focus:ring-pink-500"
                      />
                      <MessageCircle className="w-5 h-5 text-blue-500" />
                      <span className="text-white">Telegram</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contactInfo.acceptsSMS || false}
                        onChange={(e) => setContactInfo(prev => ({
                          ...prev,
                          acceptsSMS: e.target.checked
                        }))}
                        className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-pink-600 focus:ring-2 focus:ring-pink-500"
                      />
                      <MessageCircle className="w-5 h-5 text-gray-400" />
                      <span className="text-white">SMS</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={contactInfo.acceptsCalls || false}
                        onChange={(e) => setContactInfo(prev => ({
                          ...prev,
                          acceptsCalls: e.target.checked
                        }))}
                        className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-pink-600 focus:ring-2 focus:ring-pink-500"
                      />
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-white">{language === 'fr' ? 'Appels' : 'Calls'}</span>
                    </label>
                  </div>
                </div>

                {/* Email de contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    {language === 'fr' ? 'Email de contact' : 'Contact Email'}
                  </label>
                  <input
                    type="email"
                    value={contactInfo.email || ''}
                    onChange={(e) => setContactInfo(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="contact@exemple.com"
                  />
                </div>

                {/* MYM */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    MYM
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img src="/icons/mym.svg" alt="MYM" className="w-6 h-6 rounded" />
                    </div>
                    <input
                      type="url"
                      value={contactInfo.mymUrl || ''}
                      onChange={(e) => setContactInfo(prev => ({
                        ...prev,
                        mymUrl: e.target.value
                      }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="https://mym.fans/votre-profil"
                    />
                  </div>
                </div>

                {/* OnlyFans */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    OnlyFans
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <img src="/icons/onlyfans.svg" alt="OnlyFans" className="w-6 h-6 rounded" />
                    </div>
                    <input
                      type="url"
                      value={contactInfo.onlyfansUrl || ''}
                      onChange={(e) => setContactInfo(prev => ({
                        ...prev,
                        onlyfansUrl: e.target.value
                      }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="https://onlyfans.com/votre-profil"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-gray-800 text-white py-4 rounded-lg font-medium hover:bg-gray-700 transition-all"
              >
                {t('createAdPage.back')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('createAdPage.publishing') : t('createAdPage.publishAd')}
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
                <h3 className="text-lg font-bold text-white mb-1">{t('createAdPage.error')}</h3>
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
                  <h3 className="text-lg font-bold text-white mb-1">{t('createAdPage.success')}</h3>
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
