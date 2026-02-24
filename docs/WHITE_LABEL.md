# White label

O app é **multi-tenant**: um único deploy, vários domínios (clientes). Cada domínio é resolvido pelo **Host** da requisição e pela tabela `tenants` no banco.

---

## Decisões e notas importantes

**Estratégia:** o produto opera **sempre em modo multi-tenant**. Cada domínio (ex.: maxistalks.com, cliente.com) é resolvido pelo **Host** da requisição → tabela `tenants` (campo `domain`). Quando não há tenant para o host (ex.: localhost em desenvolvimento), usa-se fallback das variáveis de ambiente.

**Resolução do tenant:** `getBrandConfig(host)` → busca em `tenants` por `domain` (normalizado, sem porta). Tudo que depende de marca (nome, logo, cores, base_url, features, newsletter) vem da brand desse tenant.

**Venda da plataforma (/plataforma e Interesses no admin):** só para o(s) dono(s). No banco: `tenants.enable_plataforma_sales = true` apenas para o tenant dono (ex.: maxistalks.com). Clientes: `false` (padrão). Não é necessário variável de ambiente no multi-tenant.

**Newsletter (Resend):** cada tenant tem sua própria **Audience** no Resend. Coluna `tenants.resend_audience_id` = UUID da audience. Inscrição e broadcast usam essa audience; listas ficam isoladas por cliente. Ao criar um novo tenant: criar Audience no Resend e preencher `resend_audience_id`.

**E-mail “De” (remetente):** hoje o código usa `nome do tenant <no-reply@hostname do base_url>`. Para esse endereço funcionar, o **domínio do tenant precisa estar verificado no Resend** (DNS). Alternativa: usar um único domínio de envio (ex.: `no-reply@mail.maxistalks.com`) via variável `RESEND_FROM_EMAIL` no env; aí o nome exibido continua sendo o do tenant.

**Onboarding de novo cliente (checklist):** (1) Inserir registro em `tenants` (domain, name, logo_url, base_url, etc.). (2) No Resend, criar Audience e preencher `resend_audience_id`. (3) DNS do domínio do cliente apontando para o deploy. (4) Opcional: verificar domínio no Resend se for enviar de no-reply@domínio-do-cliente.

---

## Venda da plataforma white-label (só para donos)

A página pública `/plataforma` (formulário de interesse em comprar o sistema) e a área no admin **Interesses /plataforma** são voltadas **apenas para o(s) dono(s) do produto**. Nos clientes que já compraram o white-label, essa funcionalidade não deve aparecer.

O controle é **por tenant** na tabela `tenants`: a coluna **`enable_plataforma_sales`** (boolean) define se aquele domínio (marca) é “dono” e pode ver/usar a venda da plataforma.

- **Tenant dono (ex.: maxistalks.com):** no banco, `enable_plataforma_sales = true`. Esse domínio vê o menu "White-label", o card e a página `/plataforma`, e as APIs de leads funcionam.
- **Tenant cliente (ex.: cliente.com):** `enable_plataforma_sales = false` (padrão). Esse domínio não vê a seção, `/plataforma` redireciona para `/` e as APIs retornam 403.

A migration `20260223130000_add_tenants_enable_plataforma_sales.sql` adiciona a coluna e já deixa `true` para o tenant `maxistalks.com`. Para novos clientes em `tenants`, não altere ou defina `enable_plataforma_sales = false`.

## Multi-tenant (banco de dados)

1. Rode a migration que cria a tabela `tenants`:
   - `supabase/migrations/20260213100000_create_tenants_white_label.sql`

2. A resolução do tenant é feita pelo **host** da requisição (ex.: `maxistalks.com`, `cliente.com`). O layout lê o header `Host`, chama `getBrandConfig(host)` e usa o registro em `tenants` cujo `domain` coincide; se não houver (ex.: localhost), usa fallback das variáveis de ambiente.

3. Para adicionar um novo cliente (marca), insira um registro em `tenants`:

