'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, Euro, Home, Sun, Mountain, Waves, ChevronRight, CheckCircle, MessageSquare, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Script from 'next/script'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PropertySlider from '@/components/PropertySlider'
import { REGION_DATA_OVERRIDES } from '../regionContent'
import { REGION_CURIOSITIES } from '../regionCuriosities'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'

const DEFAULT_BOOKING_LINK = 'https://www.dpbolvw.net/click-101629596-15735418'
const REGION_CAR_RENTAL_LINK = 'https://www.tkqlhce.com/click-101629596-17122732'
const REGION_BOOKING_LINKS = {
  lombardia:
    'https://www.booking.com/searchresults.cs.html?aid=1522416&label=affnetcj-15735418_pub-7711899_site-101629596_pname-Creavita+sro_clkid-_cjevent-23f68d511e0e11f183fd00400a18ba73&lang=cs&sid=f9245db3ab66c6aaf5f923e76887184f&sb=1&sb_lp=1&src=index&src_elem=sb&error_url=https%3A%2F%2Fwww.booking.com%2Findex.cs.html%3Faid%3D1522416%26label%3Daffnetcj-15735418_pub-7711899_site-101629596_pname-Creavita%2520sro_clkid-_cjevent-23f68d511e0e11f183fd00400a18ba73%26sid%3Df9245db3ab66c6aaf5f923e76887184f%26sb_price_type%3Dtotal%26&ss=Riva+del+Garda%2C+Trentino-Alto+Adige%2C+Italia&is_ski_area=&checkin_year=&checkin_month=&checkout_year=&checkout_month=&flex_window=0&efdco=1&group_adults=2&group_children=0&no_rooms=1&b_h4u_keep_filters=&from_sf=1&ss_raw=lago+di+garda&ac_position=1&ac_langcode=it&ac_click_type=b&ac_meta=GhA2YTdmNTcxNGExNmIwMjlmIAEoATICaXQ6DWxhZ28gZGkgZ2FyZGFAAEoAUAA%3D&dest_id=-126468&dest_type=city&place_id_lat=45.88506&place_id_lon=10.838951&search_pageview_id=8f4d570d21da0186&search_selected=true&search_pageview_id=8f4d570d21da0186&ac_suggestion_list_length=5&ac_suggestion_theme_list_length=0',
  lombardy:
    'https://www.booking.com/searchresults.cs.html?aid=1522416&label=affnetcj-15735418_pub-7711899_site-101629596_pname-Creavita+sro_clkid-_cjevent-23f68d511e0e11f183fd00400a18ba73&lang=cs&sid=f9245db3ab66c6aaf5f923e76887184f&sb=1&sb_lp=1&src=index&src_elem=sb&error_url=https%3A%2F%2Fwww.booking.com%2Findex.cs.html%3Faid%3D1522416%26label%3Daffnetcj-15735418_pub-7711899_site-101629596_pname-Creavita%2520sro_clkid-_cjevent-23f68d511e0e11f183fd00400a18ba73%26sid%3Df9245db3ab66c6aaf5f923e76887184f%26sb_price_type%3Dtotal%26&ss=Riva+del+Garda%2C+Trentino-Alto+Adige%2C+Italia&is_ski_area=&checkin_year=&checkin_month=&checkout_year=&checkout_month=&flex_window=0&efdco=1&group_adults=2&group_children=0&no_rooms=1&b_h4u_keep_filters=&from_sf=1&ss_raw=lago+di+garda&ac_position=1&ac_langcode=it&ac_click_type=b&ac_meta=GhA2YTdmNTcxNGExNmIwMjlmIAEoATICaXQ6DWxhZ28gZGkgZ2FyZGFAAEoAUAA%3D&dest_id=-126468&dest_type=city&place_id_lat=45.88506&place_id_lon=10.838951&search_pageview_id=8f4d570d21da0186&search_selected=true&search_pageview_id=8f4d570d21da0186&ac_suggestion_list_length=5&ac_suggestion_theme_list_length=0'
}
const DEFAULT_GYG_LINK = 'https://gyg.me/O0X6ZC2R'
const REGION_GYG_LINKS = {
  lombardia: 'https://gyg.me/tVi5p3To',
  toscana: 'https://www.getyourguide.com/toscana-l558/',
  'trentino-alto-adige': 'https://www.getyourguide.com/trentino-alto-adigesudtirol-l2493/',
  liguria: 'https://www.getyourguide.com/liguria-l221/',
  piemonte: 'https://www.getyourguide.com/piemonte-l598/',
  'friuli-venezia-giulia': 'https://www.getyourguide.com/friuli-venezia-giulia-l1130/',
  veneto: 'https://www.getyourguide.com/veneto-l222/',
  'valle-d-aosta': 'https://www.getyourguide.com/valle-d-aosta-l2478/',
  'emilia-romagna': 'https://www.getyourguide.com/emilia-romagna-l252/',
  marche: 'https://www.getyourguide.com/marche-l257/',
  umbria: 'https://www.getyourguide.com/comune-di-perugia-l1507/',
  lazio: 'https://www.getyourguide.com/lazio-l862/',
  molise: 'https://www.getyourguide.com/molise-l197924/',
  abruzzo: 'https://www.getyourguide.com/abruzzo-l1174/',
  campania: 'https://www.getyourguide.com/pompei-campania-l156880/',
  puglia: 'https://www.getyourguide.com/puglia-l727/',
  calabria: 'https://www.getyourguide.com/calabria-l733/',
  sicilia: 'https://www.getyourguide.com/sicilia-l65/',
  sardegna: 'https://www.getyourguide.com/sardegna-l249/'
}
const REGION_GYG_WIDGET_CONFIGS = {
  lombardia: { locationId: '310', primaryQuery: 'lake como', secondaryQuery: 'milan', destinationLink: 'https://www.getyourguide.com/lombardia-l310/' },
  toscana: { locationId: '558', primaryQuery: 'chianti', secondaryQuery: 'florence', destinationLink: 'https://www.getyourguide.com/toscana-l558/' },
  'trentino-alto-adige': { locationId: '2493', primaryQuery: 'dolomites', secondaryQuery: 'bolzano', destinationLink: 'https://www.getyourguide.com/trentino-alto-adigesudtirol-l2493/' },
  liguria: { locationId: '221', primaryQuery: 'cinque terre', secondaryQuery: 'genoa', destinationLink: 'https://www.getyourguide.com/liguria-l221/' },
  piemonte: { locationId: '598', primaryQuery: 'langhe', secondaryQuery: 'turin', destinationLink: 'https://www.getyourguide.com/piemonte-l598/' },
  'friuli-venezia-giulia': { locationId: '1130', primaryQuery: 'trieste', secondaryQuery: 'udine', destinationLink: 'https://www.getyourguide.com/friuli-venezia-giulia-l1130/' },
  veneto: { locationId: '222', primaryQuery: 'venice', secondaryQuery: 'verona', destinationLink: 'https://www.getyourguide.com/veneto-l222/' },
  'valle-d-aosta': { locationId: '2478', primaryQuery: 'mont blanc', secondaryQuery: 'aosta', destinationLink: 'https://www.getyourguide.com/valle-d-aosta-l2478/' },
  'emilia-romagna': { locationId: '252', primaryQuery: 'bologna', secondaryQuery: 'rimini', destinationLink: 'https://www.getyourguide.com/emilia-romagna-l252/' },
  marche: { locationId: '257', primaryQuery: 'urbino', secondaryQuery: 'ancona', destinationLink: 'https://www.getyourguide.com/marche-l257/' },
  umbria: { locationId: '1507', primaryQuery: 'assisi', secondaryQuery: 'perugia', destinationLink: 'https://www.getyourguide.com/comune-di-perugia-l1507/' },
  lazio: { locationId: '862', primaryQuery: 'rome', secondaryQuery: 'tivoli', destinationLink: 'https://www.getyourguide.com/lazio-l862/' },
  molise: { locationId: '197924', primaryQuery: 'campobasso', secondaryQuery: 'termoli', destinationLink: 'https://www.getyourguide.com/molise-l197924/' },
  abruzzo: { locationId: '1174', primaryQuery: 'gran sasso', secondaryQuery: 'pescara', destinationLink: 'https://www.getyourguide.com/abruzzo-l1174/' },
  campania: { locationId: '156880', primaryQuery: 'pompeii', secondaryQuery: 'naples', destinationLink: 'https://www.getyourguide.com/pompei-campania-l156880/' },
  puglia: { locationId: '727', primaryQuery: 'alberobello', secondaryQuery: 'bari', destinationLink: 'https://www.getyourguide.com/puglia-l727/' },
  calabria: { locationId: '733', primaryQuery: 'tropea', secondaryQuery: 'reggio calabria', destinationLink: 'https://www.getyourguide.com/calabria-l733/' },
  sicilia: { locationId: '65', primaryQuery: 'etna', secondaryQuery: 'palermo', destinationLink: 'https://www.getyourguide.com/sicilia-l65/' },
  sardegna: { locationId: '249', primaryQuery: 'cagliari', secondaryQuery: 'alghero', destinationLink: 'https://www.getyourguide.com/sardegna-l249/' }
}

function buildRegionalWidgetDataAttrs(widgetConfig, query) {
  if (!widgetConfig) return {}
  const attrs = {}

  if (widgetConfig.locationId) {
    attrs['data-gyg-location-id'] = widgetConfig.locationId
  }

  if (query) {
    attrs['data-gyg-q'] = query
  }

  return attrs
}

