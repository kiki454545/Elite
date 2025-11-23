'use client'

import { useState, useCallback, useEffect, useRef, memo } from 'react'
import {
  Search, X, ChevronDown, ChevronUp, Filter,
  User, Heart, Ruler, Eye, Globe, MessageCircle,
  MapPin, Shield, Phone
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export interface AdvancedSearchFiltersData {
  // Texte
  searchQuery?: string
  phoneNumber?: string

  // Informations de base
  gender?: string[]
  ageMin?: number
  ageMax?: number
  ethnicity?: string[]
  nationality?: string[]

  // Lieux de rendez-vous
  meetingPlaces?: string[]

  // Langues parlées
  languages?: string[]

  // Attributs physiques
  cupSize?: string[]
  heightMin?: number
  heightMax?: number
  weightMin?: number
  weightMax?: number
  hairColor?: string[]
  eyeColor?: string[]
  bodyType?: string[]
  pubicHair?: string[]
  tattoos?: boolean | null
  piercings?: boolean | null

  // Méta
  verified?: boolean
  hasComments?: boolean
}

interface AdvancedSearchFiltersProps {
  filters: AdvancedSearchFiltersData
  onFiltersChange: (filters: AdvancedSearchFiltersData) => void
  onClear: () => void
}

const GENDER_OPTIONS = [
  { value: 'femme', label: 'Femme', icon: '👩' },
  { value: 'homme', label: 'Homme', icon: '👨' },
  { value: 'trans', label: 'Trans', icon: '🏳️‍⚧️' },
  { value: 'couple', label: 'Couple', icon: '👫' },
  { value: 'non-binaire', label: 'Non-binaire', icon: '🧑' },
]

const ETHNICITY_OPTIONS = [
  { value: 'caucasienne', label: 'Caucasienne', icon: '👱' },
  { value: 'africaine', label: 'Africaine', icon: '👩🏿' },
  { value: 'asiatique', label: 'Asiatique', icon: '👩🏻' },
  { value: 'latine', label: 'Latine', icon: '👩🏽' },
  { value: 'arabe', label: 'Arabe', icon: '👩🏽' },
  { value: 'metisse', label: 'Métisse', icon: '👩🏾' },
  { value: 'indienne', label: 'Indienne', icon: '👳🏽‍♀️' },
  { value: 'autre', label: 'Autre', icon: '👤' },
]

const CUP_SIZE_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

const HAIR_COLOR_OPTIONS = [
  { value: 'blonde', label: 'Blonde', icon: '👱‍♀️' },
  { value: 'brune', label: 'Brune', icon: '👩' },
  { value: 'rousse', label: 'Rousse', icon: '👩‍🦰' },
  { value: 'chatain', label: 'Châtain', icon: '👩' },
  { value: 'noire', label: 'Noire', icon: '👩' },
  { value: 'grise', label: 'Grise', icon: '👵' },
  { value: 'blanche', label: 'Blanche', icon: '👱‍♀️' },
  { value: 'coloree', label: 'Colorée', icon: '🌈' },
  { value: 'autre', label: 'Autre', icon: '💇‍♀️' },
]

const EYE_COLOR_OPTIONS = [
  { value: 'bleus', label: 'Bleus', icon: '👁️' },
  { value: 'verts', label: 'Verts', icon: '👁️' },
  { value: 'marrons', label: 'Marrons', icon: '👁️' },
  { value: 'noirs', label: 'Noirs', icon: '👁️' },
  { value: 'gris', label: 'Gris', icon: '👁️' },
  { value: 'noisette', label: 'Noisette', icon: '👁️' },
  { value: 'autre', label: 'Autre', icon: '👁️' },
]

const BODY_TYPE_OPTIONS = [
  { value: 'mince', label: 'Mince', icon: '🏃‍♀️' },
  { value: 'athletique', label: 'Athlétique', icon: '💪' },
  { value: 'moyenne', label: 'Moyenne', icon: '🚶‍♀️' },
  { value: 'ronde', label: 'Ronde', icon: '🧘‍♀️' },
  { value: 'pulpeuse', label: 'Pulpeuse', icon: '💃' },
  { value: 'musclee', label: 'Musclée', icon: '🏋️‍♀️' },
]

const PUBIC_HAIR_OPTIONS = [
  { value: 'rasee', label: 'Rasée' },
  { value: 'taillee', label: 'Taillée' },
  { value: 'naturelle', label: 'Naturelle' },
  { value: 'epilee', label: 'Épilée' },
]

const MEETING_PLACES = [
  { value: 'home', label: 'Outcall', icon: '🏠' },
  { value: 'hotel', label: 'Hôtel', icon: '🏨' },
  { value: 'car', label: 'Plan voiture', icon: '🚗' },
  { value: 'escort', label: "Incall", icon: '🏡' },
]

const LANGUAGE_OPTIONS = [
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'en', label: 'Anglais', flag: '🇬🇧' },
  { value: 'es', label: 'Espagnol', flag: '🇪🇸' },
  { value: 'de', label: 'Allemand', flag: '🇩🇪' },
  { value: 'it', label: 'Italien', flag: '🇮🇹' },
  { value: 'pt', label: 'Portugais', flag: '🇵🇹' },
  { value: 'ru', label: 'Russe', flag: '🇷🇺' },
  { value: 'ar', label: 'Arabe', flag: '🇸🇦' },
  { value: 'zh', label: 'Chinois', flag: '🇨🇳' },
  { value: 'ja', label: 'Japonais', flag: '🇯🇵' },
  { value: 'nl', label: 'Néerlandais', flag: '🇳🇱' },
  { value: 'pl', label: 'Polonais', flag: '🇵🇱' },
  { value: 'tr', label: 'Turc', flag: '🇹🇷' },
  { value: 'ro', label: 'Roumain', flag: '🇷🇴' },
  { value: 'el', label: 'Grec', flag: '🇬🇷' },
  { value: 'cs', label: 'Tchèque', flag: '🇨🇿' },
  { value: 'hu', label: 'Hongrois', flag: '🇭🇺' },
  { value: 'sv', label: 'Suédois', flag: '🇸🇪' },
  { value: 'da', label: 'Danois', flag: '🇩🇰' },
  { value: 'fi', label: 'Finnois', flag: '🇫🇮' },
  { value: 'no', label: 'Norvégien', flag: '🇳🇴' },
  { value: 'uk', label: 'Ukrainien', flag: '🇺🇦' },
  { value: 'bg', label: 'Bulgare', flag: '🇧🇬' },
  { value: 'hr', label: 'Croate', flag: '🇭🇷' },
  { value: 'sk', label: 'Slovaque', flag: '🇸🇰' },
  { value: 'th', label: 'Thaï', flag: '🇹🇭' },
  { value: 'vi', label: 'Vietnamien', flag: '🇻🇳' },
  { value: 'ko', label: 'Coréen', flag: '🇰🇷' },
  { value: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { value: 'he', label: 'Hébreu', flag: '🇮🇱' },
]

const NATIONALITY_OPTIONS = [
  { value: 'FR', label: 'Française', flag: '🇫🇷' },
  { value: 'BE', label: 'Belge', flag: '🇧🇪' },
  { value: 'CH', label: 'Suisse', flag: '🇨🇭' },
  { value: 'ES', label: 'Espagnole', flag: '🇪🇸' },
  { value: 'IT', label: 'Italienne', flag: '🇮🇹' },
  { value: 'PT', label: 'Portugaise', flag: '🇵🇹' },
  { value: 'DE', label: 'Allemande', flag: '🇩🇪' },
  { value: 'GB', label: 'Britannique', flag: '🇬🇧' },
  { value: 'BR', label: 'Brésilienne', flag: '🇧🇷' },
  { value: 'RU', label: 'Russe', flag: '🇷🇺' },
  { value: 'US', label: 'Américaine', flag: '🇺🇸' },
  { value: 'RO', label: 'Roumaine', flag: '🇷🇴' },
  { value: 'PL', label: 'Polonaise', flag: '🇵🇱' },
  { value: 'MA', label: 'Marocaine', flag: '🇲🇦' },
  { value: 'DZ', label: 'Algérienne', flag: '🇩🇿' },
  { value: 'TN', label: 'Tunisienne', flag: '🇹🇳' },
  { value: 'CN', label: 'Chinoise', flag: '🇨🇳' },
  { value: 'TH', label: 'Thaïlandaise', flag: '🇹🇭' },
  { value: 'CO', label: 'Colombienne', flag: '🇨🇴' },
  { value: 'VE', label: 'Vénézuélienne', flag: '🇻🇪' },
  { value: 'AR', label: 'Argentine', flag: '🇦🇷' },
  { value: 'MX', label: 'Mexicaine', flag: '🇲🇽' },
  { value: 'CU', label: 'Cubaine', flag: '🇨🇺' },
  { value: 'DO', label: 'Dominicaine', flag: '🇩🇴' },
  { value: 'NL', label: 'Néerlandaise', flag: '🇳🇱' },
  { value: 'GR', label: 'Grecque', flag: '🇬🇷' },
  { value: 'TR', label: 'Turque', flag: '🇹🇷' },
  { value: 'UA', label: 'Ukrainienne', flag: '🇺🇦' },
  { value: 'CZ', label: 'Tchèque', flag: '🇨🇿' },
  { value: 'HU', label: 'Hongroise', flag: '🇭🇺' },
  { value: 'BG', label: 'Bulgare', flag: '🇧🇬' },
  { value: 'HR', label: 'Croate', flag: '🇭🇷' },
  { value: 'RS', label: 'Serbe', flag: '🇷🇸' },
  { value: 'SK', label: 'Slovaque', flag: '🇸🇰' },
  { value: 'SI', label: 'Slovène', flag: '🇸🇮' },
  { value: 'LT', label: 'Lituanienne', flag: '🇱🇹' },
  { value: 'LV', label: 'Lettone', flag: '🇱🇻' },
  { value: 'EE', label: 'Estonienne', flag: '🇪🇪' },
  { value: 'SE', label: 'Suédoise', flag: '🇸🇪' },
  { value: 'NO', label: 'Norvégienne', flag: '🇳🇴' },
  { value: 'DK', label: 'Danoise', flag: '🇩🇰' },
  { value: 'FI', label: 'Finlandaise', flag: '🇫🇮' },
  { value: 'IE', label: 'Irlandaise', flag: '🇮🇪' },
  { value: 'AT', label: 'Autrichienne', flag: '🇦🇹' },
  { value: 'LU', label: 'Luxembourgeoise', flag: '🇱🇺' },
  { value: 'JP', label: 'Japonaise', flag: '🇯🇵' },
  { value: 'KR', label: 'Coréenne', flag: '🇰🇷' },
  { value: 'VN', label: 'Vietnamienne', flag: '🇻🇳' },
  { value: 'PH', label: 'Philippine', flag: '🇵🇭' },
  { value: 'ID', label: 'Indonésienne', flag: '🇮🇩' },
  { value: 'IN', label: 'Indienne', flag: '🇮🇳' },
  { value: 'PK', label: 'Pakistanaise', flag: '🇵🇰' },
  { value: 'BD', label: 'Bangladaise', flag: '🇧🇩' },
  { value: 'LK', label: 'Sri-Lankaise', flag: '🇱🇰' },
  { value: 'EG', label: 'Égyptienne', flag: '🇪🇬' },
  { value: 'LB', label: 'Libanaise', flag: '🇱🇧' },
  { value: 'SY', label: 'Syrienne', flag: '🇸🇾' },
  { value: 'IQ', label: 'Irakienne', flag: '🇮🇶' },
  { value: 'IR', label: 'Iranienne', flag: '🇮🇷' },
  { value: 'SA', label: 'Saoudienne', flag: '🇸🇦' },
  { value: 'IL', label: 'Israélienne', flag: '🇮🇱' },
  { value: 'ZA', label: 'Sud-Africaine', flag: '🇿🇦' },
  { value: 'NG', label: 'Nigériane', flag: '🇳🇬' },
  { value: 'GH', label: 'Ghanéenne', flag: '🇬🇭' },
  { value: 'KE', label: 'Kenyane', flag: '🇰🇪' },
  { value: 'ET', label: 'Éthiopienne', flag: '🇪🇹' },
  { value: 'SN', label: 'Sénégalaise', flag: '🇸🇳' },
  { value: 'CI', label: 'Ivoirienne', flag: '🇨🇮' },
  { value: 'CM', label: 'Camerounaise', flag: '🇨🇲' },
  { value: 'CD', label: 'Congolaise (RDC)', flag: '🇨🇩' },
  { value: 'CG', label: 'Congolaise', flag: '🇨🇬' },
  { value: 'CA', label: 'Canadienne', flag: '🇨🇦' },
  { value: 'AU', label: 'Australienne', flag: '🇦🇺' },
  { value: 'NZ', label: 'Néo-Zélandaise', flag: '🇳🇿' },
]

function AdvancedSearchFiltersComponent({ filters, onFiltersChange, onClear }: AdvancedSearchFiltersProps) {
  const { t } = useLanguage()

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    physical: false,
    meta: false,
  })

  // Utiliser des inputs non contrôlés avec defaultValue pour éviter les re-renders
  const ageMinRef = useRef<HTMLInputElement>(null)
  const ageMaxRef = useRef<HTMLInputElement>(null)
  const heightMinRef = useRef<HTMLInputElement>(null)
  const heightMaxRef = useRef<HTMLInputElement>(null)
  const weightMinRef = useRef<HTMLInputElement>(null)
  const weightMaxRef = useRef<HTMLInputElement>(null)

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newState = {
        ...prev,
        [section]: !prev[section]
      }

      // Si on ouvre la section, scroller vers elle après un court délai
      if (!prev[section]) {
        setTimeout(() => {
          const element = document.getElementById(`filter-section-${section}`)
          if (element) {
            // Sur mobile, scroller avec un offset pour bien voir le contenu
            const yOffset = -100 // Offset de 100px depuis le haut
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
            window.scrollTo({ top: y, behavior: 'smooth' })
          }
        }, 150)
      }

      return newState
    })
  }

  // Ref pour garder la dernière version de filters
  const filtersRef = useRef(filters)
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  const toggleArrayFilter = useCallback((key: keyof AdvancedSearchFiltersData, value: string) => {
    const current = (filtersRef.current[key] as string[]) || []
    const newValue = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]

    onFiltersChange({
      ...filtersRef.current,
      [key]: newValue.length > 0 ? newValue : undefined
    })
  }, [onFiltersChange])

  const updateFilter = useCallback((key: keyof AdvancedSearchFiltersData, value: any) => {
    onFiltersChange({
      ...filtersRef.current,
      [key]: value === '' || value === null ? undefined : value
    })
  }, [onFiltersChange])

  // Gérer la perte de focus (onBlur) pour appliquer le filtre
  const handleNumberInputBlur = useCallback((key: keyof AdvancedSearchFiltersData, ref: React.RefObject<HTMLInputElement>) => {
    const value = ref.current?.value || ''
    const numValue = value ? parseInt(value) : undefined
    onFiltersChange({
      ...filtersRef.current,
      [key]: numValue
    })
  }, [onFiltersChange])

  // Reset les champs numériques quand on efface les filtres
  const clearNumberInputs = useCallback(() => {
    if (ageMinRef.current) ageMinRef.current.value = ''
    if (ageMaxRef.current) ageMaxRef.current.value = ''
    if (heightMinRef.current) heightMinRef.current.value = ''
    if (heightMaxRef.current) heightMaxRef.current.value = ''
    if (weightMinRef.current) weightMinRef.current.value = ''
    if (weightMaxRef.current) weightMaxRef.current.value = ''
  }, [])

  // Plus de nettoyage de timers nécessaire

  const hasActiveFilters = () => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'searchQuery') return false
      if (Array.isArray(value)) return value.length > 0
      return value !== undefined && value !== null
    })
  }

  const FilterSection = ({
    id,
    title,
    icon: Icon,
    children
  }: {
    id: string
    title: string
    icon: any
    children: React.ReactNode
  }) => (
    <div id={`filter-section-${id}`} className="border-b border-gray-700">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-pink-400" />
          <span className="text-white font-medium text-sm">{title}</span>
        </div>
        {expandedSections[id] ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {expandedSections[id] && (
        <div className="overflow-hidden">
          <div className="p-4 pt-0 space-y-4">
            {children}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800/50">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-pink-400" />
          <h3 className="text-white font-semibold">{t('search.advancedFilters')}</h3>
        </div>
        {hasActiveFilters() && (
          <button
            onClick={() => {
              clearNumberInputs()
              onClear()
            }}
            className="text-pink-400 hover:text-pink-300 text-sm flex items-center gap-1 transition-colors"
          >
            <X className="w-4 h-4" />
            {t('search.clearAll')}
          </button>
        )}
      </div>

      {/* Recherche par numéro de téléphone */}
      <div className="p-4 border-b border-gray-700">
        <label className="text-gray-300 text-sm font-medium mb-2 block flex items-center gap-2">
          <Phone className="w-4 h-4 text-pink-400" />
          {t('search.searchByPhone')}
        </label>
        <input
          type="tel"
          placeholder={t('search.phonePlaceholder')}
          value={filters.phoneNumber || ''}
          onChange={(e) => updateFilter('phoneNumber', e.target.value)}
          className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-pink-500 focus:outline-none text-sm"
        />
      </div>

      {/* Informations de base */}
      <FilterSection id="basic" title={t('search.basicInfo')} icon={User}>
        {/* Genre */}
        <div>
          <label className="text-gray-300 text-sm font-medium mb-2 block">{t('search.gender.label')}</label>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => toggleArrayFilter('gender', option.value)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  filters.gender?.includes(option.value)
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Âge */}
        <div>
          <label className="text-gray-300 text-sm font-medium mb-2 block">{t('search.age.label')}</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              ref={ageMinRef}
              type="number"
              placeholder={t('search.age.min')}
              min="18"
              max="99"
              defaultValue={filters.ageMin?.toString() || ''}
              onBlur={() => handleNumberInputBlur('ageMin', ageMinRef)}
              className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-pink-500 focus:outline-none text-sm"
            />
            <input
              ref={ageMaxRef}
              type="number"
              placeholder={t('search.age.max')}
              min="18"
              max="99"
              defaultValue={filters.ageMax?.toString() || ''}
              onBlur={() => handleNumberInputBlur('ageMax', ageMaxRef)}
              className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-pink-500 focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Ethnie */}
        <div>
          <label className="text-gray-300 text-sm font-medium mb-2 block">{t('search.ethnicity.label')}</label>
          <div className="flex flex-wrap gap-2">
            {ETHNICITY_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => toggleArrayFilter('ethnicity', option.value)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  filters.ethnicity?.includes(option.value)
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nationalité */}
        <div>
          <label className="text-gray-300 text-sm font-medium mb-2 block">{t('search.nationality.label')}</label>
          <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2">
            {NATIONALITY_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => toggleArrayFilter('nationality', option.value)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 ${
                  filters.nationality?.includes(option.value)
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{option.flag}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lieux de rendez-vous */}
        <div>
          <label className="text-gray-300 text-sm font-medium mb-2 block flex items-center gap-2">
            <MapPin className="w-4 h-4 text-pink-400" />
            {t('search.meetingPlaces')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {MEETING_PLACES.map(place => (
              <button
                key={place.value}
                onClick={() => {
                  const current = filters.meetingPlaces || []
                  const newValue = current.includes(place.value)
                    ? current.filter(v => v !== place.value)
                    : [...current, place.value]
                  updateFilter('meetingPlaces', newValue.length > 0 ? newValue : undefined)
                }}
                className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${
                  filters.meetingPlaces?.includes(place.value)
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{place.icon}</span>
                <span>{place.label}</span>
              </button>
            ))}
          </div>
        </div>

      </FilterSection>


      {/* Méta */}
      <FilterSection id="meta" title={t('search.otherFilters')} icon={Shield}>
        <div className="space-y-3">
          <button
            onClick={() => updateFilter('verified', filters.verified ? undefined : true)}
            className={`w-full px-4 py-3 rounded-lg text-sm transition-all flex items-center justify-between ${
              filters.verified
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {t('search.verifiedOnly')}
            </span>
            {filters.verified && <span className="text-lg">✓</span>}
          </button>

          <button
            onClick={() => updateFilter('hasComments', filters.hasComments ? undefined : true)}
            className={`w-full px-4 py-3 rounded-lg text-sm transition-all flex items-center justify-between ${
              filters.hasComments
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              {t('search.withCommentsOnly')}
            </span>
            {filters.hasComments && <span className="text-lg">✓</span>}
          </button>
        </div>
      </FilterSection>
    </div>
  )
}

// Exporter avec memo pour éviter les re-renders inutiles
export const AdvancedSearchFilters = memo(AdvancedSearchFiltersComponent, (prevProps, nextProps) => {
  // Ne re-render que si onFiltersChange ou onClear changent
  // Ignorer les changements de 'filters' pour éviter la perte de focus
  return prevProps.onFiltersChange === nextProps.onFiltersChange &&
         prevProps.onClear === nextProps.onClear
})
