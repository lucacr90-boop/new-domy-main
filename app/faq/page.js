'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PropertySlider from '@/components/PropertySlider'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'
import ProtectedContentLink from '@/components/ProtectedContentLink'

const FAQ_ITEMS = [
  {
    question: {
      en: 'Can Czech citizens buy property in Italy?',
      cs: 'Mohou Češi koupit nemovitost v Itálii?',
      it: 'I cittadini cechi possono acquistare immobili in Italia?'
    },
    answer: {
      en: 'Yes. Citizens of the Czech Republic can buy property in Italy without restrictions – houses and apartments, for both recreational and investment purposes.',
      cs: 'Ano. Občané České republiky mohou v Itálii bez omezení kupovat nemovitostí – domy i byty, a to jak pro rekreační, tak investiční účely.',
      it: 'Sì. I cittadini della Repubblica Ceca possono acquistare immobili in Italia senza restrizioni – case e appartamenti, sia per scopi ricreativi che di investimento.'
    }
  },
  {
    question: {
      en: 'Is it necessary to have permanent residence in Italy?',
      cs: 'Je nutné mít trvalý pobyt v Itálii?',
      it: 'È necessario avere la residenza permanente in Italia?'
    },
    answer: {
      en: 'No. Permanent residence in Italy is not a condition for buying a house or apartment. However, the buyer must complete certain administrative steps that differ from the Czech system.',
      cs: 'Ne. Trvalý pobyt v Itálii není podmínkou pro koupí domů nebo bytu. Kupující však musí splnit určité administrativní kroky, které se liší od českého systému.',
      it: 'No. La residenza permanente in Italia non è una condizione per l\'acquisto di una casa o appartamento. Tuttavia, l\'acquirente deve completare alcuni passaggi amministrativi diversi dal sistema ceco.'
    }
  },
  {
    question: {
      en: 'What is the role of the notary when buying property?',
      cs: 'Jakou roli má notář při koupí nemovitostí?',
      it: 'Qual è il ruolo del notaio nell\'acquisto di un immobile?'
    },
    answer: {
      en: 'The notary in Italy plays a key role. They ensure the legal correctness of the entire transaction, verify ownership rights, and transfer the property to the new owner. Their role is different from the Czech Republic and is often underestimated by Czech buyers. The notary has criminal liability for their actions by law.',
      cs: 'Notář v Itálii hraje klíčovou roli. Zajišťuje právní správnost celé transakce, kontrolu vlastnických práv a převod nemovitostí na nového majitele. Jeho role je jiná než v Česku a často bývá českými kupujícími podceňována. Notář má ze zákona trestněprávní odpovědnost za svá jednání.',
      it: 'Il notaio in Italia svolge un ruolo chiave. Garantisce la correttezza legale dell\'intera transazione, verifica i diritti di proprietà e trasferisce l\'immobile al nuovo proprietario. Il suo ruolo è diverso dalla Repubblica Ceca e spesso viene sottovalutato dagli acquirenti cechi. Il notaio ha responsabilità penale per le sue azioni per legge.'
    }
  },
  {
    question: {
      en: 'What are the main costs associated with buying a house?',
      cs: 'Jaké jsou hlavní náklady spojené s koupí domů?',
      it: 'Quali sono i principali costi associati all\'acquisto di una casa?'
    },
    answer: {
      en: 'In addition to the property price itself, you need to count on: taxes and fees, notary costs, possible real estate agency commission, and technical inspections and documentation. The total costs may vary by region and property type. Generally, expect an additional 10–15% on top of the purchase price.',
      cs: 'Kromě samotné ceny nemovitostí je nutné počítat zejména s: daněmi a poplatky, notářskými náklady, případnou provizí realitní kanceláře a technickými kontrolami a dokumentací. Celkové náklady se mohou lišit podle regionu i typu nemovitostí. Obecně počítejte s rezervou přibližně 10–15 % z kupní ceny.',
      it: 'Oltre al prezzo dell\'immobile stesso, è necessario contare: tasse e spese, costi notarili, eventuale commissione dell\'agenzia immobiliare e ispezioni tecniche e documentazione. I costi totali possono variare per regione e tipo di immobile. In generale, prevedete un ulteriore 10-15% sopra il prezzo di acquisto.'
    }
  },
  {
    question: {
      en: 'How long does the entire buying process take?',
      cs: 'Jak dlouho celý proces koupě trvá?',
      it: 'Quanto tempo dura l\'intero processo di acquisto?'
    },
    answer: {
      en: 'The length of the process depends on the specific property, documents, and region. Usually it takes several weeks to months from the first selection to signing the purchase agreement with the notary. The preparation of the purchase contract in Italy can take approximately 1 to 3 months.',
      cs: 'Délka procesu závisí na konkrétní nemovitostí, dokumentech a regionu. Obvykle se jedná o několik týdnů až měsíců od prvního výběru po podpis kupní smlouvy u notáře. Proces přípravy kupní smlouvy může v Itálii trvat přibližně 1 až 3 měsíce.',
      it: 'La durata del processo dipende dall\'immobile specifico, dai documenti e dalla regione. Di solito si tratta di diverse settimane o mesi dalla prima selezione alla firma del contratto di acquisto dal notaio. La preparazione del contratto di acquisto in Italia può richiedere circa 1-3 mesi.'
    }
  },
  {
    question: {
      en: 'Is it possible to buy property in Italy remotely?',
      cs: 'Je možné koupit nemovitost v Itálii na dálku?',
      it: 'È possibile acquistare un immobile in Italia a distanza?'
    },
    answer: {
      en: 'Partially yes. Some steps can be handled remotely. However, we usually recommend a personal visit to the property and attendance at the notary signing, so that the buyer has full control over the entire process.',
      cs: 'Částečně ano. Některé kroky lze řešit i na dálku. Většinou však doporučujeme osobní návštěvu nemovitostí a účast u podpisu u notáře, aby měl kupující plnou kontrolu nad celým procesem.',
      it: 'Parzialmente sì. Alcuni passaggi possono essere gestiti a distanza. Tuttavia, di solito raccomandiamo una visita personale all\'immobile e la partecipazione alla firma dal notaio, affinché l\'acquirente abbia il pieno controllo sull\'intero processo.'
    }
  },
  {
    question: {
      en: 'Does the buying process differ by region in Italy?',
      cs: 'Liší se proces koupě podle regionu v Itálii?',
      it: 'Il processo di acquisto varia da regione a regione in Italia?'
    },
    answer: {
      en: 'Yes. Italy is not a unified system. Procedures, local rules, taxes, and costs can differ significantly by region and municipality. What works in northern Italy may not apply in the south or by the sea.',
      cs: 'Ano. Itálie není jednotný systém. Postupy, místní pravidla, daně i náklady se mohou výrazně lišit podle regionu a obce. To, co funguje na severu Itálie, nemusí platit na jihu nebo u moře.',
      it: 'Sì. L\'Italia non è un sistema unificato. Le procedure, le regole locali, le tasse e i costi possono differire significativamente per regione e comune. Quello che funziona nel nord Italia potrebbe non valere nel sud o al mare.'
    }
  },
  {
    question: {
      en: 'What are the most common mistakes Czechs make when buying a house in Italy?',
      cs: 'Jaké chyby Češi při koupí domů v Itálii dělají nejčastěji?',
      it: 'Quali sono gli errori più comuni che i cechi commettono quando acquistano una casa in Italia?'
    },
    answer: {
      en: 'The most common problems don\'t arise from carelessness, but from: unfamiliarity with local administration, the assumption that everything works the same as in the Czech Republic, underestimating the technical condition of the property, and missing information before the first step. These "details" often determine whether the purchase will be a pleasant experience or an unnecessarily complicated process.',
      cs: 'Nejčastější problémy nevznikají kvůli nepozornosti, ale kvůli: neznalosti místní administrativy, předpokladu, že vše funguje stejně jako v Česku, podcenění technického stavu nemovitostí a chybějícím informacím ještě před prvním krokem. Právě tyto „detaily" často rozhodují, zda bude koupě příjemnou zkušeností, nebo zbytečně složitým procesem.',
      it: 'I problemi più comuni non sorgono per disattenzione, ma per: scarsa conoscenza dell\'amministrazione locale, il presupposto che tutto funzioni come nella Repubblica Ceca, sottovalutazione delle condizioni tecniche dell\'immobile e mancanza di informazioni prima del primo passo. Questi "dettagli" spesso determinano se l\'acquisto sarà un\'esperienza piacevole o un processo inutilmente complicato.'
    }
  }
]

