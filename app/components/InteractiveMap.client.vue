<script setup lang="ts">
import type { Place } from '#shared/types/content'
import { museumGraphiteCustomization } from '~/data/mapPalettes'
import {
  collapsedGroupRepresentatives,
  groupOverlappingPlaces,
  statusLayer,
} from '~/data/mapPresentation'
import approvedMarkerSvg from '../../public/icons/1812-map-marker-filled.svg?raw'
import {
  loadYandexMaps,
  type YMapInstance,
  type YMaps3Api,
} from '~/utils/yandexMapsLoader.client'

const props = defineProps<{
  places: Place[]
  selectedSlug?: string
  locale: 'ru' | 'en'
  apiKey: string
}>()
const emit = defineEmits<{
  select: [slug: string, fromKeyboard: boolean]
  state: [state: 'ready' | 'missing' | 'error']
}>()
const root = ref<HTMLElement | null>(null)
const { t } = useI18n()
let api: YMaps3Api | undefined
let map: YMapInstance | undefined
let markerEntities: { entity: unknown; deactivate: () => void }[] = []
let mapListener: unknown
let zoom = 13
let activeGroup: string | undefined
let disposed = false
const groupMembers = ref<Place[]>([])

function closeGroup() {
  if (!activeGroup) return
  activeGroup = undefined
  groupMembers.value = []
  drawMarkers()
}

function fitPlaces() {
  if (!map || !props.places.length) return
  if (props.places.length === 1) {
    const { lon, lat } = props.places[0]!.coordinates
    map.setLocation({ center: [lon, lat], zoom: 15 })
    return
  }
  const lons = props.places.map((place) => place.coordinates.lon)
  const lats = props.places.map((place) => place.coordinates.lat)
  const padLon = Math.max(0.002, (Math.max(...lons) - Math.min(...lons)) * 0.12)
  const padLat = Math.max(0.002, (Math.max(...lats) - Math.min(...lats)) * 0.12)
  map.setLocation({
    bounds: [
      [Math.min(...lons) - padLon, Math.min(...lats) - padLat],
      [Math.max(...lons) + padLon, Math.max(...lats) + padLat],
    ],
  })
}

function focusPlace(place: Place) {
  if (!map) return
  const mobile = window.matchMedia('(max-width: 700px)').matches
  const { lon, lat } = place.coordinates
  map.setLocation({
    center: mobile ? [lon, lat - 0.0012] : [lon + 0.0015, lat],
    zoom: Math.max(zoom, 15),
  })
}

function markerButton(
  place: Place,
  offset?: { x: number; y: number },
  activate?: (event: MouseEvent) => void,
) {
  const wrapper = document.createElement('div')
  wrapper.className = 'map-marker-position'
  if (offset) {
    wrapper.style.setProperty('--fan-x', `${offset.x}px`)
    wrapper.style.setProperty('--fan-y', `${offset.y}px`)
  }
  const button = document.createElement('button')
  button.type = 'button'
  button.className = `map-marker map-marker--${statusLayer[place.historicalStatus]}`
  if (place.slug === props.selectedSlug) button.classList.add('is-selected')
  button.setAttribute(
    'aria-label',
    t('map.markerLabel', {
      title: place.title,
      status: t(`map.status.${place.historicalStatus}`),
      precision: t(`map.precision.${place.locationPrecision}`),
    }),
  )
  button.title = place.title
  button.setAttribute('aria-pressed', String(place.slug === props.selectedSlug))
  const glyph = new DOMParser().parseFromString(
    approvedMarkerSvg,
    'image/svg+xml',
  ).documentElement
  glyph.classList.add('map-marker__glyph')
  glyph.setAttribute('aria-hidden', 'true')
  glyph.setAttribute('focusable', 'false')
  button.append(glyph)
  button.addEventListener('click', (event) => {
    event.stopPropagation()
    if (activate) activate(event)
    else emit('select', place.slug, event.detail === 0)
  })
  button.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      closeGroup()
    }
  })
  wrapper.append(button)
  return wrapper
}

function addMarker(place: Place, element: HTMLElement, selected = false) {
  if (!api || !map) return
  const marker = new api.YMapMarker(
    {
      coordinates: [place.coordinates.lon, place.coordinates.lat],
      zIndex: selected ? 200 : 100,
    },
    element,
  )
  const button = element.querySelector('button')!
  const interactions = new AbortController()
  const options = { signal: interactions.signal }
  const setStacking = (active: boolean) =>
    marker.update({ zIndex: selected ? 200 : active ? 150 : 100 })
  button.addEventListener('pointerenter', () => setStacking(true), options)
  button.addEventListener(
    'pointerleave',
    () => setStacking(button.matches(':focus-visible')),
    options,
  )
  button.addEventListener('focus', () => setStacking(true), options)
  button.addEventListener(
    'blur',
    () => setStacking(button.matches(':hover')),
    options,
  )
  map.addChild(marker)
  markerEntities.push({
    entity: marker,
    deactivate: () => interactions.abort(),
  })
}

