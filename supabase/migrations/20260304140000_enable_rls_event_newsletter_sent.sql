-- Segurança: apenas o backend (service_role) deve acessar event_newsletter_sent.
-- Com RLS ativo e sem políticas para anon/authenticated, o acesso fica restrito ao servidor.

ALTER TABLE event_newsletter_sent ENABLE ROW LEVEL SECURITY;

-- Nenhuma política para anon ou authenticated: acesso só via service_role (API admin).
-- Assim a tabela deixa de aparecer como UNRESTRICTED no dashboard.
