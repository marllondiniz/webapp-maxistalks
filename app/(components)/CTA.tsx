'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { TICKETS_URL } from '@/lib/constants'

export function CTA() {
  return (
    <section className="relative py-20 md:py-32 px-6 md:px-12">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8 md:space-y-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-orbitron font-bold text-neutral-100 mb-6">
            Pronto para fechar o ano no ritmo certo?
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl text-neutral-300 font-space max-w-70ch mx-auto">
            Junte-se à comunidade que corre, vive e celebra junto. Garanta seu ingresso e faça parte dessa experiência única.
          </p>
          <motion.a
            href={TICKETS_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-12 md:px-16 py-5 md:py-6 bg-white text-neutral-950 font-orbitron font-bold text-xl md:text-2xl uppercase tracking-wider border-2 border-white transition-all duration-300 hover:bg-transparent hover:text-white rounded-2xl shadow-xl"
          >
            <Zap className="h-6 w-6 shrink-0" />
            Garantir meu ingresso agora
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

