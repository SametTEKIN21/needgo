'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

type Ilan = {
  id: string
  baslik: string
  aciklama: string | null
  kategori: string | null
  konum: string | null
  fotograf_url: string | null
  olusturulma_tarihi: string
  durum: string | null
  goruntulenme_sayisi: number | null
  begeni_sayisi: number | null
}

export default function Ilanlarim() {
  const [kullanici, setKullanici] = useState<User | null>(null)
  const [ilanlar, setIlanlar] = useState<Ilan[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [islemdekiId, setIslemdekiId] = useState<string | null>(null)

  const ilanlariGetir = async (userId: string) => {
    const { data, error } = await supabase
      .from('ilanlar')
      .select('*')
      .eq('user_id', userId)
      .order('olusturulma_tarihi', { ascending: false })

    if (!error) {
      setIlanlar(data as Ilan[])
    }
    setYukleniyor(false)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setKullanici(data.user)
      if (data.user) {
        ilanlariGetir(data.user.id)
      } else {
        setYukleniyor(false)
      }
    })
  }, [])

  const durumDegistir = async (id: string, yeniDurum: string) => {
    setIslemdekiId(id)
    const { error } = await supabase
      .from('ilanlar')
      .update({ durum: yeniDurum })
      .eq('id', id)
    setIslemdekiId(null)

    if (error) {
      alert('Güncellenemedi: ' + error.message)
      return
    }

    setIlanlar((mevcut) =>
      mevcut.map((ilan) => (ilan.id === id ? { ...ilan, durum: yeniDurum } : ilan))
    )
  }

  const ilanSil = async (id: string) => {
    const onay = window.confirm('Bu ilanı kalıcı olarak silmek istediğine emin misin?')
    if (!onay) return

    setIslemdekiId(id)
    const { error } = await supabase.from('ilanlar').delete().eq('id', id)
    setIslemdekiId(null)

    if (error) {
      alert('Silinemedi: ' + error.message)
      return
    }

    setIlanlar((mevcut) => mevcut.filter((ilan) => ilan.id !== id))
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
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
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

      <main className="max-w-3xl mx-auto px-5 py-10">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--renk-ink)] mb-1">
          İlanlarım
        </h1>
        <p className="font-mono-etiket text-[11px] uppercase tracking-widest text-[var(--renk-ink)]/50 mb-8">
          {ilanlar.length} ilan
        </p>

        {ilanlar.length === 0 && (
          <p className="text-sm text-[var(--renk-ink)]/50 italic">Henüz ilan vermedin.</p>
        )}

        <div className="flex flex-col gap-4">
          {ilanlar.map((ilan) => {
            const aktifMi = ilan.durum !== 'bagislandi'
            const tarih = new Date(ilan.olusturulma_tarihi).toLocaleDateString('tr-TR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })

            return (
              <div
                key={ilan.id}
                className="bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] rounded-lg overflow-hidden shadow-sm p-4 flex gap-4"
              >
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-md overflow-hidden bg-[var(--renk-kraft)] shrink-0">
                  {ilan.fotograf_url ? (
                    <img src={ilan.fotograf_url} alt={ilan.baslik} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--renk-ink)]/20 font-display text-xl">
                      NG
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`font-mono-etiket text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        aktifMi
                          ? 'bg-[var(--renk-orman)]/10 text-[var(--renk-orman)]'
                          : 'bg-[var(--renk-ink)]/10 text-[var(--renk-ink)]/60'
                      }`}
                    >
                      {aktifMi ? 'Aktif' : 'Bağışlandı'}
                    </span>
                  </div>

                  <Link
                    href={`/ilan/${ilan.id}`}
                    className="font-display text-base sm:text-lg font-semibold text-[var(--renk-ink)] hover:text-[var(--renk-orman)] transition-colors truncate block"
                  >
                    {ilan.baslik}
                  </Link>

                  {ilan.kategori && (
                    <p className="text-xs text-[var(--renk-ink)]/50 mt-0.5">{ilan.kategori}</p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-[var(--renk-ink)]/50">
                    <span>👁 {ilan.goruntulenme_sayisi || 0}</span>
                    <span>♥ {ilan.begeni_sayisi || 0}</span>
                    <span className="hidden sm:inline">· Yayın: {tarih}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {aktifMi ? (
                      <button
                        onClick={() => durumDegistir(ilan.id, 'bagislandi')}
                        disabled={islemdekiId === ilan.id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--renk-orman)] text-[var(--renk-kraft)] hover:bg-[var(--renk-orman-koyu)] transition-colors disabled:opacity-50"
                      >
                        Bağışlandı İşaretle
                      </button>
                    ) : (
                      <button
                        onClick={() => durumDegistir(ilan.id, 'aktif')}
                        disabled={islemdekiId === ilan.id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[var(--renk-orman)] text-[var(--renk-orman)] hover:bg-[var(--renk-orman)] hover:text-[var(--renk-kraft)] transition-colors disabled:opacity-50"
                      >
                        Yeniden Yayınla
                      </button>
                    )}
                    <button
                      onClick={() => ilanSil(ilan.id)}
                      disabled={islemdekiId === ilan.id}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#B5533C]/40 text-[#B5533C] hover:bg-[#B5533C] hover:text-white transition-colors disabled:opacity-50"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
