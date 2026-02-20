import { getTenantIdForRequest } from '@/lib/brand'
import { FerramentasAdminPanel } from './FerramentasAdminPanel'

export default async function AdminFerramentasPage() {
  const tenantId = await getTenantIdForRequest()
  return <FerramentasAdminPanel tenantId={tenantId} />
}
