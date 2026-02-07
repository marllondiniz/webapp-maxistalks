-- Adiciona created_at em events para ordenação por data de criação
-- O evento criado primeiro será sempre Ed. 01, o segundo Ed. 02, etc.
-- Execute no SQL Editor do Supabase: https://supabase.com/dashboard/project/_/sql

ALTER TABLE events
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Atualiza registros existentes sem created_at
UPDATE events
SET created_at = now()
WHERE created_at IS NULL;
