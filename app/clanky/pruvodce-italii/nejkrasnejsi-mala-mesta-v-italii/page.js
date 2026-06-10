'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PropertySlider from '@/components/PropertySlider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'

const PUBLISHED_AT = '2026-03-12'

const TRAVEL_PARTNER_LINKS = {
  booking: 'https://www.booking.com/searchresults.cs.html?ss=Italia&order=early_year_deals_upsorter&label=gen173rf-10Eg5kZWFscy1jYW1wYWlnbiiCAjjoB0gFWANoOogBAZgBM7gBF8gBDNgBA-gBAfgBAYgCAaICDm1lbWJlcnMuY2ouY29tqAIBuAKpjMzNBsACAdICJGQzM2IxZGFiLWM0NjUtNGRlMS04Zjc1LTEwNWQyNjJkZTAyM9gCAeACAQ&aid=304142&lang=cs&sb=1&src_elem=sb&dest_id=104&dest_type=country&ac_position=0&ac_click_type=b&ac_langcode=it&ac_suggestion_list_length=5&search_selected=true&search_pageview_id=fd70821489bb0dca&ac_meta=GhBmZDcwODIxNDg5YmIwZGNhIAAoATICaXQ6Bkl0YWxpYQ%3D%3D&checkin=2026-03-13&checkout=2026-03-14&group_adults=2&no_rooms=1&group_children=0&lpsrc=sb',
  getYourGuide: 'https://gyg.me/fnMmh4S3'
}
const BORGI_SIDEBAR_WIDGET = {
  href: 'https://www.dpbolvw.net/click-101629596-17122710',
  image: 'https://www.lduhtrp.net/image-101629596-17122710'
}

