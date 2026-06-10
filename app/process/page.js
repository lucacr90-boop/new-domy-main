'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  FileSearch, 
  CheckCircle, 
  Calendar,
  Users,
  Shield,
  FileText,
  MapPin,
  Heart,
  Key,
  Clock,
  CheckSquare,
  ChevronRight,
  Euro,
  Landmark,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PropertySlider from '@/components/PropertySlider'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'
import ProtectedContentLink from '@/components/ProtectedContentLink'

const PROCESS_STEPS = [
  {
    number: 1,
    title: {
      en: 'Strategy Call & Buyer Profile',
      cs: 'Úvodní konzultace',
      it: 'Call strategica e profilo acquirente'
    },
    subtitle: {
      en: 'We listen first, then build your path',
      cs: 'Pochopení vaší vize',
      it: 'Prima ascoltiamo, poi costruiamo il percorso'
    },
    description: {
      en: 'Before anything else, we start with a strategy call to understand your goals, lifestyle, budget, and timeline. Then we build your buyer profile and a clear action plan tailored to you.',
      cs: 'Začínáme komplexní konzultací, abychom pochopili vaše potřeby, preference, rozpočet a časový plán. Toto lze provést prostřednictvím videohovoru, telefonu nebo osobně.',
      it: 'Prima di tutto partiamo da una call strategica per capire obiettivi, stile di vita, budget e tempistiche. Poi costruiamo il tuo profilo acquirente e un piano d’azione chiaro e su misura.'
    },
    duration: {
      en: '20min-1h',
      cs: '20min-1h',
      it: '20min-1h'
    },
    ctaHref: '/book-call',
    ctaLabel: {
      en: 'Book a call',
      cs: 'Rezervovat hovor',
      it: 'Prenota una chiamata'
    },
    icon: <Users className="h-8 w-8" />,
    includes: [
      {
        en: 'Budget & financing discussion',
        cs: 'Diskuse o rozpočtu a financování',
        it: 'Discussione su budget e finanziamento'
      },
      {
        en: 'Region & property type preferences',
        cs: 'Preference regionu a typu nemovitostí',
        it: 'Preferenze di regione e tipo di proprietà'
      },
      {
        en: 'Timeline & requirements planning',
        cs: 'Plánování harmonogramu a požadavků',
        it: 'Pianificazione tempistiche e requisiti'
      },
      {
        en: 'Q&A about Italian property market',
        cs: 'Otázky a odpovědi o italském trhu nemovitostí',
        it: 'Domande e risposte sul mercato immobiliare italiano'
      }
    ]
  },
  {
    number: 2,
    title: {
      en: 'Property Search & Curation',
      cs: 'Vyhledávání a výběr nemovitostí',
      it: 'Ricerca e selezione immobili'
    },
    subtitle: {
      en: 'Finding Your Perfect Match',
      cs: 'Nalezení ideální nemovitostí',
      it: 'Trovare la tua scelta perfetta'
    },
    description: {
      en: 'Our team searches through thousands of properties across Italy to find options that match your criteria. We provide detailed information, photos, and videos for each property.',
      cs: 'Náš tým prohledává stovky nemovitostí po celé Itálii, aby našel možnosti odpovídající vašim kritériím. Poskytujeme podrobné informace, fotografie a videa pro každou nemovitost.',
      it: 'Il nostro team cerca tra migliaia di proprietà in tutta Italia per trovare opzioni che corrispondono ai tuoi criteri. Forniamo informazioni dettagliate, foto e video per ogni proprietà.'
    },
    duration: {
      en: '1-3 weeks',
      cs: '1-3 týdny',
      it: '1-3 settimane'
    },
    icon: <Search className="h-8 w-8" />,
    includes: [
      {
        en: 'Access to exclusive off-market properties',
        cs: 'Přístup k exkluzivním nemovitostem mimo trh',
        it: 'Accesso a proprietà esclusive fuori mercato'
      },
      {
        en: 'Detailed property dossiers',
        cs: 'Podrobné podklady k nemovitostem',
        it: 'Dossier immobiliari dettagliati'
      },
      {
        en: 'Virtual tours & video walkthroughs',
        cs: 'Virtuální prohlídky a video prohlídky',
        it: 'Tour virtuali e video walkthrough'
      },
      {
        en: 'Market analysis & price evaluation',
        cs: 'Analýza trhu a hodnocení cen',
        it: 'Analisi di mercato e valutazione prezzi'
      }
    ]
  },
  {
    number: 3,
    title: {
      en: 'Property Viewings',
      cs: 'Prohlídky nemovitostí',
      it: 'Visite immobiliari'
    },
    subtitle: {
      en: 'Experience Your Future Home',
      cs: 'Poznejte svůj budoucí domov',
      it: 'Vivi la tua futura casa'
    },
    description: {
      en: 'We organize and accompany you to property viewings in Italy. If you cannot travel, we can arrange detailed video tours with our local representatives.',
      cs: 'Organizujeme a doprovázíme vás na prohlídky nemovitostí v Itálii. Pokud nemůžete cestovat, můžeme uspořádat podrobné video prohlídky s našimi místními zástupci.',
      it: 'Organizziamo e ti accompagniamo alle visite immobiliari in Italia. Se non puoi viaggiare, possiamo organizzare tour video dettagliati con i nostri rappresentanti locali.'
    },
    duration: {
      en: '1-3 weeks',
      cs: '1-3 týdny',
      it: '1-3 settimane'
    },
    ctaHref: '/guides/inspections',
    icon: <MapPin className="h-8 w-8" />,
    includes: [
      {
        en: 'Personalized viewing itinerary',
        cs: 'Personalizovaný itinerář prohlídek',
        it: 'Itinerario personalizzato delle visite'
      },
      {
        en: 'Professional translation services',
        cs: 'Profesionální překladatelské služby',
        it: 'Servizi di traduzione professionale'
      },
      {
        en: 'Local area tours & amenity checks',
        cs: 'Prohlídky místní oblasti a kontroly vybavení',
        it: 'Tour della zona e verifica dei servizi'
      },
      {
        en: 'Technical inspection recommendations',
        cs: 'Doporučení technických inspekcí',
        it: 'Raccomandazioni per le ispezioni tecniche'
      }
    ]
  },
  {
    number: 5,
    title: {
      en: 'Offer & Negotiation',
      cs: 'Nabídka a vyjednávání',
      it: 'Offerta e Negoziazione'
    },
    subtitle: {
      en: 'Securing the Best Deal',
      cs: 'Zajištění nejlepší nabídky',
      it: 'Ottenere il miglior affare'
    },
    description: {
      en: 'We help you prepare and submit a competitive offer, then negotiate on your behalf to secure the best possible terms and price.',
      cs: 'Pomůžeme vám připravit a podat konkurenceschopnou nabídku, poté vyjednáváme vaším jménem, abychom zajistili nejlepší možné podmínky a cenu.',
      it: 'Ti aiutiamo a preparare e presentare un\'offerta competitiva, poi negoziamo per tuo conto per assicurare i migliori termini e prezzo possibili.'
    },
    duration: {
      en: '1-2 weeks',
      cs: '1-2 týdny',
      it: '1-2 settimane'
    },
    ctaHref: '/guides/offerta-compromesso-registrazione',
    icon: <Euro className="h-8 w-8" />,
    includes: [
      {
        en: 'Market-based pricing strategy',
        cs: 'Cenová strategie založená na trhu',
        it: 'Strategia di pricing basata sul mercato'
      },
      {
        en: 'Professional negotiation support',
        cs: 'Profesionální podpora vyjednávání',
        it: 'Supporto professionale alla negoziazione'
      },
      {
        en: 'Contract terms review & optimization',
        cs: 'Přezkoumání a optimalizace smluvních podmínek',
        it: 'Revisione e ottimizzazione termini contrattuali'
      },
      {
        en: 'Deposit & escrow arrangement',
        cs: 'Uspořádání zálohy a úschovy',
        it: 'Gestione della caparra e dell\'escrow'
      }
    ]
  },
  {
    number: 6,
    title: {
      en: 'Legal Documentation',
      cs: 'Právní dokumentace',
      it: 'Documentazione Legale'
    },
    subtitle: {
      en: 'Preparing All Paperwork',
      cs: 'Příprava všech dokumentů',
      it: 'Preparazione di tutta la documentazione'
    },
    description: {
      en: 'Italian agents and the notary prepare all necessary legal documents, including the preliminary contract (Compromesso) and final deed (Rogito).',
      cs: 'Spolu s prodávajícím, italskými agenty a notářem připravujeme a kontrolujeme všechny potřebné právní dokumenty, včetně předběžné smlouvy (Compromesso) a konečného aktu (Rogito).',
      it: 'Gli agenti Italiani e il Notaio preparano tutti i documenti legali necessari, incluso il contratto preliminare (Compromesso) e l\'atto finale (Rogito).'
    },
    duration: {
      en: '2-4 weeks',
      cs: '2-4 týdny',
      it: '2-4 settimane'
    },
    icon: <FileText className="h-8 w-8" />,
    includes: [
      {
        en: 'Preliminary contract (Compromesso) drafting',
        cs: 'Vypracování předběžné smlouvy (Compromesso)',
        it: 'Redazione del contratto preliminare (Compromesso)'
      },
      {
        en: 'Tax registration & fiscal code (Codice Fiscale)',
        cs: 'Daňová registrace a daňový kód (Codice Fiscale)',
        it: 'Registrazione fiscale e codice fiscale'
      },
      {
        en: 'Translation of all legal documents',
        cs: 'Překlad všech právních dokumentů',
        it: 'Traduzione di tutti i documenti legali'
      },
      {
        en: 'Power of attorney arrangements (if needed)',
        cs: 'Uspořádání plné moci (v případě potřeby)',
        it: 'Gestione della procura (se necessaria)'
      }
    ]
  },
  {
    number: 7,
    title: {
      en: 'Final Closing',
      cs: 'Konečné uzavření',
      it: 'Chiusura Finale'
    },
    subtitle: {
      en: 'Signing & Ownership Transfer',
      cs: 'Podpis a převod vlastnictví',
      it: 'Firma e trasferimento proprietà'
    },
    description: {
      en: 'The final deed is signed in the presence of a Notary (Notaio), and full payment is made. You officially become the owner of your Italian property!',
      cs: 'Konečný akt je podepsán v přítomnosti notáře (Notaio) a provede se úplná platba. Oficiálně se stanete vlastníkem své italské nemovitostí!',
      it: 'L\'atto finale viene firmato alla presenza di un Notaio e viene effettuato il pagamento completo. Diventi ufficialmente proprietario del tuo immobile italiano!'
    },
    duration: {
      en: '1 day',
      cs: '1 den',
      it: '1 giorno'
    },
    ctaHref: '/guides/notary',
    icon: <Landmark className="h-8 w-8" />,
    includes: [
      {
        en: 'Notary appointment coordination',
        cs: 'Koordinace schůzky s notářem',
        it: 'Coordinamento dell\'appuntamento con il notaio'
      },
      {
        en: 'Final payment & tax settlement',
        cs: 'Konečná platba a daňové vypořádání',
        it: 'Pagamento finale e liquidazione delle imposte'
      },
      {
        en: 'Deed registration (Rogito)',
        cs: 'Registrace aktu (Rogito)',
        it: 'Registrazione dell\'atto (Rogito)'
      },
      {
        en: 'Keys handover & property access',
        cs: 'Předání klíčů a přístup k nemovitostí',
        it: 'Consegna delle chiavi e accesso all\'immobile'
      }
    ]
  },
  {
    number: 8,
    title: {
      en: 'After-Sale Support',
      cs: 'Podpora po prodeji',
      it: 'Supporto Post-Vendita'
    },
    subtitle: {
      en: 'Ongoing Assistance',
      cs: 'Průběžná pomoc',
      it: 'Assistenza continua'
    },
    description: {
      en: 'Our relationship doesn\'t end at closing. We provide ongoing support with property management, renovations, utilities setup, and local services.',
      cs: 'Náš vztah nekončí uzavřením. Poskytujeme průběžnou podporu se správou nemovitostí, renovacemi, nastavením sítí a místních služeb.',
      it: 'Il nostro rapporto non finisce alla chiusura. Forniamo supporto continuo con gestione immobiliare, ristrutturazioni, allacciamento utenze e servizi locali.'
    },
    duration: {
      en: 'Ongoing',
      cs: 'Průběžně',
      it: 'Continuo'
    },
    icon: <Heart className="h-8 w-8" />,
    includes: [
      {
        en: 'Property management services',
        cs: 'Služby správy nemovitostí',
        it: 'Servizi di gestione immobiliare'
      },
      {
        en: 'Renovation & contractor coordination',
        cs: 'Koordinace renovací a dodavatelů',
        it: 'Coordinamento ristrutturazioni e appaltatori'
      },
      {
        en: 'Utility connections & local services setup',
        cs: 'Připojení k sítím a nastavení místních služeb',
        it: 'Collegamenti utenze e configurazione servizi locali'
      },
      {
        en: 'Ongoing legal & tax support',
        cs: 'Průběžná právní a daňová podpora',
        it: 'Supporto legale e fiscale continuo'
      }
    ]
  }
]

