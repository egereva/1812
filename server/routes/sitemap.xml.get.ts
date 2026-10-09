import { createSitemap } from '../../shared/seo/routes'
import { validateBaseURL, validateSiteOrigin } from '../../shared/seo/config'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const origin = validateSiteOrigin(String(config.public.siteUrl || ''))
  if (!origin)
    throw createError({
      statusCode: 404,
      statusMessage:
        'Sitemap unavailable until production origin is configured',
    })
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return createSitemap(origin, validateBaseURL(config.app.baseURL))
})
