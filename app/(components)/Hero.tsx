'use client'

import { motion } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { Zap } from 'lucide-react'
import { EVENT_DATE_ISO } from '@/lib/constants'
import { SponsorsCarousel } from './SponsorsCarousel'

export function Hero() {
  const [eventoImageError, setEventoImageError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = EVENT_DATE_ISO - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])
  
  const particles = useMemo(() => {
    if (!mounted) return []
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      bottom: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 10 + Math.random() * 10,
    }))
  }, [mounted])

  return (
    <section id="hero" className="relative flex items-center justify-center overflow-hidden py-6 md:min-h-screen md:py-0">
      {/* Background effects container with overflow hidden */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 animated-grid opacity-20" />
        <div className="absolute inset-0 radial-gradient-1" />
        <div className="absolute inset-0 radial-gradient-2" />
        
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              bottom: `${particle.bottom}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
        
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212, 212, 212, 0.08) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(212, 212, 212, 0.06) 0%, transparent 50%)`,
            backgroundSize: '200% 200%',
            filter: 'blur(60px)',
            willChange: 'background-position',
          }}
        />
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-6 md:px-6 lg:px-8 py-4 md:py-20 lg:py-24">
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-12 lg:gap-16 xl:gap-20 items-center mb-6 md:mb-16 lg:mb-20">
          {/* Imagem do evento - primeiro no mobile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="w-full md:order-2"
          >
            {!eventoImageError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative w-full h-[140px] sm:h-[180px] md:h-auto md:aspect-[16/9] lg:min-h-[600px] xl:min-h-[700px] rounded-xl md:rounded-2xl overflow-hidden shadow-xl group mx-auto"
              >
                <Image
                  src="/evento.jpg"
                  alt="Coffee Music & Run - Evento"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
                  priority
                  onError={() => setEventoImageError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            )}
          </motion.div>

          {/* Conteúdo de texto - segundo no mobile */}
          <div className="text-center md:text-left w-full md:order-1 space-y-4 sm:space-y-5 md:space-y-6 min-w-0">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-orbitron font-black tracking-tight leading-tight break-words"
            >
              <span className="text-gradient pulse-glow inline-block">
                COFFEE MUSIC & RUN
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl text-neutral-300 leading-relaxed font-space w-full"
              style={{ 
                wordBreak: 'normal', 
                overflowWrap: 'normal', 
                hyphens: 'none',
                whiteSpace: 'normal',
                lineHeight: '1.7',
                wordSpacing: 'normal',
                maxWidth: '100%'
              }}
            >
              Vem aí uma edição pra fechar o ano no <span className="text-shimmer">ritmo certo</span>, com nova energia, novo cenário e a mesma vibe que fez o Coffee Music se tornar o que é: uma <span className="text-neutral-100 font-semibold">comunidade que corre, vive e celebra junto</span>.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl text-neutral-100 font-orbitron font-bold leading-tight sm:leading-normal w-full"
              style={{ 
                wordBreak: 'normal', 
                overflowWrap: 'normal', 
                hyphens: 'none',
                whiteSpace: 'normal',
                lineHeight: '1.6',
                wordSpacing: 'normal',
                maxWidth: '100%'
              }}
            >
              O Brizz será palco dessa nova largada. Pode apostar: vai ser histórico.
            </motion.p>
            
            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex items-center md:items-start justify-center md:justify-start pt-2"
            >
              <motion.a
                href="#ingressos"
                onClick={(e) => {
                  e.preventDefault()
                  const element = document.getElementById('ingressos')
                  if (element) {
                    const headerOffset = 100
                    const elementPosition = element.getBoundingClientRect().top
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    })
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 sm:px-8 md:px-12 lg:px-16 py-3 sm:py-4 md:py-5 lg:py-6 bg-white text-neutral-950 font-orbitron font-bold text-sm sm:text-base md:text-lg lg:text-xl uppercase tracking-wider border-2 border-white transition-all duration-300 hover:bg-transparent hover:text-white rounded-xl md:rounded-2xl cursor-pointer"
              >
                <Zap className="h-5 w-5 shrink-0" />
                Garantir ingresso
              </motion.a>
            </motion.div>
          </div>
        </div>
        
        {/* Carrossel de Patrocinadores - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative z-10 w-full mt-6 md:mt-8 lg:mt-12"
        >
          <div className="mb-4 md:mb-6 lg:mb-8">
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-orbitron font-bold text-neutral-300 text-center uppercase tracking-wider">
              Patrocinadores & Parcerias
            </h3>
          </div>
          <div className="w-screen relative left-1/2 -translate-x-1/2">
            <SponsorsCarousel />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

