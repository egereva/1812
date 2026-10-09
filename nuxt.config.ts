import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { validateBaseURL, validateSiteOrigin } from './shared/seo/config'
import { getPublicSeoRoutes } from './shared/seo/routes'
import {
  getTimelineArtwork,
  timelineArtworkDictionaryIds,
} from './app/data/timelinePresentation'
import { heroSlides } from './app/data/heroSlides'
import { homepageTimelineArtworkSlots } from './app/data/homepageTimelineMedia'
import {
  getDictionaryEntries,
  getCatalogProblems,
  getDanglingRelations,
} from './shared/content/index.ts'

const contentProblems = getCatalogProblems()
const siteOrigin = validateSiteOrigin(process.env.NUXT_PUBLIC_SITE_URL)
const deploymentBaseURL = validateBaseURL(process.env.NUXT_APP_BASE_URL || '/')
if (contentProblems.length)
  throw new Error(`Content errors:\n${contentProblems.join('\n')}`)
for (const warning of getDanglingRelations())
  console.warn(`Content warning: ${warning}`)

export default defineNuxtConfig({
  compatibilityDate: '2026-09-25',
  buildDir: process.env.npm_lifecycle_event === 'dev' ? '.nuxt-dev' : '.nuxt',
  ssr: true,
  modules: ['@nuxtjs/i18n', '@nuxt/eslint'],
  css: ['~/assets/css/main.css', '~/assets/css/museum-viewer.css'],
  app: {
    baseURL: deploymentBaseURL,
  },
  runtimeConfig: {
    public: {
      siteUrl: siteOrigin,
      yandexMapsApiKey: '',
      timelineMediaAvailableSrcs: [
        ...new Set(
          [
            ...Object.values(homepageTimelineArtworkSlots)
              .flatMap((slot) => Object.values(slot))
              .map((image) => image.src),
            ...['ru', 'en'].flatMap((locale) =>
              Object.keys(timelineArtworkDictionaryIds).map(
                (id) =>
                  getTimelineArtwork(
                    getDictionaryEntries(locale as 'ru' | 'en'),
                    id,
                  )?.src,
              ),
            ),
          ].filter(
            (src): src is string =>
              !!src &&
              src.startsWith('/images/') &&
              !src.includes('..') &&
              existsSync(resolve('public', src.slice(1))),
          ),
        ),
      ],
      heroMediaAvailableIds: heroSlides
        .filter((slide) =>
          existsSync(resolve('public', slide.publicPath.slice(1))),
        )
        .map((slide) => slide.id),
    },
  },
  i18n: {
    baseUrl: siteOrigin,
    defaultLocale: 'ru',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'ru', language: 'ru-RU', file: 'ru.json' },
      { code: 'en', language: 'en-US', file: 'en.json' },
    ],
    detectBrowserLanguage: false,
  },
  nitro: {
    prerender: {
      routes: [
        ...getPublicSeoRoutes(),
        '/robots.txt',
        ...(siteOrigin ? ['/sitemap.xml'] : []),
      ],
    },
  },
})
