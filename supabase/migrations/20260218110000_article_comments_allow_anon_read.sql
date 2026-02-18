-- Permite que qualquer pessoa (incl. anon) leia comentários dos artigos.
-- Assim a listagem GET /api/articles/[id]/comments funciona mesmo quando
-- a sessão está só no localStorage (sem cookie no servidor).

DROP POLICY IF EXISTS "Authenticated can read article comments" ON article_comments;

CREATE POLICY "Anyone can read article comments"
  ON article_comments FOR SELECT
  TO public
  USING (true);
