import { getTenantIdForRequest } from '@/lib/brand'
import CustomizacaoPanel from './CustomizacaoPanel'

export default async function CustomizacaoPage() {
  await getTenantIdForRequest()
  return <CustomizacaoPanel />
}
