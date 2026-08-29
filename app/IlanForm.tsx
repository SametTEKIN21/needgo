'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from './lib/supabase'
import type { ModerasyonDurumu } from './lib/moderasyon'
import type { User } from '@supabase/supabase-js'

const MAKS_FOTOGRAF = 5

type SecilenFotograf = { id: string; dosya: File; onizleme: string }

export default function IlanForm({
  kullanici,
  onClose,
  onEklendi,
}: {
  kullanici: User
  onClose: () => void
  onEklendi: () => void
}) {
  const [baslik, setBaslik] = useState('')
  const [aciklama, setAciklama] = useState('')
  const [kategori, setKategori] = useState('')
  const [konum, setKonum] = useState('')
  const [fotograflar, setFotograflar] = useState<SecilenFotograf[]>([])
  const [yukleniyor, setYukleniyor] = useState(false)
  const [asama, setAsama] = useState<string>('')
  const [sonuc, setSonuc] = useState<{ durum: ModerasyonDurumu; not: string | null } | null>(null)

  // Bileşen kapanınca kalan önizleme URL'lerini serbest bırak
  const fotograflarRef = useRef<SecilenFotograf[]>([])
  useEffect(() => {
    fotograflarRef.current = fotograflar
  }, [fotograflar])
  useEffect(() => {
    return () => {
      fotograflarRef.current.forEach((f) => URL.revokeObjectURL(f.onizleme))
    }
  }, [])

  const fotografSecildi = (e: React.ChangeEvent<HTMLInputElement>) => {
    const secilenler = Array.from(e.target.files || [])
    e.target.value = ''
    if (secilenler.length === 0) return

    setFotograflar((mevcut) => {
      const eklenecek = secilenler
        .slice(0, MAKS_FOTOGRAF - mevcut.length)
        .map((dosya) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          dosya,
          onizleme: URL.createObjectURL(dosya),
        }))
      return [...mevcut, ...eklenecek]
    })
  }

  const fotografSil = (id: string) => {
    setFotograflar((mevcut) => {
      const silinecek = mevcut.find((f) => f.id === id)
      if (silinecek) URL.revokeObjectURL(silinecek.onizleme)
      return mevcut.filter((f) => f.id !== id)
    })
  }

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!baslik.trim()) return

    setYukleniyor(true)
    setAsama(fotograflar.length > 0 ? 'Fotoğraflar yükleniyor…' : 'İlan kaydediliyor…')
    const yuklenenUrller: string[] = []

    for (const { dosya } of fotograflar) {
      const uzanti = dosya.name.split('.').pop()
      const dosyaAdi = `${kullanici.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${uzanti}`

      const { error: yuklemeHatasi } = await supabase.storage
        .from('ilan-fotograflari')
        .upload(dosyaAdi, dosya)

      if (yuklemeHatasi) {
        alert('Fotoğraf yüklenemedi: ' + yuklemeHatasi.message)
        setYukleniyor(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('ilan-fotograflari')
        .getPublicUrl(dosyaAdi)

      yuklenenUrller.push(urlData.publicUrl)
    }

    const { data: yeniIlan, error } = await supabase
      .from('ilanlar')
      .insert({
        baslik,
        aciklama,
        kategori,
        konum,
        user_id: kullanici.id,
        fotograf_url: yuklenenUrller[0] || null,
        fotograflar: yuklenenUrller,
        kullanici_email: kullanici.email,
      })
      .select('id')
      .single()

    if (error || !yeniIlan) {
      setYukleniyor(false)
      setAsama('')
      alert('Bir hata oluştu: ' + (error?.message ?? 'ilan kaydedilemedi'))
      return
    }

    // Fotoğrafları otomatik moderasyondan geçir
    let moderasyon: { durum: ModerasyonDurumu; not: string | null } = {
      durum: 'beklemede',
      not: null,
    }
    try {
      setAsama('Fotoğraflar kontrol ediliyor…')
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const yanit = await fetch('/api/moderasyon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ ilanId: yeniIlan.id }),
      })
      if (yanit.ok) {
        moderasyon = await yanit.json()
      }
    } catch (err) {
      console.error('Moderasyon isteği başarısız:', err)
      // moderasyon 'beklemede' kalır — ilan admin onayına düşer
    }

    setYukleniyor(false)
    setAsama('')
    onEklendi()
    setSonuc(moderasyon)
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[var(--renk-ink)]/50 flex items-center justify-center z-50 px-4 py-8 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--renk-kraft)] border border-[var(--renk-cizgi)] rounded-lg shadow-lg w-full max-w-md p-6 my-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-semibold text-[var(--renk-ink)]">Yeni İlan</h2>
          <button onClick={onClose} className="text-[var(--renk-ink)]/50 hover:text-[var(--renk-ink)] text-lg leading-none">✕</button>
        </div>

        {sonuc ? (
          <div className="flex flex-col gap-4">
            {sonuc.durum === 'onaylandi' ? (
              <>
                <p className="text-sm font-semibold text-[var(--renk-orman)]">
                  İlanın yayında! ✓
                </p>
                <p className="text-sm text-[var(--renk-ink)]/70">
                  Fotoğraflar otomatik kontrolden geçti ve ilanın yayınlandı.
                </p>
              </>
            ) : sonuc.durum === 'reddedildi' ? (
              <>
                <p className="text-sm font-semibold text-[#B5533C]">İlan yayınlanamadı</p>
                <p className="text-sm text-[var(--renk-ink)]/70">
                  {sonuc.not ||
                    'Fotoğraflar içerik kurallarına uymuyor. Uygun fotoğraflarla yeni bir ilan oluşturabilirsin.'}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-amber-700">İlanın incelemeye alındı</p>
                <p className="text-sm text-[var(--renk-ink)]/70">
                  {sonuc.not
                    ? sonuc.not + ' '
                    : 'Fotoğraflar otomatik olarak net sonuç vermedi. '}
                  Ekibimiz kısa sürede kontrol edip yayınlayacak. Durumunu “İlanlarım”
                  sayfasından takip edebilirsin.
                </p>
              </>
            )}
            <button
              onClick={onClose}
              className="self-start px-5 py-2.5 rounded-full bg-[var(--renk-orman)] text-white text-sm font-semibold hover:brightness-95 transition"
            >
              Tamam
            </button>
          </div>
        ) : (
        <form onSubmit={gonder} className="flex flex-col gap-3">

          {fotograflar.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {fotograflar.map((foto, index) => (
                <div key={foto.id} className="relative w-16 h-16">
                  <img src={foto.onizleme} alt={`Önizleme ${index + 1}`} className="w-16 h-16 object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => fotografSil(foto.id)}
                    aria-label={`Fotoğraf ${index + 1} kaldır`}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#B5533C] text-white text-xs flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {fotograflar.length < MAKS_FOTOGRAF && (
            <label className="flex items-center gap-4 border border-dashed border-[var(--renk-cizgi)] rounded-md p-3 cursor-pointer hover:border-[var(--renk-orman)] transition-colors">
              <div className="w-16 h-16 rounded-md bg-white flex items-center justify-center text-[var(--renk-ink)]/30 text-2xl">+</div>
              <span className="text-sm text-[var(--renk-ink)]/60">
                Fotoğraf ekle ({fotograflar.length}/{MAKS_FOTOGRAF})
              </span>
              <input type="file" accept="image/*" multiple onChange={fotografSecildi} className="hidden" />
            </label>
          )}

          <input
            placeholder="Eşyanın adı (örn. Kitaplık)"
            value={baslik}
            onChange={(e) => setBaslik(e.target.value)}
            className="px-3 py-2.5 bg-white border border-[var(--renk-cizgi)] rounded-md text-sm placeholder:text-[var(--renk-ink)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--renk-orman)]/40"
          />
          <textarea
            placeholder="Açıklama"
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            rows={3}
            className="px-3 py-2.5 bg-white border border-[var(--renk-cizgi)] rounded-md text-sm placeholder:text-[var(--renk-ink)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--renk-orman)]/40 resize-none"
          />
          <input
            placeholder="Kategori (örn. Mobilya)"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="px-3 py-2.5 bg-white border border-[var(--renk-cizgi)] rounded-md text-sm placeholder:text-[var(--renk-ink)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--renk-orman)]/40"
          />
          <input
            placeholder="Konum (örn. Kadıköy, İstanbul)"
            value={konum}
            onChange={(e) => setKonum(e.target.value)}
            className="px-3 py-2.5 bg-white border border-[var(--renk-cizgi)] rounded-md text-sm placeholder:text-[var(--renk-ink)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--renk-orman)]/40"
          />

          <p className="text-[11px] text-[var(--renk-ink)]/45 leading-relaxed">
            Yüklediğin fotoğraflar otomatik içerik kontrolünden geçer. Uygunsuz
            (müstehcen, yiyecek, tehlikeli, kırık/çöp) görseller yayınlanmaz.
          </p>

          <button
            type="submit"
            disabled={yukleniyor}
            className="mt-1 py-2.5 rounded-md bg-[var(--renk-ocre)] text-white text-sm font-semibold hover:brightness-95 transition disabled:opacity-60"
          >
            {yukleniyor ? asama || 'Ekleniyor…' : 'İlan Ver'}
          </button>
        </form>
        )}
      </div>
    </div>
  )
}
