const fs = require('fs');
const path = require('path');
const https = require('https');
const pptxgen = require('pptxgenjs');
const { extractListingData } = require('./extract-listing-data.cjs');
const SHAPE = new pptxgen().ShapeType;

const ROOT = path.resolve(__dirname, '..');
const HAR_DIR = 'C:\\Users\\39327\\Desktop\\Har sito';
const OUT_DIR = path.join(ROOT, 'tmp', 'ppt-build', 'bibione');
const MEDIA_DIR = path.join(OUT_DIR, 'media');
const OUTPUT = path.join(ROOT, 'tmp', 'bibione-selection.pptx');
const ICON_STRIP = path.join(ROOT, 'tmp', 'ppt-build', 'extracted', 'ppt', 'media', 'image1.png');

const W = 13.333;
const H = 7.5;
const COLORS = { bg: 'FFFFFF', text: '111111' };
const C = {
  ink: '22324A',
  muted: '6E7A8B',
  blue: '254B73',
  cyan: '2AA9C8',
  pale: 'EEF6F8',
  white: 'FFFFFF',
  sand: 'E8D3B0',
  dark: '16243A',
};

const LISTINGS = [
  {
    id: 'bibione-1',
    url: 'https://www.immobiliare.it/annunci/129143500/',
    har: path.join(HAR_DIR, 'bibione 1.har'),
    title: 'Trilokal Via Livenza',
    copy: 'Zarizeny a klimatizovany trilokal ve villaggiu se zelenymi plochami, bazeny pro dospele i deti a krytym cislovanym parkovacim mistem. Byt je v prvnim patre, ma obytnou cast s terasou, kuchynsky kout, dve loznice a koupelnu s oknem.',
  },
  {
    id: 'bibione-2',
    url: 'https://www.immobiliare.it/annunci/129034854/',
    har: path.join(HAR_DIR, 'bibione2.har'),
    title: 'Zrekonstruovany trilokal Via Aquila',
    copy: 'Bicamere kompletne zarizeny a zrekonstruovany v male palazzine o osmi jednotkach. Prvni patro, terasa a kryte parkovani delaji z nabidky prakticky rekreacni byt v Bibione.',
    fallback: { bedrooms: '2', bathrooms: '1' },
  },
  {
    id: 'bibione-3',
    url: 'https://www.immobiliare.it/annunci/127607814/',
    har: path.join(HAR_DIR, 'bibione3.har'),
    title: 'Trilokal 200 m od more',
    copy: 'Apartman v dobrem stavu jen priblizne 200 metru od plaze. Treti patro, terasa, autonomni vytapeni a parkovaci misto jsou vhodne pro vlastni dovolene i pronajem.',
    fallback: { bedrooms: '2', bathrooms: '1' },
  },
  {
    id: 'bibione-4',
    url: 'https://www.immobiliare.it/annunci/128222930/',
    har: path.join(HAR_DIR, 'bibione4.har'),
    title: 'Monolokal fronte mare',
    copy: 'Kompaktni monolokal v exkluzivni poloze ve fronte-mare rezidenci s bazenem, blizko pesky zony Bibione Spiaggia. Druhe patro, terasa a parkovaci misto tvori jednoduchou plazovou zakladnu.',
    fallback: { price: 128000, bedrooms: '1', bathrooms: '1' },
  },
  {
    id: 'bibione-5',
    url: 'https://www.immobiliare.it/annunci/128759620/',
    har: path.join(HAR_DIR, 'bibione5.har'),
    title: 'Dvoupatrovy trilokal Via Maja',
    copy: 'Prostorny zarizeny a klimatizovany trilokal na dvou urovnich ve villaggiu s bazeny, zelenymi plochami a soukromymi zahradami. Nabizi tri venkovni prostory, kryte parkovani a sklepni prostor.',
  },
  {
    id: 'bibione-6',
    url: 'https://www.immobiliare.it/annunci/128140488/',
    har: path.join(HAR_DIR, 'bibione6.har'),
    title: 'Radova vilka Via Reghena',
    copy: 'Radova vilka v Bibione, priblizne 800 metru od plaze a 450 metru od centralni pesky tridy a termalniho arealu. Terasa a parkovaci misto nabizeji vice soukromi nez klasicky apartman.',
    fallback: { bedrooms: '2', bathrooms: '1' },
  },
  {
    id: 'bibione-7',
    url: 'https://www.immobiliare.it/annunci/126570949/',
    har: path.join(HAR_DIR, 'bibione7.har'),
    title: 'Bilokal Condominio Riviera',
    copy: 'Zarizeny bilokal v Condominio Riviera, v prvnim patre domu s vytahem. Nabizi terasu, parkovaci misto, rozumnou metraz a nizke mesicni naklady, vhodne jako jednoduche reseni v Bibione.',
    fallback: { bedrooms: '1', bathrooms: '1' },
  },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanText(value) {
  if (!value) return '';
  return String(value)
    .replace(/\\u003C/g, '<')
    .replace(/\\u003E/g, '>')
    .replace(/\\u0026/g, '&')
    .replace(/\\"/g, '"')
    .replace(/\\\//g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchFirst(raw, patterns) {
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match && match[1]) return cleanText(match[1]);
  }
  return '';
}

function parseNumberText(value) {
  const cleaned = cleanText(value).replace(/[^\d.,]/g, '');
  if (!cleaned) return '';
  return cleaned;
}

function parsePrice(raw) {
  const value = matchFirst(raw, [
    /"price"\s*:\s*\{[^}]*"value"\s*:\s*([0-9]+)/,
    /"price"\s*:\s*([0-9]{5,})/,
    /Prezzo[\s\S]{0,220}?€\s*([0-9.,]+)/i,
    /€\s*([0-9]{2,3}(?:\.[0-9]{3})+)/,
  ]);
  const parsed = parseNumberText(value);
  if (!parsed) return '';
  const numeric = Number(parsed.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : parsed;
}

function parseMetric(raw, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return matchFirst(raw, [
    new RegExp(`${escaped}[\\s\\S]{0,240}?<dd[^>]*>([^<]+)<\\/dd>`, 'i'),
    new RegExp(`${escaped}[\\s\\S]{0,240}?"caption"\\s*:\\s*"([^"]+)`, 'i'),
  ]);
}

function fallbackExtract(entry, raw, listingDir) {
  ensureDir(listingDir);
  const ogTitle = matchFirst(raw, [
    /property=\\*"og:title\\*" content=\\*"([^"]+)/i,
    /property="og:title" content="([^"]+)/i,
    /"og:title"[^>]+content=\\*"([^"]+)/i,
  ]);
  const ogDescription = matchFirst(raw, [
    /property=\\*"og:description\\*" content=\\*"([^"]+)/i,
    /property="og:description" content="([^"]+)/i,
  ]);
  const ogImage = matchFirst(raw, [
    /property=\\*"og:image\\*" content=\\*"([^"]+)/i,
    /property="og:image" content="([^"]+)/i,
  ]);

  const titleParts = ogTitle.split('|').map((part) => part.trim()).filter(Boolean);
  const listing = {
    title: titleParts[0] || entry.title,
    url: entry.url,
    price: parsePrice(raw),
    surface: matchFirst(ogTitle, [/\|\s*[^|]*?([0-9.,]+\s*m²)/i]) || parseMetric(raw, 'Superficie'),
    rooms: matchFirst(ogTitle, [/\|\s*([0-9]+)\s+local/i]) || parseMetric(raw, 'Locali'),
    bedrooms: parseMetric(raw, 'Camere da letto') || entry.fallback?.bedrooms || '',
    bathrooms: parseMetric(raw, 'Bagni') || entry.fallback?.bathrooms || '',
    floor: parseMetric(raw, 'Piano'),
    parking: parseMetric(raw, 'Posti Auto'),
    description: ogDescription || entry.copy,
    coordinates: {},
    images: [],
  };

  const saved = saveImagesFromRaw(raw, listingDir, ogImage);
  listing.images = saved;
  return listing;
}

