const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { extractListingData } = require("./extract-listing-data.cjs");

const HAR_DIR = "c:\\Users\\39327\\Desktop\\har kop";
const OUT_PATH = "c:\\Users\\39327\\Desktop\\Abruzzo-selection.pptx";
const WORK_DIR = path.resolve("tmp", "abruzzo-selection-data");
const ICON_STRIP = path.resolve("tmp", "ppt-build", "extracted", "ppt", "media", "image1.png");
const COLORS = { bg: "FFFFFF", text: "111111" };

const ITEMS = [
  { index: 1, har: "1 HAR Ab.har", url: "https://www.immobiliare.it/annunci/123742583/" },
  { index: 2, har: "2 HAR Ab.har", url: "https://www.immobiliare.it/annunci/126048535/" },
  { index: 3, har: "3 HAR Ab.har", url: "https://www.immobiliare.it/annunci/113679521/" },
  { index: 4, har: "4 HAR Ab.har", url: "https://www.immobiliare.it/annunci/128307004/" },
  { index: 5, har: "5 HAR Ab.har", url: "https://www.immobiliare.it/annunci/118734397/" },
  { index: 6, har: "6 HAR Ab.har", url: "https://www.immobiliare.it/annunci/127130633/" },
  { index: 7, har: "7 HAR Ab.har", url: "https://www.immobiliare.it/annunci/126839107/" },
  { index: 8, har: "8 HAR Ab.har", url: "https://www.immobiliare.it/annunci/128654722/" },
  { index: 9, har: "9 HAR Ab.har", url: "https://www.immobiliare.it/annunci/125277157/" },
  { index: 10, har: "10 HAR Ab.har", url: "https://www.immobiliare.it/annunci/127279217/" },
  { index: 11, har: "11 HAR Ab.har", url: "https://www.immobiliare.it/annunci/118926619/" },
  { index: 12, har: "12 HAR Ab.har", url: "https://www.immobiliare.it/annunci/110688391/" },
];

