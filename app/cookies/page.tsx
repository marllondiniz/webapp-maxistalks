import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'
import { Header } from '../(components)/Header'
import { Footer } from '../(components)/Footer'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'Cookies' })
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
  }
}

export default async function CookiesPage() {
  const locale = await getLocale()
  const t = await getTranslations('Cookies')
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
              <p>{t('s5Body')}</p>
              <p className="mt-4">{t('s5Info')}</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 underline">{t('s5Chrome')}</a></li>
                <li><a href="https://support.mozilla.org/pt-BR/kb/ativar-e-desativar-cookies-websites-rastreiam-preferencias" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 underline">{t('s5Firefox')}</a></li>
                <li><a href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 underline">{t('s5Safari')}</a></li>
                <li><a href="https://support.microsoft.com/pt-br/microsoft-edge/excluir-cookies-no-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 underline">{t('s5Edge')}</a></li>
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
              <p>
                {t('s7Email')}{' '}
                <a href="mailto:contato@maxistalks.com" className="text-white hover:text-neutral-300 underline">
                  contato@maxistalks.com
                </a>
              </p>
              <p className="mt-2">
                {t('s7Instagram')}{' '}
                <a href="https://www.instagram.com/maxisplus" target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 underline">
                  @maxisplus
                </a>
              </p>
              <p className="mt-2">{t('s7Address')}</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