const REGION_DATA = {
  'friuli-venezia-giulia': {
    name: { en: 'Friuli Venezia Giulia', cs: 'Friuli Venezia Giulia', it: 'Friuli Venezia Giulia' },
    image: '/Friuli-Venezia Giulia.avif',
    tagline: {
      en: 'Where the Alps meet the Adriatic, close to Austria and Slovenia',
      cs: 'Kde se Alpy setkávají s Jadranem, blízko Rakouska a Slovinska',
      it: "Dove le Alpi incontrano l'Adriatico, vicino ad Austria e Slovenia"
    },
    description: {
      en: 'Friuli Venezia Giulia is one of the most popular choices for Czech buyers thanks to its excellent accessibility from the Czech Republic. The region offers a unique combination of alpine landscapes, Adriatic coastline, and rich cultural heritage influenced by Austrian, Slovenian, and Italian traditions.',
      cs: 'Friuli Venezia Giulia je jednou z nejoblíbenějších voleb českých kupujících díky výborné dostupnosti z České republiky. Region nabízí jedinečnou kombinaci alpské krajiny, jadranského pobřeží a bohatého kulturního dědictví ovlivněného rakouskými, slovinskými a italskými tradicemi.',
      it: 'Il Friuli Venezia Giulia è una delle scelte più popolari per gli acquirenti cechi grazie alla sua eccellente accessibilità dalla Repubblica Ceca. La regione offre una combinazione unica di paesaggi alpini, costa adriatica e ricco patrimonio culturale influenzato da tradizioni austriache, slovene e italiane.'
    },
    highlights: {
      en: ['Close to Austria and Slovenia', 'Alps and Adriatic Sea', 'Excellent accessibility from the Czech Republic', 'Lower prices than Veneto', 'Rich wine culture', 'Trieste as a multicultural capital'],
      cs: ['Blízkost Rakouska a Slovinska', 'Alpy i Jaderské moře', 'Výborná dostupnost z ČR', 'Nižší ceny než ve Venetu', 'Bohatá vinařská kultura', 'Terst jako multikulturní hlavní město'],
      it: ['Vicino ad Austria e Slovenia', 'Alpi e mare Adriatico', 'Eccellente accessibilità dalla Repubblica Ceca', 'Prezzi più bassi del Veneto', 'Ricca cultura vinicola', 'Trieste come capitale multiculturale']
    },
    priceRange: '\u20AC50,000 - \u20AC500,000',
    bestFor: { en: 'Accessibility, year-round use, wine lovers', cs: 'Dostupnost, celoroční využití, milovníci vína', it: "Accessibilità, uso tutto l'anno, amanti del vino" },
    topCities: ['Trieste', 'Udine', 'Gorizia', 'Pordenone']
  },
  'puglia': {
    name: { en: 'Puglia', cs: 'Puglia (Apulie)', it: 'Puglia' },
    image: '/Puglia.webp',
    tagline: {
      en: 'Authentic southern Italy: sea, sun, and trulli houses',
      cs: 'Autentická jižní Itálie: moře, slunce a domy trulli',
      it: 'Autentica Italia meridionale: mare, sole e trulli'
    },
    description: {
      en: 'Puglia is the heel of Italy\'s boot, offering some of the country\'s most beautiful coastline, whitewashed villages, and authentic Italian culture. The region has become increasingly popular among foreign buyers seeking the genuine southern Italian lifestyle at still reasonable prices.',
      cs: 'Puglia je podpatek italské boty a nabízí jedny z nejkrásnějších pobřeží v zemi, bílé vesnice a autentickou italskou kulturu. Region je stále populárnější mezi zahraničními kupujícími, kteří hledají pravý jihoitalský životní styl za stále rozumné ceny.',
      it: "La Puglia è il tacco dello stivale italiano e offre alcune delle coste più belle del Paese, villaggi imbiancati e autentica cultura italiana. La regione è diventata sempre più popolare tra gli acquirenti stranieri che cercano l'autentico stile di vita del sud Italia a prezzi ancora ragionevoli."
    },
    highlights: {
      en: ['Beautiful Adriatic coastline', 'Authentic Italian culture', 'Trulli houses in Alberobello', 'Excellent cuisine', 'Warm climate year-round', 'Growing investment potential'],
      cs: ['Krásné jadranské pobřeží', 'Autentická italská kultura', 'Domy trulli v Alberobellu', 'Vynikající kuchyně', 'Teplé klima po celý rok', 'Rostoucí investiční potenciál'],
      it: ['Bellissima costa adriatica', 'Autentica cultura italiana', 'Trulli di Alberobello', 'Eccellente cucina', 'Clima caldo tutto l\'anno', 'Crescente potenziale di investimento']
    },
    priceRange: '\u20AC30,000 - \u20AC400,000',
    bestFor: { en: 'Sea, authentic Italy, affordable prices', cs: 'Moře, autentická Itálie, dostupné ceny', it: 'Mare, Italia autentica, prezzi accessibili' },
    topCities: ['Lecce', 'Bari', 'Ostuni', 'Alberobello', 'Polignano a Mare']
  },
  'calabria': {
    name: { en: 'Calabria', cs: 'Kalábrie', it: 'Calabria' },
    image: '/calabria.jpg',
    tagline: {
      en: 'Beautiful coastline and some of Italy\'s most attractive prices',
      cs: 'Krásné pobřeží a jedny z nejzajímavějších cen v Itálii',
      it: "Bellissima costa e alcuni dei prezzi più interessanti d'Italia"
    },
    description: {
      en: 'Calabria, the toe of Italy\'s boot, is known for its stunning Tyrrhenian and Ionian coastlines, dramatic mountain scenery, and remarkably affordable real estate. It\'s one of the regions where Czech buyers can find properties at very attractive prices while enjoying authentic southern Italian lifestyle.',
      cs: 'Kalábrie, špička italské boty, je známá svým úchvatným tyrhénským a jónským pobřežím, dramatickou horskou scenérií a překvapivě dostupnými nemovitostmi. Je to jeden z regionů, kde čeští kupující mohou najít nemovitostí za velmi zajímavé ceny a zároveň si užívat autentický jihoitalský životní styl.',
      it: 'La Calabria, la punta dello stivale italiano, è nota per le sue splendide coste tirreniche e ioniche, il paesaggio montano spettacolare e gli immobili sorprendentemente accessibili.'
    },
    highlights: {
      en: ['Very affordable prices', 'Beautiful coastline', 'Dramatic mountains', 'Authentic culture', 'Mild winters', 'Low cost of living'],
      cs: ['Velmi dostupné ceny', 'Krásné pobřeží', 'Dramatické hory', 'Autentická kultura', 'Mírné zimy', 'Nízké životní náklady'],
      it: ['Prezzi molto accessibili', 'Bellissima costa', 'Montagne spettacolari', 'Cultura autentica', 'Inverni miti', 'Basso costo della vita']
    },
    priceRange: '\u20AC20,000 - \u20AC250,000',
    bestFor: { en: 'Budget-friendly, coastline, quiet life', cs: 'Nízký rozpočet, pobřeží, klidný život', it: 'Economico, costa, vita tranquilla' },
    topCities: ['Tropea', 'Cosenza', 'Reggio Calabria', 'Catanzaro']
  },
  'sicilia': {
    name: { en: 'Sicily', cs: 'Sicílie', it: 'Sicilia' },
    image: '/Sicilia.jpg',
    tagline: {
      en: "Italy's largest island: wide selection and diverse locations",
      cs: 'Největší italský ostrov: široký výběr a rozmanité lokality',
      it: "La più grande isola d'Italia: ampia scelta e località diverse"
    },
    description: {
      en: "Sicily is a world of its own: Italy's largest island offers everything from ancient Greek temples to Baroque cities, volcanic landscapes, and pristine beaches. The property market is remarkably diverse, with options ranging from renovation projects to luxury coastal villas.",
      cs: 'Sicílie je svět sám pro sebe: největší italský ostrov nabízí vše od starověkých řeckých chrámů po barokní města, sopečnou krajinu a panenské pláže. Realitní trh je mimořádně rozmanitý, od projektů k rekonstrukci až po luxusní pobřežní vily.',
      it: "La Sicilia è un mondo a sé: la più grande isola d'Italia offre di tutto, dai templi greci antichi alle città barocche, dai paesaggi vulcanici alle spiagge incontaminate. Il mercato immobiliare è molto diversificato, dai progetti da ristrutturare alle ville costiere di lusso."
    },
    highlights: {
      en: ['Wide selection of properties', 'Rich history and culture', 'Affordable to luxury options', 'Beautiful beaches', 'Excellent food', 'Diverse landscapes'],
      cs: ['Široký výběr nemovitostí', 'Bohatá historie a kultura', 'Od dostupných po luxusní', 'Krásné pláže', 'Vynikající jídlo', 'Rozmanité krajiny'],
      it: ['Ampia scelta di immobili', 'Ricca storia e cultura', 'Da economiche a lussuose', 'Bellissime spiagge', 'Eccellente cibo', 'Paesaggi diversi']
    },
    priceRange: '\u20AC25,000 - \u20AC1,000,000',
    bestFor: { en: 'Diversity, culture, island lifestyle', cs: 'Rozmanitost, kultura, ostrovní životní styl', it: 'Diversità, cultura, stile di vita isolano' },
    topCities: ['Palermo', 'Catania', 'Taormina', 'Syracuse', 'Cefalù']
  },
  'toscana': {
    name: { en: 'Tuscany', cs: 'Toskánsko', it: 'Toscana' },
    image: '/Toscana.png',
    tagline: {
      en: 'Iconic landscapes, strong rental demand, historic cities and premium pricing - Tuscany is one of the most sought-after regions in Italy for international buyers.',
      cs: 'Ikonicka italska krajina - tradice, vinice a vyšší ceny',
      it: 'Paesaggi iconici, forte domanda di affitto, città storiche e prezzi premium: la Toscana è tra le regioni più richieste in Italia dagli acquirenti internazionali.'
    },
    description: {
      en: 'Tuscany is one of the most internationally recognized regions in Italy. For Czech buyers, it represents prestige, stability, and long-term value.\\n\\nThe region combines strong tourism demand, world-famous cultural heritage, and a solid rental market - especially in Florence and Chianti areas.\\n\\nHowever, Tuscany also comes with higher purchase prices and strong competition in prime locations. Proper due diligence, technical checks, and legal coordination are essential before making an offer.',
      cs: 'Toskánsko je pro mnoho zahranicnich kupujicich symbolem prestize, stability a dlouhodobe hodnoty. Region kombinuje silnou turistickou poptávku, kulturní dedictvi a solidni trh pronajmu, ale take vyšší ceny a silnou konkurenci v premium lokalitách.',
      it: 'La Toscana è una delle regioni italiane più riconoscibili a livello internazionale. Per gli acquirenti cechi rappresenta prestigio, stabilità e valore nel lungo termine. La regione combina una forte domanda turistica, patrimonio culturale e un mercato affitti solido, ma anche prezzi più alti e forte competizione nelle zone prime.'
    },
    highlights: {
      en: [
        'Global brand recognition',
        'Strong short-term rental potential',
        'Stable long-term property values',
        'High international liquidity',
        'Developed infrastructure',
        'Established expat communities'
      ],
      cs: ['Svetove jmeno regionů', 'Silný potencial kratkodobeho pronajmu', 'Stabilni dlouhodoba hodnota', 'Vysoka mezinárodní likvidita', 'Rozvinuta infrastruktura', 'Zavedene expat komunity'],
      it: ['Riconoscimento globale del brand', 'Forte potenziale di affitto breve', 'Valori immobiliari stabili nel lungo periodo', 'Alta liquidità internazionale', 'Infrastrutture sviluppate', 'Comunità expat consolidate']
    },
    priceRange: '\u20AC180,000 - \u20AC1,500,000',
    priceNotes: {
      en: [
        'Small apartment in secondary towns: from \u20AC150-200k',
        'Renovated farmhouse: \u20AC400k-1.5M',
        'Luxury villa with land: \u20AC2M+'
      ],
      cs: [
        'Mensi být v mensich městech: od \u20AC150-200k',
        'Zrekonstruovaný statek: \u20AC400k-1.5M',
        'Luxusni vila s pozemkem: \u20AC2M+'
      ],
      it: [
        'Piccolo appartamento in centri secondari: da \u20AC150-200k',
        'Casale ristrutturato: \u20AC400k-1.5M',
        'Villa di lusso con terreno: \u20AC2M+'
      ]
    },
    bestFor: { en: 'Prestige, wine, culture, rental income', cs: 'Prestiz, vino, kultura, prijem z pronajmu', it: 'Prestigio, vino, cultura, reddito da affitto' },
    bestForList: {
      en: ['Investment with short-term rentals', 'Prestige second home', 'Buyers seeking a stable market'],
      cs: ['Investice s krátkodobým pronájmem', 'Prestižní druhé bydlení', 'Kupující hledající stabilní trh'],
      it: ['Investimento con affitto breve', 'Seconda casa di prestigio', 'Chi vuole mercato stabile']
    },
    topCitiesDetailed: {
      en: [
        'Florence - Premium urban investment and strong tourist rental demand',
        'Siena - Historic charm and stable mid-range pricing',
        'Lucca - Elegant living with growing international demand',
        'Pisa - University city with mixed investment potential',
        'Arezzo - More affordable entry level options'
      ],
      cs: [
        'Florencie - Premium městská investice a silná turistická poptávka po pronajmu',
        'Siena - Historický charakter a stabilní střední cenová hladina',
        'Lucca - Elegantní život s rostoucí mezinárodní poptávkou',
        'Pisa - Univerzitní město se smíšeným investičním potenciálem',
        'Arezzo - Dostupnější vstupní cenové možnosti'
      ],
      it: [
        'Firenze - Investimento urbano premium e forte domanda di affitto turistico',
        'Siena - Fascino storico e prezzi medi stabili',
        'Lucca - Vita elegante con domanda internazionale in crescita',
        'Pisa - Città universitaria con potenziale di investimento misto',
        'Arezzo - Opzioni di ingresso più accessibili'
      ]
    },
    topCities: ['Florence', 'Siena', 'Lucca', 'Pisa', 'Arezzo']
  },
  'lombardia': {
    name: { en: 'Lombardy', cs: 'Lombardie', it: 'Lombardia' },
    image: '/Lombardia.jpg',
    tagline: {
      en: 'Milan, Lake Como, and strategic micro-markets for different buyer goals',
      cs: 'Milan, Lago di Como a strategicke mikro-lokality pro ruzne cile kupujicich',
      it: 'Milano, Lago di Como e micro-mercati strategici per obiettivi diversi'
    },
    description: {
      en: 'Lombardy is one of Italy’s most liquid and diverse markets. Milan drives urban demand, Lake Como attracts premium international buyers, and secondary cities such as Bergamo, Brescia and Monza offer more balanced entry points. The right strategy depends on whether the goal is personal use, rental income, relocation or long-term capital preservation.',
      cs: 'Lombardie patří k nejlikvidnějším a nejrozmanitějším trhům v Itálii. Milán táhne městskou poptávku, Lago di Como přitahuje prémiové zahraniční kupující a města jako Bergamo, Brescia nebo Monza nabízejí vyváženější vstupní úrovně. Správná strategie závisí na tom, zda jde o vlastní užívání, pronájem, přesun nebo dlouhodobé uchování hodnoty.',
      it: 'La Lombardia è uno dei mercati più liquidi e diversificati d’Italia. Milano guida la domanda urbana, il Lago di Como attira acquirenti internazionali premium e città come Bergamo, Brescia e Monza offrono punti di ingresso più equilibrati. La strategia corretta dipende dall’obiettivo: uso personale, reddito da locazione, trasferimento o conservazione del valore nel lungo periodo.'
    },
    highlights: {
      en: [
        'Milan city market',
        'Lake Como premium segment',
        'Strong rental and resale liquidity',
        'Diverse micro-zones'
      ],
      cs: [
        'Mestsky trh v Milane',
        'Premium segment Lago di Como',
        'Silná likvidita pronajmu i prodeje',
        'Ruznorode mikro-lokality'
      ],
      it: [
        'Mercato urbano di Milano',
        'Segmento premium Lago di Como',
        'Forte liquidità su affitto e rivendita',
        'Micro-zone molto diverse'
      ]
    },
    priceRange: '\u20AC180,000 - \u20AC2,500,000',
    priceNotes: {
      en: [
        'Milan city: often \u20AC350k-\u20AC1.5M+',
        'Lake Como: often above \u20AC1M',
        'Luxury properties: \u20AC2M-\u20AC5M+'
      ],
      cs: [
        'Mesto Milan: casto \u20AC350k-\u20AC1.5M+',
        'Lago di Como: bezne nad \u20AC1M',
        'Luxusni nemovitostí: \u20AC2M-\u20AC5M+'
      ],
      it: [
        'Milano città: spesso 350k-1.5M+',
        'Lago di Como: facilmente oltre 1M',
        'Immobili luxury: 2-5M+'
      ]
    },
    bestFor: {
      en: 'Urban market, premium lakeside, strong liquidity',
      cs: 'Mestsky trh, premium jezero, silná likvidita',
      it: 'Mercato urbano, lago premium, forte liquidità'
    },
    bestForList: {
      en: [
        'Buyers targeting Milan city',
        'Premium second-home buyers',
        'Investors needing liquid markets'
      ],
      cs: [
        'Kupující mirici na Milan',
        'Kupující premium druhého bydlení',
        'Investoři hledající likvidni trhy'
      ],
      it: [
        'Chi punta su Milano città',
        'Acquirenti di seconde case premium',
        'Investitori che cercano mercati liquidi'
      ]
    },
    topCitiesDetailed: {
      en: [
        'Milan - broad range from core urban apartments to premium neighborhoods',
        'Como and lake area - highly competitive premium demand',
        'Bergamo - strong value/quality profile',
        'Brescia - larger stock and mixed price points',
        'Monza - strategic location near Milan'
      ],
      cs: [
        'Milan - siroka nabídka od městských bytu po premium ctvrt',
        'Como a jezerni oblast - vysoce konkurencni premium poptávka',
        'Bergamo - silný poměr hodnoty a kvality',
        'Brescia - velka nabídka a smíšený cenovy profil',
        'Monza - strategicka poloha blizko Milana'
      ],
      it: [
        'Milano - ampia gamma da appartamenti urbani a quartieri premium',
        'Como e area lago - domanda premium molto competitiva',
        'Bergamo - profilo forte tra valore e qualità',
        'Brescia - stock ampio e prezzi eterogenei',
        'Monza - posizione strategica vicino a Milano'
      ]
    },
    topCities: ['Milan', 'Como', 'Bergamo', 'Brescia', 'Monza']
  },
  'liguria': {
    name: { en: 'Liguria', cs: 'Ligurie', it: 'Liguria' },
    image: '/Liguria.webp',
    tagline: {
      en: 'Italian Riviera A aas coastline and proximity to France',
      cs: 'Italská riviéra, pobřeží a blízkost Francie',
      it: 'Riviera italiana A aas costa e vicinanza alla Francia'
    },
    description: {
      en: 'Liguria is home to the famous Italian Riviera, Cinque Terre, and elegant coastal towns like Portofino and Sanremo. The narrow strip of coastline backed by mountains offers a unique microclimate and stunning scenery. Properties here tend to be compact but with exceptional views.',
      cs: 'Ligurie je domovem slavné italské riviéry, Cinque Terre a elegantních pobřežních měst jako Portofino a Sanremo. Úzký pás pobřeží pod horami nabízí jedinečné mikroklima a působivou scenérii. Nemovitosti zde bývají kompaktní, ale často s výjimečnými výhledy.',
      it: 'La Liguria ospita la famosa Riviera italiana, le Cinque Terre e le eleganti città costiere come Portofino e Sanremo. La stretta striscia di costa sostenuta dalle montagne offre un microclima unico e un paesaggio mozzafiato.'
    },
    highlights: {
      en: ['Italian Riviera', 'Cinque Terre', 'Mild Mediterranean climate', 'Close to France', 'Portofino and Sanremo', 'Excellent seafood'],
      cs: ['Italská riviéra', 'Cinque Terre', 'Mírné středomořské klima', 'Blízkost Francie', 'Portofino a Sanremo', 'Vynikající mořské plody'],
      it: ['Riviera italiana', 'Cinque Terre', 'Clima mediterraneo mite', 'Vicino alla Francia', 'Portofino e Sanremo', 'Eccellenti frutti di mare']
    },
    priceRange: '\u20AC100,000 - \u20AC3,000,000',
    bestFor: { en: 'Coastal lifestyle, mild climate, France access', cs: 'Pobřežní životní styl, mírné klima, blízkost Francie', it: 'Stile di vita costiero, clima mite, accesso alla Francia' },
    topCities: ['Genoa', 'Sanremo', 'Portofino', 'La Spezia']
  },
  'lago-di-garda': {
    name: { en: 'Lake Garda Area', cs: 'Lago di Garda', it: 'Lago di Garda' },
    image: '/Veneto.webp',
    tagline: {
      en: 'Great accessibility from CZ and high demand',
      cs: 'Dobrá dostupnost z ČR a vysoká poptávka',
      it: 'Ottima accessibilità dalla Repubblica Ceca e alta domanda'
    },
    description: {
      en: 'Lake Garda, Italy\'s largest lake, spans three regions (Veneto, Lombardy, Trentino) and is one of the most sought-after areas for Czech buyers. Its proximity to the Czech Republic (6-7 hours by car), stunning lake scenery, and year-round usability make it a perennial favorite.',
      cs: 'Lago di Garda, největší italské jezero, se rozprostírá přes tři regiony (Veneto, Lombardie, Trentino) a patří mezi nejvyhledávanější oblastí pro české kupující. Blízkost České republiky (6-7 hodin autem), působivá jezerní scenérie a celoroční využitelnost z něj dělají trvalého favorita.',
      it: "Il Lago di Garda, il più grande lago italiano, si estende su tre regioni (Veneto, Lombardia, Trentino) ed è una delle aree più ricercate dagli acquirenti cechi. La vicinanza alla Repubblica Ceca (6-7 ore in auto) e l'utilizzabilità tutto l'anno lo rendono una scelta sempre forte."
    },
    highlights: {
      en: ['6-7 hours from Czech Republic', 'Year-round usability', 'Water sports and outdoor activities', 'Mild microclimate', 'Strong property market', 'Excellent infrastructure'],
      cs: ['6-7 hodin z České republiky', 'Celoroční využitelnost', 'Vodní sporty a outdoorové aktivity', 'Mírné mikroklima', 'Silný realitní trh', 'Výborná infrastruktura'],
      it: ['6-7 ore dalla Repubblica Ceca', "Utilizzabile tutto l'anno", "Sport acquatici e attività all'aperto", 'Microclima mite', 'Forte mercato immobiliare', 'Eccellente infrastruttura']
    },
    priceRange: '\u20AC150,000 - \u20AC2,000,000',
    bestFor: { en: 'Accessibility, lake lifestyle, year-round use', cs: 'Dostupnost, jezerní životní styl, celoroční využití', it: "Accessibilità, stile di vita lacustre, uso tutto l'anno" },
    topCities: ['Desenzano', 'Sirmione', 'Malcesine', 'Riva del Garda', 'Bardolino']
  },
  'alpy': {
    name: { en: 'Italian Alps / Northern Italy', cs: 'Alpy / sever ItAElie', it: 'Alpi / Nord Italia' },
    image: '/Trentino-Alto Adige.jpg',
    tagline: {
      en: 'Year-round use A aas mountains, skiing, and hiking',
      cs: 'Celoroční využití: hory, lyžování a turistika',
      it: 'Uso tutto l\'anno A aas montagna, sci ed escursionismo'
    },
    description: {
      en: 'The Italian Alps, primarily in Trentino-Alto Adige and Valle d\'Aosta, offer Czech buyers a familiar mountain environment with Italian flair. These regions are ideal for those seeking year-round usability A aas skiing in winter, hiking in summer A aas combined with excellent food, wine, and a high quality of life.',
      cs: "Italské Alpy, zejména Trentino-Alto Adige a Valle d'Aosta, nabízejí českým kupujícím známé horské prostředí s italským charakterem. Tyto regiony jsou ideální pro ty, kteří hledají celoroční využitelnost: lyžování v zimě, turistiku v létě a k tomu výborné jídlo, víno a vysokou kvalitu života.",
      it: 'Le Alpi italiane, principalmente in Trentino-Alto Adige e Valle d\'Aosta, offrono agli acquirenti cechi un ambiente montano familiare con un tocco italiano. Queste regioni sono ideali per chi cerca un utilizzo tutto l\'anno.'
    },
    highlights: {
      en: ['Skiing and winter sports', 'Summer hiking trails', 'Year-round usability', 'High quality of life', 'Alpine cuisine', 'Austrian/German influence'],
      cs: ['Lyžování a zimní sporty', 'Letní turistické trasy', 'Celoroční využitelnost', 'Vysoká kvalita života', 'Alpská kuchyně', 'Rakouský a německý vliv'],
      it: ['Sci e sport invernali', 'Sentieri escursionistici estivi', "Utilizzabilità tutto l'anno", 'Alta qualità della vita', 'Cucina alpina', 'Influenza austriaca/tedesca']
    },
    priceRange: '\u20AC100,000 - \u20AC1,500,000',
    bestFor: { en: 'Mountains, skiing, year-round activities', cs: 'Hory, lyžování, celoroční aktivity', it: "Montagna, sci, attività tutto l'anno" },
    topCities: ['Bolzano', 'Trento', 'Merano', 'Courmayeur', 'Cortina d\'Ampezzo']
  },
  'abruzzo': {
    name: { en: 'Abruzzo', cs: 'Abruzzo', it: 'Abruzzo' },
    image: '/abruzzo.jpg',
    tagline: {
      en: 'Mountains, nature, tranquility, and affordable prices',
      cs: 'Hory, příroda, klid a dostupné ceny',
      it: 'Montagne, natura, tranquillità e prezzi accessibili'
    },
    description: {
      en: 'Abruzzo is often called the "greenest region in Europe" thanks to its national parks covering nearly a third of its territory. It combines dramatic mountain scenery with Adriatic coastline and offers some of the most affordable property prices in central Italy.',
      cs: 'Abruzzo je často nazýváno nejzelenějším regionem Evropy díky národním parkům, které pokrývají téměř třetinu jeho území. Kombinuje dramatickou horskou scenérii s jadranským pobřežím a nabízí jedny z nejdostupnějších cen nemovitostí ve střední Itálii.',
      it: 'L\'Abruzzo è spesso chiamato la "regione più verde d\'Europa" grazie ai parchi nazionali che coprono quasi un terzo del suo territorio.'
    },
    highlights: {
      en: ['National parks', 'Affordable prices', 'Mountains and sea', 'Quiet lifestyle', 'Good food traditions', 'Growing expat community'],
      cs: ['Národní parky', 'Dostupné ceny', 'Hory i moře', 'Klidný životní styl', 'Dobrá kulinářská tradice', 'Rostoucí komunita expatů'],
      it: ['Parchi nazionali', 'Prezzi accessibili', 'Montagne e mare', 'Stile di vita tranquillo', 'Buone tradizioni culinarie', 'Comunità di espatriati in crescita']
    },
    priceRange: '\u20AC25,000 - \u20AC300,000',
    bestFor: { en: 'Nature, quiet, budget-friendly', cs: 'Příroda, klid, nízký rozpočet', it: 'Natura, tranquillità, economico' },
    topCities: ['L\'Aquila', 'Pescara', 'Chieti', 'Teramo']
  },
  'umbria': {
    name: { en: 'Umbria', cs: 'Umbrie', it: 'Umbria' },
    image: '/Umbria.webp',
    tagline: {
      en: 'The green heart of Italy A aas history, countryside, rural life',
      cs: 'Zelené srdce Itálie: historie, venkov a klidný život',
      it: 'Il cuore verde d\'Italia A aas storia, campagna, vita rurale'
    },
    description: {
      en: 'Umbria is often called "the green heart of Italy" and offers a quieter, more affordable alternative to neighboring Tuscany. The region features medieval hilltop towns, rolling countryside, and a deeply rooted rural culture. It\'s perfect for those seeking authentic Italian country life.',
      cs: 'Umbrie je často nazývána zeleným srdcem Itálie a nabízí klidnější a cenově dostupnější alternativu sousedního Toskánska. Region se vyznačuje středověkými městečky na kopcích, zvlněnou krajinou a hluboce zakořeněnou venkovskou kulturou. Je ideální pro ty, kteří hledají autentický italský venkovský život.',
      it: 'L\'Umbria è spesso chiamata "il cuore verde d\'Italia" e offre un\'alternativa più tranquilla e accessibile alla vicina Toscana.'
    },
    highlights: {
      en: ['Quieter than Tuscany', 'Medieval hilltop towns', 'Rolling countryside', 'Excellent food and wine', 'Lower prices', 'Authentic rural culture'],
      cs: ['Klidnější než Toskánsko', 'Středověká městečka na kopcích', 'Zvlněná krajina', 'Vynikající jídlo a víno', 'Nižší ceny', 'Autentická venkovská kultura'],
      it: ['Più tranquilla della Toscana', 'Borghi medievali', 'Campagna ondulata', 'Eccellente cibo e vino', 'Prezzi più bassi', 'Autentica cultura rurale']
    },
    priceRange: '\u20AC60,000 - \u20AC800,000',
    bestFor: { en: 'Countryside, history, Tuscany alternative', cs: 'Venkov, historie, alternativa k ToskAEnsku', it: 'Campagna, storia, alternativa alla Toscana' },
    topCities: ['Perugia', 'Assisi', 'Orvieto', 'Spoleto', 'Todi']
  },
  'sardegna': {
    name: { en: 'Sardinia', cs: 'Sardinie', it: 'Sardegna' },
    image: '/Sardegna.jpg',
    tagline: {
      en: 'Sea, nature, and exclusive locations',
      cs: 'Moře, příroda a exkluzivní lokality',
      it: 'Mare, natura e località esclusive'
    },
    description: {
      en: 'Sardinia is an island of stunning contrasts A aas from the ultra-exclusive Costa Smeralda to remote, affordable inland villages. The island offers some of the most beautiful beaches in the Mediterranean, unique Nuragic archaeological sites, and a distinct culture that sets it apart from mainland Italy.',
      cs: 'Sardinie je ostrov úchvatných kontrastů: od ultraexkluzivní Costa Smeralda po odlehlé a cenově dostupnější vnitrozemské vesnice. Ostrov nabízí jedny z nejkrásnějších pláží ve Středomoří, jedinečné nuragské archeologické lokality a svébytnou kulturu, která ho odlišuje od pevninské Itálie.',
      it: "La Sardegna è un'isola di contrasti mozzafiato: dall'ultraesclusiva Costa Smeralda ai remoti villaggi dell'entroterra. L'isola offre alcune delle spiagge più belle del Mediterraneo."
    },
    highlights: {
      en: ['Stunning beaches', 'Costa Smeralda luxury', 'Unique culture', 'Archaeological sites', 'Clear turquoise water', 'Excellent diving'],
      cs: ['Spiagge mozzafiato', 'Lusso della Costa Smeralda', 'Cultura unica', 'Siti archeologici', 'Acqua turchese cristallina', 'Ottime immersioni'],
      it: ['Spiagge mozzafiato', 'Lusso Costa Smeralda', 'Cultura unica', 'Siti archeologici', 'Acqua turchese cristallina', 'Eccellenti immersioni']
    },
    priceRange: '\u20AC50,000 - \u20AC5,000,000',
    bestFor: { en: 'Beach, exclusivity, nature', cs: 'Pláže, exkluzivita, příroda', it: 'Spiaggia, esclusività, natura' },
    topCities: ['Cagliari', 'Olbia', 'Alghero', 'Porto Cervo', 'Sassari']
  }
}

