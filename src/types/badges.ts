// Système de badges basé sur l'XP des votes

export interface Badge {
  id: string
  name: string
  nameFr: string
  description: string
  descriptionFr: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
  glowColor: string
  minXP: number
}

// Paliers d'XP pour les badges
// XP = Points de vote reçus (top1=50, top5=20, top10=10, top50=5)
export const BADGES: Badge[] = [
  {
    id: 'newcomer',
    name: 'Newcomer',
    nameFr: 'Débutant',
    description: 'Received your first votes',
    descriptionFr: 'A reçu ses premiers votes',
    icon: '🌱',
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    glowColor: 'shadow-green-500/30',
    minXP: 10,
  },
  {
    id: 'rising_star',
    name: 'Rising Star',
    nameFr: 'Étoile Montante',
    description: 'Gaining popularity',
    descriptionFr: 'Gagne en popularité',
    icon: '⭐',
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
    glowColor: 'shadow-blue-500/30',
    minXP: 50,
  },
  {
    id: 'popular',
    name: 'Popular',
    nameFr: 'Populaire',
    description: 'Well-known in the community',
    descriptionFr: 'Reconnu dans la communauté',
    icon: '🔥',
    color: 'from-orange-400 to-red-500',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/50',
    glowColor: 'shadow-orange-500/30',
    minXP: 150,
  },
  {
    id: 'trending',
    name: 'Trending',
    nameFr: 'Tendance',
    description: 'Currently trending',
    descriptionFr: 'Actuellement en vogue',
    icon: '📈',
    color: 'from-pink-400 to-purple-500',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/50',
    glowColor: 'shadow-pink-500/30',
    minXP: 300,
  },
  {
    id: 'star',
    name: 'Star',
    nameFr: 'Star',
    description: 'A true star of the platform',
    descriptionFr: 'Une vraie star de la plateforme',
    icon: '🌟',
    color: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    glowColor: 'shadow-yellow-500/30',
    minXP: 500,
  },
  {
    id: 'superstar',
    name: 'Superstar',
    nameFr: 'Superstar',
    description: 'Among the most popular',
    descriptionFr: 'Parmi les plus populaires',
    icon: '💫',
    color: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    glowColor: 'shadow-purple-500/30',
    minXP: 1000,
  },
  {
    id: 'legend',
    name: 'Legend',
    nameFr: 'Légende',
    description: 'A true legend',
    descriptionFr: 'Une vraie légende',
    icon: '👑',
    color: 'from-amber-400 to-yellow-500',
    bgColor: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
    borderColor: 'border-amber-400',
    glowColor: 'shadow-amber-500/50',
    minXP: 2500,
  },
  {
    id: 'icon',
    name: 'Icon',
    nameFr: 'Icône',
    description: 'An absolute icon',
    descriptionFr: 'Une icône absolue',
    icon: '💎',
    color: 'from-cyan-400 to-blue-500',
    bgColor: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-400',
    glowColor: 'shadow-cyan-500/50',
    minXP: 5000,
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
