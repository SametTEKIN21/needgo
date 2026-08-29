import StatikSayfaShell from '../StatikSayfaShell'

export default function GizlilikBildirimi() {
  return (
    <StatikSayfaShell baslik="Gizlilik Bildirimi">
      <div className="flex flex-col gap-7 text-sm sm:text-base text-[var(--renk-ink)]/80 leading-relaxed">

        <p className="text-xs text-[var(--renk-ink)]/50">
          Kişisel Verilerin Korunması ve İşlenmesine İlişkin Aydınlatma Metni
        </p>

        <section>
          <h2 className="font-display text-lg font-semibold text-[var(--renk-ink)] mb-2">
            Madde 1 — Veri Sorumlusu
          </h2>
          <p>
            NeedGO olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
            uyarınca Veri Sorumlusu sıfatıyla, platformumuzu kullanan siz değerli
            kullanıcılarımızı kişisel verilerinizin işlenmesine ilişkin aydınlatmak isteriz.
          </p>
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
            elektronik ortamda (web sitesi üzerinden) toplanmaktadır.
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
            Madde 4 — Kişisel Verilerin Aktarılması
          </h2>
          <p>
            Kişisel verileriniz, platformun teknik altyapısını sağlayan hizmet
            sağlayıcımız (veritabanı ve sunucu hizmeti) ile sınırlı olarak
            paylaşılmaktadır. Bu hizmet sağlayıcı, verilerinizi yalnızca teknik altyapı
            hizmetinin sağlanması amacıyla işler. Yasal bir zorunluluk halinde, yetkili
            kamu kurum ve kuruluşları ile paylaşım yapılabilir.
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
            <a href="/iletisim" className="text-[var(--renk-orman)] font-semibold hover:underline">
              İletişim
            </a>{' '}
            sayfamızda yer alan e-posta adresimiz üzerinden bize ulaşabilirsiniz.
          </p>
        </section>

      </div>
    </StatikSayfaShell>
  )
}
