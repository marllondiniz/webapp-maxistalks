/**
 * Funcionalidade de venda da plataforma white-label (página /plataforma e leads no admin).
 * Deve estar habilitada APENAS no deploy dos donos do produto.
 * Nos deploys dos clientes (quem comprou o sistema white-label), manter desabilitado.
 */

const ENV_KEY = 'NEXT_PUBLIC_ENABLE_PLATAFORMA_SALES'

/** Retorna true apenas quando a venda de plataforma está habilitada (deploy dos donos). */
export function isPlataformaSalesEnabled(): boolean {
  return process.env[ENV_KEY] === 'true' || process.env[ENV_KEY] === '1'
}
