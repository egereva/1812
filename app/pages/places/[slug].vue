<script setup lang="ts">
import { getPlaceBySlug, resolveRelatedContent } from '#shared/content/index'
import { mapPlaceUrl } from '~/data/mapPresentation'
import { formatTimelineDates } from '~/utils/timelineDates'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const record = computed(() => {
  const place = getPlaceBySlug(locale.value, String(route.params.slug ?? ''))
  if (!place)
    throw createError({ statusCode: 404, statusMessage: 'Place not found' })
  return place
})
const related = computed(() =>
  resolveRelatedContent(locale.value, 'place', record.value.id),
)
const comparisons = computed(() =>
  (record.value.beforeAfter ?? []).filter(
    (pair) =>
      pair.beforeDate?.trim() &&
      pair.afterDate?.trim() &&
      [pair.before, pair.after].every(
        (image) => image?.src?.startsWith('/images/') && image.alt?.trim(),
      ),
  ),
)
const relatedGroups = computed(() =>
  [
    {
      key: 'timeline',
      label: t('navigation.timeline'),
      items: related.value.timeline.map((event) => ({
        ...event,
        date: formatTimelineDates(
          event.dateOldStyle,
          event.dateEndOldStyle,
          locale.value,
        ),
      })),
    },
    {
      key: 'dictionary',
      label: t('navigation.dictionary'),
      items: related.value.dictionary,
    },
    {
      key: 'places',
      label: t('place.detail.places'),
      items: related.value.places,
    },
  ].filter((group) => group.items.length),
)
usePageSeo(
  () => record.value.seo?.title ?? record.value.title,
  () => record.value.seo?.description ?? record.value.shortDescription,
  () => t('place.detail.places'),
)
</script>

