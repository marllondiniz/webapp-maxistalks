'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => (
    <div className="h-[450px] rounded-xl border border-white/10 bg-[var(--brand-surface-alt)] animate-pulse flex items-center justify-center">
      <p className="text-slate-500 text-sm">Carregando editor...</p>
    </div>
  )
})

type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  }), [])

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'align', 'blockquote', 'code-block', 'link', 'image'
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[var(--brand-surface-alt)] shadow-lg ring-1 ring-white/5">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder || 'Escreva seu conteúdo aqui...'}
        modules={modules}
        formats={formats}
      />
    </div>
  )
}
