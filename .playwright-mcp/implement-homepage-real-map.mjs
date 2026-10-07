import { readFileSync, writeFileSync } from 'node:fs'
const file = 'app/pages/index.vue'
let text = readFileSync(file, 'utf8')
text = text.replace("import { getReadyHeroSlides }", "import { getHomepageMapPresentation } from '../data/homepageMapPresentation'\nimport { getReadyHeroSlides }")
text = text.replace('const places = computed(() => mapPlaces.value.slice(0, 3))', `const mapScene = computed(() => getHomepageMapPresentation(mapPlaces.value))
const places = computed(() =>
  ['fili-village', 'kutuzov-hut', 'intercession-church-fili'].flatMap((id) =>
    mapPlaces.value.filter((place) => place.id === id),
  ),
)`)
text = text.replace("{{ t('home.map.cta') }} <span aria-hidden=\"true\">↗</span>", "{{ t('home.map.cta') }} <span aria-hidden=\"true\">→</span>")
const start = text.indexOf('          <div class="home-map__diagram"')
const end = text.indexOf('          <ul class="home-map__places">', start)
text = text.slice(0, start) + `          <div class="home-map__diagram">
            <svg viewBox="0 0 640 320" role="img" aria-labelledby="home-map-summary" aria-describedby="home-map-separation" focusable="false">
              <title id="home-map-summary">{{ t('home.map.summary', mapScene.counts) }}</title>
              <g aria-hidden="true">
                <path class="home-map__grid" d="M40 40H600M40 280H600" />
                <line v-for="point in mapScene.points.filter((p) => p.separated)" :key="point.id" class="home-map__guide" :x1="point.anchorX" :y1="point.anchorY" :x2="point.x" :y2="point.y" />
                <circle v-for="point in mapScene.points" :key="point.id" class="home-map__point" :class="{ 'home-map__point--memory': point.layer === 'memory' }" :data-place-id="point.id" :data-layer="point.layer" :cx="point.x" :cy="point.y" r="5.5" />
              </g>
            </svg>
            <span class="home-map__north" aria-hidden="true">{{ t('home.map.north') }} ↑</span>
          </div>
          <p id="home-map-separation" class="home-map__caption">{{ t('home.map.separation') }}</p>
` + text.slice(end)
text = text.replace('<li v-for="place in places" :key="place.id">{{ place.title }}</li>', `<li v-for="place in places" :key="place.id">
              <NuxtLink :to="localePath(\`/places/\${place.slug}\`)">{{ place.title }}</NuxtLink>
            </li>`)
const cssStart = text.indexOf('.home-map__diagram {')
const cssEnd = text.indexOf('.home-map__places {', cssStart)
text = text.slice(0, cssStart) + `.home-map {
  min-height: 0;
}
.home-map__diagram {
  position: relative;
  aspect-ratio: 2 / 1;
  pointer-events: none;
}
.home-map__diagram svg {
  display: block;
  width: 100%;
  height: auto;
}
.home-map__grid {
  fill: none;
  stroke: var(--color-border);
  stroke-width: 1;
  opacity: 0.4;
}
.home-map__guide {
  stroke: var(--color-muted);
  stroke-width: 0.8;
  stroke-dasharray: 2 2;
  opacity: 0.5;
}
.home-map__point {
  fill: var(--color-ink);
}
.home-map__point--memory {
  fill: var(--color-accent);
}
.home-map__north {
  position: absolute;
  top: 0;
  left: 6.25%;
  color: var(--color-muted);
  font-size: 0.75rem;
}
.home-map__caption {
  margin: var(--space-2) 0 var(--space-4);
  color: var(--color-muted);
  font-size: var(--text-caption);
}
` + text.slice(cssEnd)
text = text.replace('  padding-block: var(--space-3);\n  font-family: var(--font-display);\n  font-size: clamp(1.1rem', '  font-family: var(--font-display);\n  font-size: clamp(1.1rem')
text = text.replace('@media (max-width: 56.25rem)', `.home-map__places a {
  display: flex;
  min-height: 2.75rem;
  align-items: center;
  padding-block: var(--space-3);
  color: var(--color-ink);
  text-decoration: underline;
  text-decoration-color: var(--color-border);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
}
.home-map__places a:hover,
.home-map__places a:focus-visible {
  text-decoration-color: currentColor;
}
@media (max-width: 56.25rem)`)
text = text.replace(/  \.home-map__diagram \{\s*height: 12rem;\s*\}/, '')
text = text.replace(/  \.home-map__division \{\s*display: none;\s*\}/, '')
text = text.replace(/  \.home-map__diagram \{\s*height: 10rem;\s*\}/, '')
text = text.replace(/  \.home-map__count \{\s*font-size: 2.25rem;\s*\}/, '')
writeFileSync(file, text)
for (const locale of ['ru', 'en']) {
  const path = `i18n/locales/${locale}.json`
  const messages = JSON.parse(readFileSync(path, 'utf8'))
  delete messages.home.map.examples
  Object.assign(messages.home.map, locale === 'ru' ? {
    summary: 'Схема расположения {total} памятных мест: {history} связаны с событиями 1812 года, {memory} — с памятью о войне.',
    separation: 'В плотной группе точки разнесены для читаемости.',
    north: 'С',
  } : {
    summary: 'Location diagram of {total} places: {history} associated with 1812 and {memory} with the memory of the war.',
    separation: 'Points in the dense group are separated for legibility.',
    north: 'N',
  })
  writeFileSync(path, JSON.stringify(messages, null, 2) + '\n')
}
