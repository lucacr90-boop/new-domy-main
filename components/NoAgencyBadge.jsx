'use client'

const LABELS = {
  en: 'No agency',
  it: 'No agenzia',
  cs: 'Bez realitn\u00ed kancel\u00e1\u0159e',
}

export function getNoAgencyLabel(language = 'cs') {
  return LABELS[language] || LABELS.en
}

export default function NoAgencyBadge({ language = 'cs', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-emerald-700/95 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white shadow-lg ring-1 ring-white/30 ${className}`}
    >
      {getNoAgencyLabel(language)}
    </span>
  )
}
