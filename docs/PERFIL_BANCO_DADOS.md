# Verificação: Dados do Perfil no Banco

## Mapeamento Formulário → Banco de Dados (MaxisTalks — Cadastro Final)

### Etapa 1 — Básico
| Campo no Formulário | Coluna no banco | Migration | Status |
|--------------------|-----------------|-----------|--------|
| Nome completo | `nome` | (base) | ✅ |
| Email | `email` | (base) | ✅ |
| WhatsApp | `telefone` | (base) | ✅ |
| Cidade/Estado | `cidade_estado` | 20260207000000 | ✅ |
| Instagram (opcional) | `instagram` | 20260207000000 | ✅ |
| LinkedIn (opcional) | `linkedin` | 20260207000000 | ✅ |
| Bio curta (opcional) | `bio` | (base) | ✅ |
| Foto (avatar) | `avatar_url` | (base) | ✅ |

### Etapa 2 — Perfil (segmentação)
| Campo no Formulário | Coluna no banco | Migration | Status |
|--------------------|-----------------|-----------|--------|
| Posição no mercado | `posicao_mercado` | 20260208000000 | ✅ |
| Nome da empresa (Empreendedor) | `empresa_projeto` | 20260207000000 | ✅ |
| Site (Empreendedor) | `site` | 20260207000000 | ✅ |
| Segmento do negócio | `segmento_negocio` | 20260208000000 | ✅ |
| Público que atende | `publico_atende` | 20260208000000 | ✅ |
| Faixa de faturamento | `faixa_faturamento` | 20260208000000 | ✅ |
| Ticket médio | `ticket_medio` | 20260207000000 | ✅ |
| Nº de colaboradores | `num_colaboradores` | 20260208000000 | ✅ |
| Cargo atual (Líder) | `cargo_atual` | 20260208000000 | ✅ |
| Área (Líder) | `area_gestao` | 20260208000000 | ✅ |
| Empresa onde trabalha (Líder) | `empresa_atual` | 20260208000000 | ✅ |
| Tamanho da empresa | `tamanho_empresa` | 20260208000000 | ✅ |
| Lidera time? | `lidera_time` | 20260208000000 | ✅ |
| Desafios detalhados (até 2) | `desafios_detalhados` | 20260208000000 | ✅ |

### Etapa 3 — Intenção
| Campo no Formulário | Coluna no banco | Migration | Status |
|--------------------|-----------------|-----------|--------|
| O que busca no MaxisTalks (até 2) | `busca_maxistalks` | 20260208000000 | ✅ |
| O que quer aprender (até 3) | `o_que_quer_aprender` | 20260208000000 | ✅ |
| Maior dificuldade hoje | `maior_dificuldade` | 20260208000000 | ✅ |

### Finalização
| Campo no Formulário | Coluna no banco | Migration | Status |
|--------------------|-----------------|-----------|--------|
| Ciente evento limitado/online | `ciente_evento_online` | 20260208000000 | ✅ |
| Aceite LGPD/Termos | `aceite_lgpd` | 20260208000000 | ✅ |
| Receber comunicações (opcional) | `recebe_beneficios` | 20260207200000 | ✅ |
| — | `is_complete` | (base) | ✅ |
| — | `updated_at` | (base) | ✅ |

## Como verificar se os dados estão sendo salvos

### 1. Aplicar migrations no Supabase

No **Supabase Dashboard** → **SQL Editor**, execute as migrations na ordem:

- `supabase/migrations/20260207000000_add_profile_columns.sql`
- `supabase/migrations/20260207200000_add_profile_recebe_beneficios.sql`
- `supabase/migrations/20260208000000_add_profile_cadastro_final.sql`

### 2. Conferir colunas da tabela `profiles`

Rode no SQL Editor:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
```

### 3. Testar salvamento

1. Cadastre um perfil completo pelo formulário.
2. No **Table Editor** do Supabase: `profiles` → filtre pelo seu `id` (ou abra a linha).
3. Verifique se todos os campos preenchidos aparecem.

### 4. Query para inspecionar um perfil

```sql
SELECT 
  id, nome, email, telefone, cidade_estado,
  posicao_mercado, empresa_projeto, site, segmento_negocio, publico_atende,
  faixa_faturamento, ticket_medio, num_colaboradores,
  cargo_atual, area_gestao, empresa_atual, tamanho_empresa, lidera_time,
  desafios_detalhados, busca_maxistalks, o_que_quer_aprender, maior_dificuldade,
  ciente_evento_online, aceite_lgpd, recebe_beneficios,
  linkedin, instagram, bio, avatar_url, is_complete, updated_at
FROM profiles
WHERE id = 'SEU_USER_ID_AQUI';
```

Obtenha o `id` em **Authentication** → **Users** no Supabase.

## Upsert e conflitos

O formulário usa `upsert` com `onConflict: 'id'`, garantindo que:

- Perfis novos são inseridos.
- Perfis existentes são atualizados sem duplicar o registro.