export default function FAQPage() {
  const [language, setLanguage] = useState('cs')
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    const handleLanguageChange = (event) => {
      setLanguage(event.detail)
      document.documentElement.lang = event.detail
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <div className="pt-28 md:pt-32 pb-12">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-16 md:py-24 mb-8" style={{ maxWidth: '1200px' }}>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-6">
              <HelpCircle className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600 font-medium">FAQ</span>
            </div>
            <h1 className="font-extrabold mb-6 text-slate-800">
              {language === 'cs' ? 'Časté dotazy ke koupí domů v Itálii' :
               language === 'it' ? 'Domande frequenti sull\'acquisto di una casa in Italia' :
               'FAQ - Buying a House in Italy'}
            </h1>
            <p className="text-lg text-gray-500 leading-[1.75] max-w-2xl mx-auto">
              {language === 'cs' ? 'Koupě nemovitostí v Itálii vyvolává u českých zájemců mnoho otázek. Proces se v mnoha ohledech liší od České republiky.' :
               language === 'it' ? 'L\'acquisto di un immobile in Italia solleva molte domande tra gli interessati cechi. Il processo differisce per molti aspetti dalla Repubblica Ceca.' :
               'Buying property in Italy raises many questions for Czech interested buyers. The process differs in many ways from the Czech Republic.'}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6" style={{ maxWidth: '1200px' }}>
          {/* FAQ Accordion */}
          <div className="max-w-3xl mx-auto mb-20">
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
                    openIndex === index ? 'border-slate-200 shadow-md' : 'border-gray-100 hover:border-gray-200 shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left p-5 md:p-6 flex items-start justify-between gap-4 cursor-pointer leading-none hover:opacity-80"
                  >
                    <div className="flex items-start gap-4">
                      <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors duration-200 ${
                        openIndex === index ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-base md:text-lg font-semibold text-slate-800 leading-snug pt-0.5">
                        {item.question[language]}
                      </span>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-slate-400 flex-shrink-0 mt-1.5 transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-5 md:px-6 pb-6 pl-[4.25rem] md:pl-[4.75rem]">
                      <p className="text-gray-500 leading-[1.75] text-base">
                        {item.answer[language]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b border-gray-100">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {language === 'cs' ? 'Jak pokračovat dál?' :
                   language === 'it' ? 'Come continuare?' :
                   'How to Continue?'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProtectedContentLink href="/guides/mistakes" language={language} className="group">
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all duration-300">
                      <h4 className="font-semibold text-slate-800 mb-2 group-hover:text-slate-900">
                        {language === 'cs' ? 'Nejčastější chyby Čechů' :
                         language === 'it' ? 'Errori più comuni dei cechi' :
                         'Most Common Czech Mistakes'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === 'cs' ? 'Na co si dát pozor, abyste neztratili čas a peníze.' :
                         language === 'it' ? 'A cosa fare attenzione per non perdere tempo e denaro.' :
                         'What to watch out for to avoid losing time and money.'}
                      </p>
                    </div>
                  </ProtectedContentLink>
                  <Link href="/process" className="group">
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all duration-300">
                      <h4 className="font-semibold text-slate-800 mb-2 group-hover:text-slate-900">
                        {language === 'cs' ? 'Krok za krokem' :
                         language === 'it' ? 'Passo dopo passo' :
                         'Step by Step'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === 'cs' ? 'Celý postup koupě nemovitostí v Itálii.' :
                         language === 'it' ? 'L\'intero processo di acquisto di un immobile in Italia.' :
                         'The entire process of buying property in Italy.'}
                      </p>
                    </div>
                  </Link>
                  <Link href="/regions" className="group">
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all duration-300">
                      <h4 className="font-semibold text-slate-800 mb-2 group-hover:text-slate-900">
                        {language === 'cs' ? 'Regiony Itálie' :
                         language === 'it' ? 'Regioni d\'Italia' :
                         'Italian Regions'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === 'cs' ? 'Kde dává koupě domů největší smysl.' :
                         language === 'it' ? 'Dove ha più senso acquistare una casa.' :
                         'Where buying a house makes the most sense.'}
                      </p>
                    </div>
                  </Link>
                  <ProtectedContentLink href="/guides/costs" language={language} className="group">
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all duration-300">
                      <h4 className="font-semibold text-slate-800 mb-2 group-hover:text-slate-900">
                        {language === 'cs' ? 'Náklady koupě' :
                         language === 'it' ? 'Costi di acquisto' :
                         'Purchase Costs'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === 'cs' ? 'Kolik skutečně stojí koupě domů v Itálii.' :
                         language === 'it' ? 'Quanto costa realmente acquistare una casa in Italia.' :
                         'How much it really costs to buy a house in Italy.'}
                      </p>
                    </div>
                  </ProtectedContentLink>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact CTA */}
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
              <div className="relative p-10 md:p-14 text-center">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                  <HelpCircle className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                  {language === 'cs' ? 'Máte konkrétní dotaz?' :
                   language === 'it' ? 'Hai una domanda specifica?' :
                   'Have a Specific Question?'}
                </h2>
                <p className="text-gray-300 text-lg mb-8 leading-[1.75] max-w-xl mx-auto">
                  {language === 'cs' ? 'Napište nám – poradíme individuálně podle vaší situace.' :
                   language === 'it' ? 'Scriveteci – vi consiglieremo individualmente in base alla vostra situazione.' :
                   'Write to us – we\'ll advise you individually based on your situation.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="https://wa.me/420731450001" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full sm:w-auto bg-white hover:bg-gray-100 text-slate-800 font-semibold px-8 py-5 text-base transition-all duration-300 shadow-lg rounded-xl">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      WhatsApp
                    </Button>
                  </a>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:border-white/30 font-medium px-8 py-5 text-base transition-all duration-300 rounded-xl bg-transparent border"
                    onClick={() => window.location.href = 'mailto:info@domyvitalii.cz'}
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    info@domyvitalii.cz
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pb-10">
        <div className="max-w-5xl mx-auto">
          <InformationalDisclaimer language={language} />
        </div>
      </div>

      <PropertySlider language={language} />
      <Footer language={language} />
    </div>
  )
}
