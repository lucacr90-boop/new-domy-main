'use client'

import { useState, useEffect } from 'react'
import { MapPin, TrendingUp, Home, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'

const REGION_DATA = {
  'abruzzo': {
    name: { en: 'Abruzzo', it: 'Abruzzo', cs: 'Abruzzo' },
    slug: 'abruzzo',
    country: 'Italy',
    description: { 
      en: 'Wild mountains, pristine beaches, and authentic Italian culture. Known for its national parks and traditional villages.',
      it: 'Montagne selvagge, spiagge incontaminate e cultura italiana autentica.',
      cs: 'Divoké hory, nedotčené pláže a autentická italská kultura.'
    },
    image: '/abruzzo.jpg',
    propertyCount: 180,
    averagePrice: 320000,
    priceRange: { min: 120000, max: 1800000 },
    topCities: ['L\'Aquila', 'Pescara', 'Chieti', 'Teramo'],
    highlights: ['National parks', 'Mountain retreats', 'Coastal towns', 'Authentic culture']
  },
  'basilicata': {
    name: { en: 'Basilicata', it: 'Basilicata', cs: 'Basilicata' },
    slug: 'basilicata',
    country: 'Italy',
    description: { 
      en: 'Undiscovered gem with ancient cave dwellings, dramatic landscapes, and rich history. Perfect for authentic Italian experience.',
      it: 'Gioiello nascosto con antiche abitazioni rupestri, paesaggi drammatici e ricca storia.',
      cs: 'Nedotčený klenot s prastarými jeskynními obydlími a dramatickou krajinou.'
    },
    image: '/Basilicata.jpg',
    propertyCount: 95,
    averagePrice: 280000,
    priceRange: { min: 80000, max: 1200000 },
    topCities: ['Potenza', 'Matera', 'Policoro', 'Melfi'],
    highlights: ['Cave dwellings', 'Ancient history', 'Unspoiled nature', 'Cultural heritage']
  },
  'calabria': {
    name: { en: 'Calabria', it: 'Calabria', cs: 'Kalábrie' },
    slug: 'calabria',
    country: 'Italy',
    description: { 
      en: 'Southern charm with stunning coastlines, ancient Greek ruins, and affordable Mediterranean living.',
      it: 'Fascino meridionale con coste mozzafiato, rovine greche antiche e vita mediterranea accessibile.',
      cs: 'Jižní kouzlo s úchvatnými pobřežími a dostupným středomořským životem.'
    },
    image: '/calabria.jpg',
    propertyCount: 220,
    averagePrice: 250000,
    priceRange: { min: 60000, max: 1500000 },
    topCities: ['Catanzaro', 'Reggio Calabria', 'Cosenza', 'Crotone'],
    highlights: ['Coastal living', 'Greek ruins', 'Affordable prices', 'Mediterranean climate']
  },
  'campania': {
    name: { en: 'Campania', it: 'Campania', cs: 'Kampánie' },
    slug: 'campania',
    country: 'Italy',
    description: { 
      en: 'Home to Naples, Pompeii, and the Amalfi Coast. Rich history, vibrant culture, and stunning coastal beauty.',
      it: 'Casa di Napoli, Pompei e la Costiera Amalfitana. Storia ricca, cultura vibrante e bellezza costiera mozzafiato.',
      cs: 'Domov Neapole, Pompejí a Amalfitského pobřeží s bohatou historií.'
    },
    image: '/campania.avif',
    propertyCount: 450,
    averagePrice: 680000,
    priceRange: { min: 200000, max: 4000000 },
    topCities: ['Naples', 'Salerno', 'Caserta', 'Avellino'],
    highlights: ['Historic sites', 'Coastal beauty', 'Vibrant culture', 'UNESCO heritage']
  },
  'emilia-romagna': {
    name: { en: 'Emilia-Romagna', it: 'Emilia-Romagna', cs: 'Emilia-Romagna' },
    slug: 'emilia-romagna',
    country: 'Italy',
    description: { 
      en: 'Culinary capital of Italy with Bologna, Parma, and Modena. Rich food culture, historic cities, and excellent quality of life.',
      it: 'Capitale culinaria d\'Italia con Bologna, Parma e Modena. Ricca cultura alimentare e qualità di vita eccellente.',
      cs: 'Kulinářské hlavní město Itálie s bohatou potravinovou kulturou.'
    },
    image: '/Emilia-Romagna.jpg',
    propertyCount: 380,
    averagePrice: 520000,
    priceRange: { min: 180000, max: 2500000 },
    topCities: ['Bologna', 'Parma', 'Modena', 'Ravenna'],
    highlights: ['Food culture', 'Historic cities', 'Quality of life', 'Economic stability']
  },
  'friuli-venezia-giulia': {
    name: { en: 'Friuli-Venezia Giulia', it: 'Friuli-Venezia Giulia', cs: 'Friuli-Venezia Giulia' },
    slug: 'friuli-venezia-giulia',
    country: 'Italy',
    description: { 
      en: 'Northeastern border region with Alpine beauty, Adriatic coast, and unique cultural blend of Italian, Austrian, and Slovenian influences.',
      it: 'Regione di confine nordorientale con bellezza alpina, costa adriatica e unico mix culturale.',
      cs: 'Severovýchodní pohraniční region s alpskou krásou a jedinečným kulturním mixem.'
    },
    image: '/Friuli-Venezia Giulia.avif',
    propertyCount: 160,
    averagePrice: 450000,
    priceRange: { min: 150000, max: 2000000 },
    topCities: ['Trieste', 'Udine', 'Pordenone', 'Gorizia'],
    highlights: ['Alpine beauty', 'Cultural diversity', 'Adriatic coast', 'Border charm']
  },
  'lazio': {
    name: { en: 'Lazio', it: 'Lazio', cs: 'Lazio' },
    slug: 'lazio',
    country: 'Italy',
    description: { 
      en: 'Home to Rome, the Eternal City. Rich history, ancient monuments, and vibrant modern life in Italy\'s capital region.',
      it: 'Casa di Roma, la Città Eterna. Storia ricca, monumenti antichi e vita moderna vibrante.',
      cs: 'Domov Říma, věčného města, s bohatou historií a antickými památkami.'
    },
    image: '/Lazio.webp',
    propertyCount: 680,
    averagePrice: 750000,
    priceRange: { min: 250000, max: 5000000 },
    topCities: ['Rome', 'Viterbo', 'Latina', 'Frosinone'],
    highlights: ['Ancient history', 'Capital city', 'Cultural sites', 'Modern amenities']
  },
  'liguria': {
    name: { en: 'Liguria', it: 'Liguria', cs: 'Ligurie' },
    slug: 'liguria',
    country: 'Italy',
    description: { 
      en: 'Italian Riviera with Cinque Terre, coastal charm, and colorful seaside villages. Perfect for coastal living enthusiasts.',
      it: 'Riviera italiana con le Cinque Terre, fascino costiero e villaggi colorati.',
      cs: 'Italská riviéra s Cinque Terre, pobřežní kouzlo a barevné přímořské vesnice.'
    },
    image: '/Liguria.webp',
    propertyCount: 420,
    averagePrice: 950000,
    priceRange: { min: 250000, max: 4500000 },
    topCities: ['Genoa', 'Portofino', 'Cinque Terre', 'Sanremo'],
    highlights: ['Coastal living', 'Cinque Terre', 'Seaside villas', 'Italian Riviera']
  },
  'lombardy': {
    name: { en: 'Lombardy', it: 'Lombardia', cs: 'Lombardie' },
    slug: 'lombardy',
    country: 'Italy',
    description: { 
      en: 'Economic powerhouse of Italy with Milan as its capital. Modern properties, business opportunities, and alpine retreats.',
      it: 'Potenza economica d\'Italia con Milano come capitale.',
      cs: 'Ekonomická mocnost Itálie s Milánem jako hlavním městem.'
    },
    image: '/Lombardia.jpg',
    propertyCount: 2100,
    averagePrice: 1200000,
    priceRange: { min: 300000, max: 10000000 },
    topCities: ['Milan', 'Bergamo', 'Brescia', 'Como'],
    highlights: ['Business hub', 'Modern apartments', 'Lake properties', 'Alps access']
  },
  'marche': {
    name: { en: 'Marche', it: 'Marche', cs: 'Marche' },
    slug: 'marche',
    country: 'Italy',
    description: { 
      en: 'Hidden gem with rolling hills, medieval towns, and Adriatic coastline. Authentic Italian lifestyle away from crowds.',
      it: 'Gioiello nascosto con colline ondulate, città medievali e costa adriatica.',
      cs: 'Skrytý klenot se zvlněnými kopci a středověkými městy.'
    },
    image: '/Marche.jpg',
    propertyCount: 195,
    averagePrice: 380000,
    priceRange: { min: 120000, max: 1800000 },
    topCities: ['Ancona', 'Pesaro', 'Macerata', 'Ascoli Piceno'],
    highlights: ['Rolling hills', 'Medieval towns', 'Adriatic coast', 'Authentic lifestyle']
  },
  'molise': {
    name: { en: 'Molise', it: 'Molise', cs: 'Molise' },
    slug: 'molise',
    country: 'Italy',
    description: { 
      en: 'Italy\'s smallest region with untouched nature, ancient traditions, and peaceful countryside living.',
      it: 'La più piccola regione d\'Italia con natura incontaminata e tradizioni antiche.',
      cs: 'Nejmenší region Itálie s nedotčenou přírodou a prastarými tradicemi.'
    },
    image: '/Molise.jpeg',
    propertyCount: 85,
    averagePrice: 220000,
    priceRange: { min: 70000, max: 800000 },
    topCities: ['Campobasso', 'Isernia', 'Termoli', 'Venafro'],
    highlights: ['Untouched nature', 'Ancient traditions', 'Peaceful living', 'Affordable prices']
  },
  'piemonte': {
    name: { en: 'Piedmont', it: 'Piemonte', cs: 'Piemont' },
    slug: 'piemonte',
    country: 'Italy',
    description: { 
      en: 'Alpine beauty, world-class wines, and elegant cities. Home to Turin and the Langhe wine region.',
      it: 'Bellezza alpina, vini di classe mondiale e città eleganti.',
      cs: 'Alpská krása, vína světové úrovně a elegantní města.'
    },
    image: '/Piemonte.jpg',
    propertyCount: 320,
    averagePrice: 580000,
    priceRange: { min: 200000, max: 3000000 },
    topCities: ['Turin', 'Alessandria', 'Asti', 'Cuneo'],
    highlights: ['Alpine beauty', 'Wine regions', 'Elegant cities', 'Cultural heritage']
  },
  'puglia': {
    name: { en: 'Puglia', it: 'Puglia', cs: 'Puglia' },
    slug: 'puglia',
    country: 'Italy',
    description: { 
      en: 'Heel of Italy with whitewashed trulli houses, olive groves, and stunning Adriatic coastline. Authentic southern charm.',
      it: 'Tallone d\'Italia con trulli imbiancati, uliveti e costa adriatica mozzafiato.',
      cs: 'Pata Itálie s bílými trulli domy a úchvatným Jadranským pobřežím.'
    },
    image: '/Puglia.webp',
    propertyCount: 280,
    averagePrice: 350000,
    priceRange: { min: 100000, max: 2000000 },
    topCities: ['Bari', 'Lecce', 'Taranto', 'Foggia'],
    highlights: ['Trulli houses', 'Olive groves', 'Adriatic coast', 'Southern charm']
  },
  'sardegna': {
    name: { en: 'Sardinia', it: 'Sardegna', cs: 'Sardinie' },
    slug: 'sardegna',
    country: 'Italy',
    description: { 
      en: 'Mediterranean island paradise with pristine beaches, ancient nuraghe towers, and unique culture.',
      it: 'Paradiso dell\'isola mediterranea con spiagge incontaminate e torri nuragiche antiche.',
      cs: 'Středomořský ostrovní ráj s nedotčenými plážemi a prastarými nuragskými věžemi.'
    },
    image: '/Sardegna.jpg',
    propertyCount: 340,
    averagePrice: 480000,
    priceRange: { min: 150000, max: 2500000 },
    topCities: ['Cagliari', 'Sassari', 'Olbia', 'Alghero'],
    highlights: ['Pristine beaches', 'Ancient towers', 'Island culture', 'Mediterranean paradise']
  },
  'sicilia': {
    name: { en: 'Sicily', it: 'Sicilia', cs: 'Sicílie' },
    slug: 'sicilia',
    country: 'Italy',
    description: { 
      en: 'Italy\'s largest island offering diverse landscapes from beaches to mountains, rich history, and excellent value properties.',
      it: 'La più grande isola d\'Italia che offre paesaggi diversi dalle spiagge alle montagne.',
      cs: 'Největší ostrov Itálie nabízející rozmanité krajiny od pláží po hory.'
    },
    image: '/Sicilia.jpg',
    propertyCount: 890,
    averagePrice: 420000,
    priceRange: { min: 80000, max: 3000000 },
    topCities: ['Palermo', 'Catania', 'Taormina', 'Syracuse'],
    highlights: ['Affordable prices', 'Beach properties', 'Historic sites', 'Island lifestyle']
  },
  'toscana': {
    name: { en: 'Tuscany', it: 'Toscana', cs: 'Toskánsko' },
    slug: 'toscana',
    country: 'Italy',
    description: { 
      en: 'Rolling hills, medieval towns, and world-class wines define this iconic Italian region. Home to Florence, Siena, and countless vineyards.',
      it: 'Colline ondulate, città medievali e vini di classe mondiale definiscono questa iconica regione italiana.',
      cs: 'Zvlněné kopce, středověká města a vína světové úrovně definují tuto ikonickou italskou oblast.'
    },
    image: '/Toscana.png',
    propertyCount: 1250,
    averagePrice: 850000,
    priceRange: { min: 200000, max: 5000000 },
    topCities: ['Florence', 'Siena', 'Pisa', 'Lucca'],
    highlights: ['Wine regions', 'Historic cities', 'Art & culture', 'Countryside villas']
  },
  'trentino-alto-adige': {
    name: { en: 'Trentino-Alto Adige', it: 'Trentino-Alto Adige', cs: 'Trentino-Alto Adige' },
    slug: 'trentino-alto-adige',
    country: 'Italy',
    description: { 
      en: 'Alpine paradise with Dolomites, pristine lakes, and unique blend of Italian and Austrian cultures.',
      it: 'Paradiso alpino con le Dolomiti, laghi incontaminati e unico mix di culture italiana e austriaca.',
      cs: 'Alpský ráj s Dolomity a jedinečným mixem italské a rakouské kultury.'
    },
    image: '/Trentino-Alto Adige.jpg',
    propertyCount: 180,
    averagePrice: 650000,
    priceRange: { min: 200000, max: 3500000 },
    topCities: ['Trento', 'Bolzano', 'Merano', 'Rovereto'],
    highlights: ['Dolomites', 'Alpine lakes', 'Cultural blend', 'Mountain retreats']
  },
  'umbria': {
    name: { en: 'Umbria', it: 'Umbria', cs: 'Umbrie' },
    slug: 'umbria',
    country: 'Italy',
    description: { 
      en: 'Green heart of Italy with medieval hill towns, spiritual heritage, and peaceful countryside. Perfect for authentic Italian living.',
      it: 'Cuore verde d\'Italia con borghi medievali, patrimonio spirituale e campagna pacifica.',
      cs: 'Zelené srdce Itálie se středověkými městečky a klidným venkovem.'
    },
    image: '/Umbria.webp',
    propertyCount: 165,
    averagePrice: 420000,
    priceRange: { min: 150000, max: 1800000 },
    topCities: ['Perugia', 'Assisi', 'Terni', 'Spoleto'],
    highlights: ['Hill towns', 'Spiritual heritage', 'Green landscapes', 'Peaceful living']
  },
  'valle-d-aosta': {
    name: { en: 'Valle d\'Aosta', it: 'Valle d\'Aosta', cs: 'Valle d\'Aosta' },
    slug: 'valle-d-aosta',
    country: 'Italy',
    description: { 
      en: 'Mountain paradise with highest peaks in Europe, ski resorts, and French-Italian culture blend.',
      it: 'Paradiso montano con le vette più alte d\'Europa, stazioni sciistiche e mix culturale franco-italiano.',
      cs: 'Horské království s nejvyššími vrcholy Evropy a lyžařskými středisky.'
    },
    image: '/Valle d\'Aosta.jpg',
    propertyCount: 75,
    averagePrice: 720000,
    priceRange: { min: 250000, max: 4000000 },
    topCities: ['Aosta', 'Courmayeur', 'Cervinia', 'La Thuile'],
    highlights: ['Highest peaks', 'Ski resorts', 'Mountain culture', 'French influence']
  },
  'veneto': {
    name: { en: 'Veneto', it: 'Veneto', cs: 'Veneto' },
    slug: 'veneto',
    country: 'Italy',
    description: { 
      en: 'Home to Venice, Verona, and Lake Garda. Rich history, romantic cities, and diverse landscapes from mountains to coast.',
      it: 'Casa di Venezia, Verona e il Lago di Garda. Storia ricca, città romantiche e paesaggi diversi.',
      cs: 'Domov Benátek, Verony a Lago di Garda s bohatou historií.'
    },
    image: '/Veneto.webp',
    propertyCount: 520,
    averagePrice: 680000,
    priceRange: { min: 200000, max: 4000000 },
    topCities: ['Venice', 'Verona', 'Padua', 'Vicenza'],
    highlights: ['Romantic cities', 'Lake Garda', 'Rich history', 'Diverse landscapes']
  }
}

function RegionBanner({ regionSlug, language = 'cs', onClose }) {
  const [region, setRegion] = useState(null)

  useEffect(() => {
    if (regionSlug && REGION_DATA[regionSlug]) {
      setRegion(REGION_DATA[regionSlug])
    }
  }, [regionSlug])

  if (!region) return null

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatPriceRange = (min, max) => {
    return `${formatPrice(min)} - ${formatPrice(max)}`
  }

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl shadow-lg">
      {/* Background Image with Overlay */}
      <div className="relative h-80 md:h-72">
        <Image
          src={region.image}
          alt={region.name[language]}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/40" />
        
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-2 text-white hover:bg-white/30 transition-colors duration-200"
            aria-label="Close banner"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center py-6">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            {/* Region Title and Location */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-white/90">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{region.country}</span>
                </div>
              </div>
              <h1 className="font-bold text-white mb-2 tracking-tight">
                {region.name[language]}
              </h1>
              <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-2xl">
                {region.description[language]}
              </p>
            </div>

            {/* Stats and Info - Compact inline version */}
            <div className="flex flex-wrap gap-4 mb-4 items-center">
              <div className="flex items-center gap-2 text-white">
                <Home className="h-4 w-4 text-white/80" />
                <div>
                  <span className="font-bold">{region.propertyCount.toLocaleString()}</span>
                  <span className="text-sm text-white/80 ml-1">
                    {language === 'cs' ? 'nemovitostí' : 
                     language === 'it' ? 'proprietà' : 
                     'properties'}
                  </span>
                </div>
              </div>
              
              <div className="h-4 w-px bg-white/30"></div>
              
              <div className="flex items-center gap-2 text-white">
                <TrendingUp className="h-4 w-4 text-white/80" />
                <div>
                  <span className="text-sm text-white/80">
                    {language === 'cs' ? 'Průměr' : 
                     language === 'it' ? 'Media' : 
                     'Avg'}:
                  </span>
                  <span className="font-bold ml-1">{formatPrice(region.averagePrice)}</span>
                </div>
              </div>
              
              <div className="h-4 w-px bg-white/30"></div>
              
              <div className="flex flex-wrap gap-2">
                {region.topCities.slice(0, 3).map((city, index) => (
                  <Badge 
                    key={index} 
                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs px-2 py-0.5"
                  >
                    {city}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegionBanner
