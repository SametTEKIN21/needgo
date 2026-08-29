import { createClient } from '@supabase/supabase-js'
import type { ModerasyonDurumu } from '../../lib/moderasyon'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const FOTO_BUCKET = 'ilan-fotograflari'

const HF_NSFW_MODEL = 'Falconsai/nsfw_image_detection'
const HF_ZEROSHOT_MODEL = 'openai/clip-vit-base-patch32'

// CLIP aday etiketleri (İngilizce daha iyi ayrışıyor) → kategori eşlemesi
const ADAY_ETIKETLER = [
  { etiket: 'a second-hand item, furniture, clothing, tool or electronics', kategori: 'uygun' },
  { etiket: 'food, a meal, drink or something edible', kategori: 'yiyecek' },
  { etiket: 'a weapon, ammunition, drugs or a dangerous illegal item', kategori: 'tehlikeli' },
  { etiket: 'broken, damaged, rotten, dirty trash or garbage', kategori: 'cop' },
  { etiket: 'explicit nudity or sexual content', kategori: 'mustehcen' },
] as const

type Sonuc = { durum: ModerasyonDurumu; not: string | null }

function servisIstemcisi() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase servis anahtarı tanımlı değil')
  return createClient(url, key, { auth: { persistSession: false } })
}

async function hfIstek(
  model: string,
  init: RequestInit,
  deneme = 0
): Promise<unknown> {
  const token = process.env.HF_TOKEN
  if (!token) throw new Error('HF_TOKEN tanımlı değil')

  const kontrolor = new AbortController()
  const zamanlayici = setTimeout(() => kontrolor.abort(), 20000)
  try {
    const yanit = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        ...init,
        signal: kontrolor.signal,
        headers: { Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
      }
    )
    // Model uyanıyor — kısa bekleyip bir kez daha dene
    if ((yanit.status === 503 || yanit.status === 429) && deneme < 1) {
      await new Promise((r) => setTimeout(r, 3000))
      return hfIstek(model, init, deneme + 1)
    }
    if (!yanit.ok) throw new Error(`HF ${model} → ${yanit.status}`)
    return yanit.json()
  } finally {
    clearTimeout(zamanlayici)
  }
}

async function tekFotoTara(imgBytes: ArrayBuffer): Promise<Sonuc> {
  const buf = Buffer.from(imgBytes)
  const b64 = buf.toString('base64')

  // 1) NSFW ikili sınıflandırma
  let nsfwSkor = 0
  try {
    const nsfw = (await hfIstek(HF_NSFW_MODEL, {
      method: 'POST',
      body: buf,
    })) as { label: string; score: number }[]
    nsfwSkor = nsfw?.find((x) => /nsfw/i.test(x.label))?.score ?? 0
  } catch {
    // NSFW kontrolü yapılamadı — belirsiz say
    return { durum: 'beklemede', not: 'Otomatik tarama tamamlanamadı, elle inceleme gerekiyor.' }
  }

  if (nsfwSkor >= 0.85) {
    return { durum: 'reddedildi', not: 'Müstehcen / uygunsuz içerik tespit edildi.' }
  }

  // 2) Zero-shot kategori
  let enIyiKategori = 'uygun'
  let enIyiSkor = 0
  try {
    const zs = (await hfIstek(HF_ZEROSHOT_MODEL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: b64,
        parameters: { candidate_labels: ADAY_ETIKETLER.map((a) => a.etiket) },
      }),
    })) as { label: string; score: number }[]
    if (Array.isArray(zs) && zs.length > 0) {
      const ust = zs.reduce((a, b) => (b.score > a.score ? b : a))
      enIyiSkor = ust.score
      enIyiKategori =
        ADAY_ETIKETLER.find((a) => a.etiket === ust.label)?.kategori ?? 'uygun'
    }
  } catch {
    // Zero-shot yapılamadı — sadece NSFW skoruna göre karar ver
    if (nsfwSkor >= 0.5) {
      return { durum: 'beklemede', not: 'Görsel şüpheli bulundu, elle inceleme gerekiyor.' }
    }
    return { durum: 'onaylandi', not: null }
  }

  if (nsfwSkor >= 0.5) {
    return { durum: 'beklemede', not: 'Görsel şüpheli bulundu (NSFW), elle inceleme gerekiyor.' }
  }

  if (enIyiKategori === 'mustehcen' && enIyiSkor >= 0.6) {
    return { durum: 'reddedildi', not: 'Müstehcen / uygunsuz içerik tespit edildi.' }
  }
  if (enIyiKategori === 'tehlikeli' && enIyiSkor >= 0.6) {
    return { durum: 'reddedildi', not: 'Tehlikeli / yasaklı ürün tespit edildi.' }
  }
  if (
    (enIyiKategori === 'yiyecek' || enIyiKategori === 'cop' || enIyiKategori === 'tehlikeli') &&
    enIyiSkor >= 0.45
  ) {
    const aciklama: Record<string, string> = {
      yiyecek: 'Yiyecek / yenilebilir ürün olabilir.',
      cop: 'Kırık / kullanılamaz / çöp olabilir.',
      tehlikeli: 'Tehlikeli ürün olabilir.',
    }
    return { durum: 'beklemede', not: `${aciklama[enIyiKategori]} Elle inceleme gerekiyor.` }
  }

  return { durum: 'onaylandi', not: null }
}

