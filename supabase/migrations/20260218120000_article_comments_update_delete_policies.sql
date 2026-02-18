-- Permite que o autor do comentário edite ou exclua apenas seus próprios comentários.

CREATE POLICY "Authenticated can update own comment"
  ON article_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated can delete own comment"
  ON article_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
