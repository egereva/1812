<script setup lang="ts">
import { getPlaces } from '#shared/content/index'
import type { Place } from '#shared/types/content'
import MapPlaceCard from '~/components/MapPlaceCard.vue'
import {
  getMapPlaces,
  parseMapLayer,
  resolveMapPlace,
  statusLayer,
  type MapLayer,
} from '~/data/mapPresentation'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const places = computed(() => getPlaces(locale.value))
const requestedPlace = computed(() =>
  resolveMapPlace(places.value, route.query.place),
)
const selectedPlace = computed(() => requestedPlace.value)
const layer = computed<MapLayer>(() => {
  if (route.query.place !== undefined && !requestedPlace.value) return 'all'
  const fromUrl = parseMapLayer(route.query.layer)
  if (
    requestedPlace.value &&
    fromUrl !== 'all' &&
    statusLayer[requestedPlace.value.historicalStatus] !== fromUrl
  )
    return statusLayer[requestedPlace.value.historicalStatus]
  return fromUrl
})
const visiblePlaces = computed(() => getMapPlaces(places.value, layer.value))
const mapState = ref<'loading' | 'ready' | 'missing' | 'error'>('loading')
const card = ref<InstanceType<typeof MapPlaceCard> | null>(null)
const layers: MapLayer[] = ['all', '1812', 'memory']
const mapKey = computed(() => String(config.public.yandexMapsApiKey || ''))

function navigate(place: Place | undefined, nextLayer: MapLayer) {
  return router.push({
    path: route.path,
    query: {
      ...(nextLayer === 'all' ? {} : { layer: nextLayer }),
      ...(place ? { place: place.slug } : {}),
    },
  })
}
function changeLayer(nextLayer: MapLayer) {
  const selected = selectedPlace.value
  const keep =
    selected &&
    (nextLayer === 'all' ||
      statusLayer[selected.historicalStatus] === nextLayer)
  void navigate(keep ? selected : undefined, nextLayer)
}
async function selectPlace(slug: string, fromKeyboard = false) {
  const place = resolveMapPlace(places.value, slug)
  if (!place) return
  await navigate(place, layer.value)
  if (fromKeyboard) {
    await nextTick()
    card.value?.focusTitle()
  }
}
function closePlace() {
  const title = selectedPlace.value?.title
  void navigate(undefined, layer.value).then(async () => {
    await nextTick()
    const marker = [
      ...document.querySelectorAll<HTMLElement>('.map-marker'),
    ].find((item) => item.title === title)
    const returnTarget =
      marker ??
      document.querySelector<HTMLElement>('.map-marker-group') ??
      document.querySelector<HTMLElement>('.map-page__index summary')
    returnTarget?.focus()
  })
}
function onEscape(event: KeyboardEvent) {
  if (!selectedPlace.value) return
  event.stopPropagation()
  closePlace()
}
useHead(() => ({ title: `${t('navigation.map')} — 1812` }))
useSeoMeta({ description: () => t('map.intro') })
</script>

<template>
  <article class="map-page">
    <header class="map-page__heading wide-container">
      <div>
        <p class="eyebrow">{{ t('map.kicker') }}</p>
        <h1>{{ t('navigation.map') }}</h1>
        <p>{{ t('map.intro') }}</p>
      </div>
      <p class="map-page__count">
        {{ t('map.count', { count: places.length }) }}
      </p>
    </header>
    <div class="map-page__toolbar wide-container">
      <div class="map-page__layers" role="group" :aria-label="t('map.layers')">
        <button
          v-for="item in layers"
          :key="item"
          type="button"
          :aria-pressed="layer === item"
          @click="changeLayer(item)"
        >
          {{ t(`map.layer.${item}`) }}
          <span aria-hidden="true">{{
            item === 'all' ? 13 : item === '1812' ? 6 : 7
          }}</span>
        </button>
      </div>
      <p class="map-page__current">
        {{ t('map.currentLayer') }}
        <strong>{{ t(`map.layer.${layer}`) }}</strong>
      </p>
    </div>
    <section
      class="map-page__experience wide-container"
      :aria-label="t('map.canvas')"
    >
      <div class="map-page__frame" @keydown.esc="onEscape">
        <ClientOnly>
          <InteractiveMap
            :places="visiblePlaces"
            :selected-slug="selectedPlace?.slug"
            :locale="locale"
            :api-key="mapKey"
            @select="selectPlace"
            @state="mapState = $event"
          />
        </ClientOnly>
        <div
          v-if="mapState !== 'ready'"
          class="map-page__state"
          :class="{ 'map-page__state--error': mapState !== 'loading' }"
        >
          <p v-if="mapState === 'loading'" role="status">
            {{ t('map.loading') }}
          </p>
          <div v-else class="map-page__fallback">
            <p role="status">{{ t('map.unavailable') }}</p>
            <ol>
              <li v-for="place in places" :key="place.id">
                <NuxtLink :to="localePath(`/places/${place.slug}`)">{{
                  place.title
                }}</NuxtLink>
              </li>
            </ol>
          </div>
        </div>
        <MapPlaceCard
          v-if="selectedPlace"
          ref="card"
          :place="selectedPlace"
          :locale="locale"
          @close="closePlace"
        />
      </div>
      <p class="map-page__sr-status" aria-live="polite">
        {{
          selectedPlace
            ? selectedPlace.title
            : t('map.layerAnnouncement', { layer: t(`map.layer.${layer}`) })
        }}
      </p>
    </section>
    <section
      class="map-page__index wide-container"
      aria-labelledby="map-index-title"
    >
      <details :open="mapState !== 'ready' ? true : undefined">
        <summary id="map-index-title">
          {{ t('map.placesIndex', { count: places.length }) }}
        </summary>
        <ol>
          <li v-for="place in places" :key="place.id">
            <NuxtLink :to="localePath(`/places/${place.slug}`)">{{
              place.title
            }}</NuxtLink>
          </li>
        </ol>
      </details>
    </section>
  </article>
