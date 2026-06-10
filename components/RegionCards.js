'use client'

import { useState } from 'react'
import { MapPin, TrendingUp, Home, ChevronRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'

const ITALIAN_REGIONS = [
  {
    id: 'abruzzo',
    name: { en: 'Abruzzo', it: 'Abruzzo', cs: 'Abruzzo' },
    slug: 'abruzzo',
    image: '/abruzzo.jpg',
    description: {
      en: 'Wild mountains, pristine beaches, and authentic Italian culture. Known for its national parks and traditional villages.',
      it: 'Montagne selvagge, spiagge incontaminate e cultura italiana autentica.',
      cs: 'Divoké hory, nedotčené pláže a autentická italská kultura.'
    },
    propertyCount: 180,
    averagePrice: 320000,
    priceRange: { min: 120000, max: 1800000 },
    topCities: ['L\'Aquila', 'Pescara', 'Chieti', 'Teramo'],
    highlights: ['National parks', 'Mountain retreats', 'Coastal towns', 'Authentic culture'],
    popularity: 3
  },
  {
    id: 'basilicata',
    name: { en: 'Basilicata', it: 'Basilicata', cs: 'Basilicata' },
    slug: 'basilicata',
    image: '/Basilicata.jpg',
    description: {
      en: 'Undiscovered gem with ancient cave dwellings, dramatic landscapes, and rich history. Perfect for authentic Italian experience.',
      it: 'Gioiello nascosto con antiche abitazioni rupestri, paesaggi drammatici e ricca storia.',
      cs: 'Nedotčený klenot s prastarými jeskynními obydlími a dramatickou krajinou.'
    },
    propertyCount: 95,
    averagePrice: 280000,
    priceRange: { min: 80000, max: 1200000 },
    topCities: ['Potenza', 'Matera', 'Policoro', 'Melfi'],
    highlights: ['Cave dwellings', 'Ancient history', 'Unspoiled nature', 'Cultural heritage'],
    popularity: 2
  },
  {
    id: 'calabria',
    name: { en: 'Calabria', it: 'Calabria', cs: 'Kalábrie' },
    slug: 'calabria',
    image: '/calabria.jpg',
    description: {
      en: 'Southern charm with stunning coastlines, ancient Greek ruins, and affordable Mediterranean living.',
      it: 'Fascino meridionale con coste mozzafiato, rovine greche antiche e vita mediterranea accessibile.',
      cs: 'Jižní kouzlo s úchvatnými pobřežími a dostupným středomořským životem.'
    },
    propertyCount: 220,
    averagePrice: 250000,
    priceRange: { min: 60000, max: 1500000 },
    topCities: ['Catanzaro', 'Reggio Calabria', 'Cosenza', 'Crotone'],
    highlights: ['Coastal living', 'Greek ruins', 'Affordable prices', 'Mediterranean climate'],
    popularity: 3
  },
  {
    id: 'campania',
    name: { en: 'Campania', it: 'Campania', cs: 'Kampánie' },
    slug: 'campania',
    image: '/campania.avif',
    description: {
      en: 'Home to Naples, Pompeii, and the Amalfi Coast. Rich history, vibrant culture, and stunning coastal beauty.',
      it: 'Casa di Napoli, Pompei e la Costiera Amalfitana. Storia ricca, cultura vibrante e bellezza costiera mozzafiato.',
      cs: 'Domov Neapole, Pompejí a Amalfitského pobřeží s bohatou historií.'
    },
    propertyCount: 450,
    averagePrice: 680000,
    priceRange: { min: 200000, max: 4000000 },
    topCities: ['Naples', 'Salerno', 'Caserta', 'Avellino'],
    highlights: ['Historic sites', 'Coastal beauty', 'Vibrant culture', 'UNESCO heritage'],
    popularity: 4
  },
  {
    id: 'emilia-romagna',
    name: { en: 'Emilia-Romagna', it: 'Emilia-Romagna', cs: 'Emilia-Romagna' },
    slug: 'emilia-romagna',
    image: '/Emilia-Romagna.jpg',
    description: {
      en: 'Culinary capital of Italy with Bologna, Parma, and Modena. Rich food culture, historic cities, and excellent quality of life.',
      it: 'Capitale culinaria d\'Italia con Bologna, Parma e Modena. Ricca cultura alimentare e qualità di vita eccellente.',
      cs: 'Kulinářské hlavní město Itálie s bohatou potravinovou kulturou.'
    },
    propertyCount: 380,
    averagePrice: 520000,
    priceRange: { min: 180000, max: 2500000 },
    topCities: ['Bologna', 'Parma', 'Modena', 'Ravenna'],
    highlights: ['Food culture', 'Historic cities', 'Quality of life', 'Economic stability'],
    popularity: 4
  },
  {
    id: 'friuli-venezia-giulia',
    name: { en: 'Friuli-Venezia Giulia', it: 'Friuli-Venezia Giulia', cs: 'Friuli-Venezia Giulia' },
    slug: 'friuli-venezia-giulia',
    image: '/Friuli-Venezia Giulia.avif',
    description: {
      en: 'Northeastern border region with Alpine beauty, Adriatic coast, and unique cultural blend of Italian, Austrian, and Slovenian influences.',
      it: 'Regione di confine nordorientale con bellezza alpina, costa adriatica e unico mix culturale.',
      cs: 'Severovýchodní pohraniční region s alpskou krásou a jedinečným kulturním mixem.'
    },
    propertyCount: 160,
    averagePrice: 450000,
    priceRange: { min: 150000, max: 2000000 },
    topCities: ['Trieste', 'Udine', 'Pordenone', 'Gorizia'],
    highlights: ['Alpine beauty', 'Cultural diversity', 'Adriatic coast', 'Border charm'],
    popularity: 3
  },
  {
    id: 'lazio',
    name: { en: 'Lazio', it: 'Lazio', cs: 'Lazio' },
    slug: 'lazio',
    image: '/Lazio.webp',
    description: {
      en: 'Home to Rome, the Eternal City. Rich history, ancient monuments, and vibrant modern life in Italy\'s capital region.',
      it: 'Casa di Roma, la Città Eterna. Storia ricca, monumenti antichi e vita moderna vibrante.',
      cs: 'Domov Říma, věčného města, s bohatou historií a antickými památkami.'
    },
    propertyCount: 680,
    averagePrice: 750000,
    priceRange: { min: 250000, max: 5000000 },
    topCities: ['Rome', 'Viterbo', 'Latina', 'Frosinone'],
    highlights: ['Ancient history', 'Capital city', 'Cultural sites', 'Modern amenities'],
    popularity: 5
  },
  {
    id: 'liguria',
    name: { en: 'Liguria', it: 'Liguria', cs: 'Ligurie' },
    slug: 'liguria',
    image: '/Liguria.webp',
    description: {
      en: 'Italian Riviera with Cinque Terre, coastal charm, and colorful seaside villages. Perfect for coastal living enthusiasts.',
      it: 'Riviera italiana con le Cinque Terre, fascino costiero e villaggi colorati.',
      cs: 'Italská riviéra s Cinque Terre, pobřežní kouzlo a barevné přímořské vesnice.'
    },
    propertyCount: 420,
    averagePrice: 950000,
    priceRange: { min: 250000, max: 4500000 },
    topCities: ['Genoa', 'Portofino', 'Cinque Terre', 'Sanremo'],
    highlights: ['Coastal living', 'Cinque Terre', 'Seaside villas', 'Italian Riviera'],
    popularity: 4
  },
  {
    id: 'lombardy',
    name: { en: 'Lombardy', it: 'Lombardia', cs: 'Lombardie' },
    slug: 'lombardy',
    image: '/Lombardia.jpg',
    description: {
      en: 'Economic powerhouse of Italy with Milan as its capital. Modern properties, business opportunities, and alpine retreats.',
      it: 'Potenza economica d\'Italia con Milano come capitale.',
      cs: 'Ekonomická mocnost Itálie s Milánem jako hlavním městem.'
    },
    propertyCount: 2100,
    averagePrice: 1200000,
    priceRange: { min: 300000, max: 10000000 },
    topCities: ['Milan', 'Bergamo', 'Brescia', 'Como'],
    highlights: ['Business hub', 'Modern apartments', 'Lake properties', 'Alps access'],
    popularity: 5
  },
  {
    id: 'marche',
    name: { en: 'Marche', it: 'Marche', cs: 'Marche' },
    slug: 'marche',
    image: '/Marche.jpg',
    description: {
      en: 'Hidden gem with rolling hills, medieval towns, and Adriatic coastline. Authentic Italian lifestyle away from crowds.',
      it: 'Gioiello nascosto con colline ondulate, città medievali e costa adriatica.',
      cs: 'Skrytý klenot se zvlněnými kopci a středověkými městy.'
    },
    propertyCount: 195,
    averagePrice: 380000,
    priceRange: { min: 120000, max: 1800000 },
    topCities: ['Ancona', 'Pesaro', 'Macerata', 'Ascoli Piceno'],
    highlights: ['Rolling hills', 'Medieval towns', 'Adriatic coast', 'Authentic lifestyle'],
    popularity: 3
  },
  {
    id: 'molise',
    name: { en: 'Molise', it: 'Molise', cs: 'Molise' },
    slug: 'molise',
    image: '/Molise.jpeg',
    description: {
      en: 'Italy\'s smallest region with untouched nature, ancient traditions, and peaceful countryside living.',
      it: 'La più piccola regione d\'Italia con natura incontaminata e tradizioni antiche.',
      cs: 'Nejmenší region Itálie s nedotčenou přírodou a prastarými tradicemi.'
    },
    propertyCount: 85,
    averagePrice: 220000,
    priceRange: { min: 70000, max: 800000 },
    topCities: ['Campobasso', 'Isernia', 'Termoli', 'Venafro'],
    highlights: ['Untouched nature', 'Ancient traditions', 'Peaceful living', 'Affordable prices'],
    popularity: 2
  },
  {
    id: 'piemonte',
    name: { en: 'Piedmont', it: 'Piemonte', cs: 'Piemont' },
    slug: 'piemonte',
    image: '/Piemonte.jpg',
    description: {
      en: 'Alpine beauty, world-class wines, and elegant cities. Home to Turin and the Langhe wine region.',
      it: 'Bellezza alpina, vini di classe mondiale e città eleganti.',
      cs: 'Alpská krása, vína světové úrovně a elegantní města.'
    },
    propertyCount: 320,
    averagePrice: 580000,
    priceRange: { min: 200000, max: 3000000 },
    topCities: ['Turin', 'Alessandria', 'Asti', 'Cuneo'],
    highlights: ['Alpine beauty', 'Wine regions', 'Elegant cities', 'Cultural heritage'],
    popularity: 4
  },
  {
    id: 'puglia',
    name: { en: 'Puglia', it: 'Puglia', cs: 'Puglia' },
    slug: 'puglia',
    image: '/Puglia.webp',
    description: {
      en: 'Heel of Italy with whitewashed trulli houses, olive groves, and stunning Adriatic coastline. Authentic southern charm.',
      it: 'Tallone d\'Italia con trulli imbiancati, uliveti e costa adriatica mozzafiato.',
      cs: 'Pata Itálie s bílými trulli domy a úchvatným Jadranským pobřežím.'
    },
    propertyCount: 280,
    averagePrice: 350000,
    priceRange: { min: 100000, max: 2000000 },
    topCities: ['Bari', 'Lecce', 'Taranto', 'Foggia'],
    highlights: ['Trulli houses', 'Olive groves', 'Adriatic coast', 'Southern charm'],
    popularity: 4
  },
  {
    id: 'sardegna',
    name: { en: 'Sardinia', it: 'Sardegna', cs: 'Sardinie' },
    slug: 'sardegna',
    image: '/Sardegna.jpg',
    description: {
      en: 'Mediterranean island paradise with pristine beaches, ancient nuraghe towers, and unique culture.',
      it: 'Paradiso dell\'isola mediterranea con spiagge incontaminate e torri nuragiche antiche.',
      cs: 'Středomořský ostrovní ráj s nedotčenými plážemi a prastarými nuragskými věžemi.'
    },
    propertyCount: 340,
    averagePrice: 480000,
    priceRange: { min: 150000, max: 2500000 },
    topCities: ['Cagliari', 'Sassari', 'Olbia', 'Alghero'],
    highlights: ['Pristine beaches', 'Ancient towers', 'Island culture', 'Mediterranean paradise'],
    popularity: 4
  },
  {
    id: 'sicilia',
    name: { en: 'Sicily', it: 'Sicilia', cs: 'Sicílie' },
    slug: 'sicilia',
    image: '/Sicilia.jpg',
    description: {
      en: 'Italy\'s largest island offering diverse landscapes from beaches to mountains, rich history, and excellent value properties.',
      it: 'La più grande isola d\'Italia che offre paesaggi diversi dalle spiagge alle montagne.',
      cs: 'Největší ostrov Itálie nabízející rozmanité krajiny od pláží po hory.'
    },
    propertyCount: 890,
    averagePrice: 420000,
    priceRange: { min: 80000, max: 3000000 },
    topCities: ['Palermo', 'Catania', 'Taormina', 'Syracuse'],
    highlights: ['Affordable prices', 'Beach properties', 'Historic sites', 'Island lifestyle'],
    popularity: 4
  },
  {
    id: 'toscana',
    name: { en: 'Tuscany', it: 'Toscana', cs: 'Toskánsko' },
    slug: 'toscana',
    image: '/Toscana.png',
    description: {
      en: 'Rolling hills, medieval towns, and world-class wines define this iconic Italian region. Home to Florence, Siena, and countless vineyards.',
      it: 'Colline ondulate, città medievali e vini di classe mondiale definiscono questa iconica regione italiana.',
      cs: 'Zvlněné kopce, středověká města a vína světové úrovně definují tuto ikonickou italskou oblast.'
    },
    propertyCount: 1250,
    averagePrice: 850000,
    priceRange: { min: 200000, max: 5000000 },
    topCities: ['Florence', 'Siena', 'Pisa', 'Lucca'],
    highlights: ['Wine regions', 'Historic cities', 'Art & culture', 'Countryside villas'],
    popularity: 5
  },
  {
    id: 'trentino-alto-adige',
    name: { en: 'Trentino-Alto Adige', it: 'Trentino-Alto Adige', cs: 'Trentino-Alto Adige' },
    slug: 'trentino-alto-adige',
    image: '/Trentino-Alto Adige.jpg',
    description: {
      en: 'Alpine paradise with Dolomites, pristine lakes, and unique blend of Italian and Austrian cultures.',
      it: 'Paradiso alpino con le Dolomiti, laghi incontaminati e unico mix di culture italiana e austriaca.',
      cs: 'Alpský ráj s Dolomity a jedinečným mixem italské a rakouské kultury.'
    },
    propertyCount: 180,
    averagePrice: 650000,
    priceRange: { min: 200000, max: 3500000 },
    topCities: ['Trento', 'Bolzano', 'Merano', 'Rovereto'],
    highlights: ['Dolomites', 'Alpine lakes', 'Cultural blend', 'Mountain retreats'],
    popularity: 4
  },
  {
    id: 'umbria',
    name: { en: 'Umbria', it: 'Umbria', cs: 'Umbrie' },
    slug: 'umbria',
    image: '/Umbria.webp',
    description: {
      en: 'Green heart of Italy with medieval hill towns, spiritual heritage, and peaceful countryside. Perfect for authentic Italian living.',
      it: 'Cuore verde d\'Italia con borghi medievali, patrimonio spirituale e campagna pacifica.',
      cs: 'Zelené srdce Itálie se středověkými městečky a klidným venkovem.'
    },
    propertyCount: 165,
    averagePrice: 420000,
    priceRange: { min: 150000, max: 1800000 },
    topCities: ['Perugia', 'Assisi', 'Terni', 'Spoleto'],
    highlights: ['Hill towns', 'Spiritual heritage', 'Green landscapes', 'Peaceful living'],
    popularity: 3
  },
  {
    id: 'valle-d-aosta',
    name: { en: 'Valle d\'Aosta', it: 'Valle d\'Aosta', cs: 'Valle d\'Aosta' },
    slug: 'valle-d-aosta',
    image: '/Valle d\'Aosta.jpg',
    description: {
      en: 'Mountain paradise with highest peaks in Europe, ski resorts, and French-Italian culture blend.',
      it: 'Paradiso montano con le vette più alte d\'Europa, stazioni sciistiche e mix culturale franco-italiano.',
      cs: 'Horské království s nejvyššími vrcholy Evropy a lyžařskými středisky.'
    },
    propertyCount: 75,
    averagePrice: 720000,
    priceRange: { min: 250000, max: 4000000 },
    topCities: ['Aosta', 'Courmayeur', 'Cervinia', 'La Thuile'],
    highlights: ['Highest peaks', 'Ski resorts', 'Mountain culture', 'French influence'],
    popularity: 3
  },
  {
    id: 'veneto',
    name: { en: 'Veneto', it: 'Veneto', cs: 'Veneto' },
    slug: 'veneto',
    image: '/Veneto.webp',
    description: {
      en: 'Home to Venice, Verona, and Lake Garda. Rich history, romantic cities, and diverse landscapes from mountains to coast.',
      it: 'Casa di Venezia, Verona e il Lago di Garda. Storia ricca, città romantiche e paesaggi diversi.',
      cs: 'Domov Benátek, Verony a Lago di Garda s bohatou historií.'
    },
    propertyCount: 520,
    averagePrice: 680000,
    priceRange: { min: 200000, max: 4000000 },
    topCities: ['Venice', 'Verona', 'Padua', 'Vicenza'],
    highlights: ['Romantic cities', 'Lake Garda', 'Rich history', 'Diverse landscapes'],
    popularity: 5
  }
]

function RegionCard({ region, language = 'cs' }) {
  const formatPrice = (price) => {
    if (price >= 1000000) {
      const millions = price / 1000000
      return `€${millions.toFixed(millions % 1 === 0 ? 0 : 1)}M`
    } else if (price >= 1000) {
      const thousands = price / 1000
      return `€${thousands.toFixed(thousands % 1 === 0 ? 0 : 0)}k`
    }
    return `€${price.toLocaleString()}`
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

  return (
    <Card className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden border border-gray-200 shadow-lg bg-white rounded-2xl h-full flex flex-col">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={region.image}
          alt={region.name[language]}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Popularity Stars */}
        <div className="absolute top-3 right-3 flex gap-0.5">
          {renderStars(region.popularity)}
        </div>
        
        {/* Property Count Badge */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-800">
            <Home className="h-3 w-3" />
            {region.propertyCount.toLocaleString()}
          </div>
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {language === 'cs' ? 'Průměrná cena' : 
               language === 'it' ? 'Prezzo medio' : 
               'Average Price'}
            </span>
            <span className="font-bold text-lg text-slate-700">
              {formatPrice(region.averagePrice)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {formatPriceRange(region.priceRange.min, region.priceRange.max)}
          </div>
        </div>

        {/* Top Cities */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {language === 'cs' ? 'Hlavní města' : 
             language === 'it' ? 'Città principali' : 
             'Main Cities'}
          </h4>
          <div className="flex flex-wrap gap-1">
            {region.topCities.slice(0, 3).map((city, index) => (
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

        {/* Highlights */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {language === 'cs' ? 'Výhody' : 
             language === 'it' ? 'Vantaggi' : 
             'Highlights'}
          </h4>
          <div className="flex flex-wrap gap-1">
            {region.highlights.slice(0, 2).map((highlight, index) => (
              <Badge 
                key={index} 
                className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200"
              >
                {highlight}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Link 
          href={`/properties?region=${region.slug}`} 
          className="w-full"
          onClick={() => {
            // Scroll to top before navigation
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }}
        >
          <Button 
              className="w-full"
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

export default function RegionCards({ language = 'cs', showAll = false }) {
  const [selectedRegion, setSelectedRegion] = useState(null)
  
  // Sort regions by popularity (descending) and then by name
  const sortedRegions = [...ITALIAN_REGIONS].sort((a, b) => {
    if (b.popularity !== a.popularity) {
      return b.popularity - a.popularity
    }
    return a.name[language].localeCompare(b.name[language])
  })

  const displayRegions = showAll ? sortedRegions : sortedRegions.slice(0, 12)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-bold text-gray-900 mb-8">
          {language === 'cs' ? 'Italské regiony' : 
           language === 'it' ? 'Regioni Italiane' : 
           'Italian Regions'}
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto" style={{ fontSize: '1.0625rem', lineHeight: '1.75' }}>
          {language === 'cs' ? 'Objevte rozmanitost italských regionů - od alpských vrcholů po středomořské pobřeží. Každý region nabízí jedinečnou kulturu, krajinu a příležitosti k investicím.' :
           language === 'it' ? 'Scopri la diversità delle regioni italiane - dalle vette alpine alle coste mediterranee. Ogni regione offre cultura, paesaggio e opportunità di investimento uniche.' :
           'Discover the diversity of Italian regions - from Alpine peaks to Mediterranean coasts. Each region offers unique culture, landscape, and investment opportunities.'}
        </p>
      </div>

      {/* Region Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayRegions.map((region) => (
          <RegionCard 
            key={region.id} 
            region={region} 
            language={language}
          />
        ))}
      </div>

      {/* Show More Button (if not showing all) */}
      {!showAll && (
        <div className="text-center">
          <Link href="/regions">
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400 transition-colors duration-200"
            >
              {language === 'cs' ? 'Zobrazit všechny regiony' : 
               language === 'it' ? 'Visualizza tutte le regioni' : 
               'View All Regions'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
