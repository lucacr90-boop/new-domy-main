'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Clock, Hammer, Euro, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'

const CONTENT = {
  cs: {
    category: 'Rekonstrukce',
    date: '2026-03-10',
    readTime: '8 min',
    title: 'Kolik stojí rekonstrukce domů v Itálii?',
    intro: [
      'Mnoho Čechů si myslí, že koupit starší dům v Itálii znamená automaticky vysoké náklady na rekonstrukci.',
      'Realita je často jiná.',
      'V mnoha regionech Itálie může být rekonstrukce stále dostupná, pokud víte, co očekávat a jak systém funguje.'
    ],
    introListTitle: 'V tomto článku vysvětlujeme:',
    introList: [
      'orientační ceny rekonstrukce',
      'co nejvíce ovlivňuje náklady',
      'na co si dát pozor před koupí domů'
    ],
    cta1: {
      title: 'Uvažujete o koupí domů v Itálii?',
      text: 'Podívejte se nejdříve na náš přehled celého procesu.',
      button: 'Jak funguje náš servis při hledání domů v Itálii',
      href: '/process'
    },
    section1: {
      title: 'Proč domy v Itálii často potřebují rekonstrukci',
      paragraphs: [
        'Itálie má obrovské množství historických domů.',
        'Mnoho z nich bylo postaveno před desítkami nebo stovkami let a nebylo modernizováno podle dnešních standardů.',
        'To znamená, že na trhu často najdete domy, které mají velký potenciál, ale vyžadují určitou úpravu.'
      ],
      bullets: [
        'v historických centrech',
        'v horských oblastech',
        'v menších městech a vesnicích'
      ],
      outro: 'Pro mnoho kupujících je to výhoda, protože si dům mohou přizpůsobit přesně podle vlastních představ.',
      imageCaption: 'Starší domy v Itálii mají často velký potenciál po rekonstrukci.',
      imageAlt: 'Starší dům v Itálii před rekonstrukcí'
    },
    section2: {
      title: 'Orientační ceny rekonstrukce v Itálii',
      intro: 'Cena rekonstrukce závisí především na rozsahu prací. Níže uvádíme orientační přehled.',
      examplesLabel: 'například:',
      items: [
        {
          title: 'Menší úpravy',
          examples: ['malování', 'nové podlahy', 'drobné opravy'],
          priceLabel: 'Orientační cena:',
          price: '10 000 - 30 000 EUR'
        },
        {
          title: 'Částečná rekonstrukce',
          examples: ['nová koupelna', 'nová kuchyně', 'výměna instalací'],
          priceLabel: 'Orientační cena:',
          price: '30 000 - 80 000 EUR'
        },
        {
          title: 'Kompletní rekonstrukce',
          examples: ['nové rozvody', 'nová střecha', 'kompletní přestavba interiéru'],
          priceLabel: 'Orientační cena:',
          price: '80 000 - 200 000 EUR'
        }
      ]
    },
    cta2: {
      title: 'Chcete vědět, kolik stojí koupě domů v Itálii celkově?',
      text: 'Podívejte se na náš detailní přehled všech nákladů.',
      button: 'Kolik stojí koupě domů v Itálii',
      href: '/guides/costs'
    },
    section3: {
      title: 'Co nejvíce ovlivňuje cenu rekonstrukce',
      intro: 'Cena rekonstrukce není v celé Itálii stejná. Záleží především na těchto faktorech.',
      factors: [
        {
          title: 'Region',
          text: 'Například sever Itálie může být dražší než menší města na jihu.'
        },
        {
          title: 'Stav nemovitostí',
          text: 'Velký rozdíl je mezi domem, který potřebuje jen drobné úpravy, a domem vyžadujícím kompletní rekonstrukci.'
        },
        {
          title: 'Rozsah projektu',
          text: 'Někdo chce pouze modernizovat interiér. Jiní plánují kompletní přestavbu domů.'
        }
      ]
    },
    cta3: {
      title: 'Hledáte dům v Itálii a nejste si jistí, kolik může stát rekonstrukce?',
      text: 'Napište nám základní informace: váš rozpočet, region a typ nemovitostí. Pomůžeme vám najít vhodné nabídky.',
      button: 'Kontaktujte nás',
      href: '/contact'
    },
    section4: {
      title: 'Na co si dát pozor ještě před koupí',
      text: [
        'Mnoho kupujících dělá jednu chybu: nejdříve si vyberou dům a teprve potom zjišťují náklady rekonstrukce.',
        'Ve skutečnosti je lepší postup opačný.',
        'Nejdříve je důležité pochopit:'
      ],
      bullets: ['reálný rozpočet', 'možné náklady', 'regionální rozdíly']
    },
    cta4: {
      title: 'Připravili jsme také praktický průvodce pro české kupující',
      text: 'Pokud chcete lépe porozumět nejčastějším chybám při koupí domů v Itálii, můžete si stáhnout náš bezplatný PDF průvodce.',
      button: 'Stáhnout PDF - 7 nejčastějších chyb',
      href: '/pdfs/errori-comuni.pdf'
    },
    section5: {
      title: 'Závěr',
      text: 'Rekonstrukce domů v Itálii může být skvělá příležitost vytvořit si vlastní místo na jedinečném místě. Každá nemovitost je ale jiná a proto je vždy důležité analyzovat konkrétní situaci ještě před koupí.'
    },
    finalCta: {
      title: 'Pomáháme Čechům koupit dům v Itálii',
      text: 'Od první analýzy až po podpis u notáře.',
      button: 'Domluvte si konzultaci zdarma',
      href: '/contact'
    },
    breadcrumb: {
      home: 'Domů',
      guide: 'Průvodce',
      current: 'Rekonstrukce domů v Itálii'
    },
    back: 'Články'
  },
  en: {
    category: 'Renovation',
    date: '2026-03-10',
    readTime: '8 min',
    title: 'How much does house renovation in Italy cost?',
    intro: [
      'Many Czech buyers think that purchasing an older house in Italy automatically means very high renovation costs.',
      'Reality is often different.',
      'In many Italian regions, renovation can still be affordable if you know what to expect and how the system works.'
    ],
    introListTitle: 'In this article, we explain:',
    introList: [
      'indicative renovation prices',
      'the main factors that affect costs',
      'what to check before buying a property'
    ],
    cta1: {
      title: 'Thinking about buying a house in Italy?',
      text: 'Start with our overview of the full process.',
      button: 'How our service works when searching for a house in Italy',
      href: '/process'
    },
    section1: {
      title: 'Why houses in Italy often need renovation',
      paragraphs: [
        'Italy has a very large stock of historic homes.',
        'Many were built decades or even centuries ago and were not modernized to current standards.',
        'This means you can often find properties with strong potential that still need specific work.'
      ],
      bullets: ['in historic centers', 'in mountain areas', 'in smaller towns and villages'],
      outro: 'For many buyers this is an advantage, because they can shape the property according to their own needs.',
      imageCaption: 'Older houses in Italy often have strong potential after renovation.',
      imageAlt: 'Older Italian house before renovation'
    },
    section2: {
      title: 'Indicative renovation costs in Italy',
      intro: 'Renovation cost mainly depends on the scope of works. Here is a practical overview.',
      examplesLabel: 'for example:',
      items: [
        {
          title: 'Minor improvements',
          examples: ['painting', 'new floors', 'small repairs'],
          priceLabel: 'Indicative cost:',
          price: 'EUR 10,000 - 30,000'
        },
        {
          title: 'Partial renovation',
          examples: ['new bathroom', 'new kitchen', 'systems replacement'],
          priceLabel: 'Indicative cost:',
          price: 'EUR 30,000 - 80,000'
        },
        {
          title: 'Full renovation',
          examples: ['new utility lines', 'new roof', 'full interior rebuild'],
          priceLabel: 'Indicative cost:',
          price: 'EUR 80,000 - 200,000'
        }
      ]
    },
    cta2: {
      title: 'Want to know the total cost of buying a house in Italy?',
      text: 'See our detailed overview of all costs.',
      button: 'How much does buying a house in Italy cost',
      href: '/guides/costs'
    },
    section3: {
      title: 'What affects renovation price the most',
      intro: 'Renovation pricing is not the same across Italy. The main factors are:',
      factors: [
        {
          title: 'Region',
          text: 'For example, northern Italy can be more expensive than smaller towns in the south.'
        },
        {
          title: 'Property condition',
          text: 'There is a major difference between a house needing only small upgrades and one requiring full renovation.'
        },
        {
          title: 'Project scope',
          text: 'Some buyers only modernize the interior. Others plan a complete transformation.'
        }
      ]
    },
    cta3: {
      title: 'Looking for a house in Italy and unsure about renovation costs?',
      text: 'Send us your basic details: budget, region, and property type. We will help you identify suitable options.',
      button: 'Contact us',
      href: '/contact'
    },
    section4: {
      title: 'What to check before purchase',
      text: [
        'Many buyers make one mistake: they choose the house first and only then estimate renovation costs.',
        'In practice, the safer order is the opposite.',
        'First, it is important to define:'
      ],
      bullets: ['real budget', 'possible costs', 'regional differences']
    },
    cta4: {
      title: 'We also prepared a practical guide for Czech buyers',
      text: 'If you want to better understand the most common mistakes when buying in Italy, you can download our free PDF guide.',
      button: 'Download PDF - 7 most common mistakes',
      href: '/pdfs/errori-comuni.pdf'
    },
    section5: {
      title: 'Conclusion',
      text: 'Renovating a house in Italy can be a great opportunity to create your own place in a unique location. However, each property is different, so concrete analysis before purchase is always essential.'
    },
    finalCta: {
      title: 'We help Czech buyers purchase houses in Italy',
      text: 'From first analysis to the final notary signature.',
      button: 'Book a free consultation',
      href: '/contact'
    },
    breadcrumb: {
      home: 'Home',
      guide: 'Guide',
      current: 'House renovation in Italy'
    },
    back: 'Articles'
  },
  it: {
    category: 'Ristrutturazione',
    date: '2026-03-10',
    readTime: '8 min',
    title: 'Quanto costa ristrutturare una casa in Italia?',
    intro: [
      'Molti acquirenti cechi pensano che comprare una casa datata in Italia significhi automaticamente costi di ristrutturazione molto alti.',
      'La realtà è spesso diversa.',
      'In molte regioni italiane la ristrutturazione può rimanere accessibile, se sai cosa aspettarti e come funziona il sistema.'
    ],
    introListTitle: 'In questo articolo spieghiamo:',
    introList: [
      'fasce indicative dei costi di ristrutturazione',
      'i fattori che incidono di più sul costo finale',
      'cosa verificare prima di acquistare'
    ],
    cta1: {
      title: 'Stai valutando l\'acquisto di una casa in Italia?',
      text: 'Inizia dalla nostra panoramica completa del processo.',
      button: 'Scopri il nostro processo',
      href: '/process'
    },
    section1: {
      title: 'Perché le case in Italia richiedono spesso ristrutturazione',
      paragraphs: [
        'L\'Italia ha un patrimonio immobiliare storico molto ampio.',
        'Molte case sono state costruite decenni o secoli fa e non sono state adeguate agli standard attuali.',
        'Questo significa che sul mercato trovi spesso immobili con grande potenziale ma con necessità di intervento.'
      ],
      bullets: ['nei centri storici', 'nelle zone montane', 'nei piccoli comuni e nei borghi'],
      outro: 'Per molti acquirenti è un vantaggio, perché possono personalizzare la casa secondo il proprio obiettivo.',
      imageCaption: 'Le case più datate in Italia hanno spesso un grande potenziale dopo la ristrutturazione.',
      imageAlt: 'Casa italiana datata prima della ristrutturazione'
    },
    section2: {
      title: 'Costi indicativi della ristrutturazione in Italia',
      intro: 'Il costo dipende soprattutto dall\'ampiezza dei lavori. Qui sotto trovi una sintesi orientativa.',
      examplesLabel: 'ad esempio:',
      items: [
        {
          title: 'Interventi leggeri',
          examples: ['tinteggiatura', 'nuovi pavimenti', 'piccole riparazioni'],
          priceLabel: 'Costo indicativo:',
          price: 'EUR 10.000 - 30.000'
        },
        {
          title: 'Ristrutturazione parziale',
          examples: ['nuovo bagno', 'nuova cucina', 'sostituzione impianti'],
          priceLabel: 'Costo indicativo:',
          price: 'EUR 30.000 - 80.000'
        },
        {
          title: 'Ristrutturazione completa',
          examples: ['nuove linee impiantistiche', 'nuovo tetto', 'rifacimento completo interni'],
          priceLabel: 'Costo indicativo:',
          price: 'EUR 80.000 - 200.000'
        }
      ]
    },
    cta2: {
      title: 'Vuoi sapere quanto costa davvero l\'acquisto complessivo di una casa in Italia?',
      text: 'Consulta il nostro approfondimento su tutti i costi reali.',
      button: 'Quanto costa comprare casa in Italia',
      href: '/guides/costs'
    },
    section3: {
      title: 'Cosa incide di più sul costo della ristrutturazione',
      intro: 'Il prezzo della ristrutturazione non è uguale in tutta Italia. I fattori principali sono:',
      factors: [
        {
          title: 'Regione',
          text: 'Per esempio, il nord Italia può essere più costoso rispetto ai piccoli centri del sud.'
        },
        {
          title: 'Stato dell\'immobile',
          text: 'C\'è grande differenza tra una casa con piccoli lavori e una che richiede una ristrutturazione completa.'
        },
        {
          title: 'Portata del progetto',
          text: 'Alcuni vogliono solo modernizzare gli interni. Altri pianificano una trasformazione totale.'
        }
      ]
    },
    cta3: {
      title: 'Cerchi casa in Italia e non sai quanto potrebbe costare la ristrutturazione?',
      text: 'Scrivici le informazioni base: budget, regione e tipologia immobile. Ti aiuteremo a trovare opzioni più adatte.',
      button: 'Contattaci',
      href: '/contact'
    },
    section4: {
      title: 'A cosa fare attenzione prima dell\'acquisto',
      text: [
        'Molti acquirenti fanno sempre lo stesso errore: scelgono prima la casa e solo dopo stimano i costi di ristrutturazione.',
        'Nella pratica, è più sicuro fare il contrario.',
        'Prima è importante chiarire:'
      ],
      bullets: ['budget reale', 'costi possibili', 'differenze regionali']
    },
    cta4: {
      title: 'Abbiamo preparato anche una guida pratica per acquirenti cechi',
      text: 'Se vuoi capire meglio gli errori più frequenti nell\'acquisto in Italia, puoi scaricare il nostro PDF gratuito.',
      button: 'Scarica PDF - 7 errori più comuni',
      href: '/pdfs/errori-comuni.pdf'
    },
    section5: {
      title: 'Conclusione',
      text: 'Ristrutturare una casa in Italia può essere un\'ottima opportunità per creare il proprio spazio in un contesto unico. Ogni immobile è diverso, quindi l\'analisi concreta prima dell\'acquisto è sempre fondamentale.'
    },
    finalCta: {
      title: 'Aiutiamo i cechi ad acquistare casa in Italia',
      text: 'Dalla prima analisi fino alla firma dal notaio.',
      button: 'Prenota una consulenza gratuita',
      href: '/contact'
    },
    breadcrumb: {
      home: 'Home',
      guide: 'Guida',
      current: 'Ristrutturazione casa in Italia'
    },
    back: 'Articoli'
  }
}

