'use client'

import { useState, useEffect } from 'react'
import { MapPin, TrendingUp, Home, ChevronRight, Star, CheckCircle, Shield, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PropertySlider from '@/components/PropertySlider'
import { REGION_DATA_OVERRIDES } from './regionContent'
import ProtectedContentLink from '@/components/ProtectedContentLink'

const CLEAN_REGION_CARD_WARNINGS = {
  toscana: {
    it: "Immobili storici e rurali richiedono spesso verifiche urbanistiche e tecniche rigorose prima dell'offerta.",
    cs: 'Historické a venkovské nemovitostí často vyžadují přísnou urbanistickou i technickou kontrolu před nabídkou.'
  },
  lazio: {
    cs: 'Řím a provincie mají odlišnou dynamiku; u starších domů je nutná pečlivá právní i kondominiální kontrola.'
  },
  sicilia: {
    cs: 'Na Sicílii rozhoduje mikro-lokalita: katastrální soulad a přesná poloha jsou důležitější než regionální průměry.'
  },
  liguria: {
    cs: 'Výhled na moře má vysoké premium, ale přístup, parkování a sklon terénu silně ovlivňují užívání i prodejnost.'
  },
  campania: {
    cs: 'Výběr čtvrti je klíčový: logistika, urbanistická shoda i pravidla pronájmu se výrazně liší podle obce.'
  },
  piemonte: {
    cs: 'Městské a venkovské trhy jsou odlišné: u starších venkovských nemovitostí prověřujte efektivitu vytápění i právní stav.'
  },
  'friuli-venezia-giulia': {
    it: 'L’accessibilità di confine è ottima, ma esposizione climatica costiera e dinamiche di micro-zona vanno valutate con precisione.',
    cs: 'Hraniční dostupnost je výborná, ale klimatická expozice pobřeží a mikro-lokální dynamika vyžadují přesné vyhodnocení.'
  },
  calabria: {
    it: "I prezzi d'ingresso sono interessanti, ma la liquidità è inferiore; prevedete budget per adeguamenti tecnici.",
    cs: 'Vstupní ceny jsou atraktivní, ale likvidita trhu je nižší; počítejte s rozpočtem na technické úpravy.'
  },
  sardegna: {
    cs: 'Sezónnost, dopravní spojení a model správy jsou klíčové faktory pro vlastní užívání i výnos z pronájmu.'
  },
  'trentino-alto-adige': {
    it: 'La qualità montana è alta, ma regole locali, regolamenti condominiali e costi invernali richiedono pianificazione accurata.',
    cs: 'Horská kvalita je vysoká, ale místní pravidla, kondominiální řád a zimní provozní náklady vyžadují pečlivé plánování.'
  },
  'valle-d-aosta': {
    it: 'Nelle località top lo stock è limitato: verifiche tecniche e rapidità decisionale sono fondamentali.',
    cs: 'V top střediscích je nabídka omezená; technické kontroly a rychlá připravenost rozhodnout jsou zásadní.'
  },
  'lago-di-garda': {
    cs: 'Ceny se silně liší podle mikro-lokality u jezera; před závazkem prověřujte místní pravidla krátkodobého pronájmu.'
  }
}

const REGION_OVERRIDE_SLUGS = {
  lombardy: 'lombardia'
}

const REGION_DETAIL_SLUGS = {
  lombardy: 'lombardia',
  'friuli-venezia-giulia': 'friuli-venezia-giulia',
  puglia: 'puglia',
  calabria: 'calabria',
  sicilia: 'sicilia',
  toscana: 'toscana',
  liguria: 'liguria',
  veneto: 'veneto',
  lazio: 'lazio',
  campania: 'campania',
  piemonte: 'piemonte',
  'emilia-romagna': 'emilia-romagna',
  umbria: 'umbria',
  sardegna: 'sardegna',
  abruzzo: 'abruzzo',
  'trentino-alto-adige': 'trentino-alto-adige',
  'valle-d-aosta': 'valle-d-aosta'
}

const REGION_CARD_WARNINGS = {
  toscana: {
    en: 'Historic and rural assets often need strict urban planning and technical checks before offer.',
    it: "Immobili storici e rurali richiedono spesso verifiche urbanistiche e tecniche rigorose prima dell'offerta.",
    cs: 'Historicke a venkovské nemovitostí ?asto vyžadují prisnou urbanistickou i technickou kontrolu před nabídkou.'
  },
  lombardia: {
    en: 'Micro-location drives value in Lombardy: transport links, condo costs, and building condition are decisive.',
    it: 'In Lombardia il valore dipende dalla micro-zona: collegamenti, costi condominiali e stato tecnico sono decisivi.',
    cs: 'V Lombardii rozhoduje mikro-lokalita: dopravní dostupnost, náklady na kondominium a technický stav.'
  },
  veneto: {
    en: 'In historic and lagoon-linked areas, flood exposure and local rental regulation must be checked early.',
    it: 'Nelle aree storiche e lagunari vanno verificati presto rischio acqua alta e regolamenti locali sugli affitti.',
    cs: 'V historických a lagunovych oblastech je nutné včas prověřit riziko zaplav a místní pravidla pronajmu.'
  },
  lazio: {
    en: 'Rome and provincial markets behave differently; old buildings require careful legal and condo due diligence.',
    it: 'Roma e province hanno dinamiche diverse; sugli edifici datati serve una due diligence legale e condominiale accurata.',
    cs: '?Řím a provincie maji odlišnou dynamiku; u starších domů je nutna pecliva právně i kondominiální kontrola.'
  },
  sicilia: {
    en: 'Sicily is highly micro-market based: cadastral compliance and exact location matter more than island averages.',
    it: 'In Sicilia conta la micro-zona: conformità catastale e posizione precisa pesano più delle medie regionali.',
    cs: 'Na Sicilii rozhoduje mikro-lokalita: katastrálně soulad a presna poloha jsou dulezitejsi nez regionální prumery.'
  },
  liguria: {
    en: 'Sea-view premiums are high, but access, parking, and slope exposure can strongly impact usability and resale.',
    it: 'Le vista mare hanno premium elevato, ma accesso, parcheggio e pendenza incidono molto su uso e rivendita.',
    cs: 'Výhled na moře ma vysoké premium, ale př?stup, parkování a sklon terénu silné ovlivňují užívání i prodejnost.'
  },
  campania: {
    en: 'Neighborhood selection is critical: logistics, urban compliance, and rental rules vary sharply by municipality.',
    it: 'La scelta del quartiere è decisiva: logistica, conformità urbanistica e regole sugli affitti cambiano molto da comune a comune.',
    cs: 'Výběr čtvrti je klíčový: logistika, urbanistická shoda i pravidla pronajmu se výrazně liší podle obce.'
  },
  piemonte: {
    en: 'City and countryside profiles differ: check heating efficiency and legal status carefully in older rural stock.',
    it: 'Città e campagna hanno profili diversi: sugli immobili rurali datati vanno verificati bene efficienza e stato legale.',
    cs: 'Městské a venkovské trhy jsou odlišné: u starších venkovskych nemovitostí proverujte efektivitu vytápění i právně stav.'
  },
  'emilia-romagna': {
    en: 'Stable demand is a strength, but plain-area hydro risk and building efficiency checks remain essential.',
    it: "La domanda stabile è un punto forte, ma restano essenziali verifiche su rischio idraulico ed efficienza edilizia.",
    cs: 'Stabilni poptávka je vyhoda, ale zasadni jsou kontroly hydraulickeho rizika a energeticke efektivity budov.'
  },
  puglia: {
    en: 'Trulli and masserie can require complex compliance checks; seasonal rental assumptions must be realistic.',
    it: 'Trulli e masserie possono richiedere controlli complessi di conformità; le stime di affitto stagionale vanno fatte con prudenza.',
    cs: 'Trulli a masserie mohou vyzadovat slozite kontroly souladu; odhady sezonniho pronajmu je třeba nastavit realisticky.'
  },
  umbria: {
    en: 'Rural charm is strong, but resale timing can be longer and technical condition varies greatly by property.',
    it: 'Il fascino rurale è forte, ma i tempi di rivendita possono essere più lunghi e le condizioni tecniche molto variabili.',
    cs: 'Venkovský charakter je silný, ale doba dalsiho prodeje může být delší a technický stav se hodne liší dům od domů.'
  },
  'friuli-venezia-giulia': {
    en: 'Border accessibility is excellent, but coastal weather exposure and micro-area dynamics must be assessed precisely.',
    it: "L'accessibilità di confine è ottima, ma esposizione climatica costiera e dinamiche di micro-zona vanno valutate con precisione.",
    cs: 'Hraniční dostupnost je výborná, ale klimatická expozice na pobřeží a mikro-lokální dynamika vyžadují přesné vyhodnocení.'
  },
  calabria: {
    en: 'Entry prices are attractive, but market liquidity is lower; budget for technical upgrades before purchase.',
    it: "I prezzi d'ingresso sono interessanti, ma la liquidità è inferiore; prevedete budget per adeguamenti tecnici.",
    cs: 'Vstupni ceny jsou atraktivni, ale likvidita trhu je nižší; pocitejte s rozpoctem na technické upravy.'
  },
  abruzzo: {
    en: 'Great value profile, but seismic context and distance to services should be verified property by property.',
    it: 'Profilo prezzo/valore molto buono, ma contesto sismico e distanza dai servizi vanno verificati immobile per immobile.',
    cs: 'Poměrný výkon/cena je výborný, ale seismicky kontext a vzdálenost služeb je nutné prověřit u každé nemovitostí.'
  },
  sardegna: {
    en: 'Seasonality, transport links, and management setup are key factors for both personal use and rental yield.',
    it: 'Stagionalità, collegamenti e modello di gestione sono fattori chiave sia per uso personale sia per rendimento.',
    cs: 'Sezónnost, dopravní spojení a model správy jsou klíčové faktory pro vlastní užívání i výnos z pronajmu.'
  },
  'trentino-alto-adige': {
    en: 'Mountain quality is high, but local rules, condo bylaws, and winter operating costs require careful planning.',
    it: 'La qualità montana è alta, ma regole locali, regolamenti condominiali e costi invernali richiedono pianificazione accurata.',
    cs: 'Horská kvalita je vysoká, ale místní pravidla, kondominiální řád a zimní provozní náklady vyžadují pečlivé plánování.'
  },
  'valle-d-aosta': {
    en: 'Inventory is limited in top resorts; technical checks and quick decision readiness are critical.',
    it: 'Nelle località top lo stock è limitato: verifiche tecniche e rapidità decisionale sono fondamentali.',
    cs: 'V top strediscich je nabídka omezena; technické kontroly a rychla pripravenost rozhodnout jsou zasadni.'
  },
  'lago-di-garda': {
    en: 'Pricing changes sharply by shoreline micro-zone; verify local short-rental rules before committing.',
    it: 'I prezzi cambiano molto per micro-zona sul lago; verificate le regole locali sugli affitti brevi prima di impegnarvi.',
    cs: 'Ceny se silné liší podle mikro-lokality u jezera; před závazkem proverujte místní pravidla kratkodobeho pronajmu.'
  },
  alpy: {
    en: 'Each valley has different demand and regulation; winter access and heating standards are central.',
    it: 'Ogni valle ha domanda e regole diverse; accessibilita invernale e standard di riscaldamento sono centrali.',
    cs: 'Každé údolí ma jinou poptávku i pravidla; zimní dostupnost a standard vytápění jsou klíčové.'
  }
}

function getRegionOverrideSlug(slug = '') {
  if (!slug) return ''
  return REGION_OVERRIDE_SLUGS[slug] || slug
}

function getRegionDetailSlug(slug = '') {
  if (!slug) return ''
  return REGION_DETAIL_SLUGS[slug] || slug
}

function getRegionDisplayName(region, language = 'cs') {
  const raw = region?.name?.[language] || region?.name?.en || ''
  return raw.split(' - ')[0]
}

function RegionCard({ region, language = 'cs' }) {
  const formatPrice = (price) => {
    if (typeof price !== 'number' || Number.isNaN(price)) {
      return 'N/A'
    }
    if (price >= 1000000) {
      const millions = price / 1000000
      return `\u20AC${millions.toFixed(millions % 1 === 0 ? 0 : 1)}M`
    } else if (price >= 1000) {
      const thousands = price / 1000
      return `\u20AC${thousands.toFixed(thousands % 1 === 0 ? 0 : 0)}k`
    }
    return `\u20AC${price.toLocaleString()}`
  }

  const formatPriceRange = (min, max) => {
    return `${formatPrice(min)} - ${formatPrice(max)}`
  }

  const renderStars = (popularity) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < popularity ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const regionSlug = region.slug?.current || ''
  const overrideSlug = getRegionOverrideSlug(regionSlug)
  const overrideRegion = REGION_DATA_OVERRIDES?.[overrideSlug] || null
  const overridePriceNotesByLang = language === 'cs' ? null : overrideRegion?.priceNotes?.[language]
  const regionPriceNotesByLang = region.priceNotes?.[language]
  const noteCandidates =
    Array.isArray(overridePriceNotesByLang) && overridePriceNotesByLang.length > 0
      ? overridePriceNotesByLang
      : Array.isArray(regionPriceNotesByLang) && regionPriceNotesByLang.length > 0
        ? regionPriceNotesByLang
        : []
  const rangeLine = `${formatPriceRange(region.priceRange.min, region.priceRange.max)}`
  const noteDetails = noteCandidates.slice(0, 2)
  const priceLines = noteDetails.length === 2
    ? [rangeLine, ...noteDetails]
    : [
        rangeLine,
        language === 'cs'
          ? `Průměrná cena: ${formatPrice(region.averagePrice)}`
          : language === 'it'
            ? `Prezzo medio: ${formatPrice(region.averagePrice)}`
            : `Average price: ${formatPrice(region.averagePrice)}`
      ]
  const cleanWarningBySlug =
    CLEAN_REGION_CARD_WARNINGS[overrideSlug] ||
    CLEAN_REGION_CARD_WARNINGS[regionSlug]
  const regionalWarningBySlug =
    REGION_CARD_WARNINGS[overrideSlug] ||
    REGION_CARD_WARNINGS[regionSlug]
  const detailSlug = getRegionDetailSlug(region.slug?.current || '')
  const warningText = region.warning?.[language] || cleanWarningBySlug?.[language] || regionalWarningBySlug?.[language] || (language === 'cs'
    ? 'Před podáním nabídky vždy proveďte technickou a právní due diligence.'
    : (
        language === 'it'
          ? 'Prima di fare un\'offerta, eseguite sempre una due diligence tecnica e legale.'
          : 'Before making an offer, always complete technical and legal due diligence.'
      ))
  return (
    <Card className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-200 shadow-lg bg-white rounded-2xl h-full flex flex-col">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={region.image}
          alt={region.name[language]}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Popularity Stars */}
        <div className="absolute top-3 right-3 flex gap-0.5">
          {renderStars(region.popularity)}
        </div>
      </div>
      
      {/* Content */}
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-slate-700 transition-colors duration-300">
          {region.name[language]}
        </CardTitle>
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
          {region.description[language]}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-4">
        {/* Price Info */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              {language === 'cs' ? 'Orientační ceny:' :
               language === 'it' ? 'Prezzi indicativi:' :
               'Indicative prices:'}
            </h4>
            <div className="space-y-1">
              {priceLines.map((line, index) => (
                <p key={index} className="text-sm text-gray-600">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
        
        {/* Top Cities */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {language === 'cs' ? 'Hlavn\u00ed m\u011bsta' :
             language === 'it' ? 'Città principali' :
             'Main Cities'}
          </h4>
          <div className="flex flex-wrap gap-1">
            {region.topCities.slice(0, 5).map((city, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                {city}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-900">
            <strong>{language === 'cs' ? 'Pozor:' : language === 'it' ? 'Attenzione:' : 'Attention:'}</strong>{' '}
            {warningText}
          </p>
        </div>

      </CardContent>
      
      <CardFooter className="pt-0 flex flex-col gap-2">
        <ProtectedContentLink href={`/regions/${detailSlug}`} language={language} className="w-full">
          <Button 
            variant="outline"
            className="w-full border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold py-3 transition-all duration-300"
          >
            {language === 'cs' ? 'Podrobn\u00fd pr\u016fvodce' :
             language === 'it' ? 'Guida dettagliata' : 
             'Detailed Guide'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </ProtectedContentLink>
        <Link 
          href={`/properties?region=${region.slug.current}`} 
          className="w-full"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }}
        >
          <Button 
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 transition-all duration-300"
          >
            {language === 'cs' ? 'Zobrazit nemovitostí' : 
             language === 'it' ? 'Visualizza proprietà' :
             'View Properties'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function RegionsListingClient({ initialRegions }) {
  const [language, setLanguage] = useState('cs')
  const [regionsData, setRegionsData] = useState(initialRegions)
  const mobileFeaturedRegions = regionsData.slice(0, 5)
  const mobileRemainingRegions = regionsData.slice(5)

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

  useEffect(() => {
    let active = true

    const normalizeRegion = (region, index) => ({
      _id: region._id || `region-${index + 1}`,
      name: {
        en: region.name?.en || '',
        cs: region.name?.cs || '',
        it: region.name?.it || ''
      },
      slug: {
        _type: 'slug',
        current: region.slug?.current || `region-${index + 1}`
      },
      country: region.country || 'Italy',
      description: {
        en: region.description?.en || '',
        cs: region.description?.cs || '',
        it: region.description?.it || ''
      },
      image: region.image || '/Toscana.png',
      propertyCount: Number(region.propertyCount || 0),
      averagePrice: Number(region.averagePrice || 0),
      priceRange: {
        min: Number(region.priceRange?.min || 0),
        max: Number(region.priceRange?.max || 0)
      },
      topCities: Array.isArray(region.topCities) ? region.topCities : [],
      highlights: Array.isArray(region.highlights) ? region.highlights : [],
      popularity: Number(region.popularity || 0),
      priceNotes: region.priceNotes || null,
      warning: region.warning || null
    })

    const loadRegions = async () => {
      try {
        const response = await fetch('/api/content?type=regions', { cache: 'no-store' })
        const result = await response.json()

        if (!active) return

        if (response.ok && Array.isArray(result.regions) && result.regions.length > 0) {
          setRegionsData(result.regions.map(normalizeRegion))
        }
      } catch (error) {
        console.error('Failed to load regions content:', error)
      }
    }

    loadRegions()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <div className="pt-32 pb-10 sm:pb-12">
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm mb-8">
          <div className="container mx-auto px-6 py-16 md:py-24" style={{maxWidth:"1600px"}}>
            <div className="text-center">
              

<h1 className="font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent px-2">
  {language === 'cs' ? 'Koup\u011b domů v It\u00e1lii: kter\u00fd region zvolit?' :
   language === 'it' ? 'Comprare casa in Italia: quale regione scegliere?' :
   'Buying a House in Italy: Which Region Should You Choose?'}
</h1>
<p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed whitespace-pre-line px-4">
  {language === 'cs' ? 'It\u00e1lie nab\u00edz\u00ed 20 velmi odli\u0161n\u00fdch region\u016f: mo\u0159e, hory, historick\u00e1 m\u011bsta, venkovsk\u00e9 oblastí a z\u00f3ny s vysok\u00fdm investi\u010dn\u00edm potenci\u00e1lem.\nV\u00fdb\u011br spr\u00e1vn\u00e9ho regionů je \u010dasto d\u016fle\u017eit\u011bj\u0161\u00ed ne\u017e samotn\u00fd d\u016fm.\nKa\u017ed\u00e1 oblast m\u00e1 odli\u0161n\u00e1 pravidla, ceny, zdan\u011bn\u00ed a dynamiku trhu.' :
   language === 'it' ? "L'Italia offre 20 regioni molto diverse tra loro: mare, montagna, città storiche, aree rurali e zone ad alto potenziale d'investimento.\nScegliere la regione giusta è spesso più importante della casa stessa.\nOgni area ha regole, prezzi, fiscalità e dinamiche di mercato differenti." :
   'Italy offers 20 very different regions: sea, mountains, historic cities, rural areas and zones with high investment potential.\nChoosing the right region is often more important than the house itself.\nEach area has different rules, prices, taxation and market dynamics.'}
</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6" style={{maxWidth:"1600px"}}>
          <h2 className="font-semibold text-blue-600/80 mb-8 text-center">
            {language === 'cs' ? 'Koup\u011b domů v It\u00e1lii - Ceny, regiony a dostupn\u00e9 nemovitostí' :
             language === 'it' ? 'Comprare casa in Italia - Prezzi, regioni e immobili disponibili' :
             'Buying a House in Italy - Prices, Regions, and Available Properties'}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-6 mb-8 sm:mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="px-2 py-3 sm:p-8 text-center">
                <div className="text-xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-1">20</div>
                <div className="text-xs md:text-sm text-blue-600/80 font-medium">
                  {language === 'cs' ? 'Italsk? regiony' : language === 'it' ? 'Regioni italiane' : 'Italian regions'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="px-2 py-3 sm:p-8 text-center">
                <div className="text-lg sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-1">
                  {language === 'cs' ? '\u20AC2 150 / m\u00B2' : language === 'it' ? '\u20AC2.150 / m\u00B2' : '\u20AC2,150 / m\u00B2'}
                </div>
                <div className="text-xs md:text-sm text-blue-600/80 font-medium">
                  {language === 'cs' ? 'Pr\u016fm\u011brn\u00e1 n\u00e1rodn\u00ed cena' : language === 'it' ? 'Prezzo medio nazionale' : 'National average price'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardContent className="px-2 py-3 sm:p-8 text-center">
                <div className="text-lg sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent mb-1">
                  {language === 'cs' ? '\u20AC30 000+' : language === 'it' ? '\u20AC30.000+' : '\u20AC30,000+'}
                </div>
                <div className="text-xs md:text-sm text-blue-600/80 font-medium">
                  {language === 'cs' ? 'Reálná vstupní hranice' : language === 'it' ? 'Fascia di ingresso reale' : 'Real entry range'}
                </div>
              </CardContent>
            </Card>

          </div>

          <div className="mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">
                  {language === 'cs' ? 'Jak si vybrat region v Itálii?' :
                   language === 'it' ? 'Come scegliere la regione giusta in Italia per comprare casa?' :
                   'How to Choose a Region in Italy?'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-8">
                <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed whitespace-pre-line text-base sm:text-lg">
                  {language === 'cs' ? 'Při výběru lokality doporučujeme zvážit zejména:' :
                   language === 'it' ? 'La scelta della regione è una decisione strategica.\nNon tutte le zone sono adatte allo stesso obiettivo:\ncasa vacanze, investimento, trasferimento permanente o affitto turistico.' :
                   'When choosing a location, we recommend considering especially:'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 rounded-lg flex items-center justify-center"><MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" /></div>
                    <div><h4 className="font-semibold text-slate-800 mb-2">{language === 'cs' ? 'Bydlen\u00ed u mo\u0159e, v hor\u00e1ch nebo ve m\u011bst\u011b?' : language === 'it' ? 'Volete abitare al mare, in montagna o in città?' : 'Do you want to live by the sea, in the mountains, or in the city?'}</h4></div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 rounded-lg flex items-center justify-center"><Home className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" /></div>
                    <div><h4 className="font-semibold text-slate-800 mb-2">{language === 'cs' ? 'D\u016fm na dovolenou, investice, nebo nov\u00e1 \u017eivotn\u00ed etapa?' : language === 'it' ? 'Casa vacanze, investimento o nuova vita?' : 'Vacation home, investment, or a new life?'}</h4></div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 rounded-lg flex items-center justify-center"><TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" /></div>
                    <div><h4 className="font-semibold text-slate-800 mb-2">{language === 'cs' ? 'Dostupnost z \u010cR a infrastruktura' : language === 'it' ? 'Accessibilità dalla Repubblica Ceca e infrastruttura locale' : 'Accessibility from the Czech Republic and local infrastructure'}</h4></div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 rounded-lg flex items-center justify-center"><Star className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" /></div>
                    <div><h4 className="font-semibold text-slate-800 mb-2">{language === 'cs' ? 'Rozpo\u010det v\u010detn\u011b dan\u00ed a poplatk\u016f' : language === 'it' ? 'Budget con tasse e costi inclusi' : 'Budget including taxes and fees'}</h4></div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 rounded-lg flex items-center justify-center"><CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" /></div>
                    <div><h4 className="font-semibold text-slate-800 mb-2">{language === 'cs' ? 'Vlastn\u00ed u\u017e\u00edv\u00e1n\u00ed nebo pron\u00e1jem' : language === 'it' ? 'Uso personale o affitto' : 'Personal use or rental income'}</h4></div>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 rounded-lg flex items-center justify-center"><Shield className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" /></div>
                    <div><h4 className="font-semibold text-slate-800 mb-2">{language === 'cs' ? 'Ka\u017ed\u00fd region m\u00e1 jin\u00e1 pravidla a \u017eivotn\u00ed styl' : language === 'it' ? 'Ogni regione ha regole e dinamiche diverse' : 'Each region has different legal and market dynamics'}</h4></div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 p-6 sm:p-8 bg-blue-50 border border-blue-200 rounded-2xl">
                  <p className="text-blue-800 leading-relaxed whitespace-pre-line">
                    <strong>{language === 'cs' ? 'Nev\u00edte, kter\u00fd region vybrat?' : language === 'it' ? 'Non sapete quale regione scegliere?' : 'Not sure which region is most suitable for you?'}</strong>
                    <br />
                    {language === 'cs' ? 'Pom\u016f\u017eeme v\u00e1m analyzovat:\n\u2714 re\u00e1ln\u00fd rozpo\u010det\n\u2714 c\u00edl (dovolen\u00e1 / investice / stabiln\u00ed bydlen\u00ed)\n\u2714 m\u00edstn\u00ed dan\u011b\n\u2714 potenci\u00e1l pron\u00e1jmu\n\u2714 spr\u00e1vu na d\u00e1lku\n\nNapi\u0161te n\u00e1m na WhatsApp nebo si vy\u017e\u00e1dejte \u00fAvodn\u00ed konzultaci.' :
                     language === 'it' ? 'Vi aiutiamo ad analizzare:\n\u2714 budget reale\n\u2714 obiettivo (vacanza / investimento / vita stabile)\n\u2714 tassazione locale\n\u2714 potenziale affitto\n\u2714 gestione a distanza\n\nScriveteci su WhatsApp o richiedete una consulenza iniziale.' :
                     'We help you analyze:\n\u2714 real budget\n\u2714 goal (holiday / investment / stable living)\n\u2714 local taxation\n\u2714 rental potential\n\u2714 remote management\n\nMessage us on WhatsApp or request an initial consultation.'}
                  </p>
                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <a href="https://wa.me/420731450001" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                      <Button className="w-full bg-green-600 hover:bg-green-500 text-white">
                        WhatsApp
                      </Button>
                    </a>
                    <Link href="/contact" className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full border-blue-300 bg-white text-blue-900 hover:bg-blue-100 hover:text-blue-900">
                        {language === 'cs' ? 'Kontaktní formulář' : language === 'it' ? 'Modulo di contatto' : 'Contact form'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:hidden mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              {language === 'cs' ? 'Doporučené regiony' : language === 'it' ? 'Regioni consigliate' : 'Recommended regions'}
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {mobileFeaturedRegions.map((region, index) => {
                const detailSlug = getRegionDetailSlug(region.slug?.current || '')
                return (
                  <ProtectedContentLink
                    key={region._id}
                    href={`/regions/${detailSlug}`}
                    language={language}
                    className={`${index === 4 ? 'col-span-2' : ''} rounded-2xl border border-gray-200 bg-white p-2.5 shadow-sm`}
                  >
                    <div className="aspect-[4/3] rounded-lg overflow-hidden mb-2">
                      <img
                        src={region.image}
                        alt={getRegionDisplayName(region, language)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-2">{getRegionDisplayName(region, language)}</p>
                  </ProtectedContentLink>
                )
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
              <p className="text-sm font-semibold text-slate-800 mb-2.5">
                {language === 'cs' ? 'Další regiony (rychlý výběr)' : language === 'it' ? 'Altre regioni (selezione rapida)' : 'Other regions (quick pick)'}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {mobileRemainingRegions.map((region) => {
                  const detailSlug = getRegionDetailSlug(region.slug?.current || '')
                  return (
                    <ProtectedContentLink
                      key={region._id}
                      href={`/regions/${detailSlug}`}
                      language={language}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Square className="h-4 w-4 flex-shrink-0 text-slate-500" />
                      <span className="line-clamp-1">{getRegionDisplayName(region, language)}</span>
                    </ProtectedContentLink>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {regionsData.map(region => (
              <RegionCard key={region._id} region={region} language={language} />
            ))}
          </div>

          <div className="text-center">
            <Card className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-8 sm:p-12">
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {language === 'cs' ? 'Chcete region nejdříve poznat osobně?' : language === 'it' ? 'Volete conoscere prima la regione di persona?' : 'Want to Get to Know the Region Personally First?'}
                </h3>
                <p className="text-gray-600 mb-5 sm:mb-8 text-base sm:text-lg leading-relaxed">
                  {language === 'cs' ? 'Mnoho klientů před koupí region nejdříve navštíví osobně. Pro krátké pobyty můžete využít Booking.com.' : language === 'it' ? "Molti clienti prima dell'acquisto visitano personalmente la regione. Per soggiorni brevi potete usare Booking.com." : 'Many clients visit the region in person before buying. For short stays, you can use Booking.com.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto max-w-full whitespace-normal break-words text-center leading-tight bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-4 sm:px-8 py-3 sm:py-6 text-sm sm:text-base transition-all duration-300 shadow-lg"
                    onClick={() => window.open('https://www.dpbolvw.net/click-101629596-15735418', '_blank')}
                  >
                    {language === 'cs' ? 'Najít ubytovani (Booking.com)' : language === 'it' ? 'Trova alloggio (Booking.com)' : 'Find Accommodation (Booking.com)'}
                  </Button>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto max-w-full whitespace-normal break-words text-center leading-tight bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold px-4 sm:px-8 py-3 sm:py-6 text-sm sm:text-base transition-all duration-300 shadow-lg"
                    onClick={() => window.open('https://gyg.me/O0X6ZC2R', '_blank')}
                  >
                    {language === 'cs' ? 'V\u00fdlety a pr\u016fvodce (GetYourGuide)' : language === 'it' ? 'Escursioni e guide (GetYourGuide)' : 'Tours & Guides (GetYourGuide)'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PropertySlider language={language} />
      <Footer language={language} />
    </div>
  )
}
