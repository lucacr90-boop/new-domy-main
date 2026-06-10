const LABELS = {
  en: 'Exclusive',
  it: 'Esclusiva',
  cs: 'Exkluzivn\u011b'
}

export default function ExclusiveBadge({ language = 'cs', className = '' }) {
  const label = LABELS[language] || LABELS.en

  return (
    <span
      className={`inline-flex items-center rounded-full bg-amber-500/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-lg ring-1 ring-white/35 ${className}`}
    >
      {label}
    </span>
  )
}
