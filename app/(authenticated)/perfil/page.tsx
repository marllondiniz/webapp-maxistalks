'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProfileRecord } from '@/lib/profile'
import { getSupabaseClient } from '@/lib/supabaseClient'
import { ProfileForm } from './ProfileForm'
import { ConvidarAmigo } from './ConvidarAmigo'
import { MinhasInscricoes } from './MinhasInscricoes'
import { MinhasIndicacoes } from './MinhasIndicacoes'

export default function PerfilPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [profile, setProfile] = useState<ProfileRecord | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      setEmail(user.email ?? null)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Erro ao carregar perfil:', error)
      }

      setProfile(data ?? null)
      setLoading(false)
    }

    fetchProfile()
  }, [router, supabase])

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-4 rounded-lg border border-slate-600/30 bg-slate-800/80 p-6 text-center text-[#c9c9d2]">
          Carregando informações do perfil...
        </div>
      </section>
    )
  }

  const isIncomplete = profile?.is_complete === false

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-4 text-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-[#f5f5f5]">
          Meu perfil
        </h2>
        <p className="text-sm text-[#c9c9d2]">
          Preencha seus dados para conectar com a comunidade e participar dos eventos.
        </p>
        {isIncomplete && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Complete todos os campos obrigatórios para acessar as outras áreas do app.
          </div>
        )}
      </header>

      <ProfileForm
        profile={profile}
        email={email}
        onProfileUpdated={(updatedProfile) => setProfile(updatedProfile)}
      />

      {profile?.id && (
        <>
          <MinhasInscricoes userId={profile.id} />

          <div className="space-y-4">
            <MinhasIndicacoes userId={profile.id} />
            <ConvidarAmigo userId={profile.id} />
          </div>
        </>
      )}
    </section>
  )
}