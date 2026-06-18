'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Building2, CheckCircle, ClipboardCheck, FileSearch, Scale, ShieldAlert } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PropertySlider from '@/components/PropertySlider'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'
import { Button } from '@/components/ui/button'

const CONTENT = {
  cs: {
    back: 'Zpět na články',
    category: 'Právo a technické kontroly',
    title: 'Stavební a urbanistické nesrovnalosti v Itálii: co ověřit před koupí domu',
    intro: [
      'Při koupi nemovitosti v Itálii nestačí vědět, že dům existuje, že je zapsaný v katastru a že prodávající je vlastníkem. Je nutné ověřit také to, zda stavba a její současný stav odpovídají povolením, plánům a pravidlům obce.',
      'Právě stavební a urbanistické nesrovnalosti patří mezi nejcitlivější rizika. Někdy jde o velký problém, například přístavbu bez povolení. Jindy o detail, který na první pohled vypadá nevinně, ale při přípravě aktu může způsobit zdržení, náklady nebo nutnost regularizace.',
      'Základní pravidlo je jednoduché: nekupovat nemovitost s nevyřešenými nesrovnalostmi a nikdy neodkládat jejich řešení až po podpisu.'
    ],
    imageAlt: 'Dům v Itálii s půdorysem a upozorněním na nepovolené stavební úpravy',
    imageCaption:
      'U nemovitosti nejde jen o to, co je vidět při prohlídce. Rozhodující je shoda mezi skutečným stavem, projekty, katastrem a urbanistickými povoleními.',
    overviewTitle: 'Proč je to zásadní',
    overview:
      'Pokud dokumentace neodpovídá realitě, může být ohrožen podpis rogita, financování, budoucí prodej, rekonstrukce i možnost legálně nemovitost užívat tak, jak kupující očekává.',
    whatTitle: 'Co znamená stavební nesrovnalost v Itálii',
    whatText:
      'Stavební nebo urbanistická nesrovnalost vzniká tehdy, když je stavba, změna nebo způsob užívání proveden bez správného oprávnění, v rozporu s vydaným povolením nebo bez potřebného navazujícího zápisu. Posuzuje se vždy konkrétní stav nemovitosti, dokumentace obce, katastrální podklady a případné zvláštní limity území.',
    typesTitle: 'Nejčastější typy problémů',
    types: [
      {
        title: 'Stavba nebo přístavba bez povolení',
        text: 'Typicky jde o novou část domu, verandu, garáž, terasu, uzavřený balkon nebo samostatnou stavbu na pozemku, která nemá odpovídající titul.'
      },
      {
        title: 'Rozdíl mezi schváleným projektem a skutečným stavem',
        text: 'Místnosti mají jiné rozměry, jinou dispozici, jiné otvory, jinou výšku nebo jiný objem, než vyplývá z uložené dokumentace.'
      },
      {
        title: 'Katastrální nesoulad',
        text: 'Planimetrie v katastru neodpovídá realitě. Samotná katastrální shoda ale nestačí: kataster není totéž co urbanistická regularita.'
      },
      {
        title: 'Změna užívání bez správného postupu',
        text: 'Například sklep, sklad, garáž nebo technická místnost se používá jako obytný prostor, aniž by byly splněny urbanistické, hygienické a technické podmínky.'
      },
      {
        title: 'Práce provedené jen částečně nebo jinak',
        text: 'Povolení existuje, ale práce byly dokončeny odlišně, bez varianty, bez závěrečných podkladů nebo bez návazných aktualizací.'
      },
      {
        title: 'Nemovitost v chráněném nebo omezeném území',
        text: 'U moře, v historických centrech, v zemědělských zónách, v seismických oblastech nebo v krajinářsky chráněných územích mohou být pravidla výrazně přísnější.'
      }
    ],
    attentionTitle: 'Na co si dát pozor už při prvním zájmu',
    attentionIntro:
      'Riziko se často nepozná z fotografií. Před vážnou nabídkou je potřeba zpomalit, pokud se objeví některý z těchto signálů:',
    attention: [
      'část domu vypadá novější než zbytek stavby, ale chybí jasné vysvětlení',
      'prodávající nebo agent říká, že se „to vyřeší po koupi“',
      'plánek v inzerátu neodpovídá skutečné dispozici',
      'obytné pokoje jsou vedené jako sklep, sklad, garáž nebo podkroví',
      'u nemovitosti chybí starší projekty, povolení nebo dokumentace k pracím',
      'cena je nízká právě proto, že dokumentace není v pořádku'
    ],
    beforeDeedTitle: 'Proč se to musí vyřešit před rogitem',
    beforeDeedText:
      'V Itálii je zásadní, aby byl právní, katastrální a urbanisticko-stavební stav vyjasněn před finálním aktem. Pokud se problém odloží, kupující může převzít náklad, odpovědnost i praktické omezení, které původně vzniklo dávno před jeho koupí.',
    beforeDeedPoints: [
      'notářská fáze se může zpozdit nebo zablokovat',
      'banka může odmítnout nebo zpomalit financování',
      'budoucí rekonstrukce může být složitější nebo nemožná',
      'při dalším prodeji se stejný problém vrátí',
      'regularizace může stát více, než kupující čekal',
      'některé zásahy nemusí být dodatečně legalizovatelné'
    ],
    neverTitle: 'Nikdy nekupovat s otevřeným problémem',
    neverText:
      'Nejnebezpečnější věta je: „To se vyřeší potom.“ Pokud je zjištěna nesrovnalost, musí být před podpisem jasné, zda je vůbec řešitelná, kdo ji vyřeší, do kdy, za jakou cenu a s jakým písemným výsledkem. Bez toho kupující nepřebírá jen dům, ale i nejistotu.',
    documentsTitle: 'Co si vyžádat a ověřit',
    documents: [
      'stavební tituly a původní povolení dostupná na obci',
      'případné varianty, sanatorie nebo předchozí condono',
      'aktuální katastrální plán a historické změny',
      'technickou zprávu odborníka, který porovná dokumenty se skutečností',
      'potvrzení, že stav odpovídá před podpisem a nejen „přibližně“',
      'jasné podmínky v návrhu nebo compromessu, pokud se ještě něco řeší'
    ],
    linksTitle: 'Související čtení',
    links: [
      { href: '/guides/mistakes', label: 'Nejčastější chyby při koupi v Itálii', text: 'Proč se nespoléhat na domněnky a ústní ujištění.' },
      { href: '/guides/inspections', label: 'Jak probíhají prohlídky nemovitostí', text: 'Co sledovat na místě ještě před zapojením notáře.' },
      { href: '/guides/notary', label: 'Role notáře v Itálii', text: 'Co notář kontroluje a co zůstává mimo jeho praktický rozsah.' },
      { href: '/guides/offerta-compromesso-registrazione', label: 'Nabídka, compromesso a registrace', text: 'Jak nastavit podmínky ještě před závazkem.' }
    ],
    checklistTitle: 'Praktický checklist před podpisem',
    checklist: [
      'Je jasné, jaký je poslední legitimní stav nemovitosti?',
      'Souhlasí skutečný stav s dokumentací obce?',
      'Souhlasí katastrální plán se skutečností?',
      'Byly všechny přístavby, terasy, garáže a změny užívání vysvětleny dokumenty?',
      'Existuje písemný závěr technika, ne jen ústní ujištění?',
      'Je případná regularizace dokončená před rogitem?'
    ],
    finalTitle: 'Rozhodující pravidlo',
    finalText:
      'Dobrá koupě není jen krásný dům za dobrou cenu. Dobrá koupě je nemovitost, u které před podpisem víte, co kupujete, jaký je její skutečný stav a že otevřené problémy nezůstanou na vás.',
    primaryCta: 'Prohlédnout celý proces',
    secondaryCta: 'Kontaktovat nás'
  },
  it: {
    back: 'Torna agli articoli',
    category: 'Controlli tecnici e legali',
    title: 'Abusività edilizie in Italia: cosa verificare prima di comprare casa',
    intro: [
      'Quando si compra una casa in Italia non basta sapere che l’immobile esiste, che è accatastato e che il venditore ne è proprietario. Bisogna verificare anche se ciò che esiste oggi corrisponde ai titoli edilizi, ai progetti depositati e alle regole urbanistiche del Comune.',
      'Le abusività edilizie sono uno dei rischi più delicati dell’acquisto immobiliare. A volte il problema è evidente, come una veranda o un ampliamento non autorizzato. Altre volte sembra un dettaglio, ma può bloccare l’atto, generare costi o rendere necessaria una regolarizzazione.',
      'La regola da tenere a mente è semplice: non acquistare mai un immobile con abusività aperte e non rimandare la soluzione a dopo il rogito.'
    ],
    imageAlt: 'Casa in Italia con planimetria e avviso sulle modifiche edilizie non autorizzate',
    imageCaption:
      'In un acquisto immobiliare non conta solo ciò che si vede durante la visita. Conta la coerenza tra stato reale, progetti, catasto e titoli urbanistici.',
    overviewTitle: 'Perché è un tema decisivo',
    overview:
      'Se la documentazione non corrisponde alla realtà, possono essere a rischio il rogito, il mutuo, una futura vendita, una ristrutturazione e persino l’uso dell’immobile come il compratore lo immagina.',
    whatTitle: 'Cosa significa abusività edilizia',
    whatText:
      'Si parla di abusività edilizia quando un’opera, una modifica o un uso dell’immobile è stato realizzato senza il titolo corretto, in difformità dal titolo rilasciato o senza i successivi aggiornamenti necessari. La valutazione va fatta caso per caso, confrontando lo stato reale con i documenti comunali, catastali e con eventuali vincoli dell’area.',
    typesTitle: 'I tipi più frequenti di abuso',
    types: [
      {
        title: 'Costruzione o ampliamento senza titolo',
        text: 'Può riguardare una nuova parte della casa, una veranda, un garage, una terrazza chiusa, un portico o un manufatto nel terreno.'
      },
      {
        title: 'Difformità tra progetto approvato e stato reale',
        text: 'Le stanze, le aperture, le altezze, i volumi o la distribuzione interna non corrispondono a ciò che risulta nei progetti depositati.'
      },
      {
        title: 'Difformità catastale',
        text: 'La planimetria catastale non rappresenta lo stato reale. Attenzione però: la conformità catastale da sola non equivale alla regolarità urbanistica.'
      },
      {
        title: 'Cambio di destinazione d’uso non corretto',
        text: 'Un deposito, una cantina, un garage o un sottotetto viene usato come spazio abitativo senza che siano stati rispettati i passaggi urbanistici, igienici e tecnici necessari.'
      },
      {
        title: 'Lavori fatti in modo diverso da quanto autorizzato',
        text: 'Il titolo esiste, ma l’opera è stata eseguita con variazioni, senza variante, senza fine lavori o senza aggiornamenti coerenti.'
      },
      {
        title: 'Immobili in zone vincolate o sensibili',
        text: 'Vicino al mare, nei centri storici, in zona agricola, in area sismica o paesaggistica possono servire verifiche aggiuntive e autorizzazioni specifiche.'
      }
    ],
    attentionTitle: 'A cosa stare attenti fin dall’inizio',
    attentionIntro:
      'Il rischio non si vede sempre dalle foto. Prima di fare una proposta seria bisogna rallentare se emergono segnali come questi:',
    attention: [
      'una parte della casa appare più recente del resto, ma nessuno mostra i documenti',
      'l’agente o il venditore dice che “si sistema dopo”',
      'la planimetria dell’annuncio non coincide con la distribuzione reale',
      'locali usati come camere risultano cantine, depositi, garage o sottotetti',
      'mancano vecchi progetti, permessi o documenti sui lavori effettuati',
      'il prezzo è molto interessante proprio perché la situazione documentale è incerta'
    ],
    beforeDeedTitle: 'Perché va risolto tutto prima dell’atto',
    beforeDeedText:
      'Prima del rogito devono essere chiari lo stato giuridico, catastale e urbanistico-edilizio dell’immobile. Se il problema viene rimandato, l’acquirente può ereditare costi, limiti e responsabilità nati prima del suo acquisto.',
    beforeDeedPoints: [
      'l’atto notarile può essere rinviato o bloccato',
      'la banca può rallentare o negare il mutuo',
      'una futura ristrutturazione può diventare difficile',
      'il problema tornerà al momento di rivendere',
      'la regolarizzazione può costare più del previsto',
      'alcuni abusi non sono sanabili'
    ],
    neverTitle: 'Non comprare mai con un problema aperto',
    neverText:
      'La frase più pericolosa è: “Poi lo sistemiamo.” Se emerge un abuso o una difformità, prima di firmare deve essere chiaro se è sanabile, chi se ne occupa, entro quando, con quali costi e con quale risultato scritto. Senza questa chiarezza, non si compra solo una casa: si compra anche un rischio.',
    documentsTitle: 'Documenti e verifiche da richiedere',
    documents: [
      'titoli edilizi e pratiche depositate presso il Comune',
      'eventuali varianti, sanatorie o precedenti condoni',
      'planimetria catastale aggiornata e storico delle variazioni',
      'relazione tecnica di un professionista che confronti documenti e stato reale',
      'conferma scritta della conformità prima del rogito, non solo rassicurazioni verbali',
      'condizioni chiare nella proposta o nel compromesso, se c’è ancora qualcosa da regolarizzare'
    ],
    linksTitle: 'Approfondimenti collegati',
    links: [
      { href: '/guides/mistakes', label: 'Errori comuni nell’acquisto in Italia', text: 'Perché non bisogna basarsi su supposizioni o promesse verbali.' },
      { href: '/guides/inspections', label: 'Come funzionano le visite immobiliari', text: 'Cosa osservare sul posto prima che la pratica arrivi al notaio.' },
      { href: '/guides/notary', label: 'Il ruolo del notaio in Italia', text: 'Cosa controlla il notaio e cosa resta fuori dal suo ambito pratico.' },
      { href: '/guides/offerta-compromesso-registrazione', label: 'Proposta, compromesso e registrazione', text: 'Come impostare le tutele prima di assumere un impegno.' }
    ],
    checklistTitle: 'Checklist pratica prima di firmare',
    checklist: [
      'È chiaro qual è lo stato legittimo dell’immobile?',
      'Lo stato reale coincide con la documentazione comunale?',
      'La planimetria catastale coincide con la realtà?',
      'Ampliamenti, terrazze, garage, sottotetti e cambi d’uso sono documentati?',
      'Esiste un parere scritto del tecnico, non solo una rassicurazione a voce?',
      'L’eventuale regolarizzazione è completata prima del rogito?'
    ],
    finalTitle: 'La regola decisiva',
    finalText:
      'Un buon acquisto non è solo una bella casa al prezzo giusto. È una casa di cui conosci lo stato reale, i documenti e i rischi prima di firmare, senza lasciare problemi aperti per il futuro.',
    primaryCta: 'Vedi il processo completo',
    secondaryCta: 'Contattaci'
  },
  en: {
    back: 'Back to articles',
    category: 'Technical and legal checks',
    title: 'Building irregularities in Italy: what to verify before buying a house',
    intro: [
      'When buying a house in Italy, it is not enough to know that the property exists, is registered in the cadastre, and belongs to the seller. You also need to verify whether the current physical condition matches the building permits, filed plans, and local planning rules.',
      'Building irregularities are one of the most sensitive risks in an Italian property purchase. Sometimes the issue is obvious, such as an unauthorized extension. In other cases it looks minor, but can delay the deed, create costs, or require formal regularization.',
      'The core rule is simple: never buy a property with unresolved irregularities, and never leave the solution until after the deed.'
    ],
    imageAlt: 'House in Italy with a floor plan and warning about unauthorized building works',
    imageCaption:
      'In a property purchase, the visible condition is only one part of the picture. What matters is consistency between the real state, plans, cadastral records, and planning permissions.',
    overviewTitle: 'Why this matters',
    overview:
      'If the paperwork does not match reality, the final deed, mortgage, future resale, renovation plans, and legal use of the property can all be affected.',
    whatTitle: 'What building irregularity means',
    whatText:
      'A building irregularity exists when works, changes, or use of a property were carried out without the correct authorization, in breach of the authorization, or without the required follow-up updates. Each case must be assessed by comparing the real state with municipal records, cadastral records, and any restrictions affecting the area.',
    typesTitle: 'Most common types of irregularities',
    types: [
      {
        title: 'Construction or extension without authorization',
        text: 'This may involve a new part of the house, veranda, garage, closed terrace, porch, or separate structure on the land.'
      },
      {
        title: 'Mismatch between approved plans and reality',
        text: 'Rooms, openings, heights, volumes, or internal layouts differ from the plans filed with the municipality.'
      },
      {
        title: 'Cadastral mismatch',
        text: 'The cadastral floor plan does not reflect the actual condition. However, cadastral consistency alone is not the same as planning compliance.'
      },
      {
        title: 'Incorrect change of use',
        text: 'A cellar, storage room, garage, or attic is used as living space without the necessary planning, hygiene, and technical requirements.'
      },
      {
        title: 'Works carried out differently from approval',
        text: 'There is a permit, but the works were completed with changes, without a variation, without completion paperwork, or without proper updates.'
      },
      {
        title: 'Properties in protected or sensitive areas',
        text: 'Coastal areas, historic centers, agricultural land, seismic zones, and landscape-protected areas may require additional checks and authorizations.'
      }
    ],
    attentionTitle: 'What to watch from the beginning',
    attentionIntro:
      'The risk is not always visible in photos. Before making a serious offer, slow down if you see signals like these:',
    attention: [
      'part of the house looks newer than the rest, but no documents are shown',
      'the agent or seller says it can be fixed after purchase',
      'the listing plan does not match the real layout',
      'rooms used as bedrooms are registered as cellars, storage rooms, garages, or attics',
      'old projects, permits, or documents for past works are missing',
      'the price is attractive precisely because the paperwork is uncertain'
    ],
    beforeDeedTitle: 'Why everything must be solved before the deed',
    beforeDeedText:
      'Before the final deed, the legal, cadastral, and building-planning status of the property must be clear. If the issue is postponed, the buyer may inherit costs, limits, and responsibilities created before the purchase.',
    beforeDeedPoints: [
      'the notarial deed may be delayed or blocked',
      'the bank may slow down or refuse mortgage financing',
      'future renovation may become difficult',
      'the issue will return during a future resale',
      'regularization may cost more than expected',
      'some irregularities cannot be legalized later'
    ],
    neverTitle: 'Never buy with an open issue',
    neverText:
      'The most dangerous sentence is: “We will fix it later.” If an irregularity emerges, before signing it must be clear whether it can be legalized, who will handle it, by when, at what cost, and with what written result. Without that clarity, you are not just buying a house: you are buying risk.',
    documentsTitle: 'Documents and checks to request',
    documents: [
      'building permits and records filed with the municipality',
      'any variations, regularization files, or previous amnesty documents',
      'updated cadastral floor plan and history of changes',
      'technical report comparing documents with the real condition',
      'written confirmation of compliance before the deed, not just verbal reassurance',
      'clear clauses in the offer or preliminary contract if anything is still being regularized'
    ],
    linksTitle: 'Related reading',
    links: [
      { href: '/guides/mistakes', label: 'Common mistakes when buying in Italy', text: 'Why assumptions and verbal promises are not enough.' },
      { href: '/guides/inspections', label: 'How property viewings work', text: 'What to check on site before the file reaches the notary.' },
      { href: '/guides/notary', label: 'The role of the notary in Italy', text: 'What the notary checks and what remains outside that practical scope.' },
      { href: '/guides/offerta-compromesso-registrazione', label: 'Offer, preliminary contract, and registration', text: 'How to set protections before taking on a commitment.' }
    ],
    checklistTitle: 'Practical checklist before signing',
    checklist: [
      'Is the legitimate status of the property clear?',
      'Does the real condition match the municipal documentation?',
      'Does the cadastral floor plan match reality?',
      'Are extensions, terraces, garages, attics, and changes of use documented?',
      'Is there a written technical opinion, not just verbal reassurance?',
      'Is any required regularization completed before the deed?'
    ],
    finalTitle: 'The decisive rule',
    finalText:
      'A good purchase is not only a beautiful house at the right price. It is a house whose real condition, documents, and risks are clear before you sign, with no unresolved issues left for the future.',
    primaryCta: 'See the full process',
    secondaryCta: 'Contact us'
  }
}

