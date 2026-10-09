import { detailSeoTitle } from '#shared/seo/config'

export function usePageSeo(
  title: () => string,
  description: () => string,
  section?: () => string,
) {
  const { locale } = useI18n()
  const pageTitle = () => detailSeoTitle(title(), section?.())
  useHead(() => ({ title: pageTitle() }))
  useSeoMeta({
    description,
    ogTitle: pageTitle,
    ogDescription: description,
    ogType: 'website',
    ogSiteName: '1812',
    ogLocale: () => (locale.value === 'en' ? 'en_US' : 'ru_RU'),
    ogLocaleAlternate: () => (locale.value === 'en' ? ['ru_RU'] : ['en_US']),
    twitterCard: 'summary',
    twitterTitle: pageTitle,
    twitterDescription: description,
  })
}
