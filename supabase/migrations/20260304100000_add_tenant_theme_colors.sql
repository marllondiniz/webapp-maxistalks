-- Adiciona colunas de cores do tema para customização white-label completa
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS background_color  text DEFAULT '060c1f',
  ADD COLUMN IF NOT EXISTS surface_color     text DEFAULT '1e293b',
  ADD COLUMN IF NOT EXISTS surface_alt_color text DEFAULT '0f172a',
  ADD COLUMN IF NOT EXISTS text_muted_color  text DEFAULT '94a3b8';
