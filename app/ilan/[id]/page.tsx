import type { Metadata } from 'next'
import IlanDetayClient from './IlanDetayClient'

type IlanOnizleme = {
  baslik: string
  aciklama: string | null
  kategori: string | null
  konum: string | null
  fotograf_url: string | null
  fotograflar: string[] | null
}

async function ilanOnizlemeGetir(id: string): Promise<IlanOnizleme | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  try {
    const res = await fetch(
      `${url}/rest/v1/ilanlar?id=eq.${encodeURIComponent(id)}&select=baslik,aciklama,kategori,konum,fotograf_url,fotograflar`,
      {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        next: { revalidate: 60 },
      }
    )
    if (!res.ok) return null
    const veri = await res.json()
    return veri?.[0] ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: PageProps<'/ilan/[id]'>): Promise<Metadata> {
  const { id } = await params
  const ilan = await ilanOnizlemeGetir(id)
  const yol = `/ilan/${id}`

  if (!ilan) {
    return { alternates: { canonical: yol } }
  }

  const gorsel = ilan.fotograflar?.[0] || ilan.fotograf_url || undefined
  const aciklama =
    ilan.aciklama?.slice(0, 160) ||
    [ilan.kategori, ilan.konum].filter(Boolean).join(' · ') ||
    "NeedGO'da ücretsiz paylaşılıyor."

  return {
    title: ilan.baslik,
    description: aciklama,
    alternates: { canonical: yol },
    openGraph: {
      title: ilan.baslik,
      description: aciklama,
      url: yol,
      type: 'website',
      images: gorsel ? [{ url: gorsel }] : undefined,
    },
    twitter: {
      card: gorsel ? 'summary_large_image' : 'summary',
      title: ilan.baslik,
      description: aciklama,
      images: gorsel ? [gorsel] : undefined,
    },
  }
}

export default function IlanDetaySayfasi() {
  return <IlanDetayClient />
}
