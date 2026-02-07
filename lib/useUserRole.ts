'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from './supabaseClient'
import { getUserRole, type ProfileRecord, type UserRole } from './profile'

export function useUserRole() {
  const [role, setRole] = useState<UserRole>('FREE')
  const [profile, setProfile] = useState<ProfileRecord | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    let isMounted = true

    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!isMounted) return

      if (!user) {
        setRole('FREE')
        setProfile(null)
        setUserId(null)
        setLoading(false)
        return
      }

      setUserId(user.id)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (!isMounted) return

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        setRole('FREE')
        setProfile(null)
        setLoading(false)
        return
      }

      const rawProfile = (data ?? null) as ProfileRecord | null
      const normalizedProfile = rawProfile
        ? {
            ...rawProfile,
            hasActiveSubscription:
              rawProfile.hasActiveSubscription ?? rawProfile.hasactivesubscription ?? false,
          }
        : null

      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('Perfil carregado (useUserRole)', normalizedProfile)
      }

      setProfile(normalizedProfile)
      setRole(getUserRole(normalizedProfile))
      setLoading(false)
    }

    fetchProfile()

    return () => {
      isMounted = false
    }
  }, [supabase])

  return {
    role,
    profile,
    loading,
    hasActiveSubscription: profile?.hasActiveSubscription ?? false,
    userId,
  }
}

