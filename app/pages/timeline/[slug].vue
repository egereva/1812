<script setup lang="ts">
import {
  getTimelineEventBySlug,
  getTimelineEvents,
  resolveRelatedContent,
} from '#shared/content/index'
import { formatTimelineDates } from '~/utils/timelineDates'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const record = computed(() => {
  const event = getTimelineEventBySlug(
    locale.value,
    String(route.params.slug ?? ''),
  )
  if (!event)
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  return event
})
const dates = computed(() => ({
  old: formatTimelineDates(
    record.value.dateOldStyle,
    record.value.dateEndOldStyle,
    locale.value,
  ),
  new: record.value.dateNewStyle
    ? formatTimelineDates(
        record.value.dateNewStyle,
        record.value.dateEndNewStyle,
        locale.value,
      )
    : undefined,
}))
const neighbors = computed(() => {
  const events = getTimelineEvents(locale.value)
  const index = events.findIndex((event) => event.id === record.value.id)
  return { previous: events[index - 1], next: events[index + 1] }
})
const related = computed(() =>
  resolveRelatedContent(locale.value, 'timeline', record.value.id),
)
const relatedGroups = computed(() =>
  [
    {
      label: t('timeline.detail.places'),
      items: related.value.places,
      path: '/places',
    },
    {
      label: t('navigation.dictionary'),
      items: related.value.dictionary,
      path: '/dictionary',
    },
    {
      label: t('navigation.timeline'),
      items: related.value.timeline.filter(
        (event) =>
          event.id !== neighbors.value.previous?.id &&
          event.id !== neighbors.value.next?.id,
      ),
      path: '/timeline',
    },
  ].filter((group) => group.items.length),
)
const chronologicalLinks = computed(() =>
  [
    { event: neighbors.value.previous, direction: 'previous' },
    { event: neighbors.value.next, direction: 'next' },
  ].flatMap(({ event, direction }) =>
    event
      ? [
          {
            event,
            direction,
            date: formatTimelineDates(
              event.dateOldStyle,
              event.dateEndOldStyle,
              locale.value,
            ),
          },
        ]
      : [],
  ),
)

useHead(() => ({ title: record.value.seo?.title ?? record.value.title }))
useSeoMeta({
  description: () =>
    record.value.seo?.description ?? record.value.shortDescription,
})
</script>