const CLEAN_REGION_PAGE_DATA = {
  'friuli-venezia-giulia': {
    name: { en: 'Friuli Venezia Giulia', cs: 'Friuli Venezia Giulia', it: 'Friuli Venezia Giulia' },
    image: '/Friuli-Venezia Giulia.avif',
    tagline: {
      en: 'Where the Alps meet the Adriatic, close to Austria and Slovenia',
      cs: 'Kde se Alpy setkávají s Jadranem, blízko Rakouska a Slovinska',
      it: "Dove le Alpi incontrano l'Adriatico, vicino ad Austria e Slovenia"
    },
    description: {
      en: 'Friuli Venezia Giulia is one of the most attractive regions for Czech buyers thanks to its excellent accessibility from the Czech Republic. It combines alpine landscapes, Adriatic coastline, and a rich cultural heritage shaped by Austrian, Slovenian, and Italian influences.',
      cs: 'Friuli Venezia Giulia patří mezi velmi atraktivní volby pro české kupující díky výborné dostupnosti z České republiky. Region spojuje alpskou krajinu, jadranské pobřeží a bohaté kulturní dědictví ovlivněné rakouskou, slovinskou a italskou tradicí.',
      it: 'Il Friuli Venezia Giulia è una delle scelte più interessanti per gli acquirenti cechi grazie alla sua ottima accessibilità dalla Repubblica Ceca. La regione unisce paesaggi alpini, costa adriatica e un ricco patrimonio culturale influenzato da tradizioni austriache, slovene e italiane.'
    },
    highlights: {
      en: ['Close to Austria and Slovenia', 'Alps and Adriatic Sea', 'Excellent accessibility from CZ', 'Lower prices than Veneto', 'Strong wine culture', 'Trieste as a multicultural capital'],
      cs: ['Blízkost Rakouska a Slovinska', 'Alpy a Jaderské moře', 'Výborná dostupnost z ČR', 'Nižší ceny než ve Venetu', 'Silná vinařská kultura', 'Terst jako multikulturní metropole'],
      it: ['Vicino ad Austria e Slovenia', 'Alpi e mare Adriatico', 'Ottima accessibilità dalla CZ', 'Prezzi più bassi del Veneto', 'Forte cultura del vino', 'Trieste come capitale multiculturale']
    },
    priceRange: '€50,000 - €500,000',
    bestFor: {
      en: 'Accessibility, year-round use, wine lovers',
      cs: 'Dostupnost, využití tutto l’anno, milovníci vína',
      it: "Accessibilità, uso tutto l'anno, amanti del vino"
    },
    topCities: ['Trieste', 'Udine', 'Gorizia', 'Pordenone']
  },
  puglia: {
    name: { en: 'Puglia', cs: 'Puglia (Apulie)', it: 'Puglia' },
    image: '/Puglia.webp',
    tagline: {
      en: 'Authentic southern Italy with sea, sun, and trulli houses',
      cs: 'Autentická jižní Itálie s mořem, sluncem a domy trulli',
      it: 'Autentica Italia meridionale con mare, sole e trulli'
    },
    description: {
      en: "Puglia is the heel of Italy's boot and offers some of the country's most beautiful coastline, whitewashed villages, and authentic Italian culture. It has become increasingly popular with foreign buyers seeking genuine southern Italian lifestyle at still-reasonable prices.",
      cs: 'Puglia je podpatek italské boty a nabízí některé z nejkrásnějších pobřežních scenérií v zemi, bílé vesnice a autentickou italskou kulturu. Region je stále populárnější mezi zahraničními kupujícími, kteří hledají opravdový jih Itálie za dosud rozumné ceny.',
      it: "La Puglia è il tacco dello stivale italiano e offre alcune delle coste più belle del Paese, borghi imbiancati e autentica cultura italiana. La regione è sempre più apprezzata dagli acquirenti stranieri che cercano il vero stile di vita del Sud Italia a prezzi ancora ragionevoli."
    },
    highlights: {
      en: ['Beautiful Adriatic coastline', 'Authentic Italian culture', 'Trulli houses in Alberobello', 'Excellent cuisine', 'Warm climate year-round', 'Growing investment potential'],
      cs: ['Krásné jadranské pobřeží', 'Autentická italská kultura', 'Domy trulli v Alberobellu', 'Vynikající kuchyně', 'Teplé klima po celý rok', 'Rostoucí investiční potenciál'],
      it: ['Bellissima costa adriatica', 'Autentica cultura italiana', 'Trulli di Alberobello', 'Eccellente cucina', 'Clima caldo tutto l’anno', 'Crescente potenziale di investimento']
    },
    priceRange: '€30,000 - €400,000',
    bestFor: { en: 'Sea, authentic Italy, affordable prices', cs: 'Moře, autentická Itálie, dostupné ceny', it: 'Mare, Italia autentica, prezzi accessibili' },
    topCities: ['Lecce', 'Bari', 'Ostuni', 'Alberobello', 'Polignano a Mare']
  },
  calabria: {
    name: { en: 'Calabria', cs: 'Kalábrie', it: 'Calabria' },
    image: '/calabria.jpg',
    tagline: {
      en: "Beautiful coastline and some of Italy's most attractive prices",
      cs: 'Krásné pobřeží a jedny z nejzajímavějších cen v Itálii',
      it: "Bellissima costa e alcuni dei prezzi più interessanti d'Italia"
    },
    description: {
      en: "Calabria, the toe of Italy's boot, is known for its stunning Tyrrhenian and Ionian coastlines, dramatic mountain scenery, and remarkably affordable property market. It is one of the regions where Czech buyers can still find highly attractive prices while enjoying authentic southern Italian lifestyle.",
      cs: 'Kalábrie, špička italské boty, je známá nádherným tyrhénským i jónským pobřežím, dramatickou horskou krajinou a velmi dostupným realitním trhem. Patří mezi regiony, kde čeští kupující stále najdou zajímavé ceny a autentický životní styl jihu Itálie.',
      it: 'La Calabria, la punta dello stivale italiano, è nota per le sue splendide coste tirreniche e ioniche, per il paesaggio montano spettacolare e per un mercato immobiliare ancora sorprendentemente accessibile.'
    },
    highlights: {
      en: ['Very affordable prices', 'Beautiful coastline', 'Dramatic mountains', 'Authentic culture', 'Mild winters', 'Low cost of living'],
      cs: ['Velmi dostupné ceny', 'Krásné pobřeží', 'Dramatické hory', 'Autentická kultura', 'Mírné zimy', 'Nízké životní náklady'],
      it: ['Prezzi molto accessibili', 'Bellissima costa', 'Montagne spettacolari', 'Cultura autentica', 'Inverni miti', 'Basso costo della vita']
    },
    priceRange: '€20,000 - €250,000',
    bestFor: { en: 'Budget-friendly, coastline, quiet life', cs: 'Nízký rozpočet, pobřeží, klidný život', it: 'Economico, costa, vita tranquilla' },
    topCities: ['Tropea', 'Cosenza', 'Reggio Calabria', 'Catanzaro']
  },
  sicilia: {
    name: { en: 'Sicily', cs: 'Sicílie', it: 'Sicilia' },
    image: '/Sicilia.jpg',
    tagline: {
      en: "Italy's largest island with wide choice and diverse locations",
      cs: 'Největší italský ostrov se širokým výběrem a různorodými lokalitami',
      it: "La più grande isola d'Italia con ampia scelta e località diverse"
    },
    description: {
      en: "Sicily is a world of its own: Italy's largest island offers everything from ancient Greek temples to Baroque towns, from volcanic landscapes to pristine beaches. The property market is highly diversified, from renovation projects to luxury coastal villas.",
      cs: 'Sicílie je svět sama pro sebe. Největší italský ostrov nabízí vše od antických řeckých chrámů po barokní města, od vulkanické krajiny po nedotčené pláže. Trh s nemovitostmi je mimořádně pestrý, od rekonstrukčních projektů až po luxusní pobřežní vily.',
      it: "La Sicilia è un mondo a sé: la più grande isola d'Italia offre di tutto, dai templi greci antichi alle città barocche, dai paesaggi vulcanici alle spiagge incontaminate. Il mercato immobiliare è molto vario, dai progetti da ristrutturare alle ville di lusso sul mare."
    },
    highlights: {
      en: ['Wide selection of properties', 'Rich history and culture', 'Affordable to luxury options', 'Beautiful beaches', 'Excellent food', 'Diverse landscapes'],
      cs: ['Široký výběr nemovitostí', 'Bohatá historie a kultura', 'Od dostupných po luxusní varianty', 'Krásné pláže', 'Výborné jídlo', 'Rozmanitá krajina'],
      it: ['Ampia scelta di immobili', 'Ricca storia e cultura', 'Dalle opzioni accessibili al lusso', 'Bellissime spiagge', 'Eccellente cucina', 'Paesaggi molto diversi']
    },
    priceRange: '€25,000 - €1,000,000',
    bestFor: { en: 'Diversity, culture, island lifestyle', cs: 'Rozmanitost, kultura, ostrovní životní styl', it: 'Diversità, cultura, stile di vita isolano' },
    topCities: ['Palermo', 'Catania', 'Taormina', 'Syracuse', 'Cefalù']
  },
  liguria: {
    name: { en: 'Liguria', cs: 'Ligurie', it: 'Liguria' },
    image: '/Liguria.webp',
    tagline: {
      en: 'Italian Riviera, coastline, and proximity to France',
      cs: 'Italská riviéra, pobřeží a blízkost Francie',
      it: 'Riviera italiana, costa e vicinanza alla Francia'
    },
    description: {
      en: 'Liguria is home to the famous Italian Riviera, Cinque Terre, and elegant coastal towns such as Portofino and Sanremo. The narrow coastal strip backed by mountains creates a unique microclimate and spectacular scenery. Properties are often compact, but with exceptional views.',
      cs: 'Ligurie je domovem slavné Italské riviéry, Cinque Terre a elegantních pobřežních měst jako Portofino a Sanremo. Úzký pobřežní pás opřený o hory vytváří jedinečné mikroklima a působivou scenérii. Nemovitosti zde bývají kompaktnější, ale často s výjimečnými výhledy.',
      it: 'La Liguria ospita la celebre Riviera italiana, le Cinque Terre e le eleganti località costiere come Portofino e Sanremo. La stretta fascia di costa sostenuta dalle montagne crea un microclima unico e uno scenario mozzafiato. Gli immobili sono spesso compatti, ma con viste eccellenti.'
    },
    highlights: {
      en: ['Italian Riviera', 'Cinque Terre', 'Mild Mediterranean climate', 'Close to France', 'Portofino and Sanremo', 'Excellent seafood'],
      cs: ['Italská riviéra', 'Cinque Terre', 'Mírné středomořské klima', 'Blízkost Francie', 'Portofino a Sanremo', 'Vynikající mořské plody'],
      it: ['Riviera italiana', 'Cinque Terre', 'Clima mediterraneo mite', 'Vicino alla Francia', 'Portofino e Sanremo', 'Eccellenti frutti di mare']
    },
    priceRange: '€100,000 - €3,000,000',
    bestFor: { en: 'Coastal lifestyle, mild climate, France access', cs: 'Pobřežní životní styl, mírné klima, blízkost Francie', it: 'Stile di vita costiero, clima mite, accesso alla Francia' },
    topCities: ['Genoa', 'Sanremo', 'Portofino', 'La Spezia']
  },
  'lago-di-garda': {
    name: { en: 'Lake Garda Area', cs: 'Oblast Lago di Garda', it: 'Area Lago di Garda' },
    image: '/Veneto.webp',
    tagline: {
      en: 'Great accessibility from CZ and strong demand',
      cs: 'Výborná dostupnost z ČR a silná poptávka',
      it: 'Ottima accessibilità dalla CZ e domanda forte'
    },
    description: {
      en: "Lake Garda, Italy's largest lake, spans three regions and remains one of the most popular areas for Czech buyers. Its proximity to the Czech Republic, strong infrastructure, and year-round usability make it a long-term favorite.",
      cs: 'Lago di Garda, největší italské jezero, zasahuje do tří regionů a patří mezi nejoblíbenější oblastí pro české kupující. Blízkost České republiky, dobrá infrastruktura a využitelnost po celý rok z něj dělají dlouhodobě silnou volbu.',
      it: "Il Lago di Garda, il più grande lago italiano, si estende su tre regioni ed è una delle aree più apprezzate dagli acquirenti cechi. La vicinanza alla Repubblica Ceca, la buona infrastruttura e l'utilizzo durante tutto l'anno lo rendono una scelta molto solida."
    },
    highlights: {
      en: ['6-7 hours from Czech Republic', 'Year-round usability', 'Water sports and outdoor activities', 'Mild microclimate', 'Strong property market', 'Excellent infrastructure'],
      cs: ['6-7 hodin z České republiky', 'Využitelnost po celý rok', 'Vodní sporty a outdoorové aktivity', 'Mírné mikroklima', 'Silný trh s nemovitostmi', 'Výborná infrastruktura'],
      it: ['6-7 ore dalla Repubblica Ceca', "Utilizzo tutto l'anno", "Sport acquatici e attività outdoor", 'Microclima mite', 'Mercato immobiliare forte', 'Ottima infrastruttura']
    },
    priceRange: '€150,000 - €2,000,000',
    bestFor: { en: 'Accessibility, lake lifestyle, year-round use', cs: 'Dostupnost, jezerní životní styl, celoroční využití', it: 'Accessibilità, stile di vita sul lago, uso tutto l’anno' },
    topCities: ['Desenzano', 'Sirmione', 'Malcesine', 'Riva del Garda', 'Bardolino']
  },
  alpy: {
    name: { en: 'Italian Alps / Northern Italy', cs: 'Italské Alpy / sever Itálie', it: 'Alpi italiane / Nord Italia' },
    image: '/Trentino-Alto Adige.jpg',
    tagline: {
      en: 'Year-round use with mountains, skiing, and hiking',
      cs: 'Celoroční využití s horami, lyžováním a turistikou',
      it: 'Uso tutto l’anno tra montagna, sci ed escursionismo'
    },
    description: {
      en: "The Italian Alps, especially in Trentino-Alto Adige and Valle d'Aosta, offer Czech buyers a familiar mountain environment with Italian character. These areas are ideal for those seeking skiing in winter, hiking in summer, and strong year-round usability.",
      cs: "Italské Alpy, zejména v Trentino-Alto Adige a Valle d'Aosta, nabízejí českým kupujícím známé horské prostředí s italským charakterem. Jsou ideální pro ty, kteří chtějí lyžování v zimě, turistiku v létě a dobrou využitelnost po celý rok.",
      it: "Le Alpi italiane, soprattutto in Trentino-Alto Adige e Valle d'Aosta, offrono agli acquirenti cechi un ambiente montano familiare con carattere italiano. Sono ideali per chi cerca sci in inverno, escursionismo in estate e utilizzo durante tutto l'anno."
    },
    highlights: {
      en: ['Skiing and winter sports', 'Summer hiking trails', 'Year-round usability', 'High quality of life', 'Alpine cuisine', 'Austrian and German influence'],
      cs: ['Lyžování a zimní sporty', 'Letní turistické trasy', 'Celoroční využitelnost', 'Vysoká kvalita života', 'Alpská kuchyně', 'Rakouský a německý vliv'],
      it: ['Sci e sport invernali', 'Sentieri estivi', 'Utilizzo tutto l’anno', 'Alta qualità della vita', 'Cucina alpina', 'Influenza austriaca e tedesca']
    },
    priceRange: '€100,000 - €1,500,000',
    bestFor: { en: 'Mountains, skiing, year-round activities', cs: 'Hory, lyžování, aktivity po celý rok', it: 'Montagna, sci, attività tutto l’anno' },
    topCities: ['Bolzano', 'Trento', 'Merano', 'Courmayeur', "Cortina d'Ampezzo"]
  },
  abruzzo: {
    name: { en: 'Abruzzo', cs: 'Abruzzo', it: 'Abruzzo' },
    image: '/abruzzo.jpg',
    tagline: {
      en: 'Mountains, nature, tranquility, and affordable prices',
      cs: 'Hory, příroda, klid a dostupné ceny',
      it: 'Montagne, natura, tranquillità e prezzi accessibili'
    },
    description: {
      en: 'Abruzzo is often called the greenest region in Europe thanks to its national parks covering a large share of the territory. It combines mountain scenery with Adriatic coastline and offers some of the most affordable property prices in central Italy.',
      cs: 'Abruzzo bývá označováno za nejzelenější region Evropy díky rozsáhlým národním parkům. Kombinuje horskou scenérii s jadranským pobřežím a nabízí jedny z nejdostupnějších cen nemovitostí ve střední Itálii.',
      it: "L'Abruzzo viene spesso definito la regione più verde d'Europa grazie ai parchi nazionali che coprono gran parte del territorio. Unisce paesaggi montani e costa adriatica, con prezzi immobiliari tra i più accessibili del Centro Italia."
    },
    highlights: {
      en: ['National parks', 'Affordable prices', 'Mountains and sea', 'Quiet lifestyle', 'Good food traditions', 'Growing expat community'],
      cs: ['Národní parky', 'Dostupné ceny', 'Hory a moře', 'Klidný životní styl', 'Silná gastronomická tradice', 'Rostoucí komunita expatů'],
      it: ['Parchi nazionali', 'Prezzi accessibili', 'Montagne e mare', 'Stile di vita tranquillo', 'Ottima tradizione gastronomica', 'Crescente comunità di expat']
    },
    priceRange: '€25,000 - €300,000',
    bestFor: { en: 'Nature, quiet, budget-friendly', cs: 'Příroda, klid, nízký rozpočet', it: 'Natura, tranquillità, budget accessibile' },
    topCities: ["L'Aquila", 'Pescara', 'Chieti', 'Teramo']
  },
  umbria: {
    name: { en: 'Umbria', cs: 'Umbrie', it: 'Umbria' },
    image: '/Umbria.webp',
    tagline: {
      en: 'The green heart of Italy with history, countryside, and rural life',
      cs: 'Zelené srdce Itálie s historií, venkovem a rurálním životem',
      it: "Il cuore verde d'Italia tra storia, campagna e vita rurale"
    },
    description: {
      en: 'Umbria is often called the green heart of Italy and offers a quieter, more affordable alternative to Tuscany. The region is known for medieval hill towns, rolling countryside, and deeply rooted rural culture.',
      cs: 'Umbrie bývá označována za zelené srdce Itálie a představuje klidnější a dostupnější alternativu k Toskánsku. Region je známý středověkými městy na kopcích, zvlněnou krajinou a silnou venkovskou kulturou.',
      it: "L'Umbria è spesso chiamata il cuore verde d'Italia e rappresenta un'alternativa più tranquilla e accessibile alla Toscana. La regione è nota per i borghi medievali, la campagna ondulata e una cultura rurale molto autentica."
    },
    highlights: {
      en: ['Quieter than Tuscany', 'Medieval hill towns', 'Rolling countryside', 'Excellent food and wine', 'Lower prices', 'Authentic rural culture'],
      cs: ['Klidnější než Toskánsko', 'Středověká města na kopcích', 'Zvlněná krajina', 'Výborné jídlo a víno', 'Nižší ceny', 'Autentická venkovská kultura'],
      it: ['Più tranquilla della Toscana', 'Borghi medievali', 'Campagna ondulata', 'Ottimo cibo e vino', 'Prezzi più bassi', 'Autentica cultura rurale']
    },
    priceRange: '€60,000 - €800,000',
    bestFor: { en: 'Countryside, history, Tuscany alternative', cs: 'Venkov, historie, alternativa k Toskánsku', it: 'Campagna, storia, alternativa alla Toscana' },
    topCities: ['Perugia', 'Assisi', 'Orvieto', 'Spoleto', 'Todi']
  },
  sardegna: {
    name: { en: 'Sardinia', cs: 'Sardinie', it: 'Sardegna' },
    image: '/Sardegna.jpg',
    tagline: {
      en: 'Sea, nature, and exclusive locations',
      cs: 'Moře, příroda a exkluzivní lokality',
      it: 'Mare, natura e località esclusive'
    },
    description: {
      en: 'Sardinia is an island of strong contrasts, from ultra-exclusive Costa Smeralda to remote inland villages with more accessible pricing. It offers some of the most beautiful beaches in the Mediterranean, unique archaeological heritage, and a distinct local culture.',
      cs: 'Sardinie je ostrov kontrastů, od ultra-exkluzivní Costa Smeralda po odlehlé vnitrozemské vesnice s dostupnějšími cenami. Nabízí jedny z nejkrásnějších pláží ve Středomoří, jedinečné archeologické dědictví a výraznou místní kulturu.',
      it: 'La Sardegna è un’isola di forti contrasti, dall’ultra esclusiva Costa Smeralda ai borghi interni più remoti e accessibili. Offre alcune delle spiagge più belle del Mediterraneo, un patrimonio archeologico unico e una cultura locale molto distinta.'
    },
    highlights: {
      en: ['Stunning beaches', 'Costa Smeralda luxury', 'Unique culture', 'Archaeological sites', 'Clear turquoise water', 'Excellent diving'],
      cs: ['Nádherné pláže', 'Luxus Costa Smeralda', 'Jedinečná kultura', 'Archeologické lokality', 'Průzračná tyrkysová voda', 'Výborné potápění'],
      it: ['Spiagge mozzafiato', 'Lusso Costa Smeralda', 'Cultura unica', 'Siti archeologici', 'Acqua turchese cristallina', 'Ottime immersioni']
    },
    priceRange: '€50,000 - €5,000,000',
    bestFor: { en: 'Beach, exclusivity, nature', cs: 'Pláže, exkluzivita, příroda', it: 'Spiaggia, esclusività, natura' },
    topCities: ['Cagliari', 'Olbia', 'Alghero', 'Porto Cervo', 'Sassari']
  }
}

