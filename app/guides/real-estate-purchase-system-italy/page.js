'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PropertySlider from '@/components/PropertySlider'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import InformationalDisclaimer from '@/components/legal/InformationalDisclaimer'

const CONTENT = {
  "en": {
    "back": "Back to articles",
    "category": "Blog",
    "date": "2026-02-11",
    "readTime": "10 min",
    "title": "How the Italian Property Buying System Really Works (and Why It's Different from the Czech Republic)",
    "intro": [
      "Buying property in Italy can be smooth, but only if you understand how the system is built.",
      "For Czech buyers, the biggest surprise is not paperwork itself. The key issue is that responsibilities are split across multiple people and offices, and nobody automatically coordinates everything for you."
    ],
    "keyIdea": "Key idea: In Italy, the process is safe when managed step by step. If treated as a single transaction, you risk delays, hidden costs, and legal or technical surprises.",
    "complexityTitle": "Why Italy feels more complex than the Czech process",
    "complexity": [
      "Fragmented responsibilities: each professional covers only a specific slice (agency, technician, municipality, bank, translator).",
      "Checks must happen before commitment: once early documents are signed or deposits are paid without conditions, leverage drops quickly.",
      "Municipality-level rules matter: local permits, restrictions, and compliance can change what you can do with the property.",
      "Timing is not linear: documents, approvals, and scheduling do not always move at the same speed."
    ],
    "complexityNote": "What foreign buyers often miss: the Italian system is not hard, it is procedural. You win by coordinating people, documents, and timing.",
    "complexityCta": "Read the Common Mistakes article",
    "complexityCtaHref": "/guides/mistakes",
    "rolesTitle": "Who does what (and what they do not do)",
    "rolesIntro": "Think of the process as a chain. Each link must be checked by the right person at the right time.",
    "roles": [
      "Real estate agency: facilitates negotiation and paperwork flow, but does not guarantee technical compliance.",
      "Seller / owner: provides documents and access, but may not know permit or cadastral issues.",
      "Technical surveyor / engineer: verifies technical and urban compliance and consistency between reality and documents.",
      "Municipality offices: source for permits, restrictions, and compliance history.",
      "Bank / mortgage broker (if financing): handles timelines, valuations, and approval conditions.",
      "Interpreter / translator: essential for clarity in negotiations and legal documents.",
      "Notary (final deed): formalizes and registers the final act; key legal step, but not a full risk shield."
    ],
    "rolesNote": "Reality check: no single person is responsible for your full outcome by default. Coordinated assistance changes everything.",
    "rolesNotaryCta": "See the Notary article",
    "rolesNotaryCtaHref": "/guides/notary",
    "serviceTitle": "What we do differently (and why it protects your purchase)",
    "serviceText": "Our service is not just translation and not just finding listings. We coordinate the entire process to reduce blind spots for foreign buyers.",
    "service": [
      "We structure the path: what to do first, what to request, what to verify, and when.",
      "We reduce risk: checks are pushed earlier, before any binding commitment.",
      "We coordinate communication: between seller, agency, technicians, offices, and buyer.",
      "We protect your time: fewer dead ends and clearer decision points."
    ],
    "serviceCta": "Before you sign anything, let us run a risk review on your case and identify missing protections.",
    "servicePrimaryCta": "See Our Process",
    "servicePrimaryCtaHref": "/process",
    "serviceSecondaryCta": "Free Consultation",
    "serviceSecondaryCtaHref": "/contact",
    "risksTitle": "What can go wrong if you manage it alone",
    "risks": [
      "Too-early commitments: signing documents or paying deposits before all checks are complete.",
      "Documentation mismatch: the real condition of the property does not match cadastral records or building permits.",
      "Hidden obligations: easements, access rights, condominium rules, or protected elements.",
      "Problems from public offices: missing permits, use restrictions, or inability to carry out planned changes.",
      "Cost underestimation: assuming the listing price is the final total cost.",
      "Communication errors: small misunderstandings that can grow into legal or financial problems."
    ],
    "risksNote": "Warning: most problems do not appear in the first conversation. They appear later, when reversing decisions is expensive.",
    "risksCta": "Go to FAQ",
    "risksCtaHref": "/faq",
    "costsTitle": "Costs: main categories (not detailed numbers)",
    "costsIntro": "Every transaction is different, but these cost buckets should always be planned.",
    "costs": [
      "Taxes linked to the purchase (depending on property type and buyer profile)",
      "Notary costs (fee and registration charges)",
      "Real estate agency commission (depending on payment structure and terms)",
      "Technical due diligence (inspection, compliance, documentation)",
      "Administrative expenses (documents, certificates, registrations)",
      "Translation and interpretation services",
      "Post-purchase setup (utilities, insurance, condominium onboarding)"
    ],
    "costsCta": "Go to the full Costs article",
    "costsCtaHref": "/guides/costs",
    "quickTitle": "Quick self-check (60 seconds)",
    "quickIntro": "If your answer is \"no\" to any point, do not commit yet.",
    "quick": [
      "Do you have a clear budget that includes extra costs, not only listing price?",
      "Do you know which documents must be reviewed before paying a deposit?",
      "Do you know who verifies technical and urban compliance, and wheně",
      "Do you have a realistic timeline plan, especially if financing is involved?",
      "Do you have clear communication in Italian, or professional translation support?"
    ],
    "next": "Next step: send us your target region and budget, and we will tell you exactly what to verify first.",
    "quickCta": "Complete the form",
    "quickCtaHref": "/dashboard/intake-form"
  },
  "cs": {
    "back": "Zpět na články",
    "category": "Blog",
    "date": "2026-02-11",
    "readTime": "10 min",
    "title": "Jak skutečně funguje italský systém koupě nemovitostí (a proč se liší od české republiky)",
    "intro": [
      "Nákup nemovitostí v Itálii může být hladký, ale pouze pokud rozumíte tomu, jak je systém postaven.",
      "Pro české kupující není největším překvapením samotné papírování. Klíčovým problémem je, že povinnosti jsou rozděleny mezi více lidí a kanceláří a nikdo automaticky nekoordinuje vše za vás."
    ],
    "keyIdea": "Klíčová myšlenka: V Itálii je proces bezpečný, když je řízen krok za krokem. Pokud se jedná o jedinou transakci, riskujete zpoždění, skryté náklady a právní nebo technická překvapení.",
    "complexityTitle": "Proč se Itálie cítí složitější než český proces",
    "complexity": [
      "Roztříštěné odpovědnosti: každý odborník pokrývá pouze určitou část (agentura, technik, magistrát, banka, překladatel).",
      "Kontroly musí proběhnout před závazkem: jakmile jsou podepsány včasné dokumenty nebo jsou zaplaceny vklady bez podmínek, pákový efekt rychle klesá.",
      "Pravidla na úrovni obce jsou důležitá: místní povolení, omezení a dodržování předpisů mohou změnit, co můžete s nemovitostí dělat.",
      "Načasování není lineární: dokumenty, schvalování a plánování se ne vždy pohybují stejnou rychlostí."
    ],
    "complexityNote": "Co zahraničním kupcům často chybí: italský systém není tvrdý, je procedurální. Vyhrajete tím, že budete koordinovat lidi, dokumenty a načasování.",
    "complexityCta": "Přečtěte si článek Časté chyby",
    "complexityCtaHref": "/guides/mistakes",
    "rolesTitle": "Kdo co dělá (a co nedělá)",
    "rolesIntro": "Představte si proces jako řetězec. Každý odkaz musí být zkontrolován správnou osobou ve správný čas.",
    "roles": [
      "Realitní kancelář: usnadňuje vyjednávání a tok papírování, ale nezaručuje technickou shodu.",
      "Prodávající / vlastník: poskytuje dokumenty a přístup, ale nemusí znát povolení nebo katastrální záležitosti.",
      "Technický inspektor / inženýr: ověřuje technickou a urbanistickou shodu a soulad mezi realitou a dokumenty.",
      "Obecní úřady: zdroj povolení, omezení a historie dodržování předpisů.",
      "Banka / hypoteční makléř (pokud financuje): zpracovává časové plány, ocenění a podmínky schválení.",
      "Tlumočník / překladatel: nezbytný pro srozumitelnost jednání a právních dokumentů.",
      "Notář (konečná listina): formalizuje a registruje konečný akt; klíčový právní krok, ale ne úplný štít proti rizikům."
    ],
    "rolesNote": "Kontrola reality: ve výchozím nastavení není za váš úplný výsledek odpovědná žádná jediná osoba. Koordinovaná pomoc vše mění.",
    "rolesNotaryCta": "Viz článek Notář",
    "rolesNotaryCtaHref": "/guides/notary",
    "serviceTitle": "Co děláme jinak (a proč to chrání váš nákup)",
    "serviceText": "Naše služba není jen překlad a nejen vyhledávání nabídek. Koordinujeme celý proces, abychom snížili slepá místa pro zahraniční kupce.",
    "service": [
      "Strukturujeme cestu: co udělat jako první, co požadovat, co ověřit a kdy.",
      "Snižujeme riziko: kontroly jsou prosazovány dříve, před jakýmkoli závazným závazkem.",
      "Koordinujeme komunikaci: mezi prodejcem, agenturou, techniky, kancelářemi a kupujícím.",
      "Chráníme váš čas: méně slepých uliček a jasnější rozhodovací body."
    ],
    "serviceCta": "Než cokoliv podepíšete, nechte nás provést kontrolu rizik vašeho případu a identifikovat chybějící ochrany.",
    "servicePrimaryCta": "Podívejte se na náš proces",
    "servicePrimaryCtaHref": "/process",
    "serviceSecondaryCta": "Konzultace zdarma",
    "serviceSecondaryCtaHref": "/contact",
    "risksTitle": "Co se může pokazit, když to zvládnete sami",
    "risks": [
      "Příliš brzy: podepisování nebo placení záloh před dokončením šeků.",
      "Nesoulad dokumentů: stav nemovitostí se liší od katastrálních nebo povolení.",
      "Skrytá omezení: věcná břemena, práva cesty, pravidla kondominia, chráněné prvky.",
      "Překvapení magistrátu: chybějící povolení, nečekaná omezení užívání, zablokované rekonstrukce.",
      "Podhodnocení nákladů: za předpokladu, že katalogová cena je konečná cena.",
      "Chyby v komunikaci: malá nedorozumění se stávají právními nebo finančními problémy."
    ],
    "risksNote": "Upozornění: většina problémů se neobjeví v prvním rozhovoru. Objevují se později, když je vracení rozhodnutí drahé.",
    "risksCta": "Přejděte na FAQ",
    "risksCtaHref": "/faq",
    "costsTitle": "Náklady: hlavní kategorie (bez podrobných čísel)",
    "costsIntro": "Každá transakce je jiná, ale tyto nákladové skupiny by měly být vždy naplánovány.",
    "costs": [
      "Nákupní daně (závisí na typu nemovitostí a profilu kupujícího)",
      "Notářské náklady (poplatky a registrační toky)",
      "Provize agentury (v závislosti na platební struktuře a podmínkách)",
      "Technické kontroly (průzkum, ověření shody, dokumentace)",
      "Administrativní poplatky (dokumenty, certifikáty, registrace)",
      "Podpora překladů a tlumočení",
      "Nastavení po nákupu (elektrické služby, pojištění, onboarding kondominium)"
    ],
    "costsCta": "Přejděte na celý článek o nákladech",
    "costsCtaHref": "/guides/costs",
    "quickTitle": "Rychlá samokontrola (60 sekund)",
    "quickIntro": "Pokud je vaše odpověď v jakémkoli bodě „ne“, ještě se nezavazujte.",
    "quick": [
      "Máte jasný rozpočet, který zahrnuje vícenáklady, nejen katalogovou cenu?",
      "Víte, které dokumenty je třeba zkontrolovat před zaplacením zálohy?",
      "Víte, kdo a kdy ověřuje technickou a urbanistickou shodu?",
      "Máte realistický časový plán, zejména pokud jde o financování?",
      "Máte jasnou komunikaci v italštině nebo profesionální překladatelskou podporu?"
    ],
    "next": "Další krok: pošlete nám svůj cílový region a rozpočet a my vám řekneme, co přesně ověřit jako první.",
    "quickCta": "Vyplňte formulář",
    "quickCtaHref": "/dashboard/intake-form"
  },
  "it": {
    "back": "Torna agli articoli",
    "category": "Blog",
    "date": "2026-02-11",
    "readTime": "10 min",
    "title": "Come funziona davvero il sistema di acquisto immobiliare in Italia (e perché è diverso dalla Repubblica Ceca)",
    "intro": [
      "Comprare casa in Italia può essere fluido, ma solo se capisci come è strutturato il sistema.",
      "Per i compratori cechi, la sorpresa principale non è la burocrazia in sé. Il punto critico è che le responsabilità sono divise tra più persone e uffici e nessuno coordina automaticamente tutto al posto tuo."
    ],
    "keyIdea": "Idea chiave: in Italia il processo è sicuro se gestito passo dopo passo. Se lo tratti come una singola transazione, rischi ritardi, costi nascosti e sorprese legali o tecniche.",
    "complexityTitle": "Perché l'Italia sembra più complessa del processo ceco",
    "complexity": [
      "Responsabilità frammentate: ogni professionista copre solo una parte (agenzia, tecnico, comune, banca, traduttore).",
      "I controlli vanno fatti prima dell'impegno: dopo firme iniziali o caparre senza condizioni, il potere negoziale cala rapidamente.",
      "Le regole comunali contano: permessi, vincoli e conformità possono cambiare l'uso possibile dell'immobile.",
      "Le tempistiche non sono lineari: documenti, approvazioni e appuntamenti non avanzano sempre alla stessa velocità."
    ],
    "complexityNote": "Cosa molti compratori esteri sottovalutano: il sistema italiano non è difficile, è procedurale. Vince chi coordina persone, documenti e tempi.",
    "complexityCta": "Vai all'articolo completo sugli errori comuni",
    "complexityCtaHref": "/guides/mistakes",
    "rolesTitle": "Chi fa cosa (e cosa non fa)",
    "rolesIntro": "Pensa al processo come a una catena. Ogni anello va verificato dalla persona giusta nel momento giusto.",
    "roles": [
      "Agenzia immobiliare: facilita trattativa e flusso documentale, ma non garantisce conformità tecnica.",
      "Venditore / proprietario: fornisce documenti e accesso, ma può non conoscere criticità su permessi o catasto.",
      "Tecnico / geometra / ingegnere: verifica conformità tecnica e urbanistica e coerenza tra stato reale e documenti.",
      "Uffici comunali: fonte di permessi, vincoli e storico conformità.",
      "Banca / mediatore creditizio (se c'è mutuo): tempi, perizie e condizioni di approvazione.",
      "Interprete / traduttore: essenziale per chiarezza in trattative e documenti legali.",
      "Notaio (atto finale): formalizza e registra il trasferimento finale; passaggio legale chiave, ma non scudo totale dal rischio."
    ],
    "rolesNote": "Reality check: nessuna singola figura è responsabile del tuo risultato complessivo in automatico. L'assistenza coordinata cambia tutto.",
    "rolesNotaryCta": "Vai all'articolo completo sul notaio",
    "rolesNotaryCtaHref": "/guides/notary",
    "serviceTitle": "Cosa facciamo di diverso (e perché protegge il tuo acquisto)",
    "serviceText": "Il nostro servizio non è solo traduzione e non è solo ricerca annunci. Coordiniamo tutto il processo per ridurre i punti ciechi tipici dei compratori esteri.",
    "service": [
      "Strutturiamo il percorso: cosa fare prima, cosa richiedere, cosa verificare e quando.",
      "Riduciamo il rischio: anticipiamo i controlli prima di qualsiasi impegno vincolante.",
      "Coordiniamo la comunicazione: tra venditore, agenzia, tecnici, uffici e acquirente.",
      "Proteggiamo il tuo tempo: meno vicoli ciechi e decisioni più chiare."
    ],
    "serviceCta": "Prima di firmare qualsiasi cosa, facciamo una risk review del tuo caso e individuiamo le protezioni mancanti.",
    "servicePrimaryCta": "Vedi il nostro processo",
    "servicePrimaryCtaHref": "/process",
    "serviceSecondaryCta": "Consulenza gratuita",
    "serviceSecondaryCtaHref": "/contact",
    "risksTitle": "Cosa può andare storto se gestisci tutto da solo",
    "risks": [
      "Impegni troppo anticipati: firma di documenti o versamento di caparre prima del completamento di tutte le verifiche.",
      "Difformità documentale: lo stato reale dell'immobile non corrisponde al catasto o ai titoli edilizi.",
      "Vincoli nascosti: servitù, accessi, regole condominiali o elementi tutelati.",
      "Problemi dagli uffici: permessi mancanti, limiti di utilizzo o impossibilità di eseguire le modifiche previste.",
      "Sottostima dei costi: pensare che il prezzo in annuncio sia il costo finale.",
      "Errori di comunicazione: piccoli malintesi che possono trasformarsi in problemi legali o finanziari."
    ],
    "risksNote": "Attenzione: la maggior parte dei problemi non emerge nella prima conversazione. Emergono dopo, quando tornare indietro è costoso.",
    "risksCta": "Vai alla FAQ",
    "risksCtaHref": "/faq",
    "costsTitle": "Costi: categorie principali (senza numeri dettagliati)",
    "costsIntro": "Ogni operazione è diversa, ma queste voci vanno sempre pianificate.",
    "costs": [
      "Imposte legate all'acquisto (in base al tipo di immobile e al profilo dell'acquirente)",
      "Costi notarili (onorario e imposte o spese di registrazione)",
      "Provvigione dell agenzia immobiliare (in base alla struttura del pagamento e alle condizioni)",
      "Verifiche tecniche (sopralluogo, conformità, documentazione)",
      "Spese amministrative (documenti, certificati, registrazioni)",
      "Servizi di traduzione e interpretariato",
      "Setup post-acquisto (utenze, assicurazione, onboarding condominiale)"
    ],
    "costsCta": "Vai all'articolo completo sui costi",
    "costsCtaHref": "/guides/costs",
    "quickTitle": "Self-check rapido (60 secondi)",
    "quickIntro": "Se rispondi \"no\" a uno qualsiasi di questi punti, non impegnarti ancora.",
    "quick": [
      "Hai un budget chiaro che include anche i costi extra, non solo il prezzo annuncio?",
      "Sai quali documenti devono essere verificati prima di versare una caparra?",
      "Sai chi verifica conformità tecnica e urbanistica e in quale fase?",
      "Hai un piano temporale realistico, soprattutto se è previsto un finanziamento?",
      "Hai comunicazione chiara in italiano o supporto professionale di traduzione?"
    ],
    "next": "Prossimo passo: inviaci regione target e budget e ti diremo cosa verificare per prima cosa.",
    "quickCta": "Completa il form",
    "quickCtaHref": "/dashboard/intake-form"
  }
}

