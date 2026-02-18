-- Comentários em artigos do blog (posts)
-- Cada comentário é vinculado a um artigo e ao usuário (perfil) que comentou.

CREATE TABLE IF NOT EXISTS article_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_article_comments_article_id ON article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_created_at ON article_comments(article_id, created_at DESC);

ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;

-- Leitores autenticados podem ver todos os comentários do artigo
CREATE POLICY "Authenticated can read article comments"
  ON article_comments FOR SELECT
  TO authenticated
  USING (true);

-- Usuário autenticado pode inserir comentário apenas com o próprio user_id
CREATE POLICY "Authenticated can insert own comment"
  ON article_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE article_comments IS 'Comentários dos usuários nos artigos do blog.';
