const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { extractListingData } = require("./extract-listing-data.cjs");

const HAR_DIR = "c:\\Users\\39327\\Desktop\\har kop";
const OUT_PATH = "c:\\Users\\39327\\Desktop\\Tarvisio-selection.pptx";
const WORK_DIR = path.resolve("tmp", "tarvisio-selection-data");
const ICON_STRIP = path.resolve("tmp", "ppt-build", "extracted", "ppt", "media", "image1.png");
const COLORS = { bg: "FFFFFF", text: "111111" };

const ITEMS = [
  { index: 1, har: "1 har tar.har", url: "https://www.immobiliare.it/annunci/121620220/" },
  { index: 2, har: "2 har tar.har", url: "https://www.immobiliare.it/annunci/128222650/" },
  { index: 3, har: "3 har tar.har", url: "https://www.immobiliare.it/annunci/128061454/" },
];

const CS_COPY = {
  1: {
    title: "Mansardovy bilokal v Camporossu",
    description: "Prvni nabidka je mansardovy apartman v Camporosso in Valcanale u Tarvisia. Ma priblizne 81 m2, jednu loznici, jeden velky koupelnovy prostor a svetlou obytnou cast s kuchynskym koutem.\n\nSilnym bodem je novejsi budova s vytahem, energeticka trida A4 a horska atmosfera. Fotografie ukazuji kuchyn, obytny prostor a loznici, tedy hlavni prostory pro rekreacni uzivani.\n\nJe to varianta pro klienta, ktery hleda klidne horske zazemi, mensi pocet mistnosti a dobry technicky standard bez agenturnich nakladu.",
  },
  2: {
    title: "Trilokal s terasou v Tarvisiu",
    description: "Druha nemovitost je zrekonstruovany trilokal v Tarvisiu, v ulici Dante Alighieri. Ma priblizne 85 m2, dve loznice, jednu koupelnu, terasu kolem 15 m2, box auto a prostornou cantinu.\n\nPopisky fotografii v HAR nejsou dostupne, proto je druha slide postavena jako vyvazena galerie z prvnich kvalitnich zaberu interieru a doplnkovych casti. Parametry jsou ale velmi dobre citelne z textu inzeratu.\n\nNabidka dava smysl pro klienta, ktery chce hotovejsi byt v centru Tarvisia s praktickym zazemim pro auto a skladovani.",
  },
  3: {
    title: "Bicamere con vista a Tarvisio",
    description: "Treti nabidka je trilokal ve zvysenem prizemi v Condominio Tarvisio, s priblizne 98 m2, dvema manzelskymi loznicemi, obytnou zonou s kuchynskym koutem, koupelnou s oknem a cantinou.\n\nSilnym bodem je otevreny vyhled na hory z obytnych prostoru a jedne z loznic. Vyber fotografii proto zahrnuje vyhled, chodbu, salone, kuchyn a loznice, aby byly pokryte hlavni funkce bytu.\n\nJde o dostupnejsi variantu v porovnani s prvnimi dvema nabidkami, vhodnou pro klienta, ktery hleda udrzovany bicamere v horach s dobrou metrazi a nezavislym vytapenim.",
  },
};

const MANUAL_OVERRIDES = {};

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
