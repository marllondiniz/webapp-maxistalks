-- Garante que recebe_beneficios existe (usado no formulário de perfil)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recebe_beneficios boolean DEFAULT true;
