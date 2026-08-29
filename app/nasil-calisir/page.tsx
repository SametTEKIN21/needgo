import StatikSayfaShell from '../StatikSayfaShell'

const ADIMLAR = [
  {
    baslik: 'Ücretsiz kayıt ol',
    aciklama: 'E-posta adresinle birkaç saniyede hesap oluştur.',
  },
  {
    baslik: 'İlan ver ya da göz at',
    aciklama: 'Kullanmadığın bir eşyayı fotoğraflarıyla paylaş, ya da ihtiyacın olanı ara.',
  },
  {
    baslik: 'İletişime geç',
    aciklama: 'Beğendiğin ilana tıkla, ilan sahibiyle doğrudan iletişime geç.',
  },
  {
    baslik: 'Buluş ve teslim al',
    aciklama: 'Aranızda anlaştığınız yer ve zamanda buluşup eşyayı teslim alın. Para geçmez.',
  },
]

export default function NasilCalisir() {
  return (
    <StatikSayfaShell baslik="Nasıl Çalışır?">
      <div className="flex flex-col gap-5">
        {ADIMLAR.map((adim, index) => (
          <div key={adim.baslik} className="flex gap-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--renk-orman)] text-[var(--renk-kraft)] flex items-center justify-center font-mono-etiket text-sm font-semibold">
              {index + 1}
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-[var(--renk-ink)]">
                {adim.baslik}
              </h3>
              <p className="text-sm text-[var(--renk-ink)]/70 mt-0.5">{adim.aciklama}</p>
            </div>
          </div>
        ))}
      </div>
    </StatikSayfaShell>
  )
}