Object.assign(REGION_DATA, CLEAN_REGION_PAGE_DATA)
Object.assign(REGION_DATA, REGION_DATA_OVERRIDES)

const REGION_BUYERS_GUIDANCE_IT = {
  toscana: {
    intro: 'Prima di acquistare in Toscana, valutate con attenzione:',
    items: [
      'Differenze di prezzo molto forti tra Firenze centro, Chianti e borghi secondari',
      'Vincoli paesaggistici e storici frequenti su casali e immobili nei centri storici',
      'Costi reali di ristrutturazione su immobili rurali (tetto, impianti, facciate)',
      'Regole comunali sugli affitti brevi nelle aree con turismo alto',
      'Distanza concreta da servizi, stazione e aeroporti per uso annuale'
    ],
    outro: 'In Toscana la micro-zona e la due diligence tecnica fanno la differenza tra un acquisto emozionale e una scelta solida.'
  },
  lombardia: {
    intro: 'Prima di acquistare in Lombardia, considerate:',
    items: [
      'Spread prezzi molto ampio tra Milano, cintura urbana, province e Lago di Como',
      'Spese condominiali e lavori straordinari su edifici urbani datati',
      'Liquidita di rivendita legata a metro, treni e tempi reali di collegamento',
      'Nei laghi premium la concorrenza e forte e i tempi decisionali sono brevi',
      'Verifica tecnica di impianti, classe energetica e conformità urbanistica'
    ],
    outro: 'In Lombardia la scelta della micro-zona e decisiva: dati locali e verifiche preventive riducono gli errori costosi.'
  },
  veneto: {
    intro: 'Prima di acquistare in Veneto, considerate:',
    items: [
      'Mercati molto diversi tra Venezia, Verona, Padova e località del Garda',
      'Nei centri storici vanno pesati vincoli edilizi, umidità e costi di manutenzione',
      'Aree turistiche con domanda stagionale: rendimento e occupazione non sono uniformi',
      'Regolamenti locali su affitti brevi da verificare comune per comune',
      'Accessibilita, parcheggio e logistica quotidiana cambiano molto il valore reale'
    ],
    outro: "In Veneto conviene decidere prima l'obiettivo (uso personale, rendita, rivendita) e poi selezionare la micro-area."
  },
  lazio: {
    intro: 'Prima di acquistare nel Lazio, considerate:',
    items: [
      'Roma ha dinamiche molto diverse da costa e province interne',
      'Nei palazzi storici servono controlli rigorosi su condominio e conformità urbanistica',
      'Costi di gestione e tassazione variano tra prima e seconda casa',
      'Domanda locativa diversa tra quartieri centrali, semicentro e comuni satelliti',
      'Tempi di spostamento reali incidono su vivibilità e valore nel lungo periodo'
    ],
    outro: 'Nel Lazio la strategia funziona quando zona, tipologia immobile e obiettivo di utilizzo sono allineati.'
  },
  sicilia: {
    intro: 'Prima di acquistare in Sicilia, considerate:',
    items: [
      'Palermo, Catania, Taormina e Siracusa hanno liquidità e prezzi molto diversi',
      'Nelle aree costiere servono verifiche su esposizione marina e stato delle strutture',
      'Documentazione catastale e urbanistica va controllata con particolare attenzione',
      'Domanda di affitto fortemente stagionale in molte località turistiche',
      "Collegamenti con aeroporti e servizi essenziali cambiano l'uso reale dell'immobile"
    ],
    outro: 'In Sicilia la scelta corretta dipende dalla micro-zona: il confronto puntuale tra comuni e quartieri e fondamentale.'
  },
  liguria: {
    intro: 'Prima di acquistare in Liguria, considerate:',
    items: [
      'Le posizioni vista mare hanno premium elevato rispetto alle zone interne',
      'Accesso, parcheggio e pendenza del territorio incidono su uso e rivendita',
      'Stock limitato nei comuni top: negoziazione e tempi richiedono preparazione',
      "Spese condominiali alte in molte località costiere con immobili d'epoca",
      'Controlli su rischio idrogeologico e stato di muri di contenimento'
    ],
    outro: "In Liguria l'indirizzo preciso vale più del nome del comune: la micro-localizzazione è tutto."
  },
  campania: {
    intro: 'Prima di acquistare in Campania, considerate:',
    items: [
      'Napoli è un mercato urbano complesso: il quartiere conta più della media cittadina',
      'Costiera Amalfitana e Sorrento hanno ticket alto e stock molto competitivo',
      'Conformità urbanistica da verificare con attenzione in immobili storici o frazionati',
      'Logistica e parcheggio sono fattori critici in molte località costiere',
      'Regole locali per affitti turistici possono cambiare il piano di rendimento'
    ],
    outro: 'In Campania conviene validare subito parte tecnica e legale prima di entrare in trattativa avanzata.'
  },
  piemonte: {
    intro: 'Prima di acquistare in Piemonte, considerate:',
    items: [
      'Torino segue dinamiche urbane diverse rispetto a Langhe, Monferrato e aree alpine',
      'Nei borghi collinari va verificata bene la qualità strutturale degli immobili storici',
      'Terreni agricoli e pertinenze richiedono controlli chiari su destinazione e vincoli',
      'Domanda locativa stabile in città, più selettiva nelle zone rurali',
      'Costi energetici invernali e isolamento incidono molto sul budget annuo'
    ],
    outro: 'In Piemonte la scelta migliore nasce da un bilanciamento realistico tra stile di vita e liquidità futura.'
  },
  'emilia-romagna': {
    intro: 'Prima di acquistare in Emilia-Romagna, considerate:',
    items: [
      'Bologna, Parma, Modena e costa adriatica hanno cicli di domanda differenti',
      'Mercato meno speculativo ma molto sensibile a servizi e infrastrutture locali',
      'Nelle aree di pianura va verificato con cura il profilo idraulico della zona',
      'Stock datato: controllare classe energetica e lavori da pianificare',
      'Strategia affitto cambia molto tra universita, business e turismo balneare'
    ],
    outro: 'In Emilia-Romagna la qualità della micro-zona e dei servizi determina gran parte della tenuta del valore.'
  },
  puglia: {
    intro: 'Prima di acquistare in Puglia, considerate:',
    items: [
      'Differenze forti tra Bari, Lecce, Valle d Itria e comuni costieri turistici',
      'Trulli, masserie e immobili rurali richiedono verifiche tecniche molto puntuali',
      'Rendita da affitto spesso legata alla stagionalita e alla gestione operativa',
      'Distanza da aeroporti e servizi essenziali pesa molto sull uso annuale',
      'Controlli urbanistici e catastali indispensabili prima di qualsiasi proposta'
    ],
    outro: "In Puglia conviene selezionare prima la zona e solo dopo la tipologia d'immobile, per evitare costi nascosti."
  },
  umbria: {
    intro: 'Prima di acquistare in Umbria, considerate:',
    items: [
      'Mercato più tranquillo della Toscana, con tempi di vendita mediamente più lunghi',
      'Nei casali e borghi storici servono verifiche su struttura, umidità e impianti',
      'Contesto rurale: valutare allacci, accessi stradali e servizi disponibili',
      'Domanda locativa selettiva, con picchi solo in alcune località note',
      'Vincoli paesaggistici frequenti nelle aree di pregio storico-naturalistico'
    ],
    outro: 'In Umbria funziona una strategia orientata al medio-lungo periodo, con aspettative di rendimento realistiche.'
  },
  'friuli-venezia-giulia': {
    intro: 'Prima di acquistare in Friuli Venezia Giulia, considerate:',
    items: [
      'Mercati diversi tra Trieste urbana, costa adriatica e aree interne',
      "Vicinanza ad Austria e Slovenia aumenta l'attrattività in alcune micro-zone",
      'Bora e condizioni climatiche locali incidono su manutenzione e comfort',
      'Regione pratica per uso frequente grazie alla buona accessibilita dal Centro Europa',
      'Verifiche tecniche e legali restano centrali su stock datato nei centri storici'
    ],
    outro: 'In Friuli Venezia Giulia il vantaggio logistico e reale, ma la scelta deve restare guidata da dati di quartiere.'
  },
  calabria: {
    intro: 'Prima di acquistare in Calabria, considerate:',
    items: [
      "Prezzi d'ingresso bassi, ma liquidità in uscita più lenta rispetto ai mercati prime",
      'Priorita a comuni vivi tutto l anno con servizi essenziali stabili',
      'Immobili economici richiedono spesso budget extra per adeguamenti tecnici',
      'Domanda affitti fortemente stagionale in molte aree costiere',
      'Titolarità e conformità urbanistica da verificare in modo rigoroso'
    ],
    outro: 'In Calabria la convenienza è reale quando il prezzo iniziale è bilanciato da qualità della zona e costi post-acquisto.'
  },
  abruzzo: {
    intro: 'Prima di acquistare in Abruzzo, considerate:',
    items: [
      'Costa e entroterra hanno differenze marcate su prezzi, servizi e rivendibilita',
      'Nelle aree montane servono verifiche su rischio sismico e stato strutturale',
      'Comuni piccoli possono offrire valore ma con mercato meno liquido',
      "Vincoli ambientali vicino a parchi nazionali da controllare prima dell'offerta",
      'Costo di gestione annuale variabile tra seconde case e uso continuativo'
    ],
    outro: 'In Abruzzo conviene puntare su immobili tecnicamente solidi in zone con servizi reali, non solo prezzo basso.'
  },
  sardegna: {
    intro: 'Prima di acquistare in Sardegna, considerate:',
    items: [
      'Mercato molto segmentato tra Costa Smeralda premium e aree più accessibili',
      'Domanda e occupazione fortemente stagionali in molte località balneari',
      'Collegamenti aerei e marittimi incidono su utilizzo e costi operativi',
      "Se non residenti, va pianificata in anticipo la gestione dell'immobile",
      'Vincoli costieri e conformità urbanistica da verificare con particolare cura'
    ],
    outro: 'In Sardegna la redditivita dipende da micro-zona, gestione e logistica: la pianificazione operativa e parte della scelta.'
  },
  'trentino-alto-adige': {
    intro: 'Prima di acquistare in Trentino-Alto Adige, considerate:',
    items: [
      'Prezzi medi più alti ma con standard qualitativi generalmente elevati',
      'Regole locali e condominiali possono essere restrittive in zone turistiche',
      'Uso invernale richiede controlli su isolamento, riscaldamento e accessi',
      'Domanda doppia estate/inverno, ma con forte selezione per località',
      'Costi di gestione in montagna da stimare con prudenza'
    ],
    outro: 'In Trentino-Alto Adige il valore sta nella qualità complessiva: tecnica, servizi e posizione devono essere coerenti.'
  },
  'valle-d-aosta': {
    intro: 'Prima di acquistare in Valle d Aosta, considerate:',
    items: [
      'Mercato piccolo con stock limitato e trattative rapide nelle località top',
      'Forte premium vicino agli impianti sciistici e ai centri più noti',
      'Condominio e manutenzione in quota possono incidere molto sul costo annuo',
      'Regolamenti locali su seconde case e locazioni vanno verificati in anticipo',
      'Controlli tecnici su tetto, carico neve e impiantistica sono fondamentali'
    ],
    outro: 'In Valle d Aosta la finestra decisionale e spesso breve: preparazione tecnica e legale anticipata e cruciale.'
  },
  'lago-di-garda': {
    intro: 'Prima di acquistare nell area Lago di Garda, considerate:',
    items: [
      'L area copre tre regioni: regole locali e fiscalita cambiano da comune a comune',
      'Prezzi molto diversi tra sponda ovest, est e parte nord del lago',
      'Vista lago, distanza dall acqua e parcheggio creano differenze di valore importanti',
      'Affitti turistici forti ma molto stagionali in tante micro-zone',
      'Costi condominiali e servizi in residence vanno valutati nel business plan'
    ],
    outro: 'Sul Garda conta più la micro-zona del brand lago: confrontare comuni specifici è indispensabile.'
  },
  alpy: {
    intro: 'Prima di acquistare nelle Alpi italiane, considerate:',
    items: [
      'Ogni valle ha domanda e prezzi diversi: non esiste un unico mercato alpino',
      'Accessibilita invernale e gestione neve incidono sull uso reale della casa',
      'Regole su locazione turistica e seconde case variano per comune',
      'Efficienza energetica e impianti di riscaldamento sono centrali in quota',
      'Strategia migliore quando uso personale e potenziale locativo sono bilanciati'
    ],
    outro: "Nelle Alpi italiane la qualità tecnica dell'immobile è parte essenziale della strategia di acquisto."
  }
}

