-- Multi-tenant: apenas o(s) tenant(s) dono(s) podem ver e usar a venda da plataforma (/plataforma e Interesses no admin).
-- Demais tenants (clientes) não veem a funcionalidade.

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS enable_plataforma_sales boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN tenants.enable_plataforma_sales IS 'Se true, este tenant (dono) vê a página /plataforma e a seção Interesses /plataforma no admin. Para clientes white-label manter false.';

-- Habilitar para o tenant padrão MaxisTalks (dono)
UPDATE tenants
  SET enable_plataforma_sales = true
  WHERE domain = 'maxistalks.com';
