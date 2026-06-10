'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Clock, ChevronRight } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PropertySlider from '@/components/PropertySlider'
import { Button } from '@/components/ui/button'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'
import ProtectedContentLink from '@/components/ProtectedContentLink'

const TRAVEL_PARTNER_LINKS = {
  booking: 'https://www.booking.com/searchresults.cs.html?ss=Italia&order=early_year_deals_upsorter&label=gen173rf-10Eg5kZWFscy1jYW1wYWlnbiiCAjjoB0gFWANoOogBAZgBM7gBF8gBDNgBA-gBAfgBAYgCAaICDm1lbWJlcnMuY2ouY29tqAIBuAKpjMzNBsACAdICJGQzM2IxZGFiLWM0NjUtNGRlMS04Zjc1LTEwNWQyNjJkZTAyM9gCAeACAQ&aid=304142&lang=cs&sb=1&src_elem=sb&dest_id=104&dest_type=country&ac_position=0&ac_click_type=b&ac_langcode=it&ac_suggestion_list_length=5&search_selected=true&search_pageview_id=fd70821489bb0dca&ac_meta=GhBmZDcwODIxNDg5YmIwZGNhIAAoATICaXQ6Bkl0YWxpYQ%3D%3D&checkin=2026-03-13&checkout=2026-03-14&group_adults=2&no_rooms=1&group_children=0&lpsrc=sb',
  getYourGuide: 'https://gyg.me/fnMmh4S3',
  axaBannerClick: 'https://www.dpbolvw.net/click-101629596-13328896',
  axaBannerImage: 'https://www.tqlkg.com/image-101629596-13328896'
}

