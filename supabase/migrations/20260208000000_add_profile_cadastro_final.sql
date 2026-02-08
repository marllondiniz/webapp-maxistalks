-- MaxisTalks — Cadastro (Final) — Novas colunas
-- Execute no SQL Editor do Supabase Dashboard

-- Etapa 2: Posição no mercado
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS posicao_mercado text; -- 'empreendedor' | 'lider'

-- Campos para Empreendedor(a)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS segmento_negocio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS publico_atende text; -- B2B, B2C, B2B2C, Outro
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS faixa_faturamento text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS num_colaboradores text;

-- Campos para Líder/gestor(a)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cargo_atual text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS area_gestao text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS empresa_atual text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tamanho_empresa text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lidera_time boolean;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS desafios_detalhados text[] DEFAULT '{}';

-- Etapa 3: Intenção
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS busca_maxistalks text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS o_que_quer_aprender text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS maior_dificuldade text;

-- Finalização: checkboxes obrigatórios
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ciente_evento_online boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aceite_lgpd boolean DEFAULT false;
