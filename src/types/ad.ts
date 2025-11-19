import { RankType } from './profile'

export interface PhysicalAttributes {
  height?: number // en cm
  weight?: number // en kg
  measurements?: string // ex: "95-65-95"
  cupSize?: string // ex: "D"
  breastType?: string // ex: "Naturels", "Silicone"
  hairColor?: string
  eyeColor?: string
  ethnicity?: string
  bodyType?: string
  tattoos?: boolean
  piercings?: boolean
  hairRemoval?: string // ex: "Intégrale", "Partielle", "Naturelle"
}

export interface Availability {
  available247?: boolean // Disponible 24h/24 7j/7
  days?: string[] // ['lundi', 'mardi', etc.]
  hours?: string // Ex: "9h-23h" ou texte libre
}

export interface ContactInfo {
  phone?: string
  acceptsCalls?: boolean
  acceptsSMS?: boolean
  whatsapp?: boolean
  telegram?: boolean
  email?: boolean
  availability?: Availability
}

export interface Ad {
  id: string
  userId: string
  username: string
  title: string
  description: string
  age: number
  gender?: 'female' | 'male' | 'couple' | 'transsexual'
  location: string
  arrondissement?: string // Arrondissement pour Paris (ex: "1er", "2ème", etc.)
  country: string // Code pays (ex: 'FR', 'BE', etc.)
  category: AdCategory
  photos: string[]
  video?: string // URL de la vidéo
  price?: number
  services: string[] // Services d'escorte proposés
  meetingPlaces?: string[] // Lieux de rencontre (Incall, Outcall, etc.)
  availability: string
  verified: boolean
  rank: RankType
  online: boolean
  views: number
  favorites: number
  createdAt: Date
  updatedAt: Date
  status?: string // 'approved', 'paused', 'pending', 'rejected'
  // Nouvelles propriétés
  physicalAttributes?: PhysicalAttributes
  contactInfo?: ContactInfo
  languages?: string[]
  acceptsCouples?: boolean
  outcall?: boolean // Déplacement
  incall?: boolean // Reçoit
  acceptsMessages?: boolean // Accepte les messages privés
  interestedIn?: {
    men?: boolean
    women?: boolean
    couples?: boolean
    transsexuals?: boolean
  }
}

export type AdCategory = 'escort' | 'massage' | 'video'

export interface CreateAdFormData {
  title: string
  description: string
  location: string
  categories: AdCategory[] // Choix multiple
  photos: File[]
  price?: number
  services: string[]
  availability: string
  meetingPlaces: string[] // Lieux de rencontre
}

export const AD_CATEGORIES = {
  escort: { label: 'Escort', icon: '💋' },
  massage: { label: 'Massage', icon: '💆' },
  video: { label: 'Vidéo', icon: '📹' },
} as const

export const COMMON_SERVICES = [
  // Services de base
  'Massage érotique',
  'Massage tantrique',
  'Massage body-body',
  'Massage prostatique',
  'Massage naturiste',
  'Massage relaxant',

  // Services girlfriend experience
  'GFE (Girlfriend Experience)',
  'PSE (Pornstar Experience)',
  'Soirée romantique',
  'Dîner aux chandelles',
  'Accompagnement',
  'Voyages',

  // Services intimes
  'Oral sans préservatif',
  'Oral avec préservatif',
  'Fellation nature',
  'Fellation profonde',
  'Cunnilingus',
  '69',
  'Embrasser avec la langue',
  'Embrasser sur la bouche',
  'Rapports protégés',
  'Rapports non protégés',
  'Plusieurs fois',
  'Ejaculation buccale',
  'Ejaculation faciale',
  'Ejaculation sur le corps',
  'Avaler',

  // Positions et pratiques
  'Toutes positions',
  'Levrette',
  'Amazone',
  'Missionnaire',
  'Andromaque',
  'Espagnole',
  'Branlette',
  'Doigtage',

  // Services anaux
  'Anulingus donné',
  'Anulingus reçu',
  'Sodomie',
  'Fist anal',

  // BDSM et domination
  'Domination soft',
  'Domination hard',
  'Soumission',
  'Bondage',
  'Discipline',
  'Fessée',
  'Fouet',
  'Cire chaude',
  'Humiliation',
  'Jeux de rôle',
  'Maîtresse',
  'Esclave',
  'Crachats',
  'Piétinement',

  // Fétichisme
  'Fétichisme des pieds',
  'Footjob',
  'Fétichisme du cuir',
  'Fétichisme du latex',
  'Fétichisme des bas',
  'Fétichisme des talons',
  'Adoration des pieds',
  'Adoration du corps',

  // Pratiques spéciales
  'Strap-on',
  'Gode-ceinture',
  'Sex toys',
  'Double pénétration',
  'Pénétration avec gode',
  'Gang bang',
  'Bukkake',
  'Golden shower donné',
  'Golden shower reçu',
  'Squirting',
  'Fisting vaginal',

  // Services pour couples
  'Couples (H+F)',
  'Trio (HHF)',
  'Trio (HFF)',
  'Échangisme',
  'Voyeurisme',
  'Exhibitionnisme',
  'Plan à plusieurs',

  // Shows et spectacles
  'Striptease',
  'Lap dance',
  'Show lesbien',
  'Show avec copine',
  'Masturbation',
  'Webcam',
  'Sexe au téléphone',
  'Contenu personnalisé',
  'Photos personnalisées',
  'Vidéos personnalisées',

  // Services de roleplay
  'Roleplay infirmière',
  'Roleplay secrétaire',
  'Roleplay étudiante',
  'Roleplay policière',
  'Roleplay professeur',
  'Roleplay hôtesse',
  'Scénarios sur mesure',

  // Services relaxation
  'Massage californien',
  'Massage suédois',
  'Jacuzzi/bain',
  'Sauna',

  // Services longue durée
  'Nuit complète',
  'Week-end',
  'Vacances',
  'Petit-déjeuner inclus',

  // Autres
  'Disabled friendly',
  'Virgin friendly',
  'Discrétion assurée',
]

