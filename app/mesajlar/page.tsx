'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import GeriButonu from '../GeriButonu'
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
  const [silinenId, setSilinenId] = useState<string | null>(null)

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
      try {
        localStorage.setItem('needgo-mesaj-son-goruldu', new Date().toISOString())
      } catch {
        /* localStorage yoksa geç */
      }
    }
    yukle()
  }, [])

  const konusmayiSil = async (id: string) => {
    if (silinenId) return
    const onay = window.confirm(
      'Bu konuşma ve içindeki tüm mesajlar kalıcı olarak silinecek. İş bittiyse gereksiz veriyi temizlemek için onayla.'
    )
    if (!onay) return

    setSilinenId(id)
    const { error: mesajHata } = await supabase.from('mesajlar').delete().eq('konusma_id', id)
    const { error: konusmaHata } = mesajHata
      ? { error: mesajHata }
      : await supabase.from('konusmalar').delete().eq('id', id)
    setSilinenId(null)

    const hata = mesajHata || konusmaHata
    if (hata) {
      console.error('Konuşma silme hatası:', hata)
      alert(
        `Konuşma silinemedi: ${hata.message}\n\n` +
          'Silme yetkisi (RLS) tanımlı değilse supabase/mesaj-silme.sql dosyasını Supabase SQL Editor’da çalıştır.'
      )
      return
    }
    setKonusmalar((onceki) => onceki.filter((k) => k.id !== id))
  }

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
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GeriButonu />
            <Link href="/" className="font-display text-2xl font-semibold text-[var(--renk-ink)] tracking-tight">
              NeedGO
            </Link>
          </div>
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
            const buSiliniyor = silinenId === konusma.id
            return (
              <div
                key={konusma.id}
                className="bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] rounded-lg flex items-center hover:border-[var(--renk-orman)]/40 transition-colors"
              >
                <Link
                  href={`/mesajlar/${konusma.id}`}
                  className="flex-1 min-w-0 p-4 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-semibold text-[var(--renk-ink)] truncate">
                      {konusma.ilanlar?.baslik || 'İlan'}
                    </h3>
                    <p className="text-xs text-[var(--renk-ink)]/50 mt-0.5">
                      {benBasladim ? 'Sen mesaj gönderdin' : 'Sana mesaj geldi'}
                    </p>
                  </div>
                  <span className="text-[var(--renk-ink)]/30 ml-3">›</span>
                </Link>
                <button
                  type="button"
                  onClick={() => konusmayiSil(konusma.id)}
                  disabled={buSiliniyor}
                  title="İş bittiyse konuşmayı ve mesajları sil"
                  className="mr-3 shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border border-red-500/30 text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-60"
                >
                  {buSiliniyor ? 'Siliniyor…' : 'Sil'}
                </button>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
