import StatikSayfaShell from '../StatikSayfaShell'

export default function KullanimSartlari() {
  return (
    <StatikSayfaShell baslik="Kullanım Şartları">
      <div className="flex flex-col gap-7 text-sm sm:text-base text-[var(--renk-ink)]/80 leading-relaxed">

        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-2">
            Madde 1 — Kabul
          </h2>
          <p>
            NeedGO platformunu kullanarak, işbu Kullanım Şartları&apos;nı kabul etmiş
            sayılırsınız. Şartları kabul etmiyorsanız platformu kullanmamalısınız.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-2">
            Madde 2 — Hizmetin Tanımı
          </h2>
          <p>
            NeedGO, kullanıcıların ihtiyaç fazlası eşyalarını ücretsiz olarak diğer
            kullanıcılara ulaştırabildiği bir paylaşım platformudur. Platform üzerinden{' '}
            <span className="font-semibold text-[var(--renk-orman)]">hiçbir ürün veya hizmet satışı yapılmaz</span>,
            para veya benzeri bir karşılık geçmez.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-2">
            Madde 3 — Kullanıcı Yükümlülükleri
          </h2>
          <p className="mb-2">Platformu kullanırken:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Verdiğiniz bilgilerin (e-posta, ilan içeriği vb.) doğru ve güncel olmasını sağlamakla,</li>
            <li>Yalnızca yasal olarak sahibi olduğunuz ve paylaşma hakkınız olan eşyaları ilan etmekle,</li>
            <li>Diğer kullanıcılara karşı saygılı ve dürüst davranmakla,</li>
            <li>Platformu ticari amaçla (toplu alım-satım, reklam vb.) kullanmamakla</li>
          </ul>
          <p className="mt-2">yükümlüsünüz.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-2">
            Madde 4 — Yasaklı İçerikler
          </h2>
          <p>
            Aşağıdaki eşyaların ilan edilmesi kesinlikle yasaktır: yasa dışı ürünler,
            silahlar, hayvanlar, tehlikeli veya zararlı maddeler, sahte/taklit ürünler,
            gıda ve ilaç ürünleri, ve yürürlükteki mevzuata aykırı herhangi bir madde veya
            hizmet.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-2">
            Madde 5 — Sorumluluk Reddi
          </h2>
          <p>
            NeedGO, kullanıcılar arasındaki eşya teslim sürecine taraf değildir. Buluşma
            yeri, zamanı, eşyanın durumu ve güvenliği konusundaki tüm sorumluluk
            kullanıcılara aittir. NeedGO, paylaşılan eşyaların doğruluğu, kalitesi veya
            güvenliği konusunda herhangi bir garanti vermez. Kullanıcılar, güvenli ve
            halka açık yerlerde buluşmaları konusunda dikkatli olmalıdır.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-2">
            Madde 6 — Hesabın Askıya Alınması
          </h2>
          <p>
            NeedGO, işbu şartları ihlal eden kullanıcıların hesaplarını önceden
            bildirimde bulunmaksızın askıya alma veya kapatma hakkını saklı tutar.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-2">
            Madde 7 — Fikri Mülkiyet
          </h2>
          <p>
            Platformdaki NeedGO markası, logosu ve tasarım unsurları NeedGO&apos;ya aittir.
            Kullanıcılar tarafından yüklenen içeriklerin (fotoğraf, metin) telif hakkı
            kullanıcılara aittir; kullanıcı, bu içerikleri platformda görüntülenmek üzere
            NeedGO&apos;ya kullanım izni vermiş sayılır.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-2">
            Madde 8 — Değişiklikler
          </h2>
          <p>
            NeedGO, işbu Kullanım Şartları&apos;nı zaman zaman güncelleyebilir. Güncel
            şartlar her zaman bu sayfada yayınlanır.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-2">
            Madde 9 — İletişim
          </h2>
          <p>
            Kullanım Şartları hakkındaki sorularınız için{' '}
            <a href="/iletisim" className="text-[var(--renk-orman)] font-semibold hover:underline">
              İletişim
            </a>{' '}
            sayfamızdaki e-posta adresinden bize ulaşabilirsiniz.
          </p>
        </section>

      </div>
    </StatikSayfaShell>
  )
}
