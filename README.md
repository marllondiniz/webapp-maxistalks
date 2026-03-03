# Maxis Talks - Web App

Aplicação web moderna para a plataforma Maxis Talks.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Orbitron & Space Grotesk** (Google Fonts)

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start
```

Acesse [http://localhost:3000](http://localhost:3000) para ver a página.

## 🎨 Características

- ✅ Hero Section com animações e efeitos visuais
- ✅ Seção de anúncio com tipografia elegante
- ✅ Countdown regressivo em tempo real
- ✅ Rodapé com logos e frase final
- ✅ Design responsivo
- ✅ Animações suaves com Framer Motion
- ✅ Paleta preto e branco com detalhes em cinza
- ✅ Tipografia geométrica futurista

## 📝 Estrutura

```
maxis-talks/
├── app/
│   ├── layout.tsx      # Layout principal com fontes
│   ├── page.tsx        # Página principal com todos os componentes
│   └── globals.css     # Estilos globais e Tailwind
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 📌 Depois do deploy

Se as alterações não aparecerem em produção (ex.: botão Newsletter em eventos, página /plataforma), veja **[docs/DEPLOY-E-ALTERACOES.md](docs/DEPLOY-E-ALTERACOES.md)** — lá está o SQL para rodar no Supabase e as variáveis de ambiente na Vercel.

## 🎯 Próximos Passos

- Adicionar formulário de captura de leads
- Integrar com WhatsApp/Instagram
- Adicionar mais animações e efeitos visuais
- Otimizar performance e SEO


