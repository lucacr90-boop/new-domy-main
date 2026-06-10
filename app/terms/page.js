'use client'

import { useEffect, useState } from 'react'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import PropertySlider from '@/components/PropertySlider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const CONTENT = {
  it: {
    title: 'Termini di vendita - contenuti digitali',
    subtitle: 'Condizioni per PDF premium acquistati online',
    updatedAt: 'Ultimo aggiornamento: 7 aprile 2026',
    sections: [
      {
        title: '1. Venditore',
        paragraphs: [
          'Il venditore è Creavita s.r.o., Vodičkova 37, Palác Langhans, 110 00 Praha 1, Repubblica Ceca, ID 07136943, VAT CZ07136943, email: info@domyvitalii.cz.'
        ]
      },
      {
        title: '2. Oggetto del contratto',
        paragraphs: [
          'Il sito vende contenuti digitali in formato PDF ad uso personale informativo. Salvo diversa indicazione esplicita, i materiali non costituiscono consulenza legale, fiscale, notarile o tecnica personalizzata.'
        ]
      },
      {
        title: '3. Prezzo, imposte e pagamento',
        paragraphs: [
          "Il prezzo totale viene mostrato prima della conferma dell'acquisto. Il pagamento è gestito tramite Stripe su infrastrutture sicure.",
          "Eventuali obblighi fiscali, contabili o di fatturazione seguono la normativa applicabile al venditore e alla specifica operazione. Per richieste documentali o assistenza post-acquisto puoi contattarci via email."
        ]
      },
      {
        title: '4. Consegna del contenuto digitale',
        paragraphs: [
          "Dopo la conferma del pagamento, il contenuto digitale viene reso disponibile tramite area utente e/o link di download sicuro. Il venditore non garantisce la disponibilità illimitata nel tempo di ogni link temporaneo, ma si impegna a fornire un accesso ragionevole al contenuto acquistato."
        ]
      },
      {
        title: '5. Recesso e contenuti digitali',
        paragraphs: [
          "Per i contenuti digitali non forniti su supporto materiale, il diritto di recesso può essere perso quando l'esecuzione è iniziata con previo consenso espresso del consumatore e con la sua presa d'atto della perdita del diritto di recesso.",
          'Nel checkout il cliente deve confermare espressamente la richiesta di fornitura immediata e la consapevolezza di tale effetto.'
        ]
      },
      {
        title: '6. Uso consentito',
        bullets: [
          'uso personale e non esclusivo',
          'divieto di rivendita, redistribuzione pubblica o condivisione non autorizzata',
          'divieto di presentare il contenuto come consulenza professionale personalizzata del venditore'
        ]
      },
      {
        title: '7. Assistenza, difetti tecnici e reclami',
        paragraphs: [
          'Se dopo il pagamento riscontri problemi tecnici di accesso o download, contatta info@domyvitalii.cz indicando email di acquisto, prodotto acquistato e descrizione del problema. Verificheremo il diritto di accesso e, se necessario, riattiveremo la consegna.'
        ]
      },
      {
        title: '8. Limitazioni di responsabilità',
        paragraphs: [
          'Il contenuto ha finalità informative e operative generali. Le decisioni su acquisti immobiliari, fiscalità, pratiche notarili, investimenti, permessi o conformità richiedono verifiche specifiche sul singolo caso con professionisti qualificati.'
        ]
      },
      {
        title: '9. Legge applicabile e diritti del consumatore',
        paragraphs: [
          'Questi termini sono interpretati secondo il diritto applicabile del venditore, fatti salvi i diritti inderogabili del consumatore nel proprio Paese di residenza. Restano ferme le tutele obbligatorie previste dalla normativa UE e nazionale applicabile.'
        ]
      }
    ]
  },
  en: {
    title: 'Terms of sale - digital content',
    subtitle: 'Conditions for premium PDFs purchased online',
    updatedAt: 'Last updated: April 7, 2026',
    sections: [
      {
        title: '1. Seller',
        paragraphs: [
          'The seller is Creavita s.r.o., Vodičkova 37, Palác Langhans, 110 00 Praha 1, Czech Republic, ID 07136943, VAT CZ07136943, email: info@domyvitalii.cz.'
        ]
      },
      {
        title: '2. Contract subject',
        paragraphs: [
          'The website sells digital PDF content for personal informational use. Unless expressly stated otherwise, the materials do not constitute individualized legal, tax, notarial or technical advice.'
        ]
      },
      {
        title: '3. Price, taxes and payment',
        paragraphs: [
          'The total price is shown before purchase confirmation. Payment is processed through Stripe on secure infrastructure.',
          'Any tax, accounting or invoicing obligations depend on the applicable law and transaction setup. For post-purchase documentation requests or assistance, contact us by email.'
        ]
      },
      {
        title: '4. Delivery of digital content',
        paragraphs: [
          'After successful payment, the digital content is made available through the user area and/or a secure download link. The seller does not guarantee unlimited lifetime availability of every temporary link, but undertakes to provide reasonable access to the purchased content.'
        ]
      },
      {
        title: '5. Withdrawal right and digital content',
        paragraphs: [
          "For digital content not supplied on a tangible medium, the withdrawal right can be lost once performance begins with the consumer's prior express consent and acknowledgment of that consequence.",
          'During checkout, the customer must expressly confirm immediate supply and awareness of this effect.'
        ]
      },
      {
        title: '6. Permitted use',
        bullets: [
          'personal and non-exclusive use',
          'no resale, public redistribution or unauthorized sharing',
          'no presentation of the content as individualized professional advice from the seller'
        ]
      },
      {
        title: '7. Support, technical defects and complaints',
        paragraphs: [
          'If you encounter technical access or download issues after payment, contact info@domyvitalii.cz with your purchase email, product name and a description of the problem. We will verify entitlement and, if needed, restore access.'
        ]
      },
      {
        title: '8. Limitation of liability',
        paragraphs: [
          'The content is intended for general informational and operational guidance. Decisions on real estate purchases, taxation, notarial steps, investments, permits or compliance require case-specific review with qualified professionals.'
        ]
      },
      {
        title: '9. Applicable law and consumer rights',
        paragraphs: [
          "These terms are interpreted under the law applicable to the seller, without prejudice to mandatory consumer rights in the customer's country of residence. Mandatory protections under EU and national law remain unaffected."
        ]
      }
    ]
  },
  cs: {
    title: 'Obchodní podmínky - digitální obsah',
    subtitle: 'Podmínky pro prémiové PDF zakoupené online',
    updatedAt: 'Poslední aktualizace: 7. dubna 2026',
    sections: [
      {
        title: '1. Prodávající',
        paragraphs: [
          'Prodávajícím je Creavita s.r.o., Vodičkova 37, Palác Langhans, 110 00 Praha 1, Česká republika, ID 07136943, VAT CZ07136943, email: info@domyvitalii.cz.'
        ]
      },
      {
        title: '2. Předmět smlouvy',
        paragraphs: [
          'Web prodává digitální obsah ve formátu PDF pro osobní informační použití. Pokud není výslovně uvedeno jinak, materiály nepředstavují individuální právní, daňové, notářské ani technické poradenství.'
        ]
      },
      {
        title: '3. Cena, daně a platba',
        paragraphs: [
          'Celková cena je zobrazena před potvrzením nákupu. Platba probíhá přes Stripe na zabezpečené infrastruktuře.',
          'Případné daňové, účetní nebo fakturační povinnosti se řídí použitelným právem a konkrétním nastavením transakce. Pro dokumentaci nebo podporu po nákupu nás kontaktujte emailem.'
        ]
      },
      {
        title: '4. Dodání digitálního obsahu',
        paragraphs: [
          'Po úspěšné platbě je digitální obsah zpřístupněn přes uživatelskou sekci a/nebo bezpečný odkaz ke stažení. Prodávající negarantuje neomezenou časovou platnost každého dočasného odkazu, ale zajistí přiměřený přístup k zakoupenému obsahu.'
        ]
      },
      {
        title: '5. Odstoupení od smlouvy a digitální obsah',
        paragraphs: [
          'U digitálního obsahu nedodávaného na hmotném nosiči může právo na odstoupení zaniknout, pokud plnění začne po předchozím výslovném souhlasu spotřebitele a po jeho potvrzení, že tím ztrácí právo na odstoupení.',
          'V checkoutu musí zákazník výslovně potvrdit okamžité dodání a vědomí tohoto důsledku.'
        ]
      },
      {
        title: '6. Povolené užití',
        bullets: [
          'osobní a nevýlučné užití',
          'žádný další prodej, veřejná redistribuce ani neoprávněné sdílení',
          'zákaz vydávat obsah za individuální profesionální poradenství prodávajícího'
        ]
      },
      {
        title: '7. Podpora, technické vady a reklamace',
        paragraphs: [
          'Pokud po zaplacení nastanou technické potíže s přístupem nebo stažením, kontaktujte info@domyvitalii.cz a uveďte email použitý při nákupu, produkt a popis problému. Ověříme oprávnění a v případě potřeby obnovíme přístup.'
        ]
      },
      {
        title: '8. Omezení odpovědnosti',
        paragraphs: [
          'Obsah slouží jako obecné informační a operativní vodítko. Rozhodnutí týkající se nákupu nemovitostí, daní, notářských kroků, investic, povolení nebo compliance vyžadují posouzení konkrétního případu kvalifikovanými odborníky.'
        ]
      },
      {
        title: '9. Rozhodné právo a práva spotřebitele',
        paragraphs: [
          'Tyto podmínky se vykládají podle práva použitelného na prodávajícího, aniž by byla dotčena kogentní práva spotřebitele v zemi jeho bydliště. Povinné ochrany podle práva EU a národního práva zůstávají zachovány.'
        ]
      }
    ]
  }
}

export default function TermsPage() {
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
