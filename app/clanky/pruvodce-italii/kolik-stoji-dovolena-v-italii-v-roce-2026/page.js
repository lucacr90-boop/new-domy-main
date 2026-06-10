'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, Clock, Euro, Car, Train, Bus, Plane } from 'lucide-react'
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
const FLIGHTS_PARTNER_LINKS = {
  homepage: 'https://www.dpbolvw.net/click-101629596-17053224',
  trackingPixel: 'https://www.ftjcfx.com/image-101629596-17053224'
}

const CONTENT = {
  cs: {
    navGuide: 'Průvodce Itálií',
    navArticles: 'Články',
    badge: 'Průvodce Itálií',
    title: 'Kolik stojí dovolená v Itálii v roce 2026?',
    readTime: '11 min',
    intro: [
      'Cena dovolené v Itálii v roce 2026 závisí hlavně na tom, kam jedete, v jakém termínu cestujete, jak se budete přesouvat a jaký typ ubytování zvolíte.',
      'Velký rozdíl dělá také délka pobytu a váš styl cestování: jiný rozpočet má city break ve dvou, jiný rodinná cesta autem k moři a jiný okruh po více regionech.',
      'V tomto průvodci najdete praktický přehled nejdůležitějších nákladů a konkrétní tipy, jak se vyhnout zbytečným výdajům bez toho, abyste si cestu zkazili.',
      'Cílem není slibovat nereálně levnou dovolenou, ale ukázat, kde se dá rozumně ušetřit a kde se naopak vyplatí nešetřit za každou cenu.',
      'Díky tomu si můžete před odjezdem nastavit rozpočet, který bude odpovídat realitě, ne jen optimistickému odhadu.'
    ],
    factorsTitle: 'Co nejvíce ovlivňuje cenu dovolené v Itálii',
    factorsIntro:
      'Stejná dovolená může stát výrazně jinou částku podle toho, jak ji poskládáte. V praxi rozhoduje hlavně termín, lokalita a způsob plánování. Pokud cestujete v hlavní sezóně do nejznámějších měst nebo k nejpopulárnějším plážím, rozpočet obvykle roste rychleji. Naopak při chytré kombinaci termínu, regionu a včasné rezervace lze udržet náklady mnohem lépe pod kontrolou. Vyplatí se proto řešit rozpočet jako celek, ne jen cenu ubytování.',
    factors: [
      'Sezóna: hlavní letní měsíce bývají nejdražší, zatímco květen, červen, září a říjen obvykle vycházejí lépe.',
      'Region: slavná města a pobřežní lokality mívají vyšší ceny než menší vnitrozemská místa.',
      'Délka pobytu: delší pobyt často sníží průměrnou cenu za noc oproti krátkému víkendu.',
      'Rezervace: last minute v létě bývá dražší; včasná rezervace obvykle zlepšuje poměr cena/výkon.',
      'Styl cesty: rozpočet výrazně mění to, jestli volíte levnější přesuny a jednoduché ubytování, nebo pohodlnější variantu.'
    ],
    dailyBudgetTitle: 'Orientační denní rozpočet na osobu bez letenky',
    dailyBudgetNote:
      'Jde o realistickou orientaci pro rok 2026. Konkrétní cena obvykle závisí na regionu, sezóně, termínu rezervace a vašem cestovatelském stylu. Berte ji jako rámec, podle kterého si nastavíte vlastní plán.',
    dailyBudget: [
      {
        label: 'Úsporná varianta',
        range: 'cca 60-90 EUR / den',
        includes:
          'jednodušší ubytování, základní stravování a úsporné přesuny; vhodné při plánování a včasné rezervaci'
      },
      {
        label: 'Střední komfort',
        range: 'cca 100-160 EUR / den',
        includes:
          'pohodlnější apartmán nebo hotel, kombinace restaurací a lokálních podniků, vyvážená doprava vlakem nebo autem'
      },
      {
        label: 'Pohodlnější varianta',
        range: 'cca 180 EUR a více / den',
        includes:
          'kvalitnější ubytování, větší flexibilita dopravy, více placených aktivit a méně kompromisů v komfortu'
      }
    ],
    transportTitle: 'Doprava z Česka do Itálie a po Itálii',
    transportIntro:
      'Největší rozdíly v celkovém rozpočtu často nevznikají u jídla, ale právě u dopravy. Dává smysl počítat nejen cenu jedné jízdenky nebo nádrže, ale celý obraz: mýtné, parkování, čas přesunů, pohodlí i flexibilitu na místě. V některých typech cest se vyplatí jedna varianta, u jiných je nejlepší kombinace více dopravních prostředků. Právě správná volba dopravy často rozhodne, jestli bude celá dovolená finančně v pohodě.',
    transportExamplesNote:
      'Orientační příklady níže berte jako přibližné rozmezí. Záleží na termínu, předstihu rezervace, sezóně i dostupnosti.',
    transportExampleBoxTitle: 'Orientační příklad',
    transportExampleBoxNote: 'Variabilní částky závislé na více faktorech (nejde o pevné tarify).',
    transport: [
      {
        icon: 'car',
        title: 'Auto',
        text: 'Auto se vyplatí hlavně pro více osob, menší města, moře, hory a venkov. Počítejte s mýtným, parkováním a tím, že ceny pohonných hmot se průběžně mění (oficiálně je sleduje Weekly Oil Bulletin Evropské komise). Ve městech myslete i na zóny ZTL.',
        examples: ['Praha-Tarvisio: cca 80-100 EUR', 'Praha-Řím: cca 220-250 EUR']
      },
      {
        icon: 'train',
        title: 'Vlak',
        text: 'Vlak je silná volba mezi městy. Oficiální nabídka Trenitalia Italia in Tour umožňuje neomezené cestování regionálními vlaky na 3 po sobě jdoucí dny za 35 EUR nebo na 5 dní za 59 EUR. Pro cizince žijící mimo Itálii existuje Trenitalia Pass od 139 EUR.',
        examples: ['Praha-Milán: cca 130-160 EUR', 'Praha-Řím: cca 160-220 EUR']
      },
      {
        icon: 'bus',
        title: 'Autobus',
        text: 'Dálkové autobusy bývají obvykle nejlevnější, ale zpravidla jsou pomalejší a méně komfortní než vlak. Dobře fungují hlavně tehdy, když je pro vás priorita cena a máte flexibilní čas.',
        examples: ['Praha-Bologna: cca 60-80 EUR', 'Praha-Bari: cca 90-120 EUR']
      },
      {
        icon: 'flight',
        title: 'Letadlo',
        text: 'Letecky bývá cesta z Česka do Itálie nejrychlejší. Cena ale výrazně kolísá podle sezóny, času rezervace a konkrétního spojení.',
        examples: [
          'Praha-Milán: cca 60-120 EUR',
          'Praha-Florencie: cca 100-200 EUR',
          'Praha-Bari: cca 80-160 EUR',
          'Praha-Neapol: cca 100-160 EUR'
        ]
      }
    ],
    partnerMid: {
      title: 'Chcete si porovnat dopravu a ubytování?',
      text: 'Rezervujte chytře a držte rozpočet pod kontrolou už od začátku cesty.',
      booking: 'Najít ubytování',
      gyg: 'Najít aktivity'
    },
    flightCta: {
      miniText: 'Hledáte lety na vaše termíny?',
      button: 'Hledat lety'
    },
    accommodationTitle: 'Na čem lidé při plánování nejčastěji přeplácí',
    accommodationIntro:
      'Přeplácení obvykle nevzniká jednou velkou chybou, ale sérií menších rozhodnutí. Typické je, že každá položka navýší rozpočet jen trochu, ale dohromady udělají velký rozdíl. Tady jsou nejčastější situace, ve kterých náklady zbytečně rostou:',
    accommodation: [
      'Ubytování přímo v historickém centru, kde bývají ceny za noc výrazně vyšší.',
      'Krátké víkendové pobyty, které mají často vyšší průměrnou cenu za noc než delší pobyt.',
      'Rezervace příliš pozdě během léta, kdy už zbývají jen dražší možnosti.',
      'Restaurace v nejvíce turistických zónách, kde je běžně vyšší účet.',
      'Placené parkování, které umí rozpočet navýšit rychleji, než většina lidí čeká.',
      'Plážový servis v letoviscích (lehátka a slunečník), který se často nepočítá do rozpočtu předem.',
      'Vstupenky do atrakcí kupované na poslední chvíli.'
    ],
    extraCostsTitle: 'Náklady, na které se často zapomíná',
    extraCostsIntro:
      'Tyto položky nebývají na první pohled vidět, ale v součtu mohou znamenat výrazný rozdíl. Pokud je započítáte předem, vyhnete se nepříjemnému překvapení na místě. Prakticky to znamená mít u rozpočtu i rezervu na drobné, ale pravidelné výdaje.',
    extraCosts: [
      'Turistická taxa (contributo di soggiorno), která se platí v některých městech navíc k ceně ubytování; oficiálně ji uplatňuje například Řím.',
      'Parkování ve městech a turistických lokalitách.',
      'Plážový servis v přímořských letoviscích.',
      'Vstupenky rezervované předem, které mohou být u žádaných míst prakticky nutné.',
      'Místní přesuny mezi městy, plážemi nebo výletními body.'
    ],
    savingsTitle: 'Jak ušetřit bez ztráty kvality',
    savingsIntro:
      'Šetřit neznamená cestovat hůř. U Itálie často stačí upravit několik klíčových rozhodnutí: termín, lokalitu, rezervaci a denní návyky během pobytu. Nejlepší úspory bývají ty, které nesnižují kvalitu zážitku.',
    savings: [
      'Cestujte v květnu, červnu, září nebo říjnu, kdy bývá lepší poměr cen a zážitku.',
      'Kombinujte známá místa s menšími lokalitami, které bývají cenově klidnější.',
      'Dopravu i ubytování rezervujte včas, zejména v letních termínech.',
      'Jezte mimo hlavní turistické zóny, kde je často lepší poměr kvality a ceny.',
      'Podle oblasti kombinujte vlak a auto: ve městech vlak, v menších regionech auto.'
    ],
    valueTitle: 'Kdy se Itálie vyplatí nejvíc',
    value: [
      'Pro mnoho českých cestovatelů není Itálie nutně nejlevnější destinace. Při chytrém plánování ale často nabízí velmi dobrý poměr cena/výkon.',
      'Důvod je jednoduchý: na relativně malé ploše můžete kombinovat skvělé jídlo, historii, moře, hory i velmi rozdílné regionální zážitky.',
      'Když zvolíte správný termín a realistický rozpočet, Itálie umí být finančně zvládnutelná i při kvalitním cestování.',
      'Největší hodnotu obvykle získají ti, kdo plánují trasy i výdaje dopředu a nesrovnávají jen nejnižší cenu, ale celkovou kvalitu cesty.',
      'Prakticky to znamená rozhodovat se podle typu dovolené: u městských přesunů je efektivní vlak, u menších lokalit auto a u delších tras někdy dává smysl autobus.'
    ],
    bridgeTitle: 'Zaujala vás některá část Itálie víc než jen na dovolenou?',
    bridgeText:
      'Mnoho Čechů začíná Itálii objevovat jako cestovatelé a později zjistí, že by zde chtěli trávit více času.',
    bridgeButton: 'Prohlédnout regiony Itálie',
    conclusionTitle: 'Závěr',
    conclusion: [
      'Dovolená v Itálii v roce 2026 může být finančně dobře zvládnutelná, pokud si správně nastavíte očekávání a plán.',
      'Největší rozdíl dělá dobře zvolený termín, realistický denní rozpočet a chytré rezervace dopravy i ubytování.',
      'Když tyto tři věci nepodceníte, získáte z Itálie maximum bez zbytečných přeplatků.',
      'Právě kombinace praktického plánování a flexibility na místě je nejspolehlivější cesta k tomu, aby dovolená opravdu stála za to.',
      'Pokud budete náklady sledovat průběžně už během příprav, můžete se na místě rozhodovat svobodněji a užít si Itálii tak, jak jste si ji původně představovali.'
    ]
  },
  en: {
    navGuide: 'Italy Travel Guide',
    navArticles: 'Articles',
    badge: 'Italy Travel Guide',
    title: 'How Much Does a Holiday in Italy Cost in 2026?',
    readTime: '11 min',
    intro: [
      'The cost of a holiday in Italy in 2026 depends mainly on region, season, transport choices, accommodation type, and travel style.',
      'A city break for two has a very different budget from a family road trip to the coast or a multi-region itinerary.',
      'This guide gives you a practical overview of the most relevant costs and concrete tips to avoid unnecessary spending.',
      'The goal is not to promise an unrealistically cheap trip, but to help you spend smarter and plan with realistic expectations.'
    ],
    factorsTitle: 'What Influences the Cost of a Holiday in Italy the Most',
    factorsIntro:
      'The same holiday can cost very different amounts depending on how you structure it. In practice, timing, location, trip length, and booking strategy make the biggest difference.',
    factors: [
      'Peak season vs shoulder season: July and August are usually the most expensive months.',
      'Famous cities and coastal hotspots are often pricier than smaller inland destinations.',
      'Trip length matters: short weekend stays often have a higher average nightly rate.',
      'Last-minute booking in summer is usually more expensive than booking in advance.',
      'Travel style: comfort level, transport mix, and activity choices strongly affect total cost.'
    ],
    dailyBudgetTitle: 'Indicative Daily Budget per Person (excluding flights)',
    dailyBudgetNote:
      'These are realistic orientation ranges for 2026, not fixed prices. Actual spending usually depends on region, season, and booking timing.',
    dailyBudget: [
      {
        label: 'Budget Option',
        range: 'approx. EUR 60-90 / day',
        includes: 'simple accommodation, basic meals, and cost-focused local mobility'
      },
      {
        label: 'Mid Comfort',
        range: 'approx. EUR 100-160 / day',
        includes: 'comfortable apartment or hotel, mixed dining, and balanced transport choices'
      },
      {
        label: 'More Comfortable Option',
        range: 'approx. EUR 180+ / day',
        includes: 'higher-standard accommodation, more paid activities, and higher transport flexibility'
      }
    ],
    transportTitle: 'Travel from Prague/Czechia to Italy and Around Italy',
    transportIntro:
      'Transport often has a bigger impact on total budget than people expect. It is useful to compare not just one ticket price, but total trip cost: tolls, fuel, parking, transfer time, and flexibility.',
    transportExamplesNote:
      'Examples below are indicative ranges and can change with booking date, season, route, and availability.',
    transportExampleBoxTitle: 'Indicative Example',
    transportExampleBoxNote: 'Variable amounts depending on multiple factors (not fixed fares).',
    transport: [
      {
        icon: 'car',
        title: 'Car',
        text: 'A car is often convenient for multiple travelers, smaller towns, coast, mountains, and rural areas. Include tolls, parking, and fuel costs. Fuel prices change over time and are officially monitored in the European Commission Weekly Oil Bulletin.',
        examples: ['Prague-Tarvisio: approx. EUR 80-100', 'Prague-Rome: approx. EUR 220-250']
      },
      {
        icon: 'train',
        title: 'Train',
        text: 'Train is often a strong option for city-to-city travel. The official Trenitalia Italia in Tour offer includes unlimited regional train travel for 3 consecutive days at EUR 35 or 5 days at EUR 59. For non-Italian residents, Trenitalia Pass starts at EUR 139.',
        examples: ['Prague-Milan: approx. EUR 130-160', 'Prague-Rome: approx. EUR 160-220']
      },
      {
        icon: 'bus',
        title: 'Bus',
        text: 'Long-distance buses are usually the cheapest option, but they are often slower and less comfortable than trains.',
        examples: ['Prague-Bologna: approx. EUR 60-80', 'Prague-Bari: approx. EUR 90-120']
      },
      {
        icon: 'flight',
        title: 'Flight',
        text: 'Flights are often the fastest option from Czechia to Italy, but fares can vary significantly depending on season and booking timing.',
        examples: [
          'Prague-Milan: approx. EUR 60-120',
          'Prague-Florence: approx. EUR 100-200',
          'Prague-Bari: approx. EUR 80-160',
          'Prague-Naples: approx. EUR 100-160'
        ]
      }
    ],
    partnerMid: {
      title: 'Want to compare transport and accommodation?',
      text: 'Book early and keep your budget under control from the start.',
      booking: 'Find Accommodation',
      gyg: 'Find Activities'
    },
    flightCta: {
      miniText: 'Looking for flights for your dates?',
      button: 'Search Flights'
    },
    accommodationTitle: 'Where Travelers Most Often Overspend',
    accommodationIntro:
      'Most overspending does not come from one huge mistake, but from several small decisions that add up quickly.',
    accommodation: [
      'Staying directly in a historic center where nightly rates are usually higher.',
      'Short weekend trips, which are often more expensive per night than longer stays.',
      'Booking too late for summer travel periods.',
      'Dining mostly in high-traffic tourist zones.',
      'Underestimating paid parking costs.',
      'Ignoring beach service fees in coastal resorts.',
      'Buying attraction tickets at the last minute.'
    ],
    extraCostsTitle: 'Often Overlooked Costs',
    extraCostsIntro:
      'These items are easy to miss during planning, but together they can materially change your total budget.',
    extraCosts: [
      'Tourist tax/contributo di soggiorno in some cities; Rome is a common official example.',
      'Parking costs in cities and tourist areas.',
      'Beach service fees in seaside resorts.',
      'Advance reservations for major attractions.',
      'Local transfers between cities, beaches, and day-trip points.'
    ],
    savingsTitle: 'How to Save Without Losing Quality',
    savingsIntro:
      'Saving money does not mean lowering the quality of your trip. In Italy, smart timing and routing decisions usually matter more than cutting everything.',
    savings: [
      'Travel in May, June, September, or October when possible.',
      'Combine famous destinations with smaller towns and local bases.',
      'Book transport and accommodation early.',
      'Eat outside the main tourist corridors.',
      'Use train in city-based itineraries and car where regional flexibility is needed.'
    ],
    valueTitle: 'When Italy Delivers the Best Value',
    value: [
      'For many Czech travelers, Italy is not necessarily cheap, but it can offer very strong value for money with smart planning.',
      'Food, atmosphere, history, sea, mountains, and regional diversity create high overall travel value.',
      'With realistic budgeting and good timing, Italy remains financially manageable in 2026.'
    ],
    bridgeTitle: 'Did a part of Italy interest you beyond just a holiday?',
    bridgeText:
      'Many Czech travelers first discover Italy as tourists and later realize they want to spend more time in specific regions.',
    bridgeButton: 'Explore Italian Regions',
    conclusionTitle: 'Conclusion',
    conclusion: [
      'A holiday in Italy in 2026 can still be very manageable with the right planning approach.',
      'The biggest difference comes from choosing the right travel period, setting a realistic budget, and booking transport and accommodation intelligently.',
      'If you get those fundamentals right, you can enjoy Italy without paying unnecessary premium prices.'
    ]
  },
  it: {
    navGuide: 'Guida all’Italia',
    navArticles: 'Articoli',
    badge: 'Guida all’Italia',
    title: 'Quanto costa una vacanza in Italia nel 2026?',
    readTime: '11 min',
    intro: [
      'Il costo di una vacanza in Italia nel 2026 dipende soprattutto da regione, stagione, trasporti, tipo di alloggio e stile di viaggio.',
      'Un city break di coppia ha un budget molto diverso rispetto a un viaggio in auto verso il mare o a un itinerario su più regioni.',
      'Questa guida offre una panoramica pratica dei costi più importanti e consigli utili per evitare spese superflue.',
      'L’obiettivo non è promettere una vacanza irrealisticamente economica, ma aiutarti a pianificare in modo concreto e credibile.'
    ],
    factorsTitle: 'Cosa Influisce di Più sul Costo di una Vacanza in Italia',
    factorsIntro:
      'La stessa vacanza può costare molto di più o molto di meno in base a come viene organizzata. In pratica contano soprattutto periodo, zona, durata del soggiorno e tempistiche di prenotazione.',
    factors: [
      'Alta stagione vs media stagione: luglio e agosto sono in genere i mesi più costosi.',
      'Città molto note e località costiere famose costano spesso più dei centri interni minori.',
      'Durata del viaggio: i weekend brevi tendono ad avere un costo medio per notte più alto.',
      'Last minute estivo: spesso più caro rispetto alla prenotazione anticipata.',
      'Stile di viaggio: livello di comfort, trasporti scelti e attività incidono molto sul totale.'
    ],
    dailyBudgetTitle: 'Budget Giornaliero Indicativo per Persona (senza volo)',
    dailyBudgetNote:
      'Valori orientativi realistici per il 2026, non prezzi fissi. La spesa effettiva dipende in genere da regione, stagione e anticipo di prenotazione.',
    dailyBudget: [
      {
        label: 'Versione economica',
        range: 'circa 60-90 EUR / giorno',
        includes: 'alloggio semplice, pasti essenziali e mobilità locale orientata al risparmio'
      },
      {
        label: 'Comfort medio',
        range: 'circa 100-160 EUR / giorno',
        includes: 'hotel o appartamento confortevole, ristorazione mista e trasporti equilibrati'
      },
      {
        label: 'Versione più comoda',
        range: 'circa 180 EUR e oltre / giorno',
        includes: 'alloggi di livello più alto, più attività a pagamento e maggiore flessibilità negli spostamenti'
      }
    ],
    transportTitle: 'Trasporti da Praga/Repubblica Ceca all’Italia e in Italia',
    transportIntro:
      'I trasporti incidono spesso più del previsto sul budget totale. Conviene valutare non solo il prezzo del singolo biglietto, ma il costo complessivo: pedaggi, carburante, parcheggi, tempi e flessibilità.',
    transportExamplesNote:
      'Gli esempi qui sotto sono orientativi e possono cambiare in base a periodo, disponibilità e anticipo di prenotazione.',
    transportExampleBoxTitle: 'Esempio orientativo',
    transportExampleBoxNote: 'Importi variabili dipendenti da diversi fattori (non tariffe fisse).',
    transport: [
      {
        icon: 'car',
        title: 'Auto',
        text: 'L’auto è spesso conveniente per più persone e per itinerari tra piccoli centri, mare, montagna e zone rurali. Considera pedaggi, parcheggi e carburante. I prezzi dei carburanti cambiano nel tempo e sono monitorati ufficialmente nel Weekly Oil Bulletin della Commissione Europea.',
        examples: ['Praga-Tarvisio: circa 80-100 EUR', 'Praga-Roma: circa 220-250 EUR']
      },
      {
        icon: 'train',
        title: 'Treno',
        text: 'Il treno è una soluzione forte per gli spostamenti tra città. L’offerta ufficiale Trenitalia Italia in Tour consente viaggi illimitati sui regionali per 3 giorni consecutivi a 35 EUR o per 5 giorni a 59 EUR. Per i residenti fuori dall’Italia è disponibile Trenitalia Pass da 139 EUR.',
        examples: ['Praga-Milano: circa 130-160 EUR', 'Praga-Roma: circa 160-220 EUR']
      },
      {
        icon: 'bus',
        title: 'Autobus',
        text: 'Sulle tratte lunghe è spesso l’opzione più economica, ma in genere più lenta e meno comoda del treno.',
        examples: ['Praga-Bologna: circa 60-80 EUR', 'Praga-Bari: circa 90-120 EUR']
      },
      {
        icon: 'flight',
        title: 'Volo',
        text: 'L’aereo è spesso la scelta più rapida dalla Repubblica Ceca all’Italia, ma i prezzi cambiano molto in base a stagione e tempistica.',
        examples: [
          'Praga-Milano: circa 60-120 EUR',
          'Praga-Firenze: circa 100-200 EUR',
          'Praga-Bari: circa 80-160 EUR',
          'Praga-Napoli: circa 100-160 EUR'
        ]
      }
    ],
    partnerMid: {
      title: 'Vuoi confrontare trasporti e alloggi?',
      text: 'Prenota in modo intelligente e tieni il budget sotto controllo fin dall’inizio.',
      booking: 'Trova alloggio',
      gyg: 'Trova attività'
    },
    flightCta: {
      miniText: 'Cerchi voli per le tue date?',
      button: 'Cerca voli'
    },
    accommodationTitle: 'Dove si Paga Più del Necessario',
    accommodationIntro:
      'Le spese extra raramente derivano da un solo errore: di solito nascono da tante piccole scelte che sommate pesano molto.',
    accommodation: [
      'Alloggi nel pieno centro storico, dove il prezzo per notte è spesso più alto.',
      'Weekend brevi, che possono costare più per notte rispetto ai soggiorni più lunghi.',
      'Prenotazioni fatte troppo tardi in estate.',
      'Ristoranti nelle aree più turistiche.',
      'Parcheggi a pagamento sottovalutati in fase di budget.',
      'Servizio spiaggia non considerato nei conti iniziali.',
      'Biglietti per attrazioni acquistati all’ultimo momento.'
    ],
    extraCostsTitle: 'Costi che Spesso si Sottovalutano',
    extraCostsIntro:
      'Sono spese che sembrano piccole, ma insieme possono incidere in modo importante sul totale del viaggio.',
    extraCosts: [
      'Tassa di soggiorno/contributo di soggiorno in alcune città; Roma è un esempio ufficiale.',
      'Parcheggi nelle città e nelle zone turistiche.',
      'Servizio spiaggia nelle località balneari.',
      'Prenotazioni anticipate per attrazioni molto richieste.',
      'Spostamenti locali tra città, mare ed escursioni.'
    ],
    savingsTitle: 'Come Risparmiare Senza Perdere Qualità',
    savingsIntro:
      'Risparmiare non significa viaggiare peggio. In Italia la differenza reale la fanno soprattutto periodo, prenotazione e scelta delle aree.',
    savings: [
      'Viaggia in maggio, giugno, settembre o ottobre quando possibile.',
      'Combina mete famose con località più piccole.',
      'Prenota in anticipo trasporti e alloggi.',
      'Mangia fuori dalle principali zone turistiche.',
      'Combina treno e auto in base alla zona.'
    ],
    valueTitle: 'Quando l’Italia Conviene Davvero',
    value: [
      'Per molti viaggiatori cechi l’Italia non è necessariamente economica, ma con buona pianificazione offre spesso un ottimo rapporto qualità-prezzo.',
      'Cibo, atmosfera, patrimonio storico, mare, montagne e varietà territoriale aumentano il valore complessivo del viaggio.',
      'Con periodo giusto e budget realistico, una vacanza in Italia resta assolutamente gestibile anche nel 2026.'
    ],
    bridgeTitle: 'Ti ha colpito una parte d’Italia oltre la vacanza?',
    bridgeText:
      'Molti cechi iniziano a conoscere l’Italia da viaggiatori e poi scoprono che vorrebbero passare più tempo in alcune regioni.',
    bridgeButton: 'Scopri le regioni d’Italia',
    conclusionTitle: 'Conclusione',
    conclusion: [
      'Una vacanza in Italia nel 2026 può restare molto gestibile se pianifichi in modo concreto.',
      'A fare la differenza sono soprattutto periodo di viaggio, budget realistico e prenotazioni intelligenti di trasporti e alloggi.',
      'Con queste basi puoi goderti l’Italia evitando spese non necessarie.'
    ]
  }
}

