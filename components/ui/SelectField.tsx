'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

export type SelectOption = { value: string; label: string }

type SelectFieldProps = {
  name: string
  defaultValue?: string
  options: SelectOption[]
  placeholder?: string
  allowEmpty?: boolean
  className?: string
  optionClassName?: string
}

export function SelectField({
  name,
  defaultValue = '',
  options,
  placeholder = 'Selecione',
  allowEmpty = false,
  className = '',
  optionClassName = '',
}: SelectFieldProps) {
  const [selected, setSelected] = useState(defaultValue)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedLabel = options.find((o) => o.value === selected)?.label ?? placeholder

  const close = () => setIsOpen(false)

  const selectOption = (opt: SelectOption) => {
    setSelected(opt.value)
    setIsOpen(false)
  }

  // Lock body scroll when dropdown is open (prevents mobile freeze)
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  // Close on click/touch outside
  useEffect(() => {
    if (!isOpen) return
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (containerRef.current?.contains(target)) return
      const portal = document.getElementById('select-field-portal')
      if (portal?.contains(target)) return
      close()
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [isOpen])

  // Use onPointerDown for immediate response on mobile (avoids 300ms delay)
  const handleOptionPress = (opt: SelectOption) => (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    selectOption(opt)
  }

  const handleBackdropPress = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    close()
  }

  const optionsPanel = (
    <div
      role="listbox"
      className="max-h-[70vh] overflow-y-auto overflow-x-hidden rounded-2xl border border-slate-600/40 bg-slate-900 shadow-2xl sm:max-h-64"
      style={{
        touchAction: 'manipulation',
        WebkitOverflowScrolling: 'touch' as const,
      }}
    >
      {allowEmpty && (
        <button
          type="button"
          role="option"
          aria-selected={selected === ''}
          onPointerDown={handleOptionPress({ value: '', label: placeholder })}
          className={`flex min-h-[48px] w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-base transition hover:bg-slate-700/60 active:bg-slate-700/80 select-none touch-manipulation sm:min-h-[44px] ${
            selected === '' ? 'bg-blue-500/20 text-blue-200' : 'text-[#f5f5f5]'
          } ${optionClassName}`}
        >
          {selected === '' && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/40 text-xs">
              ✓
            </span>
          )}
          <span className="flex-1 truncate">{placeholder}</span>
        </button>
      )}
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="option"
          aria-selected={opt.value === selected}
          onPointerDown={handleOptionPress(opt)}
          className={`flex min-h-[48px] w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-base transition hover:bg-slate-700/60 active:bg-slate-700/80 select-none touch-manipulation sm:min-h-[44px] ${
            opt.value === selected ? 'bg-blue-500/20 text-blue-200' : 'text-[#f5f5f5]'
          } ${optionClassName}`}
        >
          {opt.value === selected && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/40 text-xs">
              ✓
            </span>
          )}
          <span className="flex-1 truncate">{opt.label}</span>
        </button>
      ))}
    </div>
  )

  const dropdownContent =
    isOpen &&
    typeof document !== 'undefined' && (
      <div id="select-field-portal" className="fixed inset-0 z-[9999]">
        {/* Backdrop - tap to close */}
        <div
          className="absolute inset-0 bg-black/50"
          aria-hidden="true"
          onPointerDown={handleBackdropPress}
          style={{ touchAction: 'manipulation' }}
        />
        {/* Options - bottom sheet on mobile, centered dropdown on desktop */}
        <div className="absolute inset-x-4 bottom-4 flex flex-col sm:inset-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:bottom-auto sm:mx-0 sm:max-h-[85vh] sm:w-full sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 sm:px-4">
          {optionsPanel}
        </div>
      </div>
    )

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selected} readOnly />
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full min-h-[48px] cursor-pointer items-center justify-between rounded-2xl border border-slate-600/40 bg-slate-900 px-4 py-3 text-base text-[#f5f5f5] transition focus:border-slate-500/50 focus:outline-none focus:ring-2 focus:ring-slate-500/30 active:bg-slate-800/80 touch-manipulation ${
          !selected ? 'text-[#54545b]' : ''
        } ${className}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={placeholder}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  )
}