<template>
  <article class="timeline-detail page-container">
    <nav class="timeline-detail__back" :aria-label="t('navigation.timeline')">
      <NuxtLink :to="localePath('/timeline')"
        ><span aria-hidden="true">←</span>
        {{ t('timeline.detail.back') }}</NuxtLink
      >
    </nav>
    <header class="timeline-detail__hero">
      <p class="eyebrow">
        {{ t('navigation.timeline') }} <span aria-hidden="true">·</span>
        {{ t('sections.timelineEvent') }}
      </p>
      <p class="timeline-detail__date" :aria-label="t('timeline.oldStyle')">
        <time
          :datetime="record.dateOldStyle"
          :aria-label="dates.old.startLabel"
          >{{ dates.old.startText }}</time
        ><template v-if="record.dateEndOldStyle"
          >–<time :datetime="record.dateEndOldStyle">{{
            dates.old.endText
          }}</time></template
        >
      </p>
      <p v-if="dates.new" class="timeline-detail__new-date">
        <span
          ><time
            :datetime="record.dateNewStyle"
            :aria-label="dates.new.startLabel"
            >{{ dates.new.startText }}</time
          ><template v-if="record.dateEndNewStyle"
            >–<time :datetime="record.dateEndNewStyle">{{
              dates.new.endText
            }}</time></template
          ></span
        >
        <span class="timeline-detail__calendar">{{
          t('timeline.newStyle')
        }}</span>
      </p>
      <h1>{{ record.title }}</h1>
      <p class="timeline-detail__lead lead">{{ record.shortDescription }}</p>
    </header>
    <div
      class="timeline-detail__article"
      :class="{ 'timeline-detail__article--illustrated': record.image }"
    >
      <!-- Mobile reading order; the desktop grid places media on the right. -->
      <TimelineArtwork
        v-if="record.image"
        class="timeline-detail__media"
        :image="record.image"
      />
      <div class="timeline-detail__prose">
        <p v-for="(paragraph, index) in record.content" :key="index">
          {{ paragraph }}
        </p>
      </div>
    </div>
    <section
      v-if="relatedGroups.length"
      class="timeline-detail__support"
      aria-labelledby="timeline-related-title"
    >
      <h2 id="timeline-related-title">{{ t('timeline.detail.related') }}</h2>
      <div class="timeline-detail__related">
        <div v-for="group in relatedGroups" :key="group.path">
          <h3>{{ group.label }}</h3>
          <ul>
            <li v-for="item in group.items" :key="item.id">
              <NuxtLink :to="localePath(`${group.path}/${item.slug}`)">{{
                item.title
              }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </section>
    <section
      v-if="related.sources.length"
      class="timeline-detail__support timeline-detail__sources"
      aria-labelledby="timeline-sources-title"
    >
      <h2 id="timeline-sources-title">{{ t('timeline.detail.sources') }}</h2>
      <ol>
        <li v-for="source in related.sources" :key="source.id">
          <a v-if="source.url" :href="source.url">{{ source.title }}</a
          ><span v-else>{{ source.title }}</span>
          <p v-if="source.author || source.publisher || source.year">
            {{
              [source.author, source.publisher, source.year]
                .filter(Boolean)
                .join(' · ')
            }}
          </p>
        </li>
      </ol>
    </section>
    <nav
      class="timeline-detail__chronology"
      :aria-label="t('timeline.detail.chronology')"
    >
      <NuxtLink
        v-for="link in chronologicalLinks"
        :key="link.direction"
        :class="`timeline-detail__neighbor timeline-detail__neighbor--${link.direction}`"
        :to="localePath(`/timeline/${link.event.slug}`)"
        :rel="link.direction === 'previous' ? 'prev' : 'next'"
      >
        <span class="timeline-detail__direction"
          ><span v-if="link.direction === 'previous'" aria-hidden="true"
            >← </span
          >{{ t(`timeline.detail.${link.direction}`)
          }}<span v-if="link.direction === 'next'" aria-hidden="true">
            →</span
          ></span
        >
        <span class="timeline-detail__neighbor-title">{{
          link.event.title
        }}</span>
        <span class="timeline-detail__neighbor-date"
          >{{ link.date.startText
          }}<template v-if="link.event.dateEndOldStyle"
            >–{{ link.date.endText }}</template
          ></span
        >
      </NuxtLink>
    </nav>
  </article>
</template>

<style scoped>
.timeline-detail {
  padding-block: var(--space-8) var(--space-16);
}
.timeline-detail__back a {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 2.75rem;
  color: var(--color-muted);
  font-size: var(--text-body-sm);
  text-decoration: none;
}
.timeline-detail__back a:hover {
  text-decoration: underline;
}
.timeline-detail__hero {
  padding-block: var(--space-8) var(--space-12);
}
.timeline-detail__hero .eyebrow {
  margin-bottom: var(--space-6);
}
.timeline-detail__hero .eyebrow span {
  margin-inline: var(--space-2);
}
.timeline-detail__date {
  margin-bottom: var(--space-3);
  color: var(--color-accent);
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5.8vw, 5.25rem);
  line-height: 1.08;
  letter-spacing: -0.04em;
}
.timeline-detail__new-date {
  display: flex;
  flex-wrap: wrap;
  column-gap: var(--space-3);
  margin-bottom: 0;
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}
.timeline-detail__hero h1 {
  max-width: 30ch;
  margin-block: var(--space-8) var(--space-6);
  font-size: clamp(2rem, 3.6vw, 3.25rem);
  letter-spacing: -0.03em;
  overflow-wrap: break-word;
}
.timeline-detail__lead {
  max-width: 46rem;
  margin: 0;
  color: var(--color-muted);
}
.timeline-detail__article {
  border-top: var(--border-rule);
  padding-top: var(--space-12);
}
.timeline-detail__article--illustrated {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: clamp(2rem, 3.5vw, 3.5rem);
  align-items: start;
}
.timeline-detail__prose {
  grid-column: 1;
  grid-row: 1;
  min-width: 0;
  max-width: var(--container-text);
  font-size: var(--text-body-lg);
  line-height: 1.75;
}
.timeline-detail__prose p {
  margin-bottom: var(--space-6);
}
.timeline-detail__prose p:last-child {
  margin-bottom: 0;
}
.timeline-detail__media {
  grid-column: 2;
  grid-row: 1;
}
.timeline-detail__media :deep(.museum-image) {
  --museum-image-max-height: 32rem;
}
.timeline-detail__support {
  display: grid;
  grid-template-columns: minmax(8rem, 12rem) minmax(0, 1fr);
  gap: var(--grid-gap);
  margin-top: var(--space-12);
  border-top: var(--border-rule);
  padding-top: var(--space-8);
}
.timeline-detail__support h2,
.timeline-detail__related h3 {
  margin: 0;
  color: var(--color-muted);
  font-family: var(--font-body);
  font-size: var(--text-overline);
  font-weight: 600;
  letter-spacing: 0.1em;
  line-height: 1.5;
  text-transform: uppercase;
}
.timeline-detail__related {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  gap: var(--space-8);
}
.timeline-detail__related ul,
.timeline-detail__sources ol {
  margin: 0;
  padding: 0;
  list-style: none;
}
.timeline-detail__related ul {
  margin-top: var(--space-3);
}
.timeline-detail__related li {
  margin-top: var(--space-3);
}
.timeline-detail__related a {
  display: inline-block;
  padding-block: var(--space-2);
  text-decoration-thickness: 1px;
}
.timeline-detail__sources ol {
  max-width: 46rem;
}
.timeline-detail__sources li + li {
  margin-top: var(--space-6);
}
.timeline-detail__sources a {
  text-decoration-thickness: 1px;
}
.timeline-detail__sources p {
  margin-block: var(--space-2) 0;
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}
.timeline-detail__chronology {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-8);
  margin-top: var(--space-12);
  border-top: var(--border-rule);
  padding-top: var(--space-8);
}
.timeline-detail__neighbor {
  display: grid;
  align-content: start;
  gap: var(--space-3);
  padding-block: var(--space-3);
  text-decoration: none;
}
.timeline-detail__neighbor--next {
  grid-column: 2;
  text-align: right;
}
.timeline-detail__direction,
.timeline-detail__neighbor-date {
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}
.timeline-detail__neighbor-title {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 2vw, 2rem);
  line-height: 1.2;
  text-wrap: balance;
}
.timeline-detail__neighbor:hover .timeline-detail__neighbor-title {
  text-decoration: underline;
  text-decoration-thickness: 1px;
}
@media (max-width: 56.25rem) {
  .timeline-detail__article--illustrated {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }
  .timeline-detail__media {
    width: 100%;
    max-width: var(--container-text);
  }
  .timeline-detail__support {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}
@media (max-width: 37.5rem) {
  .timeline-detail {
    padding-block: var(--space-6) var(--space-12);
  }
  .timeline-detail__hero {
    padding-block: var(--space-6) var(--space-8);
  }
  .timeline-detail__hero h1 {
    margin-top: var(--space-6);
  }
  .timeline-detail__article {
    padding-top: var(--space-8);
  }
  .timeline-detail__media :deep(.museum-image) {
    --museum-image-max-height: 26rem;
  }
  .timeline-detail__chronology {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
  .timeline-detail__neighbor--next {
    grid-column: 1;
    text-align: left;
  }
}
</style>