function formatDate(language, value) {
  const locale = language === 'cs' ? 'cs-CZ' : language === 'it' ? 'it-IT' : 'en-US'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })
}

function TransportIcon({ type }) {
  if (type === 'car') return <Car className="h-5 w-5 text-slate-700" />
  if (type === 'train') return <Train className="h-5 w-5 text-slate-700" />
  if (type === 'flight') return <Plane className="h-5 w-5 text-slate-700" />
  return <Bus className="h-5 w-5 text-slate-700" />
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

export default function HolidayCostsItaly2026Page() {
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
  const articleImage =
    language === 'cs'
      ? {
          src: '/house_amalfi.jpg',
          alt: 'Dovolená v Itálii a plánování rozpočtu',
          caption: 'Celkovy rozpocet na dovolenou nejvice ovlivni termin, region a zvoleny styl cestování.'
        }
      : language === 'it'
        ? {
            src: '/house_amalfi.jpg',
            alt: 'Vacanza in Italia e pianificazione del budget',
            caption: 'Il budget finale di una vacanza dipende soprattutto da periodo, regione e stile di viaggio.'
          }
        : {
            src: '/house_amalfi.jpg',
            alt: 'Holiday budget planning in Italy',
            caption: 'Your total holiday budget depends mostly on timing, region, and travel style.'
          }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <main className="pt-28 pb-16 md:pb-24">
        <div className="container mx-auto px-6" style={{ maxWidth: '1200px' }}>
          <article className="max-w-4xl mx-auto space-y-8" style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
            <Button asChild variant="outline" className="inline-flex items-center border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-700">
              <Link href="/články/průvodce-italii">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.navArticles}
              </Link>
            </Button>

            <header className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-slate-100 border border-slate-200 text-slate-700 mb-4">
                <Euro className="h-3.5 w-3.5" />
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

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <Image src={articleImage.src} alt={articleImage.alt} width={1400} height={800} sizes="(min-width: 768px) 768px, 100vw" className="w-full h-64 md:h-80 object-cover" />
              <p className="text-sm text-slate-600 px-4 py-3">{articleImage.caption}</p>
            </div>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.factorsTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                {t.factorsIntro ? <p className="text-slate-700 leading-relaxed mb-4">{t.factorsIntro}</p> : null}
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.factors.map((factor) => (
                    <li key={factor}>{factor}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <a href="https://www.anrdoezrs.net/click-101629596-17227920" target="_top" rel="sponsored noopener noreferrer">
                <img
                  src="https://www.lduhtrp.net/image-101629596-17227920"
                  width="480"
                  height="260"
                  alt=""
                  border="0"
                  className="w-full max-w-[480px] h-auto rounded-xl"
                />
              </a>
            </div>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.dailyBudgetTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">{t.dailyBudgetNote}</p>
                <div className="space-y-3">
                  {t.dailyBudget.map((item) => (
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
                <CardTitle className="mb-8">{t.transportTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {t.transportIntro ? <p className="text-slate-700 leading-relaxed mb-2">{t.transportIntro}</p> : null}
                {t.transportExamplesNote ? <p className="text-sm text-slate-500 mb-2">{t.transportExamplesNote}</p> : null}
                {t.transport.map((item) => (
                  <div key={item.title} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                      <TransportIcon type={item.icon} />
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">{item.text}</p>
                    {item.icon === 'flight' ? (
                      <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50/70 p-3">
                        <p className="text-xs text-slate-700 mb-2">{t.flightCta.miniText}</p>
                        <Button asChild size="sm" className="bg-sky-700 hover:bg-sky-600 text-white">
                          <a href={FLIGHTS_PARTNER_LINKS.homepage} target="_top" rel="nofollow sponsored noopener noreferrer">
                            {t.flightCta.button}
                          </a>
                        </Button>
                        <img
                          src={FLIGHTS_PARTNER_LINKS.trackingPixel}
                          width="1"
                          height="1"
                          alt=""
                          className="sr-only"
                        />
                      </div>
                    ) : null}
                    {item.examples?.length ? (
                      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 mb-1">
                          {t.transportExampleBoxTitle}
                        </p>
                        <p className="text-xs text-amber-800/90 mb-2">{t.transportExampleBoxNote}</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                          {item.examples.map((example) => (
                            <li key={example}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
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
                <CardTitle className="mb-8">{t.accommodationTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                {t.accommodationIntro ? <p className="text-slate-700 leading-relaxed mb-4">{t.accommodationIntro}</p> : null}
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.accommodation.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.extraCostsTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                {t.extraCostsIntro ? <p className="text-slate-700 leading-relaxed mb-4">{t.extraCostsIntro}</p> : null}
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.extraCosts.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.savingsTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                {t.savingsIntro ? <p className="text-slate-700 leading-relaxed mb-4">{t.savingsIntro}</p> : null}
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  {t.savings.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="mb-8">{t.valueTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-slate-700 leading-relaxed">
                {t.value.map((line) => (
                  <p key={line}>{line}</p>
                ))}
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
        </div>
      </main>

      <PropertySlider language={language} />
      <Footer language={language} />
    </div>
  )
}
