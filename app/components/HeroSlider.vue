<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectFade, Keyboard, Pagination } from 'swiper/modules'
import type { Swiper as SwiperInstance } from 'swiper'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import type { HeroLocale, HeroSlide } from '../data/heroSlides'
import { imageDeliveryAttributes } from '~/utils/imageDelivery'

const props = defineProps<{ slides: readonly HeroSlide[] }>()
const { locale, t } = useI18n()
const config = useRuntimeConfig()
const activeIndex = ref(0)
const currentSlide = computed(
  () => props.slides[activeIndex.value] ?? props.slides[0],
)
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
  pauseOnMouseEnter: false,
}
let swiper: SwiperInstance | undefined
let motionQuery: MediaQueryList | undefined
const reducedMotion = ref(false)
const manuallyPaused = ref(false)
const autoplayStopped = computed(
  () => reducedMotion.value || manuallyPaused.value,
)
const playbackStatus = computed(() =>
  t(
    reducedMotion.value
      ? 'home.slider.reducedMotion'
      : manuallyPaused.value
        ? 'home.slider.paused'
        : 'home.slider.playing',
  ),
)

function imageSrc(slide: HeroSlide) {
  const ratio = slide.width / slide.height
  return imageDeliveryAttributes(
    slide.publicPath,
    config.app.baseURL,
    `max(100vw, ${100 * ratio}svh, ${42 * ratio}rem)`,
  )
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
  swiper.params.speed = reducedMotion.value ? 0 : 1100
  if (autoplayStopped.value) swiper.autoplay.stop()
  else if (!swiper.autoplay.running) swiper.autoplay.start()
}

function toggleAutoplay() {
  if (reducedMotion.value) return
  manuallyPaused.value = !manuallyPaused.value
  syncMotion()
}

function onMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
  syncMotion()
}

function onSwiper(instance: SwiperInstance) {
  swiper = instance
  syncMotion()
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', onMotionChange)
  syncMotion()
})

onUnmounted(() => motionQuery?.removeEventListener('change', onMotionChange))
</script>

<template>
  <div class="hero-slider" role="region" :aria-label="t('home.slider.label')">
    <figure class="hero-slider__artwork">
      <Swiper
        id="hero-artwork-slides"
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
            :aria-describedby="
              index === activeIndex ? 'hero-artwork-caption' : undefined
            "
          >
            <!-- eslint-disable vue/html-self-closing -->
            <img
              v-bind="imageSrc(slide)"
              :alt="slide.alt[language]"
              :width="slide.width"
              :height="slide.height"
              draggable="false"
              :fetchpriority="index === 0 ? 'high' : 'auto'"
              :loading="index === 0 ? 'eager' : 'lazy'"
            />
            <!-- eslint-enable vue/html-self-closing -->
          </figure>
        </SwiperSlide>
      </Swiper>
      <button
        class="hero-slider__playback"
        type="button"
        :disabled="reducedMotion"
        :aria-label="
          t(autoplayStopped ? 'home.slider.play' : 'home.slider.pause')
        "
        :title="playbackStatus"
        aria-controls="hero-artwork-slides"
        aria-describedby="hero-playback-status"
        @click="toggleAutoplay"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
          <path v-if="autoplayStopped" d="M6 3.5 16 10 6 16.5Z" />
          <path v-else d="M5 3h3v14H5zM12 3h3v14h-3z" />
        </svg>
      </button>
      <span id="hero-playback-status" class="sr-only" aria-live="polite">{{
        playbackStatus
      }}</span>
      <figcaption
        v-if="currentSlide"
        id="hero-artwork-caption"
        class="hero-slider__caption"
      >
        <span class="hero-slider__author">{{
          displayCaptions[currentSlide.id][language].author
        }}</span>
        <span class="hero-slider__title"
          >{{ displayCaptions[currentSlide.id][language].titleStart }}
          <span class="hero-slider__title-end">{{
            displayCaptions[currentSlide.id][language].titleEnd
          }}</span></span
        >
        <WebsiteLink :href="currentSlide.sourcePage">
          {{ t('home.slider.source') }}
        </WebsiteLink>
      </figcaption>
    </figure>
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
.hero-slider__artwork {
  width: 100%;
  height: 100%;
  margin: 0;
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
  z-index: 3;
  display: grid;
  width: min(clamp(28rem, 28vw, 38rem), calc(100% - 2 * var(--gutter)));
  gap: 0.125rem;
  isolation: isolate;
  color: rgb(244 240 232 / 95%);
  font-size: clamp(0.8125rem, 0.55vw + 0.3125rem, 1.125rem);
  line-height: 1.4;
  text-align: right;
  text-shadow:
    0 1px 2px rgb(0 0 0 / 90%),
    0 0 5px rgb(0 0 0 / 55%);
}
.hero-slider__caption::before {
  position: absolute;
  z-index: -1;
  inset: -1rem;
  background: radial-gradient(
    ellipse at center,
    rgb(0 0 0 / 75%) 0%,
    rgb(0 0 0 / 65%) 75%,
    transparent 100%
  );
  content: '';
  pointer-events: none;
  filter: blur(0.75rem);
}
.hero-slider__author {
  font-size: clamp(0.75rem, 0.45vw + 0.25rem, 1rem);
}
.hero-slider__title {
  text-wrap: balance;
}
.hero-slider__title-end {
  white-space: nowrap;
}
.hero-slider__caption a {
  justify-self: end;
  font-size: clamp(0.75rem, 0.45vw + 0.25rem, 1rem);
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
.hero-slider__playback {
  position: absolute;
  z-index: 3;
  bottom: 1rem;
  left: calc(50% + 4.125rem);
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  place-items: center;
  border: 0;
  background: transparent;
  color: #fff;
  cursor: pointer;
}
.hero-slider__playback svg {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}
.hero-slider__playback:focus-visible {
  outline: 2px solid #fff;
  outline-offset: -2px;
}
.hero-slider__playback:disabled {
  opacity: 0.6;
  cursor: default;
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
