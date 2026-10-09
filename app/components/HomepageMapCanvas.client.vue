<script setup lang="ts">
import type { Place } from '#shared/types/content'
import { statusLayer } from '~/data/mapPresentation'
import { museumIvoryCustomization } from '~/data/homepageMapPalettes'
import approvedMarkerSvg from '../../public/icons/1812-map-marker-filled.svg?raw'
import {
  loadYandexMaps,
  type YMapInstance,
} from '~/utils/yandexMapsLoader.client'

const props = defineProps<{
  places: Place[]
  locale: 'ru' | 'en'
  apiKey: string
  hovered?: boolean
}>()
const emit = defineEmits<{ state: [state: 'ready' | 'missing' | 'error'] }>()
const root = ref<HTMLElement | null>(null)
let map: YMapInstance | undefined
let observer: IntersectionObserver | undefined
let disposed = false
let cameraListener: unknown
let fittedCamera: { center: [number, number]; zoom: number } | undefined
let hoverZoomed = false

function updateHoverCamera() {
  if (disposed || !map || !fittedCamera) return
  if (
    !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
    return
  const zoomed = Boolean(props.hovered)
  if (zoomed === hoverZoomed) return
  hoverZoomed = zoomed
  // Absolute targets replace the current animation; never derive from an in-flight zoom.
  map.setLocation({
    center: [...fittedCamera.center],
    zoom: fittedCamera.zoom + (zoomed ? 0.3 : 0),
    duration: 400,
    easing: 'ease-in-out',
  })
}

function destroyMap() {
  if (map && cameraListener) map.removeChild(cameraListener)
  map?.destroy()
  map = undefined
  cameraListener = undefined
  fittedCamera = undefined
  hoverZoomed = false
}

watch(() => props.hovered, updateHoverCamera)

async function initialize() {
  observer?.disconnect()
  observer = undefined
  if (!props.apiKey) {
    emit('state', 'missing')
    return
  }
  try {
    const api = await loadYandexMaps(
      props.apiKey,
      props.locale === 'ru' ? 'ru_RU' : 'en_RU',
    )
    if (disposed || !root.value || !props.places.length) return
    const lons = props.places.map((place) => place.coordinates.lon)
    const lats = props.places.map((place) => place.coordinates.lat)
    map = new api.YMap(root.value, {
      location: {
        bounds: [
          [Math.min(...lons), Math.min(...lats)],
          [Math.max(...lons), Math.max(...lats)],
        ],
      },
      margin: [40, 32, 48, 32],
      behaviors: [],
      zoomRounding: 'smooth',
    })
    cameraListener = new api.YMapListener({
      onUpdate: ({ location, mapInAction }) => {
        if (disposed || fittedCamera || mapInAction || !location.center) return
        // Save the first settled fitted camera once, before any hover request.
        fittedCamera = {
          center: [location.center[0], location.center[1]],
          zoom: location.zoom,
        }
        updateHoverCamera()
      },
    })
    map.addChild(cameraListener)
    map.addChild(
      new api.YMapDefaultSchemeLayer({
        customization: museumIvoryCustomization,
      }),
    )
    map.addChild(new api.YMapDefaultFeaturesLayer())
    for (const place of props.places) {
      const marker = document.createElement('div')
      marker.className = `home-preview-marker home-preview-marker--${statusLayer[place.historicalStatus]}`
      marker.dataset.placeId = place.id
      marker.dataset.layer = statusLayer[place.historicalStatus]
      marker.setAttribute('aria-hidden', 'true')
      marker.innerHTML = approvedMarkerSvg
      map.addChild(
        new api.YMapMarker(
          { coordinates: [place.coordinates.lon, place.coordinates.lat] },
          marker,
        ),
      )
    }
    emit('state', 'ready')
  } catch {
    destroyMap()
    if (!disposed) emit('state', 'error')
  }
}

onMounted(async () => {
  // Nuxt's client-only wrapper renders its DOM after the mount hook.
  await nextTick()
  if (disposed || !root.value) return
  if (!('IntersectionObserver' in window)) {
    void initialize()
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void initialize()
    },
    { rootMargin: '240px' },
  )
  observer.observe(root.value)
})

onBeforeUnmount(() => {
  disposed = true
  observer?.disconnect()
  observer = undefined
  destroyMap()
})
</script>

<template>
  <div ref="root" class="home-preview-canvas" />
</template>

<style>
.home-preview-canvas {
  position: absolute;
  z-index: 0;
  inset: 0;
  touch-action: pan-y;
}
.home-preview-marker {
  width: 26px;
  height: 31px;
  transform: translate(-50%, -100%);
  color: var(--color-ink);
  pointer-events: none;
}
.home-preview-marker--memory {
  color: var(--color-accent);
}
.home-preview-marker svg {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
