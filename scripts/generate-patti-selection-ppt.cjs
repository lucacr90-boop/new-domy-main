const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const pptxgen = require("pptxgenjs");
const { extractListingData } = require("./extract-listing-data.cjs");

const ITEMS = [
  { index: 1, har: "Har 1 patti.har", url: "https://www.immobiliare.it/annunci/121394606/" },
  { index: 2, har: "har 2 patti.har", url: "https://www.immobiliare.it/annunci/88522169/" },
  { index: 3, har: "har3 patti.har", url: "https://www.immobiliare.it/annunci/128079468/" },
  { index: 4, har: "har4 patti.har", url: "https://www.immobiliare.it/annunci/122895894/" },
  { index: 5, har: "har5 patti.har", url: "https://www.immobiliare.it/annunci/126600057/" },
  { index: 6, har: "har6 patti.har", url: "https://www.immobiliare.it/annunci/124478469/" },
  { index: 7, har: "har 7 patti.har", url: "https://www.immobiliare.it/annunci/114284191/" },
  { index: 8, har: "har8patti.har", url: "https://www.immobiliare.it/annunci/128036718/" },
  { index: 9, har: "har9 patti.har", url: "https://www.immobiliare.it/annunci/122039340/" },
];

const COLORS = { bg: "FFFFFF", text: "111111" };
const ICON_STRIP = path.resolve("tmp", "ppt-build", "extracted", "ppt", "media", "image1.png");