function saveImagesFromRaw(raw, listingDir, ogImage) {
  const found = [];
  const seenUrls = new Set();
  const imageBlock = /"url"\s*:\s*"([^"]*pwm\.im-cdn\.it\/image\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"[\s\S]{0,4000}?"mimeType"\s*:\s*"([^"]+)"[\s\S]{0,4000}?"text"\s*:\s*"([A-Za-z0-9+/=]{1000,})"/g;
  let match;
  while ((match = imageBlock.exec(raw))) {
    const url = cleanText(match[1]);
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);
    const mime = match[2];
    const base64 = match[3];
    const ext = mime.includes('png') ? '.png' : mime.includes('webp') ? '.webp' : '.jpg';
    const name = found.length === 0 ? 'main' : `gallery-${found.length}`;
    const file = path.join(listingDir, `${name}${ext}`);
    try {
      fs.writeFileSync(file, Buffer.from(base64, 'base64'));
      found.push({ path: file, caption: '', source: url });
    } catch {
      // Skip malformed embedded images in truncated HAR files.
    }
    if (found.length >= 16) break;
  }

  if (!found.length) {
    const remoteUrls = extractRemoteImageUrls(raw, ogImage);
    remoteUrls.slice(0, 10).forEach((url) => found.push({ path: null, caption: '', source: url }));
  }
  return found;
}

