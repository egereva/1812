<script setup lang="ts">
import type { HeroLocale, HeroSlide } from '../data/heroSlides'
import { getHeroArrowDirection, stepHeroSlide } from '../data/heroSlides'

const props = defineProps<{ slides: readonly HeroSlide[] }>()
const { locale, t } = useI18n()
const config = useRuntimeConfig()
const index = ref(0)
const sliderRoot = ref<HTMLElement | null>(null)
const language = computed<HeroLocale>(() =>
  locale.value === 'en' ? 'en' : 'ru',
)
const slide = computed(() => props.slides[index.value]!)
const imageSrc = computed(
  () =>
    `${config.app.baseURL.replace(/\/?$/, '/')}${slide.value.publicPath.slice(1)}`,
)
const autoplayDelay = 6500
let autoplayTimer: number | undefined
let reducedMotion = false
let pointerOver = false
let focusWithin = false
let motionQuery: MediaQueryList | undefined
let swipeStart: { pointerId: number; x: number; y: number } | undefined

function clearAutoplay() {
  if (autoplayTimer !== undefined) window.clearTimeout(autoplayTimer)
  autoplayTimer = undefined
}

function scheduleAutoplay() {
  if (typeof window === 'undefined') return
  clearAutoplay()
  if (reducedMotion || pointerOver || focusWithin || document.hidden) return
  autoplayTimer = window.setTimeout(() => {
    index.value = stepHeroSlide(index.value, 1, props.slides.length)
    scheduleAutoplay()
  }, autoplayDelay)
}

function select(nextIndex: number) {
  index.value = nextIndex
  scheduleAutoplay()
}

function move(direction: -1 | 1) {
  if (props.slides.length !== 3) return
  select(stepHeroSlide(index.value, direction, props.slides.length))
}

function onKeydown(event: KeyboardEvent) {
  const direction = getHeroArrowDirection(event)
  if (direction === null) return
  event.preventDefault()
  focusWithin = true
  clearAutoplay()
  move(direction)
}

function onPointerEnter(event: PointerEvent) {
  if (event.pointerType === 'touch') return
  pointerOver = true
  clearAutoplay()
}

function onPointerLeave(event: PointerEvent) {
  if (event.pointerType === 'touch') return
  pointerOver = false
  scheduleAutoplay()
}

function onFocusIn(event: FocusEvent) {
  if (!(event.target as HTMLElement).matches(':focus-visible')) return
  focusWithin = true
  clearAutoplay()
}

function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget
  if (
    next instanceof Node &&
    (event.currentTarget as HTMLElement).contains(next)
  )
    return
  focusWithin = false
  scheduleAutoplay()
}

function onSwipeStart(event: PointerEvent) {
  if (event.pointerType !== 'touch') return
  swipeStart = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
  }
}

function onSwipeEnd(event: PointerEvent) {
  if (!swipeStart || event.pointerId !== swipeStart.pointerId) return
  const distanceX = event.clientX - swipeStart.x
  const distanceY = event.clientY - swipeStart.y
  swipeStart = undefined
  if (
    Math.abs(distanceX) < 56 ||
    Math.abs(distanceX) < Math.abs(distanceY) * 1.5
  )
    return
  move(distanceX < 0 ? 1 : -1)
}

function onMotionChange(event: MediaQueryListEvent) {
  reducedMotion = event.matches
  scheduleAutoplay()
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion = motionQuery.matches
  pointerOver =
    window.matchMedia('(hover: hover)').matches &&
    !!sliderRoot.value?.matches(':hover')
  motionQuery.addEventListener('change', onMotionChange)
  document.addEventListener('visibilitychange', scheduleAutoplay)
  scheduleAutoplay()
})

onUnmounted(() => {
  clearAutoplay()
  motionQuery?.removeEventListener('change', onMotionChange)
  document.removeEventListener('visibilitychange', scheduleAutoplay)
})
</script>

