-- Tabela de dores/desafios registradas pelos usuários
CREATE TABLE IF NOT EXISTS user_pains (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants(id),
  dor text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_pains ENABLE ROW LEVEL SECURITY;

-- Usuário só vê suas próprias dores
CREATE POLICY "user_pains_select_own"
  ON user_pains FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Usuário pode inserir suas próprias dores
CREATE POLICY "user_pains_insert_own"
  ON user_pains FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin pode ver todas as dores
CREATE POLICY "user_pains_select_admin"
  ON user_pains FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );
