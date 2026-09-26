<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Keyboard, Pagination } from 'swiper/modules'
import type { Swiper as SwiperInstance } from 'swiper'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import type { HeroLocale, HeroSlide } from '../data/heroSlides'

const props = defineProps<{ slides: readonly HeroSlide[] }>()
const { locale, t } = useI18n()
const config = useRuntimeConfig()
const root = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const language = computed<HeroLocale>(() =>
  locale.value === 'en' ? 'en' : 'ru',
)
const displayCaptions = {
  'borodino-hess-1843': {
    ru: {
      author: 'Петер фон Гесс',
      titleStart: '«Бородинское сражение 26 августа (7 сентября) 1812',
      titleEnd: 'года», 1843',
    },
    en: {
      author: 'Peter von Hess',
      titleStart: '“The Battle of Borodino on 26 August (7 September)',
      titleEnd: '1812”, 1843',
    },
  },
  'fili-council-kivshenko-1882': {
    ru: {
      author: 'Алексей Кившенко',
      titleStart: '«Военный совет в Филях в 1812',
      titleEnd: 'году», 1882',
    },
    en: {
      author: 'Alexey Kivshenko',
      titleStart: '“The Military Council at Fili in',
      titleEnd: '1812”, 1882',
    },
  },
  'retreat-moscow-suchodolski-1853': {
    ru: {
      author: 'Януарий Суходольский',
      titleStart: '«Отступление из Москвы в 1812',
      titleEnd: 'году», 1853',
    },
    en: {
      author: 'January Suchodolski',
      titleStart: '“Retreat from Moscow in',
      titleEnd: '1812”, 1853',
    },
  },
} satisfies Record<
  HeroSlide['id'],
  Record<HeroLocale, { author: string; titleStart: string; titleEnd: string }>
>
const modules = [EffectFade, Autoplay, Pagination, Keyboard]
const autoplay = {
  delay: 6500,
  disableOnInteraction: false,
  pauseOnMouseEnter: true,
}
let swiper: SwiperInstance | undefined
let motionQuery: MediaQueryList | undefined
let reducedMotion = false

function imageSrc(slide: HeroSlide) {
  return `${config.app.baseURL.replace(/\/?$/, '/')}${slide.publicPath.slice(1)}`
}

function renderBullet(index: number, className: string) {
  const label =
    language.value === 'ru' ? 'Показать изображение' : 'Show artwork'
  return `<button class="${className}" type="button" aria-label="${label} ${index + 1}"${index === 0 ? ' aria-current="true"' : ''}><span aria-hidden="true"></span></button>`
}

function onSlideChange(instance: SwiperInstance) {
  activeIndex.value = instance.realIndex
  instance.pagination.bullets.forEach((bullet, index) => {
    if (index === instance.realIndex)
      bullet.setAttribute('aria-current', 'true')
    else bullet.removeAttribute('aria-current')
  })
}

function syncMotion() {
  if (!swiper) return
  swiper.params.speed = reducedMotion ? 0 : 1100
  if (reducedMotion) swiper.autoplay.stop()
  else if (
    !root.value?.matches(':focus-within') &&
    !root.value?.matches(':hover')
  )
    swiper.autoplay.start()
}

function onMotionChange(event: MediaQueryListEvent) {
  reducedMotion = event.matches
  syncMotion()
}

function onSwiper(instance: SwiperInstance) {
  swiper = instance
  syncMotion()
}

function onFocusIn(event: FocusEvent) {
  if (!(event.target as HTMLElement).matches(':focus-visible')) return
  swiper?.autoplay.stop()
}

function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget
  if (next instanceof Node && root.value?.contains(next)) return
  if (!reducedMotion && !root.value?.matches(':hover')) swiper?.autoplay.start()
}

function onPointerLeave() {
  if (!reducedMotion && !root.value?.matches(':focus-within'))
    swiper?.autoplay.start()
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion = motionQuery.matches
  motionQuery.addEventListener('change', onMotionChange)
  syncMotion()
})

onUnmounted(() => motionQuery?.removeEventListener('change', onMotionChange))
</script>

