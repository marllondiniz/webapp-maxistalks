import type { Metadata } from 'next'
import { Header } from '../(components)/Header'
import { Footer } from '../(components)/Footer'

export const metadata: Metadata = {
  title: 'Política de Privacidade — MaxisTalks',
  description: 'Política de privacidade do MaxisTalks',
}

export default function PoliticaPrivacidadePage() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <Header />
      <div className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-neutral-100 mb-8">
            Política de Privacidade
          </h1>
          
          <div className="prose prose-invert max-w-none text-neutral-300 font-space space-y-6">
            <p className="text-neutral-400 text-sm">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <p className="text-lg text-neutral-200 mb-6">
              Confira abaixo como cuidamos dos seus dados pessoais. Nosso compromisso é com a sua segurança, transparência e confiança.
            </p>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                1. Quem somos
              </h2>
              <p>
                O MaxisTalks é uma plataforma que promove palestras presenciais com experts que compartilham estratégias reais para escalar no digital. Para oferecer nossos serviços, inscrições em eventos e garantir sua experiência, precisamos coletar e tratar alguns dados pessoais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                2. Quais dados coletamos
              </h2>
              <p>Podemos coletar:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Nome completo e e-mail;</li>
                <li>Telefone e endereço;</li>
                <li>Informações de perfil (foto, bio, redes sociais);</li>
                <li>Dados de inscrição em eventos;</li>
                <li>Informações de pagamento (quando aplicável) processadas por parceiros.</li>
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
                <li>Confirmar sua identidade e acesso à plataforma;</li>
                <li>Processar inscrições em eventos e palestras;</li>
                <li>Enviar comunicações sobre eventos, novidades e confirmações;</li>
                <li>Melhorar a experiência do usuário na plataforma;</li>
                <li>Atender solicitações de suporte e dúvidas.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                4. Com quem podemos compartilhar
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Operadores de pagamento:</strong> para processar transações de inscrições.</li>
                <li><strong>Órgãos públicos:</strong> quando houver obrigação legal.</li>
                <li><strong>Colaboradores autorizados do MaxisTalks:</strong> apenas os que precisam para realizar o serviço.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                5. Armazenamento e segurança dos dados
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Os dados são guardados em ambiente seguro e com acesso restrito.</li>
                <li>Adotamos medidas técnicas para evitar acessos não autorizados.</li>
                <li>Utilizamos serviços de infraestrutura confiáveis para proteção dos dados.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                6. Por quanto tempo guardamos os dados
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Guardamos seus dados somente pelo tempo necessário para cumprir obrigações legais e prestar nossos serviços.</li>
                <li>Após o período necessário, os dados podem ser excluídos ou anonimizados.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                7. Seus direitos
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
                <li><strong>Essenciais:</strong> garantem o funcionamento básico da plataforma e autenticação.</li>
                <li><strong>Analíticos:</strong> coletam dados de uso para melhorar o site.</li>
                <li><strong>Funcionais:</strong> armazenam preferências e configurações.</li>
              </ul>
              
              <p className="mb-2">
                Ao acessar o site pela primeira vez, o usuário visualizará o banner de consentimento de cookies, podendo aceitar ou rejeitar. É possível desativar cookies nas configurações do navegador, ciente de que certas funções podem deixar de funcionar.
              </p>
              
              <p>
                Os cookies não coletam informações sensíveis como senha ou dados de pagamento completos.
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
                10. Fale conosco
              </h2>
              <p>
                E-mail:{' '}
                <a href="mailto:contato@maxistalks.com" className="text-white hover:text-neutral-300 underline">
                  contato@maxistalks.com
                </a>
              </p>
              <p className="mt-2">
                Instagram:{' '}
                <a href="https://www.instagram.com/maxisplus" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 underline">
                  @maxisplus
                </a>
              </p>
              <p className="mt-2">
                Endereço: Rua Aluysio Simões, nº 338, CEP 29050-632, Vitória - ES
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
