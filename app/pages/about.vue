<script setup lang="ts">
import { getSiteContent } from '#shared/content/index'

const { locale } = useI18n()
const localePath = useLocalePath()
const about = computed(() => getSiteContent(locale.value).about)

useHead(() => ({ title: `${about.value.title} — 1812` }))
useSeoMeta({ description: () => about.value.description })
</script>

<template>
  <article class="about page-container" aria-labelledby="about-title">
    <header class="about__header">
      <p class="eyebrow">{{ getSiteContent(locale).siteTitle }}</p>
      <h1 id="about-title">{{ about.title }}</h1>
      <p class="about__lead">{{ about.lead }}</p>
    </header>

    <section
      v-for="(section, index) in about.sections"
      :key="section.id"
      class="about__section"
      :aria-labelledby="`about-${section.id}`"
    >
      <div class="about__heading">
        <span class="about__number" aria-hidden="true">0{{ index + 1 }}</span>
        <h2 :id="`about-${section.id}`">{{ section.title }}</h2>
      </div>
      <div class="about__prose">
        <p v-for="paragraph in section.paragraphs" :key="paragraph">
          {{ paragraph }}
        </p>
      </div>
    </section>

    <nav class="about__explore" :aria-label="about.exploreLabel">
      <p class="eyebrow">{{ about.exploreLabel }}</p>
      <ul>
        <li v-for="link in about.links" :key="link.route">
          <NuxtLink :to="localePath(link.route)">{{ link.label }}</NuxtLink>
        </li>
      </ul>
    </nav>
  </article>
</template>

<style scoped>
.about {
  padding-block: var(--space-16) var(--space-24);
}

.about__header {
  max-width: 64rem;
  padding-bottom: var(--space-16);
}

.about__header h1 {
  margin-block: var(--space-4) var(--space-8);
}

.about__lead {
  max-width: var(--container-text);
  font-size: var(--text-body-lg);
  line-height: 1.7;
}

.about__section {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  gap: var(--grid-gap);
  padding-block: var(--space-12);
  border-top: var(--border-rule);
}

.about__heading {
  max-width: 30rem;
}

.about__number {
  display: block;
  margin-bottom: var(--space-4);
  color: var(--color-accent);
  font-size: 0.875rem;
}

.about__heading h2 {
  font-size: var(--text-h3);
  line-height: 1.2;
}

.about__prose {
  max-width: var(--container-text);
  line-height: 1.8;
}

.about__prose p + p {
  margin-top: var(--space-6);
}

.about__explore {
  padding-top: var(--space-8);
  border-top: var(--border-rule);
}

.about__explore ul {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-8);
  margin-top: var(--space-4);
  padding: 0;
  list-style: none;
}

.about__explore a {
  display: inline-block;
  padding-block: var(--space-3);
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 0.25em;
}

@media (max-width: 767px) {
  .about {
    padding-block: var(--space-12) var(--space-16);
  }

  .about__header {
    padding-bottom: var(--space-12);
  }

  .about__section {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-6);
    padding-block: var(--space-8);
  }
}
</style>
