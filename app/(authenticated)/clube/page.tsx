import { getEvents, getArticles } from '@/lib/queries'
import { type DestaqueCard } from './HighlightCardList'
import { ClubClient } from './ClubClient'

const destaqueCards: DestaqueCard[] = [
  {
    id: 'cupons-parceiros',
    titulo: 'Cupons exclusivos',
    descricao: 'Aproveite códigos especiais em marcas parceiras para membros.',
    icone: 'ticket',
    status: 'ativo',
    ctaLabel: 'Copiar código',
    ctaType: 'copy',
    code: 'MAXISTALKS10',
  },
  {
    id: 'aula-experimental',
    titulo: 'Palestra experimental',
    descricao: 'Conheça a comunidade em uma palestra de boas-vindas para novos membros.',
    icone: 'mic',
    status: 'ativo',
    ctaLabel: 'Agendar',
    ctaType: 'link',
    href: '/eventos?tipo=experimental',
  },
  {
    id: 'experiencia-exclusiva',
    titulo: 'Experiência exclusiva',
    descricao: 'Vivências imersivas com palestrantes e especialistas em temas inspiradores.',
    icone: 'sparkles',
    status: 'ativo',
    ctaLabel: 'Saiba mais',
    ctaType: 'link',
    href: '/eventos',
  },
  {
    id: 'evento-exclusivo',
    titulo: 'Evento exclusivo',
    descricao: 'Encontros especiais para fortalecer a comunidade e celebrar conquistas.',
    icone: 'partyPopper',
    status: 'ativo',
    ctaLabel: 'Participar',
    ctaType: 'link',
    href: '/eventos',
  },
]

export default async function ClubePage() {
  const [eventos, artigosComunidade] = await Promise.all([
    getEvents(),
    getArticles('comunidade'),
  ])
  const proximoEvento = eventos[0]

  const cards = destaqueCards.map((card) => {
          if (card.id === 'evento-exclusivo' && proximoEvento) {
            return {
              ...card,
              descricao: `Próximo encontro: ${proximoEvento.titulo}`,
            }
          }
          return card
  })

  const proximoEventoDesc = proximoEvento
            ? `Próximo encontro: ${proximoEvento.titulo} • ${new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })
                .format(new Date(proximoEvento.data_horario))
                .replace('.', '')} • ${proximoEvento.local_nome}`
    : null

  return (
    <ClubClient
      cards={cards}
      proximoEventoDesc={proximoEventoDesc}
      artigosComunidade={artigosComunidade}
    />
  )
}


