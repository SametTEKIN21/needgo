'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function SifreSifirla() {
  const router = useRouter()
  const [oturumHazir, setOturumHazir] = useState(false)
  const [kontrolBitti, setKontrolBitti] = useState(false)
  const [yeniSifre, setYeniSifre] = useState('')
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState('')
  const [basarili, setBasarili] = useState(false)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setOturumHazir(true)
      }
      setKontrolBitti(true)
    })

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setOturumHazir(true)
      }
      setKontrolBitti(true)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault()
    setHata('')

    if (yeniSifre.length < 6) {
      setHata('Şifre en az 6 karakter olmalı.')
      return
    }
    if (yeniSifre !== yeniSifreTekrar) {
      setHata('Şifreler birbiriyle eşleşmiyor.')
      return
    }

    setYukleniyor(true)
    const { error } = await supabase.auth.updateUser({ password: yeniSifre })
    setYukleniyor(false)

    if (error) {
      setHata('Bir hata oluştu: ' + error.message)
      return
    }

    setBasarili(true)
    setTimeout(() => {
      router.push('/')
    }, 2500)
  }

  return (
    <div className="min-h-screen bg-[var(--renk-kraft)] flex items-center justify-center px-4">
      <div className="bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] rounded-lg shadow-sm w-full max-w-sm p-6">
        <h1 className="font-display text-2xl font-semibold text-[var(--renk-ink)] mb-1">
          Yeni Şifre Belirle
        </h1>
        <p className="font-mono-etiket text-[11px] uppercase tracking-widest text-[var(--renk-orman)] mb-6">
          NeedGO
        </p>

        {!kontrolBitti && (
          <p className="text-sm text-[var(--renk-ink)]/50">Kontrol ediliyor…</p>
        )}

        {kontrolBitti && !oturumHazir && !basarili && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-[var(--renk-ink)]/70">
              Bu link geçersiz veya süresi dolmuş olabilir. Lütfen e-postandaki linke tekrar tıkla
              ya da yeni bir şifre sıfırlama isteği gönder.
            </p>
            <Link href="/" className="text-sm font-semibold text-[var(--renk-orman)] hover:underline">
              Ana sayfaya dön
            </Link>
          </div>
        )}

        {kontrolBitti && oturumHazir && !basarili && (
          <form onSubmit={gonder} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Yeni şifre"
              value={yeniSifre}
              onChange={(e) => setYeniSifre(e.target.value)}
              required
              minLength={6}
              className="px-3 py-2.5 bg-white border border-[var(--renk-cizgi)] rounded-md text-sm placeholder:text-[var(--renk-ink)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--renk-orman)]/40"
            />
            <input
              type="password"
              placeholder="Yeni şifre (tekrar)"
              value={yeniSifreTekrar}
              onChange={(e) => setYeniSifreTekrar(e.target.value)}
              required
              minLength={6}
              className="px-3 py-2.5 bg-white border border-[var(--renk-cizgi)] rounded-md text-sm placeholder:text-[var(--renk-ink)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--renk-orman)]/40"
            />

            {hata && <p className="text-xs text-[#B5533C]">{hata}</p>}

            <button
              type="submit"
              disabled={yukleniyor}
              className="mt-1 py-2.5 rounded-md bg-[var(--renk-ocre)] text-white text-sm font-semibold hover:brightness-95 transition disabled:opacity-60"
            >
              {yukleniyor ? 'Kaydediliyor…' : 'Şifreyi Güncelle'}
            </button>
          </form>
        )}

        {basarili && (
          <p className="text-sm text-[var(--renk-orman)]">
            Şifren güncellendi! Ana sayfaya yönlendiriliyorsun…
          </p>
        )}
      </div>
    </div>
  )
}