function formatDate(language) {
  const date = new Date('2026-06-18')
  const locale = language === 'cs' ? 'cs-CZ' : language === 'it' ? 'it-IT' : 'en-US'
  return date.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })
}

function ContentBox({ title, icon: Icon, children, tone = 'default' }) {
  const toneClass =
    tone === 'warning'
      ? 'border-amber-200 bg-amber-50'
      : tone === 'danger'
        ? 'border-red-200 bg-red-50'
        : tone === 'dark'
          ? 'border-slate-800 bg-slate-900 text-white'
          : 'border-slate-200 bg-white/95'

  const headingClass = tone === 'dark' ? 'text-white' : tone === 'danger' ? 'text-red-950' : 'text-slate-900'

  return (
    <section className={`rounded-2xl border p-6 md:p-8 ${toneClass}`}>
      {title ? (
        <h2 className={`mb-4 flex items-center gap-3 text-2xl font-semibold ${headingClass}`}>
          {Icon ? <Icon className="h-6 w-6 flex-shrink-0" /> : null}
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  )
}

export default function BuildingIrregularitiesGuidePage() {
  const [language, setLanguage] = useState('it')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage && CONTENT[savedLanguage]) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    } else {
      document.documentElement.lang = 'it'
    }

    const handleLanguageChange = (event) => {
      const nextLanguage = event?.detail
      if (nextLanguage && CONTENT[nextLanguage]) {
        setLanguage(nextLanguage)
        document.documentElement.lang = nextLanguage
      }
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const t = CONTENT[language] || CONTENT.it

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <main className="pt-28 pb-16 md:pb-24">
        <div className="container mx-auto px-6" style={{ maxWidth: '1200px' }}>
          <figure className="mx-auto mb-8 max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img
              src="/articles/abusi-edilizi-italia-header.jpeg"
              alt={t.imageAlt}
              className="h-auto w-full"
              loading="eager"
            />
            <figcaption className="px-4 py-3 text-sm text-slate-600">{t.imageCaption}</figcaption>
          </figure>

          <article className="mx-auto max-w-4xl space-y-6" style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
            <Button asChild variant="outline" className="inline-flex items-center border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-700">
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.back}
              </Link>
            </Button>

            <header className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
              <span className="mb-4 inline-block rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                {t.category}
              </span>
              <h1 className="mb-8 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text font-bold leading-tight text-transparent">
                {t.title}
              </h1>
              <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span>{formatDate(language)}</span>
                <span>8 min</span>
              </div>
              <div className="space-y-3 leading-relaxed text-slate-700">
                {t.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </header>

            <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img
                src="/articles/abusi-edilizi-italia-header.jpeg"
                alt={t.imageAlt}
                className="h-auto w-full"
                loading="eager"
              />
              <figcaption className="px-4 py-3 text-sm text-slate-600">{t.imageCaption}</figcaption>
            </figure>

            <ContentBox title={t.overviewTitle} icon={AlertTriangle} tone="warning">
              <p className="text-lg font-semibold leading-relaxed text-amber-950">{t.overview}</p>
            </ContentBox>

            <ContentBox title={t.whatTitle} icon={Building2}>
              <p className="leading-relaxed text-slate-700">{t.whatText}</p>
            </ContentBox>

            <ContentBox title={t.typesTitle} icon={ShieldAlert}>
              <div className="space-y-4">
                {t.types.map((item) => (
                  <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="mb-2 font-semibold text-slate-900">{item.title}</h3>
                    <p className="leading-relaxed text-slate-700">{item.text}</p>
                  </div>
                ))}
              </div>
            </ContentBox>

            <ContentBox title={t.attentionTitle} icon={FileSearch}>
              <p className="mb-4 leading-relaxed text-slate-700">{t.attentionIntro}</p>
              <ul className="space-y-3">
                {t.attention.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-700">
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </ContentBox>

            <ContentBox title={t.beforeDeedTitle} icon={Scale} tone="dark">
              <p className="mb-5 leading-relaxed text-slate-200">{t.beforeDeedText}</p>
              <ul className="space-y-2 text-slate-100">
                {t.beforeDeedPoints.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </ContentBox>

            <ContentBox title={t.neverTitle} icon={AlertTriangle} tone="danger">
              <p className="text-lg font-semibold leading-relaxed text-red-950">{t.neverText}</p>
            </ContentBox>

            <ContentBox title={t.documentsTitle} icon={ClipboardCheck}>
              <ul className="space-y-3">
                {t.documents.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-700">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </ContentBox>

            <ContentBox title={t.linksTitle}>
              <div className="grid gap-4">
                {t.links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-white"
                  >
                    <h3 className="mb-1 font-semibold text-slate-900">{item.label}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{item.text}</p>
                  </Link>
                ))}
              </div>
            </ContentBox>

            <ContentBox title={t.checklistTitle} icon={ClipboardCheck}>
              <ul className="space-y-3">
                {t.checklist.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-700">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </ContentBox>

            <ContentBox title={t.finalTitle} tone="warning">
              <p className="mb-5 text-lg font-semibold leading-relaxed text-amber-950">{t.finalText}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="bg-slate-800 text-white hover:bg-slate-700">
                  <Link href="/process">{t.primaryCta}</Link>
                </Button>
                <Button asChild variant="outline" className="border-slate-300 bg-white text-slate-800 hover:bg-slate-50">
                  <Link href="/contact">{t.secondaryCta}</Link>
                </Button>
              </div>
            </ContentBox>

            <InformationalDisclaimer language={language} className="mt-14" />
          </article>
        </div>
      </main>

      <PropertySlider language={language} />
      <Footer language={language} />
    </div>
  )
}
