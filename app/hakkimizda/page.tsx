import StatikSayfaShell from '../StatikSayfaShell'

const DEGERLER = [
  {
    baslik: 'Çevre Koruma',
    aciklama:
      'Her yıl milyonlarca kullanılabilir eşya çöpe gidiyor. Biz her paylaşımla bir eşyanın daha çöp sahasına gitmesini engelliyor, karbon ayak izini azaltıyoruz.',
  },
  {
    baslik: 'Döngüsel Ekonomi',
    aciklama:
      'Eşyanın ömrü tek bir sahiple sınırlı değil. NeedGO, kullanım ömrünü uzatarak kaynakların daha verimli değerlendirildiği bir döngü kuruyor.',
  },
  {
    baslik: 'Sosyal Dayanışma',
    aciklama:
      'Bir ihtiyacın karşılanması bazen bir komşunun elini uzatmasıyla mümkün olur. Platformumuz, insanları ortak bir amaç etrafında bir araya getiriyor.',
  },
]

export default function Hakkimizda() {
  return (
    <StatikSayfaShell baslik="Hakkımızda">
      <div className="flex flex-col gap-8">

        <p className="text-sm sm:text-base text-[var(--renk-ink)]/80 leading-relaxed">
          NeedGO, kullanılmayan eşyaların çöpe gitmek yerine ihtiyacı olan bir başkasına
          ulaşmasını sağlamak amacıyla kurulan bir paylaşım platformudur. İnandığımız basit
          bir gerçek var: bir evde artık işlevini yitirmiş görünen bir eşya, başka bir evde
          tam da aranan çözüm olabilir.
        </p>

        <div>
          <h2 className="font-mono-etiket text-[11px] uppercase tracking-widest text-[var(--renk-orman)] mb-4">
            Neden Varız
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DEGERLER.map((deger) => (
              <div
                key={deger.baslik}
                className="bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] rounded-lg p-4"
              >
                <h3 className="font-display text-base font-semibold text-[var(--renk-ink)] mb-1.5">
                  {deger.baslik}
                </h3>
                <p className="text-sm text-[var(--renk-ink)]/70 leading-relaxed">
                  {deger.aciklama}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm sm:text-base text-[var(--renk-ink)]/80 leading-relaxed">
            Platformumuzda hiçbir işlem ücrete tabi değildir; komisyon alınmaz, ödeme
            geçmez. Bu prensip, katılımın önündeki en büyük engeli kaldırarak paylaşımı
            herkes için erişilebilir kılar ve toplulukta karşılıklı güvene dayalı bir
            kültür oluşturur.
          </p>
          <p className="text-sm sm:text-base text-[var(--renk-ink)]/80 leading-relaxed">
            Uzun vadeli hedefimiz, bireysel kullanıcıların ötesine geçerek STK&apos;lar,
            dernekler ve belediyelerle iş birliği kurmak; ihtiyaç sahibi ailelere toplu
            eşya desteği sağlayabilecek kurumsal bir yapı inşa etmektir.
          </p>
        </div>

        <div className="border-t border-[var(--renk-cizgi)] pt-6 text-center">
          <p className="font-display italic text-lg sm:text-xl text-[var(--renk-orman)]">
            Atma, paylaş, dönüştür.
          </p>
          <p className="font-display italic text-lg sm:text-xl text-[var(--renk-orman)] mt-1">
            Paylaşmak iyileştirir.
          </p>
        </div>

      </div>
    </StatikSayfaShell>
  )
}
