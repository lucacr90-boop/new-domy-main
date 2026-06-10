import Link from 'next/link'

const COPY = {
  cs: {
    contact:
      'Odesláním formuláře berete na vědomí zpracování osobních údajů za účelem vyřízení vašeho dotazu a navazující komunikace. Samotné odeslání formuláře ještě nepředstavuje formální individuální poradenství.',
    account:
      'Údaje zadané v tomto formuláři budou zpracovány za účelem vytvoření nebo správy vašeho účtu a souvisejícího přístupu k obsahu a službám.',
    webinar:
      'Registrační údaje budou použity pro potvrzení místa, organizaci akce a související informační komunikaci.',
    purchase:
      'Údaje zadané před platbou budou zpracovány za účelem vyřízení objednávky, dodání digitálního obsahu, případné podpory a souvisejících právních a účetních povinností.',
    property:
      'Údaje z tohoto formuláře budou zpracovány za účelem předání vašeho zájmu o nemovitost a následné komunikace k danému případu.',
    links: 'Podrobnosti o zpracování najdete v',
    cookies: 'zásadách cookies'
  },
  it: {
    contact:
      'Inviando questo modulo, prendi atto del trattamento dei dati personali per gestire la tua richiesta e il successivo contatto. Il solo invio del modulo non costituisce ancora consulenza professionale individuale formale.',
    account:
      'I dati inseriti in questo modulo saranno trattati per creare o gestire il tuo account e il relativo accesso a contenuti e servizi.',
    webinar:
      "I dati di registrazione saranno usati per confermare il posto, organizzare l'evento e inviare le relative comunicazioni informative.",
    purchase:
      "I dati inseriti prima del pagamento saranno trattati per gestire l'ordine, consegnare il contenuto digitale, fornire eventuale supporto e adempiere ai relativi obblighi legali e contabili.",
    property:
      "I dati inviati tramite questo modulo saranno trattati per gestire il tuo interesse verso l'immobile e il successivo contatto relativo a quel caso.",
    links: 'Dettagli sul trattamento in',
    cookies: 'Cookie Policy'
  },
  en: {
    contact:
      'By submitting this form, you acknowledge the processing of your personal data for handling your request and any related follow-up communication. Sending the form alone does not yet create a formal individualized advisory relationship.',
    account:
      'The data entered in this form will be processed to create or manage your account and the related access to content and services.',
    webinar:
      'Registration data will be used to confirm your seat, organize the event, and send related informational communication.',
    purchase:
      'The data entered before payment will be processed to handle your order, deliver the digital content, provide any needed support, and meet related legal and accounting obligations.',
    property:
      'The data submitted through this form will be processed to handle your interest in the property and the related follow-up communication for that case.',
    links: 'Processing details are available in the',
    cookies: 'Cookie Policy'
  }
}

export default function FormPrivacyNotice({
  language = 'cs',
  purpose = 'contact',
  className = ''
}) {
  const copy = COPY[language] || COPY.en
  const body = copy[purpose] || copy.contact

  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 ${className}`.trim()}>
      <p className="text-xs leading-relaxed text-slate-600">
        {body}{' '}
        {copy.links}{' '}
        <Link href="/gdpr" className="underline underline-offset-2">
          GDPR
        </Link>{' '}
        {language === 'cs' ? 'a' : 'e'}{' '}
        <Link href="/cookies" className="underline underline-offset-2">
          {copy.cookies}
        </Link>
        .
      </p>
    </div>
  )
}
