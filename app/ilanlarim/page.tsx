'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import GeriButonu from '../GeriButonu'
import { supabase } from '../lib/supabase'
import { alinanEsyaSayisi, AYLIK_ALMA_HAKKI } from '../lib/kota'
import type { User } from '@supabase/supabase-js'

type Aday = { gonderen_id: string; gonderen_email: string | null; kotaDolu: boolean }

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

  const [bagisPaneliId, setBagisPaneliId] = useState<string | null>(null)
  const [adaylar, setAdaylar] = useState<Aday[]>([])
  const [seciliAlici, setSeciliAlici] = useState('')
  const [panelYukleniyor, setPanelYukleniyor] = useState(false)
  const [bagisHata, setBagisHata] = useState('')

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
    // 'aktif'e dönerken bağış kaydını da temizle (alıcının hakkı iade olur)
    const guncelleme =
      yeniDurum === 'aktif'
        ? { durum: yeniDurum, alici_id: null, bagis_tarihi: null }
        : { durum: yeniDurum }
    const { error } = await supabase.from('ilanlar').update(guncelleme).eq('id', id)
    setIslemdekiId(null)

    if (error) {
      alert('Güncellenemedi: ' + error.message)
      return
    }

    setIlanlar((mevcut) =>
      mevcut.map((ilan) => (ilan.id === id ? { ...ilan, durum: yeniDurum } : ilan))
    )
  }

  const bagisPaneliAc = async (ilanId: string) => {
    setBagisHata('')
    setSeciliAlici('')
    setBagisPaneliId(ilanId)
    setAdaylar([])
    setPanelYukleniyor(true)

    const { data } = await supabase
      .from('konusmalar')
      .select('gonderen_id, gonderen_email')
      .eq('ilan_id', ilanId)

    const benzersiz = new Map<string, string | null>()
    for (const k of data ?? []) {
      if (!benzersiz.has(k.gonderen_id)) benzersiz.set(k.gonderen_id, k.gonderen_email ?? null)
    }

    const liste: Aday[] = await Promise.all(
      [...benzersiz.entries()].map(async ([gonderen_id, gonderen_email]) => ({
        gonderen_id,
        gonderen_email,
        kotaDolu: (await alinanEsyaSayisi(gonderen_id)) >= AYLIK_ALMA_HAKKI,
      }))
    )

    setAdaylar(liste)
    setPanelYukleniyor(false)
  }

  const bagisPaneliKapat = () => {
    setBagisPaneliId(null)
    setAdaylar([])
    setSeciliAlici('')
    setBagisHata('')
  }

  const bagisOnayla = async (ilanId: string) => {
    if (!seciliAlici) return
    setBagisHata('')
    setIslemdekiId(ilanId)

    const { error } = await supabase
      .from('ilanlar')
      .update({ durum: 'bagislandi', alici_id: seciliAlici, bagis_tarihi: new Date().toISOString() })
      .eq('id', ilanId)

    setIslemdekiId(null)

    if (error) {
      setBagisHata(
        error.message.includes('KOTA_DOLU')
          ? 'Bu kişi son 30 günde zaten 3 eşya aldı, şu an bağış yapılamaz.'
          : 'Kaydedilemedi: ' + error.message
      )
      return
    }

    setIlanlar((mevcut) =>
      mevcut.map((ilan) => (ilan.id === ilanId ? { ...ilan, durum: 'bagislandi' } : ilan))
    )
    bagisPaneliKapat()
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
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between gap-3">
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
                        onClick={() =>
                          bagisPaneliId === ilan.id ? bagisPaneliKapat() : bagisPaneliAc(ilan.id)
                        }
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

                  {bagisPaneliId === ilan.id && (
                    <div className="mt-3 border border-[var(--renk-cizgi)] rounded-lg p-3 bg-[var(--renk-kraft)]">
                      {panelYukleniyor ? (
                        <p className="text-xs text-[var(--renk-ink)]/50">Yükleniyor…</p>
                      ) : adaylar.length === 0 ? (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-[var(--renk-ink)]/60">
                            Bu ilana kimse mesaj atmadı. Alıcısız işaretlersen kimseye kota
                            işlenmez.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                await durumDegistir(ilan.id, 'bagislandi')
                                bagisPaneliKapat()
                              }}
                              disabled={islemdekiId === ilan.id}
                              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--renk-orman)] text-[var(--renk-kraft)] hover:bg-[var(--renk-orman-koyu)] transition-colors disabled:opacity-50"
                            >
                              Alıcısız işaretle
                            </button>
                            <button
                              onClick={bagisPaneliKapat}
                              className="text-xs font-medium px-3 py-1.5 rounded-full border border-[var(--renk-ink)]/20 text-[var(--renk-ink)]"
                            >
                              Vazgeç
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-semibold text-[var(--renk-ink)]">
                            Kime bağışladın?
                          </p>
                          {adaylar.map((aday) => (
                            <label
                              key={aday.gonderen_id}
                              className={`flex items-center gap-2 text-xs ${
                                aday.kotaDolu
                                  ? 'text-[var(--renk-ink)]/40'
                                  : 'text-[var(--renk-ink)]'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`alici-${ilan.id}`}
                                value={aday.gonderen_id}
                                disabled={aday.kotaDolu}
                                checked={seciliAlici === aday.gonderen_id}
                                onChange={(e) => setSeciliAlici(e.target.value)}
                              />
                              {aday.gonderen_email || aday.gonderen_id.slice(0, 8)}
                              {aday.kotaDolu && ' — kota dolu'}
                            </label>
                          ))}
                          {bagisHata && <p className="text-xs text-[#B5533C]">{bagisHata}</p>}
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={() => bagisOnayla(ilan.id)}
                              disabled={!seciliAlici || islemdekiId === ilan.id}
                              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--renk-orman)] text-[var(--renk-kraft)] hover:bg-[var(--renk-orman-koyu)] transition-colors disabled:opacity-50"
                            >
                              Onayla
                            </button>
                            <button
                              onClick={bagisPaneliKapat}
                              className="text-xs font-medium px-3 py-1.5 rounded-full border border-[var(--renk-ink)]/20 text-[var(--renk-ink)]"
                            >
                              Vazgeç
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
