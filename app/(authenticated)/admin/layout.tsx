import { getBrandForRequest } from '@/lib/brand'
import { AdminLayoutClient } from './AdminLayoutClient'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const brand = await getBrandForRequest()
  return (
    <AdminLayoutClient plataformaSalesEnabled={brand.enablePlataformaSales}>
      {children}
    </AdminLayoutClient>
  )
}
