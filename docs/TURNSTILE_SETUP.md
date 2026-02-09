# Configuração do Cloudflare Turnstile (Captcha)

O Turnstile protege o formulário de **criar conta** contra bots e cadastros automatizados.

## 1. Criar conta no Cloudflare

1. Acesse [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Crie uma conta gratuita (se ainda não tiver)

## 2. Configurar o Turnstile

1. No painel Cloudflare, vá em **Turnstile** (ou em [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile)
2. Clique em **Add site**
3. **Site name**: MaxisTalks (ou qualquer nome)
4. **Domain**: adicione `localhost` e seu domínio de produção (ex: `maxistalks.vercel.app`, `maxistalks.com`)
5. **Widget Mode**: Managed (recomendado – raramente exibe desafio para usuários reais)
6. Salve e copie as chaves:
   - **Site Key** (chave pública)
   - **Secret Key** (chave secreta)

## 3. Variáveis de ambiente

Adicione no `.env.local` (local) e nas variáveis do Vercel (produção):

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=sua_site_key_aqui
TURNSTILE_SECRET_KEY=sua_secret_key_aqui
```

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: chave pública (visível no frontend)
- `TURNSTILE_SECRET_KEY`: chave secreta (apenas servidor, **nunca** commitar)

## 4. Comportamento

- **Sem as variáveis**: o formulário de cadastro funciona normalmente, sem captcha
- **Com as variáveis**: o widget Turnstile aparece no modo "Criar conta" e valida antes de criar a conta
- O widget usa tema escuro para combinar com o layout do MaxisTalks

## 5. Referência

- [Cloudflare Turnstile – Documentação](https://developers.cloudflare.com/turnstile/)
- Planos gratuitos incluem uso ilimitado
