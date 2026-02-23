-- Plano de interesse escolhido no modal (starter, pro, enterprise, general)
ALTER TABLE plataforma_leads
  ADD COLUMN IF NOT EXISTS plano_interesse text;

COMMENT ON COLUMN plataforma_leads.plano_interesse IS 'Plano escolhido: starter, pro, enterprise ou general (só quero conhecer)';