function drawMarkers() {
  if (!map || !api) return
  for (const marker of markerEntities) {
    // Detaching a focused button emits blur; do not update a detaching YMapMarker.
    marker.deactivate()
    map.removeChild(marker.entity)
  }
  markerEntities = []
  const groups = groupOverlappingPlaces(props.places, zoom)
  const currentGroup = groups.find((group) => group[0]?.id === activeGroup)
  if (activeGroup && !currentGroup) {
    activeGroup = undefined
    groupMembers.value = []
  }
  for (const group of groups) {
    if (group.length === 1) {
      const place = group[0]!
      addMarker(place, markerButton(place), place.slug === props.selectedSlug)
      continue
    }
    if (group[0]!.id !== activeGroup) {
      const anchor = group[0]!
      for (const { layer, place, offset } of collapsedGroupRepresentatives(
        group,
        props.selectedSlug,
      )) {
        const wrapper = markerButton(place, offset, async (event) => {
          activeGroup = anchor.id
          groupMembers.value = group
          drawMarkers()
          if (event.detail === 0) {
            await nextTick()
            document
              .querySelector<HTMLElement>('.map-member-chooser button')
              ?.focus()
          }
        })
        const button = wrapper.querySelector('button')!
        button.classList.add('map-marker-group')
        button.removeAttribute('aria-pressed')
        button.setAttribute('aria-expanded', 'false')
        button.setAttribute(
          'aria-label',
          `${t(`map.layer.${layer}`)}. ${t('map.overlapLabel', {
            titles: group.map((member) => member.title).join(', '),
          })}`,
        )
        addMarker(anchor, wrapper, place.slug === props.selectedSlug)
      }
      continue
    }
    const radius = group.length > 4 ? 72 : 58
    group.forEach((place, index) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * index) / group.length
      addMarker(
        place,
        markerButton(place, {
          x: Math.round(Math.cos(angle) * radius),
          y: Math.round(Math.sin(angle) * radius),
        }),
        place.slug === props.selectedSlug,
      )
    })
  }
}

function selectFromChooser(place: Place, event: MouseEvent) {
  emit('select', place.slug, event.detail === 0)
}

function onMapPointer(event: PointerEvent) {
  if (!(event.target as HTMLElement).closest('.map-marker, .map-marker-group'))
    closeGroup()
}

onMounted(async () => {
  if (!props.apiKey) {
    emit('state', 'missing')
    return
  }
  try {
    api = await loadYandexMaps(
      props.apiKey,
      props.locale === 'ru' ? 'ru_RU' : 'en_RU',
    )
    if (disposed || !root.value) return
    map = new api.YMap(root.value, {
      location: { center: [37.522, 55.741], zoom },
      theme: 'dark',
    })
    map.addChild(
      new api.YMapDefaultSchemeLayer({
        customization: museumGraphiteCustomization,
      }),
    )
    map.addChild(new api.YMapDefaultFeaturesLayer())
    mapListener = new api.YMapListener({
      onUpdate: ({ location }) => {
        if (Math.abs(location.zoom - zoom) < 0.15) return
        zoom = location.zoom
        drawMarkers()
      },
    })
    map.addChild(mapListener)
    root.value.addEventListener('pointerdown', onMapPointer)
    fitPlaces()
    if (props.selectedSlug) {
      const selected = props.places.find(
        (place) => place.slug === props.selectedSlug,
      )
      if (selected) focusPlace(selected)
    }
    const selectedGroup = groupOverlappingPlaces(props.places, zoom).find(
      (group) =>
        group.length > 1 &&
        group.some((place) => place.slug === props.selectedSlug),
    )
    if (selectedGroup) {
      activeGroup = selectedGroup[0]!.id
      groupMembers.value = selectedGroup
    }
    drawMarkers()
    emit('state', 'ready')
  } catch {
    if (!disposed) emit('state', 'error')
  }
})

watch(
  () => props.places,
  () => {
    closeGroup()
    fitPlaces()
    drawMarkers()
  },
)
watch(
  () => props.selectedSlug,
  (slug) => {
    if (!slug) {
      closeGroup()
      drawMarkers()
      return
    }
    const selected = props.places.find((place) => place.slug === slug)
    if (!selected) return
    focusPlace(selected)
    const group = groupOverlappingPlaces(props.places, zoom).find(
      (items) => items.length > 1 && items.some((place) => place.slug === slug),
    )
    activeGroup = group?.[0]?.id
    groupMembers.value = group ?? []
    drawMarkers()
  },
)
watch(
  () => props.locale,
  () => drawMarkers(),
)
onBeforeUnmount(() => {
  disposed = true
  root.value?.removeEventListener('pointerdown', onMapPointer)
  for (const marker of markerEntities) marker.deactivate()
  map?.destroy()
  markerEntities = []
  map = undefined
})
</script>

