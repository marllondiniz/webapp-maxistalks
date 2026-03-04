'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Monitor, Smartphone, ExternalLink, Loader2, Eye, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { TenantData } from './CustomizacaoPanel'

type LivePreviewProps = {
  form: TenantData
  onSectionClick?: (sectionId: string) => void
}

const DESKTOP_WIDTH = 1280
const MOBILE_WIDTH = 375

export default function LivePreview({ form, onSectionClick }: LivePreviewProps) {
  const t = useTranslations('AdminCustomizacao')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [iframeReady, setIframeReady] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [scale, setScale] = useState(1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [iframeKey, setIframeKey] = useState(0)

  const iframeWidth = viewMode === 'desktop' ? DESKTOP_WIDTH : MOBILE_WIDTH

  const calcScale = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const availableWidth = container.clientWidth - 2
    const newScale = Math.min(availableWidth / iframeWidth, 1)
    setScale(newScale)
  }, [iframeWidth])

  useEffect(() => {
    calcScale()
    window.addEventListener('resize', calcScale)
    return () => window.removeEventListener('resize', calcScale)
  }, [calcScale])

  const sendToIframe = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow || !iframeReady) return

    iframe.contentWindow.postMessage({
      type: 'brand-preview',
      ...form,
    }, window.location.origin)
  }, [form, iframeReady])

  useEffect(() => {
    if (!iframeReady) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(sendToIframe, 60)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [sendToIframe, iframeReady])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'preview-ready') {
        setIframeReady(true)
        setIframeLoading(false)
      }
      if (e.data?.type === 'preview-click' && e.data.section && onSectionClick) {
        onSectionClick(e.data.section)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onSectionClick])

  const handleRefresh = () => {
    setIframeReady(false)
    setIframeLoading(true)
    setIframeKey((k) => k + 1)
  }

  const iframeHeight = viewMode === 'desktop' ? 900 : 812

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
          <span className="text-xs font-semibold text-white">{t('previewTitle')}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            className={`rounded-lg p-1.5 transition ${viewMode === 'desktop' ? 'bg-[var(--brand-primary)]/15 text-[var(--brand-primary)]' : 'text-slate-500 hover:text-white'}`}
            title={t('previewDesktop')}
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={`rounded-lg p-1.5 transition ${viewMode === 'mobile' ? 'bg-[var(--brand-primary)]/15 text-[var(--brand-primary)]' : 'text-slate-500 hover:text-white'}`}
            title={t('previewMobile')}
          >
            <Smartphone className="h-3.5 w-3.5" />
          </button>

          <div className="mx-1 h-4 w-px bg-white/[0.08]" />

          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-lg p-1.5 text-slate-500 transition hover:text-white"
            title={t('previewRefresh')}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <a
            href="/?preview=true"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-1.5 text-slate-500 transition hover:text-white"
            title={t('previewOpenTab')}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Browser chrome simulation */}
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-black/50 shadow-2xl">
        {/* URL bar */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 rounded-md bg-white/[0.05] px-3 py-1 text-center">
            <span className="text-[10px] text-slate-500">
              {typeof window !== 'undefined' ? window.location.origin : ''}/
            </span>
          </div>
        </div>

        {/* iframe container */}
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          style={{ height: iframeHeight * scale }}
        >
          {iframeLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/80">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--brand-primary)]" />
              <span className="text-xs text-slate-400">{t('previewLoading')}</span>
            </div>
          )}
          <div
            style={{
              width: iframeWidth,
              height: iframeHeight,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src="/?preview=true"
              width={iframeWidth}
              height={iframeHeight}
              className="border-0"
              title="Preview"
              onLoad={() => {
                setTimeout(() => {
                  setIframeReady(true)
                  setIframeLoading(false)
                }, 400)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
