-- Cria a tabela event_registrations se não existir
-- Execute no SQL Editor do Supabase Dashboard: https://supabase.com/dashboard/project/_/sql

-- Tabela para registrar interesses em eventos (fluxo por convite)
CREATE TABLE IF NOT EXISTS event_registrations (
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_url text,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

-- Adiciona created_at se a tabela já existia sem essa coluna
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'event_registrations' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Permite service role e usuários autenticados
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own registration" ON event_registrations;
CREATE POLICY "Users can insert own registration"
  ON event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own registrations" ON event_registrations;
CREATE POLICY "Users can view own registrations"
  ON event_registrations FOR SELECT
  USING (auth.uid() = user_id);

-- Service role bypassa RLS por padrão - não precisa de policy
