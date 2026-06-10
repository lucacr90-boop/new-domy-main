// Currency conversion rates and utilities
// EUR is the base currency (1 EUR = X currency units)

export const CURRENCY_RATES = {
  EUR: 1,
  CZK: 25.0  // Updated to reflect more accurate EUR to CZK exchange rate
}

export const CURRENCY_SYMBOLS = {
  EUR: '€',
  CZK: 'Kč'
}

const PRICE_ON_REQUEST_LABELS = {
  en: 'Price on request',
  it: 'Prezzo su richiesta',
  cs: 'Cena na vyžádání'
}

const PRICE_PREFIX_LABELS = {
  en: 'From',
  it: 'A partire da',
  cs: 'Od'
}

export function isPriceOnRequest(price) {
  return Boolean(
    price?.onRequest ||
      price?.priceOnRequest ||
      price?.amount === null ||
      price?.amount === undefined
  )
}

export function getPriceOnRequestLabel(language = 'cs') {
  return PRICE_ON_REQUEST_LABELS[language] || PRICE_ON_REQUEST_LABELS.en
}

function applyPricePrefix(formatted, price, language = 'cs') {
  if (!price?.prefix && !price?.startingFrom && !price?.from) return formatted
  const prefix = PRICE_PREFIX_LABELS[language] || PRICE_PREFIX_LABELS.en
  return `${prefix} ${formatted}`
}

/**
 * Format price with currency conversion
 * @param {Object} price - Price object with amount and currency
 * @param {string} targetCurrency - Target currency to convert to (EUR or CZK)
 * @param {string} language - Language code for formatting (en, cs, it)
 * @returns {string} Formatted price string
 */
export function formatPrice(price, targetCurrency = 'EUR', language = 'cs') {
  if (!price || isPriceOnRequest(price)) return getPriceOnRequestLabel(language)

  // Convert price to EUR first (base currency)
  const eurAmount = price.currency === 'EUR' 
    ? price.amount 
    : price.amount / CURRENCY_RATES[price.currency]
  
  // Convert from EUR to target currency
  const convertedAmount = eurAmount * CURRENCY_RATES[targetCurrency]
  
  // Map language codes to locale codes for currency formatting
  const localeMap = {
    'en': 'en-US',
    'cs': 'cs-CZ', 
    'it': 'it-IT'
  }
  
  const formatted = new Intl.NumberFormat(localeMap[language] || 'en-US', {
    style: 'currency',
    currency: targetCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(convertedAmount)

  return applyPricePrefix(formatted, price, language)
}

/**
 * Format price with compact notation (k, M) for large numbers
 * @param {number|Object} price - Price as number or price object with amount and currency
 * @param {string} targetCurrency - Target currency to convert to (EUR or CZK)
 * @returns {string} Formatted price string with compact notation
 */
export function formatPriceCompact(price, targetCurrency = 'EUR', language = 'cs') {
  if (!price || (typeof price === 'object' && isPriceOnRequest(price))) {
    return getPriceOnRequestLabel(language)
  }

  let amount = typeof price === 'number' ? price : price.amount
  
  // Convert to target currency if price is an object with currency info
  if (typeof price === 'object' && price.currency) {
    const eurAmount = price.currency === 'EUR' 
      ? price.amount 
      : price.amount / CURRENCY_RATES[price.currency]
    amount = eurAmount * CURRENCY_RATES[targetCurrency]
  } else if (targetCurrency === 'CZK') {
    // If just a number, assume it's in EUR and convert to CZK
    amount = amount * CURRENCY_RATES.CZK
  }
  
  const symbol = CURRENCY_SYMBOLS[targetCurrency]
  if (typeof price === 'object' && (price.prefix || price.startingFrom || price.from)) {
    const localeMap = {
      en: 'en-US',
      cs: 'cs-CZ',
      it: 'it-IT'
    }
    const formatted = new Intl.NumberFormat(localeMap[language] || 'en-US', {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
    return applyPricePrefix(formatted, price, language)
  }
  
  if (amount >= 1000000) {
    const millions = amount / 1000000
    return applyPricePrefix(`${symbol}${millions.toFixed(millions % 1 === 0 ? 0 : 2)}M`, price, language)
  } else if (amount >= 1000) {
    const thousands = amount / 1000
    return applyPricePrefix(`${symbol}${thousands.toFixed(thousands % 1 === 0 ? 0 : 1)}k`, price, language)
  } else {
    return applyPricePrefix(`${symbol}${Math.round(amount)}`, price, language)
  }
}

/**
 * Convert price amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {number} Converted amount
 */
export function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount
  
  // Convert to EUR first (base currency)
  const eurAmount = fromCurrency === 'EUR' 
    ? amount 
    : amount / CURRENCY_RATES[fromCurrency]
  
  // Convert from EUR to target currency
  return eurAmount * CURRENCY_RATES[toCurrency]
}
