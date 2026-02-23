import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'
import { Header } from '../(components)/Header'
import { Footer } from '../(components)/Footer'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'Privacy' })
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  }
}

export default async function PoliticaPrivacidadePage() {
  const locale = await getLocale()
  const t = await getTranslations('Privacy')
  const dateLocale = locale === 'en' ? 'en-GB' : 'pt-BR'
  const lastUpdated = new Date().toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <main className="min-h-screen bg-neutral-950">
      <Header />
      <div className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-neutral-100 mb-8">
            {t('title')}
          </h1>
          
          <div className="prose prose-invert max-w-none text-neutral-300 font-space space-y-6">
            <p className="text-neutral-400 text-sm">
              {t('lastUpdate')}: {lastUpdated}
            </p>

            <p className="text-lg text-neutral-200 mb-6">
              {t('intro')}
            </p>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s1Title')}
              </h2>
              <p>{t('s1Body')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s2Title')}
              </h2>
              <p>{t('s2Intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('s2Li1')}</li>
                <li>{t('s2Li2')}</li>
                <li>{t('s2Li3')}</li>
                <li>{t('s2Li4')}</li>
                <li>{t('s2Li5')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s3Title')}
              </h2>
              <p>{t('s3Intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('s3Li1')}</li>
                <li>{t('s3Li2')}</li>
                <li>{t('s3Li3')}</li>
                <li>{t('s3Li4')}</li>
                <li>{t('s3Li5')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s4Title')}
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>{t('s4Li1')}</strong></li>
                <li><strong>{t('s4Li2')}</strong></li>
                <li><strong>{t('s4Li3')}</strong></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s5Title')}
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('s5Li1')}</li>
                <li>{t('s5Li2')}</li>
                <li>{t('s5Li3')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s6Title')}
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('s6Li1')}</li>
                <li>{t('s6Li2')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s7Title')}
              </h2>
              <p>{t('s7Intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('s7Li1')}</li>
                <li>{t('s7Li2')}</li>
                <li>{t('s7Li3')}</li>
                <li>{t('s7Li4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s8Title')}
              </h2>
              <p>{t('s8Body')}</p>
              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                {t('s8TypesTitle')}
              </h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>{t('s8Li1')}</strong></li>
                <li><strong>{t('s8Li2')}</strong></li>
                <li><strong>{t('s8Li3')}</strong></li>
              </ul>
              <p className="mb-2">{t('s8Banner')}</p>
              <p>{t('s8NoSensitive')}</p>
              <p className="mt-4">
                {t('s8Link')}{' '}
                <Link href="/cookies" className="text-white hover:text-neutral-300 underline">
                  {t('s8LinkLabel')}
                </Link>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s9Title')}
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('s9Li1')}</li>
                <li>{t('s9Li2')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s10Title')}
              </h2>
              <p>
                {t('s10Email')}{' '}
                <a href="mailto:contato@maxistalks.com" className="text-white hover:text-neutral-300 underline">
                  contato@maxistalks.com
                </a>
              </p>
              <p className="mt-2">
                {t('s10Instagram')}{' '}
                <a href="https://www.instagram.com/maxisplus" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 underline">
                  @maxisplus
                </a>
              </p>
              <p className="mt-2">{t('s10Address')}</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
