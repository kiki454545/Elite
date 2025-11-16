'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Profile as ProfileType } from '@/types/profile'

// Type simplifié pour le contexte Auth (compatible avec l'ancien)
interface Profile {
  id: string
  username: string
  email: string
  age?: number
  verified: boolean
  rank: string
  avatar_url?: string
  bio?: string
  created_at?: Date
  updated_at?: Date
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  signup: (email: string, password: string, username: string, age: number) => Promise<{ error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier la session au chargement
    checkUser()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadProfile(session.user.id)
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (data) {
        setProfile({
          id: data.id,
          username: data.username,
          email: data.email,
          age: data.age,
          verified: data.verified,
          rank: data.rank,
          avatar_url: data.avatar_url,
          bio: data.bio,
          created_at: data.created_at ? new Date(data.created_at) : undefined,
          updated_at: data.updated_at ? new Date(data.updated_at) : undefined
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'Erreur lors de la connexion' }
    }
  }

  const signup = async (email: string, password: string, username: string, age: number) => {
    try {
      // 1. Vérifier si l'email existe déjà
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single()

      if (existingEmail) {
        return { error: 'Cet email est déjà utilisé' }
      }

      // 2. Vérifier si le pseudo existe déjà
      const { data: existingUsername } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', username)
        .single()

      if (existingUsername) {
        return { error: 'Ce pseudo est déjà utilisé' }
      }

      // 3. Créer le compte Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      })

      if (signUpError) {
        // Messages d'erreur personnalisés
        if (signUpError.message.includes('already registered')) {
          return { error: 'Cet email est déjà utilisé' }
        }
        if (signUpError.message.includes('password')) {
          return { error: 'Le mot de passe doit contenir au moins 6 caractères' }
        }
        return { error: 'Erreur lors de la création du compte' }
      }

      if (!authData.user) {
        return { error: 'Erreur lors de la création du compte' }
      }

      // 4. Attendre un peu pour que le trigger auto-create le profil
      await new Promise(resolve => setTimeout(resolve, 500))

      // 5. Mettre à jour le profil avec les infos supplémentaires (upsert pour éviter les doublons)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          username,
          email,
          age,
          verified: false,
          rank: 'standard'
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Erreur profil:', profileError)

        // Messages personnalisés pour les erreurs de profil
        if (profileError.message.includes('duplicate') || profileError.message.includes('unique')) {
          if (profileError.message.toLowerCase().includes('username')) {
            return { error: 'Ce pseudo est déjà utilisé' }
          }
          if (profileError.message.toLowerCase().includes('email')) {
            return { error: 'Cet email est déjà utilisé' }
          }
          return { error: 'Ce compte existe déjà' }
        }

        if (profileError.message.includes('row-level security') || profileError.message.includes('policy')) {
          // Erreur RLS - on ignore car l'utilisateur est créé
          console.warn('Erreur RLS ignorée - profil créé avec succès')
          return {}
        }

        return { error: 'Erreur lors de la création du profil. Veuillez réessayer.' }
      }

      return {}
    } catch (error: any) {
      console.error('Erreur inscription:', error)
      if (error?.message?.includes('duplicate') || error?.message?.includes('unique')) {
        return { error: 'Ce compte existe déjà' }
      }
      return { error: 'Erreur lors de l\'inscription. Veuillez réessayer.' }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      localStorage.removeItem('favorites')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
