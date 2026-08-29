import StatikSayfaShell from '../StatikSayfaShell'

const SORULAR = [
  {
    soru: 'NeedGO gerçekten tamamen ücretsiz mi?',
    cevap: 'Evet. Platformda hiçbir şekilde para geçmez, komisyon alınmaz. Sadece paylaşım geçer.',
  },
  {
    soru: 'Kimler kullanabilir?',
    cevap: 'Herkes. Öğrenciler, yeni eve taşınanlar, işletmeler ve ihtiyaç sahibi herkes NeedGO\'yu kullanabilir.',
  },
  {
    soru: 'Eşyayı nasıl teslim alacağım?',
    cevap: 'NeedGO kargo veya teslimat hizmeti sunmaz. Alıcı ve ilan sahibi aralarında anlaşarak buluşma yeri ve zamanı belirler.',
  },
  {
    soru: 'Hesabımı nasıl silebilirim?',
    cevap: 'Hesap Ayarları sayfasından "Hesabımı Sil" butonuyla bir silme talebi gönderebilirsin.',
  },
  {
    soru: 'STK/dernek/belediye olarak nasıl kayıt olabilirim?',
    cevap: 'Kurumsal kayıt özelliği üzerinde çalışıyoruz, yakında burada duyurulacak.',
  },
]

export default function SSS() {
  return (
    <StatikSayfaShell baslik="Sıkça Sorulan Sorular">
      <div className="flex flex-col gap-4">
        {SORULAR.map((s) => (
          <div key={s.soru} className="bg-[var(--renk-kart)] border border-[var(--renk-cizgi)] rounded-lg p-4">
            <h3 className="font-display text-base font-semibold text-[var(--renk-ink)]">{s.soru}</h3>
            <p className="text-sm text-[var(--renk-ink)]/70 mt-1">{s.cevap}</p>
          </div>
        ))}
      </div>
    </StatikSayfaShell>
  )
}