const MANUAL_OVERRIDES = {
  1: {
    title: "Řadový dům s výhledem v Patti",
    description:
      "Dům ve Scale di Patti leží v klidné poloze nedaleko svatyně Madonna del Tindari, letoviska Oliveri a přírodní rezervace Marinello. Nabízí přibližně 135 m², dvě ložnice, koupelnu, kuchyň a obytnou část s balkonem.\n\nNejsilnější stránkou je výhled na záliv Tindari a Liparské ostrovy. Interiéry jsou jednoduché a spíše tradiční, ale dispozice je srozumitelná a dům může dobře fungovat jako prázdninové zázemí u moře i jako klidnější celoroční bydlení.\n\nNemovitost je vhodná pro klienta, který hledá dostupný dům v autentickém sicilském prostředí, s dobrým napojením na pobřeží a s jasným potenciálem pro postupné úpravy.",
    gallery: ["gallery-4", "gallery-8", "gallery-12", "gallery-10"],
  },
  2: {
    title: "Světlý mezonet v Sant'Angelo di Brolo",
    description:
      "Samostatný a světlý byt v centru Sant'Angelo di Brolo je rozložený do dvou podlaží propojených vnitřním schodištěm. Má přibližně 100 m², obytnou kuchyň, další pokoje, koupelnu, menší komoru, terásku a malou zahradní část.\n\nNemovitost působí jednoduše a vyžaduje dokončení nebo modernizaci, ale má dobrou základní dispozici a panoramatický výhled do okolních kopců. Výhodou je okamžitá dostupnost a centrální poloha v obci.\n\nJde o praktickou volbu pro kupujícího, který upřednostní větší vnitřní prostor, nezávislý vstup a klidnější horské zázemí v dojezdové vzdálenosti od pobřeží.",
    gallery: ["gallery-2", "gallery-3", "gallery-5", "gallery-6", "gallery-8", "gallery-7"],
  },
  3: {
    title: "Velký polosamostatný dům v historickém centru",
    description:
      "Polosamostatný dům v historickém centru Sant'Angelo di Brolo má přibližně 330 m² a stojí na dvou nadzemních podlažích. Je volný ze tří stran, má dvojitý vstup a podle dispozice zahrnuje velkou obytnou část, kuchyň s krbem, pracovnu, ložnice, koupelnu s prádelní částí a sklepní prostory s kamennými zdmi a dřevěnými trámy.\n\nNabídka je zajímavá hlavně velikostí a autentickým charakterem. Stav vyžaduje citlivou rekonstrukci, ale objem domu umožňuje vytvořit rodinné bydlení, rekreační dům nebo nemovitost s hostinskou částí.\n\nSilnou stránkou je kombinace historické polohy, velkorysé metráže a stavebních detailů, které mohou po úpravách vytvořit velmi osobitý sicilský dům.",
    gallery: ["gallery-3", "gallery-4", "gallery-2"],
  },
  4: {
    title: "Byt u moře v San Giorgio",
    description:
      "Byt v San Giorgio di Gioiosa Marea leží v udržovaném rezidenčním komplexu velmi blízko moře. Má přibližně 60 m², obytný prostor s kuchyňským koutem, jednu ložnici, koupelnu a venkovní verandu.\n\nJe to kompaktní řešení pro letní pobyty: poloha je praktická, okolí je klidné a obec nabízí příjemný pobřežní rytmus s procházkami, službami a restauracemi v dosahu. Interiér je funkční, ale stylem spíše starší a počítá s osvěžením.\n\nNemovitost dává smysl hlavně jako snadno udržovatelný prázdninový byt u moře, s přímým využitím v letní sezoně a bez složité správy.",
    gallery: ["gallery-1", "gallery-3", "gallery-4", "gallery-6", "gallery-8", "gallery-10"],
  },
  5: {
    title: "Byt k rekonstrukci v centru Patti",
    description:
      "Byt v historickém centru Patti má přibližně 95 m² a leží v blízkosti katedrály San Bartolomeo, starých ulic a míst s výraznou lokální atmosférou. Nemovitost je určená k rekonstrukci a nabízí prostor pro vytvoření vlastního bydlení, prázdninového bytu nebo menší turistické investice.\n\nHodnota této nabídky není v současném stavu interiéru, ale v poloze, velikosti a možnosti upravit dispozici podle budoucího využití. Marina di Patti a moře jsou dostupné za krátkou cestu.\n\nJe to volba pro klienta, který chce koupit za nižší vstupní cenu a má prostor vytvořit si byt podle vlastního zadání přímo v historickém jádru města.",
    gallery: ["gallery-2", "gallery-7", "gallery-8", "gallery-9", "gallery-11", "gallery-12"],
  },
  6: {
    title: "Velký byt v centru Patti",
    description:
      "Prostorný byt ve druhém patře městského paláce v centru Patti má přibližně 186 m² a šest hlavních místností. Důležitou výhodou jsou dva nezávislé vstupy, které mohou po úpravách umožnit rozdělení na dvě samostatné bytové jednotky.\n\nInteriéry mají historický charakter, vysoké stropy a více samostatných pokojů. Stav je vhodný k rekonstrukci, ale velikost, poloha a dispoziční flexibilita z nemovitosti dělají zajímavou investiční příležitost.\n\nNabídka je vhodná pro kupujícího, který hledá větší městský byt s možností budoucího členění, případně kombinaci vlastního bydlení a samostatné hostinské jednotky.",
    gallery: ["gallery-3", "gallery-5", "gallery-6", "gallery-8", "gallery-11", "gallery-12"],
  },
  7: {
    title: "Světlý byt s terasami v centru Patti",
    description:
      "Byt v centrální části Patti má přibližně 100 m² a nachází se ve třetím patře udržovaného domu bez výtahu. Trojitá orientace přináší dobrou přirozenou světelnost i příjemné větrání.\n\nDispozice zahrnuje velký obývací pokoj, samostatnou obytnou kuchyň, dvě ložnice, dvě koupelny a rozsáhlé balkony nebo terasy s otevřeným výhledem na město a okolní kopce.\n\nNemovitost je vhodná pro klienta, který chce centrální polohu, více venkovního prostoru a praktický byt pro delší pobyty i běžné každodenní fungování.",
    gallery: ["gallery-2", "gallery-5", "gallery-6", "gallery-8", "gallery-10", "gallery-9"],
  },
  8: {
    title: "Kompaktní byt se zahradou u Saliceta",
    description:
      "Byt v Contrada Saliceto leží jen kousek od pláže Saliceto a Mariny di Patti, v panoramatické poloze rezidence Orizzonte. Má samostatný vstup, přibližně 50 m², obytnou kuchyň se sezením, ložnici, koupelnu a přední i zadní venkovní část.\n\nNemovitost je jednoduchá na správu a vhodná hlavně jako prázdninový byt nebo menší investice u moře. Přednostmi jsou soukromý vstup, venkovní prostor, parkování a výhled směrem k pobřeží.\n\nJde o praktickou volbu pro kupujícího, který hledá malý, snadno využitelný byt s vlastním venkovním prostorem a rychlým přístupem k pláži.",
    gallery: ["gallery-2", "gallery-3", "gallery-4", "gallery-5", "gallery-7", "gallery-8"],
  },
  9: {
    title: "Panoramatický byt v části Sorrentini",
    description:
      "Byt v místní části Sorrentini u Patti má přibližně 90 m² a samostatný přístup v nezávislém domě. Nabízí obytnou kuchyň, světlý obývací pokoj, hlavní ložnici, druhý pokoj, dvě koupelny, komoru a balkony obepínající obytnou část.\n\nNejvětší hodnotou je široký panoramatický výhled: od zálivu Patti přes Capo Milazzo a Tindari až směrem k Etně. Nemovitost je vhodná pro klienta, který hledá klidnější místo mimo nejrušnější pobřeží, ale stále s dobrým napojením na Patti a moře.\n\nByt má vyváženou dispozici pro rodinné užívání i delší rekreační pobyty a díky výhledům působí výrazně vzdušněji než běžné městské byty ve stejné cenové hladině.",
    gallery: ["gallery-2", "gallery-4", "gallery-5", "gallery-7", "gallery-9", "gallery-10"],
  },
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function compactTitle(listing) {
  const override = MANUAL_OVERRIDES[listing.index]?.title;
  if (override) return override;
  const raw = cleanText(listing.title);
  if (!raw) return `Dům ${listing.index} u Patti`;
  const firstPart = raw.split(",")[0].trim();
  return firstPart.length <= 44 ? firstPart : `${firstPart.slice(0, 41).trim()}...`;
}

function cleanupDescription(text) {
  let cleaned = cleanText(text)
    .replace(/Contattaci[\s\S]*$/i, "")
    .replace(/Contattateci[\s\S]*$/i, "")
    .replace(/Chiamaci[\s\S]*$/i, "")
    .replace(/Per maggiori informazioni[\s\S]*$/i, "")
    .replace(/Per informazioni[\s\S]*$/i, "")
    .replace(/Rif\.\s*[:\-]?\s*[\w/-]+/gi, "")
    .trim();

  if (cleaned.length <= 1500) return cleaned;

  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  const kept = [];
  for (const sentence of sentences) {
    const candidate = [...kept, sentence].join(" ");
    if (candidate.length > 1500) break;
    kept.push(sentence);
  }
  return kept.join(" ").trim() || cleaned.slice(0, 1500).trim();
}

function formatPrice(raw) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  return digits ? `${Number(digits).toLocaleString("it-IT")} EUR` : "";
}

