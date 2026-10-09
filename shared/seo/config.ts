export function validateSiteOrigin(value: string = ''): string {
  if (!value.trim()) return ''
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error('NUXT_PUBLIC_SITE_URL must be an absolute HTTPS origin')
  }
  const host = url.hostname.toLowerCase()
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    !host.includes('.') ||
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    /(^|\.)(example\.(com|org|net)|test|invalid|example|local)$/.test(host) ||
    /^[\d.]+$/.test(host) ||
    host.includes(':')
  )
    throw new Error(
      'NUXT_PUBLIC_SITE_URL must be a public HTTPS origin without path, port, credentials or placeholders; configure the path through NUXT_APP_BASE_URL',
    )
  return url.origin
}

export function validateBaseURL(value: string = '/'): string {
  if (!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(value))
    throw new Error(
      'NUXT_APP_BASE_URL must be / or a slash-delimited deployment path such as /repository/',
    )
  return value
}

export function canonicalRoute(path: string): string {
  const clean = path.split(/[?#]/)[0]!.replace(/\/+$/, '') || '/'
  return clean === '/en' ? '/en/' : clean
}

export function publicSeoUrl(
  route: string,
  origin: string,
  baseURL: string,
): string {
  if (!origin) return ''
  return origin + baseURL + canonicalRoute(route).slice(1)
}

// i18n includes app.baseURL already; normalize its output without adding the path twice.
export function normalizeLocaleSeoUrl(
  href: string,
  origin: string,
  baseURL: string,
): string {
  const url = new URL(href)
  const isBaseRoot = url.pathname === baseURL.slice(0, -1)
  if (
    url.origin !== origin ||
    (!isBaseRoot && !url.pathname.startsWith(baseURL))
  )
    throw new Error(
      'Locale SEO URL does not match the configured deployment origin/baseURL',
    )
  return publicSeoUrl(
    isBaseRoot ? '/' : '/' + url.pathname.slice(baseURL.length),
    origin,
    baseURL,
  )
}

export function detailSeoTitle(title: string, section?: string): string {
  return section ? `${title} — ${section} — 1812` : title
}
