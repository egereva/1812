<script setup lang="ts">
import type { Place } from '#shared/types/content'
import { statusLayer } from '~/data/mapPresentation'

const props = defineProps<{ places: Place[] }>()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const hovered = ref(false)
function onPointerEnter(event: PointerEvent) {
  if (event.pointerType === 'mouse') hovered.value = true
}
const apiKey = useRuntimeConfig().public.yandexMapsApiKey
const state = ref<'loading' | 'ready' | 'missing' | 'error'>(
  apiKey ? 'loading' : 'missing',
)
const counts = computed(() => ({
  total: props.places.length,
  history: props.places.filter(
    (place) => statusLayer[place.historicalStatus] === '1812',
  ).length,
  memory: props.places.filter(
    (place) => statusLayer[place.historicalStatus] === 'memory',
  ).length,
}))
</script>

<template>
  <div
    class="home-map-preview"
    :aria-label="t('home.map.summary', counts)"
    role="group"
    @pointerenter="onPointerEnter"
    @pointerleave="hovered = false"
  >
    <ClientOnly>
      <HomepageMapCanvas
        v-if="apiKey"
        :places="places"
        :locale="locale === 'en' ? 'en' : 'ru'"
        :api-key="apiKey"
        :hovered="hovered"
        @state="state = $event"
      />
      <p v-if="state !== 'ready'" class="home-map-preview__status">
        {{ state === 'loading' ? t('map.loading') : t('home.map.fallback') }}
      </p>
      <template #fallback>
        <p class="home-map-preview__status">{{ t('home.map.fallback') }}</p>
      </template>
    </ClientOnly>
    <NuxtLink
      class="home-map-preview__link"
      :class="{ 'home-map-preview__link--ready': state === 'ready' }"
      :to="localePath('/map')"
      :aria-label="t('home.map.previewLink')"
    />
  </div>
</template>

<style scoped>
.home-map-preview {
  position: relative;
  height: clamp(20rem, 26vw, 24rem);
  overflow: hidden;
  background: var(--color-surface);
  border: var(--border-rule);
}
.home-map-preview__status {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: var(--space-8);
  background: var(--color-bg);
  color: var(--color-muted);
  font-size: var(--text-caption);
  text-align: center;
  pointer-events: none;
}
.home-map-preview__link {
  position: absolute;
  z-index: 1;
  inset: 0;
  cursor: pointer;
  touch-action: pan-y;
}
.home-map-preview__link--ready {
  /* Leave both bottom corners free for Yandex attribution and its links. */
  bottom: 56px;
}
.home-map-preview__link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -4px;
}
@media (max-width: 37.5rem) {
  .home-map-preview {
    height: 20rem;
  }
}
</style>