const REGION_BUYERS_GUIDANCE_EN = {
  sicilia: {
    intro: 'Before buying in Sicily, consider:',
    items: [
      'Palermo, Catania, Taormina, and Syracuse have very different liquidity and pricing profiles',
      'In coastal areas, marine exposure and building condition need specific checks',
      'Cadastral and planning documentation should be verified with particular care',
      'Rental demand is strongly seasonal in many tourist locations',
      'Airport access and essential services materially affect how usable the property really is'
    ],
    outro: 'In Sicily, the right decision depends on the micro-area: municipality-by-municipality and neighborhood-by-neighborhood comparison is essential.'
  },
  liguria: {
    intro: 'Before buying in Liguria, consider:',
    items: [
      'Sea-view positions command a premium compared with inland locations',
      'Access, parking, and the slope of the terrain directly affect usability and resale',
      'Supply is limited in top municipalities, so negotiation and timing require preparation',
      'Condo costs are often high in older coastal buildings',
      'Hydrogeological risk and retaining-wall condition should be checked carefully'
    ],
    outro: 'In Liguria, the precise address matters more than the municipality name: micro-location is decisive.'
  },
  campania: {
    intro: 'Before buying in Campania, consider:',
    items: [
      'Naples is a complex urban market where the neighborhood matters more than city averages',
      'Amalfi Coast and Sorrento locations have high ticket sizes and very competitive supply',
      'Planning compliance needs careful review in historic or subdivided properties',
      'Logistics and parking are critical factors in many coastal locations',
      'Local short-rental rules can materially change the return profile'
    ],
    outro: 'In Campania, it is worth validating technical and legal aspects early before entering advanced negotiations.'
  },
  piemonte: {
    intro: 'Before buying in Piedmont, consider:',
    items: [
      'Turin follows different urban dynamics from Langhe, Monferrato, and alpine areas',
      'In hillside villages, the structural condition of older properties needs close review',
      'Agricultural land and annexes require clear checks on permitted use and restrictions',
      'Rental demand is steadier in the city and more selective in rural zones',
      'Winter energy costs and insulation levels have a strong impact on the annual budget'
    ],
    outro: 'In Piedmont, the best choice comes from a realistic balance between lifestyle goals and future liquidity.'
  }
}

