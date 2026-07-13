'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import Lenis from 'lenis'
import { Search, MapPin, ChevronRight, Mail, MessageCircle, Check, Plane, Globe, Lock, Banknote, AlertTriangle, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlareCard } from '@/components/ui/premium-card'
import BackgroundImageTransition from '@/components/BackgroundImageTransition'
import ProtectedContentLink from '@/components/ProtectedContentLink'

const AuthModal = dynamic(() => import('@/components/AuthModal'), { ssr: false })
const KlubInfoModal = dynamic(() => import('@/components/KlubInfoModal'), { ssr: false })
import Footer from '@/components/Footer'
import PropertySlider from '@/components/PropertySlider'
import FormPrivacyNotice from '@/components/legal/FormPrivacyNotice'
import Navigation from '../components/Navigation'
import { supabase } from '../lib/supabase'
import { t } from '../lib/translations'
import { readLanguageFromBrowser, readCurrencyFromBrowser, persistLanguage, persistCurrency, DEFAULT_LANGUAGE, DEFAULT_CURRENCY, getInitialLanguage, getInitialCurrency } from '../lib/userPreferences'

export default function HomePageClient({ initialProperties = [] }) {
  const SHOW_HOME_ARCHIVED_SECTIONS = false
  const [properties, setProperties] = useState(initialProperties)
  
  // Background images for hero section.
  // Pre-optimised at 960 px wide with a 1.5 px blur (invisible under the
  // gradient overlay): AVIF ≈ 15 KiB, WebP ≈ 44 KiB.
  const heroBackgroundImages = [
    {
      src: "/hero-background.webp",
      avifSrc: "/hero-background.avif",
      webpSrc: "/hero-background.webp",
      alt: "Italský venkov — hero pozadí"
    }
  ]
  const [filteredProperties, setFilteredProperties] = useState(initialProperties)
  const [favorites, setFavorites] = useState(new Set())
  const [filters, setFilters] = useState({})
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [language, setLanguage] = useState(getInitialLanguage)
  const [currency, setCurrency] = useState(getInitialCurrency)

  // Dynamic content data
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedPropertyType, setSelectedPropertyType] = useState(null)
  const [regionProperties, setRegionProperties] = useState([])
  const [propertyTypeProperties, setPropertyTypeProperties] = useState([])
  
  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState(null)
  
  // Animations begin as soon as the component is mounted in the browser.
  // We no longer gate the entire page behind an artificial loading overlay
  // because it hurts perceived performance and prevents Googlebot from
  // seeing meaningful content on first paint.
  const [startAnimations, setStartAnimations] = useState(false)
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isKlubModalOpen, setIsKlubModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState('signup')
  const [postAuthRedirect, setPostAuthRedirect] = useState('')

  useEffect(() => {
    const savedLanguage = readLanguageFromBrowser()
    setLanguage(savedLanguage)
    document.documentElement.lang = savedLanguage

    setCurrency(readCurrencyFromBrowser())

    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const loadProperties = async () => {
    try {
      const response = await fetch('/api/properties')
      if (response.ok) {
        const sanityProperties = await response.json()
        if (sanityProperties && Array.isArray(sanityProperties) && sanityProperties.length > 0) {
          setProperties(sanityProperties)
          setFilteredProperties(sanityProperties)
        } else {
          console.warn('Homepage received empty or invalid properties list')
        }
      } else {
        console.error('Homepage fetch failed:', response.status, response.statusText)
      }
    } catch (error) {
      // Properties will remain empty array if fetch fails
    }
  }

  useEffect(() => {
    // The Server Component shell normally seeds initialProperties, so this
    // mount fetch is only used when the page is rendered without them
    // (legacy or test scenarios).
    if (!initialProperties || initialProperties.length === 0) {
      loadProperties()
    }
  }, [])

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    // Make Lenis available globally for scroll indicator
    window.lenis = lenis

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Cleanup
    return () => {
      lenis.destroy()
      delete window.lenis
    }
  }, [])

  useEffect(() => {
    setStartAnimations(true)
  }, [])

  // Scroll-triggered animations using Intersection Observer
  useEffect(() => {
    if (!startAnimations) return

    // Keep track of animated elements
    const animatedElements = new Set()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target
          
          // Only animate if: intersecting, not already animated, and not in the set
          if (entry.isIntersecting && !animatedElements.has(element)) {
            // Mark as animated immediately to prevent double-triggering
            animatedElements.add(element)
            
            // Use RAF for smooth rendering
            requestAnimationFrame(() => {
              element.classList.add('animate-in')
            })
            
            // Stop observing this element
            observer.unobserve(element)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -80px 0px',
        // Add root for better performance
        root: null
      }
    )

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const animateElements = document.querySelectorAll('.animate-on-scroll')
      animateElements.forEach((el) => {
        // Skip if already has animate-in class
        if (!el.classList.contains('animate-in')) {
          observer.observe(el)
        }
      })
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
      animatedElements.clear()
    }
  }, [startAnimations])

  useEffect(() => {
    if (!supabase) return
    // Check if user is authenticated
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Load user's favorites
        loadFavorites()
      }
    }
    checkUser()
  }, [])

  // Dynamic content data
  const regionData = [
    {
      name: 'Abruzzo',
      title: {
        en: 'Complete Guide to Buying in Abruzzo',
        cs: 'Kompletní průvodce nákupem v Abruzzu',
        it: 'Guida completa all\'acquisto in Abruzzo'
      },
      description: {
        en: 'Discover the mountains, coastlines, and medieval villages of Abruzzo. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte hory, pobřeží a středověké vesnice Abruzza. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri le montagne, le coste e i villaggi medievali dell\'Abruzzo. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Basilicata',
      title: {
        en: 'Complete Guide to Buying in Basilicata',
        cs: 'Kompletní průvodce nákupem v Basilicatě',
        it: 'Guida completa all\'acquisto in Basilicata'
      },
      description: {
        en: 'Explore the ancient landscapes and historic towns of Basilicata. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte starobylé krajiny a historická města Basilicaty. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora i paesaggi antichi e le città storiche della Basilicata. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Calabria',
      title: {
        en: 'Complete Guide to Buying in Calabria',
        cs: 'Kompletní průvodce nákupem v Kalábrii',
        it: 'Guida completa all\'acquisto in Calabria'
      },
      description: {
        en: 'Discover the pristine beaches and mountain villages of Calabria. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte nedotčené pláže a horské vesnice Kalábrie. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri le spiagge incontaminate e i villaggi montani della Calabria. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Campania',
      title: {
        en: 'Complete Guide to Buying in Campania',
        cs: 'Kompletní průvodce nákupem v Kampánii',
        it: 'Guida completa all\'acquisto in Campania'
      },
      description: {
        en: 'Explore the Amalfi Coast, Naples, and historic sites of Campania. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte pobřeží Amalfi, Neapol a historická místa Kampánie. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora la Costiera Amalfitana, Napoli e i siti storici della Campania. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Emilia-Romagna',
      title: {
        en: 'Complete Guide to Buying in Emilia-Romagna',
        cs: 'Kompletní průvodce nákupem v Emilia-Romagna',
        it: 'Guida completa all\'acquisto in Emilia-Romagna'
      },
      description: {
        en: 'Discover the culinary capital, historic cities, and rolling hills of Emilia-Romagna. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte kulinářské hlavní město, historická města a zvlněné kopce Emilia-Romagna. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri la capitale culinaria, le città storiche e le dolci colline dell\'Emilia-Romagna. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Friuli-Venezia Giulia',
      title: {
        en: 'Complete Guide to Buying in Friuli-Venezia Giulia',
        cs: 'Kompletní průvodce nákupem v Friuli-Venezia Giulia',
        it: 'Guida completa all\'acquisto in Friuli-Venezia Giulia'
      },
      description: {
        en: 'Explore the crossroads of cultures, mountains, and coastline in Friuli-Venezia Giulia. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte křižovatku kultur, hor a pobřeží ve Friuli-Venezia Giulia. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora il crocevia di culture, montagne e costa nel Friuli-Venezia Giulia. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Lazio',
      title: {
        en: 'Complete Guide to Buying in Lazio',
        cs: 'Kompletní průvodce nákupem v Laziu',
        it: 'Guida completa all\'acquisto nel Lazio'
      },
      description: {
        en: 'Discover Rome, ancient history, and beautiful countryside in Lazio. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte Řím, starověkou historii a krásný venkov v Laziu. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri Roma, la storia antica e la bellissima campagna nel Lazio. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Liguria',
      title: {
        en: 'Complete Guide to Buying in Liguria',
        cs: 'Kompletní průvodce nákupem v Ligurii',
        it: 'Guida completa all\'acquisto in Liguria'
      },
      description: {
        en: 'Explore the Italian Riviera, colorful villages, and Mediterranean coastline in Liguria. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte italskou riviéru, barevné vesnice a středomořské pobřeží v Ligurii. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora la Riviera Italiana, i villaggi colorati e la costa mediterranea in Liguria. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Lombardia',
      title: {
        en: 'Complete Guide to Buying in Lombardy',
        cs: 'Kompletní průvodce nákupem v Lombardii',
        it: 'Guida completa all\'acquisto in Lombardia'
      },
      description: {
        en: 'Discover Milan, Lake Como, and the economic heart of Italy in Lombardy. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte Milán, Lago di Como a ekonomické srdce Itálie v Lombardii. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri Milano, il Lago di Como e il cuore economico dell\'Italia in Lombardia. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Marche',
      title: {
        en: 'Complete Guide to Buying in Marche',
        cs: 'Kompletní průvodce nákupem v Marche',
        it: 'Guida completa all\'acquisto nelle Marche'
      },
      description: {
        en: 'Explore the hidden gem with Adriatic coast and medieval towns in Marche. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte skrytý klenot s pobřežím Jaderského moře a středověkými městy v Marche. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora la gemma nascosta con costa adriatica e città medievali nelle Marche. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Molise',
      title: {
        en: 'Complete Guide to Buying in Molise',
        cs: 'Kompletní průvodce nákupem v Molise',
        it: 'Guida completa all\'acquisto in Molise'
      },
      description: {
        en: 'Discover the smallest region with authentic Italian charm in Molise. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte nejmenší region s autentickým italským kouzlem v Molise. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri la regione più piccola con il fascino italiano autentico in Molise. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Piemonte',
      title: {
        en: 'Complete Guide to Buying in Piedmont',
        cs: 'Kompletní průvodce nákupem v Piemontu',
        it: 'Guida completa all\'acquisto in Piemonte'
      },
      description: {
        en: 'Explore the wine country, Alps, and elegant Turin in Piedmont. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte vinařskou oblast, Alpy a elegantní Turín v Piemontu. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora la terra del vino, le Alpi e l\'elegante Torino in Piemonte. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Puglia',
      title: {
        en: 'Complete Guide to Buying in Puglia',
        cs: 'Kompletní průvodce nákupem v Puglii',
        it: 'Guida completa all\'acquisto in Puglia'
      },
      description: {
        en: 'Discover the heel of Italy with trulli houses and stunning coastline in Puglia. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte patu Itálie s domy trulli a úžasným pobřežím v Puglii. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri il tallone d\'Italia con le case trulli e la costa mozzafiato in Puglia. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Sardegna',
      title: {
        en: 'Complete Guide to Buying in Sardinia',
        cs: 'Kompletní průvodce nákupem na Sardinii',
        it: 'Guida completa all\'acquisto in Sardegna'
      },
      description: {
        en: 'Explore the Mediterranean island with pristine beaches and unique culture in Sardinia. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte středomořský ostrov s nedotčenými plážemi a jedinečnou kulturou na Sardinii. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora l\'isola mediterranea con spiagge incontaminate e cultura unica in Sardegna. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Sicilia',
      title: {
        en: 'Complete Guide to Buying in Sicily',
        cs: 'Kompletní průvodce nákupem na Sicílii',
        it: 'Guida completa all\'acquisto in Sicilia'
      },
      description: {
        en: 'Discover the largest Mediterranean island with Mount Etna and ancient history in Sicily. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte největší středomořský ostrov s Etnou a starověkou historií na Sicílii. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri la più grande isola mediterranea con l\'Etna e la storia antica in Sicilia. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Toscana',
      title: {
        en: 'Complete Guide to Buying in Tuscany',
        cs: 'Kompletní průvodce nákupem v Toskánsku',
        it: 'Guida completa all\'acquisto in Toscana'
      },
      description: {
        en: 'Discover the rolling hills, vineyards, and historic cities of Tuscany. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte zvlněné kopce, vinice a historická města Toskánska. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri le dolci colline, i vigneti e le città storiche della Toscana. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Trentino-Alto Adige',
      title: {
        en: 'Complete Guide to Buying in Trentino-Alto Adige',
        cs: 'Kompletní průvodce nákupem v Trentino-Alto Adige',
        it: 'Guida completa all\'acquisto in Trentino-Alto Adige'
      },
      description: {
        en: 'Explore the Dolomites, alpine lakes, and unique dual culture in Trentino-Alto Adige. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte Dolomity, alpská jezera a jedinečnou dvojí kulturu v Trentino-Alto Adige. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora le Dolomiti, i laghi alpini e la cultura duale unica in Trentino-Alto Adige. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Umbria',
      title: {
        en: 'Complete Guide to Buying in Umbria',
        cs: 'Kompletní průvodce nákupem v Umbrii',
        it: 'Guida completa all\'acquisto in Umbria'
      },
      description: {
        en: 'Discover the green heart of Italy with medieval hill towns in Umbria. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte zelené srdce Itálie se středověkými městy na kopcích v Umbrii. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri il cuore verde d\'Italia con le città medievali sui colli in Umbria. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Valle d\'Aosta',
      title: {
        en: 'Complete Guide to Buying in Valle d\'Aosta',
        cs: 'Kompletní průvodce nákupem v Valle d\'Aosta',
        it: 'Guida completa all\'acquisto in Valle d\'Aosta'
      },
      description: {
        en: 'Explore the smallest region with highest peaks and alpine charm in Valle d\'Aosta. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Prozkoumejte nejmenší region s nejvyššími vrcholy a alpským kouzlem v Valle d\'Aosta. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Esplora la regione più piccola con le vette più alte e il fascino alpino in Valle d\'Aosta. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Veneto',
      title: {
        en: 'Complete Guide to Buying in Veneto',
        cs: 'Kompletní průvodce nákupem v Benátsku',
        it: 'Guida completa all\'acquisto in Veneto'
      },
      description: {
        en: 'Discover Venice, Verona, and the diverse landscapes of Veneto. Learn about property prices, legal requirements, and the best areas to invest.',
        cs: 'Objevte Benátky, Veronu a rozmanité krajiny Benátska. Zjistěte více o cenách nemovitostí, právních požadavcích a nejlepších oblastech k investici.',
        it: 'Scopri Venezia, Verona e i paesaggi diversi del Veneto. Impara sui prezzi immobiliari, requisiti legali e le migliori aree in cui investire.'
      },
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    }
  ]

  const propertyTypeData = [
    {
      name: 'Villa',
      title: {
        en: 'Villa vs House: Which is Right for You?',
        cs: 'Vila vs dům: Co je pro vás to pravé?',
        it: 'Villa vs casa: quale è giusto per te?'
      },
      description: {
        en: 'Learn the key differences between Italian villas and houses. From architectural styles to investment potential, make an informed decision.',
        cs: 'Poznejte klíčové rozdíly mezi italskými vilami a domy. Od architektonických stylů po investiční potenciál udělejte informované rozhodnutí.',
        it: 'Impara le principali differenze tra ville e case italiane. Dagli stili architettonici al potenziale di investimento, prendi una decisione informata.'
      },
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Farmhouse',
      title: {
        en: 'Restoring Italian Farmhouses: A Complete Guide',
        cs: 'Obnova italských statků: Kompletní průvodce',
        it: 'Ristrutturare le masserie italiane: una guida completa'
      },
      description: {
        en: 'Transform a traditional farmhouse into your dream home. Learn about restoration costs, permits, and the charm of rural Italian living.',
        cs: 'Proměňte tradiční statek ve svůj vysněný domov. Zjistěte více o nákladech na rekonstrukci, povoleních a kouzlu venkovského italského života.',
        it: 'Trasforma una masseria tradizionale nella casa dei tuoi sogni. Impara sui costi di ristrutturazione, permessi e il fascino della vita rurale italiana.'
      },
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Apartment',
      title: {
        en: 'Apartment Living in Italian Cities',
        cs: 'Bydlení v bytech v italských městech',
        it: 'Vita in appartamento nelle città italiane'
      },
      description: {
        en: 'Discover the benefits of city living in Italy. From Milan to Florence, explore modern apartments and historic palazzos.',
        cs: 'Objevte výhody městského života v Itálii. Od Milána po Florencii prozkoumejte moderní byty a historické paláce.',
        it: 'Scopri i benefici della vita in città in Italia. Da Milano a Firenze, esplora appartamenti moderni e palazzi storici.'
      },
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      name: 'Commercial',
      title: {
        en: 'Commercial Property in Italy: Investment Guide',
        cs: 'Komerční nemovitostí v Itálii: Investiční průvodce',
        it: 'Immobili commerciali in Italia: guida agli investimenti'
      },
      description: {
        en: 'Explore commercial real estate opportunities. From restaurants to retail spaces, learn about Italy\'s business property market.',
        cs: 'Prozkoumejte příležitosti komerčních nemovitostí. Od restaurací po maloobchodní prostory, zjistěte více o italském trhu s obchodními nemovitostmi.',
        it: 'Esplora le opportunità immobiliari commerciali. Dai ristoranti agli spazi retail, impara sul mercato immobiliare commerciale italiano.'
      },
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    }
  ]

  // Initialize dynamic content on component mount
  useEffect(() => {
    // Select random region
    const randomRegion = regionData[Math.floor(Math.random() * regionData.length)]
    setSelectedRegion(randomRegion)
    
    // Select random property type
    const randomPropertyType = propertyTypeData[Math.floor(Math.random() * propertyTypeData.length)]
    setSelectedPropertyType(randomPropertyType)
  }, [])

  // Filter properties based on selected region and property type
  // TEMPORARY: Hardcoded to always show 7 properties for full rows during development
  useEffect(() => {
    if (selectedRegion) {
      const regionProps = properties.filter(property => {
        const regionName = property.location?.city?.region?.name
        // Handle both localized object and string name
        const nameToCheck = typeof regionName === 'object' ? regionName?.en : regionName
        return nameToCheck === selectedRegion.name
      })
      // Ensure we always have at least 3 properties by filling with other properties
      const minProperties = 3
      if (regionProps.length < minProperties) {
        const additionalProps = properties.filter(p => !regionProps.includes(p))
        const filledProps = [...regionProps, ...additionalProps].slice(0, minProperties)
        setRegionProperties(filledProps)
      } else {
        setRegionProperties(regionProps)
      }
    }
  }, [selectedRegion, properties])

  useEffect(() => {
    if (selectedPropertyType) {
      const typeProps = properties.filter(property => 
        property.propertyType.toLowerCase() === selectedPropertyType.name.toLowerCase()
      )
      // Ensure we always have at least 3 properties by filling with other properties
      const minProperties = 3
      if (typeProps.length < minProperties) {
        const additionalProps = properties.filter(p => !typeProps.includes(p))
        const filledProps = [...typeProps, ...additionalProps].slice(0, minProperties)
        setPropertyTypeProperties(filledProps)
      } else {
        setPropertyTypeProperties(typeProps)
      }
    }
  }, [selectedPropertyType, properties])

  useEffect(() => {
    // Apply filters
    let filtered = properties
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => {
        const titleEn = typeof p.title === 'object' ? p.title.en : p.title
        const cityName = typeof p.location?.city?.name === 'object' ? p.location?.city?.name?.en : p.location?.city?.name
        const descEn = typeof p.description === 'object' ? p.description.en : p.description

        return (
          titleEn?.toLowerCase().includes(query) ||
          cityName?.toLowerCase().includes(query) ||
          descEn?.toLowerCase().includes(query)
        )
      })
    }
    
    if (filters.type) {
      filtered = filtered.filter(p => p.propertyType === filters.type)
    }
    
    if (filters.location) {
      const location = filters.location.toLowerCase()
      filtered = filtered.filter(p => 
        p.location?.city?.name?.en?.toLowerCase().includes(location)
      )
    }
    
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price.amount >= parseInt(filters.minPrice))
    }
    
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price.amount <= parseInt(filters.maxPrice))
    }
    
    setFilteredProperties(filtered)
  }, [properties, filters, searchQuery])

  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      if (response.ok) {
        const userFavorites = await response.json()
        setFavorites(new Set(userFavorites.map(f => f.listingId)))
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    }
  }

  const handleFavorite = async (propertyId) => {
    if (!user) {
      setIsKlubModalOpen(true)
      return
    }

    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: propertyId })
      })
      
      if (response.ok) {
        const result = await response.json()
        const newFavorites = new Set(favorites)
        
        if (result.favorited) {
          newFavorites.add(propertyId)
        } else {
          newFavorites.delete(propertyId)
        }
        
        setFavorites(newFavorites)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    document.documentElement.lang = newLanguage
    persistLanguage(newLanguage)
  }

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency)
    persistCurrency(newCurrency)
  }

  const handleLogout = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setFavorites(new Set())
    }
  }

  const handleAuthSuccess = (authUser) => {
    setUser(authUser)
    setIsAuthModalOpen(false)
    loadFavorites()

    if (postAuthRedirect) {
      const nextPath = postAuthRedirect
      setPostAuthRedirect('')
      window.location.href = nextPath
    }
  }

  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false)
    setPostAuthRedirect('')
  }

  const handleStartFinder = () => {
    const targetPath = '/dashboard/intake-form'
    if (user) {
      window.location.href = targetPath
      return
    }
    setPostAuthRedirect(targetPath)
    setIsKlubModalOpen(true)
  }

  const handleBookCall = () => {
    window.location.href = '/book-call'
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] home-page-custom-border overflow-x-hidden" data-testid="homepage-container">
      {/* Navigation */}
      <Navigation logoSrc="/logo-domy-home-yellow.svg" />

      {/* Hero Section */}
      <section
        className="relative w-full overflow-hidden flex items-center justify-center"
        style={{ height: '100vh', minHeight: '100vh' }}
        data-testid="hero-section"
      >
        {/* Full-bleed background photo */}
        <BackgroundImageTransition
          images={heroBackgroundImages}
          transitionDuration={6000}
          fadeDuration={1500}
          className="z-0"
        />

        {/* Gradient overlay — light at top so photo has presence, strong where text sits */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(170deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.62) 45%, rgba(0,0,0,0.80) 100%)',
          }}
        />

        {/* Hero content — centered horizontally and vertically */}
        <div className="relative z-20 text-center text-white px-4 sm:px-6 max-w-4xl mx-auto w-full">
          <h1
            className="font-extrabold text-white mb-3"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              textShadow: '0 2px 10px rgba(0,0,0,0.6)',
              textWrap: 'balance',
            }}
            data-testid="hero-title"
          >
            {language === 'cs' ? 'Pomáháme Čechům koupit dům v Itálii.' :
             language === 'it' ? 'Aiutiamo i cechi a comprare casa in Italia.' :
             'We help Czechs buy a home in Italy.'}
          </h1>

          <p
            className="mb-9"
            style={{
              fontSize: 'clamp(1.375rem, 2.5vw, 1.875rem)',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.90)',
              textShadow: '0 1px 6px rgba(0,0,0,0.5)',
              lineHeight: 1.35,
            }}
          >
            {language === 'cs' ? 'Bez stresu. S jasným postupem.' :
             language === 'it' ? 'Senza stress. Con un percorso chiaro.' :
             'Stress-free. With a clear process.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              className="w-full sm:w-auto font-semibold transition-all duration-200"
              style={{
                background: 'linear-gradient(to right, rgba(199,137,91,1), rgb(153,105,69))',
                color: 'white',
                padding: '14px 32px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
                transition: 'filter 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onClick={() => { window.location.href = '/contact'; }}
              onMouseEnter={e => {
                e.currentTarget.style.filter = 'brightness(1.12)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.filter = '';
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.35)';
              }}
            >
              {language === 'cs' ? 'Konzultace zdarma' :
               language === 'it' ? 'Consulenza gratuita' :
               'Free Consultation'}
            </button>
            <button
              className="w-full sm:w-auto font-semibold backdrop-blur-sm"
              style={{
                border: '2px solid rgba(255,255,255,0.80)',
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.18)',
                padding: '14px 32px',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.30)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,1)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.80)';
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
              onClick={() => { window.location.href = '/process'; }}
            >
              {language === 'cs' ? 'O našem procesu' :
               language === 'it' ? 'Sul nostro processo' :
               'About Our Process'}
            </button>
          </div>

          <div
            className="mt-5 mx-auto inline-block backdrop-blur-sm"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.22)',
              borderBottom: '1px solid rgba(255,255,255,0.22)',
              backgroundColor: 'rgba(0,0,0,0.35)',
              padding: '8px 20px',
            }}
          >
            <p
              style={{
                fontSize: 'clamp(0.875rem, 1.3vw, 1rem)',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.95)',
                letterSpacing: '0.02em',
                margin: 0,
              }}
            >
              {language === 'cs' ? 'Právní, technická i praktická podpora během celého procesu.' :
               language === 'it' ? 'Supporto legale, tecnico e pratico durante tutto il processo.' :
               'Legal, technical, and practical support throughout the entire process.'}
            </p>
          </div>

          {/* Search shortcut */}
          <Link
            href="/properties"
            className="mt-8 flex items-center gap-2 mx-auto w-fit text-white/80 hover:text-white transition-colors duration-200 group"
          >
            <Search className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            <span style={{ fontSize: '0.9375rem', fontWeight: 500, letterSpacing: '0.01em' }}>
              {language === 'cs' ? 'Prohledat vybrané nemovitostí' :
               language === 'it' ? 'Sfoglia gli immobili disponibili' :
               'Browse available properties'}
            </span>
            <ChevronRight className="h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 hidden sm:block">
          <div
            className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 cursor-pointer"
            onClick={() => {
              const next = document.querySelector('[data-testid="how-it-works-section"]');
              if (next) window.lenis?.scrollTo(next, { offset: -80 });
            }}
          >
            <span className="text-sm font-medium tracking-widest uppercase">
              {language === 'cs' ? 'Přejděte dolů' :
               language === 'it' ? 'Scorri' :
               'Scroll'}
            </span>
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2 slow-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white border-b border-gray-100" data-testid="how-it-works-section">
        <div className="container mx-auto px-6 py-10 sm:py-14" style={{ maxWidth: '1200px' }}>

          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#c78b5a' }}>
                {language === 'cs' ? 'Jak to funguje' : language === 'it' ? 'Come funziona' : 'How it works'}
              </p>
              <h2 className="font-bold text-gray-900 text-2xl sm:text-2xl">
                {language === 'cs' ? 'Čtyři kroky od prvního hovoru k předání klíčů.' :
                 language === 'it' ? 'Quattro passi dalla prima chiamata alla consegna delle chiavi.' :
                 'Four steps from the first call to handing over the keys.'}
              </h2>
            </div>
            <Link href="/process" className="inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap flex-shrink-0" style={{ color: '#c78b5a' }}>
              {language === 'cs' ? 'Celý proces' : language === 'it' ? 'Processo completo' : 'Full process'}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Steps — horizontal on desktop, 2-col grid on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
            {[
              {
                n: '01', href: '/process#step-1',
                label: language === 'cs' ? 'Zadání & nabídka' : language === 'it' ? 'Esigenze & proposta' : 'Brief & Proposal',
                sub: language === 'cs' ? 'Vy řeknete, co hledáte. My připravíme řešení.' : language === 'it' ? 'Ci dite cosa cercate. Noi prepariamo la soluzione.' : 'You tell us what you need. We prepare the solution.',
              },
              {
                n: '02', href: '/process#step-2',
                label: language === 'cs' ? 'Výběr nemovitostí' : language === 'it' ? "Scelta dell'immobile" : 'Property Selection',
                sub: language === 'cs' ? 'Představíme nabídku a řídíme komunikaci s italskými stranami.' : language === 'it' ? "Introduciamo l'offerta e gestiamo la comunicazione." : 'We present options and handle Italian-side communication.',
              },
              {
                n: '03', href: '/process#step-3',
                label: language === 'cs' ? 'Podpis & převod' : language === 'it' ? 'Firma & trasferimento' : 'Signing & Transfer',
                sub: language === 'cs' ? 'My hlídáme formality. Vy podepisujete bez stresu.' : language === 'it' ? 'Controlliamo le formalità. Firmate senza stress.' : 'We handle the formalities. You sign without stress.',
              },
              {
                n: '04', href: '/process#step-4',
                label: language === 'cs' ? 'Péče po koupí' : language === 'it' ? "Assistenza post-acquisto" : 'Post-Purchase Support',
                sub: language === 'cs' ? 'Jsme s vámi i po koupí.' : language === 'it' ? "Siamo con voi anche dopo l'acquisto." : 'We stay with you after the purchase.',
              },
            ].map(({ n, href, label, sub }) => (
              <Link key={n} href={href} className="group bg-white hover:bg-gray-50 transition-colors duration-150 p-5 sm:p-6 flex flex-col gap-3">
                <span className="font-black text-gray-300 group-hover:text-gray-400 transition-colors leading-none" style={{ fontSize: '2.5rem' }}>{n}</span>
                <div>
                  <p className="font-bold text-gray-900 text-base sm:text-base leading-snug mb-1">{label}</p>
                  <p className="text-gray-400 text-sm sm:text-sm leading-relaxed">{sub}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all mt-auto" />
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#faf8f5] border-b border-gray-100 py-10 sm:py-14" data-testid="testimonials-section">
        <div className="container mx-auto px-6" style={{ maxWidth: '1200px' }}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: '#c78b5a' }}>
                {language === 'cs' ? 'Reference' : language === 'it' ? 'Referenze' : 'References'}
              </p>
              <h2 className="font-bold text-gray-900 text-2xl sm:text-2xl">
                {language === 'cs' ? 'Co říkají naši klienti.' :
                 language === 'it' ? 'Cosa dicono i nostri clienti.' :
                 'What our clients say.'}
              </h2>
            </div>
            <Link href="/reference" className="inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap flex-shrink-0" style={{ color: '#c78b5a' }}>
              {language === 'cs' ? 'Všechny reference' : language === 'it' ? 'Tutte le referenze' : 'All references'}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: 'Adéla Babišová', tag: 'Umbria',
                quote: <>Moje <span className="font-semibold text-emerald-800 bg-emerald-100 rounded px-0.5">nejlepší rozhodnutí</span> bylo spojit síly s Domy v Itálii a nechat si krýt záda od parťáka, který tomu rozumí, má zkušenosti a <span className="font-semibold text-emerald-800 bg-emerald-100 rounded px-0.5">odhalil chyby v kupní smlouvě</span>, které chystala italská realitka. Servis vážně na <span className="font-semibold text-emerald-800 bg-emerald-100 rounded px-0.5">jedničku s hvězdičkou</span>.</>,
              },
              {
                name: 'Lenka Kluková', tag: 'Slovensko',
                quote: <>Domy v Itálii byla ta <span className="font-semibold text-emerald-800 bg-emerald-100 rounded px-0.5">správná volba</span> — <span className="font-semibold text-emerald-800 bg-emerald-100 rounded px-0.5">vstřícný a rychlý přístup</span>, ochota poradit, promptná komunikace s realitními agenturami a prověření zásadních informací o nemovitostech. Za nás <span className="font-semibold text-emerald-800 bg-emerald-100 rounded px-0.5">absolutní spokojenost</span>.</>,
              },
              {
                name: 'Marcela Dejlová', tag: 'Itálie',
                quote: <>Děkuji za <span className="font-semibold text-emerald-800 bg-emerald-100 rounded px-0.5">perfektní servis</span>, pomoc při koupi domu včetně všech nezbytných úředních procedur, osobní asistenci a <span className="font-semibold text-emerald-800 bg-emerald-100 rounded px-0.5">neuvěřitelně vstřícné, milé a přátelské jednání</span>. Zdravím z Itálie.</>,
              },
            ].map(({ name, tag, quote }) => (
              <div key={name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
                <p className="text-gray-600 text-sm leading-relaxed italic flex-1">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-50">
                  <div className="h-7 w-7 rounded-full bg-copper-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-copper-700">{name.charAt(0)}</span>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">{name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you need to know Section */}
      <section className="py-10 sm:py-14" data-testid="main-content-container" style={{ background: '#f7f4ed' }}>
        <div className="container mx-auto px-6" style={{ maxWidth: '1200px' }}>

          {/* Asymmetric two-column layout */}
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

            {/* Left: editorial block */}
            <div className="lg:w-2/5 lg:sticky lg:top-24 lg:self-start">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#c78b5a' }}>
                {language === 'cs' ? 'Než začnete' : language === 'it' ? 'Prima di iniziare' : 'Before you start'}
              </p>
              <h2 className="font-bold text-gray-900 mb-3 text-2xl sm:text-2xl leading-snug" data-testid="section-description">
                {language === 'cs' ? 'Koupě domů v Itálii není jen o ceně.' :
                 language === 'it' ? "L'acquisto di una casa in Italia non riguarda solo il prezzo." :
                 "Buying a home in Italy isn't just about price."}
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-5">
                {language === 'cs' ? 'Rozhodnutí bez správných informací může stát čas, peníze i klid. Proto je důležité rozumět systému ještě před prvním krokem.' :
                 language === 'it' ? 'Una decisione senza le giuste informazioni può costare tempo, denaro e serenità. Per questo è importante capire il sistema prima del primo passo.' :
                 "Decisions without the right information can cost time, money, and peace of mind. That's why it's important to understand the system before the first step."}
              </p>
              <Link href="/guides" className="inline-flex items-center gap-1.5 font-semibold text-base" style={{ color: '#c78b5a' }}>
                {language === 'cs' ? 'Prozkoumat průvodce' : language === 'it' ? 'Esplora le guide' : 'Explore the guides'}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right: compact vertical list */}
            <div className="lg:w-3/5 divide-y divide-gray-200" data-testid="why-italy-different-grid">

              {[
                { icon: <Globe className="h-4 w-4 text-white" />, bg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', href: '/guides/real-estate-purchase-system-italy', protected: true,
                  label: language === 'cs' ? 'Italský systém je jiný' : language === 'it' ? 'Il sistema italiano funziona diversamente' : 'The Italian system is different' },
                { icon: <Banknote className="h-4 w-4 text-white" />, bg: 'linear-gradient(135deg,#c78b5a,#99694b)', href: '/guides/costs', protected: true,
                  label: language === 'cs' ? 'Cena není všechno' : language === 'it' ? 'Il prezzo non è tutto' : 'Price is not everything' },
                { icon: <AlertTriangle className="h-4 w-4 text-white" />, bg: 'linear-gradient(135deg,#f59e0b,#b45309)', href: '/guides/mistakes', protected: true,
                  label: language === 'cs' ? 'Nejčastější chyby Čechů' : language === 'it' ? 'Errori più comuni dei cechi' : 'Most common mistakes by Czechs' },
                { icon: <MapPin className="h-4 w-4 text-white" />, bg: 'linear-gradient(135deg,#10b981,#065f46)', href: '/regions', protected: false,
                  label: language === 'cs' ? 'Region rozhoduje' : language === 'it' ? 'La regione fa la differenza' : 'Region matters' },
                { icon: <HelpCircle className="h-4 w-4 text-white" />, bg: 'linear-gradient(135deg,#6366f1,#4338ca)', href: '/faq', protected: false,
                  label: language === 'cs' ? 'Časté otázky' : language === 'it' ? 'Domande frequenti' : 'Frequently asked questions' },
              ].map(({ icon, bg, href, protected: isProtected, label }) => {
                const inner = (
                  <div key={href} className="py-4 flex items-center gap-4 group cursor-pointer">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: bg }}>{icon}</div>
                    <span className="flex-1 font-semibold text-gray-800 text-base sm:text-base group-hover:text-gray-900 transition-colors">{label}</span>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                )
                return isProtected
                  ? <ProtectedContentLink key={href} href={href} language={language}>{inner}</ProtectedContentLink>
                  : <Link key={href} href={href}>{inner}</Link>
              })}

            </div>
          </div>
        </div>
      </section>

      {/* Premium Club Section */}{/* Premium Club Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 sm:py-24 overflow-hidden">
        <div className="container mx-auto px-6" style={{maxWidth:"1200px"}}>
          {/* Main Premium Club Content */}
          <div className="text-center mb-6 sm:mb-16 animate-on-scroll">
            <h2 className="font-bold mb-8" style={{ color: '#c48759', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>
              {language === 'cs' ? 'Jste si jisti koupí domů v Itálii?' :
               language === 'it' ? 'Sei sicuro di comprare casa in Italia?' :
               'Are you sure about buying a home in Italy?'}
            </h2>
            <p className="text-base sm:text-xl text-gray-200 max-w-3xl mx-auto mb-6 sm:mb-8 px-2">
              {language === 'cs' ? 'Pak potřebujete víc než obecné informace' :
               language === 'it' ? 'Allora ti serve di più che delle info generiche' :
               'Then you need more than generic information'}
            </p>
            <Button 
              size="lg"
              className="font-semibold py-2.5 sm:py-4 px-5 sm:px-8 text-sm sm:text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 text-white inline-flex items-center justify-center text-center leading-tight"
              style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}
              onClick={() => setIsKlubModalOpen(true)}
            >
              {language === 'cs' ? 'Připojit se zdarma' :
               language === 'it' ? 'Unisciti gratuitamente' :
               'Join for Free'}
            </Button>
          </div>

          {/* Premium Card and Blogs Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-8 mb-8 sm:mb-16">
            {/* Premium Card - Takes 1 column on large screens */}
            <div className="lg:col-span-1">
              <GlareCard 
                className="flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-900 to-slate-800 h-full"
                onClick={() => {
                  window.location.href = '/dashboard';
                }}
              >
                <div className="text-center space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-center mx-auto">
                    <Image src="/logo domy.svg" alt="Logo Domy v Itálii" width={64} height={61} className="h-14 w-14 sm:h-16 sm:w-16" />
                  </div>
                  
                  <div>
                    <h4 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2" style={{ color: '#c48759' }}>
                      Klub pro klienty
                    </h4>
                    <p className="text-gray-300 text-sm sm:text-base">
                      {language === 'cs' ? 'Exkluzivní členství' :
                       language === 'it' ? 'Membri esclusivi' :
                       'Exclusive Membership'}
                    </p>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center space-x-2.5 sm:space-x-3">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                      <span className="text-sm sm:text-base" style={{ color: '#c48759' }}>
                        {language === 'cs' ? 'Personalizované vyhledávání' :
                         language === 'it' ? 'Ricerca personalizzata' :
                         'Personalized search'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2.5 sm:space-x-3">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                      <span className="text-sm sm:text-base" style={{ color: '#c48759' }}>
                        {language === 'cs' ? 'Privátní dashboard' :
                         language === 'it' ? 'Dashboard privata' :
                         'Private dashboard'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2.5 sm:space-x-3">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                      <span className="text-sm sm:text-base" style={{ color: '#c48759' }}>
                        {language === 'cs' ? 'Prioritní komunikace' :
                         language === 'it' ? 'Comunicazione prioritaria' :
                         'Priority communication'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2.5 sm:space-x-3">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                      <span className="text-sm sm:text-base" style={{ color: '#c48759' }}>
                        {language === 'cs' ? 'Prémiový obsah' :
                         language === 'it' ? 'Contenuti premium' :
                         'Premium content'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 sm:pt-4">
                    <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#c48759' }}>
                      {language === 'cs' ? 'ZDARMA' :
                       language === 'it' ? 'GRATIS' :
                       'FREE'}
                    </div>
                    <p className="text-gray-300 text-xs">
                      {language === 'cs' ? 'Bez skrytých poplatků' :
                       language === 'it' ? 'Nessuna commissione nascosta' :
                       'No hidden fees'}
                    </p>
                  </div>
                </div>
              </GlareCard>
            </div>

            {/* Premium Blogs - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <div className="text-center mb-4 sm:mb-8">
                <h3 className="text-xl sm:text-3xl font-bold text-white mb-2.5 sm:mb-4">
                  {language === 'cs' ? 'Exkluzivní obsah' :
                   language === 'it' ? 'Contenuti esclusivi' :
                   'Exclusive Contents'}
                </h3>
                <p className="text-xs sm:text-lg text-gray-200">
                  {user 
                    ? (language === 'cs' ? 'Vaše prémiové články a průvodci' :
                       language === 'it' ? 'I tuoi articoli e guide premium' :
                       'Your premium articles and guides')
                    : (language === 'cs' ? 'Zaregistrujte se zdarma a získejte přístup k prémiovým článkům' :
                       language === 'it' ? 'Registrati gratis per accedere ai contenuti premium' :
                       'Register for free to unlock premium articles and guides')
                  }
                </p>
              </div>

              <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 snap-x snap-mandatory">
                {[
                  {
                    title: {
                      en: 'How to Buy a House in Italy: Complete Guide',
                      cs: 'Jak koupit dům v Itálii: Kompletní průvodce',
                      it: 'Come acquistare una casa in Italia: guida completa'
                    },
                    excerpt: {
                      en: 'Everything you need to know about documents, taxes, and procedures for buying property in Italy.',
                      cs: 'Vše, co potřebujete vědět o dokumentech, daních a postupech při koupí nemovitostí v Itálii.',
                      it: 'Tutto quello che devi sapere sui documenti, tasse e procedure per acquistare immobili in Italia.'
                    },
                    category: { en: 'Legal', cs: 'Právo', it: 'Legale' },
                    readTime: { en: '15 min read', cs: '15 min čtení', it: '15 min di lettura' },
                    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop',
                    link: '/guides/costs'
                  },
                  {
                    title: {
                      en: 'Most Common Czech Mistakes When Buying in Italy',
                      cs: 'Nejčastější chyby Čechů při koupí domů v Itálii',
                      it: 'Errori più comuni dei cechi nell\'acquisto in Italia'
                    },
                    excerpt: {
                      en: 'What to watch out for to avoid losing time and money. Problems arise from unfamiliarity, not carelessness.',
                      cs: 'Na co si dát pozor, abyste neztratili čas a peníze. Problémy vznikají z neznalosti, ne z nepozornosti.',
                      it: 'A cosa fare attenzione per non perdere tempo e denaro. I problemi nascono dalla scarsa conoscenza, non dalla disattenzione.'
                    },
                    category: { en: 'Guide', cs: 'Průvodce', it: 'Guida' },
                    readTime: { en: '12 min read', cs: '12 min čtení', it: '12 min di lettura' },
                    image: '/articles/common-mistakes-laptop-stress.jpg',
                    link: '/guides/mistakes'
                  },
                  {
                    title: {
                      en: 'Investing in Italian Real Estate: Opportunities and Risks',
                      cs: 'Investice do italských nemovitostí: Příležitosti a rizika',
                      it: 'Investire in immobili italiani: opportunità e rischi'
                    },
                    excerpt: {
                      en: 'In-depth analysis of the Italian real estate market and investment strategies.',
                      cs: 'Podrobná analýza italského realitního trhu a investičních strategií.',
                      it: 'Analisi approfondita del mercato immobiliare italiano e strategie di investimento.'
                    },
                    category: { en: 'Investment', cs: 'Investice', it: 'Investimento' },
                    readTime: { en: '18 min read', cs: '18 min čtení', it: '18 min di lettura' },
                    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=800&auto=format&fit=crop',
                    link: '/blog'
                  }
                ].map((article, index) => (
                  <div 
                    key={index} 
                    className={`${index === 2 ? 'sm:col-span-2 lg:col-span-1' : ''} cursor-pointer min-w-48 sm:min-w-0 snap-start`}
                    onClick={() => {
                      if (user) {
                        window.location.href = article.link
                      } else {
                        setIsKlubModalOpen(true)
                      }
                    }}
                  >
                    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-700 h-full relative group">
                      <div className="aspect-square sm:aspect-video relative overflow-hidden">
                        <Image
                          src={article.image}
                          alt={article.title[language]}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                          <span className="bg-gradient-to-r from-slate-700 to-slate-800 text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">
                            {article.category[language]}
                          </span>
                        </div>
                        {/* Lock badge on image */}
                        {!user && (
                          <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                            <span className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full border border-white/10">
                              <Lock className="h-3 w-3" />
                              Klub pro klienty
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-2.5 sm:p-6 relative">
                        <h3 className="text-sm sm:text-xl font-bold text-white mb-1.5 sm:mb-3 line-clamp-2">
                          {article.title[language]}
                        </h3>
                        <p className="text-xs sm:text-base line-clamp-2 text-gray-300">
                          {article.excerpt[language]}
                        </p>
                        
                        {/* Blur overlay + register CTA for non-logged-in users */}
                        {!user && (
                          <div className="mt-2">
                            {/* Fading blur over text */}
                            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-800 via-slate-800/95 to-transparent pointer-events-none" />
                            {/* Register prompt */}
                            <div className="relative z-10 pt-6 flex items-center justify-center">
                              <span className="flex max-w-full items-center justify-center gap-2 px-2 text-center text-xs sm:text-sm font-semibold leading-tight" style={{ color: '#c48759' }}>
                                <Lock className="h-3.5 w-3.5" />
                                {language === 'cs' ? 'Zaregistrujte se pro čtení' :
                                 language === 'it' ? 'Registrati per leggere' :
                                 'Register to read'}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Normal footer for logged-in users */}
                        {user && (
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-400">
                              {article.readTime[language]}
                            </span>
                            <span className="text-xs font-semibold text-copper-400">
                              {language === 'cs' ? 'Číst článek' : language === 'it' ? 'Leggi' : 'Read'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Regions Section */}
      <section className="py-16 sm:py-24 bg-[#f7f4ed] overflow-hidden">
        <div className="container mx-auto px-6" style={{maxWidth:"1200px"}}>
          <div className="text-center mb-8 sm:mb-16 animate-on-scroll">
            <h2 className="font-bold text-gray-900 mb-8">
              {language === 'cs' ? 'Prozkoumejte nejžádanější regiony Itálie' :
               language === 'it' ? 'Esplora le Regioni Più Ricercate d\'Italia' : 
               'Explore Italy\'s Most Wanted Regions'}
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              {language === 'cs' ? 'Ne celá Itálie je stejná. Vyberte si region, který vyhovuje vašemu rozpočtu, životnímu stylu a investičním cílům. Prohlédněte si nemovitostí v oblastech, které milujete.' :
               language === 'it' ? 'Non tutta l\'Italia è uguale. Scegli una regione che si adatti al tuo budget, stile di vita e obiettivi di investimento. Esplora le proprietà nelle aree che ami.' : 
               'Not all of Italy is the same. Choose a region that fits your budget, lifestyle, and investment goals. Explore properties in the areas you love.'}
            </p>
            <p className="text-sm sm:text-base text-gray-500 mt-2">
              {language === 'cs' ? 'Průměrná data aktualizována 2025' :
               language === 'it' ? 'Dati medi aggiornati 2025' :
               'Average data updated 2025'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-12">
            {/* Sardegna */}
            <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src="/Sardegna.jpg"
                  alt="Sardegna"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">
                    {language === 'cs' ? 'Sardinie' :
                     language === 'it' ? 'Sardegna' :
                     'Sardinia'}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-base line-clamp-2">
                    {language === 'cs' ? 'Křišťálové vody, panenské pláže, luxusní resorty' :
                     language === 'it' ? 'Acque cristalline, spiagge incontaminate, resort di lusso' :
                     'Crystal waters, pristine beaches, luxury resorts'}
                  </p>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full">
                    €3,500-8,000/m2
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? '5-8% výnos' :
                     language === 'it' ? '5-8% rendita' :
                     '5-8% yield'}
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? 'Rezident EU' :
                     language === 'it' ? 'residenti UE' :
                     'EU resident'}
                  </span>
                </div>
                <Link 
                  href="/properties?region=sardegna"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }}
                >
                  <button className="w-full min-h-[44px] inline-flex items-center justify-center text-center leading-none cursor-pointer bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm sm:text-base transition-all duration-300">
                    {language === 'cs' ? 'Zobrazit nabídky ze Sardinie' :
                     language === 'it' ? 'Visualizza offerte per la Sardegna' :
                     'View offers from Sardinia'}
                  </button>
                </Link>
              </div>
            </div>

            {/* Tuscany */}
            <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src="/Toscana.png"
                  alt="Tuscany"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">
                    {language === 'cs' ? 'Toskánsko' :
                     language === 'it' ? 'Toscana' :
                     'Tuscany'}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-base line-clamp-2">
                    {language === 'cs' ? 'Kamenné statky, vinice, stabilní poptávka po pronájmu' :
                     language === 'it' ? 'Case coloniche in pietra, viste sui vigneti, domanda di affitto stabile' :
                     'Stone farmhouses, vineyard views, stable rental demand'}
                  </p>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full">
                    €2,500-6,000/m2
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? '4-7% výnos' :
                     language === 'it' ? '4-7% rendita' :
                     '4-7% yield'}
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? 'Rezident EU' :
                     language === 'it' ? 'residenti UE' :
                     'EU resident'}
                  </span>
                </div>
                <Link 
                  href="/properties?region=toscana"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }}
                >
                  <button className="w-full min-h-[44px] inline-flex items-center justify-center text-center leading-none cursor-pointer bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm sm:text-base transition-all duration-300">
                    {language === 'cs' ? 'Zobrazit nabídky z Toskánska' :
                     language === 'it' ? 'Visualizza offerte per la Toscana' :
                     'View offers from Tuscany'}
                  </button>
                </Link>
              </div>
            </div>

            {/* Emilia-Romagna */}
            <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src="/Emilia-Romagna.jpg"
                  alt="Emilia-Romagna"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">
                    {language === 'cs' ? 'Emilia-Romagna' :
                     language === 'it' ? 'Emilia-Romagna' :
                     'Emilia-Romagna'}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-base line-clamp-2">
                    {language === 'cs' ? 'Kulinářské hlavní město, historická města, zvlněné kopce' :
                     language === 'it' ? 'Capitale culinaria, città storiche, dolci colline' :
                     'Culinary capital, historic cities, rolling hills'}
                  </p>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full">
                    €2,000-5,000/m2
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? '4-7% výnos' :
                     language === 'it' ? '4-7% rendita' :
                     '4-7% yield'}
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? 'Rezident EU' :
                     language === 'it' ? 'residenti UE' :
                     'EU resident'}
                  </span>
                </div>
                <Link 
                  href="/properties?region=emilia-romagna"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }}
                >
                  <button className="w-full min-h-[44px] inline-flex items-center justify-center text-center leading-none cursor-pointer bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm sm:text-base transition-all duration-300">
                    {language === 'cs' ? 'Zobrazit nabídky z Emilia-Romagna' :
                     language === 'it' ? 'Visualizza offerte per l\'Emilia-Romagna' :
                     'View offers from Emilia-Romagna'}
                  </button>
                </Link>
              </div>
            </div>

            {/* Sicily */}
            <div className="hidden sm:block bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src="/Sicilia.jpg"
                  alt="Sicily"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">
                    {language === 'cs' ? 'Sicílie' :
                     language === 'it' ? 'Sicilia' :
                     'Sicily'}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-base line-clamp-2">
                    {language === 'cs' ? 'Historické paláce, barokní města, rostoucí trh' :
                     language === 'it' ? 'Palazzi storici, città barocche, mercato emergente' :
                     'Historic palazzi, Baroque towns, emerging market'}
                  </p>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full">
                    €1,500-4,000/m2
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? '6-10% výnos' :
                     language === 'it' ? '6-10% rendita' :
                     '6-10% yield'}
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? 'Rezident EU' :
                     language === 'it' ? 'residenti UE' :
                     'EU resident'}
                  </span>
                </div>
                <Link 
                  href="/properties?region=sicilia"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }}
                >
                  <button className="w-full min-h-[44px] inline-flex items-center justify-center text-center leading-none cursor-pointer bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm sm:text-base transition-all duration-300">
                    {language === 'cs' ? 'Zobrazit nabídky ze Sicílie' :
                     language === 'it' ? 'Visualizza offerte per la Sicilia' :
                     'View offers from Sicily'}
                  </button>
                </Link>
              </div>
            </div>

            {/* Trentino-Alto Adige */}
            <div className="hidden sm:block bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src="/Trentino-Alto Adige.jpg"
                  alt="Trentino-Alto Adige"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">
                    {language === 'cs' ? 'Trentino-Alto Adige' :
                     language === 'it' ? 'Trentino-Alto Adige' :
                     'Trentino-Alto Adige'}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-base line-clamp-2">
                    {language === 'cs' ? 'Dolomity, alpská jezera, jedinečná dvojí kultura' :
                     language === 'it' ? 'Dolomiti, laghi alpini, cultura duale unica' :
                     'Dolomites, alpine lakes, unique dual culture'}
                  </p>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full">
                    €4,500-12,000/m2
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? '3-6% výnos' :
                     language === 'it' ? '3-6% rendita' :
                     '3-6% yield'}
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? 'Rezident EU' :
                     language === 'it' ? 'residenti UE' :
                     'EU resident'}
                  </span>
                </div>
                <Link 
                  href="/properties?region=trentino-alto-adige"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }}
                >
                  <button className="w-full min-h-[44px] inline-flex items-center justify-center text-center leading-none cursor-pointer bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm sm:text-base transition-all duration-300">
                    {language === 'cs' ? 'Zobrazit nabídky z Trentino-Alto Adige' :
                     language === 'it' ? 'Visualizza offerte per il Trentino-Alto Adige' :
                     'View offers from Trentino-Alto Adige'}
                  </button>
                </Link>
              </div>
            </div>

            {/* Lazio (Rome) */}
            <div className="hidden sm:block bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200">
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src="/Lazio.webp"
                  alt="Lazio (Rome)"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">
                    {language === 'cs' ? 'Lazio (Řím)' :
                     language === 'it' ? 'Lazio (Roma)' :
                     'Lazio (Rome)'}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-base line-clamp-2">
                    {language === 'cs' ? 'Historické centrum, moderní čtvrti, silný trh s pronájmem' :
                     language === 'it' ? 'Centro storico, quartieri moderni, forte mercato degli affitti' :
                     'Historic center, modern districts, strong rental market'}
                  </p>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full">
                    €3,000-12,000/m2
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? '4-6% výnos' :
                     language === 'it' ? '4-6% rendita' :
                     '4-6% yield'}
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {language === 'cs' ? 'Rezident EU' :
                     language === 'it' ? 'residenti UE' :
                     'EU resident'}
                  </span>
                </div>
                <Link 
                  href="/properties?region=lazio"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }}
                >
                  <button className="w-full min-h-[44px] inline-flex items-center justify-center text-center leading-none cursor-pointer bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm sm:text-base transition-all duration-300">
                    {language === 'cs' ? 'Zobrazit nabídky z Lazia' :
                     language === 'it' ? 'Visualizza offerte per il Lazio' :
                     'View offers from Lazio'}
                  </button>
                </Link>
              </div>
            </div>
          </div>
          <div className="text-center mb-8 sm:mb-0">
            <Link
              href="/regions"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-slate-600 hover:to-slate-700"
            >
              {language === 'cs' ? 'Prozkoumat regiony' :
               language === 'it' ? 'Visita le regioni' :
               'Explore the regions'}
            </Link>
          </div>
        </div>
      </section>

      {SHOW_HOME_ARCHIVED_SECTIONS && (
      <>
      {/* Recent Success Stories Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-6" style={{maxWidth:"1200px"}}>
          <div className="text-center mb-8 sm:mb-12 animate-on-scroll" style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
            <h2 className="font-bold text-gray-900 mb-4">
              {language === 'cs' ? 'Od vyhledávání po klíče v ruce' :
               language === 'it' ? 'Dalla Ricerca alle Chiavi in Mano' :
               'From Search to Keys in Hand'}
            </h2>
            <p className="text-gray-500" style={{ fontSize: '1.0625rem', lineHeight: '1.75' }}>
              {language === 'cs' ? 'Skutečné výsledky od kupujících jako jste vy.' :
               language === 'it' ? 'Risultati reali da acquirenti come te.' :
               'Real results from buyers like you.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Success Story 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100 flex flex-col">
              <div className="aspect-video relative overflow-hidden flex-shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Tuscan farmhouse renovation"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-slate-800 text-white text-xs font-semibold px-2 py-1 rounded">SOLD</span>
                    <span className="text-white/90 text-xs">€280,000</span>
                  </div>
                </div>
              </div>
              <div className="p-8 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {language === 'cs' ? 'Obnovený toskánský statek' :
                     language === 'it' ? 'Fattoria Toscana Restaurata' :
                     'Restored Tuscan Farmhouse'}
                  </h3>
                  <p className="text-gray-600 text-base mb-4">
                    {language === 'cs' ? '"Tým se postaral o všechno: od počátečního hledání po povolení k rekonstrukci. Za 6 měsíců jsme měli náš dokonalý domov v Toskánsku."' :
                     language === 'it' ? '"Il team ha gestito tutto: dalla ricerca iniziale ai permessi di ristrutturazione. In 6 mesi abbiamo la nostra casa perfetta in Toscana."' :
                     '"The team handled everything: from initial search to renovation permits. In 6 months we had our perfect home in Tuscany."'}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold">Sarah & Marco</span><br/>
                      {language === 'cs' ? '6 měsíců • Toskánsko' :
                       language === 'it' ? '6 mesi • Toscana' :
                       '6 months • Tuscany'}
                    </div>
                    <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {language === 'cs' ? 'Dokončeno' :
                       language === 'it' ? 'Completato' :
                       'Completed'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-semibold">
                        {language === 'cs' ? 'Co jsme vyřešili:' :
                         language === 'it' ? 'Cosa abbiamo risolto:' :
                         'What we solved:'}
                      </span>
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• {language === 'cs' ? 'Katastrální kontrola' :
                          language === 'it' ? 'Controllo catastale' :
                          'Cadastral check'}</li>
                      <li>• {language === 'cs' ? 'Povolení k rekonstrukci' :
                          language === 'it' ? 'Permessi di ristrutturazione' :
                          'Renovation permits'}</li>
                    </ul>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-3 px-6 rounded-lg text-base transition-colors duration-200 mt-auto">
                  {language === 'cs' ? 'Zobrazit podobné nemovitostí' :
                   language === 'it' ? 'Vedi proprietà simili' :
                   'See similar properties'}
                </button>
              </div>
            </div>

            {/* Success Story 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100 flex flex-col">
              <div className="aspect-video relative overflow-hidden flex-shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1520637836862-4d197d17c93a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Sicilian palazzo"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-slate-800 text-white text-xs font-semibold px-2 py-1 rounded">SOLD</span>
                    <span className="text-white/90 text-xs">€450,000</span>
                  </div>
                </div>
              </div>
              <div className="p-8 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {language === 'cs' ? 'Sicilský barokní palác' :
                     language === 'it' ? 'Palazzo Barocco Siciliano' :
                     'Sicilian Baroque Palazzo'}
                  </h3>
                  <p className="text-gray-600 text-base mb-4">
                    {language === 'cs' ? '"Perfektní investice. Právní a daňové poradenství bylo klíčové pro dokončení nákupu bez překvapení."' :
                     language === 'it' ? '"Un investimento perfetto. La consulenza legale e fiscale è stata fondamentale per completare l\'acquisto senza sorprese."' :
                     '"Perfect investment. The legal and tax consultation was crucial to complete the purchase without surprises."'}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold">James & Elena</span><br/>
                      {language === 'cs' ? '4 měsíce • Sicílie' :
                       language === 'it' ? '4 mesi • Sicilia' :
                       '4 months • Sicily'}
                    </div>
                    <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {language === 'cs' ? 'Dokončeno' :
                       language === 'it' ? 'Completato' :
                       'Completed'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-semibold">
                        {language === 'cs' ? 'Co jsme vyřešili:' :
                         language === 'it' ? 'Cosa abbiamo risolto:' :
                         'What we solved:'}
                      </span>
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• {language === 'cs' ? 'Kompletní daňová analýza' :
                          language === 'it' ? 'Analisi fiscale completa' :
                          'Complete tax analysis'}</li>
                      <li>• {language === 'cs' ? 'Mezinárodní právní podpora' :
                          language === 'it' ? 'Supporto legale internazionale' :
                          'International legal support'}</li>
                    </ul>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2 px-4 rounded-lg text-base transition-all duration-300 mt-auto">
                  {language === 'cs' ? 'Zobrazit podobné nemovitostí' :
                   language === 'it' ? 'Vedi proprietà simili' :
                   'See similar properties'}
                </button>
              </div>
            </div>

            {/* Success Story 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100 flex flex-col">
              <div className="aspect-video relative overflow-hidden flex-shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Ligurian coastal apartment"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-slate-800 text-white text-xs font-semibold px-2 py-1 rounded">SOLD</span>
                    <span className="text-white/90 text-xs">€320,000</span>
                  </div>
                </div>
              </div>
              <div className="p-8 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {language === 'cs' ? 'Pobřežní apartmán v Ligurii' :
                     language === 'it' ? 'Appartamento Costiero Liguria' :
                     'Ligurian Coastal Apartment'}
                  </h3>
                  <p className="text-gray-600 text-base mb-4">
                    {language === 'cs' ? '"Od prvního kontaktu po klíče v ruce za 3 měsíce. Služba správy pronájmů je výjimečná."' :
                     language === 'it' ? '"Dal primo contatto alle chiavi in mano in 3 mesi. Il servizio di gestione degli affitti è eccezionale."' :
                     '"From first contact to keys in hand in 3 months. The rental management service is exceptional."'}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold">Anna & David</span><br/>
                      {language === 'cs' ? '3 měsíce • Ligurie' :
                       language === 'it' ? '3 mesi • Liguria' :
                       '3 months • Liguria'}
                    </div>
                    <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {language === 'cs' ? 'Dokončeno' :
                       language === 'it' ? 'Completato' :
                       'Completed'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-semibold">
                        {language === 'cs' ? 'Co jsme vyřešili:' :
                         language === 'it' ? 'Cosa abbiamo risolto:' :
                         'What we solved:'}
                      </span>
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• {language === 'cs' ? 'Správa pronájmů' :
                          language === 'it' ? 'Gestione affitti' :
                          'Rental management'}</li>
                      <li>• {language === 'cs' ? 'Turistická povolení' :
                          language === 'it' ? 'Permessi turistici' :
                          'Tourist permits'}</li>
                    </ul>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-2 px-4 rounded-lg text-base transition-all duration-300 mt-auto">
                  {language === 'cs' ? 'Zobrazit podobné nemovitostí' :
                   language === 'it' ? 'Vedi proprietà simili' :
                   'See similar properties'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Webinar Section */}
      <section className="py-16 sm:py-24 bg-[#f7f6f3]">
        <div className="container mx-auto px-6" style={{maxWidth:"1200px"}}>
          <div className="text-center mb-10 sm:mb-16 animate-on-scroll">
            <h2 className="font-bold text-gray-900 mb-8">
              {language === 'cs' ? 'Kupování v Itálii: proces, úskalí a čísla' :
               language === 'it' ? 'Acquistare in Italia: Il Processo, le Insidie e i Numeri' :
               'Buying in Italy: The Process, the Pitfalls, and the Numbers'}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto" style={{fontSize:"1.0625rem",lineHeight:"1.75"}}>
              {language === 'cs' ? 'Kupování v Itálii: proces, úskalí a čísla — živě, každý týden.' :
               language === 'it' ? 'Acquistare in Italia: il processo, le insidie e i numeri — dal vivo, ogni settimana.' :
               'Buying in Italy: the process, the pitfalls, and the numbers—live, every week.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Next Date + Agenda */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {language === 'cs' ? 'Příští webinář' :
                   language === 'it' ? 'Prossimo Webinar' :
                   'Next Webinar'}
                </h3>
                <p className="text-lg text-gray-600 mb-4">
                  {language === 'cs' ? 'Středa 15. ledna 2025' :
                   language === 'it' ? 'Mercoledì 15 Gennaio 2025' :
                   'Wednesday, January 15, 2025'}
                </p>
                <p className="text-lg font-semibold text-slate-700">
                  {language === 'cs' ? '19:00 - 20:30 CET' :
                   language === 'it' ? '19:00 - 20:30 CET' :
                   '7:00 - 8:30 PM CET'}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'cs' ? 'Program' :
                   language === 'it' ? 'Agenda' :
                   'Agenda'}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                    </div>
                    <p className="text-gray-700">
                      {language === 'cs' ? 'Přehled procesu nákupu' :
                       language === 'it' ? 'Panoramica del processo di acquisto' :
                       'Process overview'}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                    </div>
                    <p className="text-gray-700">
                      {language === 'cs' ? 'Daně a poplatky' :
                       language === 'it' ? 'Tasse e commissioni' :
                       'Taxes & fees'}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                    </div>
                    <p className="text-gray-700">
                      {language === 'cs' ? 'Běžná úskalí' :
                       language === 'it' ? 'Insidie comuni' :
                       'Common pitfalls'}
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                    </div>
                    <p className="text-gray-700">
                      {language === 'cs' ? 'Živé Q&A' :
                       language === 'it' ? 'Q&A dal vivo' :
                       'Live Q&A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-base text-slate-800 font-medium">
                  {language === 'cs' ? 'Zdarma pro členy Klubu pro klienty. Omezený počet míst.' :
                   language === 'it' ? 'Gratuito per i membri del Klub pro klienty. Posti limitati.' :
                   'Free for Klub pro klienty members. Limited seats.'}
                </p>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === 'cs' ? 'Rezervujte si místo' :
                   language === 'it' ? 'Riserva il Tuo Posto' :
                   'Reserve Your Seat'}
                </h3>
                <p className="text-gray-600">
                  {language === 'cs' ? 'Nemůžete se zúčastnit? Získejte nahrávku přes Klub pro klienty.' :
                   language === 'it' ? 'Non riesci a partecipare? Ricevi la registrazione tramite Klub pro klienty.' :
                   'Can\'t make it? Get the recording via Klub pro klienty.'}
                </p>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    {language === 'cs' ? 'Celé jméno' :
                     language === 'it' ? 'Nome completo' :
                     'Full Name'}
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder={language === 'cs' ? 'Vaše jméno' :
                                 language === 'it' ? 'Il tuo nome' :
                                 'Your name'}
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    {language === 'cs' ? 'Email' :
                     language === 'it' ? 'Email' :
                     'Email Address'}
                  </label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder={language === 'cs' ? 'vas-email@priklad.cz' :
                                 language === 'it' ? 'la-tua-email@esempio.com' :
                                 'your-email@example.com'}
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    {language === 'cs' ? 'Zájem o region' :
                     language === 'it' ? 'Regione di interesse' :
                     'Region of Interest'}
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent">
                    <option value="">
                      {language === 'cs' ? 'Vyberte region' :
                       language === 'it' ? 'Seleziona una regione' :
                       'Select a region'}
                    </option>
                    <option value="abruzzo">
                      {language === 'cs' ? 'Abruzzo' :
                       language === 'it' ? 'Abruzzo' :
                       'Abruzzo'}
                    </option>
                    <option value="basilicata">
                      {language === 'cs' ? 'Basilicata' :
                       language === 'it' ? 'Basilicata' :
                       'Basilicata'}
                    </option>
                    <option value="calabria">
                      {language === 'cs' ? 'Kalábrie' :
                       language === 'it' ? 'Calabria' :
                       'Calabria'}
                    </option>
                    <option value="campania">
                      {language === 'cs' ? 'Kampánie' :
                       language === 'it' ? 'Campania' :
                       'Campania'}
                    </option>
                    <option value="emilia-romagna">
                      {language === 'cs' ? 'Emilia-Romagna' :
                       language === 'it' ? 'Emilia-Romagna' :
                       'Emilia-Romagna'}
                    </option>
                    <option value="friuli-venezia-giulia">
                      {language === 'cs' ? 'Friuli-Venezia Giulia' :
                       language === 'it' ? 'Friuli-Venezia Giulia' :
                       'Friuli-Venezia Giulia'}
                    </option>
                    <option value="lazio">
                      {language === 'cs' ? 'Lazio' :
                       language === 'it' ? 'Lazio' :
                       'Lazio'}
                    </option>
                    <option value="liguria">
                      {language === 'cs' ? 'Ligurie' :
                       language === 'it' ? 'Liguria' :
                       'Liguria'}
                    </option>
                    <option value="lombardia">
                      {language === 'cs' ? 'Lombardie' :
                       language === 'it' ? 'Lombardia' :
                       'Lombardy'}
                    </option>
                    <option value="marche">
                      {language === 'cs' ? 'Marche' :
                       language === 'it' ? 'Marche' :
                       'Marche'}
                    </option>
                    <option value="molise">
                      {language === 'cs' ? 'Molise' :
                       language === 'it' ? 'Molise' :
                       'Molise'}
                    </option>
                    <option value="piemonte">
                      {language === 'cs' ? 'Piemont' :
                       language === 'it' ? 'Piemonte' :
                       'Piedmont'}
                    </option>
                    <option value="puglia">
                      {language === 'cs' ? 'Puglie' :
                       language === 'it' ? 'Puglia' :
                       'Puglia'}
                    </option>
                    <option value="sardegna">
                      {language === 'cs' ? 'Sardinie' :
                       language === 'it' ? 'Sardegna' :
                       'Sardinia'}
                    </option>
                    <option value="sicilia">
                      {language === 'cs' ? 'Sicílie' :
                       language === 'it' ? 'Sicilia' :
                       'Sicily'}
                    </option>
                    <option value="toscana">
                      {language === 'cs' ? 'Toskánsko' :
                       language === 'it' ? 'Toscana' :
                       'Tuscany'}
                    </option>
                    <option value="trentino-alto-adige">
                      {language === 'cs' ? 'Trentino-Alto Adige' :
                       language === 'it' ? 'Trentino-Alto Adige' :
                       'Trentino-Alto Adige'}
                    </option>
                    <option value="umbria">
                      {language === 'cs' ? 'Umbrie' :
                       language === 'it' ? 'Umbria' :
                       'Umbria'}
                    </option>
                    <option value="valle-daosta">
                      {language === 'cs' ? 'Valle d\'Aosta' :
                       language === 'it' ? 'Valle d\'Aosta' :
                       'Valle d\'Aosta'}
                    </option>
                    <option value="veneto">
                      {language === 'cs' ? 'Benátsko' :
                       language === 'it' ? 'Veneto' :
                       'Veneto'}
                    </option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-all duration-200 hover:shadow-lg shadow-lg"
                >
                  {language === 'cs' ? 'Rezervovat místo' :
                   language === 'it' ? 'Riserva il Posto' :
                   'Reserve a Seat'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  {language === 'cs' ? 'Registrací souhlasíte s přijímáním e-mailových aktualizací.' :
                   language === 'it' ? 'Iscrivendoti, accetti di ricevere aggiornamenti via email.' :
                   'By signing up, you agree to receive email updates.'}
                </p>

                <FormPrivacyNotice language={language} purpose="webinar" className="text-left" />
              </form>
            </div>
          </div>
        </div>
      </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-6" style={{maxWidth:"1200px"}}>
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="font-bold text-gray-900 mb-8">
              {language === 'cs' ? 'Často kladené otázky' :
               language === 'it' ? 'Domande Frequenti' :
               'Frequently Asked Questions'}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto" style={{fontSize:"1.0625rem",lineHeight:"1.75"}}>
              {language === 'cs' ? 'Odpovědi, které potřebujete před rozhodnutím.' :
               language === 'it' ? 'Le risposte di cui hai bisogno prima di decidere.' :
               'The answers you need before you decide.'}
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                question: {
                  cs: 'Jaké daně a poplatky mohu očekávat při koupí v Itálii?',
                  en: 'What taxes and fees should I expect when buying in Italy?',
                  it: 'Quali tasse e commissioni devo aspettarmi quando acquisto in Italia?'
                },
                answer: {
                  cs: 'Daně zahrnují registrační daň (2-9% v závislosti na kategorii), DPH (4-10% pro novostavby), notářské poplatky (1-2%), právní poplatky (1-2%) a katastrální poplatky. Celkem se může pohybovat od 10% do 15% z kupní ceny.',
                  en: 'Taxes include registration tax (2-9% depending on category), VAT (4-10% for new builds), notary fees (1-2%), legal fees (1-2%), and cadastral fees. Total can range from 10% to 15% of the purchase price.',
                  it: 'Le tasse includono l\'imposta di registro (2-9% a seconda della categoria), l\'IVA (4-10% per nuove costruzioni), le spese notarili (1-2%), le spese legali (1-2%) e le spese catastali. Il totale può variare dal 10% al 15% del prezzo di acquisto.'
                }
              },
              {
                question: {
                  cs: 'Mohou cizinci kupovat nemovitostí v Itálii?',
                  en: 'Can foreigners buy property in Italy?',
                  it: 'Gli stranieri possono acquistare proprietà in Italia?'
                },
                answer: {
                  cs: 'Ano, cizinci mohou kupovat nemovitostí v Itálii bez omezení. Budete potřebovat Codice Fiscale (daňové identifikační číslo) a italský bankovní účet. Občané mimo EU mohou potřebovat dodatečnou dokumentaci.',
                  en: 'Yes, foreigners can buy property in Italy without restrictions. You\'ll need a Codice Fiscale (tax ID number) and an Italian bank account. Non-EU citizens may need additional documentation.',
                  it: 'Sì, gli stranieri possono acquistare proprietà in Italia senza restrizioni. Avrai bisogno di un Codice Fiscale (numero di identificazione fiscale) e di un conto bancario italiano. I cittadini non UE potrebbero aver bisogno di documentazione aggiuntiva.'
                }
              },
              {
                question: {
                  cs: 'Potřebuji Codice Fiscale?',
                  en: 'Do I need a Codice Fiscale?',
                  it: 'Ho bisogno di un Codice Fiscale?'
                },
                answer: {
                  cs: 'Ano, Codice Fiscale je povinné pro jakoukoliv transakci s nemovitostmi v Itálii. Je zdarma a lze jej získat na kterémkoliv italském konzulátu nebo místním daňovém úřadě v Itálii. Můžeme vám pomoci s procesem.',
                  en: 'Yes, a Codice Fiscale is mandatory for any property transaction in Italy. It\'s free and can be obtained from any Italian consulate or local tax office in Italy. We can help you with the process.',
                  it: 'Sì, un Codice Fiscale è obbligatorio per qualsiasi transazione immobiliare in Italia. È gratuito e può essere ottenuto presso qualsiasi consolato italiano o ufficio delle entrate locale in Italia. Possiamo aiutarti nel processo.'
                }
              },
              {
                question: {
                  cs: 'Jak dlouho trvá proces od nabídky po klíče?',
                  en: 'How long does the process take from offer to keys?',
                  it: 'Quanto tempo ci vuole dall\'offerta alle chiavi?'
                },
                answer: {
                  cs: 'Typicky 3-6 měsíců. Po přijetí nabídky podepíšete předběžnou smlouvu (compromesso), poté finální kupní smlouvu (rogito) u notáře. Načasování závisí na právních kontrolách, hypotékách a dostupnosti stran.',
                  en: 'Typically 3-6 months. After accepted offer, you sign the preliminary contract (compromesso), then the final deed (rogito) with a notary. Timing depends on legal checks, mortgages, and party availability.',
                  it: 'Tipicamente 3-6 mesi. Dopo l\'offerta accettata, firmi il contratto preliminare (compromesso), poi il rogito finale (atto di compravendita) davanti al notaio. I tempi dipendono dai controlli legali, dai mutui e dalla disponibilità delle parti.'
                }
              },
              {
                question: {
                  cs: 'Možnosti hypotéky pro nerezidenty?',
                  en: 'Mortgage options for non-residents?',
                  it: 'Opzioni di mutuo per non residenti?'
                },
                answer: {
                  cs: 'Italské banky poskytují hypotéky nerezidentům, typicky až 50-60% hodnoty nemovitostí. Budete potřebovat doklad o příjmech, bankovní výpisy a dobré kreditní skóre. Úrokové sazby jsou konkurenceschopné pro občany EU.',
                  en: 'Italian banks offer mortgages to non-residents, typically up to 50-60% of property value. You\'ll need proof of income, bank statements, and good credit score. Interest rates are competitive for EU citizens.',
                  it: 'Le banche italiane offrono mutui ai non residenti, tipicamente fino al 50-60% del valore della proprietà. Avrai bisogno di prova di reddito, estratti conto bancari e un buon punteggio di credito. I tassi di interesse sono competitivi per i cittadini UE.'
                }
              },
              {
                question: {
                  cs: 'Rozdíl mezi předběžnou smlouvou a rogito?',
                  en: 'Difference between preliminary contract and rogito?',
                  it: 'Differenza tra contratto preliminare e rogito?'
                },
                answer: {
                  cs: 'Předběžná smlouva (compromesso) je počáteční dohoda se zálohou (10-20%). Rogito je finální kupní smlouva u notáře, kde dochází k převodu vlastnictví a zaplatíte zbytek. Obě jsou právně závazné.',
                  en: 'The preliminary contract (compromesso) is the initial agreement with a deposit (10-20%). The rogito is the final deed of sale with a notary where ownership transfers and you pay the balance. Both are legally binding.',
                  it: 'Il contratto preliminare (compromesso) è l\'accordo iniziale con un deposito (10-20%). Il rogito è l\'atto di vendita finale davanti al notaio dove avviene il trasferimento di proprietà e paghi il saldo. Entrambi sono legalmente vincolanti.'
                }
              },
              {
                question: {
                  cs: 'Průběžné náklady (IMU, TARI, poplatky za bytové družstvo)?',
                  en: 'Ongoing costs (IMU, TARI, condo fees)?',
                  it: 'Costi correnti (IMU, TARI, spese condominiali)?'
                },
                answer: {
                  cs: 'Roční náklady zahrnují: IMU (obecní daň z nemovitostí, 0,4-1,06 % katastrální hodnoty), TARI (daň z odpadu, €200-600/rok), poplatky za bytové družstvo (pokud se vztahují, €50-200/měsíc), energie a pojištění. Počítejte s 1-2 % hodnoty nemovitostí ročně.',
                  en: 'Annual costs include: IMU (municipal property tax, 0.4-1.06% of cadastral value), TARI (waste tax, €200-600/year), condo fees (if applicable, €50-200/month), utilities, and insurance. Budget 1-2% of property value per year.',
                  it: 'I costi annuali includono: IMU (imposta municipale, 0,4-1,06% del valore catastale), TARI (tassa rifiuti, €200-600/anno), spese condominiali (se applicabili, €50-200/mese), utenze e assicurazione. Budget 1-2% del valore della proprietà all\'anno.'
                }
              },
              {
                question: {
                  cs: 'Jak fungují pronájmy a povolení pro krátkodobé pobyty?',
                  en: 'How do rentals and permits work for short-term stays?',
                  it: 'Come funzionano gli affitti e i permessi per soggiorni brevi?'
                },
                answer: {
                  cs: 'Krátkodobé pronájmy vyžadují registraci u místní obce a regionální identifikační kód (CIR/CIN). Musíte platit turistickou daň a dodržovat místní předpisy. Některé oblasti mají omezení. Provázíme vás procesem dodržování předpisů.',
                  en: 'Short-term rentals require registration with local municipality and regional ID code (CIR/CIN). You must pay tourist tax and comply with local regulations. Some areas have restrictions. We guide you through compliance.',
                  it: 'Gli affitti brevi richiedono registrazione con il comune locale e codice identificativo regionale (CIR/CIN). Devi pagare l\'imposta di soggiorno (tassa turistica) e rispettare le normative locali. Alcune zone hanno restrizioni. Ti guidiamo attraverso la conformità.'
                }
              },
              {
                question: {
                  cs: 'Potřebuji právníka nebo notáře—jaký je rozdíl?',
                  en: 'Do I need a lawyer or notary—what\'s the difference?',
                  it: 'Ho bisogno di un avvocato o notaio—qual è la differenza?'
                },
                answer: {
                  cs: 'Notář je povinný (jmenován prodávajícím nebo kupujícím) a řídí právní převod. Právník je volitelný, ale doporučuje se pro prověrky due diligence, přezkoumání smluv a ochranu vašich zájmů. Vždy doporučujeme oba.',
                  en: 'A notary is mandatory (appointed by seller or buyer) and handles the legal transfer. A lawyer is optional but recommended for due diligence checks, contract review, and protecting your interests. We always recommend both.',
                  it: 'Il notaio è obbligatorio (nominato dal venditore o acquirente) e gestisce il trasferimento legale. Un avvocato è facoltativo ma consigliato per i controlli di due diligence, la revisione dei contratti e la tutela dei tuoi interessi. Noi raccomandiamo sempre entrambi.'
                }
              },
              {
                question: {
                  cs: 'Můžete pomoci s rekonstrukcemi a povoleními?',
                  en: 'Can you help with renovations and permits?',
                  it: 'Potete aiutarmi con ristrutturazioni e permessi?'
                },
                answer: {
                  cs: 'Ano, spolupracujeme s důvěryhodnými místními architekty a dodavateli. Pomáháme vám získat potřebná povolení (CILA, SCIA, stavební povolení), řídit nabídky a dohlížet na práce. Rekonstrukce se mohou kvalifikovat pro daňové pobídky až do 110% (Superbonus).',
                  en: 'Yes, we work with trusted local architects and contractors. We help you obtain necessary permits (CILA, SCIA, building permit), manage quotes, and oversee work. Renovations may qualify for tax incentives up to 110% (Superbonus).',
                  it: 'Sì, lavoriamo con architetti e appaltatori locali fidati. Ti aiutiamo a ottenere i permessi necessari (CILA, SCIA, permesso di costruire), gestire preventivi e supervisionare i lavori. Le ristrutturazioni possono qualificarsi per incentivi fiscali fino al 110% (Superbonus).'
                }
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden hover:shadow-lg hover:border-blue-200/50 transition-all duration-300 group">
                <button 
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-300 group-hover:border-blue-200/30"
                >
                  <span className="text-lg font-semibold text-gray-900">
                    {faq.question[language] || faq.question.en}
                  </span>
                  <svg 
                    className={`w-6 h-6 text-blue-600 flex-shrink-0 ml-4 transition-all duration-300 ${openFaqIndex === index ? 'rotate-180 text-blue-800' : 'group-hover:text-blue-700'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaqIndex === index && (
                  <div className="px-8 py-6 bg-gradient-to-r from-blue-50/30 to-indigo-50/20 border-t border-blue-200/30">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer[language] || faq.answer.en}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA at end */}
          <div className="text-center mt-16">
            <p className="text-xl text-gray-700 mb-6">
              {language === 'cs' ? 'Máte ještě otázku?' :
               language === 'it' ? 'Hai ancora una domanda?' :
               'Still have a question?'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white hover:bg-gray-100 text-slate-700 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 shadow-lg">
                {language === 'cs' ? 'Připojte se k webináři' :
                 language === 'it' ? 'Partecipa al Webinar' :
                 'Join the Webinar'}
              </button>
              <button
                className="text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 shadow-lg"
                style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}
                onClick={handleBookCall}
              >
                {language === 'cs' ? 'Rezervovat hovor' :
                 language === 'it' ? 'Prenota una Chiamata' :
                 'Book a Call'}
              </button>
            </div>
          </div>
        </div>
      </section>
      </>
      )}

      {/* Contact / Book a Call Section */}
      <section className="py-16 sm:py-24 bg-[#f7f6f3]">
        <div className="container mx-auto px-6" style={{maxWidth:"1200px"}}>
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="font-bold text-gray-900 mb-8">
              {language === 'cs' ? 'Začněte svou cestu' :
               language === 'it' ? 'Inizia il Tuo Viaggio' :
               'Start Your Journey'}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto" style={{fontSize:"1.0625rem",lineHeight:"1.75"}}>
              {language === 'cs' ? 'Vyberte si, jak chcete pokračovat. Jsme tu, abychom vás provedli každým krokem procesu.' :
               language === 'it' ? 'Scegli come vuoi procedere. Siamo qui per guidarti in ogni fase del processo.' :
               'Choose how you want to proceed. We\'re here to guide you through every step of the process.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 max-w-5xl mx-auto mb-10 sm:mb-16">
            {/* Book a Free Consultation */}
            <div className="order-1 bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === 'cs' ? 'Rezervujte si bezplatnou konzultaci' :
                   language === 'it' ? 'Prenota una Consulenza Gratuita' :
                   'Book a Free Consultation'}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {language === 'cs' 
                    ? 'Promluvte si s jedním z našich expertů na 15-20 minut. Prodiskutujte své potřeby, rozpočet a získejte osobní rady ohledně regionů a typů nemovitostí.'
                    : language === 'it' 
                    ? 'Parla con uno dei nostri esperti per 15-20 minuti. Discuti le tue esigenze, il budget e ottieni consigli personalizzati su regioni e tipi di proprietà.'
                    : 'Speak with one of our experts for 15-20 minutes. Discuss your needs, budget, and get personalized advice on regions and property types.'}
                </p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-slate-800 flex-shrink-0 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">
                      {language === 'cs' ? 'Žádné náklady, žádný závazek' :
                       language === 'it' ? 'Nessun costo, nessun impegno' :
                       'No cost, no commitment'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-slate-800 flex-shrink-0 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">
                      {language === 'cs' ? 'Experti, kteří mluví česky, anglicky a italsky' :
                       language === 'it' ? 'Esperti che parlano ceco, inglese e italiano' :
                       'Experts who speak Czech, English, and Italian'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-slate-800 flex-shrink-0 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">
                      {language === 'cs' ? 'Osobní rady na základě vašeho profilu' :
                       language === 'it' ? 'Consigli personalizzati in base al tuo profilo' :
                       'Personalized advice based on your profile'}
                    </span>
                  </li>
                </ul>
                <Link
                  href="/book-call"
                  className="block w-full text-white font-semibold py-3 sm:py-4 px-8 rounded-lg text-base sm:text-lg transition-all duration-200 hover:shadow-lg shadow-lg text-center leading-tight"
                  style={{ background: 'linear-gradient(to right, rgba(199, 137, 91), rgb(153, 105, 69))' }}
                >
                  {language === 'cs' ? 'Rezervovat hovor' :
                   language === 'it' ? 'Prenota una Chiamata' :
                   'Book a Call'}
                </Link>
                <p className="text-xs text-gray-500 mt-4">
                  {language === 'cs' ? 'Dostupné pondělí-pátek, 9:00-18:00 CET' :
                   language === 'it' ? 'Disponibile dal lunedì al venerdì, 9:00-18:00 CET' :
                   'Available Monday-Friday, 9:00-18:00 CET'}
                </p>
              </div>
            </div>

            {/* Start the Personal Property Finder */}
            <div className="order-2 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-600 rounded-2xl p-5 sm:p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-md rounded-full mb-3 sm:mb-6 border border-white/20">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                  {language === 'cs' ? 'Spustit osobní vyhledávač nemovitostí' :
                   language === 'it' ? 'Avvia il Personal Property Finder' :
                   'Start the Personal Property Finder'}
                </h3>
                <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                  {language === 'cs' 
                    ? 'Vyplňte náš 60sekundový formulář a získejte kurátorované nabídky nemovitostí přímo do vaší schránky, přizpůsobené vašemu rozpočtu, regionu a účelu.'
                    : language === 'it' 
                    ? 'Completa il nostro modulo di 60 secondi e ricevi annunci immobiliari curati direttamente nella tua casella di posta, adattati al tuo budget, regione e scopo.'
                    : 'Complete our 60-second form and get curated property listings delivered straight to your inbox, tailored to your budget, region, and purpose.'}
                </p>
                <ul className="text-left space-y-2 sm:space-y-3 mb-5 sm:mb-8">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-slate-600 flex-shrink-0 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-200">
                      {language === 'cs' ? 'Ručně vybrané nabídky jen pro vás' :
                       language === 'it' ? 'Annunci selezionati manualmente per te' :
                       'Hand-picked listings just for you'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-slate-600 flex-shrink-0 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-200">
                      {language === 'cs' ? 'Vyberte si frekvenci doručování' :
                       language === 'it' ? 'Scegli la tua frequenza di invio' :
                       'Choose your delivery frequency'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-slate-600 flex-shrink-0 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-200">
                      {language === 'cs' ? 'Bezplatný přístup do Klubu pro klienty' :
                       language === 'it' ? 'Accesso gratuito al Klub pro klienty' :
                       'Free Klub pro klienty access included'}
                    </span>
                  </li>
                </ul>
                <button
                  className="w-full min-h-[44px] inline-flex items-center justify-center text-center leading-none cursor-pointer bg-transparent hover:bg-white/10 text-white border border-white/45 font-semibold py-3 sm:py-4 px-8 rounded-lg text-base sm:text-lg transition-all duration-300 shadow-sm"
                  onClick={handleStartFinder}
                >
                  {language === 'cs' ? 'Spustit vyhledávač' :
                   language === 'it' ? 'Avvia il Finder' :
                   'Start the Finder'}
                </button>
                <p className="text-xs text-gray-300 mt-4">
                  {language === 'cs' ? 'Není vyžadována kreditní karta' :
                   language === 'it' ? 'Nessuna carta di credito richiesta' :
                   'No credit card required'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-12">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
                <h4 className="text-xl font-bold text-slate-800 mb-2">
                  {language === 'cs'
                    ? 'Poznejte ji dřív, než ji budete žít'
                    : language === 'it'
                    ? 'Scoprila prima di viverla'
                    : 'Discover it before living it'}
                </h4>
                <p className="text-sm text-gray-500 mb-5">
                  {language === 'cs'
                    ? 'My i naši klienti se spoléháme na prověřené partnery.'
                    : language === 'it'
                    ? 'Noi e i nostri clienti ci affidiamo a partner sicuri.'
                    : 'We and our clients rely on trusted partners.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div role="button" tabIndex={0} className="flex items-center gap-3 rounded-lg px-4 py-3 border border-gray-200 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => window.open('https://gyg.me/O0X6ZC2R', '_blank')}>
                    <Plane className="w-5 h-5 text-slate-700" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        {language === 'cs' ? 'Turistický partner' :
                         language === 'it' ? 'Partner turistico' :
                         'Travel partner'}
                      </p>
                      <p className="text-xs text-gray-600">GetYourGuide</p>
                    </div>
                  </div>
                  <div role="button" tabIndex={0} className="flex items-center gap-3 rounded-lg px-4 py-3 border border-gray-200 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => window.open('https://www.booking.com/?aid=1522416&label=affnetcj-15735418_pub-7711899_site-101629596_pname-Creavita+sro_clkid-_cjevent-07f8c85d05dc11f181b503200a18b8f8&utm_source=affnetcj&utm_medium=bannerindex&utm_campaign=gb&utm_term=index-15735418&chal_t=1770657801471&force_referer=http%3A%2F%2Flocalhost%3A3000%2F&lang=cs&soz=1&lang_changed=1', '_blank')}>
                    <Globe className="w-5 h-5 text-slate-700" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        {language === 'cs' ? 'Objevte Itálii' :
                         language === 'it' ? 'Scopri l\'Italia' :
                         'Discover Italy'}
                      </p>
                      <p className="text-xs text-gray-600">Booking.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
                <h4 className="text-xl font-bold text-slate-800 mb-2">
                  {language === 'cs'
                    ? 'Začněte svou cestu'
                    : language === 'it'
                    ? 'Comincia il tuo viaggio'
                    : 'Start your journey'}
                </h4>
                <p className="text-sm text-gray-500 mb-5">
                  {language === 'cs'
                    ? 'Napište nám nebo nám pošlete zprávu na WhatsApp.'
                    : language === 'it'
                    ? 'Scrivici o mandaci un messaggio su WhatsApp.'
                    : 'Email us or send us a message on WhatsApp.'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="https://wa.me/420731450001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 hover:bg-green-800 text-white px-4 py-3 text-sm font-medium transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                  <a
                    href="mailto:info@domyvitalii.cz"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-700 hover:bg-slate-800 text-white px-4 py-3 text-sm font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {language === 'cs' ? 'Napište nám' : language === 'it' ? 'Scrivici' : 'Email us'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 pb-16 md:pb-24" style={{maxWidth:"1200px"}}>
        <div className="max-w-5xl mx-auto flex justify-center">
          <button
            className="flex items-center gap-2 rounded-lg px-4 py-2 shadow-lg border border-slate-200 transition-shadow duration-200 hover:shadow-xl group cursor-pointer w-auto bg-white"
            onClick={() => { window.location.href = '/gdpr' }}
          >
            <Lock className="h-4 w-4 text-slate-700 transition-colors flex-shrink-0" />
            <div className="flex flex-col min-w-0 text-center">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {language === 'cs' ? 'Osobní údaje' :
                 language === 'it' ? 'Dati personali' :
                 'Personal data'}
              </span>
              <span className="text-xs text-slate-600 leading-tight">
                GDPR
              </span>
            </div>
          </button>
        </div>
      </div>

      <PropertySlider language={language} />
      {/* Footer */}
      <Footer language={language} />
      
      {/* Klub pro klienty info modal (middle step before auth) */}
      <KlubInfoModal
        isOpen={isKlubModalOpen}
        language={language}
        onClose={() => setIsKlubModalOpen(false)}
        onRegister={() => {
          setIsKlubModalOpen(false)
          setAuthModalTab('signup')
          setIsAuthModalOpen(true)
        }}
        onLogin={() => {
          setIsKlubModalOpen(false)
          setAuthModalTab('login')
          setIsAuthModalOpen(true)
        }}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        onAuthSuccess={handleAuthSuccess}
        defaultTab={authModalTab}
        language={language}
        title={language === 'cs' ? 'Přihlášení vyžadováno' : language === 'it' ? 'Accesso richiesto' : 'Login required'}
        message={language === 'cs' ? 'Pro uložení nemovitostí do oblíbených se prosím přihlaste nebo si vytvořte bezplatný účet.' : language === 'it' ? 'Per salvare una proprietà nei preferiti devi accedere o creare un account gratuito.' : 'To save a property to your favorites, please log in or create a free account.'}
      />
    </div>
  )
}


