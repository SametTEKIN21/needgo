'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './lib/supabase'
import { profilTamMi } from './lib/profil'
import { adminMi } from './lib/moderasyon'
import AuthForm from './AuthForm'
import IlanForm from './IlanForm'
import KonumSecici from './KonumSecici'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

type Ilan = {
  id: string
  baslik: string
  aciklama: string | null
  kategori: string | null
  konum: string | null
  fotograf_url: string | null
  olusturulma_tarihi: string
}

const KATEGORILER = [
  'Mobilya',
  'Elektronik',
  'Ev & Yaşam',
  'Giyim',
  'Aksesuar',
  'Kişisel Bakım & Kozmetik',
  'Oyuncak',
  'Ofis & Kırtasiye',
  'Yapı & Market',
  'Pet Shop',
  'Antika',
]

const KATEGORI_BILGI: Record<string, { emoji: string; bg: string }> = {
  'Mobilya': { emoji: '🛋️', bg: '#E3F0FF' },
  'Elektronik': { emoji: '💻', bg: '#E3F0FF' },
  'Ev & Yaşam': { emoji: '🏠', bg: '#E3F0FF' },
  'Giyim': { emoji: '👕', bg: '#E3F0FF' },
  'Aksesuar': { emoji: '👜', bg: '#E3F0FF' },
  'Kişisel Bakım & Kozmetik': { emoji: '💄', bg: '#E3F0FF' },
  'Oyuncak': { emoji: '🧸', bg: '#E3F0FF' },
  'Ofis & Kırtasiye': { emoji: '✏️', bg: '#E3F0FF' },
  'Yapı & Market': { emoji: '🔨', bg: '#E3F0FF' },
  'Pet Shop': { emoji: '🐾', bg: '#E3F0FF' },
  'Antika': { emoji: '🏺', bg: '#E3F0FF' },
}

// Tüm kartlarda sabit kalan panel rengi — kart bazlı renk farkı yok
const KITLE_PANEL_BG = '#E3F0FF'
const KITLE_PANEL_RENK = '#0066FF'

// Hero slaytları — 1. slayt orijinal metin, sonrakiler bilgi slaytları
const HERO_BILGI_SLAYTLARI = [
  {
    baslik: 'Çevre Koruma ve Sıfır Atık',
    aciklama:
      'Kullanılabilir durumdaki eşyaların çöp sahalarına gitmesini engelleyerek atık oluşumunu azaltır ve karbon ayak izini düşürmeye doğrudan katkı sağlar.',
  },
  {
    baslik: 'Döngüsel Ekonomi ve Kaynak Verimliliği',
    aciklama:
      'Eşyaların kullanım ömrünü tek bir sahipten öteye taşıyarak kaynakların yeniden ve verimli bir şekilde değerlendirilmesini destekler.',
  },
  {
    baslik: 'Sosyal Dayanışma ve Komşuluk',
    aciklama:
      'İhtiyaç sahibi kişilerle eşya paylaşmak isteyenleri para ve komisyon olmaksızın bir araya getirerek toplumsal dayanışmayı güçlendirir.',
  },
  {
    baslik: 'Öğrenci ve Ev Kuracaklara Destek',
    aciklama:
      'Öğrencilerin kitap, ders aracı veya eşya ihtiyaçlarını; yeni eve taşınanların ise mobilya ve ev gereksinimlerini bütçe yükü olmadan karşılamalarına imkan tanır.',
  },
  {
    baslik: 'STK ve Kurumsal İhtiyaç Kanalları',
    aciklama:
      'Dernekler, topluluklar veya belediyeler için ihtiyaç sahibi ailelere ulaştırılmak üzere toplu eşya temin edilebilecek sürdürülebilir bir kaynak oluşturur.',
  },
]
const HERO_SLAYT_SAYISI = HERO_BILGI_SLAYTLARI.length + 1

const HEDEF_KITLELER = [
  {
    no: '01',
    baslik: 'Öğrenciler İçin',
    aciklama: 'Ders kitabından mini buzdolabına, yurt/ev ihtiyacın burada.',
    maddeler: [
      'Yeni üniversite kazananlar',
      'Üniversite değişikliğiyle şehir değiştirenler',
      'Yurt bulamayan öğrenciler',
      'Yeni öğrenci evi kurmak isteyen öğrenciler',
    ],
    kategori: 'Ofis & Kırtasiye',
    ikon: 'kep',
  },
  {
    no: '02',
    baslik: 'Yeni Eve Taşınanlar İçin',
    aciklama: 'Sıfırdan ev kuruyorsun, kullanışlı mobilya ve eşyalar seni bekliyor.',
    maddeler: [
      'Yeni bir şehre atananlar',
      'Görevden dolayı şehir değiştirenler',
      'Geçici görevle yer değişikliği yaşayanlar',
    ],
    kategori: 'Mobilya',
    ikon: 'ev',
  },
  {
    no: '03',
    baslik: 'İşletmeler İçin',
    aciklama: 'Ofis ekipmanından depo malzemesine, işletmene lazım olanı bul.',
    maddeler: [
      'Kafeler',
      'Restoranlar',
      'Geçici ofis açanlar',
    ],
    kategori: 'Elektronik',
    ikon: 'canta',
  },
  {
    no: '04',
    baslik: 'STK, Dernek ve Belediyeler İçin',
    aciklama: 'İhtiyaç sahibi ailelere ulaştırmak isteyen kurumlar için toplu eşya kaynağı.',
    kategori: '',
    ikon: 'kalp',
  },
]