function enKotu(sonuclar: Sonuc[]): Sonuc {
  if (sonuclar.some((s) => s.durum === 'reddedildi')) {
    return sonuclar.find((s) => s.durum === 'reddedildi')!
  }
  if (sonuclar.some((s) => s.durum === 'beklemede')) {
    return sonuclar.find((s) => s.durum === 'beklemede')!
  }
  return { durum: 'onaylandi', not: null }
}

function urlToPath(url: string): string | null {
  const m = url.match(
    new RegExp(`/storage/v1/object/public/${FOTO_BUCKET}/(.+)$`)
  )
  return m ? decodeURIComponent(m[1]) : null
}

export async function POST(request: Request) {
  let govde: { ilanId?: string }
  try {
    govde = await request.json()
  } catch {
    return Response.json({ hata: 'Geçersiz istek' }, { status: 400 })
  }
  const ilanId = govde.ilanId
  if (!ilanId) return Response.json({ hata: 'ilanId gerekli' }, { status: 400 })

  // Çağıranın kimliğini doğrula (kendi ilanı mı?)
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return Response.json({ hata: 'Yetki yok' }, { status: 401 })

  let servis
  try {
    servis = servisIstemcisi()
  } catch (e) {
    console.error('Moderasyon yapılandırma hatası:', e)
    // Yapılandırma eksik → güvenli tarafta kal, elle incelemeye bırak
    return Response.json({ durum: 'beklemede', not: 'Otomatik tarama devre dışı.' })
  }

  const { data: kullaniciData } = await servis.auth.getUser(token)
  const uid = kullaniciData.user?.id
  if (!uid) return Response.json({ hata: 'Oturum geçersiz' }, { status: 401 })

  const { data: ilan, error: ilanHata } = await servis
    .from('ilanlar')
    .select('id, user_id, fotograflar, fotograf_url, moderasyon_durumu')
    .eq('id', ilanId)
    .single()

  if (ilanHata || !ilan) {
    return Response.json({ hata: 'İlan bulunamadı' }, { status: 404 })
  }
  if (ilan.user_id !== uid) {
    return Response.json({ hata: 'Bu ilan sana ait değil' }, { status: 403 })
  }

  const fotoUrller: string[] =
    (ilan.fotograflar && ilan.fotograflar.length > 0
      ? ilan.fotograflar
      : ilan.fotograf_url
        ? [ilan.fotograf_url]
        : []) ?? []

  let sonuc: Sonuc = { durum: 'onaylandi', not: null }

  if (fotoUrller.length > 0) {
    const sonuclar: Sonuc[] = []
    for (const url of fotoUrller.slice(0, 5)) {
      try {
        const kontrolor = new AbortController()
        const zt = setTimeout(() => kontrolor.abort(), 15000)
        const img = await fetch(url, { signal: kontrolor.signal })
        clearTimeout(zt)
        if (!img.ok) {
          sonuclar.push({ durum: 'beklemede', not: 'Fotoğraf okunamadı, elle inceleme gerekiyor.' })
          continue
        }
        sonuclar.push(await tekFotoTara(await img.arrayBuffer()))
      } catch (e) {
        console.error('Foto tarama hatası:', e)
        sonuclar.push({ durum: 'beklemede', not: 'Tarama tamamlanamadı, elle inceleme gerekiyor.' })
      }
    }
    sonuc = enKotu(sonuclar)
  }

  // Sonucu ilana yaz
  const { error: guncelleHata } = await servis
    .from('ilanlar')
    .update({
      moderasyon_durumu: sonuc.durum,
      moderasyon_notu: sonuc.not,
      moderasyon_tarihi: new Date().toISOString(),
    })
    .eq('id', ilanId)

  if (guncelleHata) {
    console.error('Moderasyon güncelleme hatası:', guncelleHata)
    return Response.json({ durum: 'beklemede', not: 'Kaydedilemedi, elle inceleme gerekiyor.' })
  }

  // Reddedilen ilanın fotoğraflarını storage'dan temizle
  if (sonuc.durum === 'reddedildi' && fotoUrller.length > 0) {
    const yollar = fotoUrller.map(urlToPath).filter((p): p is string => !!p)
    if (yollar.length > 0) {
      await servis.storage.from(FOTO_BUCKET).remove(yollar)
    }
  }

  return Response.json({ durum: sonuc.durum, not: sonuc.not })
}
