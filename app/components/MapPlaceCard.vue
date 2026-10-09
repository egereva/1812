<script setup lang="ts">
import type { Place } from '#shared/types/content'
import { getSourceById } from '#shared/content/index'
import { normalizeMediaCaption } from '~/utils/mediaCaption'
import { imageDeliveryAttributes } from '~/utils/imageDelivery'

const props = defineProps<{ place: Place; locale: 'ru' | 'en' }>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const title = useTemplateRef<HTMLElement>('title')
const expanded = ref(false)
const detailsId = useId()
const body = useTemplateRef<HTMLElement>('body')
const sheet = useTemplateRef<HTMLElement>('sheet')
function revealSheet() {
  if (window.matchMedia('(max-width: 600px)').matches)
    sheet.value
      ?.closest('.map-page__frame')
      ?.scrollIntoView({ block: 'end', behavior: 'instant' })
}
onMounted(revealSheet)
watch(
  () => [props.place.id, props.locale],
  async () => {
    expanded.value = false
    if (body.value) body.value.scrollTop = 0
    await nextTick()
    revealSheet()
  },
)
function toggleDetails() {
  expanded.value = !expanded.value
  if (body.value) body.value.scrollTop = 0
}
defineExpose({ focusTitle: () => title.value?.focus() })

const caption = computed(() => {
  const image = props.place.coverImage
  if (!image) return undefined
  return normalizeMediaCaption(
    image,
    image.sourceId ? getSourceById(props.locale, image.sourceId) : undefined,
    image.sourceId
      ? getSourceById(props.locale === 'ru' ? 'en' : 'ru', image.sourceId)
      : undefined,
  )
})
const imageSrc = computed(() => {
  const src = props.place.coverImage?.src
  return src
    ? imageDeliveryAttributes(src, config.app.baseURL, 'auto, 360px')
    : undefined
})
</script>

<template>
  <article
    ref="sheet"
    class="map-place-card"
    :class="{ 'map-place-card--expanded': expanded }"
    :aria-label="place.title"
  >
    <div class="map-place-card__top">
      <p class="eyebrow">{{ t(`map.status.${place.historicalStatus}`) }}</p>
      <button
        type="button"
        class="map-place-card__close"
        :aria-label="t('navigation.close')"
        @click="emit('close')"
      >
        ×
      </button>
    </div>
    <div
      ref="body"
      class="map-place-card__body"
      :tabindex="expanded ? 0 : undefined"
      :role="expanded ? 'region' : undefined"
      :aria-labelledby="expanded ? `${detailsId}-title` : undefined"
    >
      <h2 :id="`${detailsId}-title`" ref="title" tabindex="-1">
        {{ place.title }}
      </h2>
      <p class="map-place-card__lead">{{ place.shortDescription }}</p>
      <div :id="detailsId" class="map-place-card__details">
        <p v-if="place.address" class="map-place-card__address">
          {{ place.address }}
        </p>
        <figure
          v-if="place.coverImage && imageSrc"
          class="map-place-card__figure"
        >
          <!-- eslint-disable vue/html-self-closing -->
          <img v-bind="imageSrc" :alt="place.coverImage.alt" loading="lazy" />
          <!-- eslint-enable vue/html-self-closing -->
          <figcaption v-if="caption">
            <span v-if="caption.caption">{{ caption.caption }}</span>
            <small v-if="caption.attribution || caption.sourceLabel">
              {{ caption.attribution
              }}<span v-if="caption.attribution && caption.sourceLabel">
                ·
              </span>
              <WebsiteLink v-if="caption.sourceUrl" :href="caption.sourceUrl">{{
                caption.sourceLabel
              }}</WebsiteLink>
              <template v-else>{{ caption.sourceLabel }}</template>
            </small>
          </figcaption>
        </figure>
        <p v-if="place.locationNote" class="map-place-card__note">
          {{ place.locationNote }}
        </p>
        <p v-else-if="place.historicalNote" class="map-place-card__note">
          {{ place.historicalNote }}
        </p>
      </div>
    </div>
    <div class="map-place-card__actions">
      <NuxtLink
        class="map-place-card__link editorial-link"
        :to="localePath(`/places/${place.slug}`)"
      >
        {{ t('map.readMore') }} <span aria-hidden="true">→</span>
      </NuxtLink>
      <button
        type="button"
        class="map-place-card__toggle"
        :aria-expanded="expanded"
        :aria-controls="detailsId"
        @click="toggleDetails"
      >
        {{ t(expanded ? 'map.collapseDetails' : 'map.expandDetails') }}
        <svg
          class="map-place-card__chevron"
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 16 16"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
    </div>
  </article>
</template>

