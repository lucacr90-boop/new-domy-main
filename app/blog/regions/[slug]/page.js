'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Calendar, User, Clock, Share2, Heart, BookOpen, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'
import Navigation from '../../../../components/Navigation'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'

const REGION_BLOG_DATA = {
  'tuscany': {
    title: { 
      en: 'Discovering Tuscany: Italy\'s Timeless Treasure', 
      it: 'Scoprire la Toscana: Il Tesoro Senza Tempo dell\'Italia',
      cs: 'Objevování Toskánska: Italský poklad bez času'
    },
    excerpt: {
      en: 'From rolling vineyards to Renaissance masterpieces, Tuscany offers an unparalleled blend of natural beauty, rich history, and world-class culture.',
      it: 'Dai vigneti ondulati ai capolavori rinascimentali, la Toscana offre una combinazione impareggiabile di bellezza naturale, ricca storia e cultura di classe mondiale.',
      cs: 'Od zvlněných vinic až po renesanční mistrovská díla nabízí Toskánsko neporovnatelnou směs přírodní krásy, bohaté historie a světové kultury.'
    },
    author: 'Maria Rossi',
    publishedAt: '2024-01-15',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=600&fit=crop',
    content: {
      en: `
        <h2>The Heart of Italian Renaissance</h2>
        <p>Tuscany, often called the cradle of the Renaissance, is a region that has captivated travelers for centuries. Its rolling hills, dotted with cypress trees and medieval hill towns, create a landscape that seems to have been painted by the masters themselves.</p>
        
        <h3>Florence: The Artistic Capital</h3>
        <p>No visit to Tuscany is complete without exploring Florence, the region's magnificent capital. Home to the Uffizi Gallery, the Duomo, and countless Renaissance treasures, Florence is a living museum where every street corner tells a story of artistic genius.</p>
        
        <h3>The Wine Country</h3>
        <p>The Chianti region, stretching between Florence and Siena, is world-renowned for its exceptional wines. Driving through the scenic wine roads, visitors can taste some of Italy's finest vintages while enjoying breathtaking views of the Tuscan countryside.</p>
        
        <h3>Medieval Hill Towns</h3>
        <p>Towns like San Gimignano, Volterra, and Cortona offer a glimpse into medieval Italy. These perfectly preserved hill towns boast ancient walls, stone towers, and charming piazzas that transport visitors back in time.</p>
      `,
      it: `
        <h2>Il Cuore del Rinascimento Italiano</h2>
        <p>La Toscana, spesso chiamata la culla del Rinascimento, è una regione che ha affascinato i viaggiatori per secoli. Le sue colline ondulate, punteggiate di cipressi e borghi medievali, creano un paesaggio che sembra essere stato dipinto dai maestri stessi.</p>
        
        <h3>Firenze: La Capitale Artistica</h3>
        <p>Nessuna visita alla Toscana è completa senza esplorare Firenze, la magnifica capitale della regione. Casa della Galleria degli Uffizi, del Duomo e di innumerevoli tesori rinascimentali, Firenze è un museo vivente dove ogni angolo di strada racconta una storia di genio artistico.</p>
      `,
      cs: `
        <h2>Srdce italské renesance</h2>
        <p>Toskánsko, často nazývané kolébkou renesance, je oblast, která fascinuje cestovatele po staletí. Jeho zvlněné kopce, poseté cypřiši a středověkými městečky, vytvářejí krajinu, která vypadá, jako by ji namalovali samotní mistři.</p>
        
        <h3>Florencie: Umělecké hlavní město</h3>
        <p>Žádná návštěva Toskánska není kompletní bez prozkoumání Florencie, nádherného hlavního města regionu. Domov galerie Uffizi, dómu a nespočtu renesančních pokladů, Florencie je živé muzeum, kde každý roh ulice vypráví příběh uměleckého génia.</p>
      `
    },
    tags: ['Travel', 'Culture', 'Wine', 'History', 'Architecture'],
    relatedRegions: ['lombardy', 'liguria', 'emilia-romagna']
  },
  'lake-como': {
    title: { 
      en: 'Lake Como: Where Luxury Meets Natural Beauty', 
      it: 'Lago di Como: Dove il Lusso Incontra la Bellezza Naturale',
      cs: 'Lago di Como: Kde se luxus setkává s přírodní krásou'
    },
    excerpt: {
      en: 'Discover the glamorous shores of Lake Como, where celebrity villas, charming villages, and dramatic mountain scenery create Italy\'s most exclusive lakeside destination.',
      it: 'Scopri le rive glamour del Lago di Como, dove ville di celebrità, villaggi incantevoli e scenari montani drammatici creano la destinazione lacustre più esclusiva d\'Italia.',
      cs: 'Objevte glamourní břehy Lago di Como, kde celebrity vily, půvabné vesnice a dramatické horské scenérie vytvářejí nejexkluzivnější italskou destinaci u jezera.'
    },
    author: 'Giuseppe Bianchi',
    publishedAt: '2024-01-10',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1734173071981-b16ee4f9867f?w=1200&h=600&fit=crop',
    content: {
      en: `
        <h2>The Jewel of Lombardy</h2>
        <p>Lake Como, shaped like an inverted Y, is one of Italy's most beautiful and prestigious lakes. Surrounded by dramatic mountains and dotted with elegant villas, it has been a favorite retreat for aristocrats, artists, and celebrities for centuries.</p>
        
        <h3>Bellagio: The Pearl of the Lake</h3>
        <p>Often called the "Pearl of the Lake," Bellagio sits at the junction of Como's three branches. This charming town offers stunning views, elegant boutiques, and some of the lake's most beautiful gardens.</p>
        
        <h3>Villa del Balbianello</h3>
        <p>This magnificent villa, featured in movies like "Casino Royale," showcases the opulence that defines Lake Como. Its terraced gardens and dramatic architecture make it one of the lake's most photographed locations.</p>
      `,
      it: `
        <h2>Il Gioiello della Lombardia</h2>
        <p>Il Lago di Como, dalla forma di Y rovesciata, è uno dei laghi più belli e prestigiosi d'Italia. Circondato da montagne drammatiche e punteggiato di ville eleganti, è stato per secoli un ritiro preferito di aristocratici, artisti e celebrità.</p>
      `,
      cs: `
        <h2>Klenot Lombardie</h2>
        <p>Lago di Como, ve tvaru obráceného Y, je jedním z nejkrásnějších a nejprestižnějších italských jezer. Obklopené dramatickými horami a poseté elegantními vilami, je po staletí oblíbeným útočištěm aristokratů, umělců a celebrit.</p>
      `
    },
    tags: ['Luxury', 'Nature', 'Villas', 'Celebrities', 'Mountains'],
    relatedRegions: ['lombardy', 'tuscany', 'liguria']
  }
}

