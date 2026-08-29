'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import GeriButonu from '../GeriButonu'
import { supabase } from '../lib/supabase'
import { kotaDurumu, tarihMetni, AYLIK_ALMA_HAKKI, type KotaDurumu } from '../lib/kota'
import type { User } from '@supabase/supabase-js'

type ProfilForm = {
  ad: string
  soyad: string
  telefon: string
  adres: string
  iletisim_eposta: string
}

const BOS_FORM: ProfilForm = {
  ad: '',
  soyad: '',
  telefon: '',
  adres: '',
  iletisim_eposta: '',
}

const ALAN_ETIKETLERI: { alan: keyof ProfilForm; etiket: string }[] = [
  { alan: 'ad', etiket: 'Ad' },
  { alan: 'soyad', etiket: 'Soyad' },
  { alan: 'telefon', etiket: 'Telefon' },
  { alan: 'iletisim_eposta', etiket: 'E-posta' },
  { alan: 'adres', etiket: 'Adres' },
]

const profilTamMi = (f: ProfilForm) =>
  ALAN_ETIKETLERI.every(({ alan }) => f[alan].trim().length > 0)

export default function Profil() {
  const [kullanici, setKullanici] = useState<User | null>(null)
  const [kontrolBitti, setKontrolBitti] = useState(false)
  const [form, setForm] = useState<ProfilForm>(BOS_FORM)
  const [kayitli, setKayitli] = useState<ProfilForm | null>(null)
  const [duzenleme, setDuzenleme] = useState(true)
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [hata, setHata] = useState('')
  const [kota, setKota] = useState<KotaDurumu | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setKullanici(data.user)
      const m = (data.user?.user_metadata ?? {}) as Partial<ProfilForm>
      const yuklenen: ProfilForm = {
        ad: m.ad ?? '',
        soyad: m.soyad ?? '',
        telefon: m.telefon ?? '',
        adres: m.adres ?? '',
        iletisim_eposta: m.iletisim_eposta ?? data.user?.email ?? '',
      }
      setForm(yuklenen)
      if (profilTamMi(yuklenen)) {
        setKayitli(yuklenen)
        setDuzenleme(false)
      } else {
        setDuzenleme(true)
      }
      setKontrolBitti(true)
      if (data.user) {
        kotaDurumu(data.user.id).then(setKota).catch(() => {})
      }
    })
  }, [])

  const alanDegistir =
    (alan: keyof ProfilForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [alan]: e.target.value }))
    }

  const kaydet = async (e: React.FormEvent) => {
    e.preventDefault()
    setHata('')

    const temiz: ProfilForm = {
      ad: form.ad.trim(),
      soyad: form.soyad.trim(),
      telefon: form.telefon.trim(),
      adres: form.adres.trim(),
      iletisim_eposta: form.iletisim_eposta.trim(),
    }

    if (!profilTamMi(temiz)) {
      setHata('Tüm alanları doldurman gerekiyor.')
      return
    }

    setKaydediliyor(true)
    try {
      const { error } = await supabase.auth.updateUser({ data: { ...temiz } })
      if (error) throw error

      // Sabit yönlendirme — ana sayfa taze kullanıcı bilgisiyle yeniden yüklenir
      window.location.href = '/'
    } catch (err) {
      setKaydediliyor(false)
      setHata(
        'Kaydedilemedi: ' + (err instanceof Error ? err.message : 'bilinmeyen hata')
      )
    }
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

  const inputClass =
    'px-3 py-2.5 bg-white border border-[var(--renk-cizgi)] rounded-md text-sm text-neutral-900 placeholder:text-[var(--renk-ink)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--renk-orman)]/40'

  return (
    <div className="min-h-screen bg-[var(--renk-kraft)]">
      <header className="sticky top-0 z-40 bg-[var(--renk-kraft)]/95 backdrop-blur border-b border-[var(--renk-cizgi)]">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GeriButonu />
            <Link href="/" className="font-display text-2xl font-semibold text-[var(--renk-ink)] tracking-tight">
              NeedGO
            </Link>
          </div>
          <Link
            href="/hesap-ayarlari"
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-[var(--renk-ink)]/20 text-[var(--renk-ink)] hover:bg-[var(--renk-ink)] hover:text-[var(--renk-kraft)] transition-colors"
          >
            Hesap Ayarları
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-10">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--renk-ink)] mb-1">
          Profil
        </h1>
        <p className="text-sm text-[var(--renk-ink)]/50 mb-6">
          Bu bilgiler seninle iletişim kurmak isteyenler için kullanılır ve zorunludur.
        </p>

        {kota && (
          <div className="mb-8 bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] rounded-lg p-4 sm:p-5">
            <h2 className="font-display text-base font-semibold text-[var(--renk-ink)] mb-1">
              Eşya alma hakkın
            </h2>
            <p className="text-sm text-[var(--renk-ink)]/70">
              Son 30 günde <strong>{kota.alinan}</strong> eşya aldın · kalan hakkın{' '}
              <strong>{kota.kalan}</strong>/{AYLIK_ALMA_HAKKI}
            </p>
            {kota.kalan === 0 && kota.yenilenmeTarihi && (
              <p className="text-xs text-[var(--renk-ink)]/50 mt-1">
                Hakların {tarihMetni(kota.yenilenmeTarihi)} tarihinden itibaren yenilenmeye başlar.
              </p>
            )}
            <p className="text-xs text-[var(--renk-ink)]/45 mt-2">
              Fırsatçılığı önlemek için her hesap 30 günde en fazla {AYLIK_ALMA_HAKKI} eşya alabilir.
            </p>
          </div>
        )}

        {!duzenleme && kayitli ? (
          <div className="bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] rounded-xl overflow-hidden">
            <div className="flex items-center gap-4 p-5 sm:p-6 border-b border-[var(--renk-cizgi)] bg-[var(--renk-orman)]/5">
              <span className="w-14 h-14 rounded-full bg-[var(--renk-orman)] text-white flex items-center justify-center font-display text-xl font-semibold shrink-0">
                {(kayitli.ad[0] || '') + (kayitli.soyad[0] || '')}
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold text-[var(--renk-ink)] truncate">
                  {kayitli.ad} {kayitli.soyad}
                </p>
                <p className="text-xs text-[var(--renk-ink)]/50">NeedGO üyesi</p>
              </div>
            </div>

            <dl className="p-5 sm:p-6 flex flex-col gap-4">
              {[
                {
                  etiket: 'Telefon',
                  deger: kayitli.telefon,
                  ikon: (
                    <path
                      d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  ),
                },
                {
                  etiket: 'E-posta',
                  deger: kayitli.iletisim_eposta,
                  ikon: (
                    <>
                      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    </>
                  ),
                },
                {
                  etiket: 'Adres',
                  deger: kayitli.adres,
                  ikon: (
                    <>
                      <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                    </>
                  ),
                },
              ].map((satir) => (
                <div key={satir.etiket} className="flex gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-[var(--renk-orman)]">
                    {satir.ikon}
                  </svg>
                  <div className="min-w-0">
                    <dt className="text-xs text-[var(--renk-ink)]/45">{satir.etiket}</dt>
                    <dd className="text-sm text-[var(--renk-ink)] mt-0.5 whitespace-pre-wrap break-words">
                      {satir.deger}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="px-5 sm:px-6 pb-5 sm:pb-6">
              <button
                onClick={() => {
                  setForm(kayitli)
                  setHata('')
                  setDuzenleme(true)
                }}
                className="px-5 py-2.5 rounded-full border border-[var(--renk-orman)] text-[var(--renk-orman)] text-sm font-semibold hover:bg-[var(--renk-orman)] hover:text-[var(--renk-kraft)] transition-colors"
              >
                Düzenle
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={kaydet}
            noValidate
            className="bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] rounded-lg p-5 sm:p-6 flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-[var(--renk-ink)]">Ad *</span>
                <input required value={form.ad} onChange={alanDegistir('ad')} placeholder="Adın" className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-[var(--renk-ink)]">Soyad *</span>
                <input required value={form.soyad} onChange={alanDegistir('soyad')} placeholder="Soyadın" className={inputClass} />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--renk-ink)]">Telefon *</span>
              <input
                required
                type="tel"
                value={form.telefon}
                onChange={alanDegistir('telefon')}
                placeholder="05xx xxx xx xx"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--renk-ink)]">E-posta *</span>
              <input
                required
                type="email"
                value={form.iletisim_eposta}
                onChange={alanDegistir('iletisim_eposta')}
                placeholder="ornek@eposta.com"
                className={inputClass}
              />
              <span className="text-xs text-[var(--renk-ink)]/45">
                Giriş e-postan: {kullanici.email} — değiştirmek için{' '}
                <Link href="/hesap-ayarlari" className="text-[var(--renk-orman)] hover:underline">
                  Hesap Ayarları
                </Link>
              </span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--renk-ink)]">Adres *</span>
              <textarea
                required
                value={form.adres}
                onChange={alanDegistir('adres')}
                placeholder="Mahalle, ilçe, il"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </label>

            {hata && <p className="text-xs text-[#B5533C]">{hata}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={kaydediliyor}
                className="self-start px-5 py-2.5 rounded-full bg-[var(--renk-orman)] text-[var(--renk-kraft)] text-sm font-semibold hover:bg-[var(--renk-orman-koyu)] transition-colors disabled:opacity-60"
              >
                {kaydediliyor ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
              {kayitli && (
                <button
                  type="button"
                  onClick={() => {
                    setForm(kayitli)
                    setHata('')
                    setDuzenleme(false)
                  }}
                  className="self-start px-5 py-2.5 rounded-full border border-[var(--renk-ink)]/20 text-[var(--renk-ink)] text-sm font-medium"
                >
                  Vazgeç
                </button>
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
