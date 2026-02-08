'use client'

type Props = {
  handle: string
  className?: string
}

export function InstagramLink({ handle, className }: Props) {
  const cleanHandle = handle.replace(/^@/, '')
  return (
    <span
      role="link"
      tabIndex={0}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        window.open(`https://instagram.com/${cleanHandle}`)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          window.open(`https://instagram.com/${cleanHandle}`)
        }
      }}
      className={className}
    >
      @{cleanHandle}
    </span>
  )
}