<template>
  <div
    ref="sliderRoot"
    class="hero-slider"
    role="region"
    :aria-label="t('home.slider.label')"
    @keydown="onKeydown"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <figure class="hero-slider__figure">
      <div
        class="hero-slider__frame"
        :data-slide-id="slide.id"
        @pointerdown="onSwipeStart"
        @pointerup="onSwipeEnd"
        @pointercancel="swipeStart = undefined"
      >
        <!-- eslint-disable vue/html-self-closing -->
        <img
          :key="slide.id"
          :src="imageSrc"
          :alt="slide.alt[language]"
          :width="slide.width"
          :height="slide.height"
          draggable="false"
          fetchpriority="high"
        />
        <!-- eslint-enable vue/html-self-closing -->
      </div>
      <figcaption class="hero-slider__caption">
        <span>{{ slide.caption[language] }}</span>
        <span class="hero-slider__credit">
          {{ slide.license }} ·
          <a :href="slide.sourcePage" target="_blank" rel="noopener noreferrer">
            {{ t('home.slider.source') }}
          </a>
        </span>
      </figcaption>
    </figure>
    <div class="hero-slider__controls">
      <button
        v-for="(item, itemIndex) in slides"
        :key="item.id"
        type="button"
        :aria-label="`${itemIndex + 1}. ${item.alt[language]}`"
        :aria-current="itemIndex === index ? 'true' : undefined"
        @click="select(itemIndex)"
      >
        <span aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.hero-slider {
  position: relative;
  width: 100%;
  height: 100svh;
  min-height: 42rem;
}
.hero-slider__figure {
  position: absolute;
  inset: 0;
  margin: 0;
}
.hero-slider__frame {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--color-surface);
  touch-action: pan-y;
}
.hero-slider__frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-slider__frame[data-slide-id='borodino-hess-1843'] img {
  object-position: 50% 70%;
}
.hero-slider__frame[data-slide-id='fili-council-kivshenko-1882'] img {
  object-position: 43% 50%;
}
.hero-slider__frame[data-slide-id='retreat-moscow-suchodolski-1853'] img {
  object-position: 50% 68%;
}
.hero-slider__caption {
  position: absolute;
  right: var(--gutter);
  bottom: 5rem;
  z-index: 1;
  display: grid;
  width: min(37rem, calc(100% - 2 * var(--gutter)));
  gap: var(--space-1);
  color: #fff;
  font-size: var(--text-caption);
  line-height: 1.4;
  text-align: right;
  text-shadow:
    0 1px 2px #000,
    0 0 6px #000,
    0 0 12px rgb(0 0 0 / 80%);
}
.hero-slider__credit {
  font-size: var(--text-overline);
}
.hero-slider__credit a:hover {
  color: #fff;
}
.hero-slider__controls {
  position: absolute;
  z-index: 2;
  bottom: var(--space-4);
  left: 50%;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  transform: translateX(-50%);
}
.hero-slider__controls button {
  display: grid;
  width: 2.75rem;
  min-height: 2.75rem;
  place-items: center;
  border: 0;
  padding: 0;
  background: transparent;
}
.hero-slider__controls button span {
  width: 0.55rem;
  height: 0.55rem;
  border: 1px solid #fff;
  border-radius: 50%;
  background: rgb(255 255 255 / 70%);
  box-shadow: 0 1px 5px rgb(0 0 0 / 70%);
}
.hero-slider__controls button[aria-current='true'] span {
  width: 0.8rem;
  height: 0.8rem;
  border: 2px solid #fff;
  background: var(--color-accent);
}
.hero-slider__controls button:focus-visible {
  outline-color: #fff;
  background: rgb(20 18 16 / 45%);
}
@media (max-width: 56.25rem) {
  .hero-slider {
    height: min(100svh, 46rem);
    min-height: 38rem;
  }
}
@media (max-width: 37.5rem) {
  .hero-slider {
    height: min(100svh, 42rem);
    min-height: 34rem;
  }
  .hero-slider__caption {
    bottom: 4.75rem;
    width: min(19rem, calc(100% - 2 * var(--gutter)));
    font-size: var(--text-overline);
  }
  .hero-slider__frame[data-slide-id='fili-council-kivshenko-1882'] img {
    object-position: 30% 50%;
  }
  .hero-slider__frame[data-slide-id='retreat-moscow-suchodolski-1853'] img {
    object-position: 38% 50%;
  }
}
</style>