export default function RegionBlogPage() {
  const params = useParams()
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug
  const [language, setLanguage] = useState('cs')
  const [isLiked, setIsLiked] = useState(false)
  const [blogData, setBlogData] = useState(null)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'cs'
    setLanguage(savedLanguage)
    
    if (slug && REGION_BLOG_DATA[slug]) {
      setBlogData(REGION_BLOG_DATA[slug])
    }
  }, [slug])

  if (!blogData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-6 py-20 text-center" style={{ maxWidth: '1200px' }}>
          <h1 className="font-bold text-gray-900">
            Blog post not found
          </h1>
          <Link href="/regions">
            <Button className="mt-4">Back to Regions</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Article Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-16 md:py-24" style={{ maxWidth: '1200px' }}>
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb + Back to Articles */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <Link href="/regions" className="hover:text-blue-600 transition-colors">
                  Regions
                </Link>
                <span className="mx-2">/</span>
                <Link href={`/properties?region=${slug || ''}`} className="hover:text-blue-600 transition-colors">
                  {(slug || '').charAt(0).toUpperCase() + (slug || '').slice(1)}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">Blog</span>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center text-sm font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'cs' ? 'Zpět na články' : language === 'it' ? 'Torna agli articoli' : 'Back to articles'}
              </Link>
            </div>

            {/* Article Meta */}
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(blogData.publishedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {blogData.readTime}
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {blogData.author}
              </div>
            </div>

            {/* Title */}
            <h1 className="font-bold text-gray-900 mb-8 leading-tight">
              {blogData.title[language]}
            </h1>

            {/* Excerpt */}
            <p className="text-gray-500 leading-relaxed mb-8" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
              {blogData.excerpt[language]}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {blogData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsLiked(!isLiked)}
                className={`transition-all duration-200 ${isLiked ? 'text-red-600 border-red-600' : ''}`}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="container mx-auto px-6 py-8" style={{ maxWidth: '1200px' }}>
        <div className="max-w-4xl mx-auto">
          <Image
            src={blogData.image}
            alt={blogData.title[language]}
            width={1200}
            height={600}
            sizes="(min-width: 1024px) 1024px, 100vw"
            priority
            className="w-full h-96 object-cover rounded-2xl shadow-lg"
          />
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-6 pb-16 md:pb-24" style={{ maxWidth: '1200px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div 
              className="prose prose-lg max-w-none"
              style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}
              dangerouslySetInnerHTML={{ __html: blogData.content[language] }}
            />
            <InformationalDisclaimer language={language} className="mt-10" />
          </div>
        </div>
      </div>

      {/* Related Regions */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-6 py-16 md:py-24" style={{ maxWidth: '1200px' }}>
          <div className="max-w-4xl mx-auto">
            <h3 className="font-bold text-gray-900 mb-8">Explore More Regions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogData.relatedRegions.map((regionSlug, index) => (
                <Link key={index} href={`/blog/regions/${regionSlug}`}>
                  <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center text-blue-600 group-hover:text-blue-800 transition-colors">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span className="font-semibold capitalize">{regionSlug.replace('-', ' ')}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-6 py-16 md:py-24" style={{ maxWidth: '1200px' }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {language === 'cs' ? 'Připraveni najít svůj domov v Itálii?' : 
               language === 'it' ? 'Pronto a trovare la tua casa in Italia?' :
               'Ready to Find Your Home in Italy?'}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {language === 'cs' ? 'Prohlédněte si nemovitostí v tomto regionu' : 
               language === 'it' ? 'Esplora le proprietà in questa regione' :
               'Explore properties in this region'}
            </p>
            <Link href={`/properties?region=${slug || ''}`}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4">
                <BookOpen className="h-5 w-5 mr-2" />
                {language === 'cs' ? 'Prohlédnout nemovitostí' : 
                 language === 'it' ? 'Visualizza proprietà' :
                 'View Properties'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer language={language} />
    </div>
  )
}