const REGION_BUYERS_GUIDANCE_CS = {
  sicilia: {
    intro: 'Pred koupí na Sicilii zohlednete:',
    items: [
      'Palermo, Catania, Taormina a Syrakusy maji velmi odlisnou likviditu i cenove urovene',
      'V primorskych oblastech je nutne prověřit vliv morskeho prostredi a technicky stav budovy',
      'Katastrální a urbanistickou dokumentaci je třeba kontrolovat obzvlášť pečlivě',
      'Poptavka po pronajmu je v mnoha turistickych lokalitách silne sezonni',
      'Dostupnost letist a zakladnich služeb vyrazne meni realne využití nemovitostí'
    ],
    outro: 'Na Sicilii zavisi spravna volba na mikro-lokalite: presne srovnani jednotlivych obci a ctvrtí je zasadni.'
  },
  liguria: {
    intro: 'Pred koupí v Ligurii zohlednete:',
    items: [
      'Lokality s výhledem na more maji vyrazne premium oproti vnitrnim zonam',
      'Pristup, parkovani a sklon terenu primo ovlivnuji uzivani i dalsi prodej',
      'V nejzadanejsich obcích je nabídka omezena, proto je potřeba byt pripraveny i casove',
      'U starších primorskych domů byvaji casto vyssi kondominalni naklady',
      'Je nutne prověřit hydrogeologicka rizika a stav opernych konstrukci'
    ],
    outro: 'V Ligurii ma presna adresa vetsi vahu nez samotny nazev obce: mikro-lokalita je rozhodujici.'
  },
  campania: {
    intro: 'Pred koupí v Kampanii zohlednete:',
    items: [
      'Neapol je slozity mestsky trh, kde je ctvrt dulezitejsi nez městské prumery',
      'Amalfinske pobrezi a Sorrento maji vysoke vstupni ceny a velmi konkurencni nabídku',
      'Urbanistický soulad je potřeba pečlivě prověřit u historických nebo dělených nemovitostí',
      'Logistika a parkovani jsou v mnoha pobreznich lokalitách kriticke faktory',
      'Mistni pravidla kratkodobeho pronajmu mohou vyrazne zmenit planovany vynos'
    ],
    outro: 'V Kampanii se vyplatí prověřit technickou a právní část co nejdříve, ještě před pokročilým jednáním.'
  },
  piemonte: {
    intro: 'Pred koupí v Piemontu zohlednete:',
    items: [
      'Turin ma odlisnou mestskou dynamiku nez Langhe, Monferrato a alpske oblasti',
      'V kopcovitých obcích je třeba pečlivě prověřit konstrukční stav starších domů',
      'Zemedelske pozemky a vedlejsi stavby vyzaduji jasnou kontrolu využití a omezeni',
      'Poptavka po pronajmu je stabilnejsi ve meste a selektivnejsi na venkove',
      'Zimni energeticke naklady a uroven izolace maji velky dopad na rocni rozpocet'
    ],
    outro: 'V Piemontu vznika nejlepsi volba z realisticke rovnovahy mezi stylem zivota a budouci likviditou.'
  }
}