const CONTENT_OVERRIDES = {
  en: {
    risks: [
      'Too-early commitments: signing documents or paying deposits before all checks are complete.',
      'Documentation mismatch: the real condition of the property does not match cadastral records or building permits.',
      'Hidden obligations: easements, access rights, condominium rules, or protected elements.',
      'Problems from public offices: missing permits, use restrictions, or inability to carry out planned changes.',
      'Cost underestimation: assuming the listing price is the final total cost.',
      'Communication errors: small misunderstandings that can grow into legal or financial problems.'
    ],
    costs: [
      'Taxes linked to the purchase (depending on property type and buyer profile)',
      'Notary costs (fee and registration charges)',
      'Real estate agency commission (depending on payment structure and terms)',
      'Technical due diligence (inspection, compliance, documentation)',
      'Administrative expenses (documents, certificates, registrations)',
      'Translation and interpretation services',
      'Post-purchase setup (utilities, insurance, condominium onboarding)'
    ]
  },
  cs: {
    risks: [
      'Příliš brzké závazky: podpis smlouvy nebo složení zálohy ještě před dokončením všech kontrol.',
      'Nesoulad v dokumentaci: skutečný stav nemovitostí neodpovídá katastru nebo stavebním povolením.',
      'Skryté závazky: věcná břemena, přístupové cesty, pravidla SVJ, chráněné prvky.',
      'Problémy z úřadů: chybějící povolení, omezení užívání, nemožnost provést plánované úpravy.',
      'Podcenění nákladů: představa, že cena v inzerátu je konečná.',
      'Komunikační chyby: drobná nedorozumění, která mohou přerůst v právní nebo finanční problémy.'
    ],
    costs: [
      'Daně spojené s koupí (podle typu nemovitostí a profilu kupujícího)',
      'Notářské náklady (odměna a poplatky za registraci)',
      'Provize realitní kanceláře (dle struktury platby a podmínek)',
      'Technické prověrky (prohlídka, soulad, dokumentace)',
      'Administrativní výdaje (dokumenty, certifikáty, registrace)',
      'Překladatelské a tlumočnické služby',
      'Nastavení po koupí (energie, pojištění, onboarding do SVJ)'
    ]
  },
  it: {
    risks: [
      'Impegni troppo anticipati: firma di documenti o versamento di caparre prima del completamento di tutte le verifiche.',
      "Difformità documentale: lo stato reale dell'immobile non corrisponde al catasto o ai titoli edilizi.",
      'Vincoli nascosti: servitù, accessi, regole condominiali o elementi tutelati.',
      'Problemi dagli uffici: permessi mancanti, limiti di utilizzo o impossibilità di eseguire le modifiche previste.',
      'Sottostima dei costi: pensare che il prezzo in annuncio sia il costo finale.',
      'Errori di comunicazione: piccoli malintesi che possono trasformarsi in problemi legali o finanziari.'
    ],
    costs: [
      'Imposte legate all acquisto (in base al tipo di immobile e al profilo dell acquirente)',
      'Costi notarili (onorario e imposte o spese di registrazione)',
      'Provvigione dell agenzia immobiliare (in base alla struttura del pagamento e alle condizioni)',
      'Verifiche tecniche (sopralluogo, conformità, documentazione)',
      'Spese amministrative (documenti, certificati, registrazioni)',
      'Servizi di traduzione e interpretariato',
      'Setup post-acquisto (utenze, assicurazione, onboarding condominiale)'
    ]
  }
}

