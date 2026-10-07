<script setup lang="ts">
import {
  getTimelineEvents,
  getDictionaryEntries,
  getSourceById,
} from '#shared/content/index'
import { formatTimelineDates } from '~/utils/timelineDates'
import { normalizeMediaCaption } from '~/utils/mediaCaption'
import {
  getHomepageTimelineEvents,
  homepageTimelineInitialEventId,
} from '~/data/homepageTimelineMedia'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const reducedMotion = ref(false)
let motionQuery: MediaQueryList | undefined
function updateMotion(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches
}
onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', updateMotion)
})
onBeforeUnmount(() => motionQuery?.removeEventListener('change', updateMotion))
const events = computed(() =>
  getHomepageTimelineEvents(
    getTimelineEvents(locale.value),
    getDictionaryEntries(locale.value),
    locale.value,
  ).map((event) => {
    const artwork = event.artwork
    return {
      ...event,
      artwork,
      caption: artwork
        ? normalizeMediaCaption(
            artwork,
            getSourceById(locale.value, artwork.sourceId ?? ''),
            getSourceById(
              locale.value === 'ru' ? 'en' : 'ru',
              artwork.sourceId ?? '',
            ),
          )
        : undefined,
    }
  }),
)
const activeId = ref<string>(homepageTimelineInitialEventId)
function selectOnPointerEnter(event: PointerEvent, id: string) {
  const sequence = (event.currentTarget as HTMLElement).closest('ol')
  // Scrolling a focused point under a stationary cursor must preserve selection.
  if (sequence?.querySelector('button:focus-visible')) return
  activeId.value = id
}
function selectOnPointerMove(event: PointerEvent, id: string) {
  if (event.movementX || event.movementY) activeId.value = id
}
const active = computed(
  () =>
    events.value.find((event) => event.id === activeId.value) ??
    events.value[0]!,
)
const shortDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'ru-RU', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year!, month! - 1, day!)))
}
const activeDates = computed(() =>
  formatTimelineDates(
    active.value.dateOldStyle,
    active.value.dateEndOldStyle,
    locale.value,
  ),
)
function navigate(event: KeyboardEvent, index: number) {
  const count = events.value.length
  const next =
    event.key === 'ArrowRight'
      ? (index + 1) % count
      : event.key === 'ArrowLeft'
        ? (index + count - 1) % count
        : event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? count - 1
            : undefined
  if (next === undefined) return
  event.preventDefault()
  const button = (event.currentTarget as HTMLElement)
    .closest('ol')
    ?.querySelectorAll<HTMLButtonElement>('button')[next]
  button?.focus({ preventScroll: true })
  button?.scrollIntoView({
    block: 'nearest',
    inline: 'nearest',
    behavior: 'instant',
  })
}
function revealStripItem(event: FocusEvent) {
  const link = event.currentTarget as HTMLElement
  link.scrollIntoView({
    block: 'nearest',
    inline: 'nearest',
    behavior: 'instant',
  })
}
function hideLeavingEvent(element: Element) {
  element.setAttribute('inert', '')
  element.setAttribute('aria-hidden', 'true')
}
</script>

