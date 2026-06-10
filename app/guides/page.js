'use client'

import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Clock, ChevronRight } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PropertySlider from '@/components/PropertySlider'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'
import ProtectedContentLink from '@/components/ProtectedContentLink'

const GUIDES = [
  {
    slug: 'rekonstrukce-domů-v-italii',
    date: '2026-03-10',
    readTime: '8 min',
    title: {
      en: 'How much does house renovation in Italy cost?',
      cs: 'Kolik stojí rekonstrukce domů v Itálii?',
      it: 'Quanto costa ristrutturare una casa in Italia?'
    },
    excerpt: {
      en: 'Indicative price ranges, key cost drivers, and what to verify before purchase.',
      cs: 'Orientační cenové pásmo, hlavní faktory nákladů a co ověřit před koupí.',
      it: 'Fasce indicative di costo, fattori principali e verifiche da fare prima dell\'acquisto.'
    }
  },
  {
    slug: 'real-estate-purchase-system-italy',
    date: '2026-02-11',
    readTime: '10 min',
    title: {
      en: 'How the Italian Property Buying System Really Works (and Why It’s Different from the Czech Republic)',
      cs: 'Jak skutečně funguje italský systém koupě nemovitostí (a proč se liší od České republiky)',
      it: 'Come funziona davvero il sistema di acquisto immobiliare in Italia (e perché è diverso dalla Repubblica Ceca)'
    },
    excerpt: {
      en: 'Roles, checks, risks, and practical process logic for foreign buyers.',
      cs: 'Role, kontroly, rizika a praktická logika procesu pro zahraniční kupující.',
      it: 'Ruoli, controlli, rischi e logica pratica del processo per chi compra dall’estero.'
    }
  },
  {
    slug: 'notary',
    date: '2026-01-21',
    readTime: '7 min',
    title: {
      en: 'Notary in Italy: role and costs',
      cs: 'Notář v Itálii: role a náklady',
      it: 'Notaio in Italia: ruolo e costi'
    },
    excerpt: {
      en: 'What the notary verifies and what remains outside notarial scope.',
      cs: 'Co notář ověřuje a co zůstává mimo notářský rozsah.',
      it: 'Cosa verifica il notaio e cosa resta fuori dal suo ambito.'
    }
  },
  {
    slug: 'inspections',
    date: '2026-01-21',
    readTime: '6 min',
    title: {
      en: 'How property viewings work in Italy',
      cs: 'Jak probíhají prohlídky nemovitostí v Itálii',
      it: 'Come funzionano le visite immobiliari in Italia'
    },
    excerpt: {
      en: 'What to check during viewings and right after each visit.',
      cs: 'Co kontrolovat během prohlídek a hned po nich.',
      it: 'Cosa controllare durante le visite e subito dopo.'
    }
  },
  {
    slug: 'mistakes',
    date: '2026-01-15',
    readTime: '7 min',
    title: {
      en: 'Most common mistakes when buying in Italy',
      cs: 'Nejčastější chyby při koupí v Itálii',
      it: 'Gli errori più comuni nell’acquisto in Italia'
    },
    excerpt: {
      en: 'Typical pitfalls and how to avoid expensive errors.',
      cs: 'Typické pasti a jak předejít drahým chybám.',
      it: 'Le trappole più frequenti e come evitare errori costosi.'
    }
  },
  {
    slug: 'costs',
    date: '2026-01-06',
    readTime: '8 min',
    title: {
      en: 'Real costs of buying a house in Italy',
      cs: 'Reálné náklady na koupí domů v Itálii',
      it: 'Costi reali per acquistare una casa in Italia'
    },
    excerpt: {
      en: 'The real cost structure beyond listing price.',
      cs: 'Skutečná struktura nákladů nad rámec inzerované ceny.',
      it: 'La struttura reale dei costi oltre il prezzo di annuncio.'
    }
  }
]

const UI = {
  en: {
    badge: 'Guides Hub',
    title: 'All guides about buying property in Italy',
    subtitle: 'Structured resources for foreign buyers, from first planning to final deed.'
  },
  cs: {
    badge: 'Hub průvodců',
    title: 'Všechny průvodce ke koupí nemovitostí v Itálii',
    subtitle: 'Strukturované zdroje pro zahraniční kupující od prvního plánování až po finální podpis.'
  },
  it: {
    badge: 'Hub guide',
    title: "Tutte le guide per acquistare casa in Italia",
    subtitle: "Risorse strutturate per chi compra dall'estero, dalla pianificazione iniziale al rogito."
  }
}

function localize(value, language) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[language] || value.en || value.cs || value.it || ''
}

export default function GuidesHubPage() {
  const [language, setLanguage] = useState('cs')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage && UI[savedLanguage]) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    const handleLanguageChange = (event) => {
      const nextLanguage = event?.detail
      if (nextLanguage && UI[nextLanguage]) {
        setLanguage(nextLanguage)
        document.documentElement.lang = nextLanguage
      }
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const copy = UI[language] || UI.en

  const guides = useMemo(() => {
    return [...GUIDES].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [])

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <main className="pt-28 pb-14">
        <div className="container mx-auto px-6" style={{maxWidth:"1200px"}}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-5">
                <BookOpen className="h-4 w-4 text-slate-600" />
                <span className="text-sm text-slate-700 font-medium">{copy.badge}</span>
              </div>
              <h1 className="font-bold text-slate-900 mb-8">{copy.title}</h1>
              <p className="text-slate-600 text-lg">{copy.subtitle}</p>
            </div>

            <div className="space-y-4">
              {guides.map((guide) => (
                <ProtectedContentLink
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  language={language}
                  className="block bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h2 className="font-semibold text-slate-900">{localize(guide.title, language)}</h2>
                    <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  </div>
                  <p className="text-slate-600 mb-3">{localize(guide.excerpt, language)}</p>
                  <div className="text-sm text-slate-500 flex items-center gap-4">
                    <span>{guide.date}</span>
                    <span className="inline-flex items-center">
                      <Clock className="h-4 w-4 mr-1.5" />
                      {guide.readTime}
                    </span>
                  </div>
                </ProtectedContentLink>
              ))}
            </div>
          </div>
        </div>
      </main>

      <div className="container mx-auto px-6 pb-10" style={{ maxWidth: '1200px' }}>
        <div className="max-w-5xl mx-auto">
          <InformationalDisclaimer language={language} />
        </div>
      </div>

      <PropertySlider language={language} />
      <Footer language={language} />
    </div>
  )
}

