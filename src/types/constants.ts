// Langues disponibles avec leurs codes ISO 639-1
export const LANGUAGES = {
  fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
  en: { code: 'en', name: 'English', flag: '🇬🇧' },
  es: { code: 'es', name: 'Español', flag: '🇪🇸' },
  it: { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  pt: { code: 'pt', name: 'Português', flag: '🇵🇹' },
  nl: { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  ru: { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ar: { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  zh: { code: 'zh', name: '中文', flag: '🇨🇳' },
  ja: { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ko: { code: 'ko', name: '한국어', flag: '🇰🇷' },
  tr: { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  pl: { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  ro: { code: 'ro', name: 'Română', flag: '🇷🇴' },
  cs: { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  sv: { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  da: { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  no: { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  fi: { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  el: { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  hu: { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  bg: { code: 'bg', name: 'Български', flag: '🇧🇬' },
  uk: { code: 'uk', name: 'Українська', flag: '🇺🇦' },
} as const

export type LanguageCode = keyof typeof LANGUAGES

// Couleurs de cheveux
export const HAIR_COLORS = [
  'Blond',
  'Brun',
  'Châtain',
  'Roux',
  'Noir',
  'Gris',
  'Blanc',
  'Coloré',
  'Autre',
] as const

// Couleurs des yeux
export const EYE_COLORS = [
  'Marron',
  'Bleu',
  'Vert',
  'Noisette',
  'Gris',
  'Noir',
  'Ambre',
  'Autre',
] as const

// Origines ethniques
export const ETHNICITIES = [
  'Caucasien',
  'Africain',
  'Asiatique',
  'Latino',
  'Arabe',
  'Métis',
  'Indien',
  'Caribéen',
  'Autre',
] as const

// Types de morphologie
export const BODY_TYPES = [
  'Mince',
  'Athlétique',
  'Normal',
  'Pulpeuse',
  'Ronde',
  'Musclée',
  'Petite',
  'Grande',
] as const

// Tailles de bonnet
export const CUP_SIZES = [
  'A',
  'B',
  'C',
  'D',
  'DD',
  'E',
  'F',
  'G',
  'H',
  'Naturelle',
  'Augmentée',
] as const

// Plages horaires communes
export const COMMON_SCHEDULES = [
  'Lundi - Vendredi, 9h - 18h',
  'Lundi - Vendredi, 10h - 22h',
  'Lundi - Samedi, 9h - 18h',
  'Lundi - Samedi, 10h - 22h',
  'Lundi - Dimanche, 9h - 18h',
  'Lundi - Dimanche, 10h - 22h',
  'Disponible 24h/24, 7j/7',
  'Sur rendez-vous uniquement',
  'Horaires flexibles',
  'Week-ends uniquement',
  'Soirées uniquement',
] as const

// Disponibilités communes
export const AVAILABILITY_OPTIONS = [
  'Immédiate',
  'Sur rendez-vous (24h à l\'avance)',
  'Sur rendez-vous (48h à l\'avance)',
  'Sur rendez-vous (1 semaine à l\'avance)',
  'Flexible',
  'Week-ends uniquement',
  'En semaine uniquement',
  'Soirées et nuits',
  'Journées uniquement',
] as const

// Services communs (déjà définis dans ad.ts mais on les réexporte ici)
export const COMMON_SERVICES = [
  'Massage',
  'Érotique',
  'Domination',
  'Soumission',
  'Fétichisme',
  'Couple',
  'Trio',
  'Anal',
  'Oral',
  'GFE',
  'PSE',
  'Tantrique',
  'Body-body',
  'Striptease',
  'Webcam',
  'Photos personnalisées',
] as const

// Helper pour obtenir le nom d'une langue
export function getLanguageName(code: string): string {
  return LANGUAGES[code as LanguageCode]?.name || code
}

// Helper pour obtenir le drapeau d'une langue
export function getLanguageFlag(code: string): string {
  return LANGUAGES[code as LanguageCode]?.flag || '🌐'
}

// Helper pour formater les langues en texte lisible
export function formatLanguages(codes: string[]): string {
  return codes.map(code => getLanguageName(code)).join(', ')
}

// Helper pour formater les mensurations
export function formatMeasurements(measurements: string | undefined): string {
  if (!measurements) return 'Non spécifié'
  return measurements
}

// Helper pour formater la taille
export function formatHeight(height: number | undefined): string {
  if (!height) return 'Non spécifié'
  return `${height} cm`
}

// Helper pour formater le poids
export function formatWeight(weight: number | undefined): string {
  if (!weight) return 'Non spécifié'
  return `${weight} kg`
}

// Dictionnaire des pays avec leurs codes ISO
export const COUNTRY_NAMES: Record<string, string> = {
  // Europe
  'FR': 'France',
  'BE': 'Belgique',
  'CH': 'Suisse',
  'LU': 'Luxembourg',
  'ES': 'Espagne',
  'IT': 'Italie',
  'DE': 'Allemagne',
  'NL': 'Pays-Bas',
  'PT': 'Portugal',
  'MT': 'Malte',
  'GR': 'Grèce',
  'CY': 'Chypre',
  'AT': 'Autriche',
  'IE': 'Irlande',
  'GB': 'Royaume-Uni',
  'PL': 'Pologne',
  'CZ': 'République tchèque',
  'HU': 'Hongrie',
  'RO': 'Roumanie',
  'BG': 'Bulgarie',
  'HR': 'Croatie',
  'SI': 'Slovénie',
  'SK': 'Slovaquie',
  'LT': 'Lituanie',
  'LV': 'Lettonie',
  'EE': 'Estonie',
  'SE': 'Suède',
  'DK': 'Danemark',
  'NO': 'Norvège',
  'FI': 'Finlande',
  'IS': 'Islande',
  'RS': 'Serbie',
  'BA': 'Bosnie-Herzégovine',
  'MK': 'Macédoine du Nord',
  'AL': 'Albanie',
  'ME': 'Monténégro',
  'UA': 'Ukraine',
  'MD': 'Moldavie',
  'BY': 'Biélorussie',
  'RU': 'Russie',
  // Amérique Latine
  'AR': 'Argentine',
  'BR': 'Brésil',
  'CL': 'Chili',
  'CO': 'Colombie',
  'PE': 'Pérou',
  'VE': 'Venezuela',
  'EC': 'Équateur',
  'MX': 'Mexique',
  'UY': 'Uruguay',
  'PY': 'Paraguay',
  'BO': 'Bolivie',
  'CR': 'Costa Rica',
  'CU': 'Cuba',
  'DO': 'République dominicaine',
  'PA': 'Panama',
  // Amérique du Nord
  'US': 'États-Unis',
  'CA': 'Canada',
  // Afrique du Nord
  'MA': 'Maroc',
  'DZ': 'Algérie',
  'TN': 'Tunisie',
  'EG': 'Égypte',
  'LY': 'Libye',
  // Afrique Subsaharienne
  'SN': 'Sénégal',
  'CI': 'Côte d\'Ivoire',
  'CM': 'Cameroun',
  'NG': 'Nigeria',
  'GH': 'Ghana',
  'KE': 'Kenya',
  'ZA': 'Afrique du Sud',
  'ET': 'Éthiopie',
  // Asie
  'CN': 'Chine',
  'JP': 'Japon',
  'KR': 'Corée du Sud',
  'TH': 'Thaïlande',
  'VN': 'Vietnam',
  'PH': 'Philippines',
  'IN': 'Inde',
  'ID': 'Indonésie',
  'MY': 'Malaisie',
  'SG': 'Singapour',
  'KH': 'Cambodge',
  'LA': 'Laos',
  // Moyen-Orient
  'TR': 'Turquie',
  'IL': 'Israël',
  'LB': 'Liban',
  'JO': 'Jordanie',
  'AE': 'Émirats arabes unis',
  'SA': 'Arabie saoudite',
  // Océanie
  'AU': 'Australie',
  'NZ': 'Nouvelle-Zélande',
}

// Helper pour obtenir le nom du pays
export function getCountryName(code: string | undefined): string {
  if (!code) return ''
  return COUNTRY_NAMES[code.toUpperCase()] || code
}

// Dictionnaires de traduction pour les anciennes valeurs en anglais
const HAIR_COLOR_TRANSLATIONS: Record<string, string> = {
  'blonde': 'Blond',
  'brown': 'Brun',
  'chestnut': 'Châtain',
  'red': 'Roux',
  'black': 'Noir',
  'gray': 'Gris',
  'grey': 'Gris',
  'white': 'Blanc',
  'colored': 'Coloré',
  'other': 'Autre',
}

const EYE_COLOR_TRANSLATIONS: Record<string, string> = {
  'brown': 'Marron',
  'blue': 'Bleu',
  'green': 'Vert',
  'hazel': 'Noisette',
  'gray': 'Gris',
  'grey': 'Gris',
  'black': 'Noir',
  'amber': 'Ambre',
  'other': 'Autre',
}

const ETHNICITY_TRANSLATIONS: Record<string, string> = {
  'caucasian': 'Caucasien',
  'african': 'Africain',
  'asian': 'Asiatique',
  'latino': 'Latina',
  'latin': 'Latina',
  'arab': 'Arabe',
  'mixed': 'Métis',
  'indian': 'Indien',
  'caribbean': 'Caribéen',
  'other': 'Autre',
}

const HAIR_REMOVAL_TRANSLATIONS: Record<string, string> = {
  'full': 'Intégrale',
  'fully': 'Intégrale',
  'partial': 'Partielle',
  'natural': 'Naturelle',
  'none': 'Naturelle',
}

const BREAST_TYPE_TRANSLATIONS: Record<string, string> = {
  'natural': 'Naturels',
  'silicone': 'Silicone',
  'enhanced': 'Augmentés',
  'augmented': 'Augmentés',
}

// Helpers pour traduire les valeurs
export function translateHairColor(value: string | undefined): string {
  if (!value) return ''
  const lower = value.toLowerCase()
  return HAIR_COLOR_TRANSLATIONS[lower] || value
}

export function translateEyeColor(value: string | undefined): string {
  if (!value) return ''
  const lower = value.toLowerCase()
  return EYE_COLOR_TRANSLATIONS[lower] || value
}

export function translateEthnicity(value: string | undefined): string {
  if (!value) return ''
  const lower = value.toLowerCase()
  return ETHNICITY_TRANSLATIONS[lower] || value
}

export function translateHairRemoval(value: string | undefined): string {
  if (!value) return ''
  const lower = value.toLowerCase()
  return HAIR_REMOVAL_TRANSLATIONS[lower] || value
}

export function translateBreastType(value: string | undefined): string {
  if (!value) return ''
  const lower = value.toLowerCase()
  return BREAST_TYPE_TRANSLATIONS[lower] || value
}