function extractRemoteImageUrls(raw, ogImage) {
  const urls = new Set();
  if (ogImage) urls.add(cleanText(ogImage));
  const patterns = [
    /https:\\\/\\\/pwm\.im-cdn\.it\\\/image\\\/[^"\\\s<>]+/g,
    /https:\/\/pwm\.im-cdn\.it\/image\/[^"\\\s<>]+/g,
  ];
  for (const pattern of patterns) {
    for (const match of raw.matchAll(pattern)) {
      urls.add(cleanText(match[0]));
    }
  }
  return [...urls]
    .map((url) => url.replace(/\\u0026/g, '&'))
    .filter((url) => /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url));
}

function loadListing(entry) {
  const listingDir = path.join(MEDIA_DIR, entry.id);
  const raw = fs.readFileSync(entry.har, 'utf8');
  try {
    const data = extractListingData(entry.har, listingDir);
    return normalizeListing(entry, data);
  } catch {
    return normalizeListing(entry, fallbackExtract(entry, raw, listingDir));
  }
}

function normalizeListing(entry, data) {
  const savedImages = [
    data.saved?.mainPath,
    ...(data.saved?.galleryPaths || []),
    data.saved?.planPath,
  ]
    .filter((file) => file && fs.existsSync(file))
    .map((file) => ({ path: file, caption: '' }));
  const images = [
    ...savedImages,
    ...(data.images || []).filter((img) => img && ((img.path && fs.existsSync(img.path)) || img.source)),
  ];
  return {
    ...data,
    id: entry.id,
    cardTitle: entry.title,
    czechCopy: entry.copy,
    url: entry.url,
    title: data.title || entry.title,
    price: data.price || data.priceLabel || entry.fallback?.price || '',
    surface: data.surface || entry.fallback?.surface || '',
    rooms: data.rooms || entry.fallback?.rooms || '',
    bedrooms: data.bedrooms || entry.fallback?.bedrooms || '',
    bathrooms: data.bathrooms || entry.fallback?.bathrooms || '',
    coordinates: data.coordinates || { lat: data.latitude, lon: data.longitude },
    images,
  };
}

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode !== 200) {
          file.close();
          fs.rmSync(dest, { force: true });
          resolve(false);
          return;
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      })
      .on('error', () => {
        file.close();
        fs.rmSync(dest, { force: true });
        resolve(false);
      });
  });
}

