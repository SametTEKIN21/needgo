'use client'

import { useState } from 'react'
import { supabase } from './lib/supabase'
import type { User } from '@supabase/supabase-js'

const MAKS_FOTOGRAF = 5

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
  const [fotograflar, setFotograflar] = useState<File[]>([])
  const [onizlemeler, setOnizlemeler] = useState<string[]>([])
  const [yukleniyor, setYukleniyor] = useState(false)

  const fotografSecildi = (e: React.ChangeEvent<HTMLInputElement>) => {
    const secilenler = Array.from(e.target.files || [])
    if (secilenler.length === 0) return

    const toplam = [...fotograflar, ...secilenler].slice(0, MAKS_FOTOGRAF)
    setFotograflar(toplam)
    setOnizlemeler(toplam.map((dosya) => URL.createObjectURL(dosya)))
    e.target.value = ''
  }

  const fotografSil = (index: number) => {
    const yeniListe = fotograflar.filter((_, i) => i !== index)
    setFotograflar(yeniListe)
    setOnizlemeler(yeniListe.map((dosya) => URL.createObjectURL(dosya)))
  }

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!baslik.trim()) return

    setYukleniyor(true)
    const yuklenenUrller: string[] = []

    for (const dosya of fotograflar) {
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

    const { error } = await supabase.from('ilanlar').insert({
      baslik,
      aciklama,
      kategori,
      konum,
      user_id: kullanici.id,
      fotograf_url: yuklenenUrller[0] || null,
      fotograflar: yuklenenUrller,
      kullanici_email: kullanici.email,
    })
    setYukleniyor(false)

    if (error) {
      alert('Bir hata oluştu: ' + error.message)
      return
    }

    onEklendi()
    onClose()
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

        <form onSubmit={gonder} className="flex flex-col gap-3">

          {onizlemeler.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {onizlemeler.map((url, index) => (
                <div key={index} className="relative w-16 h-16">
                  <img src={url} alt={`Önizleme ${index + 1}`} className="w-16 h-16 object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => fotografSil(index)}
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

          <button
            type="submit"
            disabled={yukleniyor}
            className="mt-1 py-2.5 rounded-md bg-[var(--renk-ocre)] text-white text-sm font-semibold hover:brightness-95 transition disabled:opacity-60"
          >
            {yukleniyor ? 'Ekleniyor…' : 'İlan Ver'}
          </button>
        </form>
      </div>
    </div>
  )
}
