'use client'

import { useState } from 'react'
import { supabase } from './lib/supabase'

function hataMesajiCevir(mesaj: string): string {
  if (mesaj.includes('Invalid login credentials')) {
    return 'E-posta veya şifre hatalı.'
  }
  if (mesaj.includes('User already registered')) {
    return 'Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.'
  }
  if (mesaj.includes('Password should be at least')) {
    return 'Şifre en az 6 karakter olmalı.'
  }
  if (mesaj.includes('Unable to validate email address')) {
    return 'Geçerli bir e-posta adresi girin.'
  }
  if (mesaj.includes('Email not confirmed')) {
    return 'E-posta adresini onaylamadan giriş yapamazsın. Gelen kutunu kontrol et.'
  }
  if (
    mesaj.includes('Invalid API key') ||
    mesaj.includes('No API key') ||
    mesaj.includes('env değişkenleri eksik')
  ) {
    return 'Sunucu yapılandırması eksik (Supabase anahtarı). Site yöneticisiyle iletişime geçin.'
  }
  if (mesaj.includes('Failed to fetch') || mesaj.includes('NetworkError')) {
    return 'Sunucuya ulaşılamadı. İnternet bağlantını kontrol edip tekrar dene.'
  }
  return 'Bir hata oluştu, lütfen tekrar dene.'
}

export default function AuthForm({ onClose }: { onClose: () => void }) {
  const [mod, setMod] = useState<'giris' | 'kayit' | 'sifremi-unuttum'>('giris')
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState('')
  const [mesaj, setMesaj] = useState('')

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault()
    setHata('')
    setMesaj('')
    setYukleniyor(true)
    try {
      await gonderIstek()
    } catch (err) {
      console.error('Auth hatası:', err)
      setHata(hataMesajiCevir(err instanceof Error ? err.message : String(err)))
    } finally {
      setYukleniyor(false)
    }
  }

  const gonderIstek = async () => {
    if (mod === 'kayit') {
      const { error } = await supabase.auth.signUp({ email, password: sifre })
      if (error) {
        setHata(hataMesajiCevir(error.message))
      } else {
        setMesaj('Kayıt başarılı! E-postanı kontrol edip hesabını onayla.')
      }
    } else if (mod === 'sifremi-unuttum') {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/sifre-sifirla',
      })
      if (error) {
        setHata(hataMesajiCevir(error.message))
      } else {
        setMesaj('Şifre sıfırlama linki e-postana gönderildi.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: sifre })
      if (error) {
        setHata(hataMesajiCevir(error.message))
      } else {
        onClose()
      }
    }
  }

  const baslik =
    mod === 'giris' ? 'Giriş Yap' : mod === 'kayit' ? 'Kayıt Ol' : 'Şifremi Unuttum'

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[var(--renk-ink)]/50 flex items-center justify-center z-50 px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--renk-kraft)] border border-[var(--renk-cizgi)] rounded-lg shadow-lg w-full max-w-sm p-6"
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-2xl font-semibold text-[var(--renk-ink)]">
            {baslik}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--renk-ink)]/50 hover:text-[var(--renk-ink)] text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <p className="font-mono-etiket text-[11px] uppercase tracking-widest text-[var(--renk-orman)] mb-5">
          NeedGO
        </p>

        <form onSubmit={gonder} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="E-posta adresi"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-3 py-2.5 bg-white border border-[var(--renk-cizgi)] rounded-md text-sm placeholder:text-[var(--renk-ink)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--renk-orman)]/40"
          />

          {mod !== 'sifremi-unuttum' && (
            <input
              type="password"
              placeholder="Şifre"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              required
              minLength={6}
              className="px-3 py-2.5 bg-white border border-[var(--renk-cizgi)] rounded-md text-sm placeholder:text-[var(--renk-ink)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--renk-orman)]/40"
            />
          )}

          {mod === 'giris' && (
            <button
              type="button"
              onClick={() => { setMod('sifremi-unuttum'); setHata(''); setMesaj('') }}
              className="text-xs text-[var(--renk-ink)]/60 hover:text-[var(--renk-orman)] text-right -mt-1"
            >
              Şifremi unuttum
            </button>
          )}

          {hata && <p className="text-xs text-[#B5533C]">{hata}</p>}
          {mesaj && <p className="text-xs text-[var(--renk-orman)]">{mesaj}</p>}

          <button
            type="submit"
            disabled={yukleniyor}
            className="mt-1 py-2.5 rounded-md bg-[var(--renk-ocre)] text-white text-sm font-semibold hover:brightness-95 transition disabled:opacity-60"
          >
            {yukleniyor
              ? 'Bekleyin…'
              : mod === 'giris'
              ? 'Giriş Yap'
              : mod === 'kayit'
              ? 'Kayıt Ol'
              : 'Sıfırlama Linki Gönder'}
          </button>
        </form>

        <p className="mt-4 text-xs text-center text-[var(--renk-ink)]/70">
          {mod === 'giris' && (
            <>
              Hesabın yok mu?{' '}
              <button
                onClick={() => { setMod('kayit'); setHata(''); setMesaj('') }}
                className="text-[var(--renk-orman)] font-semibold hover:underline"
              >
                Kayıt Ol
              </button>
            </>
          )}
          {mod === 'kayit' && (
            <>
              Zaten hesabın var mı?{' '}
              <button
                onClick={() => { setMod('giris'); setHata(''); setMesaj('') }}
                className="text-[var(--renk-orman)] font-semibold hover:underline"
              >
                Giriş Yap
              </button>
            </>
          )}
          {mod === 'sifremi-unuttum' && (
            <button
              onClick={() => { setMod('giris'); setHata(''); setMesaj('') }}
              className="text-[var(--renk-orman)] font-semibold hover:underline"
            >
              Giriş ekranına dön
            </button>
          )}
        </p>
      </div>
    </div>
  )
}