import { isPlataformaSalesEnabled } from '@/lib/plataformaSales'
import { AdminLayoutClient } from './AdminLayoutClient'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const plataformaSalesEnabled = isPlataformaSalesEnabled()
  return (
    <AdminLayoutClient plataformaSalesEnabled={plataformaSalesEnabled}>
      {children}
    </AdminLayoutClient>
  )
}
