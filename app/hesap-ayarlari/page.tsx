'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function HesapAyarlari() {
  const [kullanici, setKullanici] = useState<User | null>(null)
  const [kontrolBitti, setKontrolBitti] = useState(false)

  const [yeniEmail, setYeniEmail] = useState('')
  const [emailYukleniyor, setEmailYukleniyor] = useState(false)
  const [emailHata, setEmailHata] = useState('')
  const [emailMesaj, setEmailMesaj] = useState('')

  const [yeniSifre, setYeniSifre] = useState('')
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState('')
  const [sifreYukleniyor, setSifreYukleniyor] = useState(false)
  const [sifreHata, setSifreHata] = useState('')
  const [sifreMesaj, setSifreMesaj] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setKullanici(data.user)
      setKontrolBitti(true)
    })
  }, [])

  const emailGuncelle = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailHata('')
    setEmailMesaj('')

    if (!yeniEmail.trim()) return

    setEmailYukleniyor(true)
    const { error } = await supabase.auth.updateUser({ email: yeniEmail })
    setEmailYukleniyor(false)

    if (error) {
      setEmailHata('Bir hata oluştu: ' + error.message)
      return
    }

    setEmailMesaj('Onay linki hem eski hem yeni e-posta adresine gönderildi. Onaylayınca değişiklik tamamlanır.')
    setYeniEmail('')
  }

  const sifreGuncelle = async (e: React.FormEvent) => {
    e.preventDefault()
    setSifreHata('')
    setSifreMesaj('')

    if (yeniSifre.length < 6) {
      setSifreHata('Şifre en az 6 karakter olmalı.')
      return
    }
    if (yeniSifre !== yeniSifreTekrar) {
      setSifreHata('Şifreler birbiriyle eşleşmiyor.')
      return
    }

    setSifreYukleniyor(true)
    const { error } = await supabase.auth.updateUser({ password: yeniSifre })
    setSifreYukleniyor(false)

    if (error) {
      setSifreHata('Bir hata oluştu: ' + error.message)
      return
    }

    setSifreMesaj('Şifren başarıyla güncellendi.')
    setYeniSifre('')
    setYeniSifreTekrar('')
  }

  const hesapSilTalebi = () => {
    const konu = encodeURIComponent('NeedGO: Hesap Silme Talebi')
    const govde = encodeURIComponent(
      `Merhaba,\n\n${kullanici?.email} adresiyle kayıtlı hesabımın kalıcı olarak silinmesini talep ediyorum.\n\nTeşekkürler.`
    )
    window.location.href = `mailto:destek@needgo.com?subject=${konu}&body=${govde}`
  }

  if (!kontrolBitti) {
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
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--renk-ink)] mb-1">
          Hesap Ayarları
        </h1>
        <p className="text-sm text-[var(--renk-ink)]/50 mb-8">{kullanici.email}</p>

        <div className="flex flex-col gap-6">

          <section className="bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] rounded-lg p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-3">
              E-posta Adresini Değiştir
            </h2>
            <form onSubmit={emailGuncelle} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Yeni e-posta adresi"
                value={yeniEmail}
                onChange={(e) => setYeniEmail(e.target.value)}
                className="px-3 py-2.5 bg-white border border-[var(--renk-cizgi)] rounded-md text-sm placeholder:text-[var(--renk-ink)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--renk-orman)]/40"
              />
              {emailHata && <p className="text-xs text-[#B5533C]">{emailHata}</p>}
              {emailMesaj && <p className="text-xs text-[var(--renk-orman)]">{emailMesaj}</p>}
              <button
                type="submit"
                disabled={emailYukleniyor}
                className="self-start px-4 py-2 rounded-full bg-[var(--renk-orman)] text-[var(--renk-kraft)] text-sm font-semibold hover:bg-[var(--renk-orman-koyu)] transition-colors disabled:opacity-60"
              >
                {emailYukleniyor ? 'Gönderiliyor…' : 'E-postayı Güncelle'}
              </button>
            </form>
          </section>

          <section className="bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] rounded-lg p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-3">
              Şifreni Değiştir
            </h2>
            <form onSubmit={sifreGuncelle} className="flex flex-col gap-3">
              <input
                type="password"
                placeholder="Yeni şifre"
                value={yeniSifre}
                onChange={(e) => setYeniSifre(e.target.value)}
                minLength={6}
                className="px-3 py-2.5 bg-white border border-[var(--renk-cizgi)] rounded-md text-sm placeholder:text-[var(--renk-ink)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--renk-orman)]/40"
              />
              <input
                type="password"
                placeholder="Yeni şifre (tekrar)"
                value={yeniSifreTekrar}
                onChange={(e) => setYeniSifreTekrar(e.target.value)}
                minLength={6}
                className="px-3 py-2.5 bg-white border border-[var(--renk-cizgi)] rounded-md text-sm placeholder:text-[var(--renk-ink)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--renk-orman)]/40"
              />
              {sifreHata && <p className="text-xs text-[#B5533C]">{sifreHata}</p>}
              {sifreMesaj && <p className="text-xs text-[var(--renk-orman)]">{sifreMesaj}</p>}
              <button
                type="submit"
                disabled={sifreYukleniyor}
                className="self-start px-4 py-2 rounded-full bg-[var(--renk-orman)] text-[var(--renk-kraft)] text-sm font-semibold hover:bg-[var(--renk-orman-koyu)] transition-colors disabled:opacity-60"
              >
                {sifreYukleniyor ? 'Kaydediliyor…' : 'Şifreyi Güncelle'}
              </button>
            </form>
          </section>

          <section className="bg-[var(--renk-kart)] border border-[#B5533C]/30 rounded-lg p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-[#B5533C] mb-2">
              Tehlikeli Bölge
            </h2>
            <p className="text-sm text-[var(--renk-ink)]/60 mb-3">
              Hesabını kalıcı olarak silmek istersen, bir silme talebi gönderebilirsin.
            </p>
            <button
              onClick={hesapSilTalebi}
              className="px-4 py-2 rounded-full border border-[#B5533C] text-[#B5533C] text-sm font-semibold hover:bg-[#B5533C] hover:text-white transition-colors"
            >
              Hesabımı Sil (Talep Gönder)
            </button>
          </section>

        </div>
      </main>
    </div>
  )
}
