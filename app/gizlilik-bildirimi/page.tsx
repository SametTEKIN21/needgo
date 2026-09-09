import StatikSayfaShell from '../StatikSayfaShell'

export default function GizlilikBildirimi() {
  return (
    <StatikSayfaShell baslik="Gizlilik Bildirimi">
      <div className="flex flex-col gap-7 text-sm sm:text-base text-[var(--renk-ink)]/80 leading-relaxed">

        <div className="flex flex-col gap-1">
          <p className="text-xs text-[var(--renk-ink)]/50">
            Kişisel Verilerin Korunması ve İşlenmesine İlişkin Aydınlatma Metni
          </p>
          <p className="text-xs text-[var(--renk-ink)]/50">Son güncelleme: 9 Eylül 2026</p>
        </div>

        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-2">
            Madde 1 — Veri Sorumlusu
          </h2>
          <p>
            NeedGO platformu, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
            uyarınca Veri Sorumlusu sıfatıyla aşağıdaki gerçek kişi tarafından işletilmektedir:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1 mt-2">
            <li>Unvan: Burak Tekin Bilgisayar Programlama Faaliyetleri</li>
            <li>Adres: Çeliktepe Mah. Buhara Sk. No:15/4, Kağıthane/İstanbul</li>
            <li>
              E-posta:{' '}
              <a href="mailto:destek.needgo@gmail.com" className="text-[var(--renk-orman)] font-semibold hover:underline">
                destek.needgo@gmail.com
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-2">
            Madde 2 — Toplanan Kişisel Veriler ve Toplama Yöntemi
          </h2>
          <p className="mb-2">
            Platformumuz üzerinden hesap oluşturmanız, ilan vermeniz veya diğer
            kullanıcılarla mesajlaşmanız sırasında aşağıdaki kişisel verileriniz
            toplanmaktadır:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Kimlik ve iletişim bilgisi: e-posta adresiniz</li>
            <li>
              Hesap güvenlik bilgisi: şifreniz (şifrelenmiş biçimde saklanır, NeedGO
              tarafından okunamaz)
            </li>
            <li>
              İlan bilgisi: verdiğiniz ilanların başlığı, açıklaması, kategorisi, konum
              bilgisi ve yüklediğiniz fotoğraflar
            </li>
            <li>
              İletişim içeriği: platform içi mesajlaşma sistemi üzerinden diğer
              kullanıcılarla yaptığınız yazışmalar
            </li>
            <li>Kullanım bilgisi: ilanlara verdiğiniz görüntülenme ve beğeni etkileşimleri</li>
          </ul>
          <p className="mt-2">
            Bu veriler, platformumuzu kullanımınız sırasında doğrudan sizin tarafınızdan,
            elektronik ortamda (web sitesi ve/veya mobil uygulama üzerinden) toplanmaktadır.
            Uygulamayı bir mobil mağazadan (App Store, Google Play) indirmeniz halinde, o
            mağazanın kendi gizlilik politikası kapsamında topladığı kullanım istatistikleri
            NeedGO&apos;nun kontrolü ve sorumluluğu dışındadır.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-2">
            Madde 3 — Kişisel Verilerin İşlenme Amaçları
          </h2>
          <p className="mb-2">
            Kişisel verileriniz yalnızca aşağıdaki amaçlarla işlenmektedir:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Hesabınızın oluşturulması, güvenliğinin sağlanması ve giriş işlemlerinizin yürütülmesi</li>
            <li>Verdiğiniz ilanların platformda yayınlanması ve diğer kullanıcılara gösterilmesi</li>
            <li>Kullanıcılar arasında platform içi mesajlaşmanın sağlanması</li>
            <li>Şifre sıfırlama ve hesap bildirimleri gibi işlevsel e-postaların gönderilmesi</li>
            <li>Platformun işleyişinin ve güvenliğinin sağlanması, kötüye kullanımın önlenmesi</li>
            <li>Yasal yükümlülüklerimizin yerine getirilmesi ve yetkili kurumların taleplerinin karşılanması</li>
          </ul>
          <p className="mt-2">
            NeedGO, kişisel verilerinizi hiçbir şekilde ticari pazarlama, reklam veya
            üçüncü taraf pazarlama faaliyetleri için kullanmaz veya satmaz. Platformumuzda
            ödeme işlemi gerçekleşmediği için finansal veri toplanmamaktadır.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-2">
            Madde 4 — Kişisel Verilerin Aktarılması ve Yurt Dışına Aktarım
          </h2>
          <p className="mb-2">
            Kişisel verileriniz, platformun teknik altyapısını sağlayan hizmet
            sağlayıcımız (veritabanı ve sunucu hizmeti) ile sınırlı olarak
            paylaşılmaktadır. Bu hizmet sağlayıcı, verilerinizi yalnızca teknik altyapı
            hizmetinin sağlanması amacıyla işler.
          </p>
          <p className="mb-2">
            Sunucularımız Avrupa Birliği sınırları içinde, Almanya (Frankfurt) bölgesinde
            barındırılmaktadır. Bu durum KVKK kapsamında yurt dışına veri aktarımı olarak
            değerlendirildiğinden, verileriniz KVKK m.9 uyarınca açık rızanıza dayanılarak
            ve/veya kanunda öngörülen uygun güvenceler sağlanarak aktarılmaktadır.
          </p>
          <p>
            Yasal bir zorunluluk halinde, yetkili kamu kurum ve kuruluşları ile paylaşım
            yapılabilir.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-2">
            Madde 5 — Kişisel Veri Sahibinin Hakları
          </h2>
          <p className="mb-2">
            KVKK&apos;nın 11. maddesi uyarınca, kişisel verilerinizle ilgili olarak:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
            <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
            <li>İşlenmesini gerektiren sebepler ortadan kalktığında silinmesini veya yok edilmesini isteme</li>
            <li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
          </ul>
          <p className="mt-2">
            haklarına sahipsiniz. Bu haklarınızı kullanmak için{' '}
            <a href="mailto:destek.needgo@gmail.com" className="text-[var(--renk-orman)] font-semibold hover:underline">
              destek.needgo@gmail.com
            </a>{' '}
            adresi üzerinden veya{' '}
            <a href="/iletisim" className="text-[var(--renk-orman)] font-semibold hover:underline">
              İletişim
            </a>{' '}
            sayfamızdan bize ulaşabilirsiniz.
          </p>
        </section>

      </div>
    </StatikSayfaShell>
  )
}
