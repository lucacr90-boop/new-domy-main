'use client'

import { useEffect, useMemo, useState } from 'react'
import { Clock, ChevronRight, BookOpen, Mail, MessageSquare, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PropertySlider from '@/components/PropertySlider'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'
import ProtectedContentLink from '@/components/ProtectedContentLink'

const ARTICLES = [
  {
    slug: 'abusivita-edilizie-in-italia',
    title: {
      en: 'Building irregularities in Italy: what to verify before buying a house',
      cs: 'Stavební nesrovnalosti v Itálii: co ověřit před koupí domu',
      it: 'Abusività edilizie in Italia: cosa verificare prima di comprare casa'
    },
    excerpt: {
      en: 'A practical guide to unauthorized works, cadastral mismatches, changes of use, and why every issue must be resolved before the final deed.',
      cs: 'Praktický průvodce nepovolenými pracemi, katastrálními rozdíly, změnami užívání a důvodem, proč vše vyřešit před rogitem.',
      it: 'Guida pratica ad abusi edilizi, difformità catastali, cambi d’uso e motivi per cui ogni problema va risolto prima del rogito.'
    },
    date: '2026-06-18',
    readTime: '8 min',
    category: { en: 'Legal', cs: 'Právo', it: 'Legale' },
    image: '/articles/common-mistakes-red-x.jpg',
    imageAlt: {
      en: 'Do not enter sign as a symbol of property purchase risk',
      cs: 'Zákazová značka jako symbol rizika při koupi nemovitosti',
      it: 'Cartello di divieto come simbolo di rischio in un acquisto immobiliare'
    },
    link: '/guides/abusivita-edilizie-in-italia'
  },
  {
    slug: 'kolik-stoji-dovolená-v-italii-v-roce-2026',
    title: {
      en: 'How Much Does a Holiday in Italy Cost in 2026?',
      cs: 'Kolik stojí dovolená v Itálii v roce 2026',
      it: 'Quanto costa una vacanza in Italia nel 2026?'
    },
    excerpt: {
      en: 'A practical breakdown of holiday costs in Italy in 2026: transport, accommodation, food, and realistic daily budgets.',
      cs: 'Praktický přehled nákladů na dovolenou v Itálii v roce 2026: doprava, ubytování, jídlo a realistické denní rozpočty.',
      it: 'Panoramica pratica dei costi di una vacanza in Italia nel 2026: trasporti, alloggio, cibo e budget giornalieri realistici.'
    },
    date: '2026-03-09',
    readTime: '9 min',
    category: { en: 'Travel', cs: 'Cestování', it: 'Viaggi' },
    image: '/house_amalfi.jpg',
    imageAlt: {
      en: 'Italian coastline for a holiday budget article',
      cs: 'Italské pobřeží k článku o rozpočtu na dovolenou',
      it: 'Costa italiana per un articolo sul budget vacanza'
    },
    link: '/články/průvodce-italii/kolik-stoji-dovolená-v-italii-v-roce-2026'
  },
  {
    slug: 'nejkrasnejsi-mala-města-v-italii',
    title: {
      en: 'The Most Beautiful Small Towns in Italy',
      cs: 'Nejkrásnější malá města v Itálii',
      it: 'I borghi più belli d’Italia'
    },
    excerpt: {
      en: 'A curated selection of charming Italian small towns that are ideal for slower travel and authentic local experiences.',
      cs: 'Výběr kouzelných italských malých měst ideálních pro pomalejší cestování a autentický místní zážitek.',
      it: 'Una selezione di piccoli borghi italiani ideali per un viaggio più lento e autentico.'
    },
    date: '2026-03-08',
    readTime: '8 min',
    category: { en: 'Travel', cs: 'Cestování', it: 'Viaggi' },
    image: '/Umbria.webp',
    imageAlt: {
      en: 'Historic Italian town',
      cs: 'Historické italské městečko',
      it: 'Borgo storico italiano'
    },
    link: '/články/průvodce-italii/nejkrasnejsi-mala-města-v-italii'
  },
  {
    slug: 'rekonstrukce-domů-v-italii',
    title: {
      en: 'How much does house renovation in Italy cost?',
      cs: 'Kolik stojí rekonstrukce domů v Itálii?',
      it: 'Quanto costa ristrutturare una casa in Italia?'
    },
    excerpt: {
      en: 'Indicative renovation ranges, key cost factors, and what to verify before buying an older property in Italy.',
      cs: 'Orientační ceny rekonstrukce, hlavní faktory nákladů a co ověřit ještě před koupí starší nemovitostí v Itálii.',
      it: 'Fasce orientative di ristrutturazione, fattori di costo principali e verifiche da fare prima di acquistare un immobile datato in Italia.'
    },
    date: '2026-03-10',
    readTime: '8 min',
    category: { en: 'Renovation', cs: 'Rekonstrukce', it: 'Ristrutturazione' },
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    imageAlt: {
      en: 'Construction workers renovating a house',
      cs: 'Stavební práce při rekonstrukci domů',
      it: 'Lavori di ristrutturazione su una casa'
    },
    link: '/guides/rekonstrukce-domů-v-italii'
  },
  {
    slug: 'offerta-compromesso-registrazione',
    title: {
      en: 'How to Make an Offer for a House in Italy: Proposal, Preliminary Contract, and Registration',
      cs: 'Jak podat nabídku na dům v Itálii: návrh, compromesso a registrace',
      it: "Come fare un'offerta per una casa in Italia: proposta, compromesso e registrazione"
    },
    excerpt: {
      en: 'A practical guide to the Italian offer phase: when the proposal becomes binding, what the compromesso must contain, and how registration works.',
      cs: 'Praktický průvodce italskou fází nabídky: kdy se návrh stává závazným, co musí obsahovat compromesso a jak funguje registrace.',
      it: "Guida pratica alla fase dell'offerta in Italia: quando la proposta diventa vincolante, cosa deve contenere il compromesso e come funziona la registrazione."
    },
    date: '2026-03-26',
    readTime: '9 min',
    category: { en: 'Legal', cs: 'Právo', it: 'Legale' },
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80',
    imageAlt: {
      en: 'Documents and signatures for a property offer',
      cs: 'Dokumenty a podpisy k nabídce na nemovitost',
      it: 'Documenti e firme per una proposta immobiliare'
    },
    link: '/guides/offerta-compromesso-registrazione'
  },
  {
    slug: 'real-estate-purchase-system-italy',
    title: {
      en: "How the Italian Property Buying System Really Works (and Why It's Different from the Czech Republic)",
      cs: 'Jak skute\u010dn\u011b funguje italsk\u00fd syst\u00e9m koup\u011b nemovitostí (a pro\u010d se li\u0161\u00ed od \u010desk\u00e9 republiky)',
      it: 'Come funziona davvero il sistema di acquisto immobiliare in Italia (e perché è diverso dalla Repubblica Ceca)'
    },
    excerpt: {
      en: 'How the Italian property buying system really works for foreign buyers, including roles, checks, timing, and risk control.',
      cs: 'Jak v praxi funguje koupě nemovitostí v Itálii pro zahraniční kupující: role, kontroly, načasování a řízení rizik.',
      it: 'Come funziona davvero l’acquisto immobiliare in Italia per chi compra dall’estero: ruoli, controlli, tempi e gestione del rischio.'
    },
    date: '2026-02-11',
    readTime: '10 min',
    category: { en: 'Blog', cs: 'Blog', it: 'Blog' },
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    imageAlt: {
      en: 'Documents and planning for a property buying process',
      cs: 'Dokumenty a plánování procesu koupě nemovitostí',
      it: 'Documenti e pianificazione del processo di acquisto immobiliare'
    },
    link: '/guides/real-estate-purchase-system-italy'
  },
  {
    slug: 'costs-2026',
    title: {
      en: 'How Much Does Buying a House in Italy Really Cost in 2026',
      cs: 'Kolik skutečně stojí koupě domů v Itálii v roce 2026',
      it: 'Quanto costa realmente acquistare una casa in Italia nel 2026'
    },
    excerpt: {
      en: 'An overview of real costs, taxes, and fees you need to account for before signing a contract. The purchase price is just the beginning.',
      cs: 'Přehled reálných nákladů, daní a poplatků, se kterými je nutné počítat ještě před podpisem smlouvy. Kupní cena je pouze začátek.',
      it: "Una panoramica dei costi reali, tasse e spese da considerare prima di firmare un contratto. Il prezzo di acquisto è solo l'inizio."
    },
    date: '2026-01-06',
    readTime: '8 min',
    category: { en: 'Costs', cs: 'Náklady', it: 'Costi' },
    image: '/articles/costs-money-house.jpg',
    imageAlt: {
      en: 'Couple worried about money with house models in the background',
      cs: 'Pár řeší peníze s modely domků v pozadí',
      it: 'Coppia preoccupata per i soldi con modellini di case sullo sfondo'
    },
    link: '/guides/costs'
  },
  {
    slug: 'common-mistakes',
    title: {
      en: 'Most Common Mistakes Czechs Make When Buying a House in Italy',
      cs: 'Nejčastější chyby Čechů při koupí domů v Itálii',
      it: 'Gli errori più comuni dei cechi quando acquistano una casa in Italia'
    },
    excerpt: {
      en: "What to watch out for so you don't waste time and money. The biggest problems arise not from carelessness but from unfamiliarity with the Italian system.",
      cs: 'Na co si dát pozor, abyste neztratili čas a peníze. Největší problémy vznikají ne z nepozornosti, ale z neznalosti italského systému.',
      it: 'A cosa fare attenzione per non perdere tempo e denaro. I maggiori problemi non nascono dalla disattenzione ma dalla scarsa conoscenza del sistema italiano.'
    },
    date: '2026-01-15',
    readTime: '7 min',
    category: { en: 'Guide', cs: 'Průvodce', it: 'Guida' },
    image: '/articles/common-mistakes-laptop-stress.jpg',
    imageAlt: {
      en: 'Property buyers reviewing documents with an advisor',
      cs: 'Kupující kontrolují dokumenty s poradcem',
      it: 'Acquirenti che controllano documenti con un consulente'
    },
    link: '/guides/mistakes'
  },
  {
    slug: 'one-euro-houses',
    title: {
      en: '1 Euro Houses in Italy: Reality or Trap?',
      cs: 'Dům za 1 euro v Itálii: realita nebo past?',
      it: 'Case a 1 euro in Italia: realtà o trappola?'
    },
    excerpt: {
      en: "What do the 1 euro house offers really mean? We look at the conditions, hidden costs, and whether it's worth considering these offers seriously.",
      cs: 'Co skutečně znamenají nabídky domů za 1 euro? Podíváme se na podmínky, skryté náklady a zda stojí za to tyto nabídky brát vážně.',
      it: 'Cosa significano realmente le offerte di case a 1 euro? Esaminiamo le condizioni, i costi nascosti e se vale la pena considerare seriamente queste offerte.'
    },
    date: '2026-01-18',
    readTime: '6 min',
    category: { en: 'Analysis', cs: 'Analýza', it: 'Analisi' },
    link: '/blog/one-euro-houses'
  },
  {
    slug: 'choose-region',
    title: {
      en: 'How to Choose the Right Region in Italy for Buying a House (Sea, Mountains, Investment)',
      cs: 'Jak vybrat správný region v Itálii pro koupí domů (moře, hory, investice)',
      it: 'Come scegliere la regione giusta in Italia per acquistare una casa (mare, montagna, investimento)'
    },
    excerpt: {
      en: "Italy offers very different regions. Learn how to choose based on your goal, whether it's a vacation home, investment, or a place for a new life.",
      cs: 'Itálie nabízí velmi odlišné regiony. Zjistěte, jak vybrat podle vašeho cíle, ať už jde o rekreační dům, investici nebo místo pro nový život.',
      it: "L'Italia offre regioni molto diverse. Scopri come scegliere in base al tuo obiettivo, che si tratti di una casa vacanze, investimento o posto per una nuova vita."
    },
    date: '2026-01-20',
    readTime: '10 min',
    category: { en: 'Regions', cs: 'Regiony', it: 'Regioni' },
    image: '/Sardegna.jpg',
    imageAlt: {
      en: 'Italian regional landscape',
      cs: 'Krajina italského regionu',
      it: 'Paesaggio di una regione italiana'
    },
    link: '/regions'
  },
  {
    slug: 'property-inspections',
    title: {
      en: 'How Property Viewings Work in Italy',
      cs: 'Jak probíhají prohlídky nemovitostí v Itálii',
      it: 'Come funzionano le visite immobiliari in Italia'
    },
    excerpt: {
      en: 'What to expect during property viewings in Italy, how to prepare, and what to look for. A practical guide from experience.',
      cs: 'Co očekávat při prohlídkách nemovitostí v Itálii, jak se připravit a na co se zaměřit. Praktický průvodce ze zkušenosti.',
      it: "Cosa aspettarsi durante le visite immobiliari in Italia, come prepararsi e a cosa prestare attenzione. Una guida pratica dall'esperienza."
    },
    date: '2026-01-21',
    readTime: '6 min',
    category: { en: 'Guide', cs: 'Průvodce', it: 'Guida' },
    image: '/articles/inspections-couple-house.jpg',
    imageAlt: {
      en: 'Couple from behind looking at a house',
      cs: 'Pár zezadu před domem',
      it: 'Coppia di spalle davanti a una casa'
    },
    link: '/guides/inspections'
  },
  {
    slug: 'notary-role',
    title: {
      en: 'Notary in Italy: Role and Costs When Buying a House',
      cs: 'Notář v Itálii: role a náklady při koupí domů',
      it: "Il notaio in Italia: ruolo e costi nell'acquisto di una casa"
    },
    excerpt: {
      en: "The notary's role in Italy differs significantly from the Czech Republic. Learn what to expect, what they verify, and what they don't.",
      cs: 'Role notáře v Itálii se výrazně liší od České republiky. Zjistěte, co očekávat, co notář kontroluje a co ne.',
      it: 'Il ruolo del notaio in Italia differisce significativamente dalla Repubblica Ceca. Scopri cosa aspettarti, cosa verifica e cosa no.'
    },
    date: '2026-01-21',
    readTime: '7 min',
    category: { en: 'Legal', cs: 'Právo', it: 'Legale' },
    image: '/articles/notary-couple-documents.jpg',
    imageAlt: {
      en: 'Couple in front of legal documents with an advisor',
      cs: 'Pár před dokumenty s poradcem',
      it: 'Coppia davanti a documenti con un consulente'
    },
    link: '/guides/notary'
  },
]

function localize(value, language) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[language] || value.en || value.cs || value.it || ''
}

