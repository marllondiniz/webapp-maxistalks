import type { Metadata } from 'next'
import { Header } from '../(components)/Header'
import { Footer } from '../(components)/Footer'

export const metadata: Metadata = {
  title: 'Política de Privacidade — Coffee Music & Run',
  description: 'Política de privacidade do Coffee Music & Run',
}

export default function PoliticaPrivacidadePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-neutral-100 mb-8">
            Política de Privacidade
          </h1>
          
          <div className="prose prose-invert max-w-none text-neutral-300 font-space space-y-6">
            <p className="text-neutral-400 text-sm">
              Última atualização: 05 de novembro de 2025
            </p>

            <p className="text-lg text-neutral-200 mb-6">
              Confira abaixo como cuidamos dos seus dados pessoais. Nosso compromisso é com a sua segurança, transparência e confiança.
            </p>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                1. Quem somos
              </h2>
              <p>
                O RITMO CERTO CLUB é uma empresa especializada na promoção de eventos na área de bem-estar, wellness e fitness. Para oferecer nossos serviços, produtos e garantir segurança nas inscrições e compras, precisamos coletar e tratar alguns dados pessoais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                2. Quais dados coletamos
              </h2>
              <p>Podemos coletar:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Nome completo e CPF;</li>
                <li>Telefone, e-mail e endereço;</li>
                <li>Informações de pagamento (comprovantes, dados do cartão ou transferência);</li>
                <li>Documentos adicionais em casos de conferência antifraude (RG, selfie com cartão, comprovante de endereço, declaração assinada).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                3. Como usamos seus dados
              </h2>
              <p>
                Nossas práticas seguem os princípios da Lei Geral de Proteção de Dados (13.709/18). Utilizamos seus dados para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Confirmar sua identidade e proteger contra fraudes;</li>
                <li>Processar e concluir suas compras;</li>
                <li>Emitir notas fiscais e cumprir obrigações legais;</li>
                <li>Entrar em contato sobre pedidos, entregas, trocas, agendamentos e cancelamento de eventos;</li>
                <li>Atender solicitações de devolução, cancelamento ou suporte.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                4. Com quem podemos compartilhar
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Instituições financeiras e operadoras de pagamento:</strong> para processar transações.</li>
                <li><strong>Órgãos públicos:</strong> quando houver obrigação legal.</li>
                <li><strong>Colaboradores autorizados da Ritmo Certo Club:</strong> apenas os que precisam para concluir a venda.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                5. Armazenamento e segurança dos dados
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Os dados são guardados em ambiente seguro e com acesso restrito.</li>
                <li>Adotamos medidas para evitar acessos não autorizados.</li>
                <li>Os documentos não podem ser armazenados em celulares ou e-mails pessoais.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                6. Por quanto tempo guardamos os dados
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Guardamos seus dados somente pelo tempo necessário para cumprir obrigações legais e dar segurança às transações.</li>
                <li>O prazo máximo é de 5 anos, considerando prazos de defesa em processos.</li>
                <li>Após esse período, os dados são excluídos de forma segura.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                7. Seus direitos como cliente
              </h2>
              <p>Você pode, a qualquer momento:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Confirmar se tratamos seus dados;</li>
                <li>Solicitar cópia ou correção de informações;</li>
                <li>Pedir exclusão de dados, quando permitido por lei;</li>
                <li>Limitar ou contestar o uso dos dados.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                8. Cookies e tecnologias de navegação
              </h2>
              <p>
                O MaxisTalks utiliza cookies para melhorar a experiência do usuário, analisar o tráfego e personalizar conteúdos.
              </p>
              
              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                Tipos de cookies utilizados:
              </h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Essenciais:</strong> garantem o funcionamento básico da plataforma.</li>
                <li><strong>Analíticos:</strong> coletam dados de uso (Google Analytics, Meta Pixel, Hotjar).</li>
                <li><strong>Funcionais:</strong> armazenam preferências e configurações.</li>
                <li><strong>Marketing:</strong> medem desempenho de campanhas e anúncios.</li>
              </ul>
              
              <p className="mb-2">
                Ao acessar o site pela primeira vez, o usuário visualizará o banner de consentimento de cookies, podendo aceitar, rejeitar ou gerenciar preferências. É possível desativar cookies a qualquer momento nas configurações do navegador, ciente de que certas funções podem deixar de funcionar corretamente.
              </p>
              
              <p>
                Os cookies não coletam informações sensíveis como senha ou número de cartão.
              </p>
              
              <p className="mt-4">
                Para mais informações sobre cookies, consulte nossa{' '}
                <a href="/cookies" className="text-white hover:text-neutral-300 underline">
                  Política de Cookies
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                9. Alterações desta política
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Podemos atualizar esta Política de Privacidade para atender novas exigências legais ou melhorias internas.</li>
                <li>Sempre informaremos nos nossos canais oficiais quando houver mudanças.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                10. Disposições gerais
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Tratamos seus dados para concluir sua compra e prevenir fraudes, conforme a Lei Geral de Proteção de Dados.</li>
                <li>Não armazenamos o número completo do seu cartão em nossos sistemas. O processamento é feito pelas empresas de pagamento parceiras.</li>
                <li>Nunca vendemos ou cedemos seus dados a terceiros para fins comerciais.</li>
                <li>Se você pedir a exclusão dos dados, vamos avaliar se precisamos manter os dados por obrigação legal; se não for o caso, excluiremos e avisaremos você.</li>
                <li>Para exercer seus direitos, envie um e-mail para{' '}
                  <a href="mailto:victormezadri@hotmail.com" className="text-white hover:text-neutral-300 underline">
                    victormezadri@hotmail.com
                  </a>. Nós responderemos em até 10 dias.
                </li>
                <li>Em caso de incidente de segurança que possa trazer risco, informaremos você e, quando necessário, as autoridades.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                11. Fale conosco
              </h2>
              <p>
                E-mail:{' '}
                <a href="mailto:victormezadri@hotmail.com" className="text-white hover:text-neutral-300 underline">
                  victormezadri@hotmail.com
                </a>
              </p>
              <p className="mt-2">
                Instagram:{' '}
                <a href="https://www.instagram.com/maxisplus" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 underline">
                  @maxisplus
                </a>
              </p>
              <p className="mt-2">
                Endereço: RUA ALUYSIO SIMÕES, Nº 338, CEP: 29050-632, Vitória - ES
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

