// MaxisTalks
export const MAXISTALKS_DESCRIPTION =
  'Inscreva-se na lista de espera para as próximas edições do MaxisTalks'

// Legacy - Coffee Music (mantido para rotas antigas)
export const EVENT_NAME = "Coffee Music & Run — Edição BRIZZ"
export const EVENT_DATE = "13 de dezembro de 2025"
export const EVENT_TIME = "6h30 — 10h00"
export const EVENT_LOCATION_NAME = "BRIZZ"
export const EVENT_ADDRESS = "Rua Judith Maria Tovar Varejão, null - Enseada do Suá, Vitória, ES - 29050-360"
export const EVENT_ADDRESS_FOR_MAP = "Rua Judith Maria Tovar Varejão, Enseada do Suá, Vitória, ES"
export const EVENT_MAP_URL = "https://www.google.com/maps/search/?api=1&query=Rua+Judith+Maria+Tovar+Varejão,+Enseada+do+Suá,+Vitória,+ES"

export const TICKETS_URL = "https://zig.tickets/eventos/coffeemusic-and-brizz"
export const WHATSAPP_URL = "https://wa.me/55XXXXXXXXXXX?text=Quero%20meu%20ingresso%20Coffee%20Music"

export const FIRST_200_BONUS = true
export const GARMIN_RAFFLE_FOR_FIRST_200 = true

export const EVENT_DATE_ISO = new Date('2025-12-13T06:30:00').getTime()

export const EXPERIENCIA_ITEMS = [
  'Corrida + funcional (percursos de 5km e 7km)',
  'Desafio Strava + Gym Rats',
  'Cobertura fotográfica profissional',
  'Café, cappuccino e matchá + shot imunidade',
  'Água, frutas e sucos',
  'Pré e pós-treinos',
  'Sorteios exclusivos',
  'Yoga',
  'Música com DJ',
  'Massagem',
  'Brindes de patrocinadores',
  'Acesso ao grupo exclusivo no WhatsApp',
]

export const EXPERIENCIA_PLUS_ITEMS = [
  'Camisa oficial Coffee Music / Brizz',
  'Copo oficial Coffee Music (exclusivo para os 200 primeiros inscritos)',
  'Sorteio de um Garmin entre os 200 primeiros inscritos',
]

export const SCHEDULE = [
  { time: '6h', title: 'Coffee Party Mangalô', description: 'Início do evento com café e música', icon: '☕' },
  { time: '6h50', title: 'Warm Up Filho do Leão J3', description: 'Aquecimento e preparação para a corrida', icon: '🔥' },
  { time: '7h', title: 'Coffee, Music and Run', description: 'Corrida com música e café no percurso', icon: '🏃' },
  { time: '7h45', title: 'Slow Down and Yoga', description: 'Relaxa, respira e conecta corpo e mente', icon: '🧘' },
  { time: '8h', title: 'Games, Fruits, Shots and Juices', description: 'Momentos de diversão, frutas, shots e sucos', icon: '🍎' },
  { time: '8h45', title: 'Sorteios e premiações', description: 'Hora de sortear prêmios e brindes exclusivos!', icon: '🎁' },
  { time: '9h - 12h', title: 'Healthy Party Brizz', description: 'Festa saudável com música, dança e muita energia', icon: '🎵' },
]

export const FAQ_ITEMS = [
  {
    question: 'Como faço para retirar meu kit e camisa?',
    answerHtml: `
      <div class="space-y-4 text-sm md:text-base text-neutral-300 font-space leading-relaxed">
        <div class="space-y-2">
          <p>Para retirar seu kit e camisa, siga as orientações abaixo:</p>
          <div class="flex items-start gap-3">
            <span class="text-2xl" role="img" aria-hidden="true">👕</span>
            <div class="space-y-1">
              <p class="text-neutral-100 font-semibold">Retirada de Camisas</p>
              <p>Local: Mangalô</p>
              <p>Datas: Quinta (11/12) e Sexta (12/12)</p>
              <p>Horário: 8h às 18h</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <span class="text-2xl" role="img" aria-hidden="true">📍</span>
            <div class="space-y-1">
              <p class="text-neutral-100 font-semibold">Entrega de Kits no Dia do Evento</p>
              <p>Data: Sábado, 13/12</p>
              <p>Local: Brizz</p>
              <p>Horário: 6h às 9h</p>
            </div>
          </div>
        </div>
      </div>
    `,
  },
  {
    question: 'Qual o nível de dificuldade da corrida?',
    answer: 'A corrida é para todos os níveis! Oferecemos percursos de 5km e 7km. Você pode correr, caminhar ou fazer o percurso no seu ritmo. O importante é participar e se divertir!',
  },
  {
    question: 'Crianças podem participar?',
    answer: 'Permitida a entrada apenas para maiores de 18 anos. Crianças não são permitidas.',
  },
  {
    question: 'O que acontece em caso de chuva?',
    answer: 'O evento acontece mesmo com chuva leve. Em caso de condições climáticas extremas, comunicaremos o adiamento com antecedência através das redes sociais e WhatsApp.',
  },
  {
    question: 'Posso cancelar e receber reembolso?',
    answer: 'O reembolso é realizado diretamente pela ticketeria, conforme as políticas da própria Zig.',
  },
  {
    question: 'Preciso estar em boa forma física para participar?',
    answer: 'Não! O evento é pensado para todos os níveis. Você pode participar no seu ritmo, seja correndo, caminhando ou apenas aproveitando o café e a música.',
  },
]