const BUYER_GUIDANCE_SLUG_ALIASES = {
  lombardy: 'lombardia',
  tuscany: 'toscana',
  piedmont: 'piemonte',
  trentinoaltoadige: 'trentino-alto-adige',
  'trentino-south-tyrol': 'trentino-alto-adige',
  valledaosta: 'valle-d-aosta',
  'aosta-valley': 'valle-d-aosta',
  sicily: 'sicilia',
  sardinia: 'sardegna'
}

function formatSlugName(slug = '') {
  if (typeof slug !== 'string' || slug.trim().length === 0) return 'Region'
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function createPlaceholderRegion(slug = '') {
  const prettyName = formatSlugName(slug)
  return {
    name: {
      en: prettyName,
      cs: prettyName,
      it: prettyName
    },
    image: '/Toscana.png',
    tagline: {
      en: 'Regional overview for Italian property buyers',
      cs: 'Regionální přehled pro kupující nemovitostí v Itálii',
      it: 'Panoramica regionale per chi compra casa in Italia'
    },
    description: {
      en: 'This regional page gives a practical first orientation for buyers comparing locations in Italy. Use it as a starting point to evaluate lifestyle, accessibility, services, property types and the level of technical and legal due diligence needed before making an offer.',
      cs: 'Tato regionální stránka slouží jako praktická první orientace pro kupující, kteří porovnávají lokality v Itálii. Pomáhá posoudit životní styl, dostupnost, služby, typy nemovitostí a rozsah technických a právních kontrol před podáním nabídky.',
      it: 'Questa pagina regionale offre un primo orientamento pratico per chi confronta diverse località in Italia. Serve per valutare stile di vita, accessibilità, servizi, tipologie immobiliari e livello di verifiche tecniche e legali necessario prima di fare un’offerta.'
    },
    highlights: {
      en: ['Lifestyle and access', 'Local market context', 'Legal and technical checks', 'Practical buyer focus'],
      cs: ['Životní styl a dostupnost', 'Lokální tržní kontext', 'Právní a technické kontroly', 'Praktický fokus kupujícího'],
      it: ['Stile di vita e accessibilità', 'Contesto del mercato locale', 'Controlli legali e tecnici', 'Focus pratico per acquirenti']
    },
    priceRange: 'Market dependent',
    bestFor: {
      en: 'Initial regional comparison',
      cs: 'První porovnání regionů',
      it: 'Primo confronto tra regioni'
    },
    topCities: [prettyName]
  }
}

export default function RegionDetailPage() {
  const params = useParams()
  const [language, setLanguage] = useState('cs')
  const rawSlug = Array.isArray(params?.slug) ? params.slug[0] : (params?.slug || '')
  const canonicalSlug = BUYER_GUIDANCE_SLUG_ALIASES[rawSlug] || rawSlug
  const bookingLink = REGION_BOOKING_LINKS[canonicalSlug] || REGION_BOOKING_LINKS[rawSlug] || DEFAULT_BOOKING_LINK
  const gygLink = REGION_GYG_LINKS[canonicalSlug] || REGION_GYG_LINKS[rawSlug] || DEFAULT_GYG_LINK
  const widgetConfig = REGION_GYG_WIDGET_CONFIGS[canonicalSlug] || REGION_GYG_WIDGET_CONFIGS[rawSlug] || null
  const shouldShowRegionalWidget = Boolean(widgetConfig)
  const topWidgetQuery = widgetConfig?.primaryQuery || widgetConfig?.query || ''
  const bottomWidgetQuery = widgetConfig?.secondaryQuery || topWidgetQuery
  const topWidgetDataAttrs = buildRegionalWidgetDataAttrs(widgetConfig, topWidgetQuery)
  const bottomWidgetDataAttrs = buildRegionalWidgetDataAttrs(widgetConfig, bottomWidgetQuery)
  const widgetDestinationLink = widgetConfig?.destinationLink || 'https://www.getyourguide.com/'
  const region = REGION_DATA[canonicalSlug] || REGION_DATA[rawSlug] || createPlaceholderRegion(canonicalSlug || rawSlug)

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

  const normalizedDescription = typeof region.description?.[language] === 'string'
    ? region.description[language].replace(/\\n/g, '\n')
    : ''
  const hasExplicitPriceNotes = Array.isArray(region.priceNotes?.[language]) && region.priceNotes[language].length > 0
  const priceNotes = hasExplicitPriceNotes
    ? region.priceNotes[language]
    : [region.priceRange].filter(Boolean)
  const primaryPriceLine = hasExplicitPriceNotes
    ? (region.priceRange || priceNotes[0] || '')
    : (priceNotes[0] || region.priceRange || '')
  const priceBulletLines = hasExplicitPriceNotes ? priceNotes : priceNotes.slice(1)
  const bestForItems = Array.isArray(region.bestForList?.[language]) && region.bestForList[language].length > 0
    ? region.bestForList[language]
    : [region.bestFor?.[language] || region.bestFor?.en].filter(Boolean)
  const topCitiesQuick = Array.isArray(region.topCities) ? region.topCities.slice(0, 5) : []
  const topCitiesDetailed = Array.isArray(region.topCitiesDetailed?.[language]) && region.topCitiesDetailed[language].length > 0
    ? region.topCitiesDetailed[language]
    : (region.topCities || []).map((city) => (
      language === 'cs'
        ? `${city} - Přehled lokálního trhu a investičního potenciálu`
        : language === 'it'
          ? `${city} - Panoramica del mercato locale e del potenziale d'investimento`
          : `${city} - Local market overview and investment context`
    ))
  const buyerGuidanceSlug = canonicalSlug
  const buyerGuidanceByLanguage = {
    cs: REGION_BUYERS_GUIDANCE_CS,
    it: REGION_BUYERS_GUIDANCE_IT,
    en: REGION_BUYERS_GUIDANCE_EN
  }
  const buyerGuidance = buyerGuidanceByLanguage[language]?.[buyerGuidanceSlug]
  const regionName = region.name?.[language] || region.name?.en || 'this region'
  const buyersTitle =
    language === 'cs'
      ? `Co by měli kupující vědět před koupí v regionu ${regionName}`
      : language === 'it'
        ? `Cosa devono sapere gli acquirenti prima di comprare in ${regionName}`
        : `What Buyers Should Know Before Buying in ${regionName}`
  const buyersIntro =
    buyerGuidance?.intro
      ? buyerGuidance.intro
      : language === 'cs'
      ? 'Před koupí nemovitostí v tomto regionu zohledněte:'
      : language === 'it'
        ? 'Prima di acquistare in questa regione, considerate:'
        : 'Before purchasing property in this region, buyers should consider:'
  const buyersItems =
    Array.isArray(buyerGuidance?.items) && buyerGuidance.items.length > 0
      ? buyerGuidance.items
      : language === 'cs'
      ? [
          'Transakční náklady a regionální daňová specifika',
          'Místní stavební, krajinná a památková omezení',
          'Reálnou nabídku a konkurenci v cílových lokalitách',
          'Sezonnost a cykly poptávky po pronájmu',
          'Technické a právní kontroly před podáním nabídky'
        ]
      : language === 'it'
        ? [
            'Costi di transazione e specificita fiscali regionali',
            'Vincoli urbanistici, paesaggistici e storici locali',
            'Offerta reale e concorrenza nelle località target',
            'Stagionalità e cicli della domanda di affitto',
            'Verifiche tecniche e legali prima di ogni offerta'
          ]
        : [
            'Transaction costs and regional tax specifics',
            'Local planning, landscape, and heritage constraints',
            'Real supply and competition in target locations',
            'Seasonality and rental demand cycles',
            'Technical and legal checks before any offer'
          ]
  const buyersOutro =
    buyerGuidance?.outro
      ? buyerGuidance.outro
      : language === 'cs'
      ? 'Proto je zásadní profesionální koordinace mezi notářem, technikem a právními poradci.'
      : language === 'it'
        ? 'Per questo è fondamentale il coordinamento professionale tra notaio, tecnico e consulenti legali.'
        : 'This is why professional coordination between notary, surveyor, and legal advisors is crucial.'
  const curiosityTitle =
    language === 'cs'
      ? `Zajímavosti a pravidla v regionu ${regionName}`
      : language === 'it'
        ? `Curiosita e regole da conoscere in ${regionName}`
        : `Curiosities and Key Rules in ${regionName}`
  const curiosityItems =
    Array.isArray(REGION_CURIOSITIES[buyerGuidanceSlug]?.[language]) && REGION_CURIOSITIES[buyerGuidanceSlug][language].length >= 4
      ? REGION_CURIOSITIES[buyerGuidanceSlug][language]
      : language === 'cs'
        ? [
            'Regionální trh se řídí specifickými pravidly obcí a provincií.',
            'Historické zóny často podléhají přísnějším stavebním a památkovým omezením.',
            'Mikro-lokalita ovlivňuje cenu i likviditu víc než samotný název regionu.',
            'Před koupí je zásadní technická i právní due diligence.'
          ]
        : language === 'it'
          ? [
              'Ogni regione ha regole locali specifiche tra comuni e province.',
              'Nei centri storici i vincoli urbanistici e paesaggistici sono spesso più rigidi.',
              'La micro-zona incide su prezzo e liquidità più del nome della regione.',
              "Prima dell'acquisto è fondamentale fare una due diligence tecnica e legale."
            ]
          : [
              'Each region has specific local rules across municipalities and provinces.',
              'Historic areas often have stricter planning and heritage constraints.',
              'Micro-location affects pricing and liquidity more than the region name alone.',
              'Technical and legal due diligence is essential before purchase.'
            ]
  const processCtaLabel =
    language === 'cs'
      ? 'Zobrazit náš celý proces'
      : language === 'it'
        ? 'Vedi il nostro processo completo'
        : 'See Our Full Process'
  const finalCtaTitle =
    language === 'cs'
      ? `Přemýšlíte o oblasti ${regionName}, ale nevíte, kde začít?`
      : language === 'it'
        ? `State pensando a ${regionName}, ma non sapete da dove iniziare?`
        : `Thinking about ${regionName} but not sure where to start?`
  const finalCtaDescription =
    language === 'cs'
      ? 'Pomáháme českým kupujícím vyhodnotit správnou oblast, typ nemovitostí a investiční potenciál před jakýmkoli závazným krokem.'
      : language === 'it'
        ? 'Aiutiamo gli acquirenti cechi a valutare area, tipo di immobile e potenziale di investimento prima di qualsiasi impegno vincolante.'
        : 'We help Czech buyers evaluate the right area, property type, and investment potential before any binding commitment.'
  const consultationLabel =
    language === 'cs'
      ? 'Požádat o osobní konzultaci'
      : language === 'it'
        ? 'Richiedi consulenza personalizzata'
        : 'Request Personal Consultation'
  const finalPropertiesLabel =
    language === 'cs'
      ? `Nabídky v oblasti ${regionName}`
      : language === 'it'
        ? `Proprietà in ${regionName}`
        : `Properties in ${regionName}`

  const contactFormLabel = language === 'cs' ? 'Kontaktní formulář' : language === 'it' ? 'Modulo di contatto' : 'Contact form'
  const travelInsuranceTitle =
    language === 'cs'
      ? `Rozhodli jste se cestovat do regionu ${regionName}?`
      : language === 'it'
        ? `Hai deciso di viaggiare in ${regionName}?`
        : `Have you decided to travel to ${regionName}?`
  const travelInsuranceText =
    language === 'cs'
      ? 'Pojistete svou cestu s nasimi overenymi partnery.'
      : language === 'it'
        ? 'Assicura il tuo viaggio con i nostri partner fidati.'
        : 'Protect your trip with our trusted partners.'

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <div className="pt-32 pb-12">
        {/* Hero with Region Image */}
        <div className="relative mb-8">
          <div className="relative h-64 md:h-96 overflow-hidden">
            <Image
              src={region.image}
              alt={region.name[language]}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <div className="max-w-4xl">
                <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 mb-4">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {language === 'cs' ? 'Region Itálie' : language === 'it' ? 'Regione d\'Italia' : 'Italian Region'}
                </Badge>
                <h1 className="font-bold text-white mb-3 drop-shadow-lg">
                  {region.name[language]}
                </h1>
                <p className="text-lg md:text-xl text-white/90 drop-shadow-md max-w-2xl">
                  {region.tagline[language]}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6" style={{ maxWidth: '1200px' }}>
          {/* Quick Stats */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl">
                <CardContent className="p-8 text-center">
                  <Euro className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">
                    {language === 'cs' ? 'Cenové rozpětí' : language === 'it' ? 'Fascia di prezzo' : 'Price Range'}
                  </p>
                  <p className="text-xl font-bold text-slate-800">{primaryPriceLine}</p>
                  {priceBulletLines.length > 0 && (
                    <ul className="mt-3 space-y-1 text-left text-xs text-gray-600 list-disc pl-4">
                      {priceBulletLines.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl">
                <CardContent className="p-8 text-center">
                  <Home className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">
                    {language === 'cs' ? 'Nejvhodnější pro' : language === 'it' ? 'Ideale per' : 'Best For'}
                  </p>
                  <div className="space-y-1">
                    {bestForItems.map((item, index) => (
                      <p key={index} className="text-sm font-medium text-slate-800">{item}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl">
                <CardContent className="p-8 text-center">
                  <MapPin className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">
                    {language === 'cs' ? 'Hlavní města' : language === 'it' ? 'Città principali' : 'Top Cities'}
                  </p>
                  <p className="text-lg font-semibold text-slate-800">{topCitiesQuick.join(', ')}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {shouldShowRegionalWidget ? (
            <div className="max-w-5xl mx-auto mb-12">
              <Card className="bg-white/90 backdrop-blur-sm border border-orange-200 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div
                    data-gyg-href="https://widget.getyourguide.com/default/activities.frame"
                    data-gyg-locale-code="cs-CZ"
                    data-gyg-widget="activities"
                    data-gyg-number-of-items="3"
                    data-gyg-partner-id="H4OKCTR"
                    {...topWidgetDataAttrs}
                  >
                    <span className="text-xs text-slate-600">
                      Powered by{' '}
                      <a
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        href={widgetDestinationLink}
                        className="underline underline-offset-2"
                      >
                        GetYourGuide
                      </a>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Description */}
          <div className="max-w-5xl mx-auto mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                  {normalizedDescription}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Highlights */}
          <div className="max-w-5xl mx-auto mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {language === 'cs' ? 'Proč zvolit tento region' : language === 'it' ? 'Perché scegliere questa regione' : 'Why Choose This Region'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {region.highlights[language].map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-base">{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-5xl mx-auto mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {buyersTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {buyersIntro}
                </p>
                <ul className="space-y-2 text-gray-700 mb-6">
                  {buyersItems.map((item, index) => (
                    <li key={index}>- {item}</li>
                  ))}
                </ul>
                <p className="text-gray-700 mb-6">
                  {buyersOutro}
                </p>
                <Link href="/process">
                  <Button className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold">
                    {processCtaLabel}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-5xl mx-auto mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {curiosityTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <ul className="space-y-3 text-gray-700">
                  {curiosityItems.map((item, index) => (
                    <li key={index}>- {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-5xl mx-auto mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-amber-200 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  {travelInsuranceTitle}
                </h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  {travelInsuranceText}
                </p>
                <a
                  href="https://www.dpbolvw.net/click-101629596-13502304"
                  target="_top"
                  rel="nofollow sponsored noopener noreferrer"
                  className="inline-block max-w-full overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm"
                >
                  <img
                    src="https://www.tqlkg.com/image-101629596-13502304"
                    width="468"
                    height="60"
                    alt="cestovni pojisteni AXA se slevou 50 %"
                    className="block h-auto max-w-full"
                  />
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Top Cities */}
          <div className="max-w-5xl mx-auto mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {language === 'cs' ? 'Hlavní města a lokality' : language === 'it' ? 'Città e località principali' : 'Top Cities & Locations'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-3 text-gray-700">
                  {topCitiesDetailed.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">
                          {language === 'cs'
                            ? 'Potřebujete auto pro cestu po regionu?'
                            : language === 'it'
                              ? 'Ti serve un’auto per visitare la regione?'
                              : 'Need a car to explore the region?'}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {language === 'cs'
                            ? 'Porovnejte nabídky autopůjčoven a naplánujte si pohodlné přesuny mezi městy, vesnicemi a pobřežím.'
                            : language === 'it'
                              ? 'Confronta le offerte di autonoleggio e organizza facilmente gli spostamenti tra città, borghi e costa.'
                              : 'Compare car rental offers and plan easy transfers between cities, villages, and the coast.'}
                        </p>
                      </div>
                      <a
                        href={REGION_CAR_RENTAL_LINK}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
                      >
                        {language === 'cs'
                          ? 'Najít půjčení auta'
                          : language === 'it'
                            ? 'Trova un’auto a noleggio'
                            : 'Find a rental car'}
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking.com + GetYourGuide Section */}
          <div className="max-w-5xl mx-auto mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <h3 className="text-2xl font-bold mb-4 text-slate-800">
                  {language === 'cs' ? 'Chcete region poznat osobně?' :
                   language === 'it' ? 'Volete conoscere la regione di persona?' :
                   'Want to Experience the Region Personally?'}
                </h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                  {language === 'cs' ? 'Mnoho klientů si před koupí vybírá region tak, že ho nejprve navštíví osobně – projde okolí, porovná lokality a atmosféru.' :
                   language === 'it' ? 'Molti clienti prima dell\'acquisto scelgono la regione visitandola di persona – esplorano i dintorni, confrontano località e atmosfera.' :
                   'Many clients choose their region by visiting it personally first – exploring the surroundings, comparing locations and atmosphere.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold px-8 py-6 text-base transition-all duration-300 shadow-lg"
                    onClick={() => window.open(bookingLink, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {language === 'cs' ? 'Najít ubytování (Booking.com)' :
                     language === 'it' ? 'Trova alloggio (Booking.com)' :
                     'Find Accommodation (Booking.com)'}
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg" 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white border-orange-500 font-semibold px-8 py-6 text-base transition-all duration-300"
                    onClick={() => window.open(gygLink, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {language === 'cs' ? 'Výlety a průvodce (GetYourGuide)' :
                     language === 'it' ? 'Escursioni e guide (GetYourGuide)' :
                     'Tours & Guides (GetYourGuide)'}
                  </Button>
                </div>
                {shouldShowRegionalWidget ? (
                  <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50/70 p-3">
                    <div
                      data-gyg-href="https://widget.getyourguide.com/default/activities.frame"
                      data-gyg-locale-code="cs-CZ"
                      data-gyg-widget="activities"
                      data-gyg-number-of-items="3"
                      data-gyg-partner-id="H4OKCTR"
                      {...bottomWidgetDataAttrs}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-12">
                <h2 className="font-bold mb-8">
                  {finalCtaTitle}
                </h2>
                <p className="text-slate-200 text-lg mb-8 leading-relaxed">
                  {finalCtaDescription}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button size="lg" title={consultationLabel} className="w-full sm:w-auto bg-white hover:bg-gray-100 text-slate-800 font-semibold px-8 py-6 text-base transition-all duration-300 shadow-lg">
                      {contactFormLabel}
                    </Button>
                  </Link>
                  <Link href={`/properties?region=${canonicalSlug || rawSlug}`}>
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-white hover:bg-gray-100 text-slate-800 font-semibold px-8 py-6 text-base transition-all duration-300 shadow-lg"
                    >
                      <Home className="h-5 w-5 mr-2" />
                      {finalPropertiesLabel}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-4xl mx-auto mt-10">
            <InformationalDisclaimer language={language} />
          </div>
        </div>
      </div>

      <PropertySlider language={language} />
      <Footer language={language} />
      {shouldShowRegionalWidget ? (
        <Script
          src="https://widget.getyourguide.com/dist/pa.umd.production.min.js"
          strategy="afterInteractive"
          data-gyg-partner-id="H4OKCTR"
        />
      ) : null}
    </div>
  )
}