const ARTICLES = [
  {
    slug: 'jak-cestovat-po-italii-levne',
    title: {
      cs: 'Jak cestovat po Itálii levně - vlak, auto nebo autobus?',
      en: 'How to Travel Across Italy on a Budget: Train, Car, or Bus?',
      it: 'Come viaggiare in Italia spendendo poco: treno, auto o autobus?'
    },
    excerpt: {
      cs: 'Praktické srovnání dopravy po Itálii: kdy je nejlepší vlak, kdy auto a kdy autobus.',
      en: 'A practical comparison of transport options in Italy and when train, car, or bus is the best choice.',
      it: 'Confronto pratico tra i mezzi di trasporto in Italia e quando conviene scegliere treno, auto o autobus.'
    },
    readTime: '7 min',
    category: {
      cs: 'Cestování',
      en: 'Travel',
      it: 'Viaggi'
    },
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',
    imageAlt: {
      cs: 'Vlak a autobus pro cestování po Itálii',
      en: 'Train and bus travel in Italy',
      it: 'Treno e autobus per viaggiare in Italia'
    },
    link: '/články/průvodce-italii/jak-cestovat-po-italii-levne'
  },
  {
    slug: 'kolik-stoji-dovolená-v-italii-v-roce-2026',
    title: {
      cs: 'Kolik stojí dovolená v Itálii v roce 2026',
      en: 'How Much Does a Holiday in Italy Cost in 2026?',
      it: 'Quanto costa una vacanza in Italia nel 2026?'
    },
    excerpt: {
      cs: 'Orientační rozpočty pro rok 2026: doprava, ubytování, jídlo i praktické tipy, jak ušetřit bez ztráty kvality.',
      en: 'Indicative 2026 budgets covering transport, accommodation, food, and practical ways to save without lowering quality.',
      it: 'Budget orientativi 2026 per trasporti, alloggio, cibo e consigli pratici per risparmiare senza rinunciare alla qualità.'
    },
    readTime: '9 min',
    category: {
      cs: 'Cestování',
      en: 'Travel',
      it: 'Viaggi'
    },
    image: '/house_amalfi.jpg',
    imageAlt: {
      cs: 'Pobřeží v Itálii pro plánování rozpočtu na dovolenou',
      en: 'Italian coast for holiday budget planning',
      it: 'Costa italiana per pianificare il budget vacanza'
    },
    link: '/články/průvodce-italii/kolik-stoji-dovolená-v-italii-v-roce-2026'
  },
  {
    slug: 'nejkrasnejsi-mala-města-v-italii',
    title: {
      cs: 'Nejkrásnější malá města v Itálii',
      en: 'The Most Beautiful Small Towns in Italy',
      it: 'I borghi più belli d’Italia'
    },
    excerpt: {
      cs: 'Výběr malých italských měst, která kombinují atmosféru, historii a autentický zážitek mimo hlavní turistické trasy.',
      en: 'A curated list of small Italian towns that combine atmosphere, history, and authentic experiences beyond mass tourism.',
      it: 'Una selezione di piccoli borghi italiani che uniscono atmosfera, storia ed esperienze autentiche fuori dai circuiti di massa.'
    },
    readTime: '8 min',
    category: {
      cs: 'Cestování',
      en: 'Travel',
      it: 'Viaggi'
    },
    image: '/Umbria.webp',
    imageAlt: {
      cs: 'Malé historické město v Itálii',
      en: 'Small historic town in Italy',
      it: 'Piccolo borgo storico in Italia'
    },
    link: '/články/průvodce-italii/nejkrasnejsi-mala-města-v-italii'
  },
  {
    slug: 'kolik-stoji-jídlo-v-italii-v-roce-2026',
    title: {
      cs: 'Kolik stojí jídlo v Itálii v roce 2026? Reálné ceny restaurací, pizzerií a supermarketů',
      en: 'How Much Does Food Cost in Italy in 2026? Real Prices for Restaurants, Pizzerias, and Supermarkets',
      it: 'Quanto costa mangiare in Italia nel 2026? Prezzi reali di ristoranti, pizzerie e supermercati'
    },
    excerpt: {
      cs: 'Praktický přehled cen jídla v Itálii: restaurace, pizzerie, supermarket a tipy, kde se nejčastěji zbytečně přeplácí.',
      en: 'A practical guide to food costs in Italy: restaurants, pizzerias, supermarkets, and where travelers most often overspend.',
      it: 'Guida pratica ai costi del cibo in Italia: ristoranti, pizzerie, supermercati e punti in cui si spende più del necessario.'
    },
    readTime: '11 min',
    category: {
      cs: 'Cestování',
      en: 'Travel',
      it: 'Viaggi'
    },
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    imageAlt: {
      cs: 'Italské jídlo a místní gastronomie',
      en: 'Italian food and local cuisine',
      it: 'Cibo italiano e gastronomia locale'
    },
    link: '/články/průvodce-italii/kolik-stoji-jídlo-v-italii-v-roce-2026'
  },
  {
    slug: 'kde-se-ubytovat-v-italii-levne',
    title: {
      cs: 'Kde se ubytovat v Itálii levně: hotely, B&B a cenově dostupné agriturismo',
      en: 'Where to Stay in Italy on a Budget: affordable hotels, B&Bs, and agriturismo',
      it: 'Dove dormire in Italia spendendo poco: hotel, B&B e agriturismi economici'
    },
    excerpt: {
      cs: 'Orientační ceny ubytování v Itálii 2026 a praktické strategie, jak kombinovat hotel, B&B a agriturismo bez ztráty kvality.',
      en: 'Indicative 2026 accommodation pricing in Italy and practical strategies to combine hotels, B&Bs, and agriturismo efficiently.',
      it: 'Prezzi orientativi 2026 per dormire in Italia e strategie pratiche per combinare hotel, B&B e agriturismi in modo intelligente.'
    },
    readTime: '12 min',
    category: {
      cs: 'Cestování',
      en: 'Travel',
      it: 'Viaggi'
    },
    image: '/house_tuscany_vineyards.jpg',
    imageAlt: {
      cs: 'Ubytování v Itálii za rozumnou cenu',
      en: 'Affordable accommodation in Italy',
      it: 'Alloggi convenienti in Italia'
    },
    link: '/články/průvodce-italii/kde-se-ubytovat-v-italii-levne'
  }
]

const PAGE_TEXT = {
  cs: {
    badge: 'Články',
    title: 'Průvodce Itálií',
    description:
      'Praktické cestovní články o Itálii pro české cestovatele: rozpočty, doprava, tipy a inspirace na nejkrásnější místa.',
    partnerTitle: 'Vše pro vaši cestu',
    partnerText: 'Využijte naše ověřené oficiální partnery',
    flightsLabel: 'Lety, doprava a ubytování',
    activitiesLabel: 'Místní zážitky',
    insuranceLabel: 'Cestovní pojištění',
    booking: 'Booking.com',
    gyg: 'GetYourGuide',
    read: 'Číst článek'
  },
  en: {
    badge: 'Articles',
    title: 'Italy Travel Guide',
    description:
      'Practical travel articles about Italy for Czech travelers: budgets, transport tips, and inspiration for the most beautiful places.',
    partnerTitle: 'Everything for your trip',
    partnerText: 'Use our trusted official partners',
    flightsLabel: 'Flights, transport, and stays',
    activitiesLabel: 'local activities',
    insuranceLabel: 'travel insurance',
    booking: 'Booking.com',
    gyg: 'GetYourGuide',
    read: 'Read Article'
  },
  it: {
    badge: 'Articoli',
    title: 'Guida all’Italia',
    description:
      'Articoli pratici di viaggio sull’Italia per viaggiatori cechi: budget, trasporti, consigli e ispirazione sui luoghi più belli.',
    partnerTitle: 'Tutto per il tuo viaggio',
    partnerText: 'Affidati ai nostri partner ufficiali',
    flightsLabel: 'Voli, trasporti e alloggi',
    activitiesLabel: 'attività locali',
    insuranceLabel: 'Assicurazione viaggio',
    booking: 'Booking.com',
    gyg: 'GetYourGuide',
    read: 'Leggi articolo'
  }
}

