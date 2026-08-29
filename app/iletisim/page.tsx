import StatikSayfaShell from '../StatikSayfaShell'

export default function Iletisim() {
  return (
    <StatikSayfaShell baslik="İletişim">
      <div className="flex flex-col gap-4 text-sm sm:text-base text-[var(--renk-ink)]/80 leading-relaxed">
        <p>
          Sorularınız, önerileriniz ya da iş birliği talepleriniz için bize e-posta
          gönderebilirsiniz.
        </p>
        <a
          href="mailto:destek.needgo@gmail.com"
          className="inline-block self-start text-sm font-semibold px-5 py-2.5 rounded-full bg-[var(--renk-orman)] text-[var(--renk-kraft)] hover:bg-[var(--renk-orman-koyu)] transition-colors"
        >
          destek.needgo@gmail.com
        </a>
        <p className="text-xs text-[var(--renk-ink)]/50 mt-4">
          İstanbul, Türkiye
        </p>
      </div>
    </StatikSayfaShell>
  )
}
