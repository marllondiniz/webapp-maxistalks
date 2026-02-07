-- Adiciona created_at em event_registrations para o dashboard admin
-- Execute no SQL Editor do Supabase Dashboard se a migration não rodar automaticamente

ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Atualiza registros existentes sem created_at
UPDATE event_registrations
SET created_at = now()
WHERE created_at IS NULL;
