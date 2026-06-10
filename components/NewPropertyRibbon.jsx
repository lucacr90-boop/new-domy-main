'use client'

const LABELS = {
  en: 'New',
  it: 'Novit\u00e0',
  cs: 'Novinka',
}

export function getNewPropertyLabel(language = 'cs') {
  return LABELS[language] || LABELS.en
}

export default function NewPropertyRibbon({ language = 'cs', className = '', compact = false, inline = false }) {
  return (
    <div className={`pointer-events-none ${inline ? 'relative' : 'absolute right-4 bottom-7 z-20'} flex items-stretch drop-shadow-[0_12px_22px_rgba(15,23,42,0.34)] ${className}`}>
      <div className={`relative rounded-xl bg-slate-800 text-center font-black uppercase text-yellow-200 ring-2 ring-yellow-300/85 [text-shadow:0_1px_0_rgba(0,0,0,0.55),0_0_14px_rgba(253,224,71,0.55)] ${
        compact
          ? 'px-3.5 py-2 text-[11px] tracking-[0.12em]'
          : 'px-7 py-3 text-[15px] tracking-[0.18em]'
      }`}>
        {getNewPropertyLabel(language)}
      </div>
    </div>
  )
}
