-- Cor do texto dos botões (tipografia)
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS button_text_color text DEFAULT 'ffffff';
