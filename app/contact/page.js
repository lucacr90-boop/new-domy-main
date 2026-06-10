'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PropertySlider from '@/components/PropertySlider'
import FormPrivacyNotice from '@/components/legal/FormPrivacyNotice'

const CONTACT_INFO = [
  {
    icon: <Mail className="h-6 w-6" />,
    title: {
      en: 'Email',
      cs: 'Email',
      it: 'Email'
    },
    value: 'info@domyvitalii.cz',
    link: 'mailto:info@domyvitalii.cz'
  },
  {
    icon: <Phone className="h-6 w-6" />,
    title: {
      en: 'WhatsApp',
      cs: 'WhatsApp',
      it: 'WhatsApp'
    },
    value: {
      en: 'Message us on WhatsApp',
      cs: 'Napište nám na WhatsApp',
      it: 'Scrivici su WhatsApp'
    },
    link: 'https://wa.me/420731450001'
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: {
      en: 'Office',
      cs: 'Kancelář',
      it: 'Ufficio'
    },
    value: {
      en: 'Creavita s.r.o., Vodičkova 37, Palác Langhans, 110 00 Praha 1',
      cs: 'Creavita s.r.o., Vodičkova 37, Palác Langhans, 110 00 Praha 1',
      it: 'Creavita s.r.o., Vodičkova 37, Palác Langhans, 110 00 Praha 1'
    },
    link: null
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: {
      en: 'Working Hours',
      cs: 'Pracovní doba',
      it: 'Orario di lavoro'
    },
    value: {
      en: 'Monday – Friday, 9:00 – 18:00',
      cs: 'Pondělí – pátek, 9:00 – 18:00',
      it: 'Lunedì – venerdì, 9:00 – 18:00'
    },
    link: null
  }
]

const TEAM_CONTACTS = [
  {
    name: 'Lucie Kučerová',
    phone: '+420 731 450 001',
    email: 'lucie@domyvitalii.cz'
  },
  {
    name: 'Luca Croce',
    phone: '+420 720 363 136',
    email: 'luca.croce@domyvitalii.cz'
  }
]

const INQUIRY_TYPES = [
  {
    en: 'General Inquiry',
    cs: 'Obecný dotaz',
    it: 'Richiesta generale'
  },
  {
    en: 'Property Viewing',
    cs: 'Prohlídka nemovitostí',
    it: 'Visita immobiliare'
  },
  {
    en: 'Purchase Consultation',
    cs: 'Konzultace o koupí',
    it: 'Consulenza acquisto'
  },
  {
    en: 'Legal Assistance',
    cs: 'Právní pomoc',
    it: 'Assistenza legale'
  },
  {
    en: 'Property Management',
    cs: 'Správa nemovitostí',
    it: 'Gestione immobiliare'
  },
  {
    en: 'Other',
    cs: 'Jiné',
    it: 'Altro'
  }
]

