#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')

const ROOT = process.cwd()
const TARGET_DIRS = ['app', 'components', 'lib', 'data']
const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.json', '.md'])
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'tmp', 'public'])

const replacements = new Map([
  ['Italii', 'Itálii'],
  ['Italie', 'Itálie'],
  ['Pruvodce', 'Průvodce'],
  ['pruvodce', 'průvodce'],
  ['koupi', 'koupí'],
  ['mesta', 'města'],
  ['Mesta', 'Města'],
  ['pravni', 'právní'],
  ['nakupu', 'nákupu'],
  ['nabidka', 'nabídka'],
  ['nabidky', 'nabídky'],
  ['nabidku', 'nabídku'],
  ['ceske', 'české'],
  ['ceskych', 'českých'],
  ['ceskym', 'českým'],
  ['Cechy', 'Čechy'],
  ['Cechum', 'Čechům'],
  ['Cech', 'Čech'],
  ['Pomahame', 'Pomáháme'],
  ['pomahame', 'pomáháme'],
  ['kupujicim', 'kupujícím'],
  ['kupujici', 'kupující'],
  ['Aktualni', 'Aktuální'],
  ['aktualni', 'aktuální'],
  ['vsechny', 'všechny'],
  ['Casto', 'Často'],
  ['otazky', 'otázky'],
  ['Hlavni', 'Hlavní'],
  ['hlavni', 'hlavní'],
  ['dovolena', 'dovolená'],
  ['Dovolena', 'Dovolená'],
  ['planovani', 'plánování'],
  ['rozpoctu', 'rozpočtu'],
  ['Ubytovani', 'Ubytování'],
  ['rozumnou', 'rozumnou'],
  ['Hledate', 'Hledáte'],
  ['pronajem', 'pronájem'],
  ['Najit', 'Najít'],
  ['cestovani', 'cestování'],
  ['clanky', 'články'],
  ['Clanky', 'Články'],
  ['kupujici', 'kupující'],
  ['prakticke', 'praktické'],
  ['planovani', 'plánování'],
  ['mistni', 'místní'],
  ['sluzbami', 'službami'],
  ['sluzeb', 'služeb'],
  ['poptavkou', 'poptávkou'],
  ['poptavku', 'poptávku'],
  ['trhum', 'trhům'],
  ['druhe', 'druhé'],
  ['Druhe', 'Druhé'],
  ['vyuziti', 'využití'],
  ['vyber', 'výběr'],
  ['Vyber', 'Výběr'],
  ['Siroky', 'Široký'],
  ['Bohata', 'Bohatá'],
  ['Krasne', 'Krásné'],
  ['plaze', 'pláže'],
  ['jidlo', 'jídlo'],
  ['Rozmanite', 'Rozmanité'],
  ['dostupnych', 'dostupných'],
  ['luxusni', 'luxusní'],
  ['Mestske', 'Městské'],
  ['mestske', 'městské'],
  ['italskych', 'italských'],
  ['lokalitach', 'lokalitách'],
  ['turistickou', 'turistickou'],
  ['Rodinne', 'Rodinné'],
  ['ruznych', 'různých'],
  ['bazenem', 'bazénem'],
  ['vyhledem', 'výhledem'],
  ['Stavebni', 'Stavební'],
  ['zemedelske', 'zemědělské'],
  ['Katastralni', 'Katastrální'],
  ['treba', 'třeba'],
  ['obzvlast', 'obzvlášť'],
  ['peclive', 'pečlivě'],
  ['poreverit', 'prověřit'],
  ['proverit', 'prověřit'],
  ['potreba', 'potřeba'],
  ['historickych', 'historických'],
  ['delenych', 'dělených'],
  ['vyplati', 'vyplatí'],
  ['nejdrive', 'nejdříve'],
  ['jeste', 'ještě'],
  ['pokrocilym', 'pokročilým'],
  ['jednanim', 'jednáním'],
  ['kopcovitych', 'kopcovitých'],
  ['obcich', 'obcích'],
  ['konstrukcni', 'konstrukční'],
  ['starsich', 'starších'],
  ['domu', 'domů'],
  ['doplneni', 'doplnění'],
  ['Vlozte', 'Vložte'],
  ['cestine', 'češtině'],
  ['znaku', 'znaků'],
  ['Udoli', 'Údolí'],
  ['Toskansko', 'Toskánsko'],
  ['Sicilie', 'Sicílie'],
  ['Sardinie', 'Sardinie'],
])

function collectFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) collectFiles(path.join(dir, entry.name), out)
    } else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name))) {
      out.push(path.join(dir, entry.name))
    }
  }
  return out
}

function replaceWholeWord(text, from, to) {
  return text.replace(new RegExp(`\\b${from}\\b`, 'g'), to)
}

let changed = 0
for (const dir of TARGET_DIRS) {
  for (const file of collectFiles(path.join(ROOT, dir))) {
    let next = fs.readFileSync(file, 'utf8')
    const original = next
    for (const [from, to] of replacements) {
      next = replaceWholeWord(next, from, to)
    }
    if (next !== original) {
      fs.writeFileSync(file, next, 'utf8')
      console.log(path.relative(ROOT, file))
      changed += 1
    }
  }
}

console.log(`Changed files: ${changed}`)
