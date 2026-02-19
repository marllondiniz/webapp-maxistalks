-- Registro de e-mails que já receberam a newsletter de cada artigo
-- Evita reenviar o mesmo artigo para quem já recebeu

CREATE TABLE IF NOT EXISTS article_newsletter_sent (
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  email text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  PRIMARY KEY (article_id, email)
);

CREATE INDEX IF NOT EXISTS idx_article_newsletter_sent_article_id ON article_newsletter_sent(article_id);

COMMENT ON TABLE article_newsletter_sent IS 'E-mails que já receberam a newsletter de cada artigo (evita reenvio).';