function localize(value, language) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value[language] || value.cs || value.en || value.it || ''
}

export default function PruvodceItaliiPage() {
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

  const t = PAGE_TEXT[language] || PAGE_TEXT.cs

  const visibleArticles = useMemo(() => ARTICLES, [])

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <main className="pt-28 md:pt-32 pb-16 md:pb-24">
        <div className="container mx-auto px-6 py-16 md:py-24 mb-4" style={{ maxWidth: '1200px' }}>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-6">
              <BookOpen className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600 font-medium">{t.badge}</span>
            </div>
            <h1 className="font-bold mb-8 text-slate-800 leading-tight">{t.title}</h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">{t.description}</p>
          </div>
        </div>

        <div className="container mx-auto px-6" style={{ maxWidth: '1200px' }}>
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8 lg:gap-12">
            <aside className="lg:sticky lg:top-28 h-fit">
              <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-white to-slate-50 p-5 shadow-md">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-400 via-amber-300 to-orange-300" />
                <div className="absolute -top-7 -right-8 h-20 w-20 rounded-full bg-orange-300/55 blur-xl" />
                <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-slate-200/50 blur-xl" />
                <h3 className="relative z-10 text-base font-bold text-slate-800 mb-2">{t.partnerTitle}</h3>
                <p className="relative z-10 text-xs text-slate-600 leading-relaxed mb-4">{t.partnerText}</p>

                <div className="relative z-10 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.flightsLabel}</p>
                  <Button asChild className="w-full min-h-[44px] bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white text-xs font-semibold rounded-lg shadow-sm">
                    <a href={TRAVEL_PARTNER_LINKS.booking} target="_blank" rel="nofollow sponsored noopener noreferrer">
                      {t.booking}
                    </a>
                  </Button>
                  <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.activitiesLabel}</p>
                  <Button asChild className="w-full min-h-[44px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-xs font-semibold rounded-lg shadow-sm">
                    <a href={TRAVEL_PARTNER_LINKS.getYourGuide} target="_blank" rel="nofollow sponsored noopener noreferrer">
                      {t.gyg}
                    </a>
                  </Button>

                  <div className="pt-2 border-t border-amber-200/70">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.insuranceLabel}</p>
                    <a
                      href={TRAVEL_PARTNER_LINKS.axaBannerClick}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className="block overflow-hidden rounded-xl border border-amber-200/80 bg-white shadow-sm transition-transform duration-300 hover:shadow-md"
                    >
                      <img
                        src={TRAVEL_PARTNER_LINKS.axaBannerImage}
                        width="468"
                        height="60"
                        alt={language === 'cs' ? 'Cestovní pojištění AXA se slevou 50 %' : language === 'it' ? 'Assicurazione viaggio AXA con sconto del 50%' : 'AXA travel insurance with 50% discount'}
                        className="block h-auto w-full"
                      />
                    </a>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-copper-50 p-5 shadow-md">
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-slate-700 via-slate-500 to-copper-400" />
                <div className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/85 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700 border border-slate-200 mb-3">
                  GUIDE
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">
                  {language === 'cs' ? 'Kupujete dům v Itálii?' : language === 'it' ? "State pensando all'acquisto?" : 'Thinking about buying in Italy?'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {language === 'cs'
                    ? 'Projděte si i články o nákupu, nákladech, notáři a celém procesu.'
                    : language === 'it'
                      ? "Trovate anche gli articoli su acquisto, costi, notaio e processo completo."
                      : 'See also the articles about buying, costs, the notary, and the full process.'}
                </p>
                <Link href="/blog" className="block">
                  <Button className="w-full min-h-[44px] bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-sm">
                    {language === 'cs' ? 'Otevrit články o koupí' : language === 'it' ? 'Vai agli articoli acquisto' : 'Open buying articles'}
                    <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </Link>
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
                          <p className="text-gray-500 leading-relaxed mb-3">{localize(article.excerpt, language)}</p>
                          <span className="text-sm font-medium text-slate-600 group-hover:text-copper-600 flex items-center gap-1 transition-colors">
                            {t.read}
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
        </div>
      </main>

      <div className="container mx-auto px-6 pb-10" style={{ maxWidth: '1200px' }}>
        <div className="max-w-5xl mx-auto">
          <InformationalDisclaimer language={language} className="mt-14" />
        </div>
      </div>

      <PropertySlider language={language} />
      <Footer language={language} />
    </div>
  )
}
