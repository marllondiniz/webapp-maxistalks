import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Questionário — MaxisTalks',
  description: 'Questionário do MaxisTalks',
}

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

