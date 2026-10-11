<script setup lang="ts">
import { getTimelineEvents, getDictionaryEntries } from '#shared/content/index'
import { getPresentedTimelineEvents } from '~/data/timelinePresentation'
import { formatTimelineDates } from '~/utils/timelineDates'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const events = computed(() =>
  getPresentedTimelineEvents(
    getTimelineEvents(locale.value),
    getDictionaryEntries(locale.value),
    locale.value,
    config.public.timelineMediaAvailableSrcs,
  ).map((event) => ({
    ...event,
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
  })),
)
usePageSeo(
  () => t('navigation.timeline'),
  () => t('home.timeline.description'),
)
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
        :class="[
          `timeline-event--${event.tier}`,
          event.variant && `timeline-event--${event.variant}`,
        ]"
      >
        <article
          class="timeline-event__body"
          :aria-labelledby="`timeline-title-${event.id}`"
        >
          <div class="timeline-event__text">
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
            <h2
              :id="`timeline-title-${event.id}`"
              class="timeline-event__title"
            >
              <NuxtLink :to="localePath(`/timeline/${event.slug}`)"
                >{{ event.title }} <LinkArrow class="timeline-event__arrow"
              /></NuxtLink>
            </h2>
            <p class="timeline-event__description">
              {{ event.shortDescription }}
            </p>
          </div>
          <TimelineArtwork
            v-if="event.artwork"
            class="timeline-event__figure"
            :image="event.artwork"
          />
        </article>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.timeline-event__text {
  min-width: 0;
}
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
  overflow-wrap: anywhere;
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
  --event-space: var(--space-8);
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
  font-size: clamp(1.5rem, 2vw, 1.8rem);
  line-height: 1.15;
  text-wrap: pretty;
}
.timeline-event--featured .timeline-event__title {
  font-size: clamp(2rem, 2.8vw, 2.75rem);
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

.timeline-event__figure {
  margin-top: var(--space-8);
}
.timeline-event--landmark {
  display: block;
  margin-block: var(--space-24);
  padding-block: var(--space-8);
}
.timeline-event--landmark::before {
  display: none;
}
.timeline-event--landmark::after {
  top: 0;
  width: 1rem;
  height: 1rem;
  background: var(--color-accent);
}
.timeline-event--landmark .timeline-event__body {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  align-items: center;
  gap: var(--space-12);
  max-width: none;
  padding: clamp(2rem, 4vw, 4rem);
  background: var(--color-bg);
}
.timeline-event--landmark .timeline-event__date {
  font-size: clamp(2.25rem, 4.3vw, 4rem);
  letter-spacing: -0.035em;
}
.timeline-event--landmark .timeline-event__title {
  font-size: clamp(2.5rem, 4.5vw, 4.5rem);
  letter-spacing: -0.035em;
}
.timeline-event--landmark .timeline-event__description {
  font-size: var(--text-body-lg);
}
.timeline-event--landmark .timeline-event__figure {
  margin-top: 0;
}
.timeline-event--wide .timeline-event__body {
  grid-template-columns: minmax(0, 1fr);
  padding-inline: 0;
}
.timeline-event--wide .timeline-event__text {
  max-width: 55rem;
}
.timeline-event--burgundy .timeline-event__body,
.timeline-event--graphite .timeline-event__body {
  color: var(--color-footer-text);
  background: var(--color-accent);
  --artwork-muted: #d8ccd0;
}
.timeline-event--burgundy .timeline-event__body {
  grid-template-columns: minmax(0, 1fr);
  padding-block: clamp(3rem, 7vw, 7rem);
}
.timeline-event--graphite .timeline-event__body {
  background: #252628;
  --artwork-muted: #c9c4ba;
}
.timeline-event--burgundy .timeline-event__text {
  max-width: 55rem;
}
.timeline-event--burgundy .timeline-event__date {
  font-size: clamp(2.5rem, 5vw, 5rem);
}
.timeline-event--burgundy .timeline-event__new-date,
.timeline-event--burgundy .timeline-event__description,
.timeline-event--graphite .timeline-event__new-date,
.timeline-event--graphite .timeline-event__description {
  color: var(--artwork-muted);
}
.timeline-event--burgundy .timeline-event__arrow,
.timeline-event--graphite .timeline-event__arrow {
  color: inherit;
}
.timeline-event--burgundy a:hover,
.timeline-event--graphite a:hover,
.timeline-event--burgundy a:focus-visible,
.timeline-event--graphite a:focus-visible {
  color: #fff;
}
.timeline-event--burgundy :deep(:focus-visible),
.timeline-event--graphite :deep(:focus-visible) {
  outline-color: var(--color-footer-text);
}
@media (max-width: 64rem) {
  .timeline-event--landmark {
    margin-block: var(--space-16);
    padding-left: var(--space-8);
  }
  .timeline-event--landmark .timeline-event__body {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-8);
  }
  .timeline-event--landmark .timeline-event__title {
    font-size: clamp(2.25rem, 6vw, 3.5rem);
  }
}
@media (max-width: 37.5rem) {
  .timeline-event--landmark {
    padding-left: var(--space-6);
  }
  .timeline-event--landmark .timeline-event__body {
    padding: var(--space-6);
  }
  .timeline-event--wide .timeline-event__body {
    padding-inline: 0;
  }
  .timeline-event--landmark .timeline-event__date {
    font-size: 2rem;
  }
  .timeline-event--landmark .timeline-event__title {
    font-size: 2.25rem;
  }
  .timeline-event--landmark .timeline-event__description {
    font-size: 1rem;
  }
}
</style>