// Kartlar boştayken görünen dekoratif kare deseni (Parley referansındaki gibi) — mavi tonlar
const KARE_DESENI = [
  { top: '14%', left: '54%', boyut: 22, renk: '#0066FF' },
  { top: '30%', left: '38%', boyut: 16, renk: '#9CC7FF' },
  { top: '34%', left: '66%', boyut: 14, renk: '#9CC7FF' },
  { top: '48%', left: '28%', boyut: 18, renk: '#0066FF' },
  { top: '52%', left: '50%', boyut: 16, renk: '#0066FF' },
  { top: '62%', left: '18%', boyut: 14, renk: '#9CC7FF' },
  { top: '70%', left: '60%', boyut: 16, renk: '#0066FF' },
]

function KareDeseni() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {KARE_DESENI.map((k, i) => (
        <span
          key={i}
          className="absolute rounded-[3px] transition-transform duration-500"
          style={{
            top: k.top,
            left: k.left,
            width: k.boyut,
            height: k.boyut,
            backgroundColor: k.renk,
          }}
        />
      ))}
    </div>
  )
}

// Hero'nun arkasında süzülen eşya fotoğrafı kolajı — çevre kenarlarda görünür,
// ortaya doğru radyal maske ile silinir ki metin okunur kalsın.
const HERO_KOLAJ_GORSELLERI = Array.from(
  { length: 15 },
  (_, i) => `/hero/esya-${String(i + 1).padStart(2, '0')}.jpg?v=2`
)

const KOLAJ_SLOTLARI = [
  { top: '0%', left: '2%', boyut: 156, don: -8, bulanik: 0.6, opak: 0.62 },
  { top: '6%', left: '19%', boyut: 116, don: 5, bulanik: 1.2, opak: 0.48 },
  { top: '-3%', left: '35%', boyut: 132, don: -4, bulanik: 0.4, opak: 0.66 },
  { top: '3%', left: '52%', boyut: 120, don: 6, bulanik: 1, opak: 0.5 },
  { top: '-1%', left: '69%', boyut: 138, don: -6, bulanik: 0.6, opak: 0.62 },
  { top: '6%', left: '86%', boyut: 158, don: 7, bulanik: 0.8, opak: 0.56 },
  { top: '34%', left: '-4%', boyut: 178, don: 6, bulanik: 0.3, opak: 0.7 },
  { top: '28%', left: '90%', boyut: 150, don: -5, bulanik: 0.5, opak: 0.64 },
  { top: '58%', left: '88%', boyut: 172, don: 8, bulanik: 0.3, opak: 0.68 },
  { top: '70%', left: '0%', boyut: 156, don: -6, bulanik: 0.6, opak: 0.62 },
  { top: '78%', left: '17%', boyut: 118, don: 8, bulanik: 1.2, opak: 0.48 },
  { top: '86%', left: '34%', boyut: 128, don: -4, bulanik: 0.8, opak: 0.52 },
  { top: '82%', left: '51%', boyut: 122, don: 5, bulanik: 1, opak: 0.5 },
  { top: '80%', left: '68%', boyut: 138, don: -7, bulanik: 0.7, opak: 0.56 },
  { top: '88%', left: '85%', boyut: 150, don: 6, bulanik: 0.7, opak: 0.56 },
]

function HeroKolaj() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-0 overflow-hidden [mask-image:radial-gradient(125%_100%_at_50%_44%,transparent_26%,black_70%)]"
    >
      {KOLAJ_SLOTLARI.map((s, i) => (
        <img
          key={i}
          src={HERO_KOLAJ_GORSELLERI[i % HERO_KOLAJ_GORSELLERI.length]}
          alt=""
          loading="lazy"
          className="absolute rounded-xl object-cover shadow-[0_10px_30px_rgba(0,59,202,0.06)]"
          style={{
            top: s.top,
            left: s.left,
            width: s.boyut,
            height: Math.round(s.boyut * 0.74),
            transform: `rotate(${s.don}deg)`,
            filter: `blur(${s.bulanik}px)`,
            opacity: s.opak,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-[var(--renk-kraft)]/5" />
    </div>
  )
}

function HedefKitleIkon({ tur, renk }: { tur: string; renk: string }) {
  if (tur === 'kep') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L2 8l10 5 8-4.2V15h2V8L12 3z" fill={renk} />
        <path d="M6 10.5V15c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" stroke={renk} strokeWidth="1.6" fill="none" />
      </svg>
    )
  }
  if (tur === 'ev') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <path d="M3 11L12 3l9 8" stroke={renk} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9" stroke={renk} strokeWidth="1.8" fill="none" strokeLinejoin="round" />
      </svg>
    )
  }
  if (tur === 'canta') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="7" width="18" height="12" rx="2" stroke={renk} strokeWidth="1.8" />
        <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={renk} strokeWidth="1.8" />
        <path d="M3 12h18" stroke={renk} strokeWidth="1.8" />
      </svg>
    )
  }
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s-7.5-4.5-9.5-9C1 8.5 2.5 5 6 5c2 0 3.5 1.2 4 2.5C10.5 6.2 12 5 14 5c3.5 0 5 3.5 3.5 7-2 4.5-9.5 9-9.5 9z"
        stroke={renk}
        strokeWidth="1.6"
        fill="none"
      />
    </svg>
  )
}

