-- Adiciona coluna de conteúdo completo nos artigos
ALTER TABLE articles ADD COLUMN IF NOT EXISTS conteudo text;
