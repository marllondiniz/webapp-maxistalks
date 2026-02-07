-- Adiciona colunas individuais ao perfil (MaxisTalks)
-- Execute no SQL Editor do Supabase Dashboard

-- Dados pessoais
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cidade_estado text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS empresa_projeto text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS area_principal text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS estagio_negocio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS objetivo_mes text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS participar_eventos boolean DEFAULT false;

-- Negócio
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS o_que_vende text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS para_quem_vende text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ticket_medio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS capacidade_mensal text;

-- Posicionamento
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS o_que_faz_frase text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS metodo_diferencial text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS canal_principal text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS prova text;

-- Desafios e networking (array de strings)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS principais_desafios text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ofereco text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preciso text;

-- Links
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS site text;
