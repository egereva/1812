<script setup lang="ts">
import type { Place } from '#shared/types/content'
import { getSourceById } from '#shared/content/index'
import { normalizeMediaCaption } from '~/utils/mediaCaption'

const props = defineProps<{ place: Place; locale: 'ru' | 'en' }>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const title = useTemplateRef<HTMLElement>('title')
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
  return src ? `${config.app.baseURL.replace(/\/$/, '')}${src}` : undefined
})
</script>

<template>
  <article class="map-place-card" :aria-label="place.title">
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
    <h2 ref="title" tabindex="-1">{{ place.title }}</h2>
    <p class="map-place-card__lead">{{ place.shortDescription }}</p>
    <p v-if="place.address" class="map-place-card__address">
      {{ place.address }}
    </p>
    <figure v-if="place.coverImage && imageSrc" class="map-place-card__figure">
      <!-- eslint-disable vue/html-self-closing -->
      <img :src="imageSrc" :alt="place.coverImage.alt" loading="lazy" />
      <!-- eslint-enable vue/html-self-closing -->
      <figcaption v-if="caption">
        <span v-if="caption.caption">{{ caption.caption }}</span>
        <small v-if="caption.attribution || caption.sourceLabel">
          {{ caption.attribution
          }}<span v-if="caption.attribution && caption.sourceLabel"> · </span>
          <a v-if="caption.sourceUrl" :href="caption.sourceUrl">{{
            caption.sourceLabel
          }}</a>
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
    <NuxtLink
      class="map-place-card__link"
      :to="localePath(`/places/${place.slug}`)"
    >
      {{ t('map.readMore') }} <span aria-hidden="true">→</span>
    </NuxtLink>
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
  box-shadow: 0 4px 18px rgb(28 27 25 / 13%);
}
.map-place-card__top {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
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
    bottom: 0.75rem;
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
</style>