function formatDate(language, value) {
  const locale = language === 'cs' ? 'cs-CZ' : language === 'it' ? 'it-IT' : 'en-US'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })
}

function CtaCard({ title, text, button, href, tone = 'blue' }) {
  const className =
    tone === 'dark'
      ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white'
      : tone === 'green'
        ? 'bg-green-50 border-green-200'
        : 'bg-blue-50 border-blue-200'

  const buttonClass =
    tone === 'dark'
      ? 'bg-amber-300 text-amber-950 hover:bg-amber-200 border border-amber-200/70'
      : tone === 'green'
        ? 'bg-gradient-to-r from-green-700 to-emerald-700 text-white hover:from-green-600 hover:to-emerald-600'
        : 'bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700'

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h3 className={`text-2xl font-bold mb-3 ${tone === 'dark' ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
        <p className={`${tone === 'dark' ? 'text-slate-200' : 'text-slate-700'} leading-relaxed mb-5`}>{text}</p>
        <Link href={href}>
          <Button className={buttonClass}>{button}</Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default function RenovationGuideItalyPage() {
  const [language, setLanguage] = useState('cs')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage && CONTENT[savedLanguage]) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    const handleLanguageChange = (event) => {
      if (CONTENT[event.detail]) {
        setLanguage(event.detail)
        document.documentElement.lang = event.detail
      }
    }
    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const t = CONTENT[language] || CONTENT.cs

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50">
      <Navigation />

      <div className="pt-28 pb-16 md:pb-24">
        <div className="container mx-auto px-6 mb-6" style={{ maxWidth: '1200px' }}>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-slate-700">{t.breadcrumb.home}</Link>
            <span>/</span>
            <Link href="/process" className="hover:text-slate-700">{t.breadcrumb.guide}</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">{t.breadcrumb.current}</span>
          </div>
        </div>

        <div className="container mx-auto px-6" style={{ maxWidth: '1200px' }}>
          <div className="max-w-4xl mx-auto" style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="mb-8">
              <Button asChild variant="outline" className="mb-5 inline-flex items-center border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-700">
                <Link href="/blog">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t.back}
                </Link>
              </Button>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-slate-100 border border-slate-200 text-slate-700 mb-4">
                <Hammer className="h-3.5 w-3.5" />
                {t.category}
              </div>
              <h1 className="font-bold mb-8 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
                <span className="inline-flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  {formatDate(language, t.date)}
                </span>
                <span className="inline-flex items-center">
                  <Clock className="h-4 w-4 mr-1.5" />
                  {t.readTime}
                </span>
              </div>
              <div className="space-y-3 text-gray-500 leading-relaxed text-lg" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                {t.intro.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <div className="mt-5">
                <p className="text-slate-900 font-semibold mb-2">{t.introListTitle}</p>
                <ul className="space-y-2">
                  {t.introList.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-8">
              <CtaCard title={t.cta1.title} text={t.cta1.text} button={t.cta1.button} href={t.cta1.href} />

              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="mb-8">{t.section1.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-gray-500 leading-relaxed" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                    {t.section1.paragraphs.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                  <ul className="space-y-2 ml-6 mt-4">
                    {t.section1.bullets.map((item) => (
                      <li key={item} className="text-gray-700">• {item}</li>
                    ))}
                  </ul>
                  <p className="text-gray-500 leading-relaxed mt-4" style={{color:'#4a4a4a', lineHeight:'1.75'}}>{t.section1.outro}</p>

                  <div className="mt-6 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <Image src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1400&q=80" alt={t.section1.imageAlt} width={1400} height={800} sizes="(min-width: 768px) 768px, 100vw" className="w-full h-64 md:h-80 object-cover" />
                    <p className="text-sm text-slate-600 px-4 py-3">{t.section1.imageCaption}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center mb-8">
                    <Euro className="h-6 w-6 mr-3" />
                    {t.section2.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 leading-relaxed mb-4" style={{color:'#4a4a4a', lineHeight:'1.75'}}>{t.section2.intro}</p>
                  <div className="space-y-4">
                    {t.section2.items.map((item) => (
                      <div key={item.title} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <h3 className="font-bold text-slate-800 mb-2 text-lg">{item.title}</h3>
                        <p className="text-sm text-slate-600 font-semibold mb-2">{t.section2.examplesLabel}</p>
                        <ul className="space-y-1 ml-5 mb-3">
                          {item.examples.map((example) => (
                            <li key={example} className="text-gray-700">• {example}</li>
                          ))}
                        </ul>
                        <p className="text-slate-900 font-semibold">{item.priceLabel} {item.price}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <CtaCard title={t.cta2.title} text={t.cta2.text} button={t.cta2.button} href={t.cta2.href} />

              <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="mb-8">{t.section3.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 leading-relaxed mb-4" style={{color:'#4a4a4a', lineHeight:'1.75'}}>{t.section3.intro}</p>
                  <div className="space-y-4">
                    {t.section3.factors.map((factor) => (
                      <div key={factor.title} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <h3 className="font-semibold text-slate-800 mb-1">{factor.title}</h3>
                        <p className="text-gray-500" style={{color:'#4a4a4a', lineHeight:'1.75'}}>{factor.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <CtaCard title={t.cta3.title} text={t.cta3.text} button={t.cta3.button} href={t.cta3.href} tone="green" />

              <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-amber-500">
                <CardHeader>
                  <CardTitle className="mb-8">{t.section4.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-gray-500 leading-relaxed" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                    {t.section4.text.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                  <ul className="space-y-2 ml-6 mt-4">
                    {t.section4.bullets.map((item) => (
                      <li key={item} className="text-gray-700">• {item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <CtaCard title={t.cta4.title} text={t.cta4.text} button={t.cta4.button} href={t.cta4.href} />

              <Card className="bg-amber-50 border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center mb-8 text-amber-900">
                    <AlertTriangle className="h-6 w-6 mr-3" />
                    {t.section5.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-900 leading-relaxed">{t.section5.text}</p>
                </CardContent>
              </Card>

              <CtaCard title={t.finalCta.title} text={t.finalCta.text} button={t.finalCta.button} href={t.finalCta.href} tone="dark" />
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-12">
          <InformationalDisclaimer language={language} className="mt-14" />
        </div>
      </div>
      <Footer language={language} />
    </div>
  )
}
