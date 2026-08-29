'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { kotaDurumu, tarihMetni, type KotaDurumu } from '../../lib/kota'
import { profilTamMi } from '../../lib/profil'
import type { User } from '@supabase/supabase-js'

type Ilan = {
  id: string
  baslik: string
  aciklama: string | null
  kategori: string | null
  konum: string | null
  fotograf_url: string | null
  fotograflar: string[] | null
  kullanici_email: string | null
  user_id: string | null
  olusturulma_tarihi: string
  goruntulenme_sayisi: number | null
  begeni_sayisi: number | null
}

export default function IlanDetay() {
  const params = useParams()
  const router = useRouter()
  const [ilan, setIlan] = useState<Ilan | null>(null)
  const [kullanici, setKullanici] = useState<User | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [mesajGonderiliyor, setMesajGonderiliyor] = useState(false)
  const [kota, setKota] = useState<KotaDurumu | null>(null)
  const [kotaHata, setKotaHata] = useState('')
  const [mevcutKonusmaVar, setMevcutKonusmaVar] = useState(false)
  const [begenildi, setBegenildi] = useState(false)
  const [aktifFoto, setAktifFoto] = useState(0)
  const sayacArtirildi = useRef(false)

  useEffect(() => {
    const getir = async () => {
      const { data: userData } = await supabase.auth.getUser()
      setKullanici(userData.user)

      const { data, error } = await supabase
        .from('ilanlar')
        .select('*')
        .eq('id', params.id)
        .single()

      if (!error) {
        setIlan(data as Ilan)

        if (userData.user && (data as Ilan).user_id !== userData.user.id) {
          kotaDurumu(userData.user.id).then(setKota).catch(() => {})
          supabase
            .from('konusmalar')
            .select('id')
            .eq('ilan_id', (data as Ilan).id)
            .eq('gonderen_id', userData.user.id)
            .maybeSingle()
            .then(({ data: k }) => setMevcutKonusmaVar(!!k))
        }

        if (!sayacArtirildi.current) {
          sayacArtirildi.current = true
          const yeniGoruntulenme = ((data as Ilan).goruntulenme_sayisi || 0) + 1
          await supabase
            .from('ilanlar')
            .update({ goruntulenme_sayisi: yeniGoruntulenme })
            .eq('id', params.id)
        }

        const begeniliListe = JSON.parse(localStorage.getItem('begenilenIlanlar') || '[]')
        if (begeniliListe.includes(params.id)) {
          setBegenildi(true)
        }
      }
      setYukleniyor(false)
    }
    getir()
  }, [params.id])

  const begen = async () => {
    if (!ilan || begenildi) return

    const yeniBegeni = (ilan.begeni_sayisi || 0) + 1
    const { error } = await supabase
      .from('ilanlar')
      .update({ begeni_sayisi: yeniBegeni })
      .eq('id', ilan.id)

    if (!error) {
      setIlan({ ...ilan, begeni_sayisi: yeniBegeni })
      setBegenildi(true)
      const begeniliListe = JSON.parse(localStorage.getItem('begenilenIlanlar') || '[]')
      begeniliListe.push(ilan.id)
      localStorage.setItem('begenilenIlanlar', JSON.stringify(begeniliListe))
    }
  }

  const mesajGonder = async () => {
    if (!ilan || !kullanici) return

    setKotaHata('')
    setMesajGonderiliyor(true)

    const { data: mevcut } = await supabase
      .from('konusmalar')
      .select('id')
      .eq('ilan_id', ilan.id)
      .eq('gonderen_id', kullanici.id)
      .maybeSingle()

    if (mevcut) {
      router.push(`/mesajlar/${mevcut.id}`)
      return
    }

    // Yeni istek — profil eksikse önce profile yönlendir
    if (!profilTamMi(kullanici)) {
      setMesajGonderiliyor(false)
      router.push('/profil')
      return
    }

    // Yeni istek — kota dolu ise engelle
    if (kota && kota.kalan === 0) {
      setMesajGonderiliyor(false)
      setKotaHata(
        kota.yenilenmeTarihi
          ? `Son 30 günde 3 eşya aldın. Yeni istek gönderebilmen için ${tarihMetni(
              kota.yenilenmeTarihi
            )} tarihini beklemelisin.`
          : 'Son 30 günde 3 eşya aldın. Yeni istek gönderemezsin.'
      )
      return
    }

    const { data: yeniKonusma, error } = await supabase
      .from('konusmalar')
      .insert({
        ilan_id: ilan.id,
        gonderen_id: kullanici.id,
        alici_id: ilan.user_id,
        gonderen_email: kullanici.email,
      })
      .select('id')
      .single()

    setMesajGonderiliyor(false)

    if (error) {
      alert('Bir hata oluştu: ' + error.message)
      return
    }

    router.push(`/mesajlar/${yeniKonusma.id}`)
  }

  if (yukleniyor) {
    return (
      <div className="min-h-screen bg-[var(--renk-kraft)] flex items-center justify-center">
        <p className="text-sm text-[var(--renk-ink)]/50">Yükleniyor…</p>
      </div>
    )
  }

  if (!ilan) {
    return (
      <div className="min-h-screen bg-[var(--renk-kraft)] flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-[var(--renk-ink)]/50">İlan bulunamadı.</p>
        <Link href="/" className="text-sm font-semibold text-[var(--renk-orman)] hover:underline">
          Ana sayfaya dön
        </Link>
      </div>
    )
  }

  const tarih = new Date(ilan.olusturulma_tarihi).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const kendiIlaniMi = kullanici && ilan.user_id === kullanici.id

  const fotoListesi: string[] =
    ilan.fotograflar && ilan.fotograflar.length > 0
      ? ilan.fotograflar
      : ilan.fotograf_url
      ? [ilan.fotograf_url]
      : []

  return (
    <div className="min-h-screen bg-[var(--renk-kraft)]">
      <header className="sticky top-0 z-40 bg-[var(--renk-kraft)]/95 backdrop-blur border-b border-[var(--renk-cizgi)]">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl font-semibold text-[var(--renk-ink)] tracking-tight">
            NeedGO
          </Link>
          <button
            onClick={() => router.back()}
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-[var(--renk-ink)]/20 text-[var(--renk-ink)] hover:bg-[var(--renk-ink)] hover:text-[var(--renk-kraft)] transition-colors"
          >
            ← Geri
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-10">
        <div className="bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] rounded-lg overflow-hidden shadow-sm">

          <div className="relative aspect-video bg-[var(--renk-kraft)]">
            {fotoListesi.length > 0 ? (
              <img src={fotoListesi[aktifFoto]} alt={ilan.baslik} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--renk-ink)]/20 font-display text-5xl">
                NG
              </div>
            )}
            <div className="absolute top-4 right-4 rotate-6 border-2 border-[var(--renk-orman)] text-[var(--renk-orman)] font-mono-etiket text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-sm bg-[var(--renk-kart)]">
              Ücretsiz
            </div>
          </div>

          {fotoListesi.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto border-b border-[var(--renk-cizgi)]">
              {fotoListesi.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setAktifFoto(index)}
                  className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                    aktifFoto === index ? 'border-[var(--renk-orman)]' : 'border-transparent'
                  }`}
                >
                  <img src={url} alt={`Fotoğraf ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--renk-ink)]">
                {ilan.baslik}
              </h1>
              <button
                onClick={begen}
                disabled={begenildi}
                className={`shrink-0 flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  begenildi
                    ? 'border-[var(--renk-orman)] text-[var(--renk-orman)] bg-[var(--renk-orman)]/10'
                    : 'border-[var(--renk-ink)]/20 text-[var(--renk-ink)] hover:border-[var(--renk-orman)] hover:text-[var(--renk-orman)]'
                }`}
              >
                {begenildi ? '♥' : '♡'} {ilan.begeni_sayisi || 0}
              </button>
            </div>

            <div className="font-mono-etiket text-[11px] uppercase tracking-wide text-[var(--renk-ink)]/50 mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {ilan.kategori && <span>{ilan.kategori}</span>}
              {ilan.konum && <span>· {ilan.konum}</span>}
              <span>· {tarih}</span>
              <span>· {ilan.goruntulenme_sayisi || 0} görüntülenme</span>
            </div>

            {ilan.aciklama && (
              <p className="text-sm sm:text-base text-[var(--renk-ink)]/80 mt-6 leading-relaxed whitespace-pre-wrap">
                {ilan.aciklama}
              </p>
            )}

            <div className="mt-8 pt-6 border-t border-[var(--renk-cizgi)]">
              {kendiIlaniMi && (
                <p className="text-xs text-[var(--renk-ink)]/50">
                  Bu senin kendi ilanın.
                </p>
              )}
              {!kendiIlaniMi && kullanici && (() => {
                const profilEksik = !profilTamMi(kullanici) && !mevcutKonusmaVar
                const kotaDolu = !profilEksik && !!kota && kota.kalan === 0 && !mevcutKonusmaVar
                return (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={mesajGonder}
                      disabled={mesajGonderiliyor || kotaDolu || profilEksik}
                      className="self-start inline-block text-sm font-semibold px-5 py-2.5 rounded-full bg-[var(--renk-orman)] text-[var(--renk-kraft)] hover:bg-[var(--renk-orman-koyu)] transition-colors disabled:opacity-60"
                    >
                      {mesajGonderiliyor
                        ? 'Açılıyor…'
                        : mevcutKonusmaVar
                        ? 'Sohbete Dön'
                        : 'Mesaj Gönder'}
                    </button>

                    {profilEksik && (
                      <p className="text-xs text-[#B5533C]">
                        Mesaj göndermeden önce{' '}
                        <Link href="/profil" className="font-semibold underline">
                          profil bilgilerini
                        </Link>{' '}
                        tamamlamalısın.
                      </p>
                    )}
                    {kotaDolu && (
                      <p className="text-xs text-[#B5533C]">
                        {kota?.yenilenmeTarihi
                          ? `Son 30 günde 3 eşya aldın. Yeni istek gönderebilmen için ${tarihMetni(
                              kota.yenilenmeTarihi
                            )} tarihini beklemelisin.`
                          : 'Son 30 günde 3 eşya aldın. Yeni istek gönderemezsin.'}
                      </p>
                    )}
                    {!kotaDolu && kotaHata && (
                      <p className="text-xs text-[#B5533C]">{kotaHata}</p>
                    )}
                    {!kotaDolu && !mevcutKonusmaVar && kota && kota.kalan > 0 && kota.kalan < 3 && (
                      <p className="text-xs text-[var(--renk-ink)]/50">
                        Kalan alma hakkın: {kota.kalan}/3 (son 30 gün)
                      </p>
                    )}
                  </div>
                )
              })()}
              {!kendiIlaniMi && !kullanici && (
                <p className="text-xs text-[var(--renk-ink)]/50">
                  İlan sahibiyle mesajlaşmak için giriş yapmalısın.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