const TIMELINE_OVERVIEW = {
  total: {
    en: '2-3 months on average',
    cs: '2-3 měsíce v průměru',
    it: '2-3 mesi in media'
  },
  phases: [
    {
      name: { en: 'Search & Selection', cs: 'Vyhledávání a výběr', it: 'Ricerca e selezione' },
      duration: { en: '2-6 weeks', cs: '2-6 týdnů', it: '2-6 settimane' }
    },
    {
      name: { en: 'Viewings & Due Diligence', cs: 'Prohlídky a Due Diligence', it: 'Visite e Due Diligence' },
      duration: { en: '3-5 weeks', cs: '3-5 týdnů', it: '3-5 settimane' }
    },
    {
      name: { en: 'Offer & Negotiation', cs: 'Nabídka a vyjednávání', it: 'Offerta e negoziazione' },
      duration: { en: '1-2 weeks', cs: '1-2 týdny', it: '1-2 settimane' }
    },
    {
      name: { en: 'Legal & Closing', cs: 'Právní část a uzavření', it: 'Legale e chiusura' },
      duration: { en: '4-8 weeks', cs: '4-8 týdnů', it: '4-8 settimane' }
    }
  ]
}

const COSTS_OVERVIEW = [
  {
    title: { en: 'Purchase Tax – First Property + Residency', cs: 'Daň z nabytí – první nemovitost + trvalý pobyt', it: 'Imposta di acquisto – prima casa + residenza' },
    amount: { en: '2% of purchase price', cs: '2 % z kupní ceny', it: '2% del prezzo di acquisto' },
    description: { 
      en: 'Applies when buying your first property in Italy and establishing permanent residence',
      cs: 'Platí při koupí první nemovitostí v Itálii a zřízení trvalého pobytu',
      it: 'Si applica quando acquisti la prima proprietà in Italia e stabilisci la residenza permanente'
    }
  },
  {
    title: { en: 'Purchase Tax – Non-Residence', cs: 'Daň z nabytí – bez trvalého pobytu', it: 'Imposta di acquisto – senza residenza' },
    amount: { en: '9% of purchase price', cs: '9 % z kupní ceny', it: '9% del prezzo di acquisto' },
    description: { 
      en: 'Applies when Italy will not be your permanent residence (most Czech buyers)',
      cs: 'Platí, pokud se v Itálii nebude jednat o trvalé bydliště (většina českých kupujících)',
      it: 'Si applica quando l\'Italia non sarà la vostra residenza permanente (la maggior parte degli acquirenti cechi)'
    }
  },
  {
    title: { en: 'VAT (New/Renovated Properties)', cs: 'DPH (nové/zrekonstruované nemovitostí)', it: 'IVA (immobili nuovi/ristrutturati)' },
    amount: { en: '10% (or 4% with residency)', cs: '10 % (nebo 4 % při trvalém pobytu)', it: '10% (o 4% con residenza)' },
    description: { 
      en: 'Applies to new or recently renovated properties (replaces purchase tax in these cases)',
      cs: 'Platí u nových nebo nově zrekonstruovaných nemovitostí (nahrazuje daň z nabytí)',
      it: 'Si applica a immobili nuovi o ristrutturati di recente (sostituisce l\'imposta di acquisto)'
    }
  },
  {
    title: { en: 'Notary Fees', cs: 'Notářské poplatky', it: 'Spese notarili' },
    amount: { en: '1-2.5% of property value', cs: '1–2,5 % hodnoty nemovitostí', it: '1-2,5% del valore dell\'immobile' },
    description: { 
      en: 'Set by law (notary decree). Includes deed preparation, tax collection, and property transfer oversight',
      cs: 'Stanoveny zákonem (notářský dekret). Zahrnuje přípravu smlouvy, výběr daní a dohled nad převodem',
      it: 'Stabilite per legge (decreto notarile). Include la preparazione dell\'atto, la riscossione delle imposte e la supervisione del trasferimento'
    }
  },
  {
    title: { en: 'Reservation Deposit', cs: 'Rezervační poplatek', it: 'Deposito di prenotazione' },
    amount: { en: '~10% of purchase price', cs: 'cca 10 % z kupní ceny', it: '~10% del prezzo di acquisto' },
    description: { 
      en: 'Paid when signing the reservation contract (exact amount depends on agreement)',
      cs: 'Platí se při podpisu rezervační smlouvy (přesná výše závisí na dohodě)',
      it: 'Pagato alla firma del contratto di prenotazione (l\'importo esatto dipende dagli accordi)'
    }
  },
  {
    title: { en: 'Additional Costs', cs: 'Další náklady', it: 'Costi aggiuntivi' },
    amount: { en: '€1,000-3,000+', cs: '1 000€3 000+ ?', it: '€1.000-3.000+' },
    description: { 
      en: 'Translations, interpretation at notary, technical inspections, land registry registration',
      cs: 'Překlady, tlumočení u notáře, technické kontroly, zápis do katastru nemovitostí',
      it: 'Traduzioni, interpretariato presso il notaio, ispezioni tecniche e registrazione catastale'
    }
  }
]

