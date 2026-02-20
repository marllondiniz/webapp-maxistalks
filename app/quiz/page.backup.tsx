'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '../(components)/Header'
import { Footer } from '../(components)/Footer'

export default function QuizPage() {
  const [answers, setAnswers] = useState<{ [key: number]: 'sim' | 'nao' | null }>({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
  })

  const [formData, setFormData] = useState({
    nome: '',
    data: '',
    assinatura: '',
    idade: '',
  })

  const [termoData, setTermoData] = useState({
    nome: '',
    data: '',
    assinatura: '',
    idade: '',
  })

  const today = new Date().toISOString().split('T')[0]

  const dateInputClasses =
    'w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-neutral-100 font-space focus:outline-none focus:border-white/30 appearance-none [color-scheme:dark]'

  const createInitialRunningData = () => ({
    runsFrequently: '',
    weeklyFrequency: '',
    runningExperience: '',
    longestDistance: '',
    hasRunningInjury: '',
    injuryDetails: '',
  })

  const [runningData, setRunningData] = useState(createInitialRunningData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [showThankYou, setShowThankYou] = useState(false)

  const quizTopRef = useRef<HTMLDivElement | null>(null)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasYesAnswer = Object.values(answers).some(answer => answer === 'sim')

  const handleAnswer = (question: number, answer: 'sim' | 'nao') => {
    setAnswers(prev => ({ ...prev, [question]: answer }))
  }

  const allAnswered = Object.values(answers).every(answer => answer !== null)

  const runsFrequentlyAnswered = runningData.runsFrequently !== ''
  const weeklyFrequencyAnswered = runningData.runsFrequently === 'nao' ? true : runningData.weeklyFrequency !== ''
  const runningExperienceAnswered = runningData.runningExperience !== ''
  const longestDistanceAnswered = runningData.longestDistance !== ''
  const injuryAnswered = runningData.hasRunningInjury !== ''
  const injuryDetailsAnswered =
    runningData.hasRunningInjury !== 'sim' ? true : runningData.injuryDetails.trim().length > 0

  const runningSectionComplete =
    runsFrequentlyAnswered &&
    weeklyFrequencyAnswered &&
    runningExperienceAnswered &&
    longestDistanceAnswered &&
    injuryAnswered &&
    injuryDetailsAnswered

  const weeklyFrequencyOptions = ['1x', '2-3x', '4x ou mais']
  const runningExperienceOptions = [
    'Estou começando agora',
    'Menos de 3 meses',
    'Entre 3 e 12 meses',
    'Entre 1 e 3 anos',
    'Mais de 3 anos',
  ]
  const longestDistanceOptions = ['5 km', '10 km', '15-21 km', '21-42 km', 'Mais de 42 km']

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  if (showThankYou) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-32 pb-20 px-6 md:px-12" ref={quizTopRef}>
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-neutral-900/60 border border-white/10 rounded-xl p-8 md:p-10 flex flex-col items-center text-center gap-6"
            >
              <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-neutral-100">
                Obrigado por preencher o questionário!
              </h1>
              <p className="text-neutral-300 font-space text-lg max-w-2xl">
                Acompanhe tudo que vai rolar no Maxis Talks
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  href="https://www.instagram.com/coffeemusicand_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-neutral-950 font-orbitron font-bold uppercase"
                >
                  👉 Seguir no Instagram
                </motion.a>
                <motion.a
                  href="/"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 text-neutral-200 font-orbitron font-bold uppercase"
                >
                  ← Voltar para Home
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const canSubmit = allAnswered && runningSectionComplete &&
    (hasYesAnswer 
      ? (termoData.nome && termoData.data && termoData.assinatura && termoData.idade)
      : (formData.nome && formData.data && formData.assinatura && formData.idade))

  const handleSubmit = async () => {
    if (!canSubmit) return

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')
    setShowThankYou(false)

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          formData: hasYesAnswer ? null : formData,
          termoData: hasYesAnswer ? termoData : null,
          hasYesAnswer,
          runningData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar quiz')
      }

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      setSubmitStatus('success')
      setSubmitMessage('Quiz salvo com sucesso!')
      setShowThankYou(true)

      if (typeof window !== 'undefined') {
        scrollTimeoutRef.current = setTimeout(() => {
          if (quizTopRef.current) {
            window.scrollTo({
              top: quizTopRef.current.offsetTop,
              behavior: 'smooth',
            })
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }, 6000)
      }
      
      // Limpar formulário após 3 segundos
      setTimeout(() => {
        setAnswers({
          1: null,
          2: null,
          3: null,
          4: null,
          5: null,
          6: null,
          7: null,
        })
        setFormData({
          nome: '',
          data: '',
          assinatura: '',
          idade: '',
        })
        setTermoData({
          nome: '',
          data: '',
          assinatura: '',
          idade: '',
        })
        setRunningData(createInitialRunningData())
        setSubmitStatus('idle')
        setSubmitMessage('')
      }, 3000)
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage(error instanceof Error ? error.message : 'Erro ao salvar quiz. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-32 pb-20 px-6 md:px-12" ref={quizTopRef}>
        <div className="max-w-4xl w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-neutral-100 mb-4 text-center md:text-left">
              Questionário de Prontidão para Atividade Física (PAR-Q)
            </h1>
            
                <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6 md:p-8 mb-8">
                  <p className="text-neutral-300 font-space leading-relaxed text-center md:text-left">
                Este questionário tem como objetivo identificar a necessidade de avaliação médica antes de iniciar atividade física. 
                Se você responder <strong className="text-white">"SIM"</strong> a uma ou mais perguntas, você deve consultar seu médico{' '}
                <strong className="text-white">ANTES</strong> de aumentar seu nível atual de atividade física. 
                Informe ao seu médico este questionário e quais perguntas você respondeu "SIM".
              </p>
            </div>

            <div className="space-y-8">
              {!showThankYou ? (
                <>
                  <section>
                <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mb-6 text-center md:text-left">
                  Por favor, assinale "SIM" ou "NÃO" às seguintes perguntas:
                </h2>

                <div className="space-y-6">
                  {[
                    {
                      id: 1,
                      question: 'Algum médico já disse que você possui algum problema de coração e que só deveria realizar atividade física supervisionado por profissionais de saúde?'
                    },
                    {
                      id: 2,
                      question: 'Você sente dores no peito quando pratica atividade física?'
                    },
                    {
                      id: 3,
                      question: 'No último mês, você sentiu dores no peito quando praticou atividade física?'
                    },
                    {
                      id: 4,
                      question: 'Você apresenta desequilíbrio devido à tontura e/ou perda de consciência?'
                    },
                    {
                      id: 5,
                      question: 'Você possui algum problema ósseo ou articular que poderia ser piorado pela atividade física?'
                    },
                    {
                      id: 6,
                      question: 'Você toma atualmente algum medicamento para pressão arterial e/ou problema de coração?'
                    },
                    {
                      id: 7,
                      question: 'Sabe de alguma outra razão pela qual você não deve praticar atividade física?'
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-neutral-900/50 border border-white/10 rounded-xl p-6"
                    >
                      <p className="text-neutral-200 font-space mb-4 text-center md:text-left">
                        <span className="font-bold text-white">{item.id}.</span> {item.question}
                      </p>
                      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <motion.button
                          onClick={() => handleAnswer(item.id, 'sim')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-6 py-3 rounded-lg font-orbitron font-bold text-sm uppercase transition-all ${
                            answers[item.id] === 'sim'
                              ? 'bg-red-600 text-white border-2 border-red-500'
                              : 'bg-neutral-800 text-neutral-300 border-2 border-white/20 hover:border-white/40'
                          }`}
                        >
                          Sim
                        </motion.button>
                        <motion.button
                          onClick={() => handleAnswer(item.id, 'nao')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-6 py-3 rounded-lg font-orbitron font-bold text-sm uppercase transition-all ${
                            answers[item.id] === 'nao'
                              ? 'bg-green-600 text-white border-2 border-green-500'
                              : 'bg-neutral-800 text-neutral-300 border-2 border-white/20 hover:border-white/40'
                          }`}
                        >
                          Não
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                  </section>

                  <section>
                <div className="flex flex-col items-center md:items-start gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-orbitron uppercase tracking-[0.3em] text-neutral-200">
                    Etapa 2
                  </span>
                  <h2 className="text-2xl font-orbitron font-bold text-neutral-100 text-center md:text-left">
                    Corrida e Performance
                  </h2>
                  <p className="text-neutral-400 font-space text-sm text-center md:text-left max-w-2xl">
                    Agora queremos saber mais sobre seu perfil de corrida. Responda para personalizarmos a experiência no Maxis Talks.
                  </p>
                </div>

                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-neutral-900/50 border border-white/10 rounded-xl p-6"
                  >
                    <p className="text-neutral-200 font-space mb-4 text-center md:text-left">
                      Você costuma correr com frequência?
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      <motion.button
                        onClick={() =>
                          setRunningData(prev => ({
                            ...prev,
                            runsFrequently: 'sim',
                            weeklyFrequency: prev.weeklyFrequency === 'Não se aplica' ? '' : prev.weeklyFrequency,
                          }))
                        }
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-3 rounded-lg font-orbitron font-bold text-sm uppercase transition-all ${
                          runningData.runsFrequently === 'sim'
                            ? 'bg-white text-neutral-950 border-2 border-white'
                            : 'bg-neutral-800 text-neutral-300 border-2 border-white/20 hover:border-white/40'
                        }`}
                      >
                        Sim
                      </motion.button>
                      <motion.button
                        onClick={() =>
                          setRunningData(prev => ({
                            ...prev,
                            runsFrequently: 'nao',
                            weeklyFrequency: 'Não se aplica',
                          }))
                        }
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-3 rounded-lg font-orbitron font-bold text-sm uppercase transition-all ${
                          runningData.runsFrequently === 'nao'
                            ? 'bg-white text-neutral-950 border-2 border-white'
                            : 'bg-neutral-800 text-neutral-300 border-2 border-white/20 hover:border-white/40'
                        }`}
                      >
                        Não
                      </motion.button>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="bg-neutral-900/50 border border-white/10 rounded-xl p-6"
                  >
                    <p className="text-neutral-200 font-space mb-4 text-center md:text-left">
                      Se sim, com que frequência semanal?
                    </p>
                    {runningData.runsFrequently !== 'sim' && (
                      <p className="text-neutral-400 font-space text-sm mb-4 text-center md:text-left">
                        Selecione "Sim" na pergunta anterior para habilitar estas opções.
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      {weeklyFrequencyOptions.map(option => (
                        <motion.button
                          key={option}
                          onClick={() =>
                            setRunningData(prev => ({
                              ...prev,
                              weeklyFrequency: option,
                            }))
                          }
                          whileHover={runningData.runsFrequently === 'sim' ? { scale: 1.05 } : {}}
                          whileTap={runningData.runsFrequently === 'sim' ? { scale: 0.95 } : {}}
                          disabled={runningData.runsFrequently !== 'sim'}
                          className={`px-6 py-3 rounded-lg font-orbitron font-bold text-sm uppercase transition-all ${
                            runningData.weeklyFrequency === option
                              ? 'bg-white text-neutral-950 border-2 border-white'
                              : 'bg-neutral-800 text-neutral-300 border-2 border-white/20 hover:border-white/40'
                          } ${runningData.runsFrequently !== 'sim' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-neutral-900/50 border border-white/10 rounded-xl p-6"
                  >
                    <p className="text-neutral-200 font-space mb-4 text-center md:text-left">
                      Há quanto tempo você pratica corrida de rua regularmente?
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      {runningExperienceOptions.map(option => (
                        <motion.button
                          key={option}
                          onClick={() =>
                            setRunningData(prev => ({
                              ...prev,
                              runningExperience: option,
                            }))
                          }
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-6 py-3 rounded-lg font-orbitron font-bold text-sm uppercase transition-all ${
                            runningData.runningExperience === option
                              ? 'bg-white text-neutral-950 border-2 border-white'
                              : 'bg-neutral-800 text-neutral-300 border-2 border-white/20 hover:border-white/40'
                          }`}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-neutral-900/50 border border-white/10 rounded-xl p-6"
                  >
                    <p className="text-neutral-200 font-space mb-4 text-center md:text-left">
                      Qual foi a maior distância que você já correu em uma prova ou treino contínuo?
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      {longestDistanceOptions.map(option => (
                        <motion.button
                          key={option}
                          onClick={() =>
                            setRunningData(prev => ({
                              ...prev,
                              longestDistance: option,
                            }))
                          }
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-6 py-3 rounded-lg font-orbitron font-bold text-sm uppercase transition-all ${
                            runningData.longestDistance === option
                              ? 'bg-white text-neutral-950 border-2 border-white'
                              : 'bg-neutral-800 text-neutral-300 border-2 border-white/20 hover:border-white/40'
                          }`}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="bg-neutral-900/50 border border-white/10 rounded-xl p-6"
                  >
                    <p className="text-neutral-200 font-space mb-4 text-center md:text-left">
                      Você tem alguma lesão recente ou recorrente relacionada à corrida (joelho, tornozelo, quadril, etc.)?
                    </p>
                    <div className="flex flex-wrap gap-4 mb-4 justify-center md:justify-start">
                      <motion.button
                        onClick={() =>
                          setRunningData(prev => ({
                            ...prev,
                            hasRunningInjury: 'sim',
                          }))
                        }
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-3 rounded-lg font-orbitron font-bold text-sm uppercase transition-all ${
                          runningData.hasRunningInjury === 'sim'
                            ? 'bg-red-600 text-white border-2 border-red-500'
                            : 'bg-neutral-800 text-neutral-300 border-2 border-white/20 hover:border-white/40'
                        }`}
                      >
                        Sim
                      </motion.button>
                      <motion.button
                        onClick={() =>
                          setRunningData(prev => ({
                            ...prev,
                            hasRunningInjury: 'nao',
                            injuryDetails: '',
                          }))
                        }
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-3 rounded-lg font-orbitron font-bold text-sm uppercase transition-all ${
                          runningData.hasRunningInjury === 'nao'
                            ? 'bg-green-600 text-white border-2 border-green-500'
                            : 'bg-neutral-800 text-neutral-300 border-2 border-white/20 hover:border-white/40'
                        }`}
                      >
                        Não
                      </motion.button>
                    </div>
                    {runningData.hasRunningInjury === 'sim' && (
                      <div>
                        <label className="block text-neutral-300 font-space mb-2 text-center md:text-left">
                          Se sim, qual?
                        </label>
                        <input
                          type="text"
                          value={runningData.injuryDetails}
                          onChange={(e) =>
                            setRunningData(prev => ({
                              ...prev,
                              injuryDetails: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-neutral-100 font-space focus:outline-none focus:border-white/30"
                          placeholder="Descreva sua lesão"
                        />
                      </div>
                    )}
                  </motion.div>
                </div>
                  </section>

                  {allAnswered && runningSectionComplete && !hasYesAnswer && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-neutral-900/50 border border-white/10 rounded-xl p-6 md:p-8"
                >
                  <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mb-6">
                    Dados Pessoais
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-neutral-300 font-space mb-2">
                          Nome completo *
                        </label>
                        <input
                          type="text"
                          value={formData.nome}
                          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                          className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-neutral-100 font-space focus:outline-none focus:border-white/30"
                          placeholder="Digite seu nome completo"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-300 font-space mb-2">
                          Idade *
                        </label>
                        <input
                          type="number"
                          value={formData.idade}
                          onChange={(e) => setFormData(prev => ({ ...prev, idade: e.target.value }))}
                          className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-neutral-100 font-space focus:outline-none focus:border-white/30"
                          placeholder="Digite sua idade"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-neutral-300 font-space mb-2">
                        Data de nascimento *
                      </label>
                      <input
                        type="date"
                        max={today}
                        value={formData.data}
                        onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                        className={dateInputClasses}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-neutral-300 font-space mb-2">
                        Assinatura (digite seu nome completo) *
                      </label>
                      <input
                        type="text"
                        value={formData.assinatura}
                        onChange={(e) => setFormData(prev => ({ ...prev, assinatura: e.target.value }))}
                        className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-neutral-100 font-space focus:outline-none focus:border-white/30"
                        placeholder="Digite seu nome completo para assinar"
                      />
                    </div>
                  </div>
                </motion.section>
                  )}

                  {hasYesAnswer && allAnswered && runningSectionComplete && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-red-900/20 border-2 border-red-500/50 rounded-xl p-6 md:p-8"
                >
                  <div className="mb-6">
                    <p className="text-red-300 font-space mb-4">
                      <strong className="text-red-200">Atenção:</strong> Você respondeu "SIM" a uma ou mais perguntas. 
                      Por favor, leia e assine o Termo de Responsabilidade abaixo.
                    </p>
                  </div>

                  <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mb-6">
                    Termo de Responsabilidade para Prática de Atividade Física
                  </h2>
                  
                  <div className="bg-neutral-900/50 border border-white/10 rounded-xl p-6 mb-6">
                    <p className="text-neutral-300 font-space leading-relaxed">
                      Estou ciente de que é recomendável conversar com um médico antes de aumentar meu nível atual de atividade física, 
                      por ter respondido <strong className="text-white">"SIM"</strong> a uma ou mais perguntas do{' '}
                      <strong className="text-white">"Questionário de Prontidão para Atividade Física" (PAR-Q)</strong>. 
                      Assumo plena responsabilidade por qualquer atividade física praticada sem o atendimento a essa recomendação.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-neutral-300 font-space mb-2">
                          Nome completo *
                        </label>
                        <input
                          type="text"
                          value={termoData.nome}
                          onChange={(e) => setTermoData(prev => ({ ...prev, nome: e.target.value }))}
                          className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-neutral-100 font-space focus:outline-none focus:border-white/30"
                          placeholder="Digite seu nome completo"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-300 font-space mb-2">
                          Idade *
                        </label>
                        <input
                          type="number"
                          value={termoData.idade}
                          onChange={(e) => setTermoData(prev => ({ ...prev, idade: e.target.value }))}
                          className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-neutral-100 font-space focus:outline-none focus:border-white/30"
                          placeholder="Digite sua idade"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-neutral-300 font-space mb-2">
                        Data de nascimento *
                      </label>
                      <input
                        type="date"
                        max={today}
                        value={termoData.data}
                        onChange={(e) => setTermoData(prev => ({ ...prev, data: e.target.value }))}
                        className={dateInputClasses}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-neutral-300 font-space mb-2">
                        Assinatura (digite seu nome completo) *
                      </label>
                      <input
                        type="text"
                        value={termoData.assinatura}
                        onChange={(e) => setTermoData(prev => ({ ...prev, assinatura: e.target.value }))}
                        className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-neutral-100 font-space focus:outline-none focus:border-white/30"
                        placeholder="Digite seu nome completo para assinar"
                      />
                    </div>
                  </div>
                </motion.section>
                  )}

                  {allAnswered && !hasYesAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-900/20 border-2 border-green-500/50 rounded-xl p-6 md:p-8"
                >
                  <p className="text-green-300 font-space text-lg mb-4">
                    ✅ Parabéns! Você respondeu "NÃO" a todas as perguntas. Você está apto para participar das atividades físicas do evento.
                  </p>
                </motion.div>
                  )}

                  {allAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  {submitStatus === 'error' && (
                    <div className="bg-red-900/20 border-2 border-red-500/50 rounded-xl p-4 w-full">
                      <p className="text-red-300 font-space text-center">
                        ❌ {submitMessage}
                      </p>
                    </div>
                  )}

                  <motion.button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    whileHover={canSubmit ? { scale: 1.05 } : {}}
                    whileTap={canSubmit ? { scale: 0.95 } : {}}
                    className={`px-8 py-4 rounded-xl font-orbitron font-bold text-lg uppercase transition-all ${
                      canSubmit && !isSubmitting
                        ? 'bg-white text-neutral-950 hover:bg-neutral-100'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Salvando...
                      </span>
                    ) : (
                      'Salvar Quiz'
                    )}
                  </motion.button>
                </motion.div>
                  )}

                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-neutral-900/60 border border-white/10 rounded-xl p-6 md:p-8 flex flex-col items-center text-center gap-4"
                >
                  <h3 className="text-2xl md:text-3xl font-orbitron font-bold text-neutral-100">
                    Obrigado por preencher o questionário!
                  </h3>
                  <p className="text-neutral-300 font-space">
                    Acompanhe tudo que vai rolar no Maxis Talks
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <motion.a
                      href="https://www.instagram.com/coffeemusicand_/"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-neutral-950 font-orbitron font-bold uppercase"
                    >
                      👉 Seguir no Instagram
                    </motion.a>
                    <motion.a
                      href="/"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/40 text-neutral-200 font-orbitron font-bold uppercase"
                    >
                      ← Voltar para Home
                    </motion.a>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