<template>
  <div
    ref="root"
    class="hero-slider"
    role="region"
    :aria-label="t('home.slider.label')"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @pointerleave="onPointerLeave"
  >
    <Swiper
      class="hero-slider__swiper"
      :modules="modules"
      effect="fade"
      :fade-effect="{ crossFade: true }"
      :speed="1100"
      :rewind="true"
      :autoplay="autoplay"
      :pagination="{ clickable: true, renderBullet }"
      :keyboard="{ enabled: true, onlyInViewport: true }"
      @swiper="onSwiper"
      @slide-change="onSlideChange"
    >
      <SwiperSlide v-for="(slide, index) in props.slides" :key="slide.id">
        <figure
          class="hero-slider__figure"
          :data-slide-id="slide.id"
          :aria-hidden="index !== activeIndex"
        >
          <!-- eslint-disable vue/html-self-closing -->
          <img
            :src="imageSrc(slide)"
            :alt="slide.alt[language]"
            :width="slide.width"
            :height="slide.height"
            draggable="false"
            :fetchpriority="index === 0 ? 'high' : 'auto'"
          />
          <!-- eslint-enable vue/html-self-closing -->
          <figcaption class="hero-slider__caption">
            <span class="hero-slider__author">{{
              displayCaptions[slide.id][language].author
            }}</span>
            <span class="hero-slider__title"
              >{{ displayCaptions[slide.id][language].titleStart }}
              <span class="hero-slider__title-end">{{
                displayCaptions[slide.id][language].titleEnd
              }}</span></span
            >
            <a
              :href="slide.sourcePage"
              :tabindex="index === activeIndex ? 0 : -1"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ t('home.slider.source') }}
            </a>
          </figcaption>
        </figure>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<style scoped>
.hero-slider,
.hero-slider__swiper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 42rem;
}
.hero-slider__figure {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: var(--color-surface);
}
.hero-slider__figure img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-slider__figure[data-slide-id='borodino-hess-1843'] img {
  object-position: 50% 70%;
}
.hero-slider__figure[data-slide-id='fili-council-kivshenko-1882'] img {
  object-position: 43% 50%;
}
.hero-slider__figure[data-slide-id='retreat-moscow-suchodolski-1853'] img {
  object-position: 50% 68%;
}
.hero-slider__caption {
  position: absolute;
  right: var(--gutter);
  bottom: 4.5rem;
  z-index: 1;
  display: grid;
  width: min(28rem, calc(100% - 2 * var(--gutter)));
  gap: 0.125rem;
  color: rgb(244 240 232 / 60%);
  font-size: var(--text-caption);
  line-height: 1.4;
  text-align: right;
  text-shadow:
    0 1px 2px rgb(0 0 0 / 90%),
    0 0 5px rgb(0 0 0 / 55%);
}
.hero-slider__author {
  font-size: var(--text-overline);
}
.hero-slider__title {
  text-wrap: balance;
}
.hero-slider__title-end {
  white-space: nowrap;
}
.hero-slider__caption a {
  justify-self: end;
  font-size: var(--text-overline);
}
.hero-slider__caption a:hover {
  color: #f8f5ee;
}
.hero-slider__caption a:focus-visible {
  color: #f8f5ee;
  outline-color: #f8f5ee;
  background: rgb(0 0 0 / 35%);
}
.hero-slider :deep(.swiper-pagination) {
  position: absolute;
  z-index: 3;
  bottom: 1rem;
  left: 50%;
  display: flex;
  width: auto;
  transform: translateX(-50%);
}
.hero-slider :deep(.swiper-pagination-bullet) {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  margin: 0;
  place-items: center;
  border: 0;
  border-radius: 0;
  background: transparent;
  opacity: 1;
  cursor: pointer;
}
.hero-slider :deep(.swiper-pagination-bullet span) {
  width: 0.5rem;
  height: 0.5rem;
  border: 1px solid #fff;
  border-radius: 50%;
  background: rgb(50 45 40 / 65%);
  box-shadow: 0 1px 5px rgb(0 0 0 / 75%);
}
.hero-slider :deep(.swiper-pagination-bullet-active span) {
  width: 0.625rem;
  height: 0.625rem;
  background: var(--color-accent);
}
.hero-slider :deep(.swiper-pagination-bullet:focus-visible) {
  outline: 2px solid #fff;
  outline-offset: -2px;
}
@media (max-width: 56.25rem) {
  .hero-slider,
  .hero-slider__swiper {
    min-height: 38rem;
  }
}
@media (max-width: 37.5rem) {
  .hero-slider,
  .hero-slider__swiper {
    min-height: 34rem;
  }
  .hero-slider__caption {
    bottom: 4rem;
    width: min(18rem, calc(100% - 2 * var(--gutter)));
    font-size: var(--text-overline);
  }
  .hero-slider__figure[data-slide-id='fili-council-kivshenko-1882'] img {
    object-position: 30% 50%;
  }
  .hero-slider__figure[data-slide-id='retreat-moscow-suchodolski-1853'] img {
    object-position: 38% 50%;
  }
}
</style>
