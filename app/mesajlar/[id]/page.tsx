'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import type { User } from '@supabase/supabase-js'

type Mesaj = {
  id: string
  gonderen_id: string
  icerik: string
  olusturulma_tarihi: string
}

type Konusma = {
  id: string
  ilan_id: string
  gonderen_id: string
  alici_id: string
  ilanlar: { baslik: string } | null
}

export default function MesajDetay() {
  const params = useParams()
  const [kullanici, setKullanici] = useState<User | null>(null)
  const [konusma, setKonusma] = useState<Konusma | null>(null)
  const [mesajlar, setMesajlar] = useState<Mesaj[]>([])
  const [yeniMesaj, setYeniMesaj] = useState('')
  const [yukleniyor, setYukleniyor] = useState(true)
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const sonRef = useRef<HTMLDivElement>(null)

  const mesajlariGetir = async () => {
    const { data } = await supabase
      .from('mesajlar')
      .select('*')
      .eq('konusma_id', params.id)
      .order('olusturulma_tarihi', { ascending: true })

    if (data) {
      setMesajlar(data as Mesaj[])
    }
  }

  useEffect(() => {
    const yukle = async () => {
      const { data: userData } = await supabase.auth.getUser()
      setKullanici(userData.user)

      const { data: konusmaData, error } = await supabase
        .from('konusmalar')
        .select('*, ilanlar(baslik)')
        .eq('id', params.id)
        .single()

      if (!error) {
        setKonusma(konusmaData as unknown as Konusma)
        await mesajlariGetir()
      }
      setYukleniyor(false)
    }
    yukle()
  }, [params.id])

  useEffect(() => {
    sonRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mesajlar])

  const mesajGonder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!yeniMesaj.trim() || !kullanici) return

    setGonderiliyor(true)
    const { error } = await supabase.from('mesajlar').insert({
      konusma_id: params.id,
      gonderen_id: kullanici.id,
      icerik: yeniMesaj.trim(),
    })
    setGonderiliyor(false)

    if (!error) {
      setYeniMesaj('')
      await mesajlariGetir()
    }
  }

  if (yukleniyor) {
    return (
      <div className="min-h-screen bg-[var(--renk-kraft)] flex items-center justify-center">
        <p className="text-sm text-[var(--renk-ink)]/50">Yükleniyor…</p>
      </div>
    )
  }

  if (!konusma || !kullanici) {
    return (
      <div className="min-h-screen bg-[var(--renk-kraft)] flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-[var(--renk-ink)]/50">Bu konuşma bulunamadı.</p>
        <Link href="/mesajlar" className="text-sm font-semibold text-[var(--renk-orman)] hover:underline">
          Mesajlara dön
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--renk-kraft)] flex flex-col">
      <header className="sticky top-0 z-40 bg-[var(--renk-kraft)]/95 backdrop-blur border-b border-[var(--renk-cizgi)]">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between gap-3">
          <Link href="/mesajlar" className="text-[var(--renk-ink)]/60 text-lg">←</Link>
          <div className="flex-1 min-w-0">
            <p className="font-display text-base font-semibold text-[var(--renk-ink)] truncate">
              {konusma.ilanlar?.baslik || 'İlan'}
            </p>
          </div>
          <Link
            href={`/ilan/${konusma.ilan_id}`}
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-[var(--renk-ink)]/20 text-[var(--renk-ink)] hover:bg-[var(--renk-ink)] hover:text-[var(--renk-kraft)] transition-colors shrink-0"
          >
            İlanı Gör
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 flex-1 w-full flex flex-col gap-3">
        {mesajlar.length === 0 && (
          <p className="text-sm text-[var(--renk-ink)]/50 italic text-center mt-10">
            Henüz mesaj yok. İlk mesajı sen gönder.
          </p>
        )}

        {mesajlar.map((mesaj) => {
          const benimMi = mesaj.gonderen_id === kullanici.id
          return (
            <div key={mesaj.id} className={`flex ${benimMi ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-lg text-sm ${
                  benimMi
                    ? 'bg-[var(--renk-orman)] text-[var(--renk-kraft)]'
                    : 'bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] text-[var(--renk-ink)]'
                }`}
              >
                {mesaj.icerik}
              </div>
            </div>
          )
        })}
        <div ref={sonRef} />
      </main>

      <form onSubmit={mesajGonder} className="sticky bottom-0 bg-[var(--renk-kraft)]/95 backdrop-blur border-t border-[var(--renk-cizgi)] px-5 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={yeniMesaj}
            onChange={(e) => setYeniMesaj(e.target.value)}
            placeholder="Mesaj yaz…"
            className="flex-1 px-4 py-2.5 bg-white border border-[var(--renk-cizgi)] rounded-full text-sm outline-none focus:ring-2 focus:ring-[var(--renk-orman)]/40"
          />
          <button
            type="submit"
            disabled={gonderiliyor}
            className="px-5 py-2.5 rounded-full bg-[var(--renk-ocre)] text-white text-sm font-semibold hover:brightness-95 transition disabled:opacity-60"
          >
            Gönder
          </button>
        </div>
      </form>
    </div>
  )
}
