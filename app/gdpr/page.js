'use client'

import { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import PropertySlider from '@/components/PropertySlider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const CONTENT = {
  it: {
    title: 'Informativa privacy e GDPR',
    subtitle: 'Informazioni sul trattamento dei dati personali',
    updatedAt: 'Ultimo aggiornamento: 7 aprile 2026',
    sections: [
      {
        title: '1. Titolare del trattamento',
        paragraphs: [
          'Il titolare del trattamento è Creavita s.r.o., Vodičkova 37, Palác Langhans, 110 00 Praha 1, Repubblica Ceca, ID 07136943, VAT CZ07136943, email: info@domyvitalii.cz.'
        ]
      },
      {
        title: '2. Quali dati trattiamo',
        paragraphs: [
          'Possiamo trattare dati identificativi e di contatto, dati account, dati relativi agli acquisti, preferenze di comunicazione, contenuti inviati tramite moduli, dati tecnici di accesso, log di sicurezza e prove di consenso o accettazione contrattuale.'
        ]
      },
      {
        title: '3. Finalità e basi giuridiche',
        bullets: [
          "creazione e gestione dell'account: esecuzione del contratto o misure precontrattuali",
          'vendita, pagamento, consegna dei PDF premium e supporto clienti: esecuzione del contratto e obblighi legali',
          'sicurezza, prevenzione abusi, logging tecnico e difesa in caso di contestazioni: legittimo interesse',
          'marketing email e comunicazioni promozionali: consenso esplicito',
          'adempimenti fiscali, contabili e normativi: obbligo legale'
        ]
      },
      {
        title: '4. Destinatari e fornitori',
        paragraphs: [
          'I dati possono essere trattati, nei limiti necessari, da fornitori tecnici e commerciali usati per erogare il servizio, inclusi hosting e database, autenticazione, pagamenti, email transazionali, CMS e servizi AI/automazione quando attivati.',
          'In base alla configurazione del sito, i principali fornitori possono includere Supabase, Stripe, SendGrid, Sanity, OpenAI e Google Gemini.'
        ]
      },
      {
        title: '5. Trasferimenti extra UE/SEE',
        paragraphs: [
          'Alcuni fornitori possono trattare dati fuori dallo Spazio Economico Europeo. In tali casi il trattamento avviene sulla base degli strumenti previsti dal GDPR, come decisioni di adeguatezza o clausole contrattuali standard, secondo quanto dichiarato dal rispettivo fornitore.'
        ]
      },
      {
        title: '6. Conservazione dei dati',
        bullets: [
          "dati account: per la durata dell'account e per un periodo ragionevole successivo, salvo obblighi di legge diversi",
          'dati acquisto e supporto: per il tempo necessario a eseguire il contratto, gestire assistenza, prova del consenso e obblighi contabili o fiscali',
          'consensi marketing e prove di accettazione legale: finché necessari a dimostrare il consenso o a gestire contestazioni',
          'log tecnici e di sicurezza: per il tempo strettamente necessario alla sicurezza e alla prevenzione abusi'
        ]
      },
      {
        title: "7. Diritti dell'interessato",
        paragraphs: [
          'Puoi chiedere accesso, rettifica, cancellazione, limitazione del trattamento, opposizione, portabilità dei dati e revoca del consenso in qualsiasi momento, nei limiti previsti dalla legge.'
        ]
      },
      {
        title: '8. Marketing e revoca del consenso',
        paragraphs: [
          "Le email promozionali vengono inviate solo in presenza di consenso esplicito quando richiesto. Il consenso è facoltativo e può essere revocato in qualsiasi momento dalle preferenze dell'account o scrivendo a info@domyvitalii.cz."
        ]
      },
      {
        title: '9. Reclami',
        paragraphs: [
          "Se ritieni che il trattamento dei tuoi dati violi la normativa applicabile, puoi contattarci e hai anche il diritto di proporre reclamo all'autorità di controllo competente del tuo luogo di residenza abituale, del luogo di lavoro o del luogo della presunta violazione."
        ]
      },
      {
        title: '10. Nota importante',
        paragraphs: [
          "Questa informativa descrive in sintesi il funzionamento attuale del sito. Se il progetto verrà esteso con analytics, nuovi strumenti marketing, ulteriori responsabili o nuove finalità di trattamento, l'informativa dovrà essere aggiornata di conseguenza."
        ]
      }
    ]
  },
  en: {
    title: 'Privacy notice and GDPR',
    subtitle: 'Information about personal data processing',
    updatedAt: 'Last updated: April 7, 2026',
    sections: [
      {
        title: '1. Data controller',
        paragraphs: [
          'The data controller is Creavita s.r.o., Vodičkova 37, Palác Langhans, 110 00 Praha 1, Czech Republic, ID 07136943, VAT CZ07136943, email: info@domyvitalii.cz.'
        ]
      },
      {
        title: '2. What data we process',
        paragraphs: [
          'We may process identity and contact data, account data, purchase data, communication preferences, content submitted through forms, technical access data, security logs, and records of consent or contractual acceptance.'
        ]
      },
      {
        title: '3. Purposes and legal bases',
        bullets: [
          'account creation and management: contract performance or pre-contractual steps',
          'sale, payment, delivery of premium PDFs and customer support: contract performance and legal obligations',
          'security, abuse prevention, technical logging and legal defense: legitimate interest',
          'marketing emails and promotional communication: explicit consent',
          'tax, accounting and regulatory obligations: legal obligation'
        ]
      },
      {
        title: '4. Recipients and service providers',
        paragraphs: [
          'Data may be processed, only where necessary, by technical and commercial providers used to operate the service, including hosting and database providers, authentication, payments, transactional email, CMS and AI or automation providers when enabled.',
          'Depending on the live configuration, key providers may include Supabase, Stripe, SendGrid, Sanity, OpenAI and Google Gemini.'
        ]
      },
      {
        title: '5. Transfers outside the EU or EEA',
        paragraphs: [
          'Some providers may process data outside the European Economic Area. In such cases, processing relies on GDPR transfer mechanisms such as adequacy decisions or standard contractual clauses, according to the provider setup.'
        ]
      },
      {
        title: '6. Data retention',
        bullets: [
          'account data: for the duration of the account and a reasonable period afterwards unless a different legal obligation applies',
          'purchase and support data: as long as needed to perform the contract, provide support, prove acceptance and comply with accounting or tax obligations',
          'marketing consent and legal acceptance records: as long as necessary to demonstrate consent or handle disputes',
          'technical and security logs: only for the period strictly necessary for security and abuse prevention'
        ]
      },
      {
        title: '7. Your rights',
        paragraphs: [
          'You may request access, rectification, erasure, restriction, objection, data portability and withdrawal of consent at any time, subject to applicable law.'
        ]
      },
      {
        title: '8. Marketing and withdrawal of consent',
        paragraphs: [
          'Promotional emails are sent only where explicit consent exists when required. Consent is optional and can be withdrawn at any time from account preferences or by writing to info@domyvitalii.cz.'
        ]
      },
      {
        title: '9. Complaints',
        paragraphs: [
          'If you believe our processing infringes applicable law, you can contact us and you also have the right to lodge a complaint with the competent supervisory authority in your place of residence, work or the place of the alleged infringement.'
        ]
      },
      {
        title: '10. Important note',
        paragraphs: [
          'This notice describes the current website setup at a high level. If the project expands with analytics, additional marketing tools, more processors or new purposes, this notice must be updated accordingly.'
        ]
      }
    ]
  },
  cs: {
    title: 'Ochrana osobních údajů a GDPR',
    subtitle: 'Informace o zpracování osobních údajů',
    updatedAt: 'Poslední aktualizace: 7. dubna 2026',
    sections: [
      {
        title: '1. Správce údajů',
        paragraphs: [
          'Správcem osobních údajů je Creavita s.r.o., Vodičkova 37, Palác Langhans, 110 00 Praha 1, Česká republika, ID 07136943, VAT CZ07136943, email: info@domyvitalii.cz.'
        ]
      },
      {
        title: '2. Jaké údaje zpracováváme',
        paragraphs: [
          'Můžeme zpracovávat identifikační a kontaktní údaje, údaje o účtu, údaje o nákupu, preference komunikace, obsah zaslaný přes formuláře, technické přístupové údaje, bezpečnostní logy a záznamy o souhlasu nebo smluvním potvrzení.'
        ]
      },
      {
        title: '3. Účely a právní základy',
        bullets: [
          'vytvoření a správa účtu: plnění smlouvy nebo kroky před uzavřením smlouvy',
          'prodej, platba, dodání premium PDF a zákaznická podpora: plnění smlouvy a právní povinnosti',
          'bezpečnost, prevence zneužití, technické logování a právní obrana: oprávněný zájem',
          'marketingové e-maily a propagační komunikace: výslovný souhlas',
          'daňové, účetní a regulatorní povinnosti: právní povinnost'
        ]
      },
      {
        title: '4. Příjemci a poskytovatelé',
        paragraphs: [
          'Údaje mohou být v nezbytném rozsahu zpracovávány technickými a obchodními poskytovateli služeb, kteří jsou potřeba pro provoz webu, včetně hostingu a databáze, autentizace, plateb, transakčních e-mailů, CMS a AI služeb, pokud jsou aktivní.',
          'Podle aktuální konfigurace mohou mezi hlavní poskytovatele patřit Supabase, Stripe, SendGrid, Sanity, OpenAI a Google Gemini.'
        ]
      },
      {
        title: '5. Předávání mimo EU a EHP',
        paragraphs: [
          'Někteří poskytovatelé mohou zpracovávat údaje mimo Evropský hospodářský prostor. V takovém případě se využívají mechanismy podle GDPR, například rozhodnutí o odpovídající ochraně nebo standardní smluvní doložky.'
        ]
      },
      {
        title: '6. Doba uchování',
        bullets: [
          'údaje o účtu: po dobu existence účtu a přiměřenou dobu poté, pokud zákon nevyžaduje jinak',
          'údaje o nákupu a podpoře: po dobu nutnou pro plnění smlouvy, podporu, dokázání souhlasu a splnění účetních nebo daňových povinností',
          'marketingové souhlasy a právní záznamy: po dobu nutnou k dokázání souhlasu nebo řešení sporů',
          'technické a bezpečnostní logy: pouze po dobu nezbytně nutnou pro bezpečnost a prevenci zneužití'
        ]
      },
      {
        title: '7. Vaše práva',
        paragraphs: [
          'Máte právo požadovat přístup, opravu, výmaz, omezení zpracování, vznést námitku, přenositelnost údajů a odvolat souhlas, pokud to umožňuje zákon.'
        ]
      },
      {
        title: '8. Marketing a odvolání souhlasu',
        paragraphs: [
          'Propagační e-maily zašleme pouze tehdy, když k tomu existuje vyžadovaný souhlas. Souhlas je dobrovolný a můžete ho kdykoli odvolat v nastavení účtu nebo e-mailem na info@domyvitalii.cz.'
        ]
      },
      {
        title: '9. Stížnosti',
        paragraphs: [
          'Pokud se domníváte, že zpracování porušuje platné právo, můžete nás kontaktovat a máte také právo podat stížnost příslušnému dozorovému úřadu.'
        ]
      },
      {
        title: '10. Důležitá poznámka',
        paragraphs: [
          'Tato informace popisuje aktuální nastavení webu. Pokud budou přidány další analytické nebo marketingové nástroje, další zpracovatelé nebo nové účely, musí být tato stránka aktualizována.'
        ]
      }
    ]
  }
}

export default function GdprPage() {
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
                    {section.paragraphs?.map((paragraph) => (
                      <p key={paragraph} className="leading-relaxed">{paragraph}</p>
                    ))}
                    {section.bullets ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {section.bullets.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
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
