-- Habilita Row Level Security (RLS) na tabela tenants.
-- A leitura de tenants é feita apenas no servidor com service_role (getTenantByDomain),
-- que ignora RLS. Com RLS ativo e sem políticas para anon/authenticated,
-- apenas o backend (service_role) pode acessar a tabela.

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Nenhuma política permissiva para anon ou authenticated:
-- a tabela fica acessível somente via service_role (backend).
-- Isso remove o aviso "UNRESTRICTED" no dashboard do Supabase.

COMMENT ON TABLE tenants IS 'White label: configuração de marca por tenant. RLS ativo; acesso apenas via service_role no backend.';