export default function BlogPage() {
  const [language, setLanguage] = useState('cs')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const hiddenArticleKeywords = [
    'one-euro-houses',
    'casa a 1 euro',
    'case a 1 euro',
    'lago di como',
    'lake como',
    'lago-di-como',
    'toscana',
    'tuscany'
  ]

  const normalizeForFilter = (value = '') =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

  const visibleArticles = useMemo(() => {
    return ARTICLES.filter((article) => {
      if (article.link?.startsWith('/články/průvodce-italii')) {
        return false
      }

      const articleText = normalizeForFilter(
        [article.slug, article.link, article.title?.en, article.title?.it, article.title?.cs].join(' ')
      )

      return !hiddenArticleKeywords.some((keyword) => articleText.includes(normalizeForFilter(keyword)))
    })
  }, [])

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <div className="pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="container mx-auto px-6 py-16 md:py-24 mb-4" style={{ maxWidth: '1200px' }}>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-6">
              <BookOpen className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600 font-medium">
                {language === 'cs' ? 'Články' : language === 'it' ? 'Articoli' : 'Articles'}
              </span>
            </div>
            <h1 className="font-bold mb-8 text-slate-800">
              {language === 'cs'
                ? 'Články o koupí domů v Itálii'
                : language === 'it'
                  ? "Articoli sull'acquisto di una casa in Italia"
                  : 'Articles About Buying a House in Italy'}
            </h1>
            <p className="text-lg text-gray-500 leading-[1.75] max-w-2xl mx-auto">
              {language === 'cs'
                ? 'Praktické články, které vám pomohou zorientovat se v procesu koupě nemovitostí v Itálii.'
                : language === 'it'
                  ? "Articoli pratici per orientarti nel processo di acquisto di un immobile in Italia."
                  : 'Practical articles to help you navigate the process of buying property in Italy.'}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6" style={{maxWidth:"1200px"}}>
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-8 lg:gap-12 mb-20">
            <aside className="lg:sticky lg:top-28 h-fit lg:-ml-3">
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-5 shadow-md">
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300" />
                  <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-emerald-300/45 blur-xl" />
                  <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-amber-200/50 blur-xl" />
                  <div className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 border border-emerald-200 mb-3">
                    TIP
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-700 to-teal-700 flex items-center justify-center mb-3 shadow-sm">
                    <Compass className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">
                    {language === 'cs' ? 'Tip: Cestování po Itálii' : language === 'it' ? 'Tip: Viaggiare in Italia' : 'Tip: Travel in Italy'}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {language === 'cs'
                      ? 'Nová sekce s články, praktickými tipy a zajímavostmi pro české cestovatele.'
                      : language === 'it'
                        ? 'Nuova sezione con articoli, consigli pratici e curiosità per chi vuole viaggiare in Italia.'
                        : 'New section with articles, practical tips, and curiosities for people planning to travel in Italy.'}
                  </p>
                  <Link href="/články/průvodce-italii" className="block">
                    <Button className="w-full min-h-[44px] bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-semibold rounded-lg shadow-sm">
                      {language === 'cs' ? 'Otevřít sekci cestování' : language === 'it' ? 'Vai alla sezione viaggi' : 'Open travel section'}
                      <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-white to-slate-50 p-5 shadow-md">
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-400 via-amber-300 to-orange-300" />
                  <div className="absolute -top-7 -right-8 h-20 w-20 rounded-full bg-orange-300/55 blur-xl" />
                  <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-slate-200/50 blur-xl" />
                  <div className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700 border border-amber-200 mb-3">
                    FAQ
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mb-3 shadow-sm">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">
                    {language === 'cs' ? 'Máte dotazy?' : language === 'it' ? 'Hai domande?' : 'Have Questions?'}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {language === 'cs'
                      ? 'Podívejte se na FAQ k nákupu nemovitostí v Itálii.'
                      : language === 'it'
                        ? "Consulta le FAQ sull'acquisto di immobili in Italia."
                        : 'Read the FAQ about buying property in Italy.'}
                  </p>
                  <Link href="/faq" className="block">
                    <Button className="w-full min-h-[44px] bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white text-xs font-semibold rounded-lg shadow-sm">
                      {language === 'cs' ? 'Přejít na FAQ' : language === 'it' ? 'Vai alle FAQ' : 'Go to FAQ'}
                      <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="divide-y divide-gray-100">
              {visibleArticles.map((article) => (
                <ProtectedContentLink key={article.slug} href={article.link} language={language} className="block group">
                  <article className="py-8 first:pt-4">
                    <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
                      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                        <img
                          src={article.image}
                          alt={localize(article.imageAlt, language) || localize(article.title, language)}
                          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105 md:h-40"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-copper-600 bg-copper-50 px-2.5 py-1 rounded-md">
                            {localize(article.category, language)}
                          </span>
                          <span className="text-sm text-gray-400 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {article.readTime}
                          </span>
                        </div>
                        <h2 className="font-bold text-slate-800 mb-8 group-hover:text-slate-600 transition-colors leading-tight">
                          {localize(article.title, language)}
                        </h2>
                        <p className="text-gray-500 leading-[1.75] mb-3">{localize(article.excerpt, language)}</p>
                        <span className="text-sm font-medium text-slate-600 group-hover:text-copper-600 flex items-center gap-1 transition-colors">
                          {language === 'cs' ? 'Číst článek' : language === 'it' ? 'Leggi articolo' : 'Read Article'}
                          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </article>
                </ProtectedContentLink>
              ))}
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
              <div className="relative p-10 md:p-14 text-center">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <h2 className="font-bold mb-8 text-white">
                  {language === 'cs' ? 'Chcete vědět víc?' : language === 'it' ? 'Vuoi saperne di più?' : 'Want to Know More?'}
                </h2>
                <p className="text-gray-300 text-lg mb-8 leading-[1.75] max-w-xl mx-auto">
                  {language === 'cs'
                    ? 'Každá situace je jiná. Rádi vám doporučíme správný další krok podle vašeho cíle, rozpočtu a plánu.'
                    : language === 'it'
                      ? 'Ogni situazione è diversa. Ti consigliamo il prossimo passo giusto in base al tuo obiettivo, budget e piano.'
                      : "Every situation is different. We'll gladly recommend the right next step based on your goal, budget, and plan."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="https://wa.me/420731450001" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full sm:w-auto bg-white hover:bg-gray-100 text-slate-800 font-semibold px-8 py-5 text-base transition-all duration-200 shadow-lg rounded-xl">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      WhatsApp
                    </Button>
                  </a>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:border-white/30 font-medium px-8 py-5 text-base transition-all duration-200 rounded-xl bg-transparent border"
                    onClick={() => window.location.href = 'mailto:info@domyvitalii.cz'}
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    info@domyvitalii.cz
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
