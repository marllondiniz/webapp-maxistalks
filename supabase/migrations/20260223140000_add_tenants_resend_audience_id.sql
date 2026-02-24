-- Newsletter multi-tenant: cada tenant tem sua própria Audience no Resend.
-- Inscrição e broadcast usam resend_audience_id para isolar listas por cliente.

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS resend_audience_id text;

COMMENT ON COLUMN tenants.resend_audience_id IS 'ID da Audience no Resend para este tenant (newsletter e broadcast por cliente).';

-- Audience "Newsletter" do Resend para o tenant MaxisTalks
UPDATE tenants
  SET resend_audience_id = '47d44460-e455-4466-aff3-803c4e6e93e1'
  WHERE domain = 'maxistalks.com';
