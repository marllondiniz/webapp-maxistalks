export default function AuthenticatedLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
      <p className="text-sm text-slate-400">Carregando...</p>
    </div>
  )
}
