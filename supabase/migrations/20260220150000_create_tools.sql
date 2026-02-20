-- Tabela de ferramentas disponibilizadas pelo admin
CREATE TABLE IF NOT EXISTS tools (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES tenants(id),
  titulo text NOT NULL,
  descricao text,
  youtube_url text,
  pdf_url text,
  pdf_nome text,
  ordem int DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- Leitura pública para usuários autenticados
CREATE POLICY "tools_select_authenticated"
  ON tools FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins podem inserir/editar/deletar
CREATE POLICY "tools_write_admin"
  ON tools FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );
