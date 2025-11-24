// Configuration des cadeaux virtuels (style TikTok)
export interface Gift {
  id: string
  name: string
  emoji: string
  coins: number
  animation?: string // Animation CSS optionnelle
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export const GIFTS: Gift[] = [
  // Common (1-50 coins)
  {
    id: 'rose',
    name: 'Rose',
    emoji: '🌹',
    coins: 1,
    rarity: 'common'
  },
  {
    id: 'heart',
    name: 'Cœur',
    emoji: '❤️',
    coins: 5,
    rarity: 'common'
  },
  {
    id: 'kiss',
    name: 'Bisou',
    emoji: '💋',
    coins: 10,
    rarity: 'common'
  },
  {
    id: 'fire',
    name: 'Feu',
    emoji: '🔥',
    coins: 20,
    rarity: 'common'
  },
  {
    id: 'sparkles',
    name: 'Étoiles',
    emoji: '✨',
    coins: 30,
    rarity: 'common'
  },
  {
    id: 'champagne',
    name: 'Champagne',
    emoji: '🍾',
    coins: 50,
    rarity: 'common'
  },

  // Rare (51-200 coins)
  {
    id: 'diamond',
    name: 'Diamant',
    emoji: '💎',
    coins: 75,
    rarity: 'rare'
  },
  {
    id: 'crown',
    name: 'Couronne',
    emoji: '👑',
    coins: 100,
    rarity: 'rare'
  },
  {
    id: 'trophy',
    name: 'Trophée',
    emoji: '🏆',
    coins: 150,
    rarity: 'rare'
  },
  {
    id: 'bouquet',
    name: 'Bouquet',
    emoji: '💐',
    coins: 200,
    rarity: 'rare'
  },

  // Epic (201-500 coins)
  {
    id: 'ring',
    name: 'Bague',
    emoji: '💍',
    coins: 250,
    rarity: 'epic'
  },
  {
    id: 'gift_box',
    name: 'Cadeau',
    emoji: '🎁',
    coins: 300,
    rarity: 'epic'
  },
  {
    id: 'fireworks',
    name: 'Feux d\'artifice',
    emoji: '🎆',
    coins: 400,
    rarity: 'epic'
  },
  {
    id: 'star',
    name: 'Étoile',
    emoji: '⭐',
    coins: 500,
    rarity: 'epic'
  },

  // Legendary (501-2000 coins)
  {
    id: 'rocket',
    name: 'Fusée',
    emoji: '🚀',
    coins: 600,
    rarity: 'legendary'
  },
  {
    id: 'rainbow',
    name: 'Arc-en-ciel',
    emoji: '🌈',
    coins: 800,
    rarity: 'legendary'
  },
  {
    id: 'unicorn',
    name: 'Licorne',
    emoji: '🦄',
    coins: 1000,
    rarity: 'legendary'
  },
  {
    id: 'castle',
    name: 'Château',
    emoji: '🏰',
    coins: 1500,
    rarity: 'legendary'
  },
  {
    id: 'sports_car',
    name: 'Voiture de sport',
    emoji: '🏎️',
    coins: 1800,
    rarity: 'legendary'
  },
  {
    id: 'yacht',
    name: 'Yacht',
    emoji: '🛥️',
    coins: 2000,
    rarity: 'legendary'
  },
]

// Couleurs par rareté
export const RARITY_COLORS = {
  common: {
    bg: 'from-gray-500 to-gray-600',
    border: 'border-gray-400',
    glow: 'shadow-gray-500/50',
    text: 'text-gray-300'
  },
  rare: {
    bg: 'from-blue-500 to-cyan-500',
    border: 'border-blue-400',
    glow: 'shadow-blue-500/50',
    text: 'text-blue-300'
  },
  epic: {
    bg: 'from-purple-500 to-pink-600',
    border: 'border-purple-400',
    glow: 'shadow-purple-500/50',
    text: 'text-purple-300'
  },
  legendary: {
    bg: 'from-amber-400 to-yellow-500',
    border: 'border-amber-400',
    glow: 'shadow-amber-500/50',
    text: 'text-amber-300'
  }
}
