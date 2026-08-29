import Link from 'next/link'

export default function StatikSayfaShell({
  baslik,
  children,
}: {
  baslik: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--renk-kraft)]">
      <header className="sticky top-0 z-40 bg-[var(--renk-kraft)]/95 backdrop-blur border-b border-[var(--renk-cizgi)]">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl font-semibold text-[var(--renk-ink)] tracking-tight">
            NeedGO
          </Link>
          <Link
            href="/"
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-[var(--renk-ink)]/20 text-[var(--renk-ink)] hover:bg-[var(--renk-ink)] hover:text-[var(--renk-kraft)] transition-colors"
          >
            Ana Sayfa
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-10">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--renk-ink)] mb-6">
          {baslik}
        </h1>
        {children}
      </main>
    </div>
  )
}