</template>

<style scoped>
.map-page {
  padding: 1.2rem 0 3rem;
}
.map-page__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}
.map-page__heading .eyebrow {
  margin: 0 0 0.25rem;
}
.map-page__heading h1 {
  margin: 0;
  font-size: clamp(2.25rem, 4vw, 3.75rem);
  line-height: 1;
}
.map-page__heading p:not(.eyebrow) {
  margin: 0.35rem 0 0;
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}
.map-page__count {
  flex: none;
  padding-bottom: 0.2rem;
  font-family: var(--font-display);
  font-size: 1.3rem !important;
}
.map-page__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-block: 0.9rem 0.65rem;
}
.map-page__layers {
  display: flex;
  border-top: var(--border-rule);
  border-bottom: var(--border-rule);
}
.map-page__layers button {
  min-height: 44px;
  border: 0;
  border-bottom: 2px solid transparent;
  padding: 0.4rem clamp(0.55rem, 1.7vw, 1.25rem);
  background: transparent;
  color: var(--color-muted);
}
.map-page__layers button[aria-pressed='true'] {
  border-bottom-color: var(--color-accent);
  color: var(--color-accent);
  font-weight: 700;
}
.map-page__layers button span {
  margin-left: 0.3rem;
  font-size: 0.7rem;
  opacity: 0.75;
}
.map-page__current {
  margin: 0;
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}
.map-page__current strong {
  color: var(--color-ink);
}
.map-page__frame {
  position: relative;
  height: clamp(31rem, calc(100svh - 14rem), 52rem);
  overflow: hidden;
  border: var(--border-rule);
  background: #e5e1d8;
}
.map-page__state {
  position: absolute;
  z-index: 6;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: #e5e1d8;
  text-align: center;
}
.map-page__state--error {
  background: linear-gradient(135deg, #eeeae1, #dedbd2);
}
.map-page__state p {
  max-width: 28rem;
  margin: 0;
  color: var(--color-muted);
}
.map-page__fallback {
  width: min(54rem, 100%);
  max-height: 100%;
  overflow: auto;
  border: var(--border-rule);
  padding: 1.5rem;
  background: var(--color-surface);
  text-align: left;
}
.map-page__fallback p {
  max-width: none;
  border-bottom: var(--border-rule);
  padding-bottom: 0.75rem;
}
.map-page__fallback ol {
  columns: 2;
  gap: 2rem;
  margin: 0.75rem 0 0;
  padding-left: 1.5rem;
}
.map-page__fallback li {
  break-inside: avoid;
  padding-block: 0.2rem;
}
.map-page__fallback a {
  display: inline-block;
  padding-block: 0.1rem;
}
.map-page__sr-status {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.map-page__index {
  margin-top: 0.75rem;
}
.map-page__index details {
  border-top: var(--border-rule);
  border-bottom: var(--border-rule);
}
.map-page__index summary {
  width: fit-content;
  min-height: 44px;
  padding: 0.55rem 0;
  color: var(--color-accent);
  font-weight: 700;
  cursor: pointer;
}
.map-page__index ol {
  columns: 3;
  gap: 2rem;
  margin: 0.25rem 0 1rem;
  padding-left: 1.5rem;
}
.map-page__index li {
  break-inside: avoid;
  margin-bottom: 0.35rem;
}
.map-page__index a {
  display: inline-block;
  padding: 0.2rem 0;
}
@media (max-width: 850px) {
  .map-page__frame {
    height: calc(100svh - 13rem);
    min-height: 27rem;
  }
  .map-page__index ol {
    columns: 2;
  }
}
@media (max-width: 600px) {
  .map-page {
    padding-top: 0.7rem;
  }
  .map-page__heading {
    align-items: start;
  }
  .map-page__heading h1 {
    font-size: 2.4rem;
  }
  .map-page__heading p:not(.eyebrow) {
    max-width: 29ch;
    line-height: 1.35;
  }
  .map-page__count,
  .map-page__current {
    display: none;
  }
  .map-page__toolbar {
    margin-block: 0.7rem 0.5rem;
  }
  .map-page__layers {
    width: 100%;
    justify-content: space-between;
  }
  .map-page__layers button {
    flex: 1;
  }
  .map-page__frame {
    height: calc(100svh - 12rem);
    min-height: 25rem;
  }
  .map-page__index ol {
    columns: 1;
  }
  .map-page__fallback {
    padding: 0.75rem 1rem;
  }
  .map-page__fallback ol {
    columns: 1;
  }
}
</style>
