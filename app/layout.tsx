import type { Metadata } from "next";
import "./globals.css";

const baslik = "NeedGO";
const aciklama = "İhtiyacın olanı bul, kullanmadığını paylaş. Ücretsiz eşya paylaşım platformu.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.needgo.com.tr"),
  title: {
    default: baslik,
    template: `%s · ${baslik}`,
  },
  description: aciklama,
  openGraph: {
    title: baslik,
    description: aciklama,
    url: "/",
    siteName: baslik,
    images: [{ url: "/needgo-logo.png", width: 705, height: 634, alt: "NeedGO" }],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: baslik,
    description: aciklama,
    images: ["/needgo-logo.png"],
  },
  icons: {
    icon: "/needgo-n.png",
    apple: "/needgo-n.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}