const CLEAN_CONTENT = {
  cs: {
    back: 'Zpět na články',
    title: 'Jak skutečně funguje italský systém koupě nemovitostí (a proč se liší od České republiky)',
    intro: [
      'Nákup nemovitostí v Itálii může být hladký, ale pouze pokud rozumíte tomu, jak je celý systém postaven.',
      'Pro české kupující není největším překvapením samotná administrativa. Klíčový problém je v tom, že odpovědnosti jsou rozděleny mezi více lidí a institucí a nikdo za vás automaticky nekoordinuje celý proces.'
    ],
    keyIdea:
      'Klíčová myšlenka: v Itálii je proces bezpečný tehdy, když je řízen krok za krokem. Pokud ho vnímáte jako jednu jednoduchou transakci, riskujete zpoždění, skryté náklady a právní nebo technická překvapení.',
    complexityTitle: 'Proč Itálie působí složitěji než český proces',
    complexityNote:
      'Co zahraniční kupující často podceňují: italský systém není nepřehledný, je procedurální. Výhodu má ten, kdo dobře koordinuje lidi, dokumenty a načasování.',
    complexityCta: 'Přečtěte si článek o častých chybách',
    rolesTitle: 'Kdo co dělá (a co nedělá)',
    rolesIntro: 'Představte si proces jako řetězec. Každý článek musí zkontrolovat správná osoba ve správný čas.',
    rolesNote:
      'Realita: za váš konečný výsledek standardně neodpovídá žádná jediná osoba. Koordinovaná podpora zásadně mění celý výsledek.',
    rolesNotaryCta: 'Přejít na článek o notáři',
    serviceTitle: 'Co děláme jinak (a proč to chrání váš nákup)',
    serviceText:
      'Naše služba není jen překlad a není to ani pouhé hledání inzerátů. Koordinujeme celý proces tak, aby se snížila slepá místa typická pro zahraniční kupující.',
    serviceCta:
      'Než cokoliv podepíšete, nechte nás provést kontrolu rizik vašeho případu a odhalit chybějící ochranu.',
    servicePrimaryCta: 'Podívejte se na náš proces',
    serviceSecondaryCta: 'Konzultace zdarma',
    risksTitle: 'Co se může pokazit, když vše řešíte sami',
    risksNote:
      'Upozornění: většina problémů se neukáže při prvním rozhovoru. Objeví se až později, kdy je návrat drahý.',
    risksCta: 'Přejít na FAQ',
    costsTitle: 'Náklady: hlavní kategorie (bez podrobných čísel)',
    costsIntro:
      'Každá transakce je jiná, ale tyto skupiny nákladů je potřeba vždy předem plánovat.',
    costsCta: 'Přejít na celý článek o nákladech',
    quickTitle: 'Rychlý self-check (60 sekund)',
    quickIntro: 'Pokud na některý bod odpovíte „ne“, ještě se nezavazujte.',
    quick: [
      'Máte jasný rozpočet, který zahrnuje i vedlejší náklady, nejen cenu z inzerátu?',
      'Víte, které dokumenty je nutné zkontrolovat před složením zálohy?',
      'Víte, kdo a kdy ověřuje technický a urbanistický soulad?',
      'Máte realistický časový plán, zejména pokud řešíte financování?',
      'Máte zajištěnou jasnou komunikaci v italštině nebo profesionální překladatelskou podporu?'
    ],
    next:
      'Další krok: pošlete nám cílový region a rozpočet a my vám řekneme, co je potřeba ověřit jako první.',
    quickCta: 'Vyplnit formulář'
  },
  it: {
    title: 'Come funziona davvero il sistema di acquisto immobiliare in Italia (e perché è diverso dalla Repubblica Ceca)',
    intro: [
      "Comprare casa in Italia può essere lineare, ma solo se capisci come è strutturato il sistema.",
      'Per i compratori cechi, la sorpresa principale non è la burocrazia in sé. Il punto critico è che le responsabilità sono divise tra più persone e uffici e nessuno coordina automaticamente tutto al posto tuo.'
    ],
    keyIdea:
      'Idea chiave: in Italia il processo è sicuro se gestito passo dopo passo. Se lo tratti come una singola transazione, rischi ritardi, costi nascosti e sorprese legali o tecniche.',
    complexityTitle: 'Perché l’Italia sembra più complessa del processo ceco',
    complexityNote:
      'Molti compratori esteri sottovalutano questo punto: il sistema italiano non è difficile, è procedurale. Vince chi coordina persone, documenti e tempi.',
    serviceTitle: 'Cosa facciamo di diverso (e perché protegge il tuo acquisto)',
    serviceText:
      'Il nostro servizio non è solo traduzione e non è solo ricerca annunci. Coordiniamo l’intero processo per ridurre i punti ciechi tipici dei compratori esteri.',
    serviceCta:
      'Prima di firmare qualsiasi cosa, facciamo una risk review del tuo caso e individuiamo le protezioni mancanti.',
    risksTitle: 'Cosa può andare storto se gestisci tutto da solo',
    risksNote:
      'Attenzione: la maggior parte dei problemi non emerge nella prima conversazione. Emergono dopo, quando tornare indietro è costoso.',
    costsTitle: 'Costi: categorie principali (senza numeri dettagliati)',
    costsIntro: 'Ogni operazione è diversa, ma queste voci vanno sempre pianificate.',
    quickIntro: 'Se rispondi "no" a uno qualsiasi di questi punti, non impegnarti ancora.'
  }
}