<template>
  <section class="home-timeline" aria-labelledby="timeline-title">
    <div class="page-container">
      <header class="home-timeline__heading">
        <div>
          <p class="eyebrow">{{ t('home.timeline.kicker') }}</p>
          <h2 id="timeline-title">{{ t('navigation.timeline') }}</h2>
        </div>
        <p>{{ t('home.timeline.description') }}</p>
      </header>
      <ol
        class="home-timeline__sequence"
        :aria-label="t('navigation.timeline')"
      >
        <li v-for="(event, index) in events" :key="event.id">
          <button
            type="button"
            :data-event-id="event.id"
            :aria-pressed="active.id === event.id"
            aria-controls="home-timeline-active"
            @pointerenter="selectOnPointerEnter($event, event.id)"
            @pointermove="selectOnPointerMove($event, event.id)"
            @focus="activeId = event.id"
            @click="activeId = event.id"
            @keydown="navigate($event, index)"
          >
            <span class="home-timeline__point" aria-hidden="true" />
            <time
              :datetime="event.dateOldStyle"
              :aria-label="
                formatTimelineDates(event.dateOldStyle, undefined, locale)
                  .startLabel
              "
              >{{ shortDate(event.dateOldStyle) }}</time
            >
            <span class="home-timeline__point-title">{{
              event.previewTitle
            }}</span>
          </button>
        </li>
      </ol>
      <div
        id="home-timeline-active"
        class="home-timeline__active"
        role="region"
        :aria-labelledby="`home-timeline-title-${active.id}`"
        :data-active-id="active.id"
      >
        <Transition
          name="artwork"
          :css="!reducedMotion"
          @before-leave="hideLeavingEvent"
        >
          <div
            :key="active.id"
            class="home-timeline__composition"
            :class="{ 'home-timeline__composition--text': !active.artwork }"
          >
            <div class="home-timeline__story">
              <time class="home-timeline__date" :datetime="active.dateOldStyle"
                >{{ activeDates.startText
                }}<template v-if="activeDates.endText"
                  >–{{ activeDates.endText }}</template
                ></time
              >
              <h3 :id="`home-timeline-title-${active.id}`">
                <NuxtLink :to="localePath(`/timeline/${active.slug}`)"
                  >{{ active.title }}
                  <span aria-hidden="true">↗</span></NuxtLink
                >
              </h3>
              <p>{{ active.shortDescription }}</p>
            </div>
            <div v-if="active.artwork" class="home-timeline__art">
              <TimelineArtwork :image="active.artwork" />
            </div>
          </div>
        </Transition>
      </div>
      <ol class="home-timeline__strip" :aria-label="t('navigation.timeline')">
        <li v-for="event in events" :key="event.id" :data-event-id="event.id">
          <NuxtLink
            class="home-timeline__strip-link"
            :class="{ 'home-timeline__strip-link--text': !event.artwork }"
            :to="localePath(`/timeline/${event.slug}`)"
            @focus="revealStripItem"
          >
            <!-- eslint-disable vue/html-self-closing -->
            <img
              v-if="event.artwork"
              :src="`${config.app.baseURL.replace(/\/$/, '')}${event.artwork.src}`"
              :alt="event.artwork.alt"
              loading="lazy"
            />
            <!-- eslint-enable vue/html-self-closing -->
            <time
              :datetime="event.dateOldStyle"
              :aria-label="
                formatTimelineDates(event.dateOldStyle, undefined, locale)
                  .startLabel
              "
              >{{ shortDate(event.dateOldStyle) }}</time
            >
            <h3>{{ event.previewTitle }} <span aria-hidden="true">↗</span></h3>
          </NuxtLink>
          <div v-if="event.caption" class="home-timeline__strip-caption">
            <p>{{ event.caption.caption }}</p>
            <p class="home-timeline__strip-attribution">
              {{ event.caption.attribution }}
              <template
                v-if="event.caption.attribution && event.caption.sourceLabel"
              >
                ·
              </template>
              <WebsiteLink
                v-if="event.caption.sourceUrl"
                :href="event.caption.sourceUrl"
                >{{ event.caption.sourceLabel }}</WebsiteLink
              >
              <template v-else>{{ event.caption.sourceLabel }}</template>
            </p>
          </div>
        </li>
      </ol>
      <div class="home-timeline__bottom">
        <p>{{ t('home.timeline.oldStyle') }}</p>
        <NuxtLink class="home-timeline__cta" :to="localePath('/timeline')"
          >{{ t('home.timeline.cta') }}
          <span aria-hidden="true">↗</span></NuxtLink
        >
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-timeline {
  color: var(--color-footer-text);
  background: #252628;
  --artwork-muted: #c9c4ba;
}
.page-container {
  padding-block: var(--space-16) var(--space-24);
}
.home-timeline__heading {
  display: grid;
  grid-template-columns: 1fr minmax(14rem, 25rem);
  gap: var(--space-12);
  align-items: end;
  margin-bottom: var(--space-16);
}
.eyebrow,
.home-timeline__heading > p {
  color: #c9c4ba;
}
h2 {
  margin-bottom: 0;
  font-size: clamp(3rem, 6vw, 5.5rem);
}
.home-timeline__heading > p {
  margin: 0;
  line-height: 1.7;
}
.home-timeline__sequence {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  list-style: none;
  margin: 0 0 var(--space-16);
  padding: 0;
}
.home-timeline__sequence li {
  min-width: 0;
}
.home-timeline__sequence button {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
  min-height: 8rem;
  border: 0;
  border-top: 1px solid #787473;
  padding: var(--space-6) var(--space-3) var(--space-3);
  text-align: left;
  color: #c9c4ba;
  background: transparent;
  cursor: pointer;
}
.home-timeline__point {
  position: absolute;
  top: 0;
  left: var(--space-3);
  width: 0.6rem;
  height: 0.6rem;
  border: 1px solid #c9c4ba;
  border-radius: 50%;
  background: #252628;
  transform: translateY(-50%);
}
.home-timeline__sequence time {
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 2vw, 1.8rem);
}
.home-timeline__point-title {
  font-size: var(--text-body-sm);
  line-height: 1.4;
}
.home-timeline__sequence button[aria-pressed='true'] {
  color: #fff;
}
.home-timeline__sequence button[aria-pressed='true'] .home-timeline__point {
  width: 0.9rem;
  height: 0.9rem;
  background: #e3c6c4;
}
.home-timeline__sequence
  button[aria-pressed='true']
  .home-timeline__point-title {
  text-decoration: underline;
  text-underline-offset: 0.4em;
  font-weight: 600;
}
.home-timeline :deep(:focus-visible) {
  outline-color: #eee9df;
  outline-offset: 4px;
}
.home-timeline__active {
  position: relative;
}
.home-timeline__composition {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: var(--space-12);
  align-items: center;
  min-height: 33rem;
}
.home-timeline__date {
  display: block;
  margin-bottom: var(--space-6);
  color: #e3c6c4;
  font-family: var(--font-display);
  font-size: clamp(2rem, 3.8vw, 3.5rem);
  letter-spacing: -0.035em;
}
h3 {
  margin-bottom: var(--space-6);
  font-size: clamp(2.5rem, 4.5vw, 4.5rem);
  line-height: 1.05;
  letter-spacing: -0.035em;
}
h3 a {
  display: inline-block;
  min-height: 44px;
  color: inherit;
  text-decoration: none;
}
h3 a:hover {
  color: #e3c6c4;
}
h3 span {
  font-size: 0.5em;
}
.home-timeline__story p {
  max-width: 35rem;
  color: #c9c4ba;
  font-size: var(--text-body-lg);
  line-height: 1.7;
}
.home-timeline__composition--text .home-timeline__story {
  grid-column: 1 / -1;
  max-width: 58rem;
}
.home-timeline__art {
  min-width: 0;
}
.home-timeline__art :deep(.timeline-artwork) {
  --museum-image-max-height: 34rem;
}
.home-timeline__art :deep(.museum-image),
.home-timeline__art :deep(.museum-image img) {
  width: 100%;
}
.home-timeline__strip {
  display: none;
}
.home-timeline__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-6);
  margin-top: var(--space-12);
  padding-top: var(--space-8);
  border-top: 1px solid #787473;
}
.home-timeline__bottom p {
  margin: 0;
  color: #c9c4ba;
  font-size: var(--text-caption);
}
.home-timeline__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-6);
  min-height: 44px;
  color: inherit;
  font-size: var(--text-body-lg);
  text-decoration: none;
  border-bottom: 1px solid #e3c6c4;
}
.artwork-enter-active,
.artwork-leave-active {
  transition: opacity 160ms ease;
}
.artwork-leave-active {
  position: absolute;
  inset: 0 0 auto;
}
.artwork-enter-from,
.artwork-leave-to {
  opacity: 0;
}
@media (max-width: 64rem) {
  .home-timeline__active,
  .home-timeline__sequence {
    display: none;
  }
  .home-timeline__heading {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
  .home-timeline__strip {
    display: flex;
    gap: var(--space-6);
    list-style: none;
    margin: 0;
    padding: var(--space-2);
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: var(--space-2);
    scrollbar-width: none;
  }
  .home-timeline__strip::-webkit-scrollbar {
    display: none;
  }
  .home-timeline__strip li {
    flex: 0 0 44%;
    min-width: 0;
    scroll-snap-align: start;
  }
  .home-timeline__strip-link {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-height: 44px;
    color: inherit;
    text-decoration: none;
  }
  .home-timeline__strip-link img {
    width: 100%;
    aspect-ratio: 16 / 10;
    object-fit: contain;
  }
  .home-timeline__strip-link time {
    color: #e3c6c4;
    font-family: var(--font-display);
    font-size: 2rem;
  }
  .home-timeline__strip-link h3 {
    margin: 0;
    font-size: 2rem;
    line-height: 1.15;
  }
  .home-timeline__strip-link--text {
    justify-content: center;
    min-height: 19rem;
  }
  .home-timeline__strip-caption {
    margin-top: var(--space-4);
    font-size: var(--text-caption);
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  .home-timeline__strip-caption p {
    margin-bottom: var(--space-2);
  }
  .home-timeline__strip-attribution {
    color: var(--artwork-muted);
  }
  .home-timeline__strip-attribution a {
    color: inherit;
    text-underline-offset: 0.2em;
  }
}
@media (max-width: 37.5rem) {
  .page-container {
    padding-block: var(--space-12) var(--space-16);
  }
  .home-timeline__heading {
    margin-bottom: var(--space-8);
  }
  .home-timeline__strip li {
    flex-basis: 85%;
  }
  .home-timeline__bottom {
    flex-direction: column;
    align-items: start;
  }
}
@media (prefers-reduced-motion: reduce) {
  .artwork-enter-active,
  .artwork-leave-active {
    transition: none;
  }
}
</style>
