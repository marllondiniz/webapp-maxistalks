'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useBrand } from '@/app/(components)/BrandProvider'

export function Footer() {
  const brand = useBrand()
  return (
    <footer className="relative py-4 md:py-6 px-6 md:px-12 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center mb-0"
        >
          <Link href="/" className="block">
            <div className="relative h-16 w-auto md:h-20 flex-shrink-0">
              <Image
                src={brand.logoPath}
                alt={brand.name}
                width={200}
                height={80}
                className="object-contain h-full w-auto"
                sizes="(max-width: 768px) 120px, 160px"
              />
            </div>
          </Link>
        </motion.div>

        {/* Instagram Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-center mb-2"
        >
          <motion.a
            href="https://www.instagram.com/maxisplus"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-white hover:text-neutral-300 transition-all duration-300"
            aria-label="Instagram"
          >
            <svg
              className="w-6 h-6 md:w-7 md:h-7"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </motion.a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center text-base md:text-lg text-neutral-300 font-space max-w-70ch mx-auto leading-relaxed mb-2 md:mb-3"
        >
          {brand.tagline}. Palestras presenciais com experts do digital.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center space-y-3"
        >
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-neutral-400 font-space">
            <a
              href="/politica-de-privacidade"
              className="hover:text-neutral-300 transition-colors"
            >
              Política de Privacidade
            </a>
            <span className="text-neutral-600">•</span>
            <a
              href="/termos-de-uso"
              className="hover:text-neutral-300 transition-colors"
            >
              Termos de Uso
            </a>
            <span className="text-neutral-600">•</span>
            <a
              href="/cookies"
              className="hover:text-neutral-300 transition-colors"
            >
              Cookies
            </a>
          </div>
          <p className="text-sm text-neutral-400 font-space">
            © {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

