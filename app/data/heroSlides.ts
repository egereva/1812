export type HeroLocale = 'ru' | 'en'

export type HeroSlide = {
  id:
    | 'borodino-hess-1843'
    | 'fili-council-kivshenko-1882'
    | 'retreat-moscow-suchodolski-1853'
  publicPath:
    | '/images/timeline/borodino-hess-1843.jpg'
    | '/images/timeline/fili-council-kivshenko-1882.jpg'
    | '/images/timeline/retreat-moscow-suchodolski-1853.jpg'
  kind: 'later-artistic-depiction'
  width: number
  height: number
  alt: Record<HeroLocale, string>
  caption: Record<HeroLocale, string>
  license: 'Public domain / PD-Art'
  sourcePage: string
}

// Approved metadata from docs/research/media-manifest.json. The manifest itself
// remains editorial data and is not imported into the runtime bundle.
export const heroSlides = [
  {
    id: 'borodino-hess-1843',
    publicPath: '/images/timeline/borodino-hess-1843.jpg',
    kind: 'later-artistic-depiction',
    width: 1919,
    height: 1210,
    alt: {
      ru: 'Бородинское сражение на картине Петера фон Гесса',
      en: 'The Battle of Borodino in a painting by Peter von Hess',
    },
    caption: {
      ru: 'Петер фон Гесс. «Бородинское сражение 26 августа (7 сентября) 1812 года», 1843. Художественное изображение, созданное после войны.',
      en: 'Peter von Hess. “The Battle of Borodino on 26 August (7 September) 1812,” 1843. An artistic depiction created after the war.',
    },
    license: 'Public domain / PD-Art',
    sourcePage:
      'https://commons.wikimedia.org/wiki/File:Battle_of_Borodino_on_26_August_(7_September)_1812_(by_Peter_von_Hess,_original_colors_version).jpg',
  },
  {
    id: 'fili-council-kivshenko-1882',
    publicPath: '/images/timeline/fili-council-kivshenko-1882.jpg',
    kind: 'later-artistic-depiction',
    width: 2048,
    height: 1105,
    alt: {
      ru: 'Военный совет в Филях на картине Алексея Кившенко',
      en: 'The Military Council at Fili in a painting by Alexey Kivshenko',
    },
    caption: {
      ru: 'Алексей Кившенко. «Военный совет в Филях в 1812 году», 1882. Художественное изображение, созданное спустя 70 лет после события.',
      en: 'Alexey Kivshenko. “The Military Council at Fili in 1812,” 1882. An artistic depiction created 70 years after the event.',
    },
    license: 'Public domain / PD-Art',
    sourcePage:
      'https://commons.wikimedia.org/wiki/File:Военный_совет_в_Филях_в_1812_году.jpg',
  },
  {
    id: 'retreat-moscow-suchodolski-1853',
    publicPath: '/images/timeline/retreat-moscow-suchodolski-1853.jpg',
    kind: 'later-artistic-depiction',
    width: 2500,
    height: 1738,
    alt: {
      ru: 'Отступление Великой армии из Москвы на картине Януария Суходольского',
      en: 'The Grande Armée retreating from Moscow in a painting by January Suchodolski',
    },
    caption: {
      ru: 'Януарий Суходольский. «Отступление из Москвы в 1812 году», 1853. Художественное изображение, созданное позднее события.',
      en: 'January Suchodolski. “Retreat from Moscow in 1812,” 1853. An artistic depiction created after the event.',
    },
    license: 'Public domain / PD-Art',
    sourcePage:
      'https://commons.wikimedia.org/wiki/File:January_Suchodolski_-_Retreat_from_Moscow_in_1812_-_MP_2605_-_National_Museum_in_Warsaw.jpg',
  },
] as const satisfies readonly HeroSlide[]

export function getReadyHeroSlides(availableIds: readonly string[]) {
  return heroSlides.every((slide) => availableIds.includes(slide.id))
    ? heroSlides
    : []
}

export function stepHeroSlide(index: number, direction: -1 | 1, count: number) {
  return (index + direction + count) % count
}

export function getHeroArrowDirection(event: {
  key: string
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
}): -1 | 1 | null {
  if (event.altKey || event.ctrlKey || event.metaKey) return null
  if (event.key === 'ArrowLeft') return -1
  if (event.key === 'ArrowRight') return 1
  return null
}
