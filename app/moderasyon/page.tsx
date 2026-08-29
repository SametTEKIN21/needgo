'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import GeriButonu from '../GeriButonu'
import { supabase } from '../lib/supabase'
import { adminMi } from '../lib/moderasyon'
import type { User } from '@supabase/supabase-js'

type BekleyenIlan = {
  id: string
  baslik: string
  aciklama: string | null
  kategori: string | null
  konum: string | null
  fotograflar: string[] | null
  fotograf_url: string | null
  kullanici_email: string | null
  moderasyon_notu: string | null
  olusturulma_tarihi: string
}

type Sikayet = {
  id: string
  ilan_id: string
  sikayet_eden_email: string | null
  sebep: string
  aciklama: string | null
  olusturulma_tarihi: string
  ilanlar: { baslik: string; moderasyon_durumu: string | null } | null
}

export default function ModerasyonPaneli() {
  const [kullanici, setKullanici] = useState<User | null>(null)
  const [kontrolBitti, setKontrolBitti] = useState(false)
  const [bekleyenler, setBekleyenler] = useState<BekleyenIlan[]>([])
  const [sikayetler, setSikayetler] = useState<Sikayet[]>([])
  const [islemdeki, setIslemdeki] = useState<string | null>(null)

  const yetkili = adminMi(kullanici?.email)

  const verileriGetir = async () => {
    const [{ data: ilanData }, { data: sikayetData }] = await Promise.all([
      supabase
        .from('ilanlar')
        .select(
          'id, baslik, aciklama, kategori, konum, fotograflar, fotograf_url, kullanici_email, moderasyon_notu, olusturulma_tarihi'
        )
        .eq('moderasyon_durumu', 'beklemede')
        .order('olusturulma_tarihi', { ascending: true }),
      supabase
        .from('sikayetler')
        .select('*, ilanlar(baslik, moderasyon_durumu)')
        .eq('durum', 'yeni')
        .order('olusturulma_tarihi', { ascending: false }),
    ])
    setBekleyenler((ilanData as BekleyenIlan[]) ?? [])
    setSikayetler((sikayetData as unknown as Sikayet[]) ?? [])
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setKullanici(data.user)
      if (adminMi(data.user?.email)) {
        await verileriGetir()
      }
      setKontrolBitti(true)
    })
  }, [])

  const ilanKarar = async (id: string, durum: 'onaylandi' | 'reddedildi') => {
    setIslemdeki(id)
    const { error } = await supabase
      .from('ilanlar')
      .update({
        moderasyon_durumu: durum,
        moderasyon_notu: durum === 'reddedildi' ? 'Yönetici tarafından reddedildi.' : null,
        moderasyon_tarihi: new Date().toISOString(),
      })
      .eq('id', id)
    setIslemdeki(null)
    if (error) {
      alert('İşlem başarısız: ' + error.message)
      return
    }
    setBekleyenler((m) => m.filter((i) => i.id !== id))
  }

  const sikayetKapat = async (id: string) => {
    setIslemdeki(id)
    const { error } = await supabase
      .from('sikayetler')
      .update({ durum: 'incelendi' })
      .eq('id', id)
    setIslemdeki(null)
    if (error) {
      alert('İşlem başarısız: ' + error.message)
      return
    }
    setSikayetler((m) => m.filter((s) => s.id !== id))
  }

  const sikayetliIlaniReddet = async (sikayet: Sikayet) => {
    setIslemdeki(sikayet.id)
    await supabase
      .from('ilanlar')
      .update({
        moderasyon_durumu: 'reddedildi',
        moderasyon_notu: `Şikayet üzerine kaldırıldı: ${sikayet.sebep}`,
        moderasyon_tarihi: new Date().toISOString(),
      })
      .eq('id', sikayet.ilan_id)
    await supabase.from('sikayetler').update({ durum: 'incelendi' }).eq('id', sikayet.id)
    setIslemdeki(null)
    setSikayetler((m) => m.filter((s) => s.id !== sikayet.id))
  }

  const fotolar = (i: BekleyenIlan) =>
    i.fotograflar && i.fotograflar.length > 0
      ? i.fotograflar
      : i.fotograf_url
        ? [i.fotograf_url]
        : []

  if (!kontrolBitti) {
    return (
      <div className="min-h-screen bg-[var(--renk-kraft)] flex items-center justify-center">
        <p className="text-sm text-[var(--renk-ink)]/50">Yükleniyor…</p>
      </div>
    )
  }

  if (!yetkili) {
    return (
      <div className="min-h-screen bg-[var(--renk-kraft)] flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-[var(--renk-ink)]/50">Bu sayfaya erişim yetkin yok.</p>
        <Link href="/" className="text-sm font-semibold text-[var(--renk-orman)] hover:underline">
          Ana sayfaya dön
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--renk-kraft)]">
      <header className="sticky top-0 z-40 bg-[var(--renk-kraft)]/95 backdrop-blur border-b border-[var(--renk-cizgi)]">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center gap-2">
          <GeriButonu />
          <Link
            href="/"
            className="font-display text-2xl font-semibold text-[var(--renk-ink)] tracking-tight"
          >
            NeedGO
          </Link>
          <span className="font-mono-etiket text-[11px] uppercase tracking-widest text-[var(--renk-ink)]/50 ml-2">
            Moderasyon
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10 flex flex-col gap-12">
        <section>
          <h1 className="font-display text-xl font-semibold text-[var(--renk-ink)] mb-1">
            İnceleme bekleyen ilanlar
          </h1>
          <p className="text-xs text-[var(--renk-ink)]/50 mb-6">{bekleyenler.length} ilan</p>

          {bekleyenler.length === 0 && (
            <p className="text-sm text-[var(--renk-ink)]/50 italic">Bekleyen ilan yok.</p>
          )}

          <div className="flex flex-col gap-5">
            {bekleyenler.map((ilan) => (
              <div
                key={ilan.id}
                className="bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] rounded-lg p-4"
              >
                {fotolar(ilan).length > 0 && (
                  <div className="flex gap-2 overflow-x-auto mb-3">
                    {fotolar(ilan).map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="shrink-0">
                        <img
                          src={url}
                          alt={`Foto ${i + 1}`}
                          className="w-28 h-28 object-cover rounded-md border border-[var(--renk-cizgi)]"
                        />
                      </a>
                    ))}
                  </div>
                )}
                <h2 className="font-display text-base font-semibold text-[var(--renk-ink)]">
                  {ilan.baslik}
                </h2>
                <p className="text-xs text-[var(--renk-ink)]/50 mt-0.5">
                  {[ilan.kategori, ilan.konum, ilan.kullanici_email].filter(Boolean).join(' · ')}
                </p>
                {ilan.aciklama && (
                  <p className="text-sm text-[var(--renk-ink)]/75 mt-2 whitespace-pre-wrap">
                    {ilan.aciklama}
                  </p>
                )}
                {ilan.moderasyon_notu && (
                  <p className="text-xs text-amber-700 mt-2">Otomatik not: {ilan.moderasyon_notu}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => ilanKarar(ilan.id, 'onaylandi')}
                    disabled={islemdeki === ilan.id}
                    className="text-xs font-semibold px-4 py-2 rounded-full bg-[var(--renk-orman)] text-white hover:brightness-95 transition disabled:opacity-50"
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => ilanKarar(ilan.id, 'reddedildi')}
                    disabled={islemdeki === ilan.id}
                    className="text-xs font-semibold px-4 py-2 rounded-full border border-[#B5533C]/40 text-[#B5533C] hover:bg-[#B5533C] hover:text-white transition disabled:opacity-50"
                  >
                    Reddet
                  </button>
                  <Link
                    href={`/ilan/${ilan.id}`}
                    className="text-xs font-medium px-4 py-2 rounded-full border border-[var(--renk-ink)]/20 text-[var(--renk-ink)]"
                  >
                    İlanı Aç
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h1 className="font-display text-xl font-semibold text-[var(--renk-ink)] mb-1">
            Şikayetler
          </h1>
          <p className="text-xs text-[var(--renk-ink)]/50 mb-6">{sikayetler.length} yeni</p>

          {sikayetler.length === 0 && (
            <p className="text-sm text-[var(--renk-ink)]/50 italic">Yeni şikayet yok.</p>
          )}

          <div className="flex flex-col gap-4">
            {sikayetler.map((s) => (
              <div
                key={s.id}
                className="bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] rounded-lg p-4"
              >
                <p className="text-sm font-semibold text-[var(--renk-ink)]">
                  {s.ilanlar?.baslik || 'İlan'}{' '}
                  {s.ilanlar?.moderasyon_durumu === 'reddedildi' && (
                    <span className="text-xs font-normal text-[#B5533C]">(zaten reddedilmiş)</span>
                  )}
                </p>
                <p className="text-xs text-[#B5533C] mt-1">{s.sebep}</p>
                {s.aciklama && (
                  <p className="text-sm text-[var(--renk-ink)]/70 mt-1">{s.aciklama}</p>
                )}
                <p className="text-[11px] text-[var(--renk-ink)]/40 mt-1">
                  {s.sikayet_eden_email || 'anonim'} ·{' '}
                  {new Date(s.olusturulma_tarihi).toLocaleDateString('tr-TR')}
                </p>
                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/ilan/${s.ilan_id}`}
                    className="text-xs font-medium px-4 py-2 rounded-full border border-[var(--renk-ink)]/20 text-[var(--renk-ink)]"
                  >
                    İlanı Aç
                  </Link>
                  <button
                    onClick={() => sikayetliIlaniReddet(s)}
                    disabled={islemdeki === s.id}
                    className="text-xs font-semibold px-4 py-2 rounded-full border border-[#B5533C]/40 text-[#B5533C] hover:bg-[#B5533C] hover:text-white transition disabled:opacity-50"
                  >
                    İlanı Kaldır
                  </button>
                  <button
                    onClick={() => sikayetKapat(s.id)}
                    disabled={islemdeki === s.id}
                    className="text-xs font-medium px-4 py-2 rounded-full border border-[var(--renk-ink)]/20 text-[var(--renk-ink)] disabled:opacity-50"
                  >
                    İncelendi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
