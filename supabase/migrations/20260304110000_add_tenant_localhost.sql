-- Tenant para desenvolvimento local: evita "Tenant não encontrado" ao acessar
-- http://localhost:3000 e permite usar o painel de customização em dev.
INSERT INTO tenants (
  domain,
  name,
  tagline,
  logo_url,
  favicon_url,
  primary_color,
  primary_color_hover,
  support_email,
  base_url,
  storage_key_prefix,
  background_color,
  surface_color,
  surface_alt_color,
  text_muted_color
) VALUES (
  'localhost',
  'MaxisTalks (dev)',
  'Palco para quem gera valor',
  '/maxistalks-logo.png',
  NULL,
  '3b82f6',
  '2563eb',
  'contato@maxistalks.com',
  'http://localhost:3000',
  'app',
  '060c1f',
  '1e293b',
  '0f172a',
  '94a3b8'
) ON CONFLICT (domain) DO NOTHING;
