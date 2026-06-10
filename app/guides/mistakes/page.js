'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ArrowLeft, AlertTriangle, XCircle, CheckCircle, FileWarning } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../../../lib/supabase'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'
import Footer from '@/components/Footer'
import Navigation from '@/components/Navigation'

const FreePdfUpsellModal = dynamic(() => import('../../../components/FreePdfUpsellModal'), { ssr: false })

export default function MistakesGuidePage() {
  const [user, setUser] = useState(null)
  const [isFreePdfUpsellOpen, setIsFreePdfUpsellOpen] = useState(false)
  const [language, setLanguage] = useState('cs')

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

  useEffect(() => {
    if (!supabase) return
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleFreePdfDownload = () => {
    if (typeof window !== 'undefined') {
      window.open('/pdfs/errori-comuni.pdf', '_blank', 'noopener,noreferrer')
    }

    setIsFreePdfUpsellOpen(true)

    fetch('/api/free-pdf/upsell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pdfKey: 'mistakes-guide',
        language,
        sourcePath: '/guides/mistakes'
      }),
      keepalive: true
    }).catch((error) => {
      console.error('[FREE PDF UPSELL] Trigger error:', error)
    })
  }

  const upsellCopy =
    language === 'cs'
      ? {
          title: 'Chcete i prémiové PDF?',
          body: 'Bezplatné PDF jste už stáhli. Pokud chcete praktičtější a podrobnější materiál, můžete si odemknout také placené PDF.',
          bullets: [
            'konkrétní prevence častých chyb',
            'jasnější práce s náklady a riziky',
            'praktická struktura kroků a dokumentů'
          ],
          cta: 'Zobrazit prémiové PDF',
          secondary: 'Později'
        }
      : language === 'it'
        ? {
            title: 'Vuoi continuare dopo il PDF gratuito?',
            body: 'Hai già scaricato il PDF gratuito. Se vuoi fare il passo successivo, puoi proseguire con le guide gratuite oppure contattarci per capire come impostare il percorso nel tuo caso.',
            bullets: [
              'guida gratuita su costi e tasse',
              'approfondimento gratuito sul ruolo del notaio',
              'contatto diretto per orientarti sui prossimi passi'
            ],
            cta: 'Contattaci',
            secondary: 'Più tardi'
          }
        : {
            title: 'Do you want to continue after the free PDF?',
            body: 'You already downloaded the free PDF. If you want to take the next step, continue with the free guides or contact us to understand what makes sense in your case.',
            bullets: [
              'free guide about costs and taxes',
              'free guide about the notary role',
              'direct contact for the next steps'
            ],
            cta: 'Contact us',
            secondary: 'Later'
          }

  const articleImage =
    language === 'cs'
      ? {
          src: '/articles/common-mistakes-laptop-stress.jpg',
          alt: 'Kupující kontrolují dokumenty s poradcem',
          caption: 'Mnoho chyb nevzniká kvůli domů samotnému, ale kvůli dokumentům čteným pozdě, přeskočeným kontrolám a špatně řízené byrokracii.'
        }
      : language === 'it'
        ? {
            src: '/articles/common-mistakes-laptop-stress.jpg',
            alt: 'Acquirenti che controllano documenti con un consulente',
            caption: 'Molti errori non nascono dalla casa in sé, ma da documenti fraintesi, verifiche saltate e passaggi burocratici gestiti male.'
          }
        : {
            src: '/articles/common-mistakes-laptop-stress.jpg',
            alt: 'Property buyers reviewing documents with an advisor',
            caption: 'Many mistakes come not from the house itself, but from misunderstood documents, skipped checks, and badly managed bureaucracy.'
          }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50">
      <Navigation />

      <div className="pt-28 pb-16 md:pb-24">
        <div className="container mx-auto px-6 mb-6" style={{ maxWidth: '1200px' }}>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-slate-700">{language === 'cs' ? 'Domů' : language === 'it' ? 'Casa' : 'Home'}</Link>
            <span>/</span>
            <Link href="/process" className="hover:text-slate-700">{language === 'cs' ? 'Průvodce' : language === 'it' ? 'Guida' : 'Guide'}</Link>
            <span>/</span>
            <span className="text-slate-700 font-medium">
              {language === 'cs' ? 'Nejčastější chyby' : language === 'it' ? 'Errori comuni' : 'Common Mistakes'}
            </span>
          </div>
        </div>

        <div className="container mx-auto px-6" style={{ maxWidth: '1200px' }}>
          <div className="max-w-4xl mx-auto" style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="mb-8">
              <Button asChild variant="outline" className="mb-5 inline-flex items-center border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-700">
                <Link href="/blog">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {language === 'cs' ? 'Články' : language === 'it' ? 'Articoli' : 'Articles'}
                </Link>
              </Button>
              <h1 className="font-bold mb-8 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {language === 'cs' ? 'Nejčastější chyby, které Češi dělají při koupí domů v Itálii' :
                 language === 'it' ? 'Gli errori più comuni che i cechi commettono nell\'acquisto di una casa in Italia' :
                 'Most Common Mistakes Czechs Make When Buying a House in Italy'}
              </h1>
              <p className="text-gray-500 leading-relaxed" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                {language === 'cs' ? 'Při koupí domů v Itálii Češi velmi často opakují stejné chyby. Ne proto, že by byli neopatrní, ale proto, že neznají místní pravidla, procesy a souvislosti.' :
                 language === 'it' ? 'Nell\'acquisto di una casa in Italia, i cechi ripetono molto spesso gli stessi errori. Non perché siano incauti, ma perché non conoscono le regole, i processi e i contesti locali.' :
                 'When buying a house in Italy, Czechs very often repeat the same mistakes. Not because they are careless, but because they don\'t know the local rules, processes, and contexts.'}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-8">
              <Image src={articleImage.src} alt={articleImage.alt} width={1400} height={800} sizes="(min-width: 768px) 768px, 100vw" className="w-full h-64 md:h-80 object-cover" />
              <p className="text-sm text-slate-600 px-4 py-3">{articleImage.caption}</p>
            </div>

            <Card className="bg-red-50 border-red-200 mb-8">
              <CardContent className="p-6">
                <h3 className="font-bold text-red-900 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {language === 'cs' ? 'Důležité upozornění' :
                   language === 'it' ? 'Avviso importante' :
                   'Important Notice'}
                </h3>
                <p className="text-red-800 leading-relaxed">
                  {language === 'cs' ? 'Koupě domů v Itálii může být splněným snem, ale bez správných informací se může snadno změnit ve zdroj zbytečných komplikací, stresu a nečekaných výdajů.' :
                   language === 'it' ? 'L\'acquisto di una casa in Italia può essere un sogno realizzato, ma senza le giuste informazioni può facilmente trasformarsi in una fonte di complicazioni inutili, stress e spese impreviste.' :
                   'Buying a house in Italy can be a dream come true, but without proper information it can easily turn into a source of unnecessary complications, stress, and unexpected expenses.'}
                </p>
              </CardContent>
            </Card>

            <p className="text-slate-800 leading-relaxed mb-8 text-xl font-semibold whitespace-pre-line">
              {language === 'cs' ? 'Mnoho těchto chyb se neprojeví hned. Často se odhalí ve chvíli, kdy už není možné se vrátit zpět.' :
               language === 'it' ? 'Molti di questi errori non emergono subito.\nSpesso si scoprono quando tornare indietro non è più possibile.' :
               'Many of these mistakes do not appear immediately. They are often discovered when going back is no longer possible.'}
            </p>

            <div className="space-y-8">
              {/* Mistake 1 */}
              <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center mb-8">
                    <XCircle className="h-6 w-6 mr-3 text-red-600" />
                    {language === 'cs' ? '1. Spoléhání se pouze na cenu nemovitostí' :
                     language === 'it' ? '1. Affidarsi solo al prezzo dell\'immobile' :
                     '1. Relying Only on Property Price'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 leading-relaxed mb-4" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                    {language === 'cs' ? 'Jednou z nejčastějších chyb je zaměření se pouze na kupní cenu. Kupující často podceňují další povinné náklady:' :
                     language === 'it' ? 'Uno degli errori più comuni è concentrarsi solo sul prezzo di acquisto. Gli acquirenti spesso sottovalutano altri costi obbligatori:' :
                     'One of the most common mistakes is focusing only on the purchase price. Buyers often underestimate other mandatory costs:'}
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="text-gray-700">• {language === 'cs' ? 'Daně' : language === 'it' ? 'Tasse' : 'Taxes'}</li>
                    <li className="text-gray-700">• {language === 'cs' ? 'Notářské poplatky' : language === 'it' ? 'Spese notarili' : 'Notary fees'}</li>
                    <li className="text-gray-700">• {language === 'cs' ? 'Administrativní a technické kontroly' : language === 'it' ? 'Controlli amministrativi e tecnici' : 'Administrative and technical checks'}</li>
                  </ul>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-900 font-semibold">
                      {language === 'cs' ? 'Cena na inzerátu není konečná cena.' :
                       language === 'it' ? 'Il prezzo nell\'annuncio non è il prezzo finale.' :
                       'The price in the listing is not the final price.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Mistake 2 */}
              <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center mb-8">
                    <XCircle className="h-6 w-6 mr-3 text-orange-600" />
                    {language === 'cs' ? '2. Podcenění právní kontroly' :
                     language === 'it' ? '2. Sottovalutazione del controllo legale' :
                     '2. Underestimating Legal Control'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 leading-relaxed mb-4" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                    {language === 'cs' ? 'Neověření vlastnických práv, případných dluhů nebo zástav, stavebních povolení a souladu s katastrem může vést k vážným problémům i dlouho po podpisu smlouvy.' :
                     language === 'it' ? 'La mancata verifica dei diritti di proprietà, eventuali debiti o gravami, permessi edilizi e conformità catastale può portare a seri problemi anche molto tempo dopo la firma del contratto.' :
                     'Failure to verify property rights, possible debts or liens, building permits, and cadastral compliance can lead to serious problems long after signing the contract.'}
                  </p>
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-900 font-semibold">
                      {language === 'cs' ? 'V Itálii není právní kontrola formalita – je to zásadní krok, který nelze vynechat.' :
                       language === 'it' ? 'In Italia il controllo legale non è una formalità – è un passo fondamentale che non può essere saltato.' :
                       'In Italy, legal control is not a formality – it\'s a crucial step that cannot be skipped.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-200">
                <CardContent className="p-6">
                  <p className="text-slate-800 text-lg font-semibold leading-relaxed whitespace-pre-line">
                    {language === 'cs' ? 'Právě v tomto kroku se většina zahraničních kupujících spoléhá na domněnky.\nV Itálii ale kontroly nefungují „automaticky“.' :
                     language === 'it' ? 'Questo è uno dei passaggi in cui la maggior parte degli acquirenti stranieri si affida a supposizioni.\nIn Italia, però, le verifiche non funzionano “automaticamente”.' :
                     'This is one of the steps where most foreign buyers rely on assumptions.\nIn Italy, however, checks do not work “automatically”.'}
                  </p>
                  <div className="mt-5">
                    <Link href="https://new-domy-main-z3ex.vercel.app/guides/notary" target="_blank" rel="noopener noreferrer">
                      <Button className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white">
                        <FileWarning className="h-4 w-4 mr-2" />
                        {language === 'cs' ? 'Zjistit roli notáře' :
                         language === 'it' ? 'Approfondisci il ruolo del notaio' :
                         'Learn the notary role'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Mistake 3 */}
              <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center mb-8">
                    <XCircle className="h-6 w-6 mr-3 text-yellow-600" />
                    {language === 'cs' ? '3. Neznalost místních pravidel a rozdílů' :
                     language === 'it' ? '3. Ignoranza delle regole e differenze locali' :
                     '3. Lack of Knowledge of Local Rules and Differences'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 leading-relaxed mb-4" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                    {language === 'cs' ? 'Postupy v Itálii se liší region od regionu a nefungují stejně jako v České republice. To, co je běžné doma, zde často neplatí vůbec.' :
                     language === 'it' ? 'Le procedure in Italia variano da regione a regione e non funzionano allo stesso modo della Repubblica Ceca. Ciò che è comune a casa spesso qui non vale affatto.' :
                     'Procedures in Italy vary from region to region and don\'t work the same as in the Czech Republic. What is common at home often doesn\'t apply here at all.'}
                  </p>
                  <p className="text-gray-500 leading-relaxed" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                    {language === 'cs' ? 'Ignorování místních zvyklostí vede ke zdržení, chybám a stresu.' :
                     language === 'it' ? 'Ignorare le usanze locali porta a ritardi, errori e stress.' :
                     'Ignoring local customs leads to delays, mistakes, and stress.'}
                  </p>
                </CardContent>
              </Card>

              {/* Mistake 4 */}
              <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center mb-8">
                    <XCircle className="h-6 w-6 mr-3 text-purple-600" />
                    {language === 'cs' ? '4. Chybějící dlouhodobý plán' :
                     language === 'it' ? '4. Mancanza di piano a lungo termine' :
                     '4. Missing Long-Term Plan'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 leading-relaxed mb-4" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                    {language === 'cs' ? 'Mnoho kupujících řeší jen samotnou koupí, ale ne:' :
                     language === 'it' ? 'Molti acquirenti si occupano solo dell\'acquisto stesso, ma non di:' :
                     'Many buyers only deal with the purchase itself, but not:'}
                  </p>
                  <ul className="space-y-2 ml-6">
                    <li className="text-gray-700">• {language === 'cs' ? 'Budoucí náklady na údržbu' : language === 'it' ? 'Costi futuri di manutenzione' : 'Future maintenance costs'}</li>
                    <li className="text-gray-700">• {language === 'cs' ? 'Možnosti pronájmu' : language === 'it' ? 'Possibilità di affitto' : 'Rental possibilities'}</li>
                    <li className="text-gray-700">• {language === 'cs' ? 'Dlouhodobé daňové povinnosti' : language === 'it' ? 'Obblighi fiscali a lungo termine' : 'Long-term tax obligations'}</li>
                  </ul>
                  <p className="text-gray-500 leading-relaxed mt-4" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                    {language === 'cs' ? 'Bez realistického plánu se i dobrá koupě může časem stát zátěží.' :
                     language === 'it' ? 'Senza un piano realistico, anche un buon acquisto può diventare un peso nel tempo.' :
                     'Without a realistic plan, even a good purchase can become a burden over time.'}
                  </p>
                </CardContent>
              </Card>

              {/* Mistake 5 */}
              <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center mb-8">
                    <XCircle className="h-6 w-6 mr-3 text-blue-600" />
                    {language === 'cs' ? '5. Komunikace bez místní znalosti' :
                     language === 'it' ? '5. Comunicazione senza conoscenza locale' :
                     '5. Communication Without Local Knowledge'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 leading-relaxed mb-4" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                    {language === 'cs' ? 'Jazyková bariéra a neznalost místního prostředí často vedou k nedorozuměním, špatným rozhodnutím a zbytečnému stresu.' :
                     language === 'it' ? 'La barriera linguistica e la mancanza di conoscenza dell\'ambiente locale spesso portano a incomprensioni, decisioni sbagliate e stress inutile.' :
                     'Language barrier and lack of local environmental knowledge often lead to misunderstandings, bad decisions, and unnecessary stress.'}
                  </p>
                  <p className="text-gray-500 leading-relaxed" style={{color:'#4a4a4a', lineHeight:'1.75'}}>
                    {language === 'cs' ? 'V Itálii hraje osobní přístup a kontext mnohem větší roli, než se na první pohled zdá.' :
                     language === 'it' ? 'In Italia l\'approccio personale e il contesto giocano un ruolo molto più importante di quanto sembri a prima vista.' :
                     'In Italy, personal approach and context play a much bigger role than it seems at first glance.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <p className="text-blue-900 font-semibold text-lg leading-relaxed mb-4">
                    {language === 'cs' ? 'Chcete vědět víc o nejčastějších chybách?' :
                     language === 'it' ? 'Vuoi saperne di più sugli errori comuni?' :
                     'Want to learn more about common mistakes?'}
                  </p>
                  <Button
                    onClick={handleFreePdfDownload}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 border border-blue-400/40 shadow-sm"
                  >
                    {language === 'cs' ? 'Stáhnout PDF' :
                     language === 'it' ? 'Scarica il PDF' :
                     'Download PDF'}
                  </Button>
                </CardContent>
              </Card>

              <p className="text-slate-800 leading-relaxed text-lg font-semibold whitespace-pre-line">
                {language === 'cs' ? 'Číst a informovat se je první krok.\nMnoho chyb ale nevzniká z nepozornosti,\nnýbrž z toho, že musíte sami řídit systém, který neznáte.' :
                 language === 'it' ? 'Leggere e informarsi è il primo passo.\nMa molti errori non nascono dalla disattenzione,\nbensì dal dover gestire da soli un sistema che non si conosce.' :
                 'Reading and informing yourself is the first step.\nBut many mistakes are not caused by carelessness,\nrather by having to manage alone a system you do not know.'}
              </p>

              {/* How to Avoid */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center mb-8 text-green-900">
                    <CheckCircle className="h-6 w-6 mr-3" />
                    {language === 'cs' ? 'Jak těmto chybám opravdu předejít?' :
                     language === 'it' ? 'Come evitare davvero questi errori?' :
                     'How to Really Avoid These Mistakes?'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-green-900 font-semibold">{language === 'cs' ? 'Příprava' : language === 'it' ? 'Preparazione' : 'Preparation'}</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-green-900 font-semibold">{language === 'cs' ? 'Realistický rozpočet' : language === 'it' ? 'Budget realistico' : 'Realistic budget'}</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-green-900 font-semibold">{language === 'cs' ? 'Doprovod během celého procesu' : language === 'it' ? 'Accompagnamento durante tutto il processo' : 'Guidance throughout the entire process'}</span>
                    </li>
                  </ul>
                  <p className="text-green-900 mt-6 leading-relaxed whitespace-pre-line">
                    {language === 'cs' ? 'Proto naše služba nevznikla proto, aby jen „vysvětlovala, jak na to“, ale aby vás vedla krok za krokem a předcházela chybám dřív, než se stanou skutečným problémem.' :
                     language === 'it' ? 'Per questo il nostro servizio non nasce per “spiegare come fare”,\nma per accompagnarvi passo dopo passo,\nevitando errori prima che diventino un problema reale.' :
                     'That is why our service is not designed to simply “explain what to do”,\nbut to guide you step by step,\npreventing mistakes before they become a real problem.'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <InformationalDisclaimer language={language} className="mt-14" />

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/process">
                <Button variant="outline" size="lg" className="w-full">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  {language === 'cs' ? 'Zpět na průvodce' :
                   language === 'it' ? 'Torna alla guida' :
                   'Back to Guide'}
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white">
                  {language === 'cs' ? 'Kontaktujte nás' :
                   language === 'it' ? 'Contattateci' :
                   'Contact Us'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer language={language} />

      <FreePdfUpsellModal
        open={isFreePdfUpsellOpen}
        onOpenChange={setIsFreePdfUpsellOpen}
        language={language}
        copy={upsellCopy}
        user={user}
        premiumProductKey="premium-domy"
        sourcePath="/guides/mistakes"
      />
    </div>
  )
}
