import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Profile {
  id: string
  username: string
  email: string
  age: number
  verified: boolean
  rank: string
  avatar_url?: string
  bio?: string
  created_at?: Date
  updated_at?: Date
}

export function useProfile(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchProfile()
    }
  }, [userId])

  async function fetchProfile() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError) {
        throw fetchError
      }

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
    } catch (err) {
      console.error('Erreur lors de la récupération du profil:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return { profile, loading, error, refetch: fetchProfile }
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function updateProfile(userId: string, updates: Partial<Profile>) {
    try {
      setLoading(true)
      setError(null)

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          username: updates.username,
          email: updates.email,
          age: updates.age,
          avatar_url: updates.avatar_url,
          bio: updates.bio
        })
        .eq('id', userId)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      return data
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { updateProfile, loading, error }
}

export function useCreateProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createProfile(profileData: Omit<Profile, 'created_at' | 'updated_at'>) {
    try {
      setLoading(true)
      setError(null)

      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: profileData.id,
          username: profileData.username,
          email: profileData.email,
          age: profileData.age,
          verified: profileData.verified,
          rank: profileData.rank,
          avatar_url: profileData.avatar_url,
          bio: profileData.bio
        }])
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      return data
    } catch (err) {
      console.error('Erreur lors de la création du profil:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createProfile, loading, error }
}
