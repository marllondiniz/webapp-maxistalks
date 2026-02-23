import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { Header } from '../(components)/Header'
import { Footer } from '../(components)/Footer'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'Terms' })
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  }
}

export default async function TermosUsoPage() {
  const locale = await getLocale()
  const t = await getTranslations('Terms')
  const dateLocale = locale === 'en' ? 'en-GB' : 'pt-BR'
  const lastUpdated = new Date().toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })
  const isPt = locale === 'pt'

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
              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                {t('s3_1Title')}
              </h3>
              <p>{t('s3_1Body')}</p>
              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                {t('s3_2Title')}
              </h3>
              <p>{t('s3_2Body')}</p>
              <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                {t('s3_3Title')}
              </h3>
              <p>{t('s3_3Body')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s4Title')}
              </h2>
              <p>{t('s4Body')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s5Title')}
              </h2>
              <p>{t('s5Intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('s5Li1')}</li>
                <li>{t('s5Li2')}</li>
                <li>{t('s5Li3')}</li>
                <li>{t('s5Li4')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s6Title')}
              </h2>
              <p>{t('s6Body')}</p>
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
              {isPt ? (
                <>
                  <p className="mb-4">{t('s8Intro')}</p>
                  <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                    {t('s8_1Title')}
                  </h3>
                  <p className="mb-2">{t('s8_1_1')}</p>
                  <p className="mb-4">{t('s8_1_2')}</p>
                  <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                    {t('s8_2Title')}
                  </h3>
                  <p className="mb-2">{t('s8_2_1Intro')}</p>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>{t('s8_2Li1')}</li>
                    <li>{t('s8_2Li2')}</li>
                    <li>{t('s8_2Li3')}</li>
                    <li>{t('s8_2Li4')}</li>
                    <li>{t('s8_2Li5')}</li>
                  </ul>
                  <p className="mb-2">{t('s8_2_2')}</p>
                  <p className="mb-4">{t('s8_2_3')}</p>
                  <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                    {t('s8_3Title')}
                  </h3>
                  <p className="mb-2">{t('s8_3_1')}</p>
                  <p className="mb-2">{t('s8_3_2')}</p>
                  <p className="mb-4">{t('s8_3_3')}</p>
                  <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                    {t('s8_4Title')}
                  </h3>
                  <p className="mb-2">{t('s8_4_1Intro')}</p>
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>{t('s8_4Li1')}</li>
                    <li>{t('s8_4Li2')}</li>
                    <li>{t('s8_4Li3')}</li>
                    <li>{t('s8_4Li4')}</li>
                    <li>{t('s8_4Li5')}</li>
                  </ul>
                  <p className="mb-2">{t('s8_4_2')}</p>
                  <p className="mb-4">{t('s8_4_3')}</p>
                  <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                    {t('s8_5Title')}
                  </h3>
                  <p className="mb-2">{t('s8_5_1')}</p>
                  <p className="mb-2">{t('s8_5_2')}</p>
                  <p className="mb-4">{t('s8_5_3')}</p>
                  <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                    {t('s8_6Title')}
                  </h3>
                  <p className="mb-4">{t('s8_6_1')}</p>
                  <h3 className="text-xl font-orbitron font-bold text-neutral-100 mt-6 mb-3">
                    {t('s8_7Title')}
                  </h3>
                  <p className="mb-2">{t('s8_7_1')}</p>
                  <p className="mb-2">{t('s8_7_2')}</p>
                  <p className="mb-2">{t('s8_7_3')}</p>
                  <p className="mb-4">{t('s8_7_4')}</p>
                </>
              ) : (
                <p>{t('s8Summary')}</p>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s9Title')}
              </h2>
              <p>{t('s9Body')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s10Title')}
              </h2>
              <p>{t('s10Body')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-orbitron font-bold text-neutral-100 mt-8 mb-4">
                {t('s11Title')}
              </h2>
              <p>
                {t('s11Body')}{' '}
                <a href="https://www.instagram.com/maxisplus" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 underline">
                  {t('s11Instagram')}
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
