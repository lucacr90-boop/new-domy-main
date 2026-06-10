'use client'

import { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import PropertySlider from '@/components/PropertySlider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const CONTENT = {
  it: {
    title: 'Cookie policy',
    subtitle: 'Uso di cookie e tecnologie simili',
    updatedAt: 'Ultimo aggiornamento: 7 aprile 2026',
    sections: [
      {
        title: '1. Cosa sono i cookie',
        paragraphs: [
          "I cookie sono piccoli file di testo che il sito può salvare sul dispositivo per permettere il funzionamento tecnico del servizio, ricordare preferenze o supportare funzioni richieste dall'utente."
        ]
      },
      {
        title: '2. Cookie strettamente necessari',
        paragraphs: [
          'Il sito utilizza cookie e strumenti tecnici necessari al login, alla sessione utente, alla sicurezza e ad alcune preferenze di interfaccia. Senza questi elementi, parti del servizio potrebbero non funzionare correttamente.'
        ]
      },
      {
        title: '3. Preferenze di interfaccia',
        paragraphs: [
          'Alcune preferenze locali o cookie di interfaccia possono essere usati per ricordare elementi del pannello, come lo stato aperto o chiuso di una sidebar.'
        ]
      },
      {
        title: '4. Analytics e marketing',
        paragraphs: [
          'Alla data di questo aggiornamento non abbiamo rilevato nel sito un banner cookie dedicato a strumenti analytics o advertising di terze parti. Se in futuro verranno introdotti cookie analytics o marketing non necessari, il sito dovrà essere aggiornato con idonea raccolta del consenso ove richiesta.'
        ]
      },
      {
        title: '5. Come gestire i cookie',
        paragraphs: [
          "Puoi gestire o cancellare i cookie dalle impostazioni del browser. La disattivazione dei cookie necessari può compromettere l'accesso all'account, al checkout o ad altre funzioni protette."
        ]
      }
    ]
  },
  en: {
    title: 'Cookie policy',
    subtitle: 'Use of cookies and similar technologies',
    updatedAt: 'Last updated: April 7, 2026',
    sections: [
      {
        title: '1. What cookies are',
        paragraphs: [
          'Cookies are small text files that a website may store on a device to enable technical operation, remember preferences or support features requested by the user.'
        ]
      },
      {
        title: '2. Strictly necessary cookies',
        paragraphs: [
          'The website uses cookies and technical storage necessary for login, user sessions, security and some interface preferences. Without them, parts of the service may not function correctly.'
        ]
      },
      {
        title: '3. Interface preferences',
        paragraphs: [
          'Some local preferences or interface cookies may be used to remember UI elements, such as whether a sidebar is expanded or collapsed.'
        ]
      },
      {
        title: '4. Analytics and marketing',
        paragraphs: [
          'As of this update, we did not identify a dedicated cookie banner for third-party analytics or advertising tools on the website. If non-essential analytics or marketing cookies are introduced later, the site should be updated with proper consent handling where required.'
        ]
      },
      {
        title: '5. How to manage cookies',
        paragraphs: [
          'You can manage or delete cookies in your browser settings. Disabling necessary cookies may affect login, checkout or other protected features.'
        ]
      }
    ]
  },
  cs: {
    title: 'Cookie policy',
    subtitle: 'Použití cookies a podobných technologií',
    updatedAt: 'Poslední aktualizace: 7. dubna 2026',
    sections: [
      {
        title: '1. Co jsou cookies',
        paragraphs: [
          'Cookies jsou malé textové soubory, které může web uložit do zařízení, aby zajistil technický provoz, zapamatování preferencí nebo podporu funkcí vyžádaných uživatelem.'
        ]
      },
      {
        title: '2. Nezbytné cookies',
        paragraphs: [
          'Web používá cookies a technická úložiště potřebná pro přihlášení, uživatelskou session, bezpečnost a některé preference rozhraní. Bez nich nemusí část služeb fungovat správně.'
        ]
      },
      {
        title: '3. Preference rozhraní',
        paragraphs: [
          'Některé lokální preference nebo cookies rozhraní mohou být použity k zapamatování stavu komponent, například otevřeného nebo zavřeného panelu.'
        ]
      },
      {
        title: '4. Analytika a marketing',
        paragraphs: [
          'K datu této aktualizace jsme na webu nezjistili samostatný cookie banner pro analytické nebo reklamní nástroje třetích stran. Pokud budou později přidány ne nezbytné analytické nebo marketingové cookies, musí být web doplněn o odpovídající řešení souhlasu, pokud to právo vyžaduje.'
        ]
      },
      {
        title: '5. Jak cookies spravovat',
        paragraphs: [
          'Cookies můžete spravovat nebo mazat v nastavení prohlížeče. Vypnutí nezbytných cookies může ovlivnit přihlášení, checkout nebo další chráněné funkce.'
        ]
      }
    ]
  }
}

export default function CookiesPage() {
  const [language, setLanguage] = useState('cs')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'cs'
    setLanguage(savedLanguage)
    document.documentElement.lang = savedLanguage

    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const content = CONTENT[language] || CONTENT.en

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <main className="pt-28 md:pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                  {content.title}
                </CardTitle>
                <p className="text-lg text-slate-600">{content.subtitle}</p>
                <p className="text-sm text-slate-500">{content.updatedAt}</p>
              </CardHeader>
              <CardContent className="space-y-6 text-slate-700">
                {content.sections.map((section) => (
                  <section key={section.title} className="space-y-2">
                    <h2 className="font-semibold text-slate-900">{section.title}</h2>
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="leading-relaxed">{paragraph}</p>
                    ))}
                  </section>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <PropertySlider language={language} />
      <Footer language={language} />
    </div>
  )
}
