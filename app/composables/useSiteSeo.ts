import {
  normalizeLocaleSeoUrl,
  validateBaseURL,
  validateSiteOrigin,
} from '#shared/seo/config'

export function useSiteSeo() {
  const config = useRuntimeConfig()
  const origin = validateSiteOrigin(String(config.public.siteUrl || ''))
  const baseURL = validateBaseURL(config.app.baseURL)
  const localeHead = useLocaleHead({
    seo: origin ? { canonicalQueries: [] } : false,
  })
  useHead(() => ({
    htmlAttrs: localeHead.value.htmlAttrs,
    link: [
      {
        key: 'site-icon',
        rel: 'icon',
        type: 'image/svg+xml',
        href: `${baseURL}icons/1812-map-marker-filled.svg`,
      },
      ...(origin
        ? (localeHead.value.link || []).map((link) => ({
            ...link,
            href: normalizeLocaleSeoUrl(link.href, origin, baseURL),
          }))
        : []),
    ],
    meta: origin
      ? (localeHead.value.meta || [])
          .filter((meta) => meta.property === 'og:url')
          .map((meta) => ({
            ...meta,
            content: normalizeLocaleSeoUrl(
              String(meta.content),
              origin,
              baseURL,
            ),
          }))
      : [],
  }))
}
