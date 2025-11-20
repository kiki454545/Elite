export type RankType = 'standard' | 'plus' | 'vip' | 'elite'
export type AdCategory = 'escort' | 'massage' | 'vip' | 'trans' | 'couple' | 'domination'

export interface ContactInfo {
  phone?: string
  whatsapp?: boolean
  telegram?: boolean
  email?: boolean
  acceptsSMS?: boolean
}

export interface PhysicalAttributes {
  height?: number // en cm
  weight?: number // en kg
  measurements?: string // ex: "95-65-95"
  cupSize?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J'
  hairColor?: 'blonde' | 'brune' | 'rousse' | 'chatain' | 'noire' | 'grise' | 'blanche' | 'coloree' | 'autre'
  eyeColor?: 'bleus' | 'verts' | 'marrons' | 'noirs' | 'gris' | 'noisette' | 'autre'
  ethnicity?: 'caucasienne' | 'africaine' | 'asiatique' | 'latine' | 'arabe' | 'metisse' | 'autre'
  bodyType?: 'mince' | 'athletique' | 'moyenne' | 'ronde' | 'pulpeuse' | 'musclee'
  tattoos?: boolean
  piercings?: boolean
  pubicHair?: 'rasee' | 'taillee' | 'naturelle' | 'epilee'
}

export interface AvailabilityInfo {
  schedule?: string // Horaires détaillés
  availability?: string // Disponibilité générale
  available24_7?: boolean
  outcall?: boolean // Déplacement
  incall?: boolean // Reçoit
}

export interface Profile {
  id: string
  username: string
  email: string
  age?: number
  location?: string
  country?: string // Code pays (FR, BE, CH, etc.)
  avatar_url?: string
  online: boolean
  verified: boolean
  rank: RankType
  elite_coins: number // Solde de monnaie virtuelle EliteCoin

  // Informations personnelles
  gender?: 'femme' | 'homme' | 'trans' | 'couple' | 'non-binaire'
  nationality?: string

  // Description
  description?: string

  // Catégorie et services
  category?: AdCategory
  services?: string[]

  // Coordonnées
  contactInfo?: ContactInfo
  phone?: string
  whatsapp?: boolean
  telegram?: boolean
  email_contact?: boolean
  accepts_sms?: boolean

  // Disponibilités
  availabilityInfo?: AvailabilityInfo
  schedule?: string
  availability?: string
  available_24_7?: boolean
  outcall?: boolean
  incall?: boolean

  // Langues parlées (codes ISO 639-1: fr, en, es, de, it, etc.)
  languages?: string[]

  // Attributs physiques
  physicalAttributes?: PhysicalAttributes
  height?: number
  weight?: number
  measurements?: string
  cup_size?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J'
  hair_color?: 'blonde' | 'brune' | 'rousse' | 'chatain' | 'noire' | 'grise' | 'blanche' | 'coloree' | 'autre'
  eye_color?: 'bleus' | 'verts' | 'marrons' | 'noirs' | 'gris' | 'noisette' | 'autre'
  ethnicity?: 'caucasienne' | 'africaine' | 'asiatique' | 'latine' | 'arabe' | 'metisse' | 'autre'
  body_type?: 'mince' | 'athletique' | 'moyenne' | 'ronde' | 'pulpeuse' | 'musclee'
  tattoos?: boolean
  piercings?: boolean
  pubic_hair?: 'rasee' | 'taillee' | 'naturelle' | 'epilee'

  // Lieux de rendez-vous
  meeting_at_home?: boolean // Outcall
  meeting_at_hotel?: boolean // Hôtel
  meeting_in_car?: boolean // Plan voiture
  meeting_at_escort?: boolean // Incall

  // Autres
  accepts_couples?: boolean

  // Méta-données pour la recherche
  has_comments?: boolean
  comment_count?: number

  // Métadonnées
  created_at?: Date
  updated_at?: Date
}

export const RANK_CONFIG = {
  elite: {
    label: 'ELITE',
    color: 'from-amber-400 to-yellow-500',
    bgColor: 'bg-gray-900',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-400',
    glowColor: 'shadow-lg shadow-amber-500/40',
    priority: 4,
    icon: '👑',
    maxPhotos: 100,
  },
  vip: {
    label: 'VIP',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-gradient-to-r from-purple-500 to-pink-600',
    borderColor: 'border-transparent',
    textColor: 'text-white',
    glowColor: 'shadow-lg shadow-purple-500/40',
    priority: 3,
    icon: '💎',
    maxPhotos: 40,
  },
  plus: {
    label: 'PLUS',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    borderColor: 'border-transparent',
    textColor: 'text-white',
    glowColor: 'shadow-lg shadow-blue-500/40',
    priority: 2,
    icon: '✨',
    maxPhotos: 20,
  },
  standard: {
    label: '',
    color: '',
    bgColor: '',
    borderColor: '',
    textColor: '',
    glowColor: '',
    priority: 1,
    icon: '',
    maxPhotos: 10,
  },
} as const