const CS_COPY = {
  1: {
    title: "Velky terratetto v Casalincontrada",
    description: "Prvni nabidka je prostorny terratetto v centru Casalincontrady, v klidnejsim zazemi Chieti. Dum ma priblizne 216 m2, tri loznice, dve koupelny a venkovni casti v podobe teras, zahrady a pozemku.\n\nGalerie ukazuje klasicky venkovsky charakter: fasadu, venkovni prostor, kuchyni i loznice. Nemovitost pusobi jako varianta pro klienta, ktery hleda vetsi dum za dostupnou cenu a pocita s postupnym doladenim.\n\nSilnou strankou je pomer ceny, plochy a samostatneho charakteru bydleni.",
  },
  2: {
    title: "Dum s terasou v historickem Chieti",
    description: "Druha nemovitost je terratetto v Chieti Citta, s plochou kolem 94 m2, tremi loznicemi a dvema koupelnami. Poloha ve meste dava smysl pro klienta, ktery chce sluzby po ruce a nechce izolovany venkovsky dum.\n\nDispozice je prakticka: obyvaci pokoj, kuchyne, schodiste, loznice, koupelna a terasa. Druha slide proto kombinuje hlavni obytnou zonu, kuchyn, koupelnu, loznice a venkovni prvek.\n\nNabidka je dostupna mestskemu kupujicimu, ktery hleda samostatnejsi typ bydleni v Abruzzu.",
  },
  3: {
    title: "Venkovsky dum u Cellino Attanasio",
    description: "Treti polozka je terratetto u Cellino Attanasio s plochou priblizne 180 m2. Dle dostupnych fotografii jde hlavne o exterierove a pozemkove predstaveni domu: fasada, zahrada, okolni teren a vyhled.\n\nNemovitost pusobi jako projekt pro klienta, ktery hleda prostor, klid a venkovsky kontext spise nez hotovy apartman u more. V prezentaci proto dava smysl ukazat vice pohledu na dum a parcelu.\n\nJe to nabidka s potencialem pro rekonstrukci a upravu podle vlastniho zameru.",
  },
  4: {
    title: "Hotovejsi dum v Bucchianicu",
    description: "Ctvrta nemovitost v Bucchianicu ma kolem 112 m2, dve loznice a dve koupelny. Fotografie jsou pro prezentaci velmi dobre pouzitelne, protoze ukazuji kuchyn, soggiorno, salone, chodbu, loznice, studio i koupelny.\n\nNabidka pusobi obyvatelneji nez ciste rekonstrukcni projekty a ma citelne rozdeleni vnitrnich prostor. Druha slide je slozena tak, aby pokryla kazdy hlavni typ mistnosti.\n\nVhodne pro klienta, ktery chce mensi samostatny dum v zazemi Chieti s jasnou dispozici.",
  },
  5: {
    title: "Dum s vyhledem v Torricella Peligna",
    description: "Pata nabidka je terratetto v centru Torricella Peligna s plochou kolem 140 m2. Dulezitym motivem jsou terasa a vyhled, ktere z nemovitosti delaji zajimavejsi rekreacni zazemi v horsko-kopcovitem Abruzzu.\n\nInteriery jsou jednodussi a cast fotografii nema popisky, ale galerie ukazuje salone, vstup, venkovni prostor a panoramaticky kontext. To je pro klienta dulezitejsi nez samotna metraz.\n\nNabidka dava smysl pro kupujiciho, ktery hleda atmosferu maleho mesta a vyhledy.",
  },
  6: {
    title: "Velky dum v Castelli",
    description: "Sesta nemovitost je velky terratetto ve frazione Bivio Villa Rossi u Castelli. Plocha kolem 250 m2, dve loznice, dve koupelny a vice obytnych mistnosti davaji domu rodinny charakter.\n\nGalerie ukazuje fasadu, salony, kuchyn, chodbu a loznice. Dulezite je, ze se da dobre predstavit vnitrni objem domu, ne jen exterier.\n\nJe to volba pro klienta, ktery chce vetsi nemovitost v klidnejsim prostredi Gran Sasso a nekompromisne uprednostni prostor.",
  },
  7: {
    title: "Rekonstrukcni dum v Bucchianicu",
    description: "Sedmy listing je terratetto v Contrada Cacciotoli 5 u Bucchianica. Z dostupnych dat jde o dum k rekonstrukci, s parkovanim, balkonem, autonomnim vytapenim a plochou kolem 159 m2.\n\nHAR u tohoto inzeratu obsahoval mene strukturovanych textovych dat, ale zachycuje cenu a zakladni parametry. V prezentaci je proto polozka pojata jako rekonstrukcni kandidat v klidnejsim venkovskem zazemi.\n\nVhodne pro klienta, ktery chce vetsi dum za rozumnou cenu a pocita s pracemi.",
  },
  8: {
    title: "Kompaktni dum v Citta Sant'Angelo",
    description: "Osma nabidka je mensi terratetto v historickem centru Citta Sant'Angelo. Ma priblizne 76 m2, dve loznice a jednu koupelnu, tedy kompaktni dispozici vhodnou pro rekreacni nebo nenarocne celorocni uzivani.\n\nFotografie ukazuji loznice, fasadu, salone, schodiste, chodbu a koupelnu. Dulezite je, ze i pri mensi metrazi jde o samostatnejsi typ nemovitosti s charakterem historickeho mista.\n\nNabidka je vhodna pro klienta, ktery chce atmosferu borghi a dostupnou vstupni cenu.",
  },
  9: {
    title: "Dum s dvorem ve Spoltore",
    description: "Devata nemovitost je terratetto ve Spoltore, v ulici Dietro le Mura, s plochou kolem 80 m2, dvema loznicemi a jednou koupelnou. Vstupni cena je vyssi nez u nekterych horskych nabidek, ale poloha u Pescary muze byt praktickou vyhodou.\n\nGalerie ukazuje dvur, zahradu, sklad, salone, kuchyn, koupelnu a loznici. To dava druhe slide dobrou pestrost bez nutnosti opakovat jeden typ prostoru.\n\nNabidka cili na klienta, ktery chce mensi dum s venkovnim prvkem a dostupnosti mesta.",
  },
  10: {
    title: "Dostupna vila v Casalbordino",
    description: "Desata polozka je vila nebo samostatny dum v Casalbordino Miracoli s plochou kolem 84 m2. Parametry uvadeji pet mistnosti, vice loznic a dve koupelny, coz je pri cene kolem 65 000 EUR zajimava kombinace.\n\nFotografie ukazuji vyhled, salone, kuchyn, chodbu, koupelnu a nekolik loznic. Dulezite je ukazat, ze nejde jen o maly byt, ale o pouzitelny dum s vice mistnostmi.\n\nNabidka muze byt zajimava pro klienta, ktery chce velmi dostupny vstup do oblasti mezi kopci a pobrezim Abruzza.",
  },
  11: {
    title: "Prostorny dum v Monteodorisio",
    description: "Jedenacta nabidka je terratetto v centru Monteodorisio o plose priblizne 157 m2. Ma ctyri loznice, dve koupelny a navic box auto, coz je u historickych center prakticka vyhoda.\n\nDruha slide kombinuje vyhled, salone, kuchyn, dalsi obytny prostor, servisni cast a garaz. Nemovitost proto pusobi jako realne rodinne reseni, ne pouze rekreacni mini dum.\n\nSilnou strankou je pomer ceny, plochy, poctu mistnosti a parkovaciho zazemi.",
  },
  12: {
    title: "Casale s pozemkem u Vasta",
    description: "Posledni listing je casale v lokalite San Lorenzo u Vasta s plochou kolem 225 m2, dvema loznicemi a jednou koupelnou. Venkovni casti, teren a zahrada jsou zde stejne dulezite jako samotny dum.\n\nGalerie ukazuje bazen, pozemek, fasadu, zahradu, salone a tavernu. Pro klienta je to lifestylovejsi nabidka s venkovskym charakterem, ale stale v dosahu oblasti Vasto.\n\nJe vhodna pro kupujiciho, ktery hleda prostor, soukromi a potencial pro rekreacni vyuziti v Abruzzu.",
  },
};

