const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = process.cwd()

const STANDARD_IMPORT_SLUGS = [
  'campania-villa-centola-via-velardino',
  'campania-appartamento-rutino-via-dei-mille',
  'calabria-appartamento-cassano-all-ionio-via-giovanni-amendola-136',
  'campania-villa-camerota-contrada-conca-dei-vascelli',
  'campania-villa-casal-velino-via-ardisani-s-n-c',
  'campania-villa-torchiara-parco-elena',
  'calabria-villa-san-nicola-arcella-villaggio-del-bridge',
  'campania-casa-indipendente-ascea-via-grisi-s-n-c',
  'calabria-villa-praia-a-mare-localita-laccata',
  'calabria-villa-francavilla-marittima-via-sant-emiddio-21',
  'puglia-casa-indipendente-bari-via-de-marinis',
  'puglia-villa-conversano-viale-discesa-del-monte',
  'puglia-villa-mola-di-bari-strada-provinciale-mola-conversano-per-villa-pepe',
  'puglia-appartamento-monopoli-viale-aldo-moro',
  'puglia-casa-indipendente-triggiano-via-tito-fanfulla'
]

const CZECH_TITLE_EXPECTATIONS = {
  'campania-villa-centola-via-velardino': 'Řadová vila v Centole, Via Velardino',
  'campania-appartamento-rutino-via-dei-mille': 'Prostorný byt se zahradou v Rutinu, Via dei Mille',
  'calabria-appartamento-cassano-all-ionio-via-giovanni-amendola-136': "Světlý byt v Cassano all'Ionio, Via Giovanni Amendola",
  'campania-villa-camerota-contrada-conca-dei-vascelli': 'Vila v Camerotě, Contrada Conca dei Vascelli',
  'campania-villa-casal-velino-via-ardisani-s-n-c': 'Rodinná vila v Casal Velino, Via Ardisani',
  'campania-villa-torchiara-parco-elena': 'Vila v Torchiaře, Parco Elena',
  'calabria-villa-san-nicola-arcella-villaggio-del-bridge': 'Prostorná vila v San Nicola Arcella, Villaggio del Bridge',
  'campania-casa-indipendente-ascea-via-grisi-s-n-c': 'Samostatný dům v Ascee, Via Grisi',
  'calabria-villa-praia-a-mare-localita-laccata': 'Přímořská vila v Praia a Mare, lokalita Laccata',
  'calabria-villa-francavilla-marittima-via-sant-emiddio-21': "Samostatná vila ve Francavilla Marittima, Via Sant'Emiddio",
  'puglia-casa-indipendente-bari-via-de-marinis': 'Samostatný dům v Bari, Via De Marinis',
  'puglia-villa-conversano-viale-discesa-del-monte': 'Rodinná vila v Conversanu, Viale Discesa del Monte',
  'puglia-villa-mola-di-bari-strada-provinciale-mola-conversano-per-villa-pepe': 'Menší vila v Mola di Bari u silnice na Conversano',
  'puglia-appartamento-monopoli-viale-aldo-moro': 'Dostupný byt v Monopoli, Viale Aldo Moro',
  'puglia-casa-indipendente-triggiano-via-tito-fanfulla': 'Samostatný dům v Triggianu, Via Tito Fanfulla'
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

test('standard HAR imports stay below promotional listings', () => {
  const properties = JSON.parse(read('data/local-properties.json'))
  const bySlug = new Map(properties.map((property) => [property?.slug?.current, property]))
  const importTimestampLimit = Date.parse('2026-04-30T10:00:00.000Z')

  for (const slug of STANDARD_IMPORT_SLUGS) {
    const property = bySlug.get(slug)
    assert.ok(property, `${slug} should exist in local properties`)
    assert.equal(property.isNew, false, `${slug} must not receive the Novinka badge`)
    assert.equal(Boolean(property.exclusive), false, `${slug} must not receive the Exclusive badge`)
    assert.deepEqual(property.badges || [], [], `${slug} must not receive promotional badges`)
    assert.equal(property.title?.cs, CZECH_TITLE_EXPECTATIONS[slug], `${slug} must keep the curated Czech title`)
    assert.match(property.title?.cs || '', /[Á-ž]/, `${slug} Czech title should use Czech diacritics`)
    assert.ok(
      Date.parse(property._createdAt) <= importTimestampLimit,
      `${slug} must keep an older import date so premium listings stay first`
    )
  }
})

test('property importer preserves explicit created dates from listing.json', () => {
  const importerSource = read('scripts/import-properties.cjs')

  assert.match(importerSource, /createdAtInput = normalizeWhitespace/)
  assert.match(importerSource, /Date\.parse\(createdAtInput\)/)
  assert.match(importerSource, /_createdAt: createdAt/)
  assert.doesNotMatch(importerSource, /_createdAt: now/)
})
