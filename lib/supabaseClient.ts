'use client'

import { createClient, SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (browserClient) {
    return browserClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  const storageKeyPrefix = process.env.NEXT_PUBLIC_STORAGE_KEY_PREFIX || 'maxistalks'
  const storageKey = `${storageKeyPrefix}-auth`

  // Usa placeholders durante o build (ex: Vercel) quando env vars ainda não estão configuradas.
  if (!url || !anonKey) {
    browserClient = createClient(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1wbGFjZWhvbGRlciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQxNzY5MjAwfQ.placeholder',
      {
        auth: {
          persistSession: true,
          storageKey,
        },
      }
    )
    return browserClient
  }

  browserClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      storageKey,
    },
  })

  return browserClient
}

