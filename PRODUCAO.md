# Checklist de Produção (Vercel + Supabase)

Para o MaxisTalks funcionar corretamente em produção, configure o seguinte:

## 1. Variáveis de ambiente na Vercel

No **Vercel Dashboard** → seu projeto → **Settings** → **Environment Variables**, adicione:

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL do projeto Supabase (ex: `https://xxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Chave anônima (pública) do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Chave de service role (secreta) — necessária para o dashboard admin |

**Onde encontrar no Supabase:** Project Settings → API → Project URL e Project API keys.

⚠️ **Importante:** Sem `SUPABASE_SERVICE_ROLE_KEY`, o dashboard de interesses ficará vazio e os dados não aparecerão.

## 2. Tabela `event_registrations` no Supabase

O app aceita tabelas com `created_at` ou `registered_at`. Se sua tabela já usa `registered_at`, o dashboard vai funcionar.

Para criar uma nova tabela:

```sql
CREATE TABLE IF NOT EXISTS event_registrations (
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_url text,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
UPDATE event_registrations SET created_at = now() WHERE created_at IS NULL;
```

## 3. Migrations da tabela `profiles`

Execute no SQL Editor do Supabase, na ordem:

1. `supabase/migrations/20260207000000_add_profile_columns.sql`
2. `supabase/migrations/20260207200000_add_profile_recebe_beneficios.sql`

Consulte `docs/PERFIL_BANCO_DADOS.md` para verificar se todos os dados do perfil estão sendo salvos.

## 4. RLS (Row Level Security)

As políticas em `supabase/migrations/` precisam estar aplicadas no projeto de produção. Execute as migrations ou crie as políticas manualmente.

## 5. Redeploy após alterar variáveis

Depois de adicionar ou alterar variáveis na Vercel, faça um **Redeploy** do projeto para que as alterações tenham efeito.

## 6. E-mail de confirmação ao criar conta (Supabase + Resend)

O Supabase envia o e-mail de confirmação de cadastro. Por padrão, usa SMTP próprio (limitado, pode ir para spam). Para entregar corretamente, configure **Custom SMTP** no Supabase usando Resend:

1. No **Supabase Dashboard** → **Project Settings** → **Authentication**
2. Na seção **SMTP**, ative **Enable Custom SMTP**
3. Preencha:
   - **Sender email:** `onboarding@resend.dev` (ou seu domínio verificado no Resend)
   - **Sender name:** `MaxisTalks`
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** sua `RESEND_API_KEY` (a mesma do .env)

4. Salve e teste criando uma nova conta.

**Importante:** O domínio do remetente precisa estar verificado no Resend. Se usar `onboarding@resend.dev`, já vem verificado, mas há limite de envio.

**Alternativa (desativar confirmação):** Se quiser que o usuário entre sem confirmar e-mail, em **Authentication** → **Providers** → **Email** desative **Confirm email**.

## Problemas comuns

- **Dashboard vazio:** Verifique se `SUPABASE_SERVICE_ROLE_KEY` está configurada e se fez redeploy.
- **E-mail de confirmação não chega:** Configure o Custom SMTP (Resend) no Supabase (seção 5 acima). Verifique a pasta de spam.
- **"Tenho interesse" não salva:** Verifique `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Redirect do perfil não funciona:** O redirect para `/inicio` ocorre após ~800ms. Se persistir, verifique o console do navegador.
