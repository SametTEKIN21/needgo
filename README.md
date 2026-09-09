# NeedGO — Web (Next.js)

Ücretsiz eşya paylaşım platformunun web istemcisi. Mobil uygulama ayrı repoda:
`github.com/SametTEKIN21/needgoapp` (React Native / Expo).

## Ortak backend — TEK KAYNAK

Web ve mobil **aynı Supabase projesini** kullanır. Kurallar tek yerde:

- **RLS + şema:** `supabase/guvenlik-v2.sql` — **her iki repoda birebir aynı dosya.**
  DB değişikliği: dosyayı güncelle → iki repoya kopyala → Supabase SQL Editor'de çalıştır.
  (`guvenlik-v2.sql`, eski `moderasyon.sql`/`kota-limiti.sql`/`mesaj-silme.sql`/`ilan-silme.sql`
  dosyalarının yerini alan birleşik settir.)
- **İş kuralları** (kota limiti, zorunlu profil alanları): `uygulama_ayarlari` tablosu →
  `uygulama_ayarlari()` RPC. `app/lib/kota.ts` oradan okur.
- **Profil:** şifreli `profiller` tablosu + `profil_getir`/`profil_kaydet` RPC'leri
  (`app/lib/profil.ts`). Düz metin `user_metadata`'da TUTULMAZ.
- **Admin:** `adminler` tablosu + `admin_mi()`.
- **Env:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `HF_TOKEN`, `NEXT_PUBLIC_ADMIN_EMAILS`.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
