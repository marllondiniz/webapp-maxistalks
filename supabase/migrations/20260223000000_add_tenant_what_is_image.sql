-- Imagem e título da seção "O que é" na landing (customizável por tenant)
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS what_is_image_url text,
  ADD COLUMN IF NOT EXISTS what_is_heading text;

-- Opcional: backfill para o tenant padrão
-- UPDATE tenants SET what_is_heading = 'O que é o MaxisTalks', what_is_image_url = '/oqueé.avif' WHERE domain = 'maxistalks.com';
