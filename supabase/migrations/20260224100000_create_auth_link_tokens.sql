-- Tokens de uso único para "entrar já logado" ao clicar no link do e-mail (broadcast).
-- Consumido por GET /api/auth/link?token=xxx; após uso o registro é removido.

CREATE TABLE IF NOT EXISTS auth_link_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redirect_path text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_link_tokens_token ON auth_link_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_link_tokens_expires_at ON auth_link_tokens(expires_at);

COMMENT ON TABLE auth_link_tokens IS 'Tokens de uso único para login via link do e-mail (broadcast de artigos).';