const MANUAL_OVERRIDES = {
  7: {
    title: "Terratetto unifamiliare Contrada Cacciotoli 5, Bucchianico",
    city: "Bucchianico",
    address: "Contrada Cacciotoli",
    streetNumber: "5",
    priceLabel: "79000",
    surface: "159 m2",
    rooms: "5",
    bedrooms: "2",
    bathrooms: "1",
  },
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function formatPrice(raw) {
  const digits = String(raw || "").replace(/[^\d]/g, "");
  return digits ? `${Number(digits).toLocaleString("cs-CZ")} EUR` : "-";
}

function formatMetric(value) {
  return cleanText(value).replace(/m(?:\u00b2|\u00c2\u00b2|\u0102\u201a\u00c2\u02db)|mq/gi, "m2") || "-";
}

function buildMapUrl(listing) {
  if (listing.latitude != null && listing.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`;
  }
  const query = [listing.address, listing.streetNumber, listing.city, listing.title].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function galleryEntries(listing) {
  return (listing.galleryDetails || [])
    .map((item, index) => ({
      path: listing.saved?.galleryPaths?.[index] || null,
      caption: cleanText(item.caption).toLowerCase(),
    }))
    .filter((item) => item.path && fs.existsSync(item.path));
}

function pickHeroImage(listing) {
  const entries = galleryEntries(listing);
  const heroKeywords = ["facciata", "esterno", "giardino", "terreno", "vista", "piscina", "cortile", "terrazzo"];
  const hero = entries.find((item) => heroKeywords.some((keyword) => item.caption.includes(keyword)));
  if (hero) return hero.path;
  if (listing.saved?.mainPath && fs.existsSync(listing.saved.mainPath)) return listing.saved.mainPath;
  return listing.saved?.galleryPaths?.find((file) => file && fs.existsSync(file)) || null;
}

function scoreGalleryCaption(caption) {
  if (caption.includes("cucina")) return 100;
  if (caption.includes("soggiorno") || caption.includes("salone") || caption.includes("living")) return 95;
  if (caption.includes("camera") || caption.includes("stanza")) return 90;
  if (caption.includes("bagno")) return 85;
  if (caption.includes("taverna") || caption.includes("studio") || caption.includes("magazzino") || caption.includes("box") || caption.includes("cantina")) return 75;
  if (caption.includes("scala") || caption.includes("corridoio") || caption.includes("ingresso") || caption.includes("interno")) return 60;
  if (caption.includes("terrazzo") || caption.includes("balcone") || caption.includes("giardino") || caption.includes("terreno")) return 25;
  if (caption.includes("facciata") || caption.includes("vista") || caption.includes("zona")) return 5;
  return 30;
}

function pickByKeywords(entries, used, keywords) {
  const match = entries.find((item) => !used.has(item.path) && keywords.some((keyword) => item.caption.includes(keyword)));
  if (!match) return null;
  used.add(match.path);
  return match.path;
}

function pickGalleryImages(listing) {
  const hero = pickHeroImage(listing);
  const entries = galleryEntries(listing).filter((item) => item.path !== hero);
  const used = new Set();
  const chosen = [];
  const groups = [
    ["cucina"],
    ["soggiorno", "salone", "living"],
    ["camera", "stanza"],
    ["bagno"],
    ["taverna", "studio", "magazzino", "box", "cantina", "ripostiglio"],
    ["terrazzo", "balcone", "giardino", "terreno", "cortile", "vista", "facciata"],
  ];

  for (const group of groups) {
    const picked = pickByKeywords(entries, used, group);
    if (picked) chosen.push(picked);
  }

  for (const item of entries.slice().sort((a, b) => scoreGalleryCaption(b.caption) - scoreGalleryCaption(a.caption))) {
    if (chosen.length >= 6) break;
    if (used.has(item.path)) continue;
    chosen.push(item.path);
    used.add(item.path);
  }

  const fallback = (listing.saved?.galleryPaths || []).filter((file) => file && fs.existsSync(file) && file !== hero);
  for (const file of fallback) {
    if (chosen.length >= 6) break;
    if (used.has(file)) continue;
    chosen.push(file);
    used.add(file);
  }

  while (chosen.length > 0 && chosen.length < 6) chosen.push(chosen[chosen.length % chosen.length]);
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

function compactTitle(listing) {
  const raw = cleanText(CS_COPY[listing.index]?.title || listing.title || `Nemovitost ${listing.index}`);
  return raw.length <= 44 ? raw : `${raw.slice(0, 41).trim()}...`;
}

function addSlideOne(pptx, listing) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };
  addImageIfExists(slide, pickHeroImage(listing), {
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
  slide.addText(formatMetric(listing.surface), { x: metricX, y: 1.72, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText(formatMetric(listing.rooms), { x: metricX, y: 2.56, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText(formatMetric(listing.bedrooms), { x: metricX, y: 3.39, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText(formatMetric(listing.bathrooms), { x: metricX, y: 4.24, w: 1.35, h: 0.36, ...metricStyle });
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
  const slots = [
    { x: 0.0, y: 0.0, w: 4.07, h: 2.42 },
    { x: 4.12, y: 0.0, w: 4.07, h: 2.42 },
    { x: 0.0, y: 2.5, w: 4.07, h: 2.42 },
    { x: 4.12, y: 2.5, w: 4.07, h: 2.42 },
    { x: 0.0, y: 5.0, w: 4.07, h: 2.5 },
    { x: 4.12, y: 5.0, w: 4.07, h: 2.5 },
  ];

  pickGalleryImages(listing).forEach((imagePath, index) => {
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
  slide.addText(cleanText(CS_COPY[listing.index]?.description || listing.description), {
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
  ensureDir(WORK_DIR);
  ensureDir(path.dirname(OUT_PATH));

  const listings = [];
  for (const item of ITEMS) {
    const listingDir = path.join(WORK_DIR, `listing-${item.index}`);
    ensureDir(listingDir);
    const extracted = extractListingData(path.join(HAR_DIR, item.har), listingDir);
    const listing = {
      ...item,
      ...extracted,
      ...(MANUAL_OVERRIDES[item.index] || {}),
    };
    fs.writeFileSync(path.join(listingDir, "listing.json"), JSON.stringify(listing, null, 2), "utf8");
    listings.push(listing);
  }

  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAI Codex";
  pptx.company = "OpenAI";
  pptx.subject = "Abruzzo real estate selection";
  pptx.title = "Abruzzo selection";
  pptx.lang = "cs-CZ";
  pptx.theme = { headFontFace: "Aptos Display", bodyFontFace: "Aptos", lang: "cs-CZ" };

  listings.forEach((listing) => {
    addSlideOne(pptx, listing);
    addSlideTwo(pptx, listing);
  });

  await pptx.writeFile({ fileName: OUT_PATH });
  console.log(OUT_PATH);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