<style scoped>
.map-place-card {
  position: absolute;
  z-index: 8;
  top: 1.25rem;
  right: 1.25rem;
  width: min(24rem, calc(100% - 2.5rem));
  max-height: calc(100% - 2.5rem);
  overflow-y: auto;
  border: var(--border-rule);
  padding: 1.2rem 1.35rem 1.35rem;
  background: var(--color-surface);
  box-shadow: var(--map-panel-shadow, 0 4px 18px rgb(28 27 25 / 13%));
}
.map-place-card__top {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}
.map-place-card__body,
.map-place-card__details,
.map-place-card__actions {
  display: contents;
}
.map-place-card__toggle {
  display: none;
}
.map-place-card .eyebrow {
  margin: 0.45rem 0 0;
}
.map-place-card__close {
  display: grid;
  flex: none;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 0;
  background: transparent;
  color: var(--color-ink);
  font-size: 1.8rem;
  line-height: 1;
}
.map-place-card h2 {
  margin: 0.5rem 0 0.8rem;
  font-size: clamp(1.5rem, 2.4vw, 2.1rem);
}
.map-place-card__close:hover {
  color: var(--color-accent-hover);
}
.map-place-card__close:active {
  background: var(--color-bg);
}
.map-place-card__lead {
  margin: 0 0 0.75rem;
  line-height: 1.5;
}
.map-place-card__address,
.map-place-card__note {
  margin: 0.6rem 0 0;
  color: var(--color-muted);
  font-size: var(--text-body-sm);
  line-height: 1.45;
}
.map-place-card__figure {
  margin: 1rem 0 0;
}
.map-place-card__figure img {
  display: block;
  width: 100%;
  max-height: 12rem;
  object-fit: contain;
  background: var(--color-bg);
}
.map-place-card__figure figcaption {
  display: grid;
  gap: 0.25rem;
  margin-top: 0.4rem;
  font-size: var(--text-caption);
  line-height: 1.35;
}
.map-place-card__figure small {
  color: var(--color-muted);
  font-size: inherit;
}
.map-place-card__link {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 0.35rem;
  margin-top: 1rem;
  border-bottom: 1px solid var(--color-accent);
  color: var(--color-accent);
  font-weight: 700;
  text-decoration: none;
}
@media (max-width: 850px) {
  .map-place-card {
    top: auto;
    right: 0.75rem;
    bottom: 2.75rem;
    left: 0.75rem;
    width: auto;
    max-height: min(48%, 27rem);
    padding: 0.8rem 1rem 1rem;
  }
  .map-place-card__figure img {
    max-height: 8rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .map-place-card {
    scroll-behavior: auto;
  }
}
@media (max-width: 600px) {
  .map-place-card {
    display: flex;
    flex-direction: column;
    bottom: 3.5rem;
    max-height: calc(100% - 6rem);
    overflow: hidden;
    padding: 0.5rem 0.85rem;
    overflow-wrap: anywhere;
  }
  .map-place-card .eyebrow {
    min-width: 0;
  }
  .map-place-card__link,
  .map-place-card__toggle {
    max-width: 100%;
  }
  .map-place-card__top,
  .map-place-card__actions {
    flex: none;
  }
  .map-place-card__body {
    display: block;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .map-place-card h2 {
    margin: 0.15rem 0 0.5rem;
    font-size: 1.375rem;
    line-height: 1.1;
  }
  .map-place-card__lead {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    margin-bottom: 0.5rem;
    font-size: var(--text-body-sm);
    line-height: 1.4;
  }
  .map-place-card__details {
    display: none;
  }
  .map-place-card--expanded .map-place-card__details {
    display: block;
  }
  .map-place-card--expanded .map-place-card__lead {
    display: block;
    overflow: visible;
    -webkit-line-clamp: unset;
  }
  .map-place-card--expanded {
    height: 75%;
    max-height: 75%;
  }
  .map-place-card__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0 0.5rem;
    border-top: var(--border-rule);
    padding-top: 0.25rem;
    font-size: var(--text-body-sm);
  }
  .map-place-card__link {
    margin-top: 0;
  }
  .map-place-card__toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    min-height: 44px;
    border: 0;
    padding: 0;
    background: transparent;
    color: var(--color-muted);
    cursor: pointer;
  }
  .map-place-card__toggle:hover {
    color: var(--color-accent-hover);
  }
  .map-place-card__toggle:active {
    color: var(--color-accent);
  }
  .map-place-card__chevron {
    flex: none;
    width: 0.65rem;
    height: 0.65rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: transform var(--duration-short);
  }
  .map-place-card__toggle[aria-expanded='true'] .map-place-card__chevron {
    transform: rotate(180deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .map-place-card__chevron {
    transition: none;
  }
}
</style>