export default function ContactPage() {
  const [language, setLanguage] = useState('cs')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    // Listen for language changes
    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: 'general',
          propertyTitle: 'General Contact Inquiry'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiryType: '',
        message: ''
      })
    } catch (error) {
      console.error('Error sending message:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <main className="pt-28 md:pt-32 pb-12">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16 md:py-24 mb-4" style={{ maxWidth: '1200px' }}>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-6">
              <Mail className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600 font-medium">
                {language === 'cs' ? 'Kontakt' : language === 'it' ? 'Contatto' : 'Contact'}
              </span>
            </div>
            <h1 className="font-extrabold mb-6 text-slate-800">
              {language === 'cs' ? 'Kontaktujte nás' :
               language === 'it' ? 'Contattaci' :
               'Contact Us'}
            </h1>
            <p className="text-lg text-gray-500 leading-[1.75] max-w-2xl mx-auto">
              {language === 'cs' ? 'Přemýšlíte o koupí domů v Itálii? Napište nám – ozveme se vám s praktickými informacemi a navrhneme další krok.' :
               language === 'it' ? 'Stai pensando di acquistare una casa in Italia? Scrivici - ti contatteremo con informazioni pratiche e suggeriremo il prossimo passo.' :
               'Thinking about buying a house in Italy? Write to us - we\'ll get back to you with practical information and suggest the next step.'}
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="container mx-auto px-6 pb-16 md:pb-24" style={{ maxWidth: '1200px' }}>
          {/* Contact Information and Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Information Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Contact Info Card */}
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                  <CardTitle className="text-xl md:text-2xl font-bold text-slate-800">
                    {language === 'cs' ? 'Kontaktní informace' :
                     language === 'it' ? 'Informazioni di contatto' :
                     'Contact Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {CONTACT_INFO.map((info, index) => (
                    <div key={index} className="flex items-start space-x-4 group">
                      <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors duration-300">
                        <div className="text-slate-600">
                          {info.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 mb-1">
                          {typeof info.title === 'string' ? info.title : info.title[language]}
                        </h3>
                        {info.link ? (
                          <a 
                            href={info.link}
                            className="text-gray-600 hover:text-slate-700 transition-colors break-all"
                          >
                            {typeof info.value === 'string' ? info.value : info.value[language]}
                          </a>
                        ) : (
                          <p className="text-gray-600">
                            {typeof info.value === 'string' ? info.value : info.value[language]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                    {language === 'cs'
                      ? 'Prvni kontakt slouzi k zakladnimu zorientovani a nenahrazuje formalni posouzeni konkretniho pripadu.'
                      : language === 'it'
                        ? 'Il primo contatto serve per un orientamento iniziale e non sostituisce una valutazione formale del singolo caso.'
                        : 'The first contact is for initial orientation and does not replace a formal assessment of an individual case.'}
                  </p>
                </CardContent>
              </Card>

              {/* Team Contacts Card */}
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                  <CardTitle className="text-xl font-bold text-slate-800">
                    {language === 'cs' ? 'Osobní kontakty' :
                     language === 'it' ? 'Contatti personali' :
                     'Personal Contacts'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  {TEAM_CONTACTS.map((contact, index) => (
                    <div key={index} className="space-y-1">
                      <p className="font-semibold text-slate-800">{contact.name}</p>
                      <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="text-gray-600 hover:text-slate-700 text-sm flex items-center gap-2 transition-colors">
                        <Phone className="h-3.5 w-3.5" />{contact.phone}
                      </a>
                      <a href={`mailto:${contact.email}`} className="text-gray-600 hover:text-slate-700 text-sm flex items-center gap-2 transition-colors">
                        <Mail className="h-3.5 w-3.5" />{contact.email}
                      </a>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      {language === 'cs' ? 'IČ: 07136943 | DIČ: CZ07136943' :
                       language === 'it' ? 'P.IVA: 07136943 | C.F.: CZ07136943' :
                       'ID: 07136943 | VAT: CZ07136943'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Response Info Card */}
              <Card className="bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <MessageSquare className="h-12 w-12 mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-2">
                    {language === 'cs' ? 'Rychlá odpověď' :
                     language === 'it' ? 'Risposta veloce' :
                     'Quick Response'}
                  </h3>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    {language === 'cs' ? 'Odpovídáme na všechny dotazy během pracovních dnů. Pro první konzultaci nám napište na email nebo WhatsApp.' :
                     language === 'it' ? 'Rispondiamo a tutte le richieste nei giorni lavorativi. Per la prima consulenza, scriveteci via email o WhatsApp.' :
                     'We respond to all inquiries on business days. For the first consultation, write to us by email or WhatsApp.'}
                  </p>
                </CardContent>
              </Card>
            </aside>

            {/* Contact Form Section */}
            <div className="lg:col-span-2">
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                  <CardTitle className="text-xl md:text-2xl font-bold text-slate-800">
                    {language === 'cs' ? 'Pošlete nám zprávu' :
                     language === 'it' ? 'Inviaci un messaggio' :
                     'Send Us a Message'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  {/* Success Message */}
                  {submitStatus === 'success' && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800">
                          {language === 'cs' ? 'Zpráva odeslána!' :
                           language === 'it' ? 'Messaggio inviato!' :
                           'Message Sent!'}
                        </h4>
                        <p className="text-sm text-green-700">
                          {language === 'cs' ? 'Děkujeme za vaši zprávu. Brzy vás budeme kontaktovat.' :
                           language === 'it' ? 'Grazie per il messaggio. Ti contatteremo presto.' :
                           'Thank you for your message. We\'ll contact you soon.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Contact Form */}
                  <form id="contact-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Name and Email Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-800">
                          {language === 'cs' ? 'Jméno' :
                           language === 'it' ? 'Nome' :
                           'Name'} *
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder={language === 'cs' ? 'Vaše jméno' : language === 'it' ? 'Il tuo nome' : 'Your name'}
                          className="border-gray-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-800">
                          {language === 'cs' ? 'Email' :
                           language === 'it' ? 'Email' :
                           'Email'} *
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder={language === 'cs' ? 'vas@email.cz' : language === 'it' ? 'tuo@email.it' : 'your@email.com'}
                          className="border-gray-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                        />
                      </div>
                    </div>

                    {/* Phone and Inquiry Type Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-800">
                          {language === 'cs' ? 'Telefon' :
                           language === 'it' ? 'Telefono' :
                           'Phone'}
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+420 123 456 789"
                          className="border-gray-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-800">
                          {language === 'cs' ? 'Typ dotazu' :
                           language === 'it' ? 'Tipo di richiesta' :
                           'Inquiry Type'} *
                        </label>
                        <select
                          name="inquiryType"
                          value={formData.inquiryType}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                        >
                          <option value="">
                            {language === 'cs' ? 'Vyberte typ' : language === 'it' ? 'Seleziona tipo' : 'Select type'}
                          </option>
                          {INQUIRY_TYPES.map((type, index) => (
                            <option key={index} value={type.en}>
                              {type[language]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Message Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-800">
                        {language === 'cs' ? 'Zpráva' :
                         language === 'it' ? 'Messaggio' :
                         'Message'} *
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        placeholder={language === 'cs' ? 'Napište nám svou zprávu...' : language === 'it' ? 'Scrivi il tuo messaggio...' : 'Write your message...'}
                        className="border-gray-300 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 resize-none"
                      />
                    </div>

                    <FormPrivacyNotice language={language} purpose="contact" />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      size="lg"
                      className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-6 text-base transition-all duration-300 shadow-lg"
                    >
                      {isSubmitting ? (
                        <span className="animate-pulse">
                          {language === 'cs' ? 'Odesílání...' : language === 'it' ? 'Invio...' : 'Sending...'}
                        </span>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          {language === 'cs' ? 'Odeslat zprávu' : language === 'it' ? 'Invia messaggio' : 'Send Message'}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call-to-Action Section */}
          <section className="text-center">
            <Card className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {language === 'cs' ? 'Prozkoumejte naše nemovitostí' :
                   language === 'it' ? 'Esplora le nostre proprietà' :
                   'Explore Our Properties'}
                </h3>
                <p className="text-gray-600 mb-8 text-lg leading-[1.75]">
                  {language === 'cs' ? 'Prohlédněte si naši rozsáhlou sbírku italských nemovitostí, od útulných bytů po luxusní vily.' :
                   language === 'it' ? 'Sfoglia la nostra vasta collezione di proprietà italiane, da appartamenti accoglienti a ville di lusso.' :
                   'Browse our extensive collection of Italian properties, from cozy apartments to luxury villas.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/properties" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold px-8 py-6 text-base transition-all duration-300 shadow-lg">
                      {language === 'cs' ? 'Zobrazit nemovitostí' :
                       language === 'it' ? 'Visualizza proprietà' :
                       'View Properties'}
                    </Button>
                  </Link>
                  <Link href="/regions" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400 font-semibold px-8 py-6 text-base transition-all duration-300">
                      {language === 'cs' ? 'Procházet regiony' :
                       language === 'it' ? 'Sfoglia regioni' :
                       'Browse Regions'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </section>
      </main>

      {/* Footer */}
      <PropertySlider language={language} />
      <Footer language={language} />
    </div>
  )
}
