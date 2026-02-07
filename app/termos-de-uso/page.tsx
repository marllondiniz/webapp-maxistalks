import type { Metadata } from 'next'
import { Header } from '../(components)/Header'
import { Footer } from '../(components)/Footer'

export const metadata: Metadata = {
  title: 'Termos de Uso — MaxisTalks',
  description: 'Termos de uso do MaxisTalks',
}

export default function TermosUsoPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-neutral-100 mb-8">
            Termos de Uso
          </h1>
          
          <div className="prose prose-invert max-w-none text-neutral-300 font-space space-y-6">
            <p className="text-neutral-400 text-sm">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                1. Aceitação dos Termos
              </h2>
              <p>
                Ao acessar e utilizar o site do Coffee Music & Run, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve utilizar nosso site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                2. Uso do Site
              </h2>
              <p>Você concorda em utilizar nosso site apenas para fins legais e de acordo com estes Termos de Uso. Você não deve:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Utilizar o site de forma que viole qualquer lei ou regulamento</li>
                <li>Tentar obter acesso não autorizado ao site ou sistemas relacionados</li>
                <li>Interferir ou interromper o funcionamento do site</li>
                <li>Transmitir qualquer vírus ou código malicioso</li>
                <li>Copiar, modificar ou distribuir conteúdo sem autorização</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                3. Inscrições e Pagamentos
              </h2>
              
              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                3.1 Processo de Inscrição
              </h3>
              <p>
                Ao se inscrever em nossos eventos, você concorda em fornecer informações precisas e completas. É sua responsabilidade manter suas informações atualizadas.
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                3.2 Pagamentos
              </h3>
              <p>
                Os pagamentos são processados por terceiros seguros. Não armazenamos informações completas de cartão de crédito. Você é responsável por garantir que possui fundos suficientes ou crédito disponível para completar a transação.
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                3.3 Política de Reembolso
              </h3>
              <p>
                Reembolsos são aceitos até 7 dias antes do evento. Após esse período, não serão realizados reembolsos, exceto em casos de cancelamento do evento por parte da organização. Para solicitar reembolso, entre em contato através do nosso Instagram.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                4. Propriedade Intelectual
              </h2>
              <p>
                Todo o conteúdo do site, incluindo textos, gráficos, logotipos, ícones, imagens e software, é propriedade do Coffee Music & Run ou de seus fornecedores de conteúdo e está protegido por leis de direitos autorais e outras leis de propriedade intelectual.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                5. Isenção de Responsabilidade
              </h2>
              <p>
                O Coffee Music & Run não se responsabiliza por:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Interrupções ou erros no funcionamento do site</li>
                <li>Perda de dados ou informações</li>
                <li>Danos resultantes do uso ou incapacidade de usar o site</li>
                <li>Ações de terceiros, incluindo provedores de serviços de pagamento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                6. Limitação de Responsabilidade
              </h2>
              <p>
                Na máxima extensão permitida por lei, o Coffee Music & Run não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos resultantes do uso ou incapacidade de usar o site ou serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                7. Participação no Evento
              </h2>
              <p>
                Ao participar de nossos eventos, você concorda em:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Seguir todas as regras e regulamentos do evento</li>
                <li>Respeitar outros participantes e funcionários</li>
                <li>Assumir responsabilidade por sua própria segurança e bem-estar</li>
                <li>Autorizar o uso de sua imagem em fotografias e vídeos do evento para fins promocionais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                8. Termo de Cessão de Uso de Imagem e Voz
              </h2>
              
              <p className="mb-4">
                Pelo presente Termo de Cessão de Uso de Imagem e Voz, o participante do evento, doravante denominado(a) <strong>CEDENTE</strong>, autoriza a <strong>MEZADRI PRODUCOES LTDA</strong>, pessoa jurídica de direito privado, inscrita no CNPJ sob nº 57.349.677/0001-57, com sede em RUA ALUYSIO SIMÕES, Nº 338, CEP: 29050632, doravante denominada <strong>CESSIONÁRIA</strong>, a utilizar sua imagem e voz, nos termos e condições estabelecidos nas cláusulas a seguir:
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                8.1 Objeto
              </h3>
              <p className="mb-2">
                8.1.1. O presente instrumento tem por objeto a cessão total, definitiva, irrevogável e irretratável, pelo CEDENTE à CESSIONÁRIA, a título gratuito, dos direitos de uso de sua imagem, voz, nome e demais atributos de personalidade, captados por meio de vídeos, áudios e/ou fotografias produzidos no contexto das atividades desenvolvidas ou promovidas pela CESSIONÁRIA.
              </p>
              <p className="mb-4">
                8.1.2. O conteúdo será utilizado, sem limitação de tempo ou território, para fins comerciais, educacionais, institucionais e publicitários, incluindo, mas não se limitando a cursos, treinamentos, aulas, podcasts, vídeos promocionais, campanhas publicitárias on-line e off-line, redes sociais, plataformas de streaming, websites, materiais impressos e quaisquer outros meios físicos ou digitais, presentes ou futuros.
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                8.2 Abrangência e Direitos Concedidos
              </h3>
              <p className="mb-2">
                8.2.1. A cessão ora firmada autoriza expressamente a CESSIONÁRIA a:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Usar, editar, adaptar, reproduzir, cortar, compor, montar, adicionar legendas, trilhas e elementos gráficos;</li>
                <li>Publicar, divulgar, comercializar, monetizar, distribuir, licenciar e exibir o conteúdo, com ou sem fins lucrativos;</li>
                <li>Incorporar o material a outros conteúdos, inclusive produzidos por terceiros;</li>
                <li>Sublicenciar ou ceder os direitos a parceiros, afiliados, patrocinadores e franqueados, para os mesmos fins aqui previstos;</li>
                <li>Utilizar o conteúdo em campanhas publicitárias pagas, remarketing, anúncios patrocinados, banners, outdoors, folders e qualquer outro meio promocional.</li>
              </ul>
              <p className="mb-2">
                8.2.2. A presente cessão é feita a título gratuito, e não haverá qualquer outro pagamento, participação em lucros ou compensação adicional em razão da utilização, monetização ou exploração do conteúdo, salvo se houver contrato escrito, autônomo e assinado por ambas as partes, com previsão expressa de remuneração.
              </p>
              <p className="mb-4">
                8.2.3. O CEDENTE renuncia, nos limites da lei, aos direitos morais sobre o conteúdo, não podendo exigir alterações ou restrições à edição, desde que respeitados a boa-fé e o contexto original.
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                8.3 Irrevogabilidade e Manutenção do Uso
              </h3>
              <p className="mb-2">
                8.3.1. A presente cessão é firmada em caráter definitivo e não poderá ser revogada ou rescindida unilateralmente pelo CEDENTE, salvo por motivo justificado, devidamente fundamentado e relacionado ao descumprimento deste instrumento.
              </p>
              <p className="mb-2">
                8.3.2. É assegurado ao CEDENTE o direito de solicitar a interrupção do uso futuro de sua imagem, mediante justificativa relevante, sem prejuízo da permanência dos conteúdos já produzidos ou publicados.
              </p>
              <p className="mb-4">
                8.3.3. Ainda que haja término da relação contratual ou pedido formal de encerramento, a CESSIONÁRIA manterá o direito de uso de todos os conteúdos já produzidos ou publicados, em quaisquer meios.
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                8.4 Declarações e Garantias do Cedente
              </h3>
              <p className="mb-2">
                8.4.1. O CEDENTE declara, sob as penas da lei, que:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>É o legítimo titular dos direitos ora cedidos;</li>
                <li>Não há impedimentos para a presente cessão;</li>
                <li>O conteúdo cedido não infringe direitos de terceiros;</li>
                <li>Assume responsabilidade por quaisquer reivindicações de terceiros relativas ao uso de sua imagem, voz ou nome;</li>
                <li>Não poderá ceder o mesmo material a terceiros para uso concorrente ou que prejudique a exploração comercial do conteúdo pela CESSIONÁRIA, projetos com finalidade idêntica ou que concorram diretamente com a exploração da CESSIONÁRIA.</li>
              </ul>
              <p className="mb-2">
                8.4.2. Entende-se como uso concorrente aquele que envolva conteúdos similares com empresas ou plataformas que atuem diretamente na produção e comercialização de cursos ou materiais digitais com temas idênticos aos da CESSIONÁRIA.
              </p>
              <p className="mb-4">
                8.4.3. O CEDENTE indenizará a CESSIONÁRIA por quaisquer prejuízos, custos ou despesas decorrentes de informações falsas, violação de direitos de terceiros ou revogação indevida.
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                8.5 Proteção de Dados (LGPD)
              </h3>
              <p className="mb-2">
                8.5.1. O CEDENTE autoriza, de forma livre, informada e inequívoca, o tratamento de seus dados pessoais pela CESSIONÁRIA, nos termos da Lei nº 13.709/2018, para execução deste contrato, incluindo nome, imagem, voz, dados de identificação e demais informações fornecidas.
              </p>
              <p className="mb-2">
                8.5.2. O tratamento abrangerá coleta, armazenamento, edição, utilização, compartilhamento, publicação e arquivamento, inclusive com parceiros comerciais, desde que para os fins aqui previstos.
              </p>
              <p className="mb-4">
                8.5.3. Para assuntos relacionados aos seus dados pessoais como solicitar acesso, correção, atualização, limitação, exclusão ou outras informações previstas na Lei nº 13.709/2018, o CEDENTE poderá entrar em contato com a CESSIONÁRIA pelo e-mail:{' '}
                <a href="mailto:victormezadri@hotmail.com" className="text-white hover:text-neutral-300 underline">
                  victormezadri@hotmail.com
                </a>.
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                8.6 Ausência de Vínculo
              </h3>
              <p className="mb-4">
                8.6.1. Este Termo não estabelece vínculo empregatício, societário, associativo ou de subordinação entre as partes, sendo a relação estritamente de natureza civil.
              </p>

              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                8.7 Disposições Finais
              </h3>
              <p className="mb-2">
                8.7.1. A tolerância de qualquer das partes quanto ao descumprimento de obrigação não implica novação ou renúncia de direito.
              </p>
              <p className="mb-2">
                8.7.2. O presente instrumento obriga as partes e seus sucessores, sendo celebrado em caráter irrevogável e irretratável.
              </p>
              <p className="mb-2">
                8.7.3. A presente cessão abrange todas as participações do CEDENTE em produções futuras da CESSIONÁRIA, enquanto vigente.
              </p>
              <p className="mb-4">
                8.7.4. Este Termo poderá ser firmado eletronicamente, com ou sem a utilização de certificado digital emitido no padrão estabelecido pela ICP-Brasil, sendo considerado como plenamente válido em todo o seu conteúdo após as assinaturas eletrônicas das Partes, que por sua vez reconhecem a integridade e autenticidade do documento digital, garantidas por sistema de criptografia e pelas demais informações captadas no momento de coleta das assinaturas eletrônicas, em conformidade com o artigo 10, parágrafo segundo, da Medida Provisória 2200-2/2001.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                9. Modificações dos Termos
              </h2>
              <p>
                Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação no site. É sua responsabilidade revisar periodicamente estes termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                10. Lei Aplicável
              </h2>
              <p>
                Estes Termos de Uso são regidos pelas leis do Brasil. Qualquer disputa relacionada a estes termos será resolvida nos tribunais competentes do Brasil.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                11. Contato
              </h2>
              <p>
                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através do nosso Instagram{' '}
                <a href="https://www.instagram.com/coffeemusicand_/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 underline">
                  @coffeemusicand_
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

