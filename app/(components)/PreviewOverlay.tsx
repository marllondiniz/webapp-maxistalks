'use client'

import { useState } from 'react'

type PreviewOverlayProps = {
  sectionId: string
  label: string
  children: React.ReactNode
}

export function PreviewOverlay({ sectionId, label, children }: PreviewOverlayProps) {
  const [hovered, setHovered] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.parent.postMessage(
      { type: 'preview-click', section: sectionId },
      window.location.origin,
    )
  }

  return (
    <div className="relative group/overlay">
      {children}
      <div
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="absolute inset-0 z-[60] cursor-pointer transition-all duration-300"
        style={{
          outline: hovered ? '2px dashed rgba(59,130,246,0.7)' : '2px dashed transparent',
          outlineOffset: '-2px',
          backgroundColor: hovered ? 'rgba(59,130,246,0.04)' : 'transparent',
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 flex justify-center transition-all duration-200"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(8px)' : 'translateY(0px)',
          }}
        >
          <span className="rounded-full bg-blue-500 px-3 py-1 text-[11px] font-semibold text-white shadow-lg shadow-blue-500/30">
            {label}
          </span>
        </div>
      </div>
    </div>
  )
}
