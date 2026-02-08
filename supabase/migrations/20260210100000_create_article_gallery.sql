-- Galeria de fotos do conteúdo (artigos) - "como foi o evento"
CREATE TABLE IF NOT EXISTS article_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_path text NOT NULL,
  ordem int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_article_gallery_article_id ON article_gallery(article_id);
