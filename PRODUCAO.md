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

## 3. RLS (Row Level Security)

As políticas em `supabase/migrations/` precisam estar aplicadas no projeto de produção. Execute as migrations ou crie as políticas manualmente.

## 4. Redeploy após alterar variáveis

Depois de adicionar ou alterar variáveis na Vercel, faça um **Redeploy** do projeto para que as alterações tenham efeito.

## Problemas comuns

- **Dashboard vazio:** Verifique se `SUPABASE_SERVICE_ROLE_KEY` está configurada e se fez redeploy.
- **"Tenho interesse" não salva:** Verifique `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Redirect do perfil não funciona:** O redirect para `/inicio` ocorre após ~800ms. Se persistir, verifique o console do navegador.
