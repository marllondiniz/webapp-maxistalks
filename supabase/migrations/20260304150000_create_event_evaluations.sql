-- Tabela de avaliações de eventos
CREATE TABLE IF NOT EXISTS event_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  token text UNIQUE NOT NULL,
  email text,

  nota_geral smallint CHECK (nota_geral >= 0 AND nota_geral <= 10),
  nota_ambiente smallint CHECK (nota_ambiente >= 0 AND nota_ambiente <= 10),
  organizacao text CHECK (organizacao IN ('ruim', 'ok', 'boa', 'excelente')),
  conteudo_aplicavel text CHECK (conteudo_aplicavel IN ('nada', 'pouco', 'medio', 'muito', 'totalmente')),
  insight_util text,
  nivel_convidados text CHECK (nivel_convidados IN ('fraco', 'ok', 'bom', 'excelente')),
  conexoes text CHECK (conexoes IN ('nao', 'poucas', 'varias')),
  tempo_evento text CHECK (tempo_evento IN ('curto', 'ideal', 'longo')),
  nota_recomendacao smallint CHECK (nota_recomendacao >= 0 AND nota_recomendacao <= 10),
  sugestao_melhoria text,

  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  tenant_id uuid
);

ALTER TABLE event_evaluations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_event_evaluations_event ON event_evaluations(event_id);
CREATE INDEX idx_event_evaluations_token ON event_evaluations(token);

-- Tabela de controle de envio de e-mail de avaliação
CREATE TABLE IF NOT EXISTS event_evaluation_sent (
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE event_evaluation_sent ENABLE ROW LEVEL SECURITY;