function formatMetricValue(value) {
  return cleanText(value).replace("mÂ˛", "m2").replace("m²", "m2");
}

function buildMapUrl(listing) {
  if (listing.latitude != null && listing.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`;
  }
  const query = [listing.address, listing.streetNumber, listing.city].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function getGalleryDetails(listing) {
  return (listing.galleryDetails || [])
    .map((item, index) => ({
      ...item,
      path: listing?.saved?.galleryPaths?.[index] || null,
      captionLc: cleanText(item.caption).toLowerCase(),
    }))
    .filter((item) => item.path && fs.existsSync(item.path));
}

function isExterior(caption) {
  return /facciata|esterno|prospetto|giardino|terraz|balcone|veranda|portico|cortile|vista|panoram|mare|strada|terreno/i.test(caption);
}

function exteriorScore(caption) {
  let score = 0;
  if (/facciata|esterno|prospetto/i.test(caption)) score += 100;
  if (/giardino|cortile|terreno/i.test(caption)) score += 60;
  if (/terraz|veranda|portico|balcone/i.test(caption)) score += 45;
  if (/vista|panoram|mare/i.test(caption)) score += 35;
  return score;
}

function pickMainImage(listing) {
  const exterior = getGalleryDetails(listing)
    .filter((item) => isExterior(item.captionLc))
    .sort((a, b) => exteriorScore(b.captionLc) - exteriorScore(a.captionLc))[0];
  if (exterior?.path) return exterior.path;

  const main = listing?.saved?.mainPath;
  if (main && fs.existsSync(main)) return main;
  return listing?.saved?.galleryPaths?.find((file) => file && fs.existsSync(file)) || null;
}

function roomCategory(caption) {
  if (/soggiorno|salone|living|pranzo|tinello/.test(caption)) return "living";
  if (/cucina|cottura/.test(caption)) return "kitchen";
  if (/camera da letto|camera matrimoniale|letto|camera/.test(caption)) return "bedroom";
  if (/bagno|servizio|wc/.test(caption)) return "bathroom";
  if (/ingresso|corridoio|disimpegno|scala|vano scala/.test(caption)) return "hall";
  if (/cantina|taverna|lavanderia|ripostiglio|deposito|magazzino|garage|box/.test(caption)) return "utility";
  if (/mansarda|sottotetto|studio|locale|stanza/.test(caption)) return "extra";
  return isExterior(caption) ? "exterior" : "other";
}

function roomScore(caption) {
  if (/soggiorno|salone|living/.test(caption)) return 100;
  if (/cucina/.test(caption)) return 95;
  if (/camera da letto|camera matrimoniale|letto/.test(caption)) return 90;
  if (/bagno/.test(caption)) return 85;
  if (/ingresso|corridoio|disimpegno|scala/.test(caption)) return 55;
  if (/cantina|taverna|lavanderia|ripostiglio|garage|magazzino/.test(caption)) return 45;
  if (/mansarda|sottotetto|studio|locale|stanza/.test(caption)) return 40;
  if (isExterior(caption)) return 5;
  return 25;
}

function pickGalleryImages(listing) {
  const manual = MANUAL_OVERRIDES[listing.index]?.gallery;
  if (manual?.length) {
    const byBaseName = new Map();
    const files = [listing?.saved?.mainPath, ...(listing?.saved?.galleryPaths || [])].filter(Boolean);
    for (const file of files) {
      byBaseName.set(path.basename(file, path.extname(file)), file);
    }
    const usedHashes = new Set();
    return manual
      .map((name) => byBaseName.get(name))
      .filter((file) => {
        if (!file || !fs.existsSync(file)) return false;
        const hash = crypto.createHash("sha1").update(fs.readFileSync(file)).digest("hex");
        if (usedHashes.has(hash)) return false;
        usedHashes.add(hash);
        return true;
      })
      .slice(0, 6);
  }

  const hero = pickMainImage(listing);
  const details = getGalleryDetails(listing).filter((item) => item.path !== hero);
  const chosen = [];
  const usedPaths = new Set();
  const usedCategories = new Set();
  const categoryOrder = ["living", "kitchen", "bedroom", "bathroom", "hall", "utility", "extra", "other"];

  for (const category of categoryOrder) {
    const match = details
      .filter((item) => !usedPaths.has(item.path) && roomCategory(item.captionLc) === category)
      .sort((a, b) => roomScore(b.captionLc) - roomScore(a.captionLc))[0];
    if (match) {
      chosen.push(match.path);
      usedPaths.add(match.path);
      usedCategories.add(category);
    }
    if (chosen.length >= 6) return chosen;
  }

  for (const item of details
    .filter((item) => !usedPaths.has(item.path) && roomCategory(item.captionLc) !== "exterior" && !usedCategories.has(roomCategory(item.captionLc)))
    .sort((a, b) => roomScore(b.captionLc) - roomScore(a.captionLc))) {
    chosen.push(item.path);
    usedPaths.add(item.path);
    usedCategories.add(roomCategory(item.captionLc));
    if (chosen.length >= 6) return chosen;
  }

  for (const item of details
    .filter((item) => !usedPaths.has(item.path) && roomCategory(item.captionLc) !== "exterior")
    .sort((a, b) => roomScore(b.captionLc) - roomScore(a.captionLc))) {
    chosen.push(item.path);
    usedPaths.add(item.path);
    if (chosen.length >= 6) return chosen;
  }

  for (const item of details.filter((item) => !usedPaths.has(item.path)).sort((a, b) => roomScore(b.captionLc) - roomScore(a.captionLc))) {
    chosen.push(item.path);
    usedPaths.add(item.path);
    if (chosen.length >= 6) return chosen;
  }

  return chosen.slice(0, 6);
}

function addImageIfExists(slide, filePath, options) {
  if (filePath && fs.existsSync(filePath)) slide.addImage({ path: filePath, ...options });
}

function addFadeOverlay(slide) {
  const bands = [
    { x: 2.758, w: 0.472, transparency: 12 },
    { x: 3.227, w: 0.389, transparency: 26 },
    { x: 3.619, w: 0.305, transparency: 42 },
    { x: 3.93, w: 0.222, transparency: 58 },
    { x: 4.151, w: 0.139, transparency: 72 },
  ];

  for (const band of bands) {
    slide.addShape("rect", {
      x: band.x,
      y: 0,
      w: band.w,
      h: 7.5,
      line: { color: "FFFFFF", transparency: 100 },
      fill: { color: "FFFFFF", transparency: band.transparency },
    });
  }
}

function addSlideOne(pptx, listing) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };

  addImageIfExists(slide, pickMainImage(listing), {
    x: 3.37,
    y: 0,
    w: 9.97,
    h: 7.5,
    sizing: { type: "cover", x: 3.37, y: 0, w: 9.97, h: 7.5 },
  });
  addFadeOverlay(slide);
  addImageIfExists(slide, ICON_STRIP, { x: 0.38, y: 1.55, w: 0.8, h: 4.89 });

  slide.addText(`${listing.index}. ${compactTitle(listing)}`, {
    x: 0.11,
    y: 0.15,
    w: 3.95,
    h: 0.8,
    fontFace: "Aptos Display",
    fontSize: 21,
    color: COLORS.text,
    margin: 0,
    fit: "shrink",
  });

  const metricX = 1.52;
  const metricStyle = { fontFace: "Aptos", fontSize: 18, color: COLORS.text, margin: 0, valign: "mid", align: "left" };
  slide.addText(formatMetricValue(listing.surface), { x: metricX, y: 1.72, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText(formatMetricValue(listing.rooms), { x: metricX, y: 2.56, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText(formatMetricValue(listing.bedrooms), { x: metricX, y: 3.39, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText(formatMetricValue(listing.bathrooms), { x: metricX, y: 4.24, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText("mapa", {
    x: metricX,
    y: 5.13,
    w: 1.35,
    h: 0.36,
    ...metricStyle,
    hyperlink: { url: buildMapUrl(listing) },
    underline: { color: COLORS.text },
  });
  slide.addText(formatPrice(listing.priceLabel), {
    x: metricX,
    y: 6.17,
    w: 1.8,
    h: 0.4,
    fontFace: "Aptos",
    fontSize: 18,
    color: COLORS.text,
    margin: 0,
    fit: "shrink",
  });
}

function addSlideTwo(pptx, listing) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };

  const gallery = pickGalleryImages(listing);
  const slots = [
    { x: 0.0, y: 0.0, w: 4.07, h: 2.42 },
    { x: 4.12, y: 0.0, w: 4.07, h: 2.42 },
    { x: 0.0, y: 2.5, w: 4.07, h: 2.42 },
    { x: 4.12, y: 2.5, w: 4.07, h: 2.42 },
    { x: 0.0, y: 5.0, w: 4.07, h: 2.5 },
    { x: 4.12, y: 5.0, w: 4.07, h: 2.5 },
  ];

  gallery.forEach((imagePath, index) => {
    const slot = slots[index];
    addImageIfExists(slide, imagePath, {
      x: slot.x,
      y: slot.y,
      w: slot.w,
      h: slot.h,
      sizing: { type: "cover", x: slot.x, y: slot.y, w: slot.w, h: slot.h },
    });
  });

  slide.addText(String(listing.index), {
    x: 8.28,
    y: 0.22,
    w: 0.6,
    h: 0.32,
    fontFace: "Aptos",
    fontSize: 20,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  slide.addText(MANUAL_OVERRIDES[listing.index]?.description || cleanupDescription(listing.description), {
    x: 8.28,
    y: 0.7,
    w: 4.78,
    h: 6.45,
    fontFace: "Aptos",
    fontSize: 14,
    color: COLORS.text,
    margin: 0,
    valign: "top",
    breakLine: false,
    fit: "shrink",
  });
}

async function main() {
  const harDir = process.argv[2] || "c:\\Users\\39327\\Desktop\\har patti";
  const outPath = process.argv[3] || path.resolve("tmp", "patti-selection-may-2026.pptx");
  const workDir = process.argv[4] || path.resolve("tmp", "patti-selection-data");

  ensureDir(workDir);
  ensureDir(path.dirname(outPath));

  const listings = ITEMS.map((item) => {
    const listingDir = path.join(workDir, `listing-${item.index}`);
    ensureDir(listingDir);
    const extracted = extractListingData(path.join(harDir, item.har), listingDir);
    if (item.url && extracted.url && extracted.url !== item.url) {
      console.warn(`URL mismatch for ${item.har}: expected ${item.url}, got ${extracted.url}`);
    }
    return {
      ...item,
      ...extracted,
      title: cleanText(extracted.title),
      city: cleanText(extracted.city),
      address: cleanText(extracted.address),
      streetNumber: cleanText(extracted.streetNumber),
      description: cleanText(extracted.description),
    };
  });

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAI Codex";
  pptx.company = "OpenAI";
  pptx.subject = "Patti real estate selection";
  pptx.title = "Patti selection";
  pptx.lang = "cs-CZ";
  pptx.theme = { headFontFace: "Aptos Display", bodyFontFace: "Aptos", lang: "cs-CZ" };

  listings.forEach((listing) => {
    addSlideOne(pptx, listing);
    addSlideTwo(pptx, listing);
  });

  await pptx.writeFile({ fileName: outPath });
  console.log(outPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
