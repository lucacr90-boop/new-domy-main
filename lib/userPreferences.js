// Shared helpers for reading and writing user preferences (language, currency).
//
// Public entry points must always open in Czech, regardless of referrer,
// browser language, old cookies, or localStorage from previous visits. Users
// can still switch language during the current session through the selector.

export const SUPPORTED_LANGUAGES = ['cs', 'en', 'it']
export const DEFAULT_LANGUAGE = 'cs'
export const SUPPORTED_CURRENCIES = ['EUR', 'CZK', 'USD']
export const DEFAULT_CURRENCY = 'EUR'

const LANGUAGE_COOKIE = 'preferred-language'
const CURRENCY_COOKIE = 'preferred-currency'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 // one year

function isValidLanguage(value) {
  return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value)
}

function isValidCurrency(value) {
  return typeof value === 'string' && SUPPORTED_CURRENCIES.includes(value)
}

// ---------- Client-side helpers ----------

// Safe lazy initializer for useState — reads synchronously on the client so the
// very first render already uses the stored preference.  On the server (SSR)
// there is no window/document, so we fall back to the default and accept the
// hydration mismatch; React recovers silently before the first paint.
export function getInitialLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  return readLanguageFromBrowser()
}

export function getInitialCurrency() {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY
  return readCurrencyFromBrowser()
}

function readBrowserCookie(name) {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))
  if (!match) return null
  return decodeURIComponent(match.split('=')[1] || '')
}

function writeBrowserCookie(name, value) {
  if (typeof document === 'undefined') return
  const encoded = encodeURIComponent(value)
  document.cookie = `${name}=${encoded}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
}

export function readLanguageFromBrowser() {
  return DEFAULT_LANGUAGE
}

export function readCurrencyFromBrowser() {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY

  const cookieValue = readBrowserCookie(CURRENCY_COOKIE)
  if (isValidCurrency(cookieValue)) return cookieValue

  try {
    const local = window.localStorage?.getItem(CURRENCY_COOKIE)
    if (isValidCurrency(local)) {
      writeBrowserCookie(CURRENCY_COOKIE, local)
      return local
    }
  } catch {
    // ignore
  }

  return DEFAULT_CURRENCY
}

export function persistLanguage(language) {
  if (!isValidLanguage(language)) return
  writeBrowserCookie(LANGUAGE_COOKIE, language)
  try {
    window.localStorage?.setItem(LANGUAGE_COOKIE, language)
  } catch {
    // ignore
  }
}

export function persistCurrency(currency) {
  if (!isValidCurrency(currency)) return
  writeBrowserCookie(CURRENCY_COOKIE, currency)
  try {
    window.localStorage?.setItem(CURRENCY_COOKIE, currency)
  } catch {
    // ignore
  }
}

// ---------- Server-side helper ----------

// Keep first server-rendered HTML in Czech for every direct entry.
export function readLanguageFromCookies(cookieStore) {
  return DEFAULT_LANGUAGE
}

export function readCurrencyFromCookies(cookieStore) {
  try {
    const value = cookieStore?.get?.(CURRENCY_COOKIE)?.value
    return isValidCurrency(value) ? value : DEFAULT_CURRENCY
  } catch {
    return DEFAULT_CURRENCY
  }
}
