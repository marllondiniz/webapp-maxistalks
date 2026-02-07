# Verificação: Dados do Perfil no Banco

## Mapeamento Formulário → Banco de Dados

| Campo no Formulário | Coluna no banco | Migration | Status |
|--------------------|-----------------|-----------|--------|
| Nome completo | `nome` | (base) | ✅ |
| Email | `email` | (base) | ✅ |
| WhatsApp | `telefone` | (base) | ✅ |
| Cidade/Estado | `cidade_estado` | 20260207000000 | ✅ |
| Tem empresa → Empresa/Projeto | `empresa_projeto` | 20260207000000 | ✅ |
| Área principal | `area_principal` | 20260207000000 | ✅ |
| Estágio do negócio | `estagio_negocio` | 20260207000000 | ✅ |
| Por que quer participar | `objetivo_mes` | 20260207000000 | ✅ |
| Principal desafio (até 3) | `principais_desafios` | 20260207000000 | ✅ |
| O que você vende | `o_que_vende` | 20260207000000 | ✅ |
| Participar de eventos | `participar_eventos` | 20260207000000 | ✅ |
| Receber benefícios | `recebe_beneficios` | 20260207200000 | ✅ |
| LinkedIn | `linkedin` | 20260207000000 | ✅ |
| Instagram | `instagram` | 20260207000000 | ✅ |
| Site | `site` | 20260207000000 | ✅ |
| Bio curta | `bio` | (base) | ✅ |
| Foto (avatar) | `avatar_url` | (base) | ✅ |
| — | `is_complete` | (base) | ✅ |
| — | `updated_at` | (base) | ✅ |

## Como verificar se os dados estão sendo salvos

### 1. Aplicar migrations no Supabase

No **Supabase Dashboard** → **SQL Editor**, execute as migrations na ordem:

- `supabase/migrations/20260207000000_add_profile_columns.sql`
- `supabase/migrations/20260207200000_add_profile_recebe_beneficios.sql`

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
  empresa_projeto, area_principal, estagio_negocio, objetivo_mes,
  principais_desafios, o_que_vende, participar_eventos, recebe_beneficios,
  linkedin, instagram, site, bio, avatar_url, is_complete, updated_at
FROM profiles
WHERE id = 'SEU_USER_ID_AQUI';
```

Obtenha o `id` em **Authentication** → **Users** no Supabase.

## Upsert e conflitos

O formulário usa `upsert` com `onConflict: 'id'`, garantindo que:

- Perfis novos são inseridos.
- Perfis existentes são atualizados sem duplicar o registro.