<template>
  <div ref="root" class="map-canvas" :aria-label="t('map.canvas')" />
  <div v-if="groupMembers.length && !selectedSlug" class="map-member-chooser">
    <p>{{ t('map.nearby') }}</p>
    <button
      v-for="place in groupMembers"
      :key="place.id"
      type="button"
      :aria-current="selectedSlug === place.slug ? 'true' : undefined"
      @click="selectFromChooser(place, $event)"
    >
      {{ place.title }}
    </button>
    <button
      type="button"
      :aria-label="t('navigation.close')"
      @click="closeGroup"
    >
      ×
    </button>
  </div>
</template>

<style>
.map-canvas {
  position: absolute;
  inset: 0;
}
.map-marker-position {
  position: relative;
  width: 0;
  height: 0;
  transform: translate(var(--fan-x, 0px), var(--fan-y, 0px));
}
.map-marker {
  position: absolute;
  display: grid;
  width: 56px;
  height: 64px;
  place-items: center;
  transform: translate(-50%, -100%);
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--map-marker-history, var(--color-ink));
  cursor: pointer;
}
.map-marker__glyph {
  position: absolute;
  bottom: 0;
  /* The approved body occupies 50 of the 64 viewBox units: 32px visible. */
  width: 40.96px;
  height: auto;
  overflow: visible;
  pointer-events: none;
  transform-origin: 50% 94%;
  transition: transform 180ms ease;
}
.map-marker__glyph circle,
.map-marker__glyph path {
  transition:
    fill 180ms ease,
    stroke 180ms ease;
}
.map-marker--memory {
  color: var(--map-marker-memory, var(--color-accent));
}
.map-marker__glyph circle {
  fill: var(--map-marker-medallion, #f4efe4);
}
.map-marker__glyph path:nth-of-type(4) {
  stroke: var(--map-marker-medallion, #f4efe4);
}
.map-marker:hover .map-marker__glyph,
.map-marker:focus-visible .map-marker__glyph {
  transform: scale(1.125);
}
.map-marker:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 1px;
  border-radius: 4px;
}
.map-marker.is-selected .map-marker__glyph {
  transform: scale(1.3125);
}
.map-marker.is-selected .map-marker__glyph circle {
  fill: currentColor;
}
.map-marker.is-selected .map-marker__glyph path:nth-of-type(2) {
  fill: var(--map-marker-medallion, #f4efe4);
  stroke: var(--map-marker-medallion, #f4efe4);
}
.map-marker.is-selected .map-marker__glyph path:nth-of-type(3) {
  stroke: var(--map-marker-medallion, #f4efe4);
}
.map-marker.is-selected .map-marker__glyph path:nth-of-type(4) {
  stroke: currentColor;
}
/* Yandex markers are recreated on selection; start the same SVG in its normal state. */
@starting-style {
  .map-marker.is-selected .map-marker__glyph {
    transform: scale(1);
  }
  .map-marker.is-selected .map-marker__glyph circle {
    fill: var(--map-marker-medallion, #f4efe4);
  }
  .map-marker.is-selected .map-marker__glyph path:nth-of-type(2) {
    fill: currentColor;
    stroke: currentColor;
  }
  .map-marker.is-selected .map-marker__glyph path:nth-of-type(3) {
    stroke: currentColor;
  }
  .map-marker.is-selected .map-marker__glyph path:nth-of-type(4) {
    stroke: var(--map-marker-medallion, #f4efe4);
  }
}
.map-member-chooser {
  position: absolute;
  z-index: 5;
  right: 1rem;
  bottom: 1rem;
  display: grid;
  max-width: min(21rem, calc(100% - 2rem));
  max-height: 11rem;
  overflow: auto;
  border: var(--border-rule);
  padding: 0.75rem 1rem;
  background: var(--color-surface);
  box-shadow: var(--map-panel-shadow, 0 2px 9px rgb(28 27 25 / 12%));
}
.map-member-chooser p {
  margin: 0 0 0.25rem;
  color: var(--color-muted);
  font-size: var(--text-caption);
}
.map-member-chooser button {
  min-height: 44px;
  border: 0;
  border-top: var(--border-rule);
  padding: 0.25rem 0;
  background: transparent;
  color: var(--color-ink);
  text-align: left;
}
.map-member-chooser button:hover {
  color: var(--color-accent-hover);
}
.map-member-chooser button:active {
  background: var(--color-bg);
}
.map-member-chooser button[aria-current='true'] {
  color: var(--color-accent);
  font-weight: 700;
}
@media (max-width: 700px) {
  .map-member-chooser {
    top: 0.5rem;
    right: 0.5rem;
    bottom: auto;
    max-width: min(19rem, calc(100% - 1rem));
  }
}
@media (prefers-reduced-motion: reduce) {
  .map-marker__glyph,
  .map-marker__glyph circle,
  .map-marker__glyph path {
    transition: none;
  }
}
</style>
