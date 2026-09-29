<script setup lang="ts">
import {
  getDictionaryEntries,
  getPlaces,
  getSiteContent,
} from '#shared/content/index'
import { getReadyHeroSlides } from '../data/heroSlides'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const readyHeroSlides = getReadyHeroSlides(
  useRuntimeConfig().public.heroMediaAvailableIds,
)
const site = computed(() => getSiteContent(locale.value))
const heroTitle = computed(() => site.value.siteTitle.replace(/^1812\.\s*/, ''))
const dictionary = computed(() =>
  getDictionaryEntries(locale.value).filter((entry) =>
    [
      'alexander-i',
      'borodino-battle',
      'kutuzov',
      'shevardino-redoubt',
    ].includes(entry.id),
  ),
)
const places = computed(() => getPlaces(locale.value).slice(0, 3))
useHead(() => ({ title: site.value.siteTitle }))
useSeoMeta({ description: () => site.value.siteDescription })
</script>

<template>
  <div class="home">
    <section
      class="home-hero"
      :class="{ 'home-hero--with-media': readyHeroSlides.length === 3 }"
      aria-labelledby="home-title"
    >
      <div class="home-hero__body">
        <div class="home-hero__identity page-container">
          <h1 id="home-title" :aria-label="site.siteTitle">
            <span class="home-hero__year">1812.</span>
            <span class="home-hero__title">{{ heroTitle }}</span>
          </h1>
          <p class="home-hero__description">{{ site.siteDescription }}</p>
        </div>
        <HeroSlider
          v-if="readyHeroSlides.length === 3"
          class="home-hero__slider"
          :slides="readyHeroSlides"
        />
      </div>
    </section>

    <section
      class="home-dictionary page-container"
      aria-labelledby="dictionary-title"
    >
      <div class="home-dictionary__layout">
        <div class="home-dictionary__intro">
          <p class="eyebrow">{{ t('home.dictionary.kicker') }}</p>
          <h2 id="dictionary-title">{{ t('navigation.dictionary') }}</h2>
          <p>{{ t('home.dictionary.description') }}</p>
          <NuxtLink class="home-link" :to="localePath('/dictionary')">
            {{ t('home.dictionary.cta') }} <span aria-hidden="true">↗</span>
          </NuxtLink>
        </div>
        <div class="home-dictionary__specimen">
          <div class="home-dictionary__alphabet">
            <NuxtLink
              v-for="entry in dictionary"
              :key="entry.id"
              :to="`${localePath('/dictionary')}#dictionary-letter-${entry.letter.codePointAt(0)}`"
              >{{ entry.letter }}</NuxtLink
            >
          </div>
          <ol class="home-dictionary__entries">
            <li v-for="entry in dictionary" :key="entry.id">
              <span class="home-dictionary__letter" aria-hidden="true">{{
                entry.letter
              }}</span>
              <NuxtLink :to="localePath(`/dictionary/${entry.slug}`)">{{
                entry.title
              }}</NuxtLink>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <HomepageTimeline />

    <section class="home-map page-container" aria-labelledby="map-title">
      <div class="home-rule" aria-hidden="true">
        <span>04 / 04</span>
      </div>
      <div class="home-map__layout">
        <div class="home-map__diagram" aria-hidden="true">
          <span class="home-map__axis home-map__axis--one" />
          <span class="home-map__axis home-map__axis--two" />
          <span class="home-map__ring home-map__ring--one" />
          <span class="home-map__ring home-map__ring--two" />
        </div>
        <div class="home-map__content">
          <p class="eyebrow">{{ t('home.map.kicker') }}</p>
          <h2 id="map-title">{{ t('navigation.map') }}</h2>
          <p>{{ t('home.map.description') }}</p>
          <ul class="home-map__places">
            <li v-for="place in places" :key="place.id">{{ place.title }}</li>
          </ul>
          <NuxtLink class="home-link" :to="localePath('/map')">
            {{ t('home.map.cta') }} <span aria-hidden="true">↗</span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  overflow: hidden;
}
.home-rule {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  border-top: var(--border-rule);
  padding-top: var(--space-2);
  color: var(--color-muted);
  font-size: var(--text-caption);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.home-hero {
  position: relative;
}
.home-hero__body {
  position: relative;
  min-height: 100svh;
}
.home-hero--with-media .home-hero__body {
  min-height: 0;
}
.home-hero--with-media .home-hero__body::after {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  width: min(65rem, 80vw);
  height: 100%;
  background: radial-gradient(
    ellipse 50% 47% at 38% 49%,
    rgb(243 240 232 / 68%),
    rgb(243 240 232 / 56%) 40%,
    rgb(243 240 232 / 30%) 70%,
    transparent 100%
  );
  content: '';
  pointer-events: none;
}
.home-hero__identity {
  position: relative;
  z-index: 2;
  padding-top: calc(5.75rem + var(--space-16));
}
.home-hero h1 {
  display: grid;
  gap: var(--space-2);
  max-width: 15ch;
  margin-bottom: var(--space-8);
  font-family: var(--font-display);
  font-weight: 400;
  letter-spacing: -0.05em;
}
.home-hero__year {
  color: var(--color-accent);
  font-size: clamp(7rem, 13vw, 12rem);
  line-height: 0.9;
}
.home-hero__title {
  font-size: clamp(3rem, 5vw, 4.5rem);
  line-height: 1.08;
}
.home-hero__description {
  max-width: 30rem;
  margin-bottom: 0;
  font-size: clamp(1.125rem, 1.4vw, 1.375rem);
  line-height: 1.55;
}
.home-hero--with-media .home-hero__identity {
  position: absolute;
  top: 49%;
  right: 0;
  left: 0;
  transform: translateY(-50%);
  padding-left: clamp(2.5rem, 13vw, 12rem);
  padding-block: 0;
  pointer-events: none;
}
.home-hero--with-media .home-hero__slider {
  position: relative;
  height: 100svh;
}
.home-dictionary,
.home-map {
  padding-block: var(--space-16) var(--space-24);
}
.home-dictionary__layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  gap: clamp(2rem, 8vw, 9rem);
  border-top: var(--border-rule);
  padding-top: var(--space-16);
}
.home-dictionary h2,
.home-map h2 {
  margin-bottom: var(--space-8);
  letter-spacing: -0.04em;
}
.home-dictionary__intro > p:not(.eyebrow),
.home-map__content > p:not(.eyebrow) {
  max-width: 30rem;
  color: var(--color-muted);
  font-size: var(--text-body-lg);
}
.home-link {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  gap: var(--space-8);
  margin-top: var(--space-8);
  border-bottom: 1px solid var(--color-accent);
  color: var(--color-accent);
  font-weight: 700;
  text-decoration: none;
}
.home-link span {
  font-size: 1.25rem;
  font-weight: 400;
}
.home-dictionary__specimen {
  min-width: 0;
}
.home-dictionary__alphabet {
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
  border-bottom: var(--border-rule);
  padding-bottom: var(--space-6);
  color: var(--color-accent);
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 5rem);
  line-height: 1;
}
.home-dictionary__alphabet a {
  color: var(--color-accent);
  text-decoration: none;
}
.home-dictionary__alphabet a:hover,
.home-dictionary__alphabet a:focus-visible {
  color: var(--color-accent-hover);
  text-decoration: underline;
  text-decoration-thickness: 1px;
}
.home-dictionary__entries {
  margin: 0;
  padding: 0;
  list-style: none;
}
.home-dictionary__entries li {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr);
  gap: var(--space-4);
  border-bottom: var(--border-rule);
  padding-block: var(--space-4);
  font-family: var(--font-display);
  font-size: clamp(1.15rem, 2vw, 1.75rem);
  line-height: 1.2;
}
.home-dictionary__entries a {
  width: fit-content;
  color: var(--color-ink);
  text-decoration: none;
}
.home-dictionary__entries a:hover,
.home-dictionary__entries a:focus-visible {
  color: var(--color-accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
}
.home-dictionary__letter {
  color: var(--color-accent);
  font-family: var(--font-body);
  font-size: var(--text-caption);
  font-weight: 700;
}
.home-map__layout {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(18rem, 2fr);
  gap: clamp(2rem, 7vw, 8rem);
  align-items: center;
  padding-top: var(--space-12);
}
.home-map__diagram {
  position: relative;
  min-height: 31rem;
  overflow: hidden;
  border: var(--border-rule);
  background-image:
    linear-gradient(
      to right,
      transparent calc(100% - 1px),
      var(--color-border) calc(100% - 1px)
    ),
    linear-gradient(
      to bottom,
      transparent calc(100% - 1px),
      var(--color-border) calc(100% - 1px)
    );
  background-size: 3.5rem 3.5rem;
  opacity: 0.8;
}
.home-map__axis {
  position: absolute;
  width: 125%;
  height: 1px;
  background: var(--color-accent);
  transform-origin: left center;
}
.home-map__axis--one {
  top: 75%;
  left: -10%;
  transform: rotate(-26deg);
}
.home-map__axis--two {
  top: 18%;
  left: 12%;
  transform: rotate(42deg);
}
.home-map__ring {
  position: absolute;
  width: 9rem;
  height: 9rem;
  border: 1px solid var(--color-accent);
  border-radius: 50%;
}
.home-map__ring--one {
  top: 13%;
  left: 57%;
}
.home-map__ring--two {
  right: 57%;
  bottom: 9%;
  width: 5rem;
  height: 5rem;
}
.home-map__places {
  margin: var(--space-8) 0 0;
  padding: 0;
  list-style: none;
}
.home-map__places li {
  border-top: var(--border-rule);
  padding-block: var(--space-3);
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 1.7vw, 1.5rem);
  line-height: 1.3;
}
@media (max-width: 56.25rem) {
  .home-hero--with-media .home-hero__body::after {
    width: min(46rem, 90vw);
  }
  .home-hero__identity {
    padding-top: calc(4.75rem + var(--space-12));
  }
  .home-hero__year {
    font-size: clamp(6rem, 14vw, 8rem);
  }
  .home-hero__title {
    font-size: clamp(2.75rem, 6vw, 4rem);
  }
  .home-map__layout {
    grid-template-columns: minmax(0, 1fr) minmax(15rem, 1fr);
    gap: var(--space-8);
  }
  .home-map__diagram {
    min-height: 26rem;
  }
}
@media (max-width: 37.5rem) {
  .home-hero--with-media .home-hero__body::after {
    width: 100%;
    background: radial-gradient(
      ellipse 72% 37% at 36% 44%,
      rgb(243 240 232 / 74%),
      rgb(243 240 232 / 60%) 45%,
      rgb(243 240 232 / 35%) 72%,
      transparent 100%
    );
  }
  .home-hero__identity {
    padding-top: calc(4.75rem + var(--space-8));
  }
  .home-hero--with-media .home-hero__identity {
    top: 44%;
    padding-left: var(--gutter);
  }
  .home-hero h1 {
    max-width: 15ch;
    margin-bottom: var(--space-6);
  }
  .home-hero__year {
    font-size: clamp(4.5rem, 20vw, 5.5rem);
  }
  .home-hero__title {
    font-size: clamp(2rem, 8.2vw, 2.75rem);
  }
  .home-hero__description {
    max-width: 33ch;
    font-size: 1rem;
    line-height: 1.45;
  }
  .home-dictionary,
  .home-map {
    padding-block: var(--space-12) var(--space-16);
  }
  .home-dictionary__layout,
  .home-map__layout {
    grid-template-columns: 1fr;
    gap: var(--space-12);
    padding-top: var(--space-12);
  }
  .home-dictionary__alphabet {
    font-size: clamp(2.5rem, 12vw, 4rem);
  }
  .home-map__diagram {
    min-height: 15rem;
  }
  .home-map__content {
    grid-row: 1;
  }
}
</style>
