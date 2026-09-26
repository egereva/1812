<script setup lang="ts">
import {
  getDictionaryEntryBySlug,
  resolveRelatedContent,
} from '#shared/content/index'

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

const sources = computed(
  () =>
    resolveRelatedContent(locale.value, 'dictionary', record.value.id).sources,
)

useHead(() => ({ title: record.value.seo?.title ?? record.value.title }))
useSeoMeta({
  description: () =>
    record.value.seo?.description ?? record.value.shortDescription,
})
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

    <header class="dictionary-detail__intro">
      <p class="eyebrow">
        {{ t('sections.dictionaryEntry') }} <span aria-hidden="true">/</span>
        {{ record.letter }}
      </p>
      <h1>{{ record.title }}</h1>
    </header>

    <div class="dictionary-detail__story">
      <div class="dictionary-detail__body">
        <p v-for="(paragraph, index) in record.content" :key="index">
          {{ paragraph }}
        </p>
      </div>
      <figure v-if="record.image" class="dictionary-detail__figure">
        <!-- eslint-disable vue/html-self-closing -->
        <img :src="record.image.src" :alt="record.image.alt" />
        <!-- eslint-enable vue/html-self-closing -->
        <figcaption v-if="record.image.caption || record.image.credit">
          <span v-if="record.image.caption">{{ record.image.caption }}</span>
          <span v-if="record.image.credit">{{ record.image.credit }}</span>
        </figcaption>
      </figure>
    </div>

    <section
      v-if="sources.length"
      class="dictionary-detail__sources"
      aria-labelledby="dictionary-sources-title"
    >
      <h2 id="dictionary-sources-title">{{ t('navigation.sources') }}</h2>
      <ol>
        <li v-for="source in sources" :key="source.id">
          <h3>
            <a v-if="source.url" :href="source.url">{{ source.title }}</a>
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

.dictionary-detail__back {
  border-top: var(--border-rule);
  padding-top: var(--space-4);
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

.dictionary-detail__intro {
  padding-block: var(--space-16) var(--space-12);
}

.dictionary-detail__intro .eyebrow {
  margin-bottom: var(--space-8);
}

.dictionary-detail__intro .eyebrow span {
  margin-inline: var(--space-2);
  color: var(--color-border);
}

.dictionary-detail__intro h1 {
  max-width: 19ch;
  margin: 0;
  font-size: clamp(3.5rem, 7vw, 6.5rem);
  letter-spacing: -0.045em;
  overflow-wrap: break-word;
}

.dictionary-detail__story {
  display: grid;
  grid-template-columns: minmax(0, 42rem) minmax(0, 1fr);
  gap: clamp(3rem, 8vw, 9rem);
  border-top: var(--border-rule);
  padding-top: var(--space-12);
}

.dictionary-detail__body {
  min-width: 0;
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

.dictionary-detail__figure img {
  display: block;
  width: 100%;
  height: auto;
}

.dictionary-detail__figure figcaption {
  display: grid;
  gap: var(--space-1);
  border-top: var(--border-rule);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  color: var(--color-muted);
  font-size: var(--text-caption);
  line-height: 1.5;
}

.dictionary-detail__sources {
  display: grid;
  grid-template-columns: minmax(7rem, 11rem) minmax(0, 46rem);
  gap: var(--grid-gap);
  border-top: var(--border-rule);
  margin-top: var(--space-24);
  padding-top: var(--space-8);
}

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

@media (max-width: 56.25rem) {
  .dictionary-detail__story {
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.8fr);
    gap: var(--space-8);
  }
}

@media (max-width: 37.5rem) {
  .dictionary-detail {
    padding-block: var(--space-6) var(--space-16);
  }

  .dictionary-detail__intro {
    padding-block: var(--space-12) var(--space-8);
  }

  .dictionary-detail__intro h1 {
    font-size: clamp(2.8rem, 12vw, 4rem);
  }

  .dictionary-detail__story,
  .dictionary-detail__sources {
    display: block;
  }

  .dictionary-detail__story {
    padding-top: var(--space-8);
  }

  .dictionary-detail__figure {
    margin-top: var(--space-8);
  }

  .dictionary-detail__sources {
    margin-top: var(--space-16);
  }

  .dictionary-detail__sources h2 {
    margin-bottom: var(--space-6);
  }
}
</style>