export default function ProcessPage() {
  const [language, setLanguage] = useState('cs')
  const visibleProcessSteps = PROCESS_STEPS
  const showTimelineAndCosts = false

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

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Modern Navigation */}
      <Navigation />

      <div className="pt-32 pb-12">
        {/* Hero Section */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm mb-12">
          <div className="container mx-auto px-6 py-16 md:py-24" style={{maxWidth:"1200px"}}>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="font-extrabold mb-8 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent px-2">
                {language === 'cs' ? 'Jak koupit dům v Itálii - Náš proces.' :
                 language === 'it' ? 'Come acquistare una casa in Italia - Il nostro processo.' :
                 'How to Buy a House in Italy - Our Process.'}
              </h1>
              <div className="max-w-3xl mx-auto text-left space-y-4 px-4 mb-8">
                <p className="text-lg md:text-xl text-gray-600 leading-[1.75]">
                  {language === 'cs' ? 'Plánujete koupit dům nebo byt v Itálii a chcete mít jistotu, že celý proces proběhne správně a bez zbytečných komplikací?' :
                   language === 'it' ? 'State pianificando l\'acquisto di una casa o di un appartamento in Italia e volete avere la certezza che l\'intero processo si svolga correttamente e senza complicazioni inutili?' :
                   'Are you planning to buy a house or apartment in Italy and want to be sure the entire process runs correctly and without unnecessary complications?'}
                </p>
                <p className="text-lg text-gray-600 leading-[1.75]">
                  {language === 'cs' ? 'Koupě nemovitostí v Itálii funguje trochu jinak než v České republice. Postup je odlišný, jednotlivé kroky na sebe navazují jinak a pro kupujícího může být někdy těžké se v tom zorientovat.' :
                   language === 'it' ? 'L\'acquisto di un immobile in Italia funziona in modo un po\' diverso rispetto alla Repubblica Ceca. La procedura è differente, le singole fasi si susseguono in modo diverso e per un acquirente può essere a volte difficile orientarsi.' :
                   'Buying property in Italy works a little differently than in the Czech Republic. The procedure is different, the individual steps follow one another differently, and for a buyer it can sometimes be difficult to navigate.'}
                </p>
                <p className="text-lg text-gray-600 leading-[1.75]">
                  {language === 'cs' ? 'Právě proto jsme tu my.' :
                   language === 'it' ? 'Ed è proprio per questo che ci siamo noi.' :
                   'That is exactly why we are here.'}
                </p>
                <p className="text-lg text-gray-600 leading-[1.75]">
                  {language === 'cs' ? 'Pomůžeme vám vybrat nemovitost podle vašich představ, vysvětlíme všechny kroky a budeme vám k dispozici během celého procesu – od prvního výběru až po převzetí klíčů.' :
                   language === 'it' ? 'Vi aiuteremo a scegliere l\'immobile in base alle vostre esigenze, vi spiegheremo tutti i passaggi e saremo a vostra disposizione durante tutto il percorso, dalla prima selezione fino alla consegna delle chiavi.' :
                   'We help you choose a property that matches your expectations, explain every step, and stay available throughout the entire process, from the first selection to receiving the keys.'}
                </p>
                <p className="text-lg text-gray-600 leading-[1.75]">
                  {language === 'cs' ? 'Hlídáme důležité detaily, vysvětlujeme souvislosti a pomáháme vám projít celým procesem v klidu a s jistotou.' :
                   language === 'it' ? 'Controlliamo i dettagli importanti, spieghiamo i collegamenti tra i vari passaggi e vi aiutiamo ad affrontare tutto il processo con tranquillità e sicurezza.' :
                   'We watch the important details, explain the context behind each step, and help you go through the whole process calmly and with confidence.'}
                </p>
                <p className="text-lg text-gray-600 leading-[1.75]">
                  {language === 'cs' ? 'Níže uvidíte přehled jednotlivých kroků, jak spolupráce s námi probíhá.' :
                   language === 'it' ? 'Qui sotto vedrete una panoramica dei singoli passaggi di come si svolge la collaborazione con noi.' :
                   'Below you will see an overview of the individual steps and how working with us unfolds.'}
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 px-4">
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-slate-700 mb-1">{visibleProcessSteps.length}</div>
                  <div className="text-sm text-gray-600">
                    {language === 'cs' ? 'Kroků' : language === 'it' ? 'Passi' : 'Steps'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-slate-700 mb-1">2-3</div>
                  <div className="text-sm text-gray-600">
                    {language === 'cs' ? 'Měsíců' : language === 'it' ? 'Mesi' : 'Months'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-slate-700 mb-1">100%</div>
                  <div className="text-sm text-gray-600">
                    {language === 'cs' ? 'Podpora' : language === 'it' ? 'Supporto' : 'Support'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6">
          {/* What You'll Learn Section */}
          <div className="max-w-5xl mx-auto mb-16">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {language === 'cs' ? 'Co během procesu budete řešit' :
                   language === 'it' ? 'Cosa capirete durante il processo' :
                   'What You Will Face During the Process'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 leading-[1.75]">
                      {language === 'cs' ? 'Jaké jsou reálné náklady, daně a poplatky (nejen kupní cena)' :
                       language === 'it' ? 'Quali sono i costi reali, tasse e spese (non solo il prezzo di acquisto)' :
                       'What are the real costs, taxes and fees (not just the purchase price)'}
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 leading-[1.75]">
                      {language === 'cs' ? 'Jaká je skutečná role realitní kanceláře a notáře' :
                       language === 'it' ? 'Qual è il ruolo reale dell\'agenzia immobiliare e del notaio' :
                       'What is the actual role of the real estate agency and notary'}
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 leading-[1.75]">
                      {language === 'cs' ? 'Na co si dát pozor ještě před podpisem jakékoliv smlouvy' :
                       language === 'it' ? 'A cosa fare attenzione prima di firmare qualsiasi contratto' :
                       'What to watch out for before signing any contract'}
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 leading-[1.75]">
                      {language === 'cs' ? 'Jaké jsou časové rámce italské byrokracie' :
                       language === 'it' ? 'Le tempistiche della burocrazia italiana' :
                       'The timelines of Italian bureaucracy'}
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 leading-[1.75]">
                      {language === 'cs' ? 'Které kontroly jsou povinné a které ne' :
                       language === 'it' ? 'Quali controlli sono obbligatori e quali no' :
                       'Which checks are mandatory and which are not'}
                    </p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 leading-[1.75]">
                      {language === 'cs' ? 'Jaké jsou rozdíly oproti České republice' :
                       language === 'it' ? 'Le differenze con la Repubblica Ceca' :
                       'Differences compared to the Czech Republic'}
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-slate-700 leading-[1.75]">
                    <strong>
                      {language === 'cs' ? 'Tento obsah je určen speciálně pro české zájemce o nemovitostí v Itálii' :
                       language === 'it' ? 'Questo contenuto è pensato specificamente per gli acquirenti cechi interessati agli immobili in Italia' :
                       'This content is specifically designed for Czech buyers interested in Italian property'}
                    </strong>
                    {' '}
                    {language === 'cs' ? ', kteří chtějí mít jasno, přehled a rozhodovat se s klidem.' :
                     language === 'it' ? ', che vogliono chiarezza, visione d\'insieme e decisioni serene.' :
                     ', who want to have clarity, overview and decide with peace of mind.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Process Steps */}
          <div className="max-w-5xl mx-auto mb-10 sm:mb-16">
            <div className="space-y-4 sm:space-y-8">
              {visibleProcessSteps.map((step, index) => (
                <Card 
                  key={index}
                  id={`step-${index + 1}`}
                  className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden scroll-mt-28"
                >
                  <CardHeader className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                    <div className="flex items-start gap-3 sm:gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-lg sm:text-2xl font-bold text-white">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                          <div>
                            <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 mb-1">
                              {step.title[language]}
                            </CardTitle>
                            <p className="text-sm sm:text-base text-slate-600 font-medium">
                              {step.subtitle[language]}
                            </p>
                          </div>
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200 px-2.5 py-1 mt-2 md:mt-0 w-fit text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {step.duration[language]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <p className="text-sm sm:text-base text-gray-600 leading-[1.75] mb-4 sm:mb-6">
                      {step.description[language]}
                    </p>
                    
                    <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-100">
                      <h4 className="font-semibold text-sm sm:text-base text-slate-800 mb-2 sm:mb-3 flex items-center">
                        <CheckSquare className="h-4 w-4 mr-2" />
                        {language === 'cs' ? 'Co je zahrnuto:' : language === 'it' ? 'Cosa include:' : 'What\'s Included:'}
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2">
                        {step.includes.map((item, idx) => (
                          <li key={idx} className="flex items-start text-xs sm:text-sm text-gray-700">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{item[language]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {step.ctaHref && (
                      <div className="mt-3 sm:mt-4">
                        {step.ctaHref.startsWith('/guides/') ? (
                          <ProtectedContentLink href={step.ctaHref} language={language}>
                            <Button className="min-h-[44px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm px-4">
                              {step.ctaLabel?.[language] || (language === 'cs' ? 'Zjistit více' : language === 'it' ? 'Scopri di più' : 'Learn more')}
                            </Button>
                          </ProtectedContentLink>
                        ) : (
                          <Link href={step.ctaHref}>
                          <Button className="min-h-[44px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm px-4">
                            {step.ctaLabel?.[language] || (language === 'cs' ? 'Zjistit více' : language === 'it' ? 'Scopri di più' : 'Learn more')}
                          </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {showTimelineAndCosts && (
            <>
              {/* Timeline Overview */}
              <div className="max-w-5xl mx-auto mb-16">
                <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-slate-700 to-slate-800 text-white">
                    <CardTitle className="text-2xl font-bold flex items-center">
                      <Calendar className="h-6 w-6 mr-3" />
                      {language === 'cs' ? 'Časový plán' : language === 'it' ? 'Cronologia' : 'Timeline Overview'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <div className="text-4xl font-bold text-slate-800 mb-2">
                        {TIMELINE_OVERVIEW.total[language]}
                      </div>
                      <p className="text-gray-600">
                        {language === 'cs' ? 'Pro většinu koupí nemovitostí' : 
                         language === 'it' ? 'Per la maggior parte degli acquisti immobiliari' : 
                         'For most property purchases'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {TIMELINE_OVERVIEW.phases.map((phase, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-slate-700 font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-1">
                              {phase.name[language]}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {phase.duration[language]}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Costs Overview */}
              <div className="max-w-5xl mx-auto mb-16">
                <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                    <CardTitle className="text-2xl font-bold text-slate-800 flex items-center">
                      <Euro className="h-6 w-6 mr-3" />
                      {language === 'cs' ? 'Přehled nákladů' : language === 'it' ? 'Panoramica dei costi' : 'Costs Overview'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <p className="text-gray-600 mb-6 leading-[1.75]">
                      {language === 'cs' ? 'Kromě kupní ceny nemovitostí, zde jsou typické dodatečné náklady spojené s koupí italské nemovitostí:' :
                       language === 'it' ? 'Oltre al prezzo di acquisto dell\'immobile, ecco i costi aggiuntivi tipici associati all\'acquisto di una proprietà italiana:' :
                       'In addition to the property purchase price, here are the typical additional costs associated with buying Italian property:'}
                    </p>

                    <div className="space-y-4">
                      {COSTS_OVERVIEW.map((cost, index) => (
                        <div key={index} className="flex flex-col md:flex-row md:items-start md:justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-2 md:gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 mb-1">
                              {cost.title[language]}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {cost.description[language]}
                            </p>
                          </div>
                          <div className="md:text-right md:ml-4">
                            <span className="font-bold text-lg text-slate-700">
                              {cost.amount[language]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm text-blue-800">
                        <strong>
                          {language === 'cs' ? 'Poznámka:' : language === 'it' ? 'Nota:' : 'Note:'}
                        </strong>
                        {' '}
                        {language === 'cs' ? 'Skutečné náklady se mohou lišit v závislosti na hodnotě nemovitostí, umístění a specifických okolnostech. Poskytneme vám podrobný rozpis nákladů během konzultace.' :
                         language === 'it' ? 'I costi effettivi possono variare in base al valore dell\'immobile, alla posizione e alle circostanze specifiche. Vi forniremo un dettaglio completo dei costi durante la consulenza.' :
                         'Actual costs may vary based on property value, location, and specific circumstances. We\'ll provide you with a detailed cost breakdown during consultation.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-12">
                <Key className="h-16 w-16 mx-auto mb-6 opacity-90" />
                <h2 className="font-bold mb-8">
                  {language === 'cs' ? 'Jak pokračovat dál?' :
                   language === 'it' ? 'Come procedere?' :
                   'How to Proceed?'}
                </h2>
                <p className="text-slate-200 text-lg mb-8 leading-[1.75]">
                  {language === 'cs' ? 'Podle vaší aktuální situace doporučujeme pokračovat jednou z těchto cest:' :
                   language === 'it' ? 'In base alla vostra situazione attuale, consigliamo di proseguire con uno di questi percorsi:' :
                   'Based on your current situation, we recommend continuing with one of these paths:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/contact">
                    <Button
                      size="lg"
                      className="bg-white hover:bg-gray-100 text-slate-800 font-semibold px-6 py-6 text-sm transition-all duration-300 shadow-lg w-full"
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      {language === 'cs' ? 'Bezplatná konzultace' :
                       language === 'it' ? 'Consulenza gratuita' :
                       'Free consultation'}
                    </Button>
                  </Link>
                  <Link href="/contact#contact-form">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-6 py-6 text-sm transition-all duration-300 shadow-lg w-full"
                    >
                      {language === 'cs' ? 'Vyplnit formulář' :
                       language === 'it' ? 'Compila il form' :
                       'Fill out the form'}
                    </Button>
                  </Link>
                  <Link href="/properties">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-6 py-6 text-sm transition-all duration-300 shadow-lg w-full"
                    >
                      {language === 'cs' ? 'Zobrazit nemovitostí' :
                       language === 'it' ? 'Vedi le proprietà' :
                       'View properties'}
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/faq">
                    <Button
                      size="lg"
                      className="bg-white/10 border border-white/30 hover:bg-white/20 text-white font-semibold px-6 py-6 text-sm transition-all duration-300 shadow-lg w-full"
                    >
                      {'FAQ'}
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking.com Section */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-12">
                <h3 className="text-2xl font-bold mb-4 text-slate-800">
                  {language === 'cs' ? 'Chcete poznat Itálii osobně ještě před koupí?' :
                   language === 'it' ? 'Volete conoscere l\'Italia di persona prima dell\'acquisto?' :
                   'Want to Experience Italy Personally Before Buying?'}
                </h3>
                <p className="text-gray-600 mb-6 text-lg leading-[1.75]">
                  {language === 'cs' ? 'Mnoho našich klientů si před finálním rozhodnutím vybírá region osobně – udělají si krátký pobyt, projdou okolí, porovnají lokality i styl života.' :
                   language === 'it' ? 'Molti dei nostri clienti prima della decisione finale scelgono la regione di persona - fanno un breve soggiorno, esplorano i dintorni, confrontano località e stile di vita.' :
                   'Many of our clients choose their region personally before the final decision - they take a short stay, explore the surroundings, compare locations and lifestyle.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center sm:justify-center">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold px-8 py-6 text-base transition-all duration-300 shadow-lg w-full sm:w-auto"
                    onClick={() => window.open('https://www.dpbolvw.net/click-101629596-15735418', '_blank')}
                  >
                    {language === 'cs' ? 'Najít ubytování v Itálii (Booking.com)' :
                     language === 'it' ? 'Trova alloggio in Italia (Booking.com)' :
                     'Find Accommodation in Italy (Booking.com)'}
                  </Button>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold px-8 py-6 text-base transition-all duration-300 shadow-lg w-full sm:w-auto"
                    onClick={() => window.open('https://gyg.me/O0X6ZC2R', '_blank')}
                  >
                    {language === 'cs' ? 'Výlety a průvodce (GetYourGuide)' :
                     language === 'it' ? 'Escursioni e guide (GetYourGuide)' :
                     'Tours & Guides (GetYourGuide)'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-6 pb-16 md:pb-24" style={{maxWidth:"1200px"}}>
        <div className="max-w-5xl mx-auto">
          <InformationalDisclaimer language={language} />
        </div>
      </div>

      <PropertySlider language={language} />
      <Footer language={language} />
    </div>
  )
}
