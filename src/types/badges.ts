// Système de badges basé sur l'XP des votes

export interface Badge {
  id: string
  name: string
  nameFr: string
  description: string
  descriptionFr: string
  icon: string
  image: string // Chemin vers l'image du badge
  color: string
  bgColor: string
  borderColor: string
  glowColor: string
  minXP: number
  level: number // Niveau du badge (1-9)
}

// Paliers d'XP pour les badges
// XP = Points de vote reçus (Top 1=50, Top 2=20, Top 3=10, Top 50=5)
export const BADGES: Badge[] = [
  {
    id: 'level1',
    name: 'Level 1',
    nameFr: 'Niveau 1',
    description: 'Received your first votes',
    descriptionFr: 'A reçu ses premiers votes',
    icon: '🌱',
    image: '/badges/1.png',
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    glowColor: 'shadow-green-500/30',
    minXP: 500,
    level: 1,
  },
  {
    id: 'level2',
    name: 'Level 2',
    nameFr: 'Niveau 2',
    description: 'Gaining popularity',
    descriptionFr: 'Gagne en popularité',
    icon: '⭐',
    image: '/badges/2.png',
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
    glowColor: 'shadow-blue-500/30',
    minXP: 3000,
    level: 2,
  },
  {
    id: 'level3',
    name: 'Level 3',
    nameFr: 'Niveau 3',
    description: 'Well-known in the community',
    descriptionFr: 'Reconnu dans la communauté',
    icon: '🔥',
    image: '/badges/3.png',
    color: 'from-orange-400 to-red-500',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/50',
    glowColor: 'shadow-orange-500/30',
    minXP: 6000,
    level: 3,
  },
  {
    id: 'level4',
    name: 'Level 4',
    nameFr: 'Niveau 4',
    description: 'Currently trending',
    descriptionFr: 'Actuellement en vogue',
    icon: '📈',
    image: '/badges/4.png',
    color: 'from-pink-400 to-purple-500',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/50',
    glowColor: 'shadow-pink-500/30',
    minXP: 10000,
    level: 4,
  },
  {
    id: 'level5',
    name: 'Level 5',
    nameFr: 'Niveau 5',
    description: 'A true star of the platform',
    descriptionFr: 'Une vraie star de la plateforme',
    icon: '🌟',
    image: '/badges/5.png',
    color: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    glowColor: 'shadow-yellow-500/30',
    minXP: 20000,
    level: 5,
  },
  {
    id: 'level6',
    name: 'Level 6',
    nameFr: 'Niveau 6',
    description: 'Among the most popular',
    descriptionFr: 'Parmi les plus populaires',
    icon: '💫',
    image: '/badges/6.png',
    color: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    glowColor: 'shadow-purple-500/30',
    minXP: 35000,
    level: 6,
  },
  {
    id: 'level7',
    name: 'Level 7',
    nameFr: 'Niveau 7',
    description: 'A true legend',
    descriptionFr: 'Une vraie légende',
    icon: '👑',
    image: '/badges/7.png',
    color: 'from-amber-400 to-yellow-500',
    bgColor: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
    borderColor: 'border-amber-400',
    glowColor: 'shadow-amber-500/50',
    minXP: 50000,
    level: 7,
  },
  {
    id: 'level8',
    name: 'Level 8',
    nameFr: 'Niveau 8',
    description: 'An absolute icon',
    descriptionFr: 'Une icône absolue',
    icon: '💎',
    image: '/badges/8.png',
    color: 'from-cyan-400 to-blue-500',
    bgColor: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-400',
    glowColor: 'shadow-cyan-500/50',
    minXP: 75000,
    level: 8,
  },
  {
    id: 'level9',
    name: 'Level 9',
    nameFr: 'Niveau 9',
    description: 'A mythical presence',
    descriptionFr: 'Une présence mythique',
    icon: '🏆',
    image: '/badges/9.png',
    color: 'from-amber-300 to-orange-500',
    bgColor: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-300',
    glowColor: 'shadow-amber-400/50',
    minXP: 150000,
    level: 9,
  },
]

// Fonction pour obtenir le badge actuel basé sur l'XP
export function getCurrentBadge(xp: number): Badge | null {
  // Trier par minXP décroissant pour trouver le badge le plus élevé
  const sortedBadges = [...BADGES].sort((a, b) => b.minXP - a.minXP)
  return sortedBadges.find((badge) => xp >= badge.minXP) || null
}

// Fonction pour obtenir tous les badges débloqués
export function getUnlockedBadges(xp: number): Badge[] {
  return BADGES.filter((badge) => xp >= badge.minXP)
}

// Fonction pour obtenir le prochain badge à débloquer
export function getNextBadge(xp: number): Badge | null {
  const sortedBadges = [...BADGES].sort((a, b) => a.minXP - b.minXP)
  return sortedBadges.find((badge) => xp < badge.minXP) || null
}

// Fonction pour calculer la progression vers le prochain badge
export function getBadgeProgress(xp: number): { current: Badge | null; next: Badge | null; progress: number } {
  const current = getCurrentBadge(xp)
  const next = getNextBadge(xp)

  if (!next) {
    // Tous les badges débloqués
    return { current, next: null, progress: 100 }
  }

  const currentMinXP = current?.minXP || 0
  const progress = ((xp - currentMinXP) / (next.minXP - currentMinXP)) * 100

  return { current, next, progress: Math.min(progress, 100) }
}