const CONTENT = {
  cs: {
    navGuide: 'Průvodce Itálií',
    navArticles: 'Články',
    badge: 'Průvodce Itálií',
    title: 'Nejkrásnější malá města v Itálii',
    readTime: '11 min',
    intro: [
      'Výběr nejkrásnějších malých měst v Itálii jsme pro rok 2026 upravili podle aktuálních dat o cestovním ruchu, ne jen podle fotek na sociálních sítích.',
      'Cílem je ukázat místa, která mají silnou atmosféru, ale zároveň dávají smysl z hlediska dostupnosti, kvality služeb a trendů poptávky.',
      'Níže najdete výběr měst, která odpovídají realitě roku 2026 a hodí se pro české cestovatele.'
    ],
    partnerTop: {
      title: 'Naplánujte si pobyt i aktivity dopředu',
      text: 'U menších měst se nejlepší ubytování často vyprodá rychleji, zejména od jara do podzimu.',
      booking: 'Najít ubytování (Booking.com)',
      gyg: 'Najít zážitky (GetYourGuide)'
    },
    whyTitle: 'Co ukazují data pro rok 2026',
    why: [
      'Eurostat (březen 2026): Itálie dosáhla v roce 2025 přibližně 476,9 milionu přenocování v hromadných ubytovacích zařízeních.',
      'ISTAT (prosinec 2025): v roce 2024 bylo v Itálii evidováno 466,2 milionu přenocování a podíl zahraničních hostů vzrostl na 54,6 %.',
      'ENIT (BIT 2026): v prvních 11 měsících roku 2025 bylo zaznamenáno přibližně 255 milionů zahraničních přenocování.',
      'Touring Club Italiano: certifikace Bandiera Arancione aktuálně zahrnuje 295 obcí, tedy kvalitní základnu ověřených menších cílů.'
    ],
    townsTitle: 'Výběr borghi pro rok 2026 (datově orientovaný)',
    towns: [
      {
        name: 'Orta San Giulio',
        region: 'Piemont',
        regionSlug: 'piemonte',
        text: 'Jezerní město vhodné pro klidnější pobyt, kvalitní základna pro short stay i pomalejší cestování.'
      },
      {
        name: 'Noli',
        region: 'Ligurie',
        regionSlug: 'liguria',
        text: 'Menší pobřežní historické město, které nabízí moře i centrum bez městského přetížení velkých resortů.'
      },
      {
        name: 'Dozza',
        region: 'Emilia-Romagna',
        regionSlug: 'emilia-romagna',
        text: 'Silná kombinace umění, gastronomie a přehledné logistiky při cestě po severní Itálii.'
      },
      {
        name: 'Spello',
        region: 'Umbrie',
        regionSlug: 'umbria',
        text: 'Historické centrum vhodné pro kulturní itinerář ve střední Itálii a cestování mimo hlavní davy.'
      },
      {
        name: 'Locorotondo',
        region: 'Puglia',
        regionSlug: 'puglia',
        text: 'Jeden z nejstabilnějších cílů Valle d’Itria, ideální pro kombinaci borghi, vína a venkovských tras.'
      },
      {
        name: 'Castellabate',
        region: 'Campania',
        regionSlug: 'campania',
        text: 'Dobré spojení moře, autentického centra a přirozeného napojení na oblast Cilento.'
      },
      {
        name: 'Tropea',
        region: 'Kalábrie',
        regionSlug: 'calabria',
        text: 'Jedna z nejžádanějších destinací jihu, vhodná při včasné rezervaci a plánování mimo špičku sezóny.'
      },
      {
        name: 'Cefalù',
        region: 'Sicílie',
        regionSlug: 'sicilia',
        text: 'Spojuje historické jádro, pobřeží a dobrou dostupnost, proto zůstává silnou volbou i pro rok 2026.'
      }
    ],
    partnerMid: {
      title: 'Chcete spojit město, výlety i vstupy bez stresu?',
      text: 'Praktický postup: Booking pro ubytování a GetYourGuide pro lokální program.',
      booking: 'Rezervovat ubytování',
      gyg: 'Rezervovat aktivity'
    },
    budgetTitle: 'Orientační denní rozpočet v menších městech (na osobu, bez letenky)',
    budgetNote:
      'Jde o orientační rámec pro rok 2026. Reálná cena se liší podle sezóny, regionu a termínu rezervace.',
    budgetItems: [
      {
        label: 'Úsporná varianta',
        range: 'cca 60-90 EUR / den',
        includes: 'jednodušší ubytování, lokální stravování, základní přesuny'
      },
      {
        label: 'Střední komfort',
        range: 'cca 100-160 EUR / den',
        includes: 'komfortnější ubytování, kombinace restaurací a aktivit, flexibilnější přesuny'
      },
      {
        label: 'Pohodlnější varianta',
        range: 'cca 180 EUR a více / den',
        includes: 'vyšší úroveň ubytování, více placených zážitků a služeb'
      }
    ],
    tipsTitle: 'Jak byl výběr sestaven',
    tips: [
      'Použili jsme kombinaci oficiálních dat o poptávce (ISTAT, Eurostat, ENIT) a kvalitativních certifikací destinací.',
      'Zahrnuli jsme jen města s dlouhodobě ověřenou atraktivitou, nikoli jednorázově virální místa.',
      'Důraz je na regionální diverzifikaci: sever, střed, jih i ostrovy.',
      'Praktická dostupnost (vlak, silnice, letiště v rozumné vzdálenosti) byla součástí hodnocení.'
    ],
    seasonTitle: 'Kdy vyrazit v roce 2026',
    season: [
      'Duben-červen a září-říjen obvykle nabízejí nejlepší poměr počasí, cen a návštěvnosti.',
      'Červenec-srpen je vhodný hlavně při včasné rezervaci ubytování i parkování.',
      'V zimě je potřeba počítat s omezeným provozem některých podniků v menších centrech.'
    ],
    logisticsTitle: 'Praktická logistika pro menší destinace',
    logistics: [
      'Do části měst se dobře dostanete vlakem, ale poslední úsek často vyžaduje autobus nebo taxi.',
      'Pro objevování okolních vesnic, vinařství a vyhlídek je obvykle nejpraktičtější auto.',
      'V hlavní sezóně se vyplatí řešit parkování i ubytování s větším předstihem.',
      'U můžeí a menších podniků je dobré předem ověřit otevírací dny a polední přestávky.'
    ],
    overspendTitle: 'Kde se v borghi nejčastěji přeplácí',
    overspend: [
      'Pozdní rezervace během jara a léta, kdy se menší kapacity rychle vyprodají.',
      'Ubytování jen v nejfotogeničtější části centra bez porovnání okolních čtvrtí.',
      'Denní přesuny bez plánu parkování nebo návazné lokální dopravy.',
      'Rezervace aktivit až na místě v nejexponovanějších termínech.'
    ],
    sourcesTitle: 'Použité zdroje a metodika',
    sources: [
      'Eurostat (4. 3. 2026): EU tourism in 2025 - rekordní počet přenocování a vysoký podíl Itálie.',
      'ISTAT (4. 12. 2025): movimento turistico 2024 - 466,2 mil. přenocování, 54,6 % zahraničních hostů.',
      'ENIT (BIT 2026): růst zahraniční poptávky v Itálii.',
      'Touring Club Italiano: certifikace Bandiera Arancione (295 obcí).',
      'I Borghi più belli d’Italia: oficiální síť více než 360 historických obcí.'
    ],
    bridgeTitle: 'Chcete porovnat jednotlivé regiony Itálie podrobněji?',
    bridgeText: 'Podívejte se na naše přehledy regionů a vyberte oblast, která nejlépe odpovídá vašemu stylu cestování.',
    bridgeButton: 'Regiony Itálie',
    conclusionTitle: 'Závěr',
    conclusion: [
      'Výběr borghi pro rok 2026 dává největší smysl tehdy, když spojíte data, logistiku a vlastní styl cestování.',
      'S dobrou přípravou získáte autentičtější zážitek než v přetížených metropolích a zároveň si udržíte rozumný rozpočet.'
    ]
  },
  en: {
    navGuide: 'Italy Travel Guide',
    navArticles: 'Articles',
    badge: 'Italy Travel Guide',
    title: 'The Most Beautiful Small Towns in Italy',
    readTime: '11 min',
    intro: [
      'For 2026, this list of the most beautiful small towns in Italy has been updated using tourism data, not only social media popularity.',
      'The goal is to highlight places that combine atmosphere with practical accessibility, service quality, and realistic demand trends.',
      'Below you will find destinations that are both inspiring and coherent with the current travel scenario.'
    ],
    partnerTop: {
      title: 'Plan your stay and activities in advance',
      text: 'In smaller towns, the best accommodation options often sell out quickly, especially from spring to autumn.',
      booking: 'Find Accommodation (Booking.com)',
      gyg: 'Find Activities (GetYourGuide)'
    },
    whyTitle: 'What the 2026 Data Shows',
    why: [
      'Eurostat (March 2026): Italy reached about 476.9 million nights in tourist accommodation in 2025.',
      'ISTAT (Dec 2025): Italy recorded 466.2 million overnight stays in 2024, with foreign guest share rising to 54.6%.',
      'ENIT (BIT 2026): in the first 11 months of 2025, international stays reached around 255 million.',
      'Touring Club Italiano (2025): the Bandiera Arancione quality label currently includes 295 small municipalities.'
    ],
    townsTitle: 'Data-Oriented Borgo Selection for 2026',
    towns: [
      {
        name: 'Orta San Giulio',
        region: 'Piedmont',
        regionSlug: 'piemonte',
        text: 'A lake destination with a compact historic core, suitable for short breaks and slower travel pacing.'
      },
      {
        name: 'Noli',
        region: 'Liguria',
        regionSlug: 'liguria',
        text: 'A small coastal historic town offering sea access and a more manageable flow than major beach hubs.'
      },
      {
        name: 'Dozza',
        region: 'Emilia-Romagna',
        regionSlug: 'emilia-romagna',
        text: 'A strong mix of art, food culture, and practical logistics for northern Italy itineraries.'
      },
      {
        name: 'Spello',
        region: 'Umbria',
        regionSlug: 'umbria',
        text: 'A high-quality historic center, ideal for culture-oriented itineraries away from mass tourism.'
      },
      {
        name: 'Locorotondo',
        region: 'Puglia',
        regionSlug: 'puglia',
        text: 'One of the most reliable options in Valle d’Itria for combining villages, wine, and countryside routes.'
      },
      {
        name: 'Castellabate',
        region: 'Campania',
        regionSlug: 'campania',
        text: 'Balanced sea-and-heritage destination with strong links to the broader Cilento area.'
      },
      {
        name: 'Tropea',
        region: 'Calabria',
        regionSlug: 'calabria',
        text: 'A highly demanded southern destination, best approached with early planning in peak periods.'
      },
      {
        name: 'Cefalù',
        region: 'Sicily',
        regionSlug: 'sicilia',
        text: 'Combines historic center, coastline, and solid accessibility, keeping it relevant for 2026.'
      }
    ],
    partnerMid: {
      title: 'Want to combine towns, tours, and tickets smoothly?',
      text: 'A practical setup: Booking for stays and GetYourGuide for local experiences.',
      booking: 'Book Accommodation',
      gyg: 'Book Tours & Activities'
    },
    budgetTitle: 'Indicative Daily Budget in Small Towns (per person, excluding flights)',
    budgetNote:
      'These are orientation ranges for 2026. Actual cost depends on season, region, and booking timing.',
    budgetItems: [
      {
        label: 'Budget Option',
        range: 'approx. EUR 60-90 / day',
        includes: 'simple accommodation, local food, essential mobility'
      },
      {
        label: 'Mid Comfort',
        range: 'approx. EUR 100-160 / day',
        includes: 'better accommodation, mixed dining, more flexible transfers'
      },
      {
        label: 'More Comfortable Option',
        range: 'approx. EUR 180+ / day',
        includes: 'higher accommodation standard and more paid experiences'
      }
    ],
    tipsTitle: 'How This Selection Was Built',
    tips: [
      'We combined official demand indicators (ISTAT, Eurostat, ENIT) with destination quality signals.',
      'Only towns with stable long-term attractiveness were included, not short-lived viral spots.',
      'Regional diversification was intentional: north, center, south, and islands.',
      'Accessibility was part of the evaluation (rail, roads, and reasonable airport distance).'
    ],
    seasonTitle: 'Best Timing for 2026',
    season: [
      'April-June and September-October usually provide the best balance of weather, pricing, and crowd levels.',
      'July-August can work well only with early booking for both accommodation and parking.',
      'In winter, some services in smaller towns may run on reduced schedules.'
    ],
    logisticsTitle: 'Practical Logistics for Smaller Destinations',
    logistics: [
      'Many towns are reachable by train, but the final segment often requires a local bus or taxi.',
      'For nearby villages, wineries, and viewpoints, a car is usually the most practical option.',
      'In peak season, arrange both parking and accommodation well in advance.',
      'For museums and smaller businesses, verify opening days and midday breaks ahead of time.'
    ],
    overspendTitle: 'Where Travelers Most Often Overspend in Small Towns',
    overspend: [
      'Late booking during spring/summer when small-capacity stays sell out quickly.',
      'Choosing only postcard-center accommodation without comparing nearby options.',
      'Daily transfers without pre-checking parking and local mobility.',
      'Booking activities last minute in peak periods.'
    ],
    sourcesTitle: 'Sources and Methodology',
    sources: [
      'Eurostat (4 Mar 2026): EU tourism in 2025 and country-level overnight stays.',
      'ISTAT (4 Dec 2025): official tourism movement 2024 update.',
      'ENIT (BIT 2026): international demand trend in Italy.',
      'Touring Club Italiano: Bandiera Arancione certified municipalities (295).',
      'I Borghi più belli d’Italia: official network of over 360 historic villages.'
    ],
    bridgeTitle: 'Want to compare Italian regions in more detail?',
    bridgeText: 'Explore our regional overviews and choose the area that best fits your travel style.',
    bridgeButton: 'Regions of Italy',
    conclusionTitle: 'Conclusion',
    conclusion: [
      'For 2026, choosing a borgo works best when data, logistics, and personal travel goals are aligned.',
      'With proper planning, small towns can deliver a deeper experience than overcrowded city hotspots while staying budget-aware.'
    ]
  },
  it: {
    navGuide: 'Guida all’Italia',
    navArticles: 'Articoli',
    badge: 'Guida all’Italia',
    title: 'I borghi più belli d’Italia',
    readTime: '11 min',
    intro: [
      'Per il 2026 questa selezione dei borghi più belli d’Italia è stata aggiornata usando dati turistici reali, non solo trend social.',
      'L’obiettivo è proporre mete con forte identità, ma anche coerenti con accessibilità, qualità dell’offerta e domanda attesa.',
      'Qui sotto trovi borghi adatti a viaggiatori che cercano autenticità con una logica concreta di pianificazione.'
    ],
    partnerTop: {
      title: 'Pianifica in anticipo alloggi ed esperienze',
      text: 'Nei piccoli borghi le strutture migliori si esauriscono rapidamente, soprattutto da primavera ad autunno.',
      booking: 'Trova alloggio (Booking.com)',
      gyg: 'Trova attività (GetYourGuide)'
    },
    whyTitle: 'Cosa Dicono i Dati per il 2026',
    why: [
      'Eurostat (marzo 2026): l’Italia nel 2025 ha raggiunto circa 476,9 milioni di pernottamenti nelle strutture ricettive.',
      'ISTAT (dicembre 2025): nel 2024 sono state registrate 466,2 milioni di presenze, con quota stranieri salita al 54,6%.',
      'ENIT (BIT 2026): nei primi 11 mesi del 2025 le presenze internazionali hanno toccato circa 255 milioni.',
      'Touring Club Italiano (2025): la certificazione Bandiera Arancione copre 295 comuni, base solida per scegliere borghi affidabili.'
    ],
    townsTitle: 'Selezione Borghi 2026 (Data-Driven)',
    towns: [
      {
        name: 'Orta San Giulio',
        region: 'Piemonte',
        regionSlug: 'piemonte',
        text: 'Borgo lacustre adatto a viaggi rilassati, con centro storico compatto e ritmo sostenibile.'
      },
      {
        name: 'Noli',
        region: 'Liguria',
        regionSlug: 'liguria',
        text: 'Piccolo centro costiero con buon equilibrio tra mare e patrimonio storico, senza la pressione dei grandi poli balneari.'
      },
      {
        name: 'Dozza',
        region: 'Emilia-Romagna',
        regionSlug: 'emilia-romagna',
        text: 'Destinazione forte per arte e gastronomia, logistica comoda per itinerari nel Nord Italia.'
      },
      {
        name: 'Spello',
        region: 'Umbria',
        regionSlug: 'umbria',
        text: 'Borgo storico ideale per percorsi culturali nel Centro Italia e per viaggi fuori dal turismo di massa.'
      },
      {
        name: 'Locorotondo',
        region: 'Puglia',
        regionSlug: 'puglia',
        text: 'Scelta stabile della Valle d’Itria, ottima per combinare borghi, cantine e percorsi rurali.'
      },
      {
        name: 'Castellabate',
        region: 'Campania',
        regionSlug: 'campania',
        text: 'Unisce mare e autenticità con un buon collegamento all’area del Cilento.'
      },
      {
        name: 'Tropea',
        region: 'Calabria',
        regionSlug: 'calabria',
        text: 'Meta molto richiesta del Sud, da pianificare con anticipo soprattutto nei mesi di alta stagione.'
      },
      {
        name: 'Cefalù',
        region: 'Sicilia',
        regionSlug: 'sicilia',
        text: 'Mantiene valore nel 2026 grazie a combinazione tra centro storico, costa e accessibilità.'
      }
    ],
    partnerMid: {
      title: 'Vuoi gestire al meglio alloggi e attività?',
      text: 'Combinazione utile: Booking per l’alloggio e GetYourGuide per esperienze locali.',
      booking: 'Prenota alloggio',
      gyg: 'Prenota attività'
    },
    budgetTitle: 'Budget Giornaliero Indicativo nei Borghi (per persona, senza volo)',
    budgetNote:
      'Valori orientativi per il 2026. Il costo reale dipende da stagione, area e anticipo di prenotazione.',
    budgetItems: [
      {
        label: 'Versione economica',
        range: 'circa 60-90 EUR / giorno',
        includes: 'alloggio semplice, pasti locali, mobilità essenziale'
      },
      {
        label: 'Comfort medio',
        range: 'circa 100-160 EUR / giorno',
        includes: 'alloggio più comodo, ristorazione mista, trasferimenti più flessibili'
      },
      {
        label: 'Versione più comoda',
        range: 'circa 180 EUR e oltre / giorno',
        includes: 'strutture di livello superiore e più attività a pagamento'
      }
    ],
    tipsTitle: 'Come Abbiamo Costruito la Selezione',
    tips: [
      'Abbiamo combinato indicatori ufficiali di domanda (ISTAT, Eurostat, ENIT) con segnali di qualità delle destinazioni.',
      'Sono stati inclusi solo borghi con attrattività stabile nel tempo, non mete momentaneamente virali.',
      'La selezione è bilanciata tra Nord, Centro, Sud e Isole.',
      'È stata considerata anche la raggiungibilità pratica: treno, strada e distanza ragionevole da aeroporti.'
    ],
    seasonTitle: 'Quando Conviene Partire nel 2026',
    season: [
      'Aprile-giugno e settembre-ottobre offrono in genere il miglior equilibrio tra clima, prezzi e affluenza.',
      'Luglio-agosto richiedono prenotazioni anticipate, in particolare per alloggi e parcheggi.',
      'In inverno alcuni servizi locali possono avere orari ridotti o aperture parziali.'
    ],
    logisticsTitle: 'Logistica Pratica per i Borghi',
    logistics: [
      'Molti borghi sono raggiungibili in treno, ma l’ultimo tratto richiede spesso autobus locale o taxi.',
      'Per esplorare paesi vicini, cantine e punti panoramici, l’auto è in genere la soluzione più pratica.',
      'In alta stagione conviene organizzare con anticipo sia parcheggio sia alloggio.',
      'Per musei e attività locali è utile controllare prima giorni di apertura e pause di metà giornata.'
    ],
    overspendTitle: 'Dove si Spende Più del Necessario nei Borghi',
    overspend: [
      'Prenotazioni tardive in primavera/estate quando le strutture piccole finiscono presto.',
      'Scelta solo del centro più iconico senza confronto con zone vicine.',
      'Spostamenti giornalieri senza pianificare parcheggi e collegamenti locali.',
      'Attività prenotate all’ultimo nei periodi più richiesti.'
    ],
    sourcesTitle: 'Fonti Utilizzate e Metodo',
    sources: [
      'Eurostat (4 marzo 2026): turismo UE 2025 e notti per Paese.',
      'ISTAT (4 dicembre 2025): aggiornamento ufficiale sul movimento turistico 2024.',
      'ENIT (BIT 2026): andamento della domanda internazionale in Italia.',
      'Touring Club Italiano: comuni certificati Bandiera Arancione (295).',
      'I Borghi più belli d’Italia: rete ufficiale con oltre 360 borghi storici.'
    ],
    bridgeTitle: 'Vuoi confrontare le regioni italiane in dettaglio?',
    bridgeText: 'Consulta le nostre panoramiche regionali e scegli l’area più adatta al tuo stile di viaggio.',
    bridgeButton: 'Regioni d’Italia',
    conclusionTitle: 'Conclusione',
    conclusion: [
      'Nel 2026 scegliere i borghi migliori significa unire dati reali, logistica e obiettivi personali di viaggio.',
      'Con pianificazione corretta puoi ottenere un’esperienza più autentica rispetto alle mete sovraffollate, mantenendo anche un budget più controllabile.'
    ]
  }
}

