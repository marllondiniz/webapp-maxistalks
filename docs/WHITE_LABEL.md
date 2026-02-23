# White label

O app pode ser usado como **single-tenant** (uma marca por deploy, via variáveis de ambiente) ou **multi-tenant** (várias marcas no mesmo deploy, resolvidas por domínio no banco).

## Single-tenant (variáveis de ambiente)

Em cada deploy (ex.: um projeto Vercel por cliente), configure o `.env`:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_APP_NAME` | Nome da marca | `Minha Marca` |
| `NEXT_PUBLIC_APP_TAGLINE` | Slogan | `Palco para quem gera valor` |
| `NEXT_PUBLIC_LOGO_PATH` | Caminho do logo (em `public/`) | `/logo.png` |
| `NEXT_PUBLIC_FAVICON_PATH` | Favicon (opcional) | `/favicon.ico` |
| `NEXT_PUBLIC_OG_IMAGE_PATH` | Imagem para redes sociais (opcional) | `/og.png` |
| `NEXT_PUBLIC_PRIMARY_COLOR` | Cor primária (hex sem `#`) | `3b82f6` |
| `NEXT_PUBLIC_PRIMARY_COLOR_HOVER` | Cor primária hover | `2563eb` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | E-mail de contato | `contato@minhamarca.com` |
| `NEXT_PUBLIC_BASE_URL` | URL do site | `https://minhamarca.com` |
| `NEXT_PUBLIC_STORAGE_KEY_PREFIX` | Prefixo do localStorage (auth e cookies) | `minhamarca` |

Coloque o logo (e favicon/og se quiser) na pasta `public/`. Sem configurar nada, o app usa os padrões da marca MaxisTalks.

## Venda da plataforma white-label (só para donos)

A página pública `/plataforma` (formulário de interesse em comprar o sistema) e a área no admin **Interesses /plataforma** são voltadas **apenas para o deploy dos donos do produto**. Nos deploys dos clientes que já compraram o white-label, essa funcionalidade não deve aparecer.

Controle por variável de ambiente:

| Variável | Descrição | Quando usar |
|----------|-----------|-------------|
| `ENABLE_PLATAFORMA_SALES` | **(Recomendado no Vercel)** Habilita página `/plataforma` e seção "Interesses /plataforma" no admin. Lido no servidor em tempo de execução. | No deploy dos donos: `true` ou `1`. Nos clientes: não defina ou `false`. |
| `NEXT_PUBLIC_ENABLE_PLATAFORMA_SALES` | Mesmo efeito, mas embutido no build. | Use se preferir; após adicionar no Vercel é necessário **fazer um novo deploy** para o valor aparecer. |

- **Deploy dos donos (Vercel):** defina **`ENABLE_PLATAFORMA_SALES=true`** (sem `NEXT_PUBLIC_`). O servidor lê essa variável em toda requisição, então o menu do admin terá a seção "White-label" e o link "Interesses /plataforma" após o deploy. Alternativamente use `NEXT_PUBLIC_ENABLE_PLATAFORMA_SALES=true` e garanta que um **novo deploy** foi feito depois de salvar a variável.
- **Deploy dos clientes:** não defina nenhuma das duas ou defina `false`. O menu não mostra a seção White-label, não há card de leads, `/admin/plataforma-interesse` redireciona para `/admin`, `/plataforma` redireciona para `/` e as APIs de leads retornam 403.

## Multi-tenant (banco de dados)

1. Rode a migration que cria a tabela `tenants`:
   - `supabase/migrations/20260213100000_create_tenants_white_label.sql`

2. A resolução do tenant é feita pelo **host** da requisição (ex.: `maxistalks.com`, `cliente.com`). O layout lê o header `Host`, chama `getBrandConfig(host)` e usa primeiro o registro em `tenants` cujo `domain` coincide; se não houver, usa as variáveis de ambiente.

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
| `created_at` / `updated_at` | timestamptz | Metadados |

A migration já insere o tenant padrão para `maxistalks.com`. Para desenvolvimento em `localhost`, cadastre um tenant com `domain = 'localhost'` ou use as variáveis de ambiente.

## Isolamento por tenant (multi-tenant)

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
