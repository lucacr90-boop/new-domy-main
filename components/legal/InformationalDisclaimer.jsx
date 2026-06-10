import Link from 'next/link'

const COPY = {
  cs: {
    articleTitle: 'Informační upozornění',
    articleBody:
      'Obsah na této stránce má pouze obecný informační charakter. Sám o sobě nepředstavuje individuální právní, daňové, notářské, technické ani investiční poradenství. Konkrétní případy je vždy nutné posoudit samostatně s kvalifikovanými odborníky.',
    pdfTitle: 'Upozornění k PDF obsahu',
    pdfBody:
      'Tento PDF materiál slouží pouze pro obecné informační a operativní účely. Zakoupení ani stažení obsahu samo o sobě nevytváří individuální poradenský vztah. Pro konkrétní situaci je nutné samostatné odborné posouzení.',
    linksPrefix: 'Podrobnosti najdete v',
    terms: 'podmínkách',
    privacy: 'informacích o ochraně osobních údajů'
  },
  it: {
    articleTitle: 'Nota informativa',
    articleBody:
      'I contenuti di questa pagina hanno finalità esclusivamente informative e generali. Da soli non costituiscono consulenza legale, fiscale, notarile, tecnica o di investimento personalizzata. I casi concreti devono sempre essere verificati con professionisti qualificati.',
    pdfTitle: 'Nota sul contenuto PDF',
    pdfBody:
      "Questo PDF ha finalità informative e operative generali. L'acquisto o il download del contenuto non crea, da solo, un rapporto di consulenza professionale individuale. Per situazioni specifiche è sempre necessaria una verifica separata con professionisti qualificati.",
    linksPrefix: 'Per maggiori dettagli consulta',
    terms: 'i termini',
    privacy: 'l informativa privacy'
  },
  en: {
    articleTitle: 'Informational Notice',
    articleBody:
      'The content on this page is provided for general informational purposes only. On its own, it does not constitute individualized legal, tax, notarial, technical, or investment advice. Specific cases should always be reviewed separately with qualified professionals.',
    pdfTitle: 'PDF Content Notice',
    pdfBody:
      'This PDF is provided for general informational and operational purposes only. Purchasing or downloading the content does not, by itself, create an individualized professional advisory relationship. Specific situations always require separate review by qualified professionals.',
    linksPrefix: 'For more details, see the',
    terms: 'terms',
    privacy: 'privacy notice'
  }
}

export default function InformationalDisclaimer({
  language = 'cs',
  variant = 'article',
  className = ''
}) {
  const copy = COPY[language] || COPY.en
  const title = variant === 'pdf' ? copy.pdfTitle : copy.articleTitle
  const body = variant === 'pdf' ? copy.pdfBody : copy.articleBody

  return (
    <div className={`rounded-2xl border border-amber-200 bg-amber-50/70 p-5 md:p-6 ${className}`.trim()}>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-900">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-amber-950">{body}</p>
      <p className="mt-3 text-xs leading-relaxed text-amber-900/85">
        {copy.linksPrefix}{' '}
        <Link href="/terms" className="underline underline-offset-2">
          {copy.terms}
        </Link>{' '}
        {language === 'cs' ? 'a' : 'e'}{' '}
        <Link href="/gdpr" className="underline underline-offset-2">
          {copy.privacy}
        </Link>
        .
      </p>
    </div>
  )
}
