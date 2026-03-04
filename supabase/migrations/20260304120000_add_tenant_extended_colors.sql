-- Adiciona colunas de cores estendidas para customizacao completa de white-label
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS heading_color    text DEFAULT 'ffffff',
  ADD COLUMN IF NOT EXISTS body_text_color  text DEFAULT 'e2e8f0',
  ADD COLUMN IF NOT EXISTS link_color       text DEFAULT '3b82f6',
  ADD COLUMN IF NOT EXISTS link_hover_color text DEFAULT '60a5fa',
  ADD COLUMN IF NOT EXISTS accent_color     text DEFAULT '10b981';
