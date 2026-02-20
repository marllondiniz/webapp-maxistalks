-- Sessões ao vivo (YouTube live) gerenciadas pelo admin
CREATE TABLE IF NOT EXISTS live_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES tenants(id),
  titulo text,
  youtube_url text NOT NULL,
  ativo boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;

-- Leitura pública para usuários autenticados
CREATE POLICY "live_sessions_select_authenticated"
  ON live_sessions FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins podem inserir/editar/deletar
CREATE POLICY "live_sessions_write_admin"
  ON live_sessions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );
