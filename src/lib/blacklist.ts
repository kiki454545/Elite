import { RankType } from '@/types/profile'

/**
 * Vérifie si un utilisateur a accès à la liste noire
 * Seuls les utilisateurs avec rank Plus, VIP ou Elite peuvent utiliser la liste noire
 */
export function hasBlacklistAccess(rank: RankType): boolean {
  return rank === 'plus' || rank === 'vip' || rank === 'elite'
}

/**
 * Message d'erreur à afficher quand l'utilisateur n'a pas accès à la liste noire
 */
export const BLACKLIST_RESTRICTED_MESSAGE =
  "L'accès à la liste noire est réservé aux membres Premium (Plus, VIP, Elite). Visitez la boutique pour upgrader votre compte."

/**
 * Titre du message d'erreur
 */
export const BLACKLIST_RESTRICTED_TITLE = "Fonctionnalité Premium"
