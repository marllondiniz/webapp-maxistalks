# Depois do deploy: fazer as alterações aparecerem

O código no GitHub e o deploy na Vercel atualizam a **aplicação**. Algumas funcionalidades dependem de **configuração no banco (Supabase)** e em **variáveis de ambiente**. Se algo não aparecer após o deploy, siga os passos abaixo.

---

## 1. Migration: tabela para newsletter de eventos

O **disparo de e-mail para eventos** (botão "Newsletter" no admin de eventos) usa a tabela `event_newsletter_sent`. Ela **não é criada automaticamente** no Supabase quando você faz deploy — é preciso rodar a migration no banco de **produção**.

### Como aplicar

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard) do seu projeto (produção).
2. Vá em **SQL Editor**.
3. Cole e execute o SQL abaixo:

```sql
-- Registro de e-mails que já receberam a newsletter de cada evento
CREATE TABLE IF NOT EXISTS event_newsletter_sent (
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  email text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  PRIMARY KEY (event_id, email)
);

CREATE INDEX IF NOT EXISTS idx_event_newsletter_sent_event_id ON event_newsletter_sent(event_id);

COMMENT ON TABLE event_newsletter_sent IS 'E-mails que já receberam a newsletter de cada evento (evita reenvio).';
```

4. Clique em **Run**. Depois disso, o botão "Newsletter" nos eventos no admin passará a funcionar em produção.

---

## 2. Variáveis de ambiente na Vercel

- **Página /plataforma:** para a página de venda da plataforma aparecer no site em produção, configure na Vercel (Settings → Environment Variables):
  - `ENABLE_PLATAFORMA_SALES` = `true`
- **Newsletter (Resend):** para disparo de conteúdo e eventos por e-mail, garanta:
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
  - `RESEND_AUDIENCE_ID` (ou o que seu tenant usa)

Depois de alterar variáveis, faça um **redeploy** (Deployments → ⋮ no último deploy → Redeploy).

---

## 3. Cache

Se a ordem dos eventos ou a interface parecer antiga:

- Faça **hard refresh** no navegador: `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (Mac).
- Ou abra o site em aba anônima para testar sem cache.

---

## Resumo

| O que não aparece        | O que fazer |
|-------------------------|------------|
| Botão Newsletter em eventos | Rodar o SQL da `event_newsletter_sent` no Supabase **produção** |
| Página /plataforma      | Definir `ENABLE_PLATAFORMA_SALES=true` na Vercel e redeploy |
| Ordenação dos eventos   | Deploy já leva a alteração; se não vir, hard refresh ou redeploy |
| Disparo de e-mail falha | Conferir `RESEND_*` na Vercel e tabela no Supabase |