export default function Home() {
  const router = useRouter()
  const [ilanlar, setIlanlar] = useState<Ilan[]>([])
  const [kullanici, setKullanici] = useState<User | null>(null)
  const [authAcik, setAuthAcik] = useState(false)
  const [ilanFormAcik, setIlanFormAcik] = useState(false)
  const [konumSeciciAcik, setKonumSeciciAcik] = useState(false)
  const [profilMenuAcik, setProfilMenuAcik] = useState(false)
  const [tumKategorilerAcik, setTumKategorilerAcik] = useState(false)
  const [seciliKategori, setSeciliKategori] = useState<string | null>(null)
  const [seciliKonum, setSeciliKonum] = useState<string | null>(null)
  const [aramaMetni, setAramaMetni] = useState('')
  const [aktifKitleIndex, setAktifKitleIndex] = useState<number | null>(null)
  const [okunmamisMesaj, setOkunmamisMesaj] = useState(0)
  const [aktifSlayt, setAktifSlayt] = useState(0)
  const [slaytDurdu, setSlaytDurdu] = useState(false)

  const gosterilenIlanlar = ilanlar.filter((ilan) => {
    const kategoriUyuyor = seciliKategori
      ? ilan.kategori?.toLowerCase() === seciliKategori.toLowerCase()
      : true
    const aramaUyuyor = aramaMetni.trim()
      ? ilan.baslik.toLowerCase().includes(aramaMetni.toLowerCase())
      : true
    const konumUyuyor = seciliKonum
      ? ilan.konum?.toLowerCase().includes(seciliKonum.split(',')[0].toLowerCase())
      : true
    return kategoriUyuyor && aramaUyuyor && konumUyuyor
  })

  const ilanlariGetir = async (deneme = 0) => {
    let { data, error } = await supabase
      .from('ilanlar')
      .select('*')
      .eq('durum', 'aktif')
      .eq('moderasyon_durumu', 'onaylandi')
      .order('olusturulma_tarihi', { ascending: false })

    // moderasyon.sql henüz çalıştırılmadıysa (kolon yok) — eski davranışa düş
    if (error && /moderasyon_durumu/.test(error.message || '')) {
      ;({ data, error } = await supabase
        .from('ilanlar')
        .select('*')
        .eq('durum', 'aktif')
        .order('olusturulma_tarihi', { ascending: false }))
    }

    if (error) {
      // Geçici hataları (ağ / PostgREST şema yeniden yüklemesi) bir kez yeniden dene
      if (deneme < 2) {
        setTimeout(() => ilanlariGetir(deneme + 1), 1500)
        return
      }
      console.error(
        'İlanlar yüklenemedi:',
        error.message || error.code || JSON.stringify(error)
      )
      return
    }

    setIlanlar(data as Ilan[])
  }

  const mesajlariGorulduIsaretle = () => {
    setOkunmamisMesaj(0)
    try {
      localStorage.setItem('needgo-mesaj-son-goruldu', new Date().toISOString())
    } catch {
      /* localStorage yoksa geç */
    }
  }

  const okunmamisMesajlariGetir = async (uid: string | undefined) => {
    if (!uid) {
      setOkunmamisMesaj(0)
      return
    }
    const { data: konusmalar } = await supabase
      .from('konusmalar')
      .select('id')
      .or(`gonderen_id.eq.${uid},alici_id.eq.${uid}`)

    const ids = (konusmalar ?? []).map((k) => k.id)
    if (ids.length === 0) {
      setOkunmamisMesaj(0)
      return
    }

    let sonGoruldu = '1970-01-01T00:00:00Z'
    try {
      sonGoruldu = localStorage.getItem('needgo-mesaj-son-goruldu') || sonGoruldu
    } catch {
      /* localStorage yoksa geç */
    }

    const { count } = await supabase
      .from('mesajlar')
      .select('id', { count: 'exact', head: true })
      .in('konusma_id', ids)
      .neq('gonderen_id', uid)
      .gt('olusturulma_tarihi', sonGoruldu)

    setOkunmamisMesaj(count ?? 0)
  }

  useEffect(() => {
    ilanlariGetir()

    supabase.auth.getUser().then(({ data }) => {
      setKullanici(data.user)
      okunmamisMesajlariGetir(data.user?.id)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setKullanici(session?.user ?? null)
      okunmamisMesajlariGetir(session?.user?.id)
    })

    const yenile = () => {
      supabase.auth.getUser().then(({ data }) => okunmamisMesajlariGetir(data.user?.id))
    }
    const aralik = setInterval(yenile, 30000)
    window.addEventListener('focus', yenile)

    return () => {
      listener.subscription.unsubscribe()
      clearInterval(aralik)
      window.removeEventListener('focus', yenile)
    }
  }, [])

  useEffect(() => {
    if (slaytDurdu) return
    const t = setInterval(
      () => setAktifSlayt((s) => (s + 1) % HERO_SLAYT_SAYISI),
      6500
    )
    return () => clearInterval(t)
  }, [slaytDurdu])

  const cikisYap = async () => {
    await supabase.auth.signOut()
  }

  const ilanVerTiklandi = () => {
    if (!kullanici) {
      setAuthAcik(true)
      return
    }
    if (!profilTamMi(kullanici)) {
      router.push('/profil')
      return
    }
    setIlanFormAcik(true)
  }

  const kategoriyeGit = (kategori: string) => {
    setSeciliKategori(kategori ? kategori : null)
    document.getElementById('ilanlar')?.scrollIntoView({ behavior: 'smooth' })
  }

  const panelKategoriSecildi = (kategori: string) => {
    setSeciliKategori(kategori)
    setTumKategorilerAcik(false)
  }

  const hepsiniGoster = () => {
    setSeciliKategori(null)
    setTumKategorilerAcik(false)
  }

  const slaytGit = (yon: number) =>
    setAktifSlayt((s) => (s + yon + HERO_SLAYT_SAYISI) % HERO_SLAYT_SAYISI)

  const heroButonlari = (
    <div className="flex items-center justify-center gap-3 mt-7">
      <button
        onClick={ilanVerTiklandi}
        className="text-sm font-semibold px-5 py-2.5 rounded-full bg-[var(--renk-ocre)] text-white hover:brightness-95 transition"
      >
        İlan Ver
      </button>
      <a
        href="#ilanlar"
        className="text-sm font-semibold px-5 py-2.5 rounded-full border border-[var(--renk-ink)]/20 text-[var(--renk-ink)] hover:border-[var(--renk-ink)] transition"
      >
        İlanlara Göz At
      </a>
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--renk-kraft)] flex flex-col">

      <header className="sticky top-0 z-40 border-b border-[var(--renk-cizgi)] bg-white">
        <div>
          <div className="w-full px-3 sm:px-6 h-16 flex items-center gap-2 sm:gap-4">
            <Link href="/" aria-label="NeedGO" className="inline-flex items-center gap-1.5 sm:gap-2 shrink-0">
              <img src="/needgo-n.png" alt="" className="h-8 w-8 sm:h-9 sm:w-9" />
              <span className="font-display text-lg sm:text-2xl font-bold tracking-tight">
                <span className="text-[#2099FF]">Need</span><span className="text-[#004CD6]">GO</span>
              </span>
            </Link>

            <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
              <div className="flex-1 min-w-0 max-w-xl flex items-center gap-2 bg-white border border-[var(--renk-cizgi)] rounded-full px-3 sm:px-4 py-2 sm:py-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[var(--renk-orman)]">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={aramaMetni}
                  onChange={(e) => setAramaMetni(e.target.value)}
                  placeholder="İlan, kategori, eşya ara"
                  className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-[var(--renk-ink)]/40"
                />
              </div>
              <button
                type="button"
                onClick={() => setKonumSeciciAcik(true)}
                className="hidden md:flex items-center gap-1.5 bg-white border border-[var(--renk-cizgi)] rounded-full px-4 py-2.5 text-sm text-[var(--renk-ink)]/80 whitespace-nowrap shrink-0"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-[var(--renk-orman)]">
                  <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
                </svg>
                {seciliKonum || 'İstanbul, Türkiye'}
                <span className="text-[var(--renk-ink)]/40 text-xs">▾</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <Link
                href="/mesajlar"
                onClick={mesajlariGorulduIsaretle}
                aria-label={okunmamisMesaj > 0 ? `Mesajlar (${okunmamisMesaj} yeni)` : 'Mesajlar'}
                className="relative hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-[var(--renk-ink)]/60 hover:bg-[var(--renk-kraft)] hover:text-[var(--renk-orman)] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                {okunmamisMesaj > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#B5533C] text-white text-[10px] font-semibold flex items-center justify-center">
                    {okunmamisMesaj > 9 ? '9+' : okunmamisMesaj}
                  </span>
                )}
              </Link>
              <Link
                href="/mesajlar"
                onClick={mesajlariGorulduIsaretle}
                aria-label="Bildirimler"
                className="relative hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-[var(--renk-ink)]/60 hover:bg-[var(--renk-kraft)] hover:text-[var(--renk-orman)] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M13.7 21a2 2 0 0 1-3.4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {okunmamisMesaj > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#B5533C] ring-2 ring-white" />
                )}
              </Link>

              <button
                onClick={ilanVerTiklandi}
                aria-label="İlan Ver"
                className="flex items-center gap-1.5 text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[var(--renk-orman)] text-white hover:brightness-95 transition-colors shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path d="M3 8a2 2 0 0 1 2-2h1.2a2 2 0 0 0 1.7-.9l.6-.9a2 2 0 0 1 1.7-.9h3.6a2 2 0 0 1 1.7.9l.6.9a2 2 0 0 0 1.7.9H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="2" />
                </svg>
                <span className="hidden sm:inline">İlan Ver</span>
              </button>

              {kullanici ? (
                <div className="relative">
                  <button
                    onClick={() => setProfilMenuAcik(!profilMenuAcik)}
                    className="flex items-center gap-1 hover:brightness-95 transition-colors"
                  >
                    <span className="w-9 h-9 rounded-full bg-[var(--renk-orman)] text-white flex items-center justify-center font-display font-semibold text-sm">
                      {kullanici.email?.[0].toUpperCase()}
                    </span>
                    <span className="text-[var(--renk-ink)]/40 text-xs">▾</span>
                  </button>

                  {profilMenuAcik && (
                    <>
                      <div
                        onClick={() => setProfilMenuAcik(false)}
                        className="fixed inset-0 z-40"
                      />
                      <div className="absolute right-0 top-11 z-50 bg-white border border-[var(--renk-cizgi)] rounded-lg shadow-lg w-56 py-2">
                        <p className="px-4 py-2 text-xs text-[var(--renk-ink)]/50 truncate border-b border-[var(--renk-cizgi)] mb-1">
                          {kullanici.email}
                        </p>
                        <Link href="/profil" onClick={() => setProfilMenuAcik(false)} className="block px-4 py-2 text-sm text-[var(--renk-ink)] hover:bg-[var(--renk-kraft)] transition-colors">
                          Profil
                        </Link>
                        <Link href="/ilanlarim" onClick={() => setProfilMenuAcik(false)} className="block px-4 py-2 text-sm text-[var(--renk-ink)] hover:bg-[var(--renk-kraft)] transition-colors">
                          İlanlarım
                        </Link>
                        <Link href="/mesajlar" onClick={() => { setProfilMenuAcik(false); mesajlariGorulduIsaretle() }} className="block px-4 py-2 text-sm text-[var(--renk-ink)] hover:bg-[var(--renk-kraft)] transition-colors">
                          Mesajlar
                        </Link>
                        <Link href="/hesap-ayarlari" onClick={() => setProfilMenuAcik(false)} className="block px-4 py-2 text-sm text-[var(--renk-ink)] hover:bg-[var(--renk-kraft)] transition-colors">
                          Hesap
                        </Link>
                        {adminMi(kullanici.email) && (
                          <Link href="/moderasyon" onClick={() => setProfilMenuAcik(false)} className="block px-4 py-2 text-sm text-[var(--renk-ink)] hover:bg-[var(--renk-kraft)] transition-colors">
                            Moderasyon
                          </Link>
                        )}
                        <button
                          onClick={() => { setProfilMenuAcik(false); cikisYap() }}
                          className="w-full text-left px-4 py-2 text-sm text-[#B5533C] hover:bg-[var(--renk-kraft)] transition-colors border-t border-[var(--renk-cizgi)] mt-1"
                        >
                          Çıkış Yap
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthAcik(true)}
                  className="text-sm font-medium px-3 py-1.5 rounded-full border border-[var(--renk-cizgi)] text-[var(--renk-ink)]/80 hover:border-[var(--renk-orman)] hover:text-[var(--renk-orman)] transition-colors"
                >
                  Giriş Yap
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-[var(--renk-cizgi)]">
          <div className="w-full px-3 sm:px-6 py-2.5 flex items-center gap-3 sm:gap-5">
            <button
              onClick={() => setTumKategorilerAcik(!tumKategorilerAcik)}
              className={`shrink-0 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
                tumKategorilerAcik
                  ? 'bg-[var(--renk-orman)] border-[var(--renk-orman)] text-white'
                  : 'bg-[var(--renk-kraft)] border-[var(--renk-cizgi)] text-[var(--renk-ink)] hover:border-[var(--renk-orman)]'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
              </svg>
              Tüm Kategoriler
              <span className="text-[10px]">{tumKategorilerAcik ? '▴' : '▾'}</span>
            </button>
            <nav className="flex-1 min-w-0 flex items-center gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {KATEGORILER.map((kat) => (
                <button
                  key={kat}
                  onClick={() => kategoriyeGit(kat)}
                  className={`shrink-0 text-sm transition-colors ${
                    seciliKategori === kat
                      ? 'text-[var(--renk-orman)] font-semibold'
                      : 'text-[var(--renk-ink)]/70 hover:text-[var(--renk-orman)]'
                  }`}
                >
                  {kat}
                </button>
              ))}
            </nav>
          </div>

          {tumKategorilerAcik && (
            <div className="w-full px-3 sm:px-6 pb-4">
              <div className="bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] rounded-lg overflow-hidden max-w-sm">
                <button
                  onClick={hepsiniGoster}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    seciliKategori === null ? 'bg-[var(--renk-orman)]/10' : 'hover:bg-[var(--renk-kraft)]'
                  }`}
                >
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                    style={{ backgroundColor: '#E3F0FF' }}
                  >
                    ▦
                  </span>
                  <span className="text-sm font-semibold text-[var(--renk-ink)]">Hepsini Göster</span>
                </button>

                {KATEGORILER.map((kat) => {
                  const bilgi = KATEGORI_BILGI[kat]
                  return (
                    <button
                      key={kat}
                      onClick={() => panelKategoriSecildi(kat)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-t border-[var(--renk-cizgi)] transition-colors ${
                        seciliKategori === kat ? 'bg-[var(--renk-orman)]/10' : 'hover:bg-[var(--renk-kraft)]'
                      }`}
                    >
                      <span
                        className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                        style={{ backgroundColor: bilgi.bg }}
                      >
                        {bilgi.emoji}
                      </span>
                      <span className="text-sm font-semibold text-[var(--renk-ink)]">{kat}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {authAcik && <AuthForm onClose={() => setAuthAcik(false)} />}
      {ilanFormAcik && kullanici && (
        <IlanForm
          kullanici={kullanici}
          onClose={() => setIlanFormAcik(false)}
          onEklendi={ilanlariGetir}
        />
      )}
      {konumSeciciAcik && (
        <KonumSecici
          onClose={() => setKonumSeciciAcik(false)}
          onSec={(konum) => setSeciliKonum(konum)}
        />
      )}

      <section className="relative overflow-hidden border-b border-[var(--renk-cizgi)] w-full">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute -top-32 -left-24 w-[460px] h-[460px] rounded-full bg-[#2099FF]/15 blur-[130px]" />
          <div className="absolute -bottom-40 -right-24 w-[520px] h-[520px] rounded-full bg-[#e8dcc4]/70 blur-[130px]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[360px] h-[360px] rounded-full bg-[#7cc0ff]/12 blur-[120px]" />
        </div>
        <HeroKolaj />
        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-14 pb-12 w-full">
          <div
            className="relative max-w-2xl mx-auto"
            onMouseEnter={() => setSlaytDurdu(true)}
            onMouseLeave={() => setSlaytDurdu(false)}
          >
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ transform: `translateX(-${aktifSlayt * 100}%)` }}
              >
                {/* 1. slayt — orijinal metin */}
                <div className="w-full shrink-0 px-9 sm:px-2">
                  <div className="flex flex-col items-center justify-center text-center min-h-[440px] sm:min-h-[380px]">
                    <p className="inline-block font-semibold text-[11px] sm:text-xs uppercase tracking-[0.18em] text-[var(--renk-orman)] border border-[var(--renk-orman)]/30 bg-[var(--renk-orman)]/5 rounded-full px-4 py-1.5 mb-4">
                      Atma · Paylaş · Dönüştür
                    </p>
                    <h1 className="font-display text-[26px] leading-tight sm:text-5xl font-semibold text-[var(--renk-ink)] tracking-tight text-balance">
                      Kullanmadığın eşya, birinin ihtiyacı olsun.
                    </h1>
                    <p className="text-[var(--renk-ink)]/60 mt-4 max-w-md mx-auto text-sm sm:text-base">
                      NeedGO&apos;da her şey ücretsiz, sadece paylaşım geçer.
                    </p>
                    <p className="font-display italic text-[var(--renk-orman)] text-base sm:text-lg mt-3">
                      Paylaşmak iyileştirir.
                    </p>
                    {heroButonlari}
                  </div>
                </div>

                {/* Bilgi slaytları */}
                {HERO_BILGI_SLAYTLARI.map((slayt) => (
                  <div key={slayt.baslik} className="w-full shrink-0 px-9 sm:px-2">
                    <div className="flex flex-col items-center justify-center text-center min-h-[440px] sm:min-h-[380px]">
                      <p className="inline-block font-semibold text-xs sm:text-sm tracking-tight border border-[var(--renk-orman)]/30 bg-[var(--renk-orman)]/5 rounded-full px-4 py-1.5 mb-4">
                        <span className="text-[var(--renk-ink)]/70">Neden </span>
                        <span className="text-[#2099FF]">Need</span>
                        <span className="text-[#004CD6]">GO</span>
                        <span className="text-[var(--renk-ink)]/70">?</span>
                      </p>
                      <h2 className="font-display text-xl leading-tight sm:text-4xl font-semibold text-[var(--renk-ink)] tracking-tight max-w-xl text-balance">
                        {slayt.baslik}
                      </h2>
                      <p className="text-[var(--renk-ink)]/60 mt-4 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
                        {slayt.aciklama}
                      </p>
                      {heroButonlari}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => slaytGit(-1)}
              aria-label="Önceki"
              className="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 backdrop-blur border border-[var(--renk-cizgi)] text-[var(--renk-ink)]/60 hover:text-[var(--renk-orman)] flex items-center justify-center text-lg leading-none"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => slaytGit(1)}
              aria-label="Sonraki"
              className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 backdrop-blur border border-[var(--renk-cizgi)] text-[var(--renk-ink)]/60 hover:text-[var(--renk-orman)] flex items-center justify-center text-lg leading-none"
            >
              ›
            </button>

            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: HERO_SLAYT_SAYISI }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAktifSlayt(i)}
                  aria-label={`${i + 1}. slayt`}
                  className={`h-2 rounded-full transition-all ${
                    i === aktifSlayt
                      ? 'w-6 bg-[var(--renk-orman)]'
                      : 'w-2 bg-[var(--renk-ink)]/20 hover:bg-[var(--renk-ink)]/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Kimler için NeedGO? — üzerine gelince genişleyen kartlar */}
      <section className="max-w-6xl mx-auto px-5 py-12 w-full">
        <h2 className="font-display text-xl font-semibold text-[var(--renk-ink)] mb-6">
          Kimler için NeedGO ?
        </h2>

        <div
          className="flex flex-col md:flex-row gap-4 md:h-[430px]"
          onMouseLeave={() => setAktifKitleIndex(null)}
        >
          {HEDEF_KITLELER.map((kitle, i) => {
            const aktif = aktifKitleIndex === i
            return (
              <div
                key={kitle.baslik}
                onMouseEnter={() => setAktifKitleIndex(i)}
                onClick={() => setAktifKitleIndex(aktif ? null : i)}
                style={{ flexGrow: aktif ? 1.5 : 1, transition: 'flex-grow 480ms cubic-bezier(0.4, 0, 0.2, 1)' }}
                className="relative basis-auto md:basis-0 min-h-[230px] md:min-h-0 bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] rounded-xl overflow-hidden cursor-pointer flex flex-col"
              >
                {!aktif ? (
                  <>
                    <p className="font-mono-etiket text-3xl text-[var(--renk-ink)]/15 px-5 pt-5">
                      {kitle.no}.
                    </p>
                    <div className="flex-1 relative">
                      <KareDeseni />
                    </div>
                    <p className="font-display text-sm font-semibold text-[var(--renk-ink)] px-5 pb-5 leading-snug">
                      {kitle.baslik}
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col md:h-full p-3">
                    <div
                      className="rounded-lg flex items-center justify-center shrink-0 h-28 md:h-40"
                      style={{ backgroundColor: KITLE_PANEL_BG }}
                    >
                      <HedefKitleIkon tur={kitle.ikon} renk={KITLE_PANEL_RENK} />
                    </div>
                    <div className="pt-4 px-1 pb-1 flex flex-col md:flex-1 min-w-0 md:overflow-hidden">
                      <h3 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-2">
                        {kitle.baslik}
                      </h3>
                      <div className="mb-4 md:flex-1 md:overflow-y-auto">
                        <p className="text-xs text-[var(--renk-ink)]/60">
                          {kitle.aciklama}
                        </p>
                        {kitle.maddeler && kitle.maddeler.length > 0 && (
                          <ul className="mt-3 space-y-1.5">
                            {kitle.maddeler.map((madde) => (
                              <li
                                key={madde}
                                className="flex items-start gap-2 text-xs text-[var(--renk-ink)]/70"
                              >
                                <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--renk-orman)]" />
                                <span>{madde}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          kategoriyeGit(kitle.kategori)
                        }}
                        className="self-start text-xs font-semibold px-4 py-2 rounded-full bg-[var(--renk-orman)] text-white hover:brightness-95 transition whitespace-nowrap"
                      >
                        İlanlara Bak
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <main id="ilanlar" className="max-w-6xl mx-auto px-5 py-10 w-full flex-1">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display text-xl font-semibold text-[var(--renk-ink)]">
            {seciliKategori ? seciliKategori : 'Güncel İlanlar'}
          </h2>
          <span className="font-mono-etiket text-[11px] text-[var(--renk-ink)]/50">{gosterilenIlanlar.length} ilan</span>
        </div>

        {gosterilenIlanlar.length === 0 && (
          <p className="text-sm text-[var(--renk-ink)]/50 italic">
            {seciliKategori ? 'Bu kategoride henüz ilan yok.' : 'Henüz ilan yok. İlk ilanı sen ver!'}
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {gosterilenIlanlar.map((ilan) => (
            <Link
              key={ilan.id}
              href={`/ilan/${ilan.id}`}
              className="group flex flex-col"
            >
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#f3f1ec]">
                {ilan.fotograf_url ? (
                  <img
                    src={ilan.fotograf_url}
                    alt={ilan.baslik}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img src="/needgo-n.png" alt="" className="w-12 h-12 opacity-15" />
                  </div>
                )}
                <span className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/75 backdrop-blur-sm flex items-center justify-center text-[var(--renk-ink)]/50 group-hover:text-[var(--renk-orman)] transition-colors">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>

              <div className="pt-3">
                <h3 className="font-display text-base font-semibold text-[var(--renk-ink)] leading-snug line-clamp-1">
                  {ilan.baslik}
                </h3>
                <p className="text-sm text-[var(--renk-ink)]/70 mt-0.5">Ücretsiz</p>
                {ilan.aciklama && (
                  <p className="text-sm text-[var(--renk-ink)]/70 mt-2 leading-relaxed line-clamp-2">
                    {ilan.aciklama}
                  </p>
                )}
                {(ilan.konum || ilan.kategori) && (
                  <p className="text-[11px] text-[var(--renk-ink)]/40 mt-2 truncate">
                    {[ilan.konum, ilan.kategori].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-[var(--renk-cizgi)] mt-10 bg-[var(--renk-kart)]">
        <div className="max-w-6xl mx-auto px-5 py-12 grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <img src="/needgo-n.png" alt="" className="h-8 w-8" />
              <span className="font-display text-xl font-bold tracking-tight">
                <span className="text-[#2099FF]">Need</span><span className="text-[#004CD6]">GO</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--renk-ink)]/60 max-w-xs leading-relaxed">
              Kullanmadığın eşya, birinin ihtiyacı olsun. Türkiye&apos;nin ücretsiz eşya paylaşım ağı.
            </p>
            <p className="font-display italic text-[var(--renk-orman)] text-sm mt-3">Paylaşmak iyileştirir.</p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-[var(--renk-ink)] mb-3">NeedGO</h3>
            <ul className="flex flex-col gap-2.5">
              <li><Link href="/hakkimizda" className="text-sm text-[var(--renk-ink)]/60 hover:text-[var(--renk-orman)] transition-colors">Hakkımızda</Link></li>
              <li><Link href="/nasil-calisir" className="text-sm text-[var(--renk-ink)]/60 hover:text-[var(--renk-orman)] transition-colors">Nasıl Çalışır</Link></li>
              <li><Link href="/sss" className="text-sm text-[var(--renk-ink)]/60 hover:text-[var(--renk-orman)] transition-colors">Sıkça Sorulan Sorular</Link></li>
              <li><Link href="/iletisim" className="text-sm text-[var(--renk-ink)]/60 hover:text-[var(--renk-orman)] transition-colors">İletişim</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-[var(--renk-ink)] mb-3">Güvenli Paylaşım</h3>
            <ul className="flex flex-col gap-2.5">
              {['%100 Ücretsiz', 'Reklamsız deneyim', 'Kalabalık buluşma noktaları', 'Topluluk kuralları'].map((madde) => (
                <li key={madde} className="flex items-start gap-2 text-sm text-[var(--renk-ink)]/60">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-[var(--renk-orman)]">
                    <path d="M20 7 10 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {madde}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-[var(--renk-ink)] mb-3">Bizi Takip Et</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { ad: 'Instagram', url: 'https://instagram.com/needgo2026', d: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM17.5 6.5h.01M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Z' },
                { ad: 'X', url: '', d: 'M4 4l16 16M20 4 4 20' },
                { ad: 'Facebook', url: '', d: 'M14 8h2V5h-2c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2l1-3h-3V8c0-.6.4-1 1-1Z' },
                { ad: 'TikTok', url: '', d: 'M14 4v9.5a3.5 3.5 0 1 1-3-3.46M14 4c0 2.5 2 4.5 5 4.5' },
                { ad: 'YouTube', url: '', d: 'M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8Zm7 1.5v5l4.5-2.5L10 9.5Z' },
              ]
                .filter((s) => s.url)
                .map((s) => (
                  <a
                    key={s.ad}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.ad}
                    className="w-9 h-9 rounded-full bg-[var(--renk-kraft)] border border-[var(--renk-cizgi)] flex items-center justify-center text-[var(--renk-ink)]/60 hover:bg-[var(--renk-orman)] hover:text-white hover:border-[var(--renk-orman)] transition-colors"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                      <path d={s.d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                ))}
            </div>
            <p className="text-xs text-[var(--renk-ink)]/40 mt-4 leading-relaxed">
              Mobil uygulama yakında. İlk sen haberdar ol.
            </p>
          </div>
        </div>

        <div className="border-t border-[var(--renk-cizgi)]">
          <div className="max-w-6xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[var(--renk-ink)]/50">
              Türkiye&apos;nin ücretsiz eşya paylaşım ağı · © 2026 NeedGO
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
              <Link href="/kullanim-sartlari" className="text-xs text-[var(--renk-ink)]/40 hover:text-[var(--renk-orman)] transition-colors">Şartlar ve Koşullar</Link>
              <Link href="/gizlilik-bildirimi" className="text-xs text-[var(--renk-ink)]/40 hover:text-[var(--renk-orman)] transition-colors">Gizlilik Bildirimi</Link>
              <Link href="/gizlilik-bildirimi" className="text-xs text-[var(--renk-ink)]/40 hover:text-[var(--renk-orman)] transition-colors">Çerez Ayarları</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
