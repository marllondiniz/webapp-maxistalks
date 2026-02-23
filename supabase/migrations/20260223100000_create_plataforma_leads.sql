-- Leads de interesse na página /plataforma (venda white-label)
CREATE TABLE IF NOT EXISTS plataforma_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES tenants(id),
  nome text NOT NULL,
  email text NOT NULL,
  telefone text,
  empresa text,
  mensagem text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_plataforma_leads_tenant_created ON plataforma_leads(tenant_id, created_at DESC);

ALTER TABLE plataforma_leads ENABLE ROW LEVEL SECURITY;

-- Inserção pública (formulário da página /plataforma)
CREATE POLICY "plataforma_leads_insert_public"
  ON plataforma_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Apenas admins podem ler
CREATE POLICY "plataforma_leads_select_admin"
  ON plataforma_leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );
