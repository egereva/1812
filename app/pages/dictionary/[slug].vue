<script setup lang="ts">
import {
  getDictionaryEntryBySlug,
  getSourceById,
  resolveRelatedContent,
} from '#shared/content/index'
import { normalizeMediaCaption } from '~/utils/mediaCaption'

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const record = computed(() => {
  const entry = getDictionaryEntryBySlug(
    locale.value,
    String(route.params.slug ?? ''),
  )
  if (!entry)
    throw createError({ statusCode: 404, statusMessage: 'Entry not found' })
  return entry
})

const related = computed(() =>
  resolveRelatedContent(locale.value, 'dictionary', record.value.id),
)
const sources = computed(() => related.value.sources)
const imageSource = computed(() =>
  record.value.image?.sourceId
    ? getSourceById(locale.value, record.value.image.sourceId)
    : undefined,
)
const imageCaption = computed(() =>
  record.value.image
    ? normalizeMediaCaption(
        record.value.image,
        imageSource.value,
        record.value.image.sourceId
          ? getSourceById(
              locale.value === 'ru' ? 'en' : 'ru',
              record.value.image.sourceId,
            )
          : undefined,
      )
    : undefined,
)

usePageSeo(
  () => record.value.seo?.title ?? record.value.title,
  () => record.value.seo?.description ?? record.value.shortDescription,
  () => t('navigation.dictionary'),
)
</script>

<template>
  <article class="dictionary-detail page-container">
    <nav
      class="dictionary-detail__back"
      :aria-label="t('navigation.dictionary')"
    >
      <NuxtLink :to="localePath('/dictionary')">
        <span aria-hidden="true">←</span> {{ t('navigation.dictionary') }}
      </NuxtLink>
    </nav>

    <div class="dictionary-detail__composition">
      <header class="dictionary-detail__intro">
        <p class="eyebrow">
          {{ t('sections.dictionaryEntry') }} <span aria-hidden="true">/</span>
          {{ record.letter }}
        </p>
        <h1>{{ record.title }}</h1>
        <p class="dictionary-detail__description lead">
          {{ record.shortDescription }}
        </p>
      </header>
    </div>

    <div
      class="dictionary-detail__article"
      :class="{ 'dictionary-detail__article--with-image': record.image }"
    >
      <figure v-if="record.image" class="dictionary-detail__figure">
        <MuseumImage :image="record.image" image-loading="eager" />
        <figcaption
          v-if="
            imageCaption &&
            (imageCaption.caption ||
              imageCaption.attribution ||
              imageCaption.sourceLabel)
          "
        >
          <span v-if="imageCaption.caption" class="media-caption__text">{{
            imageCaption.caption
          }}</span>
          <span
            v-if="imageCaption.attribution || imageCaption.sourceLabel"
            class="media-caption__attribution"
          >
            {{ imageCaption.attribution
            }}<template
              v-if="imageCaption.attribution && imageCaption.sourceLabel"
            >
              ·
            </template>
            <WebsiteLink
              v-if="imageCaption.sourceUrl"
              :href="imageCaption.sourceUrl"
              >{{ imageCaption.sourceLabel }}</WebsiteLink
            >
            <template v-else>{{ imageCaption.sourceLabel }}</template>
          </span>
        </figcaption>
      </figure>
      <div class="dictionary-detail__body">
        <p v-for="(paragraph, index) in record.content" :key="index">
          {{ paragraph }}
        </p>
      </div>
    </div>

    <section
      v-if="related.places.length"
      class="dictionary-detail__places"
      aria-labelledby="dictionary-places-title"
    >
      <h2 id="dictionary-places-title">{{ t('dictionary.relatedPlaces') }}</h2>
      <ul>
        <li v-for="place in related.places" :key="place.id">
          <NuxtLink :to="localePath(`/places/${place.slug}`)">{{
            place.title
          }}</NuxtLink>
        </li>
      </ul>
    </section>

    <section
      v-if="related.timeline.length"
      class="dictionary-detail__timeline"
      aria-labelledby="dictionary-timeline-title"
    >
      <h2 id="dictionary-timeline-title">
        {{ t('dictionary.relatedTimeline') }}
      </h2>
      <ul>
        <li v-for="event in related.timeline" :key="event.id">
          <NuxtLink :to="localePath(`/timeline/${event.slug}`)">{{
            event.title
          }}</NuxtLink>
        </li>
      </ul>
    </section>

    <section
      v-if="sources.length"
      class="dictionary-detail__sources"
      aria-labelledby="dictionary-sources-title"
    >
      <h2 id="dictionary-sources-title">{{ t('navigation.sources') }}</h2>
      <ol>
        <li v-for="source in sources" :key="source.id">
          <h3>
            <WebsiteLink v-if="source.url" :href="source.url">{{
              source.title
            }}</WebsiteLink>
            <span v-else>{{ source.title }}</span>
          </h3>
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
.dictionary-detail {
  padding-block: var(--space-8) var(--space-24);
}

.dictionary-detail__back a {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-muted);
  font-size: var(--text-body-sm);
  text-decoration: none;
}

.dictionary-detail__back a:hover,
.dictionary-detail__back a:focus-visible {
  color: var(--color-accent);
  text-decoration: underline;
}

.dictionary-detail__composition {
  padding-block: var(--space-8) var(--space-12);
}

.dictionary-detail__article {
  border-top: var(--border-rule);
  padding-top: var(--space-12);
}

.dictionary-detail__article--with-image {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
  align-items: start;
  gap: clamp(2rem, 4vw, 4rem);
}

.dictionary-detail__article--with-image .dictionary-detail__body {
  grid-column: 1;
  grid-row: 1;
}

.dictionary-detail__article--with-image .dictionary-detail__figure {
  grid-column: 2;
  grid-row: 1;
}

.dictionary-detail__intro {
  min-width: 0;
}

.dictionary-detail__intro .eyebrow {
  margin-bottom: var(--space-4);
}

.dictionary-detail__intro .eyebrow span {
  margin-inline: var(--space-2);
  color: var(--color-border);
}

.dictionary-detail__intro h1 {
  max-width: 21ch;
  margin: 0;
  font-size: clamp(2.625rem, 4.8vw, 5.25rem);
  letter-spacing: -0.045em;
  overflow-wrap: break-word;
}

.dictionary-detail__description {
  max-width: 36rem;
  margin-block: var(--space-6) 0;
  color: var(--color-muted);
}

.dictionary-detail__body {
  min-width: 0;
  max-width: var(--container-text);
  font-size: var(--text-body-lg);
  line-height: 1.7;
}

.dictionary-detail__body p {
  margin-bottom: var(--space-6);
}

.dictionary-detail__figure {
  min-width: 0;
  margin: 0;
}

.dictionary-detail__figure figcaption {
  display: grid;
  gap: var(--space-1);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  color: var(--color-muted);
  font-size: var(--text-caption);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.dictionary-detail__figure .media-caption__text {
  color: var(--color-ink);
  font-size: var(--text-body-sm);
}

.dictionary-detail__figure .media-caption__attribution a {
  color: inherit;
}

.dictionary-detail__places,
.dictionary-detail__timeline,
.dictionary-detail__sources {
  display: grid;
  grid-template-columns: minmax(7rem, 11rem) minmax(0, 46rem);
  gap: var(--grid-gap);
  border-top: var(--border-rule);
  margin-top: var(--space-24);
  padding-top: var(--space-8);
}

.dictionary-detail__places h2,
.dictionary-detail__timeline h2,
.dictionary-detail__sources h2 {
  color: var(--color-muted);
  font-family: var(--font-body);
  font-size: var(--text-overline);
  font-weight: 700;
  letter-spacing: 0.12em;
  line-height: 1.4;
  text-transform: uppercase;
}

.dictionary-detail__sources ol {
  margin: 0;
  padding: 0;
  list-style: none;
}

.dictionary-detail__sources li {
  border-bottom: var(--border-rule);
  padding-block: var(--space-4) var(--space-6);
}

.dictionary-detail__sources li:first-child {
  padding-top: 0;
}

.dictionary-detail__sources h3 {
  margin-bottom: var(--space-2);
  font-size: 1.25rem;
  line-height: 1.3;
}

.dictionary-detail__sources h3 a {
  text-decoration-thickness: 1px;
}

.dictionary-detail__sources p {
  margin: 0;
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}

.dictionary-detail__places,
.dictionary-detail__timeline {
  margin-top: var(--space-12);
  padding-top: var(--space-6);
}

.dictionary-detail__places ul,
.dictionary-detail__timeline ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.dictionary-detail__places a,
.dictionary-detail__timeline a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding-block: var(--space-2);
  font-size: var(--text-body-sm);
}

.dictionary-detail__places + .dictionary-detail__sources,
.dictionary-detail__timeline + .dictionary-detail__sources {
  margin-top: var(--space-12);
}

@media (max-width: 56.25rem) {
  .dictionary-detail__article--with-image {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .dictionary-detail__figure {
    max-width: min(100%, var(--container-text));
  }
}

@media (max-width: 37.5rem) {
  .dictionary-detail {
    padding-block: var(--space-6) var(--space-16);
  }

  .dictionary-detail__composition {
    padding-block: var(--space-6) var(--space-8);
  }

  .dictionary-detail__description {
    margin-top: var(--space-4);
  }

  .dictionary-detail__intro h1 {
    font-size: clamp(2.8rem, 12vw, 4rem);
  }

  .dictionary-detail__places,
  .dictionary-detail__timeline,
  .dictionary-detail__sources {
    display: block;
  }

  .dictionary-detail__article {
    padding-top: var(--space-8);
  }

  .dictionary-detail__figure {
    margin: 0;
  }

  .dictionary-detail__sources {
    margin-top: var(--space-16);
  }

  .dictionary-detail__places h2,
  .dictionary-detail__timeline h2,
  .dictionary-detail__sources h2 {
    margin-bottom: var(--space-6);
  }
}
</style>
