'use client'

import { useEffect, useState } from 'react'

const POPULER_KONUMLAR = [
  'Bağcılar, İstanbul',
  'Maltepe, İstanbul',
  'Esenyurt, İstanbul',
  'Pendik, İstanbul',
  'Fatih, İstanbul',
  'Kadıköy, İstanbul',
  'Beşiktaş, İstanbul',
  'Üsküdar, İstanbul',
]

const SON_KONUMLAR_KEY = 'needgo-son-konumlar'

function sonKonumlariOku(): string[] {
  try {
    const ham = localStorage.getItem(SON_KONUMLAR_KEY)
    return ham ? (JSON.parse(ham) as string[]) : []
  } catch {
    return []
  }
}

function sonKonumEkle(konum: string) {
  try {
    const mevcut = sonKonumlariOku().filter((k) => k !== konum)
    localStorage.setItem(SON_KONUMLAR_KEY, JSON.stringify([konum, ...mevcut].slice(0, 5)))
  } catch {
    /* localStorage yoksa sessizce geç */
  }
}

function PinIkon({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export default function KonumSecici({
  onClose,
  onSec,
}: {
  onClose: () => void
  onSec: (konum: string | null) => void
}) {
  const [aramaMetni, setAramaMetni] = useState('')
  const [sonKonumlar, setSonKonumlar] = useState<string[]>([])
  const [konumYukleniyor, setKonumYukleniyor] = useState(false)
  const [konumHatasi, setKonumHatasi] = useState<string | null>(null)

  useEffect(() => {
    setSonKonumlar(sonKonumlariOku())
  }, [])

  const konumSec = (konum: string | null) => {
    if (konum) sonKonumEkle(konum)
    onSec(konum)
    onClose()
  }

  const mevcutKonumuKullan = () => {
    if (!('geolocation' in navigator)) {
      setKonumHatasi('Tarayıcın konum erişimini desteklemiyor.')
      return
    }
    setKonumHatasi(null)
    setKonumYukleniyor(true)

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const yanit = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=tr`
          )
          const veri = await yanit.json()
          const ilce =
            veri.locality ||
            veri.city ||
            veri.localityInfo?.administrative?.slice(-1)?.[0]?.name ||
            ''
          const il = veri.principalSubdivision || veri.city || ''
          const konum = [ilce, il].filter(Boolean).join(', ') || 'Mevcut konum'
          konumSec(konum)
        } catch {
          setKonumHatasi('Konum çözümlenemedi, lütfen elle seç.')
        } finally {
          setKonumYukleniyor(false)
        }
      },
      (hata) => {
        setKonumYukleniyor(false)
        setKonumHatasi(
          hata.code === hata.PERMISSION_DENIED
            ? 'Konum izni verilmedi.'
            : 'Konum alınamadı, lütfen elle seç.'
        )
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const gosterilenKonumlar = POPULER_KONUMLAR.filter((konum) =>
    konum.toLowerCase().includes(aramaMetni.toLowerCase())
  )

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[var(--renk-ink)]/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[var(--renk-cizgi)] rounded-2xl shadow-xl w-full max-w-md p-6 my-auto"
      >
        <div className="flex items-center justify-between border-b border-[var(--renk-cizgi)] pb-4 mb-4">
          <h2 className="font-display text-xl font-semibold text-[var(--renk-ink)]">Konum Bul</h2>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="w-8 h-8 rounded-full bg-[var(--renk-kraft)] text-[var(--renk-ink)]/60 hover:text-[var(--renk-ink)] flex items-center justify-center text-sm leading-none"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-2 bg-[var(--renk-kraft)] border border-[var(--renk-cizgi)] rounded-full px-4 py-3 mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[var(--renk-orman)]">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            placeholder="İl, ilçe veya semt ara…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--renk-ink)]/40"
          />
        </div>

        <button
          onClick={mevcutKonumuKullan}
          disabled={konumYukleniyor}
          className="w-full text-left flex items-center gap-3 bg-[var(--renk-orman)]/10 border border-[var(--renk-orman)]/20 rounded-xl px-4 py-3 mb-2 hover:bg-[var(--renk-orman)]/15 transition-colors disabled:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[var(--renk-orman)]">
            <path d="M22 2 11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 2 15 22l-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <span>
            <span className="block text-sm font-semibold text-[var(--renk-orman)]">
              {konumYukleniyor ? 'Konum alınıyor…' : 'Mevcut konumu kullan'}
            </span>
            <span className="block text-xs text-[var(--renk-ink)]/60">
              Konum izni ver, en yakın seçenekleri listeleyelim.
            </span>
          </span>
        </button>
        {konumHatasi && (
          <p className="text-xs text-[#B5533C] mb-2 px-1">{konumHatasi}</p>
        )}

        <div className="mt-4">
          <h3 className="font-display text-sm font-semibold text-[var(--renk-ink)] mb-2">
            Son Kullanılan Konumlar
          </h3>
          {sonKonumlar.length === 0 ? (
            <p className="text-sm text-[var(--renk-ink)]/50">Henüz bir konum seçmedin.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sonKonumlar.map((konum) => (
                <button
                  key={konum}
                  onClick={() => konumSec(konum)}
                  className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-full border border-[var(--renk-cizgi)] text-[var(--renk-ink)]/80 hover:border-[var(--renk-orman)] hover:text-[var(--renk-orman)] transition-colors"
                >
                  <PinIkon className="text-[var(--renk-orman)]" />
                  {konum}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[var(--renk-cizgi)] mt-4 pt-4">
          <h3 className="font-display text-sm font-semibold text-[var(--renk-ink)] mb-3">
            Popüler Konumlar
          </h3>
          <div className="flex flex-wrap gap-2">
            {gosterilenKonumlar.map((konum) => (
              <button
                key={konum}
                onClick={() => konumSec(konum)}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-full border border-[var(--renk-cizgi)] text-[var(--renk-ink)]/80 hover:border-[var(--renk-orman)] hover:text-[var(--renk-orman)] transition-colors"
              >
                <PinIkon className="text-[var(--renk-orman)]" />
                {konum}
              </button>
            ))}
            {gosterilenKonumlar.length === 0 && (
              <p className="text-sm text-[var(--renk-ink)]/50 italic">Sonuç bulunamadı.</p>
            )}
          </div>

          <button
            onClick={() => konumSec(null)}
            className="mt-4 text-xs text-[var(--renk-ink)]/50 hover:text-[var(--renk-orman)] transition-colors"
          >
            Konum filtresini temizle
          </button>
        </div>
      </div>
    </div>
  )
}