async function hydrateRemoteImages(listing) {
  const tasks = listing.images.map(async (img, idx) => {
    if (img.path || !img.source) return img;
    const ext = path.extname(new URL(img.source).pathname) || '.jpg';
    const dest = path.join(MEDIA_DIR, listing.id, `remote-${idx}${ext}`);
    ensureDir(path.dirname(dest));
    if (!fs.existsSync(dest)) await downloadImage(img.source, dest);
    if (fs.existsSync(dest)) img.path = dest;
    return img;
  });
  await Promise.all(tasks);
  listing.images = listing.images.filter((img) => img.path && fs.existsSync(img.path));
}

function formatPrice(value) {
  if (!value) return 'Cena na dotaz';
  const num = Number(String(value).replace(/[^\d.]/g, ''));
  if (!Number.isFinite(num)) return String(value);
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num);
}

function formatPricePlain(raw) {
  const digits = String(raw || '').replace(/[^\d]/g, '');
  return digits ? `${Number(digits).toLocaleString('cs-CZ')} EUR` : '-';
}

function formatMetric(value) {
  return cleanText(value).replace(/m(?:\u00b2|\u00c2\u00b2|\u0102\u201a\u00c2\u02db)|mq/gi, 'm2') || '-';
}

function valueText(value, suffix = '') {
  if (value === undefined || value === null || value === '') return '-';
  return `${value}${suffix}`;
}

function imagePath(listing, index = 0) {
  const img = listing.images[index] || listing.images[0];
  return img?.path && fs.existsSync(img.path) ? img.path : null;
}

