# Regras para criação de banners de eventos

## Configuração (primeira vez)

Para exibir Instagram e descrição do palestrante, rode no **SQL Editor** do Supabase:

```sql
ALTER TABLE event_banners
  ADD COLUMN IF NOT EXISTS palestrante_instagram text,
  ADD COLUMN IF NOT EXISTS palestrante_descricao text;
```

Depois, edite cada evento no painel admin e preencha os campos **Instagram do palestrante** e **Descrição do palestrante** na seção Banner. Clique em **Salvar** — não é preciso enviar nova imagem.

**Para testar rapidamente** (Substitua pelos dados reais):
```sql
UPDATE event_banners SET palestrante_instagram = '@usuario', palestrante_descricao = 'Descrição do palestrante' WHERE event_id = 'ID_DO_EVENTO';
```

## Dimensões recomendadas

| Uso       | Dimensões     | Proporção |
|-----------|---------------|-----------|
| Ideal     | **1200 × 640 px** | ~15:8  |
| Alternativa | 900 × 480 px   | 15:8   |
| Mínima    | 600 × 320 px   | 15:8   |

## Zona segura (composição)

1. **Parte superior e centro** → Coloque o rosto ou assunto principal aqui.
2. **Parte inferior (~80–100px)** → Mantenha vazia ou com fundo neutro (o texto aparece aqui).
3. **Evite** retratos com rosto centralizado ou muito próximo da borda inferior.

## O que evitar

- Fotos muito close que cortam a cabeça ao recortar.
- Rosto ou elementos importantes na faixa inferior (onde o texto é sobreposto).
- Imagens em formato retrato (vertical); prefira paisagem (horizontal).

## Dica

Pense no banner como "largura sempre maior que altura", com o sujeito no terço superior.
