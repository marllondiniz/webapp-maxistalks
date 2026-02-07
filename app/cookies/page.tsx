import type { Metadata } from 'next'
import { Header } from '../(components)/Header'
import { Footer } from '../(components)/Footer'

export const metadata: Metadata = {
  title: 'Política de Cookies — MaxisTalks',
  description: 'Política de cookies do MaxisTalks',
}

export default function CookiesPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-neutral-100 mb-8">
            Política de Cookies
          </h1>
          
          <div className="prose prose-invert max-w-none text-neutral-300 font-space space-y-6">
            <p className="text-neutral-400 text-sm">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                1. O que são Cookies?
              </h2>
              <p>
                Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo (computador, tablet ou celular) quando você visita um site. Eles são amplamente utilizados para fazer com que os sites funcionem de forma mais eficiente, bem como para fornecer informações aos proprietários do site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                2. Como Utilizamos Cookies
              </h2>
              <p>
                O MaxisTalks utiliza cookies para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Garantir o funcionamento adequado do site</li>
                <li>Melhorar a experiência do usuário</li>
                <li>Analisar como os visitantes utilizam nosso site</li>
                <li>Personalizar conteúdo e anúncios</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                3. Tipos de Cookies que Utilizamos
              </h2>
              
              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                3.1 Cookies Essenciais
              </h3>
              <p>
                Estes cookies são necessários para o funcionamento do site e não podem ser desativados. Eles geralmente são definidos apenas em resposta a ações feitas por você, como definir suas preferências de privacidade, fazer login ou preencher formulários.
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                3.2 Cookies de Análise
              </h3>
              <p>
                Estes cookies nos permitem contar visitas e fontes de tráfego para que possamos medir e melhorar o desempenho do nosso site. Eles nos ajudam a saber quais páginas são mais e menos populares e ver como os visitantes se movem pelo site.
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                3.3 Cookies de Funcionalidade
              </h3>
              <p>
                Estes cookies permitem que o site forneça funcionalidade e personalização aprimoradas. Podem ser definidos por nós ou por fornecedores terceirizados cujos serviços adicionamos às nossas páginas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                4. Cookies de Terceiros
              </h2>
              <p>
                Alguns cookies são colocados por serviços de terceiros que aparecem em nossas páginas. Não temos controle sobre esses cookies. Você deve verificar os sites de terceiros para obter mais informações sobre esses cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                5. Como Gerenciar Cookies
              </h2>
              <p>
                Você pode controlar e/ou excluir cookies conforme desejar. Você pode excluir todos os cookies que já estão no seu computador e pode configurar a maioria dos navegadores para impedir que sejam colocados. No entanto, se você fizer isso, pode ter que ajustar manualmente algumas preferências toda vez que visitar um site e alguns serviços e funcionalidades podem não funcionar.
              </p>
              <p className="mt-4">
                Para mais informações sobre como gerenciar cookies em diferentes navegadores, visite:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/pt-BR/kb/ativar-e-desativar-cookies-websites-rastreiam-preferencias" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 underline">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 underline">Safari</a></li>
                <li><a href="https://support.microsoft.com/pt-br/microsoft-edge/excluir-cookies-no-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 underline">Microsoft Edge</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                6. Alterações nesta Política
              </h2>
              <p>
                Podemos atualizar esta Política de Cookies periodicamente. Recomendamos que você revise esta página regularmente para se manter informado sobre como utilizamos cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                7. Contato
              </h2>
              <p>
                Se você tiver dúvidas sobre nossa Política de Cookies, entre em contato conosco através do nosso Instagram{' '}
                <a href="https://www.instagram.com/maxisplus" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 underline">
                  @maxisplus
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

