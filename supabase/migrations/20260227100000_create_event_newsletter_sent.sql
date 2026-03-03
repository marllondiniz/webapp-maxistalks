-- Registro de e-mails que já receberam a newsletter de cada evento
-- Evita reenviar o mesmo evento para quem já recebeu

CREATE TABLE IF NOT EXISTS event_newsletter_sent (
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  email text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, email)
);

CREATE INDEX IF NOT EXISTS idx_event_newsletter_sent_event_id ON event_newsletter_sent(event_id);

COMMENT ON TABLE event_newsletter_sent IS 'E-mails que já receberam a newsletter de cada evento (evita reenvio).';