```sql
INSERT INTO tenants (
  domain,
  name,
  tagline,
  logo_url,
  primary_color,
  primary_color_hover,
  support_email,
  base_url,
  storage_key_prefix
) VALUES (
  'cliente.com',           -- domínio que acessa o site
  'Cliente',
  'Slogan do cliente',
  '/logos/cliente.png',   -- path no app ou URL absoluta
  '3b82f6',
  '2563eb',
  'contato@cliente.com',
  'https://cliente.com',
  'cliente'
);
```

4. O logo pode ser um path relativo (ex.: `/logo.png`) — o arquivo precisa estar em `public/` — ou uma URL absoluta (ex.: `https://cdn.cliente.com/logo.png`).

5. Em um mesmo deploy multi-tenant, cada domínio precisa apontar para esse deploy (DNS) e o backend usa o header `Host` para escolher o tenant. Não é necessário configurar as variáveis `NEXT_PUBLIC_APP_*` para cada domínio; o banco prevalece quando há match por domínio.

## Banco de dados: tabela `tenants`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | PK |
| `domain` | text | Domínio único (ex.: maxistalks.com) |
| `name` | text | Nome da marca |
| `tagline` | text | Slogan |
| `logo_url` | text | Path ou URL do logo |
| `favicon_url` | text | Opcional |
| `og_image_url` | text | Opcional (Open Graph) |
| `primary_color` | text | Hex sem # (ex.: 3b82f6) |
| `primary_color_hover` | text | Hex sem # |
| `support_email` | text | E-mail de contato |
| `base_url` | text | URL base do site |
| `storage_key_prefix` | text | Prefixo para localStorage |
| `enable_plataforma_sales` | boolean | Se true, este tenant (dono) vê /plataforma e Interesses no admin. Para clientes: false (padrão). |
| `resend_audience_id` | text | ID da Audience no Resend para newsletter/broadcast deste tenant. Cada tenant deve ter sua própria Audience no Resend; preencher ao criar o cliente. |
| `created_at` / `updated_at` | timestamptz | Metadados |

A migration já insere o tenant padrão para `maxistalks.com`. Para desenvolvimento em `localhost`, cadastre um tenant com `domain = 'localhost'` ou use as variáveis de ambiente.

**Newsletter (Resend) por tenant:** Para cada novo cliente, crie uma Audience no Resend, copie o ID (UUID) e preencha `resend_audience_id` no registro do tenant. A inscrição na newsletter e o disparo de artigos usam essa audience, isolando a lista por cliente.

## Isolamento por tenant

A migration `20260213120000_add_tenant_id_to_core_tables.sql` adiciona a coluna `tenant_id` (FK para `tenants.id`) nas tabelas:

- **profiles** — ao criar conta, o perfil recebe o `tenant_id` do domínio em que o usuário se cadastrou.
- **events** — eventos criados no admin ficam amarrados ao tenant do host.
- **articles** — artigos criados no admin ficam amarrados ao tenant.
- **event_banners** — banners ficam amarrados ao tenant.

Comportamento:

- **Criação de conta:** a API `POST /api/auth/create-profile` usa o header `Host` para resolver o tenant e grava `tenant_id` no perfil.
- **Eventos e conteúdo:** as APIs do admin (`/api/admin/events`, `/api/admin/articles`, `/api/admin/event-banners`) filtram listagens por `tenant_id` e incluem `tenant_id` em novas inserções; PUT/DELETE só afetam registros do tenant atual.
- **API pública de eventos:** `GET /api/events` devolve apenas eventos do tenant do host.
- **Páginas (início, eventos, blog, clube, admin):** as queries usam `getTenantIdForRequest()` e repassam `tenantId` para `getEvents`, `getArticles`, `getActiveEventBanners`, etc., de modo que cada domínio vê só seus dados.
- **Dashboard admin:** inscrições e usuários listados são filtrados pelo tenant (inscrições em eventos do tenant; perfis com `tenant_id` igual).

Assim, não há conflito entre marcas: cada uma tem sua base de usuários (por cadastro), eventos, conteúdo e banners isolados pelo `tenant_id`.
