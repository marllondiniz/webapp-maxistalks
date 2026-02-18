-- Multi-tenant: adiciona coluna tenant_id nas tabelas principais
-- e faz backfill para o tenant padrão (maxistalks.com), se existir.

-- Perfis de usuário
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id);

-- Eventos
ALTER TABLE IF EXISTS events
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id);

-- Conteúdos (artigos)
ALTER TABLE IF EXISTS articles
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id);

-- Banners de eventos
ALTER TABLE IF EXISTS event_banners
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES tenants(id);

-- Backfill: associa registros existentes ao tenant padrão (maxistalks.com), se houver.
DO $$
DECLARE
  v_default_tenant uuid;
BEGIN
  SELECT id
    INTO v_default_tenant
  FROM tenants
  WHERE domain = 'maxistalks.com'
  LIMIT 1;

  IF v_default_tenant IS NOT NULL THEN
    UPDATE profiles SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
    UPDATE events SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
    UPDATE articles SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
    UPDATE event_banners SET tenant_id = v_default_tenant WHERE tenant_id IS NULL;
  END IF;
END;
$$;

