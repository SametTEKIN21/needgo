'use client'



import { useEffect, useState } from 'react'

import { supabase } from './lib/supabase'

import AuthForm from './AuthForm'

import IlanForm from './IlanForm'

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



const KATEGORILER = ['Mobilya', 'Elektronik', 'Giyim', 'Ev & Yaşam', 'Anne & Bebek', 'Kitap & Hobi', 'Spor', 'Diğer']



export default function Home() {

  const [ilanlar, setIlanlar] = useState<Ilan[]>([])

  const [kullanici, setKullanici] = useState<User | null>(null)

  const [authAcik, setAuthAcik] = useState(false)

  const [ilanFormAcik, setIlanFormAcik] = useState(false)

  const [seciliKategori, setSeciliKategori] = useState<string | null>(null)

  const [aramaMetni, setAramaMetni] = useState('')



  const gosterilenIlanlar = ilanlar.filter((ilan) => {

    const kategoriUyuyor = seciliKategori

      ? ilan.kategori?.toLowerCase() === seciliKategori.toLowerCase()

      : true

    const aramaUyuyor = aramaMetni.trim()

      ? ilan.baslik.toLowerCase().includes(aramaMetni.toLowerCase())

      : true

    return kategoriUyuyor && aramaUyuyor

  })



  const ilanlariGetir = async () => {

    const { data, error } = await supabase

      .from('ilanlar')

      .select('*')

      .eq('durum', 'aktif')

      .order('olusturulma_tarihi', { ascending: false })



    if (error) {

      console.error(error)

    } else {

      setIlanlar(data as Ilan[])

    }

  }



  useEffect(() => {

    ilanlariGetir()



    supabase.auth.getUser().then(({ data }) => {

      setKullanici(data.user)

    })



    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {

      setKullanici(session?.user ?? null)

    })



    return () => {

      listener.subscription.unsubscribe()

    }

  }, [])



  const cikisYap = async () => {

    await supabase.auth.signOut()

  }



  const ilanVerTiklandi = () => {

    if (kullanici) {

      setIlanFormAcik(true)

    } else {

      setAuthAcik(true)

    }

  }



  return (

    <div className="min-h-screen bg-[var(--renk-kraft)] flex flex-col">



      <header className="sticky top-0 z-40 bg-[var(--renk-kraft)]/95 backdrop-blur border-b border-[var(--renk-cizgi)]">

        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">

          <span className="font-display text-2xl font-semibold text-[var(--renk-ink)] tracking-tight shrink-0">

            NeedGO

          </span>



          <div className="flex items-center gap-2 ml-auto">

            {kullanici ? (

              <>

                <Link href="/ilanlarim" className="text-xs font-medium px-3 py-1.5 rounded-full border border-[var(--renk-ink)]/20 text-[var(--renk-ink)] hover:bg-[var(--renk-ink)] hover:text-[var(--renk-kraft)] transition-colors">

                  İlanlarım

                </Link>

                <span className="text-xs text-[var(--renk-ink)]/60 hidden md:block">{kullanici.email}</span>

                <button

                  onClick={cikisYap}

                  className="text-xs font-medium px-3 py-1.5 rounded-full border border-[var(--renk-ink)]/20 text-[var(--renk-ink)] hover:bg-[var(--renk-ink)] hover:text-[var(--renk-kraft)] transition-colors"

                >

                  Çıkış Yap

                </button>

              </>

            ) : (

              <button

                onClick={() => setAuthAcik(true)}

                className="text-xs font-medium px-3 py-1.5 rounded-full border border-[var(--renk-ink)]/20 text-[var(--renk-ink)] hover:bg-[var(--renk-ink)] hover:text-[var(--renk-kraft)] transition-colors"

              >

                Giriş Yap

              </button>

            )}

            <button

              onClick={ilanVerTiklandi}

              className="text-sm font-semibold px-4 py-2 rounded-full bg-[var(--renk-orman)] text-[var(--renk-kraft)] hover:bg-[var(--renk-orman-koyu)] transition-colors"

            >

              İlan Ver

            </button>

          </div>

        </div>

        <div className="max-w-6xl mx-auto px-5 pb-3 flex items-center gap-3">

          <div className="flex-1 flex items-center gap-2 bg-white border border-[var(--renk-cizgi)] rounded-full px-4 py-2">

            <span className="text-[var(--renk-ink)]/40 text-sm">⌕</span>

            <input

              type="text"

              value={aramaMetni}

              onChange={(e) => setAramaMetni(e.target.value)}

              placeholder="İlan, kategori ara"

              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--renk-ink)]/40"

            />

          </div>

          <button

            type="button"

            className="hidden sm:flex items-center gap-1.5 bg-white border border-[var(--renk-cizgi)] rounded-full px-4 py-2 text-sm text-[var(--renk-ink)]/80 whitespace-nowrap"

          >

            <span className="text-[var(--renk-orman)]">●</span>

            İstanbul, Türkiye

            <span className="text-[var(--renk-ink)]/40 text-xs">▾</span>

          </button>

        </div>

        <div className="max-w-6xl mx-auto px-5 pb-3 flex gap-2 overflow-x-auto no-scrollbar">

          <button

            onClick={() => setSeciliKategori(null)}

            className={`shrink-0 text-xs font-mono-etiket uppercase tracking-wide px-3 py-1.5 rounded-full border transition-colors ${

              seciliKategori === null

                ? 'bg-[var(--renk-orman)] border-[var(--renk-orman)] text-[var(--renk-kraft)]'

                : 'border-[var(--renk-cizgi)] text-[var(--renk-ink)]/70 hover:border-[var(--renk-orman)] hover:text-[var(--renk-orman)]'

            }`}

          >

            Tümü

          </button>

          {KATEGORILER.map((kat) => (

            <button

              key={kat}

              onClick={() => setSeciliKategori(kat)}

              className={`shrink-0 text-xs font-mono-etiket uppercase tracking-wide px-3 py-1.5 rounded-full border transition-colors ${

                seciliKategori === kat

                  ? 'bg-[var(--renk-orman)] border-[var(--renk-orman)] text-[var(--renk-kraft)]'

                  : 'border-[var(--renk-cizgi)] text-[var(--renk-ink)]/70 hover:border-[var(--renk-orman)] hover:text-[var(--renk-orman)]'

              }`}

            >

              {kat}

            </button>

          ))}

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



      <section className="max-w-6xl mx-auto px-5 pt-12 pb-10 text-center border-b border-[var(--renk-cizgi)] w-full">

        <p className="font-mono-etiket text-[11px] uppercase tracking-widest text-[var(--renk-orman)] mb-3">

          Atma · Paylaş · Kazandır

        </p>

        <h1 className="font-display text-3xl sm:text-5xl font-semibold text-[var(--renk-ink)] tracking-tight max-w-2xl mx-auto">

          Kullanmadığın eşya, birinin ihtiyacı olsun.

        </h1>

        <p className="text-[var(--renk-ink)]/60 mt-4 max-w-md mx-auto text-sm sm:text-base">

          NeedGO&apos;da her şey ücretsiz — para geçmez, sadece paylaşım geçer.

        </p>

        <div className="flex items-center justify-center gap-3 mt-7">

          <button

            onClick={ilanVerTiklandi}

            className="text-sm font-semibold px-5 py-2.5 rounded-full bg-[var(--renk-ocre)] text-white hover:brightness-95 transition"

          >

            İlan Ver

          </button>

          <a href="#ilanlar" className="text-sm font-semibold px-5 py-2.5 rounded-full border border-[var(--renk-ink)]/20 text-[var(--renk-ink)] hover:border-[var(--renk-ink)] transition">

            İlanlara Göz At

          </a>

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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

          {gosterilenIlanlar.map((ilan) => (

            <Link

              key={ilan.id}

              href={`/ilan/${ilan.id}`}

              className="relative bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] rounded-lg overflow-hidden shadow-sm flex flex-col hover:shadow-md hover:border-[var(--renk-orman)]/40 transition-all"

            >

              <div className="relative aspect-square bg-[var(--renk-kraft)]">

                {ilan.fotograf_url ? (

                  <img src={ilan.fotograf_url} alt={ilan.baslik} className="w-full h-full object-cover" />

                ) : (

                  <div className="w-full h-full flex items-center justify-center text-[var(--renk-ink)]/20 font-display text-3xl">

                    NG

                  </div>

                )}

                <div className="absolute top-2 right-2 rotate-6 border-2 border-[var(--renk-orman)] text-[var(--renk-orman)] font-mono-etiket text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-[var(--renk-kart)]">

                  Ücretsiz

                </div>

              </div>



              <div className="p-3 flex-1 flex flex-col">

                <h3 className="font-display text-sm font-semibold text-[var(--renk-ink)] leading-snug line-clamp-2">

                  {ilan.baslik}

                </h3>

                <div className="font-mono-etiket text-[10px] text-[var(--renk-ink)]/50 mt-auto pt-2">

                  {ilan.konum && <div className="truncate">{ilan.konum}</div>}

                  {ilan.kategori && <div className="truncate">{ilan.kategori.toUpperCase()}</div>}

                </div>

              </div>

            </Link>

          ))}

        </div>

      </main>



      <footer className="border-t border-[var(--renk-cizgi)] mt-10 bg-[var(--renk-kart)]">

        <div className="max-w-6xl mx-auto px-5 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">

          <div>

            <h3 className="font-display text-sm font-semibold text-[var(--renk-ink)] mb-3">Popüler Kategoriler</h3>

            <ul className="flex flex-col gap-2">

              {KATEGORILER.slice(0, 4).map((kat) => (

                <li key={kat}>

                  <button

                    onClick={() => {

                      setSeciliKategori(kat)

                      document.getElementById('ilanlar')?.scrollIntoView({ behavior: 'smooth' })

                    }}

                    className="text-xs text-[var(--renk-ink)]/60 hover:text-[var(--renk-orman)] transition-colors text-left"

                  >

                    {kat}

                  </button>

                </li>

              ))}

            </ul>

          </div>



          <div>

            <h3 className="font-display text-sm font-semibold text-[var(--renk-ink)] mb-3">Popüler Sayfalar</h3>

            <ul className="flex flex-col gap-2">

              <li>

                <a href="#ilanlar" className="text-xs text-[var(--renk-ink)]/60 hover:text-[var(--renk-orman)] transition-colors">

                  Tüm İlanlar

                </a>

              </li>

              <li>

                <button onClick={ilanVerTiklandi} className="text-xs text-[var(--renk-ink)]/60 hover:text-[var(--renk-orman)] transition-colors text-left">

                  İlan Ver

                </button>

              </li>

              {kullanici && (

                <li>

                  <Link href="/ilanlarim" className="text-xs text-[var(--renk-ink)]/60 hover:text-[var(--renk-orman)] transition-colors">

                    İlanlarım

                  </Link>

                </li>

              )}

            </ul>

          </div>



          <div>

            <h3 className="font-display text-sm font-semibold text-[var(--renk-ink)] mb-3">NeedGO</h3>

            <ul className="flex flex-col gap-2">

              <li><span className="text-xs text-[var(--renk-ink)]/60">Hakkımızda</span></li>

              <li><span className="text-xs text-[var(--renk-ink)]/60">Nasıl Çalışır</span></li>

              <li><span className="text-xs text-[var(--renk-ink)]/60">Sıkça Sorulan Sorular</span></li>

              <li><span className="text-xs text-[var(--renk-ink)]/60">İletişim</span></li>

            </ul>

          </div>



          <div>

            <h3 className="font-display text-sm font-semibold text-[var(--renk-ink)] mb-3">Bizi Takip Et</h3>

            <div className="flex gap-2">

              {['IG', 'X', 'FB', 'TT'].map((sosyal) => (

                <span

                  key={sosyal}

                  className="w-8 h-8 rounded-full bg-[var(--renk-kraft)] border border-[var(--renk-cizgi)] flex items-center justify-center text-[9px] font-mono-etiket text-[var(--renk-ink)]/50"

                >

                  {sosyal}

                </span>

              ))}

            </div>

          </div>

        </div>



        <div className="border-t border-[var(--renk-cizgi)]">

          <div className="max-w-6xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

            <p className="text-xs text-[var(--renk-ink)]/50">

              © 2026 NeedGO — İsrafı önlemek için buradayız. Her şey ücretsiz.

            </p>

            <div className="flex gap-4">

              <span className="text-xs text-[var(--renk-ink)]/40">Şartlar ve Koşullar</span>

              <span className="text-xs text-[var(--renk-ink)]/40">Gizlilik Bildirimi</span>

            </div>

          </div>

        </div>

      </footer>

    </div>

  )

}