<template>
  <article class="place-detail page-container">
    <header
      class="place-detail__hero"
      :class="{
        'place-detail__hero--illustrated': record.coverImage,
      }"
    >
      <div class="place-detail__intro">
        <p class="eyebrow">{{ t('sections.place') }}</p>
        <h1>{{ record.title }}</h1>
        <p class="place-detail__lead lead">{{ record.shortDescription }}</p>
        <ul
          class="place-detail__metadata"
          :aria-label="t('place.detail.location')"
        >
          <li class="place-detail__status">
            {{ t(`map.status.${record.historicalStatus}`) }}
          </li>
          <li>{{ t(`map.precision.${record.locationPrecision}`) }}</li>
          <li v-if="record.address" class="place-detail__address">
            {{ record.address }}
          </li>
        </ul>
        <p
          v-if="record.locationNote && !record.historicalNote"
          class="place-detail__location-note"
        >
          {{ record.locationNote }}
        </p>
        <aside
          v-if="record.historicalNote"
          class="place-detail__clarification"
          :aria-label="t('place.detail.clarification')"
        >
          <p class="eyebrow">{{ t('place.detail.clarification') }}</p>
          <p v-if="record.locationNote">{{ record.locationNote }}</p>
          <p>{{ record.historicalNote }}</p>
        </aside>
        <NuxtLink
          class="place-map-action editorial-link"
          :to="mapPlaceUrl(localePath('/map'), record.slug)"
        >
          {{ t('map.showOnMap') }} <LinkArrow direction="right" />
        </NuxtLink>
      </div>
      <PlaceMedia
        v-if="record.coverImage"
        class="place-detail__cover"
        :image="record.coverImage"
        image-loading="eager"
      />
    </header>
    <section
      class="place-detail__narrative"
      :class="{
        'place-detail__narrative--illustrated': record.gallery?.length,
      }"
      aria-labelledby="place-story-title"
    >
      <h2 id="place-story-title">{{ t('place.detail.story') }}</h2>
      <div class="place-detail__prose">
        <p v-for="(paragraph, index) in record.content" :key="index">
          {{ paragraph }}
        </p>
      </div>
      <div v-if="record.gallery?.length" class="place-detail__gallery">
        <PlaceMedia
          v-for="image in record.gallery"
          :key="image.src"
          :image="image"
        />
      </div>
    </section>
    <section
      v-if="comparisons.length"
      class="place-detail__comparison"
      aria-labelledby="place-comparison-title"
    >
      <h2 id="place-comparison-title">{{ t('place.comparison.title') }}</h2>
      <PlaceImageComparison
        v-for="pair in comparisons"
        :key="pair.id"
        :pair="pair"
      />
    </section>
    <section
      v-if="relatedGroups.length"
      class="place-detail__support place-detail__related-section"
      aria-labelledby="place-related-title"
    >
      <h2 id="place-related-title">{{ t('place.detail.related') }}</h2>
      <div class="place-detail__relations">
        <div
          v-for="group in relatedGroups"
          :key="group.key"
          :data-relation="group.key"
        >
          <h3>{{ group.label }}</h3>
          <ul>
            <li v-for="item in group.items" :key="item.id">
              <NuxtLink :to="localePath(`/${group.key}/${item.slug}`)">
                <span v-if="'date' in item" class="place-detail__event-date">
                  <time
                    :datetime="item.dateOldStyle"
                    :aria-label="`${item.date.startLabel} · ${t('timeline.oldStyle')}`"
                    >{{ item.date.startText }}</time
                  ><template v-if="item.dateEndOldStyle"
                    >–<time
                      :datetime="item.dateEndOldStyle"
                      :aria-label="item.date.endLabel"
                      >{{ item.date.endText }}</time
                    ></template
                  >
                </span>
                <span>{{ item.title }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </section>
    <section
      v-if="related.sources.length"
      class="place-detail__support place-detail__sources"
      aria-labelledby="place-sources-title"
    >
      <h2 id="place-sources-title">{{ t('place.detail.sources') }}</h2>
      <ol>
        <li
          v-for="source in related.sources"
          :key="source.id"
          :data-source-id="source.id"
        >
          <WebsiteLink v-if="source.url" :href="source.url">{{
            source.title
          }}</WebsiteLink
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
  </article>
</template>

<style scoped>
.place-detail {
  padding-block: var(--space-16);
}
.place-detail__hero {
  padding-bottom: var(--space-12);
}
.place-detail__hero--illustrated {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
  gap: clamp(2rem, 5.5vw, 5rem);
  align-items: start;
  padding-bottom: var(--space-8);
}
.place-detail__intro {
  min-width: 0;
  max-width: 62rem;
}
.place-detail h1 {
  margin-block: var(--space-6);
  font-size: clamp(2.25rem, 4.8vw, 4.75rem);
  line-height: 1.08;
  letter-spacing: -0.035em;
  overflow-wrap: break-word;
  text-wrap: balance;
}
.place-detail__lead {
  max-width: 42rem;
  margin: 0;
}
.place-detail__metadata {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-6);
  margin: var(--space-8) 0 0;
  border-top: var(--border-rule);
  padding: var(--space-4) 0 0;
  list-style: none;
  color: var(--color-muted);
  font-size: var(--text-body-sm);
  line-height: 1.6;
}
.place-detail__status {
  color: var(--color-accent);
  font-weight: 600;
}
.place-detail__address {
  flex-basis: 100%;
  color: var(--color-ink);
}
.place-detail__location-note {
  margin: var(--space-3) 0 0;
  max-width: 42rem;
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}
.place-detail__clarification {
  margin-top: var(--space-6);
  border-left: 2px solid var(--color-accent);
  padding-left: var(--space-4);
  max-width: 42rem;
}
.place-detail__clarification .eyebrow {
  margin-bottom: var(--space-2);
  font-size: var(--text-caption);
  letter-spacing: 0.06em;
}
.place-detail__clarification > p:not(.eyebrow) {
  margin: 0;
  line-height: 1.65;
}
.place-detail__clarification > p:not(.eyebrow) + p {
  margin-top: var(--space-3);
}
.place-detail__cover {
  width: fit-content;
  max-width: 100%;
  justify-self: center;
  --museum-image-max-height: 34rem;
}
.place-detail__cover :deep(figcaption) {
  contain: inline-size;
  gap: var(--space-1);
  line-height: 1.5;
}
.place-detail__cover :deep(.place-media__attribution) {
  font-size: var(--text-caption);
}
.place-detail__narrative {
  display: grid;
  grid-template-columns: minmax(8rem, 12rem) minmax(0, 46rem);
  gap: var(--grid-gap);
  border-top: var(--border-rule);
  padding-top: var(--space-8);
}
.place-detail__narrative--illustrated {
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  column-gap: clamp(2rem, 5vw, 5rem);
}
.place-detail__narrative--illustrated h2 {
  grid-column: 1 / -1;
}
.place-detail__prose {
  min-width: 0;
  max-width: var(--container-text);
  font-size: var(--text-body-lg);
  line-height: 1.8;
}
.place-detail__prose p {
  margin: 0 0 var(--space-6);
}
.place-detail__prose p:last-child {
  margin-bottom: 0;
}
.place-detail__gallery {
  display: grid;
  gap: var(--space-8);
  align-content: start;
  min-width: 0;
  --museum-image-max-height: 34rem;
}
.place-detail__support {
  display: grid;
  grid-template-columns: minmax(8rem, 12rem) minmax(0, 1fr);
  gap: var(--grid-gap);
  margin-top: var(--space-12);
  border-top: var(--border-rule);
  padding-top: var(--space-8);
}
.place-detail h2,
.place-detail h3 {
  margin: 0;
  color: var(--color-muted);
  font-family: var(--font-body);
  font-size: var(--text-overline);
  font-weight: 600;
  letter-spacing: 0.1em;
  line-height: 1.5;
  text-transform: uppercase;
}
.place-detail__narrative > h2 {
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 2.3vw, 2.125rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.2;
  text-transform: none;
}
.place-detail__related-section {
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-6);
}
.place-detail__comparison {
  margin-top: var(--space-12);
  border-top: var(--border-rule);
  padding-top: var(--space-8);
}
.place-detail__comparison > h2 {
  margin-bottom: var(--space-8);
}
.place-detail__relations {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  gap: var(--space-8);
}
@media (min-width: 56.251rem) {
  .place-detail__cover {
    margin-top: calc(var(--text-overline) * 1.5 + var(--space-6));
    --museum-image-max-height: 30.5rem;
  }
  .place-detail__cover :deep(figcaption) {
    font-size: calc(var(--text-body-sm) - 0.5px);
    line-height: 1.55;
  }
  .place-detail__hero:not(.place-detail__hero--illustrated)
    .place-detail__intro {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
    column-gap: var(--space-16);
    max-width: none;
  }
  .place-detail__hero:not(.place-detail__hero--illustrated) .eyebrow,
  .place-detail__hero:not(.place-detail__hero--illustrated) h1,
  .place-detail__hero:not(.place-detail__hero--illustrated)
    .place-detail__lead {
    grid-column: 1 / -1;
  }
  .place-detail__hero:not(.place-detail__hero--illustrated)
    .place-detail__lead {
    max-width: 72rem;
  }
  .place-detail__hero:not(.place-detail__hero--illustrated)
    .place-detail__metadata {
    grid-column: 1;
    grid-row: 4;
    align-self: start;
  }
  .place-detail__hero:not(.place-detail__hero--illustrated)
    .place-detail__clarification,
  .place-detail__hero:not(.place-detail__hero--illustrated)
    .place-detail__location-note {
    grid-column: 2;
    grid-row: 4 / 6;
    align-self: start;
    margin-top: var(--space-8);
    max-width: none;
  }
  .place-detail__hero:not(.place-detail__hero--illustrated) .place-map-action {
    grid-column: 1;
    grid-row: 5;
    justify-self: start;
    align-self: start;
  }
}
.place-detail__relations ul,
.place-detail__sources ol {
  margin: var(--space-3) 0 0;
  padding: 0;
  list-style: none;
}
.place-detail__relations a {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-2);
  min-height: 44px;
  padding-block: var(--space-2);
  text-decoration: none;
  line-height: 1.5;
}
.place-detail__relations a:hover {
  color: var(--color-accent);
}
.place-detail__event-date {
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}
.place-detail__sources ol {
  margin-top: 0;
  max-width: var(--container-text);
}
.place-detail__sources li + li {
  margin-top: var(--space-6);
  border-top: var(--border-rule);
  padding-top: var(--space-4);
}
.place-detail__sources a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-family: var(--font-display);
  font-size: 1.25rem;
  text-decoration-thickness: 1px;
  overflow-wrap: anywhere;
}
.place-detail__sources p {
  margin: var(--space-2) 0 0;
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}
@media (max-width: 56.25rem) {
  .place-detail__hero--illustrated,
  .place-detail__narrative,
  .place-detail__support {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-8);
  }
  .place-detail__cover {
    max-width: min(100%, 46rem);
    --museum-image-max-height: 34rem;
  }
  .place-detail__narrative--illustrated h2 {
    grid-column: auto;
  }
  .place-detail__gallery {
    max-width: 46rem;
  }
}
@media (max-width: 37.5rem) {
  .place-detail {
    padding-block: var(--space-8) var(--space-12);
  }
  .place-detail__hero {
    padding-bottom: var(--space-8);
  }
  .place-detail h1 {
    font-size: clamp(2.25rem, 9vw, 3rem);
  }
  .place-detail__cover,
  .place-detail__gallery {
    --museum-image-max-height: 30rem;
  }
  .place-detail__metadata {
    margin-top: var(--space-6);
  }
  .place-detail__relations {
    grid-template-columns: minmax(0, 1fr);
  }
}
.place-map-action {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  gap: 0.75rem;
  margin-top: var(--space-6);
  border-bottom: 2px solid var(--color-accent);
  color: var(--color-accent);
  font-weight: 700;
  text-decoration: none;
}
</style>