function buildMapUrl(listing) {
  const lat = listing.coordinates?.lat || listing.latitude;
  const lon = listing.coordinates?.lon || listing.longitude;
  if (lat != null && lon != null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  }
  const query = [listing.address, listing.streetNumber, listing.city, listing.title].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || listing.url)}`;
}

function imageEntries(listing) {
  const entries = [];
  if (listing.saved?.mainPath && fs.existsSync(listing.saved.mainPath)) {
    entries.push({ path: listing.saved.mainPath, caption: cleanText(listing.galleryDetails?.[0]?.caption).toLowerCase() });
  }
  (listing.saved?.galleryPaths || []).forEach((file, index) => {
    if (file && fs.existsSync(file)) {
      entries.push({ path: file, caption: cleanText(listing.galleryDetails?.[index]?.caption).toLowerCase() });
    }
  });
  for (const img of listing.images || []) {
    if (img.path && fs.existsSync(img.path) && !entries.some((entry) => entry.path === img.path)) {
      entries.push({ path: img.path, caption: cleanText(img.caption).toLowerCase() });
    }
  }
  return entries;
}

function pickHeroImage(listing) {
  const entries = imageEntries(listing);
  const heroKeywords = ['facciata', 'esterno', 'giardino', 'terreno', 'vista', 'piscina', 'cortile', 'terrazzo', 'balcone'];
  const hero = entries.find((item) => heroKeywords.some((keyword) => item.caption.includes(keyword)));
  return hero?.path || entries[0]?.path || null;
}

function scoreGalleryCaption(caption) {
  if (caption.includes('cucina')) return 100;
  if (caption.includes('soggiorno') || caption.includes('salone') || caption.includes('living')) return 95;
  if (caption.includes('camera') || caption.includes('stanza')) return 90;
  if (caption.includes('bagno')) return 85;
  if (caption.includes('interno') || caption.includes('ingresso') || caption.includes('corridoio')) return 70;
  if (caption.includes('terrazzo') || caption.includes('balcone') || caption.includes('giardino')) return 35;
  if (caption.includes('facciata') || caption.includes('vista') || caption.includes('piscina')) return 10;
  return 50;
}

function pickGalleryImages(listing) {
  const hero = pickHeroImage(listing);
  const entries = imageEntries(listing).filter((item) => item.path !== hero);
  const chosen = entries
    .slice()
    .sort((a, b) => scoreGalleryCaption(b.caption) - scoreGalleryCaption(a.caption))
    .map((item) => item.path);
  const all = imageEntries(listing).map((item) => item.path);
  for (const file of all) {
    if (chosen.length >= 6) break;
    if (!chosen.includes(file)) chosen.push(file);
  }
  while (chosen.length > 0 && chosen.length < 6) chosen.push(chosen[chosen.length % chosen.length]);
  return chosen.slice(0, 6);
}

function addImageIfExists(slide, filePath, options) {
  if (filePath && fs.existsSync(filePath)) {
    slide.addImage({ path: filePath, ...options });
  } else {
    slide.addShape(SHAPE.rect, {
      x: options.x,
      y: options.y,
      w: options.w,
      h: options.h,
      line: { color: 'FFFFFF', transparency: 100 },
      fill: { color: 'F0F0F0' },
    });
  }
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
    slide.addShape(SHAPE.rect, {
      x: band.x,
      y: 0,
      w: band.w,
      h: 7.5,
      line: { color: 'FFFFFF', transparency: 100 },
      fill: { color: 'FFFFFF', transparency: band.transparency },
    });
  }
}

function compactTitle(listing) {
  const raw = cleanText(listing.cardTitle || listing.title || `Nemovitost ${listing.index}`);
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
    sizing: { type: 'cover', x: 3.37, y: 0, w: 9.97, h: 7.5 },
  });
  addFadeOverlay(slide);
  addImageIfExists(slide, ICON_STRIP, { x: 0.38, y: 1.55, w: 0.8, h: 4.89 });
  slide.addText(`${listing.index}. ${compactTitle(listing)}`, {
    x: 0.11,
    y: 0.15,
    w: 3.95,
    h: 0.8,
    fontFace: 'Aptos Display',
    fontSize: 21,
    color: COLORS.text,
    margin: 0,
    fit: 'shrink',
  });

  const metricX = 1.52;
  const metricStyle = { fontFace: 'Aptos', fontSize: 18, color: COLORS.text, margin: 0, valign: 'mid', align: 'left' };
  slide.addText(formatMetric(listing.surface), { x: metricX, y: 1.72, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText(formatMetric(listing.rooms), { x: metricX, y: 2.56, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText(formatMetric(listing.bedrooms), { x: metricX, y: 3.39, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText(formatMetric(listing.bathrooms), { x: metricX, y: 4.24, w: 1.35, h: 0.36, ...metricStyle });
  slide.addText('mapa', {
    x: metricX,
    y: 5.13,
    w: 1.35,
    h: 0.36,
    ...metricStyle,
    hyperlink: { url: buildMapUrl(listing) },
    underline: { color: COLORS.text },
  });
  slide.addText(formatPricePlain(listing.price), {
    x: metricX,
    y: 6.17,
    w: 1.8,
    h: 0.4,
    fontFace: 'Aptos',
    fontSize: 18,
    color: COLORS.text,
    margin: 0,
    fit: 'shrink',
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

  pickGalleryImages(listing).forEach((filePath, idx) => {
    const slot = slots[idx];
    addImageIfExists(slide, filePath, {
      x: slot.x,
      y: slot.y,
      w: slot.w,
      h: slot.h,
      sizing: { type: 'cover', x: slot.x, y: slot.y, w: slot.w, h: slot.h },
    });
  });

  slide.addText(String(listing.index), {
    x: 8.28,
    y: 0.22,
    w: 0.6,
    h: 0.32,
    fontFace: 'Aptos',
    fontSize: 20,
    bold: true,
    color: COLORS.text,
    margin: 0,
  });
  slide.addText(cleanText(listing.czechCopy || listing.description), {
    x: 8.28,
    y: 0.7,
    w: 4.78,
    h: 6.45,
    fontFace: 'Aptos',
    fontSize: 14,
    color: COLORS.text,
    margin: 0,
    valign: 'top',
    breakLine: false,
    fit: 'shrink',
  });
}

function imageSizingCrop(imageWidth, imageHeight, x, y, w, h) {
  const imageRatio = imageWidth / imageHeight;
  const boxRatio = w / h;
  let cropW = imageWidth;
  let cropH = imageHeight;
  if (imageRatio > boxRatio) cropW = imageHeight * boxRatio;
  else cropH = imageWidth / boxRatio;
  return { x, y, w, h, sizing: { type: 'crop', x: (imageWidth - cropW) / 2, y: (imageHeight - cropH) / 2, w: cropW, h: cropH } };
}

function addImageCrop(slide, image, x, y, w, h) {
  if (!image) {
    slide.addShape(SHAPE.rect, { x, y, w, h, fill: { color: C.pale }, line: { color: C.pale } });
    return;
  }
  const size = require('image-size').imageSize(image);
  slide.addImage({ path: image, ...imageSizingCrop(size.width, size.height, x, y, w, h) });
}

function addText(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, {
    x, y, w, h,
    fontFace: 'Aptos',
    color: opts.color || C.ink,
    fontSize: opts.size || 16,
    bold: opts.bold || false,
    margin: opts.margin ?? 0.04,
    breakLine: false,
    fit: 'shrink',
    ...opts,
  });
}

function addMetric(slide, label, value, x, y, w) {
  slide.addShape(SHAPE.roundRect, {
    x, y, w, h: 0.62,
    rectRadius: 0.08,
    fill: { color: C.white, transparency: 4 },
    line: { color: 'D8E7EC', transparency: 10 },
  });
  addText(slide, label.toUpperCase(), x + 0.18, y + 0.09, w - 0.36, 0.18, { size: 6.8, color: C.muted, bold: true, margin: 0 });
  addText(slide, valueText(value), x + 0.18, y + 0.29, w - 0.36, 0.22, { size: 12, color: C.ink, bold: true, margin: 0 });
}

function addMapButton(slide, listing, x, y) {
  const lat = listing.coordinates?.lat;
  const lon = listing.coordinates?.lon;
  const url = lat && lon
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
    : listing.url;
  slide.addShape(SHAPE.roundRect, {
    x, y, w: 1.72, h: 0.38,
    rectRadius: 0.07,
    fill: { color: C.blue },
    line: { color: C.blue },
    hyperlink: { url },
  });
  addText(slide, 'Otevrit mapu', x + 0.16, y + 0.09, 1.4, 0.15, { size: 8.5, color: C.white, bold: true, margin: 0, hyperlink: { url } });
}

function addHeroSlide(pptx, listing, index) {
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addImageCrop(slide, imagePath(listing, 0), 0, 0, 7.5, H);
  slide.addShape(SHAPE.rect, { x: 0, y: 0, w: 7.5, h: H, fill: { color: '000000', transparency: 67 }, line: { color: '000000', transparency: 100 } });
  slide.addShape(SHAPE.rect, { x: 7.18, y: 0, w: 6.16, h: H, fill: { color: C.white }, line: { color: C.white } });
  slide.addShape(SHAPE.rect, { x: 7.18, y: 0, w: 0.08, h: H, fill: { color: C.cyan }, line: { color: C.cyan } });

  addText(slide, `BIBIONE ${String(index).padStart(2, '0')}`, 7.58, 0.52, 1.65, 0.18, { size: 7.5, color: C.cyan, bold: true, margin: 0 });
  addText(slide, listing.cardTitle, 7.55, 0.82, 4.95, 0.74, { size: 26, bold: true, color: C.dark, margin: 0 });
  addText(slide, formatPrice(listing.price), 7.56, 1.66, 2.7, 0.28, { size: 17, bold: true, color: C.blue, margin: 0 });
  addText(slide, listing.title, 7.56, 2.05, 4.85, 0.42, { size: 10.5, color: C.muted, margin: 0 });

  addMetric(slide, 'Plocha', listing.surface, 7.55, 2.74, 1.38);
  addMetric(slide, 'Pokoje', listing.rooms, 9.08, 2.74, 1.22);
  addMetric(slide, 'Loznice', listing.bedrooms, 10.45, 2.74, 1.22);
  addMetric(slide, 'Koupelna', listing.bathrooms, 11.82, 2.74, 1.22);

  addText(slide, listing.czechCopy, 7.58, 3.72, 4.94, 1.45, { size: 12.4, color: C.ink, breakLine: false, valign: 'top', fit: 'shrink', margin: 0 });
  addMapButton(slide, listing, 7.58, 5.55);
  slide.addShape(SHAPE.roundRect, {
    x: 9.45, y: 5.55, w: 2.6, h: 0.38,
    rectRadius: 0.07,
    fill: { color: C.pale },
    line: { color: C.pale },
    hyperlink: { url: listing.url },
  });
  addText(slide, 'Otevrit inzerat', 9.66, 5.64, 2.1, 0.15, { size: 8.5, color: C.blue, bold: true, margin: 0, hyperlink: { url: listing.url } });

  if (fs.existsSync(ICON_STRIP)) {
    slide.addImage({ path: ICON_STRIP, x: 7.58, y: 6.58, w: 1.4, h: 0.27 });
  }
}

function addGallerySlide(pptx, listing, index) {
  const slide = pptx.addSlide();
  slide.background = { color: C.pale };
  addText(slide, `BIBIONE ${String(index).padStart(2, '0')} / FOTOGALERIE`, 0.52, 0.35, 2.75, 0.2, { size: 7.5, color: C.cyan, bold: true, margin: 0 });
  addText(slide, listing.cardTitle, 0.52, 0.63, 6.7, 0.42, { size: 20, bold: true, color: C.dark, margin: 0 });
  addText(slide, `${formatPrice(listing.price)}   ${valueText(listing.surface)}   ${valueText(listing.rooms)} pokoje`, 0.54, 1.1, 6, 0.24, { size: 10.5, color: C.muted, margin: 0 });

  const slots = [
    [0.52, 1.58, 4.02, 2.45],
    [4.75, 1.58, 3.85, 2.45],
    [8.82, 1.58, 3.98, 2.45],
    [0.52, 4.25, 2.92, 1.92],
    [3.65, 4.25, 2.92, 1.92],
    [6.78, 4.25, 2.92, 1.92],
    [9.92, 4.25, 2.88, 1.92],
  ];
  slots.forEach((slot, i) => addImageCrop(slide, imagePath(listing, i), ...slot));
}

function addCover(pptx, listings) {
  const slide = pptx.addSlide();
  slide.background = { color: C.dark };
  addImageCrop(slide, imagePath(listings[0], 0), 0, 0, W, H);
  slide.addShape(SHAPE.rect, { x: 0, y: 0, w: W, h: H, fill: { color: '000000', transparency: 35 }, line: { color: '000000', transparency: 100 } });
  addText(slide, 'BIBIONE', 0.72, 0.8, 4.6, 0.54, { size: 31, bold: true, color: C.white, margin: 0 });
  addText(slide, 'Vyber apartmanu k prodeji', 0.76, 1.45, 5.1, 0.35, { size: 17, color: C.white, margin: 0 });
  addText(slide, '7 nemovitosti z Immobiliare.it', 0.78, 6.34, 3.7, 0.25, { size: 12, color: C.white, margin: 0 });
}

async function main() {
  ensureDir(MEDIA_DIR);
  ensureDir(path.dirname(OUTPUT));
  const listings = LISTINGS.map(loadListing);
  await Promise.all(listings.map(hydrateRemoteImages));
  listings.forEach((listing, index) => {
    listing.index = index + 1;
  });
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Domy Vitalii';
  pptx.subject = 'Bibione real estate selection';
  pptx.title = 'Bibione selection';
  pptx.company = 'Domy Vitalii';
  pptx.lang = 'cs-CZ';
  pptx.theme = {
    headFontFace: 'Aptos Display',
    bodyFontFace: 'Aptos',
    lang: 'cs-CZ',
  };

  listings.forEach((listing, idx) => {
    addSlideOne(pptx, listing);
    addSlideTwo(pptx, listing);
  });

  pptx.writeFile({ fileName: OUTPUT });
  console.log(`Created ${OUTPUT}`);
  listings.forEach((listing, idx) => {
    console.log(`${idx + 1}. ${listing.cardTitle} | ${formatPrice(listing.price)} | ${listing.surface || '-'} | images ${listing.images.length}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
