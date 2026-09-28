<script setup lang="ts">
import { getTimelineEvents, getSourceById } from '#shared/content/index'
import { formatTimelineDates } from '~/utils/timelineDates'
import { normalizeMediaCaption } from '~/utils/mediaCaption'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const events = computed(() =>
  getTimelineEvents(locale.value).map((event) => {
    const image =
      event.featured &&
      event.image &&
      config.public.timelineMediaAvailableSrcs.includes(event.image.src)
        ? event.image
        : undefined
    return {
      ...event,
      image,
      oldDates: formatTimelineDates(
        event.dateOldStyle,
        event.dateEndOldStyle,
        locale.value,
      ),
      newDates: event.dateNewStyle
        ? formatTimelineDates(
            event.dateNewStyle,
            event.dateEndNewStyle,
            locale.value,
          )
        : undefined,
      imageCaption: image
        ? normalizeMediaCaption(
            image,
            image.sourceId
              ? getSourceById(locale.value, image.sourceId)
              : undefined,
            image.sourceId
              ? getSourceById(
                  locale.value === 'ru' ? 'en' : 'ru',
                  image.sourceId,
                )
              : undefined,
          )
        : undefined,
    }
  }),
)
const imageUrl = (src: string) =>
  `${config.app.baseURL.replace(/\/$/, '')}${src}`

useHead(() => ({ title: t('navigation.timeline') }))
useSeoMeta({ description: () => t('home.timeline.description') })
</script>

