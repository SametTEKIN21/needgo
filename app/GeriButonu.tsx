'use client'

import { useRouter } from 'next/navigation'

export default function GeriButonu({ className = '' }: { className?: string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className={
        className ||
        'text-xs font-medium px-3 py-1.5 rounded-full border border-[var(--renk-ink)]/20 text-[var(--renk-ink)] hover:bg-[var(--renk-ink)] hover:text-[var(--renk-kraft)] transition-colors'
      }
    >
      ← Geri
    </button>
  )
}
