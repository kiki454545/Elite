'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { User, Eye, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { VoteStats } from '@/components/VoteStats'

type Gender = 'female' | 'male' | 'couple' | 'transsexual'
type Orientation = 'heterosexual' | 'bisexual' | 'homosexual'
type Ethnicity = 'asian' | 'black' | 'caucasian' | 'latin' | 'indian' | 'oriental' | 'mixed'
type HairColor = 'blond' | 'chestnut' | 'brown' | 'red' | 'black'
type EyeColor = 'blue' | 'gray' | 'brown' | 'hazel' | 'green'
type BreastType = 'natural' | 'silicone'
type HairRemoval = 'fully' | 'partially' | 'circumcised' | 'natural'

export default function EditProfilePage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const { user, profile, loading } = useAuth()

  // Form state - tous vides par défaut
  const [gender, setGender] = useState<Gender | ''>('')
  const [orientation, setOrientation] = useState<Orientation | ''>('')
  const [interestedIn, setInterestedIn] = useState({
    men: false,
    women: false,
    couples: false,
    transsexuals: false,
    over25: false,
    gays: false
  })
  const [showname, setShowname] = useState('')
  const [age, setAge] = useState('')
  const [ethnicity, setEthnicity] = useState<Ethnicity | ''>('')
  const [nationality, setNationality] = useState('')
  const [hair, setHair] = useState<HairColor | ''>('')
  const [eyes, setEyes] = useState<EyeColor | ''>('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [bust, setBust] = useState('')
  const [waist, setWaist] = useState('')
  const [hips, setHips] = useState('')
  const [breastSize, setBreastSize] = useState('')
  const [breastType, setBreastType] = useState<BreastType | ''>('')
  const [hairRemoval, setHairRemoval] = useState<HairRemoval | ''>('')
  const [tattoo, setTattoo] = useState(false)
  const [piercings, setPiercings] = useState(false)
  const [languages, setLanguages] = useState<string[]>([])

  // Charger les données du profil une fois qu'elles sont disponibles
  useEffect(() => {
    async function loadProfile() {
      if (user?.id) {
        // Charger les données depuis Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Erreur lors du chargement du profil:', error)
          return
        }

        if (data) {
          console.log('📥 CHARGEMENT DEPUIS DB - available24_7:', data.available24_7)
          console.log('📥 CHARGEMENT DEPUIS DB - availability:', data.availability)
          console.log('📥 CHARGEMENT DEPUIS DB - type de availability:', typeof data.availability)

          setShowname(data.username || '')
          setGender(data.gender || '')
          setOrientation(data.orientation || '')
          setInterestedIn(data.interested_in || {
            men: false,
            women: false,
            couples: false,
            transsexuals: false,
            over25: false,
            gays: false
          })
          setAge(data.age ? String(data.age) : '')
          setEthnicity(data.ethnicity || '')
          setNationality(data.nationality || '')
          setHair(data.hair_color || '')
          setEyes(data.eye_color || '')
          setHeight(data.height ? String(data.height) : '')
          setWeight(data.weight ? String(data.weight) : '')
          setBust(data.bust ? String(data.bust) : '')
          setWaist(data.waist ? String(data.waist) : '')
          setHips(data.hips ? String(data.hips) : '')
          setBreastSize(data.breast_size || '')
          setBreastType(data.breast_type || '')
          setHairRemoval(data.hair_removal || '')
          setTattoo(data.tattoo || false)
          setPiercings(data.piercings || false)
          setLanguages(data.languages || [])
        }
      }
    }

    loadProfile()
  }, [user?.id])

  // Rediriger si non authentifié (dans un useEffect pour éviter l'erreur côté serveur)
  useEffect(() => {
    if (!loading && (!user || !profile)) {
      router.push('/auth')
    }
  }, [user, profile, loading, router])

  // Afficher un loader pendant la vérification de l'auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">{t('editProfilePage.loading')}</div>
      </div>
    )
  }

  // Ne rien afficher si pas authentifié (la redirection est en cours)
  if (!user || !profile) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) return

    try {
      // Mettre à jour le profil dans Supabase avec TOUTES les données
      const { error } = await supabase
        .from('profiles')
        .update({
          username: showname,
          gender: gender || null,
          orientation: orientation || null,
          interested_in: interestedIn,
          age: age ? parseInt(age) : null,
          ethnicity: ethnicity || null,
          nationality: nationality || null,
          hair_color: hair || null,
          eye_color: eyes || null,
          height: height ? parseInt(height) : null,
          weight: weight ? parseInt(weight) : null,
          bust: bust ? parseInt(bust) : null,
          waist: waist ? parseInt(waist) : null,
          hips: hips ? parseInt(hips) : null,
          breast_size: breastSize || null,
          breast_type: breastType || null,
          hair_removal: hairRemoval || null,
          tattoo: tattoo,
          piercings: piercings,
          languages: languages,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Erreur lors de la mise à jour du profil:', error)
        alert('Erreur lors de la sauvegarde du profil')
        return
      }

      // Recharger le profil depuis Supabase pour mettre à jour le contexte
      await supabase.auth.getSession()

      // Créer et afficher le modal directement dans le DOM
      const modalOverlay = document.createElement('div')
      modalOverlay.id = 'success-modal-overlay'
      modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
      `

      modalOverlay.innerHTML = `
        <div style="width: 90%; max-width: 28rem; padding: 1rem;">
          <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 24px; padding: 2rem; border: 1px solid #374151; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.5);">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h3 style="font-size: 1.5rem; font-weight: bold; color: white; margin-bottom: 0.5rem;">
                ${t('editProfilePage.profileUpdated')}
              </h3>
              <p style="color: #9ca3af; font-size: 0.875rem;">
                ${t('editProfilePage.changesSuccessfullySaved')}
              </p>
            </div>
          </div>
        </div>
      `

      document.body.appendChild(modalOverlay)

      // Rediriger après 2 secondes
      setTimeout(() => {
        modalOverlay.remove()
        router.push('/my-ads')
      }, 2000)
    } catch (err) {
      console.error('Erreur:', err)
      alert('Erreur lors de la sauvegarde du profil')
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-950 pb-24">
        <Header title={t('editProfilePage.title')} />

        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Vote Stats - Classement et XP */}
          {user?.id && (
            <div className="mb-6">
              <VoteStats profileId={user.id} showProgress={true} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section: Informations de base */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-3xl p-6 md:p-8 border border-gray-800 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {t('editProfilePage.basicInfo')}
              </h2>
            </div>

            <div className="space-y-6">
              {/* Showname */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  <span className="text-pink-500">*</span> {t('editProfilePage.pseudo')}
                </label>
                <input
                  type="text"
                  value={showname}
                  onChange={(e) => setShowname(e.target.value)}
                  placeholder={t('editProfilePage.pseudoPlaceholder')}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                />
              </div>

              {/* Âge */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  <span className="text-pink-500">*</span> {t('editProfilePage.age')}
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="18"
                  max="99"
                  placeholder="25"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                />
              </div>

              {/* Genre */}
              <div>
                <label className="text-white text-sm font-medium mb-3 block">
                  <span className="text-pink-500">*</span> {t('editProfilePage.iAm')}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['female', 'male', 'couple', 'transsexual'] as Gender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`p-4 rounded-xl border-2 transition-all font-medium ${
                        gender === g
                          ? 'border-pink-500 bg-pink-500/10 text-pink-500'
                          : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                      }`}
                    >
                      {t(`profileForm.${g}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientation */}
              <div>
                <label className="text-white text-sm font-medium mb-3 block">
                  {t('editProfilePage.sexualOrientation')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['heterosexual', 'bisexual', 'homosexual'] as Orientation[]).map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setOrientation(o)}
                      className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                        orientation === o
                          ? 'border-pink-500 bg-pink-500/10 text-pink-500'
                          : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {t(`profileForm.${o}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intéressé à rencontrer */}
              <div>
                <label className="text-white text-sm font-medium mb-3 block">
                  {t('editProfilePage.interestedInMeeting')}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'men', label: t('profileForm.men'), icon: '👨' },
                    { key: 'women', label: t('profileForm.women'), icon: '👩' },
                    { key: 'couples', label: t('profileForm.couples'), icon: '👫' },
                    { key: 'transsexuals', label: t('profileForm.transsexuals'), icon: '🏳️‍⚧️' },
                    { key: 'over25', label: t('profileForm.over25'), icon: '👥' },
                    { key: 'gays', label: t('profileForm.gays'), icon: '🏳️‍🌈' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setInterestedIn({ ...interestedIn, [item.key]: !interestedIn[item.key as keyof typeof interestedIn] })}
                      className={`p-3 rounded-xl border-2 transition-all text-sm font-medium flex items-center gap-2 justify-center ${
                        interestedIn[item.key as keyof typeof interestedIn]
                          ? 'border-pink-500 bg-pink-500/10 text-pink-500'
                          : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Origine ethnique */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    {t('editProfilePage.ethnicity')}
                  </label>
                  <select
                    value={ethnicity}
                    onChange={(e) => setEthnicity(e.target.value as Ethnicity)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  >
                    <option value="">{t('editProfilePage.selectEthnicity')}</option>
                    {(['asian', 'black', 'caucasian', 'latin', 'indian', 'oriental', 'mixed'] as Ethnicity[]).map((e) => (
                      <option key={e} value={e}>{t(`profileForm.${e}`)}</option>
                    ))}
                  </select>
                </div>

                {/* Nationalité */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    {t('editProfilePage.nationality')}
                  </label>
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  >
                    <option value="">{t('editProfilePage.selectEthnicity')}</option>

                    {/* Europe de l'Ouest */}
                    <optgroup label="Europe de l'Ouest">
                      <option value="FR">France</option>
                      <option value="BE">Belgique</option>
                      <option value="CH">Suisse</option>
                      <option value="LU">Luxembourg</option>
                      <option value="DE">Allemagne</option>
                      <option value="NL">Pays-Bas</option>
                      <option value="AT">Autriche</option>
                      <option value="IE">Irlande</option>
                      <option value="GB">Royaume-Uni</option>
                    </optgroup>

                    {/* Europe du Sud */}
                    <optgroup label="Europe du Sud">
                      <option value="ES">Espagne</option>
                      <option value="IT">Italie</option>
                      <option value="PT">Portugal</option>
                      <option value="GR">Grèce</option>
                      <option value="MT">Malte</option>
                      <option value="CY">Chypre</option>
                    </optgroup>

                    {/* Europe de l'Est */}
                    <optgroup label="Europe de l'Est">
                      <option value="PL">Pologne</option>
                      <option value="RO">Roumanie</option>
                      <option value="BG">Bulgarie</option>
                      <option value="HU">Hongrie</option>
                      <option value="CZ">République tchèque</option>
                      <option value="SK">Slovaquie</option>
                      <option value="UA">Ukraine</option>
                      <option value="BY">Biélorussie</option>
                      <option value="MD">Moldavie</option>
                      <option value="RU">Russie</option>
                      <option value="AL">Albanie</option>
                      <option value="RS">Serbie</option>
                      <option value="HR">Croatie</option>
                      <option value="SI">Slovénie</option>
                      <option value="BA">Bosnie-Herzégovine</option>
                      <option value="MK">Macédoine du Nord</option>
                      <option value="ME">Monténégro</option>
                      <option value="XK">Kosovo</option>
                    </optgroup>

                    {/* Europe du Nord */}
                    <optgroup label="Europe du Nord">
                      <option value="SE">Suède</option>
                      <option value="NO">Norvège</option>
                      <option value="DK">Danemark</option>
                      <option value="FI">Finlande</option>
                      <option value="IS">Islande</option>
                      <option value="EE">Estonie</option>
                      <option value="LV">Lettonie</option>
                      <option value="LT">Lituanie</option>
                    </optgroup>

                    {/* Amérique Latine */}
                    <optgroup label="Amérique Latine">
                      <option value="BR">Brésil</option>
                      <option value="AR">Argentine</option>
                      <option value="CO">Colombie</option>
                      <option value="VE">Venezuela</option>
                      <option value="MX">Mexique</option>
                      <option value="CL">Chili</option>
                      <option value="PE">Pérou</option>
                      <option value="EC">Équateur</option>
                      <option value="UY">Uruguay</option>
                      <option value="PY">Paraguay</option>
                      <option value="BO">Bolivie</option>
                      <option value="CR">Costa Rica</option>
                      <option value="CU">Cuba</option>
                      <option value="DO">République dominicaine</option>
                      <option value="PA">Panama</option>
                    </optgroup>

                    {/* Amérique du Nord */}
                    <optgroup label="Amérique du Nord">
                      <option value="US">États-Unis</option>
                      <option value="CA">Canada</option>
                    </optgroup>

                    {/* Afrique du Nord */}
                    <optgroup label="Afrique du Nord">
                      <option value="MA">Maroc</option>
                      <option value="DZ">Algérie</option>
                      <option value="TN">Tunisie</option>
                      <option value="EG">Égypte</option>
                      <option value="LY">Libye</option>
                    </optgroup>

                    {/* Afrique Subsaharienne */}
                    <optgroup label="Afrique Subsaharienne">
                      <option value="SN">Sénégal</option>
                      <option value="CI">Côte d'Ivoire</option>
                      <option value="CM">Cameroun</option>
                      <option value="NG">Nigeria</option>
                      <option value="GH">Ghana</option>
                      <option value="KE">Kenya</option>
                      <option value="ZA">Afrique du Sud</option>
                      <option value="ET">Éthiopie</option>
                    </optgroup>

                    {/* Asie */}
                    <optgroup label="Asie">
                      <option value="CN">Chine</option>
                      <option value="JP">Japon</option>
                      <option value="KR">Corée du Sud</option>
                      <option value="TH">Thaïlande</option>
                      <option value="VN">Vietnam</option>
                      <option value="PH">Philippines</option>
                      <option value="IN">Inde</option>
                      <option value="ID">Indonésie</option>
                      <option value="MY">Malaisie</option>
                      <option value="SG">Singapour</option>
                      <option value="KH">Cambodge</option>
                      <option value="LA">Laos</option>
                    </optgroup>

                    {/* Moyen-Orient */}
                    <optgroup label="Moyen-Orient">
                      <option value="TR">Turquie</option>
                      <option value="IL">Israël</option>
                      <option value="LB">Liban</option>
                      <option value="JO">Jordanie</option>
                      <option value="AE">Émirats arabes unis</option>
                      <option value="SA">Arabie saoudite</option>
                    </optgroup>

                    {/* Océanie */}
                    <optgroup label="Océanie">
                      <option value="AU">Australie</option>
                      <option value="NZ">Nouvelle-Zélande</option>
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section: Apparence physique */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-3xl p-6 md:p-8 border border-gray-800 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {t('editProfilePage.physicalAppearance')}
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Cheveux */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    {t('editProfilePage.hairColor')}
                  </label>
                  <select
                    value={hair}
                    onChange={(e) => setHair(e.target.value as HairColor)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  >
                    <option value="">{t('editProfilePage.selectEthnicity')}</option>
                    {(['blond', 'chestnut', 'brown', 'red', 'black'] as HairColor[]).map((h) => (
                      <option key={h} value={h}>{t(`profileForm.${h}`)}</option>
                    ))}
                  </select>
                </div>

                {/* Yeux */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    {t('editProfilePage.eyeColor')}
                  </label>
                  <select
                    value={eyes}
                    onChange={(e) => setEyes(e.target.value as EyeColor)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  >
                    <option value="">{t('editProfilePage.selectEthnicity')}</option>
                    {(['blue', 'gray', 'brown', 'hazel', 'green'] as EyeColor[]).map((e) => (
                      <option key={e} value={e}>{t(`profileForm.${e}`)}</option>
                    ))}
                  </select>
                </div>

                {/* Taille */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    {t('editProfilePage.heightCm')}
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="170"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>

                {/* Poids */}
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    {t('editProfilePage.weightKg')}
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="60"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>
              </div>

              {/* Mensurations */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  {t('editProfilePage.measurements')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    value={bust}
                    onChange={(e) => setBust(e.target.value)}
                    placeholder="90"
                    className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  />
                  <input
                    type="number"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    placeholder="60"
                    className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  />
                  <input
                    type="number"
                    value={hips}
                    onChange={(e) => setHips(e.target.value)}
                    placeholder="90"
                    className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>
              </div>

              {/* Bonnet & Type de seins */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    {t('editProfilePage.cupSize')}
                  </label>
                  <select
                    value={breastSize}
                    onChange={(e) => setBreastSize(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  >
                    <option value="">{t('editProfilePage.selectEthnicity')}</option>
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">
                    {t('editProfilePage.breastType')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['natural', 'silicone'] as BreastType[]).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBreastType(b)}
                        className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                          breastType === b
                            ? 'border-pink-500 bg-pink-500/10 text-pink-500'
                            : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        {t(`profileForm.${b}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Épilation */}
              <div>
                <label className="text-white text-sm font-medium mb-3 block">
                  {t('editProfilePage.bikiniWaxing')}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {([
                    { key: 'fully', label: t('profileForm.fullyShaved') },
                    { key: 'partially', label: t('profileForm.partiallyShaved') },
                    { key: 'circumcised', label: t('profileForm.circumcised') },
                    { key: 'natural', label: t('profileForm.entirelyNatural') }
                  ] as { key: HairRemoval, label: string }[]).map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setHairRemoval(item.key)}
                      className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                        hairRemoval === item.key
                          ? 'border-pink-500 bg-pink-500/10 text-pink-500'
                          : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tatouage */}
              <div>
                <label className="text-white text-sm font-medium mb-3 block">
                  {t('editProfilePage.tattoos')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTattoo(true)}
                    className={`p-3 rounded-xl border-2 transition-all font-medium ${
                      tattoo
                        ? 'border-pink-500 bg-pink-500/10 text-pink-500'
                        : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {t('editProfilePage.yes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTattoo(false)}
                    className={`p-3 rounded-xl border-2 transition-all font-medium ${
                      !tattoo
                        ? 'border-pink-500 bg-pink-500/10 text-pink-500'
                        : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {t('editProfilePage.no')}
                  </button>
                </div>
              </div>

              {/* Piercings */}
              <div>
                <label className="text-white text-sm font-medium mb-3 block">
                  {t('editProfilePage.piercings')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPiercings(true)}
                    className={`p-3 rounded-xl border-2 transition-all font-medium ${
                      piercings
                        ? 'border-pink-500 bg-pink-500/10 text-pink-500'
                        : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {t('editProfilePage.yes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPiercings(false)}
                    className={`p-3 rounded-xl border-2 transition-all font-medium ${
                      !piercings
                        ? 'border-pink-500 bg-pink-500/10 text-pink-500'
                        : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {t('editProfilePage.no')}
                  </button>
                </div>
              </div>

              {/* Langues parlées */}
              <div>
                <label className="text-white text-sm font-medium mb-3 block">
                  {t('editProfilePage.spokenLanguages')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[
                    { code: 'fr', label: 'Français 🇫🇷' },
                    { code: 'en', label: 'English 🇬🇧' },
                    { code: 'es', label: 'Español 🇪🇸' },
                    { code: 'de', label: 'Deutsch 🇩🇪' },
                    { code: 'it', label: 'Italiano 🇮🇹' },
                    { code: 'pt', label: 'Português 🇵🇹' },
                    { code: 'nl', label: 'Nederlands 🇳🇱' },
                    { code: 'ru', label: 'Русский 🇷🇺' },
                    { code: 'pl', label: 'Polski 🇵🇱' },
                    { code: 'tr', label: 'Türkçe 🇹🇷' },
                    { code: 'ar', label: 'العربية 🇸🇦' },
                    { code: 'zh', label: '中文 🇨🇳' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        if (languages.includes(lang.code)) {
                          setLanguages(languages.filter(l => l !== lang.code))
                        } else {
                          setLanguages([...languages, lang.code])
                        }
                      }}
                      className={`p-3 rounded-xl border-2 transition-all font-medium text-sm ${
                        languages.includes(lang.code)
                          ? 'border-pink-500 bg-pink-500/10 text-pink-500'
                          : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-2xl font-semibold transition-all border border-gray-700"
            >
              {t('profileForm.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-4 rounded-2xl font-semibold transition-all shadow-lg shadow-pink-500/25"
            >
              {t('profileForm.register')}
            </button>
          </motion.div>
          </form>
        </div>
      </div>

    </>
  )
}
