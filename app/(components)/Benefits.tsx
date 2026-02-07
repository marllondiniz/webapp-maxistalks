'use client'

import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
import { EXPERIENCIA_ITEMS, EXPERIENCIA_PLUS_ITEMS } from '@/lib/constants'

export function Benefits() {
  return (
    <section id="beneficios" className="relative py-20 md:py-32 px-6 md:px-12 bg-neutral-900/50">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-4xl lg:text-5xl font-orbitron font-bold text-neutral-100 text-center mb-12 md:mb-16 pulse-glow"
        >
          O que está incluído
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Experiência Coffee Music */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-neutral-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 hover:border-white/20 transition-all duration-300 shadow-lg"
          >
            <h3 className="text-2xl md:text-3xl font-orbitron font-bold text-neutral-100 mb-4 md:mb-6">
              Experiência Coffee Music
            </h3>
            <p className="text-lg md:text-xl font-space font-semibold text-neutral-300 mb-6 md:mb-8">
              Inclui:
            </p>
            <ul className="space-y-3 md:space-y-4">
              {EXPERIENCIA_ITEMS.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 shrink-0 mt-1 text-neutral-100" />
                  <span className="text-sm md:text-base text-neutral-300 font-space leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Experiência + Camisa */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-neutral-900/80 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 md:p-8 hover:border-white/30 transition-all duration-300 relative overflow-hidden shadow-lg"
          >
            <div className="absolute top-4 right-4 bg-white text-neutral-950 px-3 py-1 rounded-full text-xs md:text-sm font-orbitron font-bold uppercase">
              Popular
            </div>
            <h3 className="text-2xl md:text-3xl font-orbitron font-bold text-neutral-100 mb-4 md:mb-6">
              Experiência + Camisa Collab Brizz
            </h3>
            <p className="text-lg md:text-xl font-space font-semibold text-neutral-300 mb-4">
              Inclui todos os benefícios da Experiência Coffee Music, mais:
            </p>
            <ul className="space-y-3 md:space-y-4">
              {EXPERIENCIA_PLUS_ITEMS.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Zap className="h-5 w-5 shrink-0 mt-1 text-neutral-100" />
                  <span className="text-sm md:text-base text-neutral-300 font-space leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

