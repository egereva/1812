import { getDynamicPrerenderRoutes } from '../content/index.ts'
import { publicSeoUrl } from './config.ts'

export function getPublicSeoRoutes(): string[] {
  const sections = ['', 'dictionary', 'timeline', 'map', 'about', 'sources']
  return [
    ...new Set([
      ...['', '/en'].flatMap((prefix) =>
        sections.map((section) =>
          section ? `${prefix}/${section}` : `${prefix}/`,
        ),
      ),
      ...getDynamicPrerenderRoutes(),
    ]),
  ].sort()
}

const xmlEscape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[character]!,
  )

export function createSitemap(origin: string, baseURL: string): string {
  if (!origin)
    throw new Error('Sitemap requires a configured production origin')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${getPublicSeoRoutes()
    .map(
      (route) =>
        `  <url><loc>${xmlEscape(publicSeoUrl(route, origin, baseURL))}</loc></url>`,
    )
    .join('\n')}\n</urlset>\n`
}

export function createRobots(origin: string, baseURL: string): string {
  return `User-agent: *\nAllow: /\n${origin ? `\nSitemap: ${origin}${baseURL}sitemap.xml\n` : ''}`
}