const INTAKE_FORM_PATH = '/dashboard/intake-form'
const INTAKE_SIGNUP_PATH = `/login?tab=signup&redirect=${encodeURIComponent(INTAKE_FORM_PATH)}`

function formatDate(language, value) {
  const locale = language === 'cs' ? 'cs-CZ' : language === 'it' ? 'it-IT' : 'en-US'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })
}

function Box({ title, children, tone = 'default' }) {
  const toneClass =
    tone === 'warning'
      ? 'bg-amber-50 border-amber-200'
      : tone === 'dark'
        ? 'bg-slate-900 border-slate-900 text-white'
        : 'bg-white border-slate-200'

  return (
    <section className={`rounded-2xl border p-6 md:p-8 ${toneClass}`}>
      {title ? <h2 className={`text-2xl font-semibold mb-4 ${tone === 'dark' ? 'text-white' : 'text-slate-900'}`}>{title}</h2> : null}
      {children}
    </section>
  )
}

export default function RealEstatePurchaseSystemItalyPage() {
  const [language, setLanguage] = useState('cs')
  const [isCtaLoading, setIsCtaLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage && CONTENT[savedLanguage]) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
    }

    const handleLanguageChange = (event) => {
      const next = event?.detail
      if (next && CONTENT[next]) {
        setLanguage(next)
        document.documentElement.lang = next
      }
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  const t = {
    ...(CONTENT[language] || CONTENT.en),
    ...(CONTENT_OVERRIDES[language] || {}),
    ...(CLEAN_CONTENT[language] || {})
  }
  const articleImage =
    language === 'cs'
      ? {
          src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80',
          alt: 'Dokumenty a plánování procesu koupě nemovitostí',
          caption: 'Proces koupě funguje spolehlivě tehdy, když jsou role, dokumenty a jednotlivé kroky dobře koordinované.'
        }
      : language === 'it'
        ? {
            src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80',
            alt: 'Documenti e pianificazione del processo di acquisto immobiliare',
            caption: 'Il sistema italiano funziona bene quando ruoli, documenti e fasi vengono coordinati con metodo.'
          }
        : {
            src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80',
            alt: 'Documents and planning for the property buying process',
            caption: 'The Italian system works reliably when roles, documents, and each phase are coordinated step by step.'
          }

  const displayImage =
    language === 'cs'
      ? {
          src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80',
          alt: 'Dokumenty a plánování procesu koupě nemovitostí',
          caption: 'Proces koupě funguje spolehlivě tehdy, když jsou role, dokumenty a jednotlivé kroky dobře koordinované.'
        }
      : articleImage

  const handleIntakeCtaClick = async () => {
    if (isCtaLoading) return
    setIsCtaLoading(true)

    const goToSignup = () => {
      router.push(INTAKE_SIGNUP_PATH)
    }

    if (!supabase) {
      goToSignup()
      setIsCtaLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        router.push(INTAKE_FORM_PATH)
      } else {
        goToSignup()
      }
    } catch (error) {
      console.error('Unable to verify auth state for intake CTA:', error)
      goToSignup()
    } finally {
      setIsCtaLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navigation />

      <main className="pt-28 pb-16 md:pb-24">
        <div className="container mx-auto px-6" style={{ maxWidth: '1200px' }}>
          <div className="max-w-4xl mx-auto space-y-6" style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
            <Button asChild variant="outline" className="inline-flex items-center border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-700">
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.back}
              </Link>
            </Button>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-slate-100 border border-slate-200 text-slate-700 mb-4">
                {t.category}
              </span>
              <h1 className="font-bold text-slate-900 leading-tight mb-8">{t.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
                <span className="inline-flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  {formatDate(language, t.date)}
                </span>
                <span className="inline-flex items-center">
                  <Clock className="h-4 w-4 mr-1.5" />
                  {t.readTime}
                </span>
              </div>
              <div className="space-y-3 text-slate-700 leading-relaxed">
                {t.intro.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <Image src={displayImage.src} alt={displayImage.alt} width={1400} height={800} sizes="(min-width: 768px) 768px, 100vw" className="w-full h-64 md:h-80 object-cover" />
              <p className="text-sm text-slate-600 px-4 py-3">{displayImage.caption}</p>
            </div>

            <Box tone="warning">
              <p className="text-slate-800 leading-relaxed">{t.keyIdea}</p>
            </Box>

            <Box title={t.complexityTitle}>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 leading-relaxed">
                {t.complexity.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-5 border-l-4 border-slate-300 bg-slate-50 rounded-r-lg px-4 py-3 text-slate-700">
                {t.complexityNote}
              </div>
              <div className="mt-5">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href={t.complexityCtaHref}>{t.complexityCta}</Link>
                </Button>
              </div>
            </Box>

            <Box title={t.rolesTitle}>
              <p className="text-slate-700 mb-4">{t.rolesIntro}</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 leading-relaxed">
                {t.roles.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-5">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href={t.rolesNotaryCtaHref}>{t.rolesNotaryCta}</Link>
                </Button>
              </div>
              <div className="mt-5 border-l-4 border-slate-300 bg-slate-50 rounded-r-lg px-4 py-3 text-slate-700">
                {t.rolesNote}
              </div>
            </Box>

            <Box title={t.serviceTitle} tone="dark">
              <p className="text-slate-300 mb-4">{t.serviceText}</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-100 leading-relaxed mb-5">
                {t.service.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="border-l-4 border-copper-300 bg-white/10 rounded-r-lg px-4 py-3 text-slate-100 mb-5 font-medium">
                {t.serviceCta}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  <Link href={t.servicePrimaryCtaHref}>{t.servicePrimaryCta}</Link>
                </Button>
                <Button asChild className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold">
                  <Link href={t.serviceSecondaryCtaHref}>{t.serviceSecondaryCta}</Link>
                </Button>
              </div>
            </Box>

            <Box title={t.risksTitle} tone="warning">
              <ul className="list-disc pl-6 space-y-2 text-slate-800 leading-relaxed">
                {t.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-5 border-l-4 border-amber-400 bg-white rounded-r-lg px-4 py-3 text-slate-800">
                <span className="inline-flex items-center font-semibold">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {t.risksNote}
                </span>
              </div>
              <div className="mt-5">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href={t.risksCtaHref}>{t.risksCta}</Link>
                </Button>
              </div>
            </Box>

            <Box title={t.costsTitle}>
              <p className="text-slate-700 mb-4">{t.costsIntro}</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 leading-relaxed">
                {t.costs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-5">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href={t.costsCtaHref}>{t.costsCta}</Link>
                </Button>
              </div>
            </Box>

            <Box title={t.quickTitle}>
              <p className="text-slate-700 mb-4">{t.quickIntro}</p>
              <ul className="space-y-2">
                {t.quick.map((item) => (
                  <li key={item} className="flex items-start space-x-3 text-slate-700">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 border-l-4 border-slate-300 bg-slate-50 rounded-r-lg px-4 py-3 text-slate-700">
                {t.next}
              </div>
              <div className="mt-5">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleIntakeCtaClick}
                  disabled={isCtaLoading}
                >
                  {t.quickCta}
                </Button>
              </div>
            </Box>
          </div>
        </div>
        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4">
            <InformationalDisclaimer language={language} className="mt-14" />
          </div>
        </section>
      </main>

      <PropertySlider language={language} />
      <Footer language={language} />
    </div>
  )
}