function formatDate(language, value) {
  const locale = language === 'cs' ? 'cs-CZ' : language === 'it' ? 'it-IT' : 'en-US'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })
}

function TravelPartnerCta({ title, text, bookingLabel, gygLabel }) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <h3 className="text-2xl font-bold mb-3 text-slate-800">{title}</h3>
        <p className="text-gray-500 mb-5 leading-relaxed" style={{color:'#4a4a4a', lineHeight:'1.75'}}>{text}</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button asChild className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold px-6 py-5 text-sm transition-all duration-300 shadow-lg w-full sm:w-auto">
            <a href={TRAVEL_PARTNER_LINKS.booking} target="_blank" rel="nofollow sponsored noopener noreferrer">
              {bookingLabel}
            </a>
          </Button>
          <Button asChild className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold px-6 py-5 text-sm transition-all duration-300 shadow-lg w-full sm:w-auto">
            <a href={TRAVEL_PARTNER_LINKS.getYourGuide} target="_blank" rel="nofollow sponsored noopener noreferrer">
              {gygLabel}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MostBeautifulSmallTownsItalyPage() {
  const [language, setLanguage] = useState('cs')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    const handleLanguageChange = (event) => {
      if (!event?.detail) return
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const t = CONTENT[language] || CONTENT.cs
  const sidebarTitle =
    language === 'cs'
      ? 'Doporucena nabídka partnera'
      : language === 'it'
        ? 'Offerta partner consigliata'
        : 'Recommended Partner Offer'
  const sidebarText =
    language === 'cs'
      ? 'Overene rezervace a cestovni nabídky.'
      : language === 'it'
        ? 'Prenotazioni verificate e in sicurezza.'
        : 'Verified booking and travel deal.'
  const articleImage =
    language === 'cs'
      ? {
          src: '/Umbria.webp',
          alt: 'Malé historické město v Itálii',
          caption: 'Nejhezčí italská malá města nabízejí pomalejší tempo, tradiční architekturu a autentickou atmosféru.'
        }
      : language === 'it'
        ? {
            src: '/Umbria.webp',
            alt: 'Piccolo borgo storico in Italia',
            caption: "I borghi più belli d'Italia offrono ritmi lenti, architettura storica e un'atmosfera autentica."
          }
        : {
            src: '/Umbria.webp',
            alt: 'Small historic town in Italy',
            caption: "Italy's most beautiful small towns offer slower rhythms, historic architecture, and an authentic atmosphere."
          }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <main className="pt-28 pb-16 md:pb-24">
        <div className="container mx-auto px-6" style={{ maxWidth: '1200px' }}>
          <div className="max-w-[1200px] mx-auto lg:grid lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-8 xl:gap-12">
            <article className="max-w-4xl lg:max-w-none space-y-8">
            <Button asChild variant="outline" className="inline-flex items-center border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-700">
              <Link href="/články/průvodce-italii">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.navArticles}
              </Link>
            </Button>

            <header className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-slate-100 border border-slate-200 text-slate-700 mb-4">
                <MapPin className="h-3.5 w-3.5" />
                {t.badge}
              </div>

              <h1 className="font-bold text-slate-900 leading-tight mb-8">{t.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
                <span className="inline-flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  {formatDate(language, PUBLISHED_AT)}
                </span>
                <span className="inline-flex items-center">
                  <Clock className="h-4 w-4 mr-1.5" />
                  {t.readTime}
                </span>
              </div>

              <div className="space-y-3 text-slate-700 leading-relaxed">
                {t.intro.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </header>

            <TravelPartnerCta
              title={t.partnerTop.title}
              text={t.partnerTop.text}
              bookingLabel={t.partnerTop.booking}
              gygLabel={t.partnerTop.gyg}
            />

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <Image src={articleImage.src} alt={articleImage.alt} width={1400} height={800} sizes="(min-width: 768px) 768px, 100vw" className="w-full h-64 md:h-80 object-cover" />
              <p className="text-sm text-slate-600 px-4 py-3">{articleImage.caption}</p>
            </div>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.whyTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.why.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.townsTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {t.towns.map((town) => (
                  <div key={town.name} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <h3 className="font-semibold text-slate-900">{town.name}</h3>
                      <Link href={`/regions/${town.regionSlug}`} className="text-sm text-slate-600 underline decoration-slate-300 underline-offset-2 hover:text-slate-800">
                        {town.region}
                      </Link>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">{town.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <TravelPartnerCta
              title={t.partnerMid.title}
              text={t.partnerMid.text}
              bookingLabel={t.partnerMid.booking}
              gygLabel={t.partnerMid.gyg}
            />

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.budgetTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">{t.budgetNote}</p>
                <div className="space-y-3">
                  {t.budgetItems.map((item) => (
                    <div key={item.label} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <h3 className="font-semibold text-slate-900">{item.label}</h3>
                        <span className="text-sm font-bold text-slate-800">{item.range}</span>
                      </div>
                      <p className="text-slate-600 text-sm">{item.includes}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.tipsTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.tips.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.seasonTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.season.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.logisticsTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.logistics.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.overspendTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.overspend.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.sourcesTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.sources.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-6 md:p-8">
                <h2 className="font-semibold text-amber-950 mb-8">{t.bridgeTitle}</h2>
                <p className="text-amber-950 leading-relaxed mb-5">{t.bridgeText}</p>
                <Button asChild className="bg-slate-800 hover:bg-slate-700 text-white">
                  <Link href="/regiony">{t.bridgeButton}</Link>
                </Button>
              </CardContent>
            </Card>

              <Card className="bg-white border border-slate-200">
                <CardHeader>
                  <CardTitle className="mb-8">{t.conclusionTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-slate-700 leading-relaxed">
                  {t.conclusion.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </CardContent>
              </Card>
              <InformationalDisclaimer language={language} className="mt-14" />
            </article>

            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{sidebarTitle}</h3>
                <p className="text-xs text-slate-600 mb-3">{sidebarText}</p>
                <a href={BORGI_SIDEBAR_WIDGET.href} target="_top" rel="sponsored noopener noreferrer" className="block">
                  <img
                    src={BORGI_SIDEBAR_WIDGET.image}
                    width="160"
                    height="600"
                    alt=""
                    border="0"
                    className="w-full h-auto rounded-md"
                  />
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <PropertySlider language={language} />
      <Footer language={language} />
    </div>
  )
}