export const MEETING_PLACES = [
  'Incall',
  'Hôtel',
  'Outcall',
  'Plan voiture',
]

// Liste complète des services d'escorte
export const ESCORT_SERVICES = [
  // Expériences
  'GFE (Girlfriend Experience)',
  'PSE (Pornstar Experience)',
  'French Kiss',
  'Embrasser avec la langue',
  'Accompagnement',
  'Soirée romantique',
  'Dîner',
  'Voyages',

  // Services oraux
  'Fellation nature',
  'Fellation avec préservatif',
  'Fellation profonde',
  'Cunnilingus',
  '69',
  'Avaler',
  'Ejaculation buccale',
  'Ejaculation faciale',
  'Ejaculation sur le corps',

  // Massages
  'Massage érotique',
  'Massage tantrique',
  'Massage body-body',
  'Massage prostatique',
  'Massage naturiste',
  'Massage relaxant',
  'Massage 4 mains',

  // Positions
  'Toutes positions',
  'Levrette',
  'Amazone',
  'Missionnaire',
  'Andromaque',

  // Pratiques spéciales
  'Anulingus donné',
  'Anulingus reçu',
  'Sodomie',
  'Pénétration anale',
  'Double pénétration',
  'Fisting vaginal',
  'Fist anal',
  'Squirting',
  'Éjaculations multiples',

  // BDSM et domination
  'Domination soft',
  'Domination hard',
  'Soumission',
  'Bondage',
  'Discipline',
  'Fessée',
  'Fouet',
  'Cire chaude',
  'Humiliation',
  'Jeux de rôle',
  'Maîtresse',
  'Esclave',
  'Strap-on',
  'Gode-ceinture',

  // Fétichisme
  'Fétichisme des pieds',
  'Footjob',
  'Adoration des pieds',
  'Fétichisme du cuir',
  'Fétichisme du latex',
  'Fétichisme des bas',
  'Fétichisme des talons',
  'Golden shower donné',
  'Golden shower reçu',

  // Sex toys
  'Sex toys',
  'Godes',
  'Vibromasseurs',
  'Plugs',

  // Pour couples
  'Couples (H+F)',
  'Trio (HHF)',
  'Trio (HFF)',
  'Échangisme',
  'Bisexuelle',
  'Gang bang',

  // Shows
  'Striptease',
  'Lap dance',
  'Show lesbien',
  'Show avec copine',
  'Masturbation devant vous',
  'Voyeurisme',
  'Exhibitionnisme',

  // Services à distance
  'Webcam',
  'Sexe au téléphone',
  'Sexting',
  'Photos personnalisées',
  'Vidéos personnalisées',
  'Contenu sur mesure',

  // Roleplay
  'Infirmière',
  'Secrétaire',
  'Étudiante',
  'Policière',
  'Professeur',
  'Hôtesse de l\'air',
  'Scénarios personnalisés',

  // Durée et extras
  'Nuit complète',
  'Week-end',
  'Vacances',
  'Petit-déjeuner',
  'Jacuzzi',
  'Sauna',
  'Bain partagé',

  // Spécialités
  'Débutants acceptés',
  'Virgin friendly',
  'Disabled friendly',
  'Seniors welcome',
  'Discrétion assurée',
  'Plusieurs fois',
]

export const DAYS_OF_WEEK = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
]

// Types pour les commentaires
export interface AdComment {
  id: string
  ad_id: string
  user_id: string
  parent_id: string | null
  content: string
  is_reported: boolean
  report_reason: string | null
  reported_by: string | null
  reported_at: string | null
  created_at: string
  updated_at: string
  // Données jointes
  username?: string
  user_verified?: boolean
  user_avatar?: string | null
  replies?: AdComment[]
}