<template>
  <div class="timeline-page page-container">
    <header class="timeline-page__intro">
      <p class="eyebrow">{{ t('home.timeline.kicker') }}</p>
      <h1>{{ t('navigation.timeline') }}</h1>
      <p class="lead">{{ t('home.timeline.description') }}</p>
      <p class="timeline-page__legend">{{ t('home.timeline.oldStyle') }}</p>
    </header>

    <ol class="campaign-timeline">
      <li
        v-for="event in events"
        :key="event.id"
        :data-event-id="event.id"
        class="timeline-event"
        :class="{ 'timeline-event--featured': event.featured }"
      >
        <article
          class="timeline-event__body"
          :aria-labelledby="`timeline-title-${event.id}`"
        >
          <div class="timeline-event__date">
            <span class="sr-only">{{ t('timeline.oldStyle') }}: </span>
            <time
              :datetime="event.dateOldStyle"
              :aria-label="event.oldDates.startLabel"
              >{{ event.oldDates.startText }}</time
            ><template v-if="event.dateEndOldStyle"
              ><span aria-hidden="true">–</span
              ><span class="sr-only"> {{ t('timeline.until') }} </span
              ><time
                :datetime="event.dateEndOldStyle"
                :aria-label="event.oldDates.endLabel"
                >{{ event.oldDates.endText }}</time
              ></template
            >
          </div>
          <p v-if="event.newDates" class="timeline-event__new-date">
            <time
              :datetime="event.dateNewStyle"
              :aria-label="event.newDates.startLabel"
              >{{ event.newDates.startText }}</time
            ><template v-if="event.dateEndNewStyle"
              ><span aria-hidden="true">–</span
              ><span class="sr-only"> {{ t('timeline.until') }} </span
              ><time
                :datetime="event.dateEndNewStyle"
                :aria-label="event.newDates.endLabel"
                >{{ event.newDates.endText }}</time
              ></template
            >
            <span> · {{ t('timeline.newStyle') }}</span>
          </p>
          <h2 :id="`timeline-title-${event.id}`" class="timeline-event__title">
            <NuxtLink :to="localePath(`/timeline/${event.slug}`)"
              >{{ event.title }}
              <span class="timeline-event__arrow" aria-hidden="true"
                >↗</span
              ></NuxtLink
            >
          </h2>
          <p class="timeline-event__description">
            {{ event.shortDescription }}
          </p>
          <figure v-if="event.image" class="timeline-event__figure">
            <!-- eslint-disable vue/html-self-closing -->
            <img
              :src="imageUrl(event.image.src)"
              :alt="event.image.alt"
              loading="lazy"
            />
            <!-- eslint-enable vue/html-self-closing -->
            <figcaption v-if="event.imageCaption">
              <span
                v-if="event.imageCaption.caption"
                class="timeline-event__caption"
                >{{ event.imageCaption.caption }}</span
              >
              <span
                v-if="
                  event.imageCaption.attribution ||
                  event.imageCaption.sourceLabel
                "
              >
                {{ event.imageCaption.attribution
                }}<template
                  v-if="
                    event.imageCaption.attribution &&
                    event.imageCaption.sourceLabel
                  "
                >
                  ·
                </template>
                <a
                  v-if="event.imageCaption.sourceUrl"
                  :href="event.imageCaption.sourceUrl"
                  >{{ event.imageCaption.sourceLabel }}</a
                ><template v-else>{{
                  event.imageCaption.sourceLabel
                }}</template>
              </span>
            </figcaption>
          </figure>
        </article>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.timeline-page {
  padding-block: var(--space-16) var(--space-24);
}
.timeline-page__intro {
  border-bottom: var(--border-rule);
  padding-bottom: var(--space-12);
}
.timeline-page__intro .eyebrow {
  margin-bottom: var(--space-8);
}
.timeline-page__intro h1 {
  margin-bottom: var(--space-8);
  font-size: clamp(4rem, 9vw, 8.5rem);
  letter-spacing: -0.055em;
}
.timeline-page__intro .lead {
  max-width: 38rem;
  color: var(--color-muted);
}
.timeline-page__legend {
  margin: var(--space-6) 0 0;
  font-size: var(--text-body-sm);
  color: var(--color-muted);
}
.campaign-timeline {
  position: relative;
  list-style: none;
  margin: var(--space-16) 0 0;
  padding: 0;
}
.campaign-timeline::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background: var(--color-border);
  content: '';
}
.timeline-event {
  --event-space: var(--space-12);
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: var(--space-24);
  padding-block: var(--event-space);
}
.timeline-event::before {
  position: absolute;
  top: calc(var(--event-space) + 0.875rem);
  left: calc(50% - 3rem);
  width: 3rem;
  height: 1px;
  background: var(--color-border);
  content: '';
}
.timeline-event::after {
  position: absolute;
  top: calc(var(--event-space) + 0.875rem);
  left: 50%;
  width: 0.5rem;
  height: 0.5rem;
  border: 1px solid var(--color-accent);
  background: var(--color-bg);
  transform: translate(-50%, -50%);
  content: '';
}
.timeline-event:nth-child(even)::before {
  left: 50%;
}
.timeline-event__body {
  grid-column: 1;
  min-width: 0;
}
.timeline-event:nth-child(even) .timeline-event__body {
  grid-column: 2;
}
.timeline-event--featured {
  --event-space: var(--space-16);
}
.timeline-event--featured::after {
  width: 0.875rem;
  height: 0.875rem;
  background: var(--color-accent);
}
.timeline-event__date {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 2vw, 1.75rem);
  line-height: 1.2;
}
.timeline-event--featured .timeline-event__date {
  font-size: clamp(1.65rem, 2.4vw, 2.125rem);
}
.timeline-event__new-date {
  margin: var(--space-2) 0 var(--space-6);
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}
.timeline-event__title {
  margin-bottom: var(--space-4);
  font-size: clamp(1.6rem, 2.25vw, 2.25rem);
  line-height: 1.15;
  text-wrap: pretty;
}
.timeline-event--featured .timeline-event__title {
  font-size: clamp(2rem, 3.4vw, 3.25rem);
}
.timeline-event__title a {
  display: inline-block;
  min-height: 2.75rem;
  text-decoration: none;
}
.timeline-event__title a:hover,
.timeline-event__title a:focus-visible {
  color: var(--color-accent);
}
.timeline-event__arrow {
  color: var(--color-accent);
  font-family: var(--font-body);
  font-size: 0.55em;
  white-space: nowrap;
}
.timeline-event__description {
  margin: 0;
  max-width: 34rem;
  color: var(--color-muted);
  line-height: 1.7;
}
.timeline-event--featured .timeline-event__description {
  font-size: var(--text-body-lg);
}
.timeline-event__figure {
  margin: var(--space-8) 0 0;
}
.timeline-event__figure img {
  display: block;
  width: auto;
  max-height: 28rem;
  object-fit: contain;
}
.timeline-event__figure figcaption {
  display: grid;
  gap: var(--space-1);
  margin-top: var(--space-3);
  color: var(--color-muted);
  font-size: var(--text-caption);
  overflow-wrap: anywhere;
}
.timeline-event__caption {
  color: var(--color-ink);
  font-size: var(--text-body-sm);
}
@media (max-width: 64rem) {
  .campaign-timeline::before {
    left: 0.5rem;
  }
  .timeline-event {
    display: block;
    padding-left: var(--space-16);
  }
  .timeline-event__body {
    max-width: 44rem;
  }
  .timeline-event::before,
  .timeline-event:nth-child(even)::before {
    left: 0.5rem;
    width: 2.5rem;
  }
  .timeline-event::after {
    left: 0.5rem;
  }
  .timeline-event--featured .timeline-event__title {
    font-size: clamp(2rem, 5vw, 3rem);
  }
}
@media (max-width: 37.5rem) {
  .timeline-page {
    padding-block: var(--space-12) var(--space-16);
  }
  .timeline-page__intro h1 {
    font-size: clamp(3rem, 13vw, 4.5rem);
  }
  .campaign-timeline {
    margin-top: var(--space-8);
  }
  .timeline-event {
    --event-space: var(--space-8);
    padding-left: var(--space-8);
  }
  .timeline-event--featured {
    --event-space: var(--space-12);
  }
  .campaign-timeline::before,
  .timeline-event::after {
    left: 0.25rem;
  }
  .timeline-event::before,
  .timeline-event:nth-child(even)::before {
    left: 0.25rem;
    width: 1.25rem;
  }
  .timeline-event__new-date {
    font-size: var(--text-caption);
  }
  .timeline-event--featured .timeline-event__title {
    font-size: 2rem;
  }
}
</style>
