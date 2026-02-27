import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'
import { Header } from '../(components)/Header'
import { Footer } from '../(components)/Footer'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'Privacy' })
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  }
}

export default async function PoliticaPrivacidadePage() {
  const locale = await getLocale()
  const t = await getTranslations('Privacy')
  const dateLocale = locale === 'en' ? 'en-GB' : 'pt-BR'
  const lastUpdated = new Date().toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <main className="min-h-screen bg-neutral-950">
      <Header />
      <div className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-neutral-100 mb-8">
            {t('title')}
          </h1>
          
          <div className="prose prose-invert max-w-none text-neutral-300 font-space space-y-6">
            <p className="text-neutral-400 text-sm">
              {t('lastUpdate')}: {lastUpdated}
            </p>

            <p className="text-lg text-neutral-200 mb-6">
              {t('intro')}
            </p>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s1Title')}
              </h2>
              <p>{t('s1Body')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s2Title')}
              </h2>
              <p>{t('s2Intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('s2Li1')}</li>
                <li>{t('s2Li2')}</li>
                <li>{t('s2Li3')}</li>
                <li>{t('s2Li4')}</li>
                <li>{t('s2Li5')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s3Title')}
              </h2>
              <p>{t('s3Intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('s3Li1')}</li>
                <li>{t('s3Li2')}</li>
                <li>{t('s3Li3')}</li>
                <li>{t('s3Li4')}</li>
                <li>{t('s3Li5')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s4Title')}
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>{t('s4Li1')}</strong></li>
                <li><strong>{t('s4Li2')}</strong></li>
                <li><strong>{t('s4Li3')}</strong></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s5Title')}
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('s5Li1')}</li>
                <li>{t('s5Li2')}</li>
                <li>{t('s5Li3')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s6Title')}
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('s6Li1')}</li>
                <li>{t('s6Li2')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s7Title')}
              </h2>
              <p>{t('s7Intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('s7Li1')}</li>
                <li>{t('s7Li2')}</li>
                <li>{t('s7Li3')}</li>
                <li>{t('s7Li4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s8Title')}
              </h2>
              <p>{t('s8Body')}</p>
              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                {t('s8TypesTitle')}
              </h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>{t('s8Li1')}</strong></li>
                <li><strong>{t('s8Li2')}</strong></li>
                <li><strong>{t('s8Li3')}</strong></li>
              </ul>
              <p className="mb-2">{t('s8Banner')}</p>
              <p>{t('s8NoSensitive')}</p>
              <p className="mt-4">
                {t('s8Link')}{' '}
                <Link href="/cookies" className="text-white hover:text-neutral-300 underline">
                  {t('s8LinkLabel')}
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s9Title')}
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('s9Li1')}</li>
                <li>{t('s9Li2')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s10Title')}
              </h2>
              <p>
                {t('s10Email')}{' '}
                <a href="mailto:contato@maxistalks.com" className="text-white hover:text-neutral-300 underline">
                  contato@maxistalks.com
                </a>
              </p>
              <p className="mt-2">
                {t('s10Instagram')}{' '}
                <a href="https://www.instagram.com/maxisplus" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 underline">
                  @maxisplus
                </a>
              </p>
              <p className="mt-2">{t('s10Address')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-12 mb-4">
                PROGRAMA DE GOVERNANÇA EM PRIVACIDADE (PGP)
              </h2>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-8 mb-3">
                Princípios
              </h3>
              <p>
                São valores que devem orientar todas as ações internas e externas da MAXISTALKS, bem como as dos funcionários e administradores no tratamento dos dados pessoais de consumidores:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Finalidade</strong>: tratamento para propósitos legítimos, específicos, explícitos e informados ao titular dos dados pessoais.</li>
                <li><strong>Adequação</strong>: compatibilidade do tratamento com as finalidades informadas ao titular.</li>
                <li><strong>Necessidade</strong>: limitação do tratamento ao mínimo necessário para a realização de suas finalidades.</li>
                <li><strong>Livre acesso</strong>: consulta facilitada e gratuita sobre a forma e a duração do tratamento.</li>
                <li><strong>Qualidade dos dados</strong>: garantia, aos titulares, de consulta facilitada e gratuita sobre a forma e a duração do tratamento.</li>
                <li><strong>Transparência</strong>: garantia aos titulares de informações claras, precisas e facilmente acessíveis sobre o tratamento dos dados.</li>
                <li><strong>Segurança</strong>: utilização de medidas técnicas e administrativas aptas a proteger os dados pessoais.</li>
                <li><strong>Prevenção</strong>: adoção de medidas para prevenir a ocorrência de danos em virtude do tratamento de dados pessoais.</li>
                <li><strong>Não discriminação</strong>: impossibilidade de realização do tratamento para fins discriminatórios ilícitos ou abusivos.</li>
                <li><strong>Responsabilização e prestação de contas</strong>: demonstração da adoção de medidas eficazes.</li>
                <li><strong>Promoção da Confiança nas Relações Internas e Externas</strong>: criação de cultura aberta e transparente, em que os processos, as decisões e os aprendizados são compartilhados objetivando promover a Confiança nas Relações.</li>
              </ul>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-8 mb-3">
                Objetivo
              </h3>
              <p>
                O objetivo deste documento é estabelecer entre a MAXISTALKS, seus diretores, conselheiros e funcionários um plano de governança para consolidar os requisitos de privacidade e segurança com o intuito de ditar e influenciar como os dados pessoais são manuseados no seu ciclo de vida como um todo na consecução das atividades de todos.
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-8 mb-3">
                Encarregado
              </h3>
              <p>
                A MAXISTALKS, já neste documento, indica que o seu Encarregado é a pessoa indicada para atuar como canal de comunicação entre o controlador/operador de dados, os titulares dos dados e a Autoridade Nacional de Proteção de Dados. Suas competências, aqui estabelecidas de modo exemplificativo, eis que poderão abarcar situações diversas do dia a dia, são:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Aceitar reclamações e comunicações dos titulares, prestar esclarecimentos e adotar providências;</li>
                <li>Receber comunicações da Autoridade Nacional e adotar providências;</li>
                <li>Orientar os colaboradores e os contratados da empresa a respeito das práticas a serem tomadas em relação à proteção de dados pessoais;</li>
                <li>Apoiar a definição das diretrizes de construção do inventário de dados pessoais relativas ao registro das operações de tratamento de dados pessoais inclusive aqueles pautados no legítimo interesse;</li>
                <li>Conduzir ou aconselhar a elaboração de relatório de impacto à proteção de dados pessoais, de acordo com os casos em que tal documento é necessário;</li>
                <li>Conduzir ou aconselhar a implementação de regras de boas práticas e de governança;</li>
                <li>Executar as demais atribuições determinadas pelo controlador ou estabelecidas em normas complementares.</li>
              </ul>
              <p>
                O encarregado possui independência para determinar a aplicação de recursos e as ações necessárias, bem como o pronto apoio das unidades administrativas no atendimento das solicitações de informações em relação às operações de tratamento de dados pessoais.
              </p>
              <p>
                Além disso, possui amplo acesso à estrutura organizacional, permissão de investigação proativa dos níveis de conformidade e é quem instrui os responsáveis pelos riscos a corrigir as lacunas encontradas.
              </p>
              <p>
                A MAXISTALKS, nesse sentido, registra que nomeou o e-mail{' '}
                <a href="mailto:contato@maxistalks.com" className="text-white hover:text-neutral-300 underline">
                  contato@maxistalks.com
                </a>{' '}
                como canal de contato com a equipe de Data Protection Officer – DPO, sendo o seu Encarregado pelo tratamento dos dados pessoais, que estará sempre à disposição de todos os colaboradores para auxiliar, instruir e regularizar os procedimentos da Companhia no sentido da mais íntegra conformidade com a Lei Geral de Proteção de Dados.
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-8 mb-3">
                Construção e execução
              </h3>
              <p>
                O presente Programa de Governança em Privacidade é projetado para proteger os direitos do cidadão em relação à privacidade da informação e foi desenvolvido em observância à legislação pertinente, sendo fundado em três pilares:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Gerenciamento de direitos individuais</strong>: a MAXISTALKS deve estar preparada para receber, realizar a triagem e responder consultas ou reclamações, pois estará sujeita a penalidades por não responder de maneira oportuna os referidos questionamentos.
                </li>
                <li>
                  <strong>Consentimento e rastreamento de preferência</strong>: a MAXISTALKS reconhece que os cidadãos querem saber se suas preferências estão sendo honradas, por isso, é dever de todos colher o consentimento e reduzir a probabilidade de problemas, aumentando, portanto, a confiança das pessoas envolvidas.
                </li>
                <li>
                  <strong>Redução de responsabilidade por violação</strong>: a MAXISTALKS se compromete a reduzir a exposição do seu risco, por isso, está ciente de que os dados devem ser mantidos apenas para sua finalidade, incluindo o legítimo interesse da Companhia.
                </li>
              </ul>
              <p>
                A implementação do presente Programa estará afeta a todas as áreas da empresa, isto é, à Operação, ao Administrativo-Financeiro, à Tecnologia e Informação, ao Marketing e demais prestadores e colaboradores, internos ou não, que manipulem dados pessoais.
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-8 mb-3">
                Políticas e práticas para proteção da privacidade
              </h3>
              <p>
                Todos os dados pessoais são conhecidos e adequados de acordo com as leis, bem como protegidos contra mau uso ou revelação indevida ou deliberada. Nesse sentido, a MAXISTALKS restringe o acesso aos dados pessoais através dos seguintes procedimentos:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>chaves individuais de acesso ao sistema;</li>
                <li>autenticação para acesso ao seu sistema;</li>
                <li>segregação de servidores apenas àqueles efetivamente autorizados;</li>
                <li>disponibilização a seus colaboradores apenas dos dados indispensáveis à prestação do serviço;</li>
                <li>reforço da criptografia dos dados e das comunicações;</li>
                <li>mapeamento de tráfego;</li>
                <li>controle de acesso aos arquivos físicos;</li>
                <li>exclusão dos dados após o exaurimento da finalidade, ressalvado o legítimo interesse.</li>
              </ul>
              <p>
                Na governança interna da segurança dos dados pessoais, além de procedimentos instituídos, a MAXISTALKS possui canal de comunicação anônima para realização de denúncias, o que converge com os pilares do compliance no estímulo de boas práticas.
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-8 mb-3">
                Relatório de Impacto à Proteção de Dados Pessoais (RIPD)
              </h3>
              <p>
                A MAXISTALKS redigiu e atualizará periodicamente o seu Relatório de Impacto à Proteção de Dados Pessoais, consoante Mapeamento de Fluxo de Dados, que representa um instrumento importante de verificação e demonstração da conformidade do tratamento de dados pessoais realizado.
              </p>
              <p>
                Serve tanto para a análise quanto para a documentação do tratamento dos dados pessoais. O RIPD visa descrever os processos de tratamento de dados pessoais que podem gerar riscos às liberdades civis e aos direitos fundamentais, bem como medidas, salvaguardas e mecanismos de mitigação de risco.
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-8 mb-3">
                Medidas e Políticas de Segurança e Privacidade
              </h3>
              <p>
                A MAXISTALKS revisou e atualizará periodicamente as suas diretrizes internas de proteção de dados pessoais, com o escopo de evitar o tratamento excessivo de dados, de certificar-se que os controles de segurança são suficientes para os dados tratados, de revisar os seus contratos.
              </p>
              <p>
                No âmbito interno, sem prejuízo dos procedimentos já adotados, a edição de Código de Conduta e Mapa de Fluxo de Dados compõe a Política de Segurança da Informação. No âmbito externo, o detalhamento dos serviços, com direitos e deveres, e os fins da coleta de dados constarão na Política de Privacidade e nos Instrumentos Contratuais firmados.
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-8 mb-3">
                Práticas de monitoramento
              </h3>
              <p>
                A MAXISTALKS acompanha continuamente a sua conformidade com a Lei nº 13.709/2018 – Lei Geral de Proteção de Dados Pessoais (LGPD), razão pela qual a coleta, o tratamento e a exclusão dos dados estão sujeitos a constante monitoramento, fundado em quatro procedimentos:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Indicadores de Performance;</li>
                <li>Gestão de Incidentes;</li>
                <li>Análise de Resultados;</li>
                <li>Reporte de Resultados.</li>
              </ul>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-8 mb-3">
                Indicadores de Performance
              </h3>
              <p>
                Os Indicadores de Performance (Key Performance Indicator - KPI) incluem a análise regular dos principais indicadores de desempenho para verificar lacunas no Programa de Governança em Privacidade. Sendo assim, a MAXISTALKS se utilizará dos indicadores abaixo indicados para assegurar níveis satisfatórios de segurança:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Índice de higidez (monitoramento e acompanhamento do número de incidentes de violação ou vazamento de dados pessoais);</li>
                <li>Índice de serviços com dados pessoais;</li>
                <li>Índice de serviços com Relatório de Impacto de Proteção de Dados já elaborados;</li>
                <li>Índice de conscientização em segurança (quantidade de treinamentos realizados e previstos);</li>
                <li>Índice de quantidade de controles de segurança e privacidade para determinado serviço.</li>
              </ul>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-8 mb-3">
                Gestão de Incidentes
              </h3>
              <p>
                Para a implementação de um coeso processo de Gestão de Incidentes, a MAXISTALKS registrará os incidentes de segurança da informação e de privacidade ocorridos e armazenará informações sobre o evento, tais como: a descrição dos incidentes ou eventos; as informações e sistemas envolvidos; as medidas técnicas e de segurança utilizadas para a proteção das informações; os riscos relacionados ao incidente e as medidas tomadas para mitigá-los a fim de evitar reincidências.
              </p>
              <p>
                No âmbito preventivo, a MAXISTALKS implementa e mantém controles e procedimentos específicos para detecção, tratamento, coleta/preservação de evidências e resposta a incidentes de segurança da informação e privacidade, notadamente almejando reduzir o nível de risco ao qual a Solução de TIC e/ou o órgão estão expostos, considerando os critérios de aceitabilidade de riscos mapeados.
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-8 mb-3">
                Análise e Reporte de Resultados
              </h3>
              <p>
                Para manutenção do nível de engajamento da alta administração, a MAXISTALKS optou por realizar análise e reporte de resultados, os quais mostram a evolução das ações e os resultados obtidos aos seus diretores e administradores.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
