-- Adiciona campos de customização da landing page à tabela tenants
-- Cada tenant pode ter endereço, mapa, seção "Sobre" e footer personalizados.

ALTER TABLE tenants
  -- Local / Endereço
  ADD COLUMN IF NOT EXISTS address_line1       text,
  ADD COLUMN IF NOT EXISTS address_line2       text,
  ADD COLUMN IF NOT EXISTS address_cep         text,
  ADD COLUMN IF NOT EXISTS local_subheading    text,
  ADD COLUMN IF NOT EXISTS map_embed_url       text,
  ADD COLUMN IF NOT EXISTS map_link_url        text,
  -- Seção "Sobre"
  ADD COLUMN IF NOT EXISTS about_logo_url      text,
  ADD COLUMN IF NOT EXISTS about_short_text    text,
  ADD COLUMN IF NOT EXISTS about_long_text     text,
  ADD COLUMN IF NOT EXISTS about_button_label  text,
  ADD COLUMN IF NOT EXISTS about_button_url    text,
  -- Footer da landing
  ADD COLUMN IF NOT EXISTS footer_logo_url     text,
  ADD COLUMN IF NOT EXISTS instagram_url       text,
  ADD COLUMN IF NOT EXISTS youtube_url         text,
  ADD COLUMN IF NOT EXISTS footer_copyright_name text;

-- Backfill: preenche os valores atuais (hardcoded) para o tenant maxistalks.com
UPDATE tenants SET
  address_line1        = 'R. Ten. Mário Francisco Brito, 854–998',
  address_line2        = 'Enseada do Suá – Vitória/ES',
  address_cep          = 'CEP: 29055-100',
  local_subheading     = 'Venha nos visitar no coração de Vitória/ES',
  map_embed_url        = 'https://www.google.com/maps?q=R.+Ten.+M%C3%A1rio+Francisco+Brito,+854-998,+Enseada+do+Su%C3%A1,+Vit%C3%B3ria,+ES&output=embed',
  map_link_url         = 'https://www.google.com/maps/search/?api=1&query=R.+Ten.+M%C3%A1rio+Francisco+Brito,+854-998,+Enseada+do+Su%C3%A1,+Vit%C3%B3ria,+ES,+29055-100',
  about_logo_url       = '/logo-maxis.avif',
  about_short_text     = 'O MaxisTalks é um evento oficial da MaxisPlus, um hub estratégico para desenvolver negócios digitais escaláveis.',
  about_long_text      = 'Há mais de 20 anos estruturando startups, produtos e operações digitais em múltiplos mercados globais. Através do MaxisTalks, levamos conhecimento prático e networking de alto nível para empreendedores que querem escalar.',
  about_button_label   = 'Conhecer a Maxis',
  about_button_url     = 'https://maxis.plus/hub',
  footer_logo_url      = '/logo-maxis.avif',
  instagram_url        = 'https://www.instagram.com/maxisplus',
  youtube_url          = 'https://www.youtube.com/@maxisplus',
  footer_copyright_name = 'MaxisPlus'
WHERE domain = 'maxistalks.com';
