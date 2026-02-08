-- Adiciona suporte a imagens e tipo de conteúdo nos artigos
-- Tipo: onde o conteúdo aparece (blog, inicio, comunidade)

-- Cria tabela articles se não existir (alguns projetos podem ter via outro meio)
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  autor_handle text DEFAULT '@maxistalks',
  categoria text,
  resumo text,
  icone text,
  publicado_em timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Novas colunas
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_path text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tipo_conteudo text DEFAULT 'blog';

-- tipo_conteudo: 'blog' | 'inicio' | 'comunidade' | 'geral'
-- blog = só no Conteúdo/Blog
-- inicio = destaque no Início
-- comunidade = na página Comunidade
-- geral = em todos os lugares

-- Crie o bucket "content-images" no Supabase Dashboard (Storage) se não existir.
-- O bucket deve ser público para exibir imagens.
