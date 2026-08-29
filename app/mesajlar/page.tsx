'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

type Konusma = {
  id: string
  ilan_id: string
  gonderen_id: string
  alici_id: string
  olusturulma_tarihi: string
  ilanlar: { baslik: string } | null
}

export default function Mesajlar() {
  const [kullanici, setKullanici] = useState<User | null>(null)
  const [konusmalar, setKonusmalar] = useState<Konusma[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)

  useEffect(() => {
    const yukle = async () => {
      const { data: userData } = await supabase.auth.getUser()
      setKullanici(userData.user)

      if (userData.user) {
        const { data, error } = await supabase
          .from('konusmalar')
          .select('*, ilanlar(baslik)')
          .or(`gonderen_id.eq.${userData.user.id},alici_id.eq.${userData.user.id}`)
          .order('olusturulma_tarihi', { ascending: false })

        if (!error && data) {
          setKonusmalar(data as unknown as Konusma[])
        }
      }
      setYukleniyor(false)
    }
    yukle()
  }, [])

  if (yukleniyor) {
    return (
      <div className="min-h-screen bg-[var(--renk-kraft)] flex items-center justify-center">
        <p className="text-sm text-[var(--renk-ink)]/50">Yükleniyor…</p>
      </div>
    )
  }

  if (!kullanici) {
    return (
      <div className="min-h-screen bg-[var(--renk-kraft)] flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-[var(--renk-ink)]/50">Bu sayfayı görmek için giriş yapmalısın.</p>
        <Link href="/" className="text-sm font-semibold text-[var(--renk-orman)] hover:underline">
          Ana sayfaya dön
        </Link>
      </div>
    )
  }

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
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--renk-ink)] mb-8">
          Mesajlarım
        </h1>

        {konusmalar.length === 0 && (
          <p className="text-sm text-[var(--renk-ink)]/50 italic">Henüz bir mesajlaşman yok.</p>
        )}

        <div className="flex flex-col gap-3">
          {konusmalar.map((konusma) => {
            const benBasladim = konusma.gonderen_id === kullanici.id
            return (
              <Link
                key={konusma.id}
                href={`/mesajlar/${konusma.id}`}
                className="bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] rounded-lg p-4 flex items-center justify-between hover:border-[var(--renk-orman)]/40 transition-colors"
              >
                <div>
                  <h3 className="font-display text-base font-semibold text-[var(--renk-ink)]">
                    {konusma.ilanlar?.baslik || 'İlan'}
                  </h3>
                  <p className="text-xs text-[var(--renk-ink)]/50 mt-0.5">
                    {benBasladim ? 'Sen mesaj gönderdin' : 'Sana mesaj geldi'}
                  </p>
                </div>
                <span className="text-[var(--renk-ink)]/30">›</span>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
