import { createRobots } from '../../shared/seo/routes'
import { validateBaseURL, validateSiteOrigin } from '../../shared/seo/config'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return createRobots(
    validateSiteOrigin(String(config.public.siteUrl || '')),
    validateBaseURL(config.app.baseURL),
  )
})
