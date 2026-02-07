'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Verificar se o usuário já deu consentimento
    const consent = localStorage.getItem('maxistalks-cookie-consent')
    if (!consent) {
      // Mostrar banner após um pequeno delay
      setTimeout(() => {
        setShowBanner(true)
      }, 1000)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('maxistalks-cookie-consent', 'accepted')
    localStorage.setItem('maxistalks-cookie-consent-date', new Date().toISOString())
    setShowBanner(false)
  }

  const handleReject = () => {
    localStorage.setItem('maxistalks-cookie-consent', 'rejected')
    localStorage.setItem('maxistalks-cookie-consent-date', new Date().toISOString())
    setShowBanner(false)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl border border-blue-500/20 bg-[#060c1f]/95 shadow-2xl shadow-blue-500/5 backdrop-blur-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                    🍪 Utilizamos Cookies
                  </h3>
                  <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                    Utilizamos cookies para melhorar sua experiência, analisar o tráfego do site e personalizar conteúdo.{' '}
                    <Link 
                      href="/cookies" 
                      className="text-blue-400 hover:text-blue-300 underline font-semibold transition"
                    >
                      Saiba mais
                    </Link>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <motion.button
                    onClick={handleReject}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-xl border border-blue-500/30 bg-transparent px-6 py-3 text-slate-300 font-bold text-sm uppercase tracking-wider transition hover:bg-blue-500/10 hover:border-blue-500/40 hover:text-slate-200"
                  >
                    Recusar
                  </motion.button>
                  <motion.button
                    onClick={handleAccept}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-glow rounded-xl bg-[#3b82f6] px-6 py-3 font-bold text-sm uppercase tracking-wider text-white transition hover:bg-[#2563eb]"
                  >
                    Aceitar
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

