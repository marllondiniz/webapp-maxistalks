/**
 * Funcionalidade de venda da plataforma white-label (página /plataforma e leads no admin).
 * Deve estar habilitada APENAS no deploy dos donos do produto.
 * Nos deploys dos clientes (quem comprou o sistema white-label), manter desabilitado.
 *
 * No Vercel use ENABLE_PLATAFORMA_SALES=true (sem NEXT_PUBLIC) para o valor ser lido
 * no servidor em tempo de execução; o menu do admin passa a mostrar a seção após o deploy.
 */

const ENV_KEY = 'NEXT_PUBLIC_ENABLE_PLATAFORMA_SALES'
const ENV_KEY_SERVER = 'ENABLE_PLATAFORMA_SALES'

function isTrue(value: string | undefined): boolean {
  return value === 'true' || value === '1'
}

/** Retorna true apenas quando a venda de plataforma está habilitada (deploy dos donos). */
export function isPlataformaSalesEnabled(): boolean {
  return isTrue(process.env[ENV_KEY_SERVER]) || isTrue(process.env[ENV_KEY])
}
