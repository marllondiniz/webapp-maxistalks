# Como Reativar as Páginas /quiz e /brizz

As páginas `/quiz` e `/brizz` foram temporariamente substituídas por páginas "Em breve" **sem perder nenhum conteúdo**.

## 📁 Arquivos Preservados

O conteúdo original está salvo em:
- `app/quiz/page.backup.tsx` → Página completa do Quiz PAR-Q
- `app/brizz/page.backup.tsx` → Página completa do evento BRIZZ

## 🔄 Para Reativar as Páginas

Basta renomear os arquivos de volta:

```bash
# Reativar Quiz
mv app/quiz/page.backup.tsx app/quiz/page.tsx

# Reativar BRIZZ
mv app/brizz/page.backup.tsx app/brizz/page.tsx
```

Ou reativar ambas de uma vez:

```bash
cd /Users/marllondiniz/Desktop/projetos/coffe-music
mv app/quiz/page.backup.tsx app/quiz/page.tsx && mv app/brizz/page.backup.tsx app/brizz/page.tsx
```

## ⚠️ Importante

Ao reativar, você pode querer ajustar o redirecionamento da página raiz (`app/page.tsx`) caso queira que `/` redirecione para `/brizz` novamente.

Atualmente, `/` está redirecionando para `/login` (página de login).

---

**Data da despublicação:** $(date)
**Motivo:** Ajustes e manutenção

