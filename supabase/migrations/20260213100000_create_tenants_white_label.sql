-- White label: tabela de tenants (marcas) para multi-tenant
-- Cada tenant pode ter seu próprio nome, logo, cores, domínio, etc.

CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Domínio principal para resolver o tenant (ex: maxistalks.com, cliente.com)
  domain text UNIQUE NOT NULL,
  -- Nome da marca exibido no site
  name text NOT NULL,
  -- Tagline (ex: "Palco para quem gera valor")
  tagline text,
  -- Logo: URL pública ou path no app (ex: /logo.png)
  logo_url text NOT NULL DEFAULT '/logo.png',
  -- Favicon (opcional)
  favicon_url text,
  -- Imagem para Open Graph / redes sociais (opcional; fallback: logo_url)
  og_image_url text,
  -- Cores primárias (hex sem #)
  primary_color text NOT NULL DEFAULT '3b82f6',
  primary_color_hover text NOT NULL DEFAULT '2563eb',
  -- Contato e URLs
  support_email text,
  base_url text NOT NULL,
  -- Prefixo para chaves no localStorage (ex: maxistalks -> maxistalks-auth, maxistalks-cookie-consent)
  storage_key_prefix text NOT NULL DEFAULT 'app',
  -- Metadados
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índice para lookup por domínio (usado em getTenantByDomain)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_domain ON tenants (lower(trim(domain)));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION set_tenants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tenants_updated_at ON tenants;
CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION set_tenants_updated_at();

-- Inserir tenant padrão MaxisTalks (pode ser usado quando não houver multi-tenant por domínio)
-- Só insere se não existir nenhum tenant ainda
INSERT INTO tenants (
  domain,
  name,
  tagline,
  logo_url,
  primary_color,
  primary_color_hover,
  support_email,
  base_url,
  storage_key_prefix
) VALUES (
  'maxistalks.com',
  'MaxisTalks',
  'Palco para quem gera valor',
  '/maxistalks-logo.png',
  '3b82f6',
  '2563eb',
  'contato@maxistalks.com',
  'https://maxistalks.com',
  'maxistalks'
) ON CONFLICT (domain) DO NOTHING;

COMMENT ON TABLE tenants IS 'White label: configuração de marca por tenant (resolução por domínio).';
