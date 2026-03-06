-- Respostas a comentários: cada comentário pode ter um parent (resposta a outro comentário).
ALTER TABLE article_comments
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES article_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_article_comments_parent_id ON article_comments(parent_id);

COMMENT ON COLUMN article_comments.parent_id IS 'Se preenchido, este comentário é resposta ao comentário referenciado.';
