<script setup lang="ts">
import { getSourceGroups } from '#shared/content/index'

const { locale, t } = useI18n()
const groups = computed(() => {
  const sources = getSourceGroups(locale.value)
  return [
    { id: 'research', title: t('sources.research'), records: sources.research },
    { id: 'media', title: t('sources.media'), records: sources.media },
  ]
})
const counts = computed(() => ({
  research: groups.value[0]!.records.length,
  media: groups.value[1]!.records.length,
  total: groups.value.reduce((total, group) => total + group.records.length, 0),
}))
const sourceHost = (url: string) => new URL(url).hostname

usePageSeo(
  () => `${t('navigation.sources')} — 1812`,
  () => t('sources.description'),
)
</script>

<template>
  <article
    class="source-catalog page-container"
    aria-labelledby="sources-title"
  >
    <header class="source-catalog__header">
      <p class="eyebrow">{{ t('sections.eyebrow') }}</p>
      <h1 id="sources-title">{{ t('navigation.sources') }}</h1>
      <p class="source-catalog__lead">{{ t('sources.description') }}</p>
      <p class="source-catalog__summary">{{ t('sources.summary', counts) }}</p>
      <nav :aria-label="t('sources.contents')">
        <ul class="source-catalog__contents">
          <li v-for="group in groups" :key="group.id">
            <a :href="`#${group.id}`">{{ group.title }}</a>
          </li>
        </ul>
      </nav>
    </header>

    <section
      v-for="group in groups"
      :id="group.id"
      :key="group.id"
      class="source-catalog__section"
      :aria-labelledby="`${group.id}-title`"
      tabindex="-1"
    >
      <header class="source-catalog__section-heading">
        <h2 :id="`${group.id}-title`">{{ group.title }}</h2>
        <p class="eyebrow">
          {{ t('sources.count', { count: group.records.length }) }}
        </p>
      </header>
      <ol class="source-catalog__list">
        <li v-for="source in group.records" :id="source.id" :key="source.id">
          <h3>
            <WebsiteLink v-if="source.url" :href="source.url">{{
              source.title
            }}</WebsiteLink>
            <template v-else>{{ source.title }}</template>
          </h3>
          <dl class="source-catalog__metadata">
            <div v-if="source.author">
              <dt>{{ t('sources.author') }}</dt>
              <dd>{{ source.author }}</dd>
            </div>
            <div v-if="source.publisher">
              <dt>{{ t('sources.publisher') }}</dt>
              <dd>{{ source.publisher }}</dd>
            </div>
            <div v-if="source.year">
              <dt>{{ t('sources.year') }}</dt>
              <dd>{{ source.year }}</dd>
            </div>
            <div v-if="source.accessedAt">
              <dt>{{ t('sources.accessed') }}</dt>
              <dd>
                <time :datetime="source.accessedAt">{{
                  source.accessedAt
                }}</time>
              </dd>
            </div>
          </dl>
          <p v-if="source.url" class="source-catalog__domain">
            {{ sourceHost(source.url) }}
          </p>
        </li>
      </ol>
    </section>
  </article>
</template>

<style scoped>
.source-catalog {
  padding-block: var(--space-16) var(--space-24);
}

.source-catalog__header {
  max-width: 64rem;
  padding-bottom: var(--space-16);
}

.source-catalog__header h1 {
  margin-block: var(--space-4) var(--space-8);
}

.source-catalog__lead {
  max-width: var(--container-text);
  font-size: var(--text-body-lg);
}

.source-catalog__summary {
  margin-block: var(--space-6);
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}

.source-catalog__contents {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-8);
  margin: 0;
  padding: 0;
  list-style: none;
}

.source-catalog__contents a {
  display: inline-block;
  padding-block: var(--space-3);
  color: var(--color-accent);
}

.source-catalog__section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: var(--grid-gap);
  padding-block: var(--space-12);
  border-top: var(--border-rule);
  scroll-margin-top: var(--space-8);
}

.source-catalog__section-heading h2 {
  font-size: var(--text-h3);
  line-height: 1.25;
}

.source-catalog__list {
  margin: 0;
  padding-left: var(--space-8);
  min-width: 0;
}

.source-catalog__list > li {
  padding-block: var(--space-6);
  padding-left: var(--space-3);
  border-bottom: var(--border-rule);
  overflow-wrap: anywhere;
  scroll-margin-top: var(--space-8);
}

.source-catalog__list > li:first-child {
  padding-top: 0;
}

.source-catalog__list > li:last-child {
  border-bottom: 0;
}

.source-catalog__list > li::marker {
  color: var(--color-accent);
  font-size: var(--text-body-sm);
}

.source-catalog__list h3 {
  margin-bottom: var(--space-4);
  font-size: var(--text-body-lg);
  line-height: 1.5;
  text-wrap: pretty;
}

.source-catalog__list h3 a {
  text-decoration-color: var(--color-border);
}

.source-catalog__metadata {
  margin: 0;
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}

.source-catalog__metadata div {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--space-2);
}

.source-catalog__metadata dt::after {
  content: ':';
}

.source-catalog__metadata dd {
  margin: 0;
}

.source-catalog__domain {
  margin-block: var(--space-3) 0;
  color: var(--color-accent);
  font-size: var(--text-caption);
}

@media (max-width: 767px) {
  .source-catalog {
    padding-block: var(--space-12) var(--space-16);
  }

  .source-catalog__header {
    padding-bottom: var(--space-8);
  }

  .source-catalog__section {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-6);
    padding-block: var(--space-8);
  }
}
</style>
