-- Marcar lead como atendido (cliente foi contactado)
ALTER TABLE plataforma_leads
  ADD COLUMN IF NOT EXISTS atendido boolean DEFAULT false;

COMMENT ON COLUMN plataforma_leads.atendido IS 'Se true, o lead já foi atendido/contactado pela equipe';

-- Apenas admins podem atualizar (ex.: marcar como atendido)
CREATE POLICY "plataforma_leads_update_admin"
  ON plataforma_leads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );
