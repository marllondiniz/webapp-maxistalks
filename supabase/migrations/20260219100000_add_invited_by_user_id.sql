-- Convide um amigo: rastrear quem indicou quem no cadastro
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS invited_by_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_invited_by ON profiles(invited_by_user_id) WHERE invited_by_user_id IS NOT NULL;

COMMENT ON COLUMN profiles.invited_by_user_id IS 'Usuário que convidou esta pessoa (link de indicação).';
