<script setup lang="ts">
import {
  getDictionaryEntries,
  getPlaces,
  getSiteContent,
} from '#shared/content/index'
import { getReadyHeroSlides } from '../data/heroSlides'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const home = ref<HTMLElement | null>(null)
useHomepageReveal(home)
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
const mapPlaces = computed(() => getPlaces(locale.value))
const places = computed(() =>
  ['fili-village', 'kutuzov-hut', 'intercession-church-fili'].flatMap((id) =>
    mapPlaces.value.filter((place) => place.id === id),
  ),
)
usePageSeo(
  () => site.value.siteTitle,
  () => site.value.siteDescription,
)
</script>

<template>
  <div ref="home" class="home">
    <section
      class="home-hero"
      :class="{ 'home-hero--with-media': readyHeroSlides.length === 3 }"
      aria-labelledby="home-title"
    >
      <div class="home-hero__body">
        <div class="home-hero__identity page-container">
          <div class="home-hero__copy">
            <h1 id="home-title" :aria-label="site.siteTitle">
              <span class="home-hero__year">1812.</span>
              <span class="home-hero__title">{{ heroTitle }}</span>
            </h1>
            <p class="home-hero__description">{{ site.siteDescription }}</p>
          </div>
        </div>
        <HeroSlider
          v-if="readyHeroSlides.length === 3"
          class="home-hero__slider"
          :slides="readyHeroSlides"
        />
      </div>
    </section>

    <section
      class="home-introduction page-container"
      data-reveal
      aria-labelledby="home-introduction-title"
    >
      <header>
        <p class="eyebrow">{{ site.homeIntroduction.eyebrow }}</p>
        <h2 id="home-introduction-title">{{ site.homeIntroduction.title }}</h2>
      </header>
      <div class="home-introduction__prose">
        <p
          v-for="paragraph in site.homeIntroduction.paragraphs"
          :key="paragraph"
        >
          {{ paragraph }}
        </p>
      </div>
    </section>

    <section
      class="home-dictionary page-container"
      data-reveal
      aria-labelledby="dictionary-title"
    >
      <div class="home-dictionary__layout">
        <div class="home-dictionary__intro">
          <p class="eyebrow">{{ t('home.dictionary.kicker') }}</p>
          <h2 id="dictionary-title">{{ t('navigation.dictionary') }}</h2>
          <p>{{ t('home.dictionary.description') }}</p>
          <NuxtLink
            class="home-link editorial-link"
            :to="localePath('/dictionary')"
          >
            {{ t('home.dictionary.cta') }} <LinkArrow />
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

    <HomepageTimeline data-reveal />

    <section
      class="home-map page-container"
      data-reveal
      aria-labelledby="map-title"
    >
      <div class="home-map__layout">
        <div class="home-map__content">
          <p class="eyebrow">{{ t('map.kicker') }}</p>
          <h2 id="map-title">{{ t('navigation.map') }}</h2>
          <p>{{ t('home.map.description', { count: mapPlaces.length }) }}</p>
          <NuxtLink class="home-link editorial-link" :to="localePath('/map')">
            {{ t('home.map.cta') }} <LinkArrow />
          </NuxtLink>
        </div>
        <div class="home-map__fragment">
          <HomepageMapPreview :places="mapPlaces" />
          <ul class="home-map__places">
            <li v-for="place in places" :key="place.id">
              <NuxtLink :to="localePath(`/places/${place.slug}`)">{{
                place.title
              }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  overflow: hidden;
}
.home-hero {
  position: relative;
  overflow: clip;
}
.home-hero__body {
  position: relative;
  min-height: 100svh;
}
.home-hero--with-media .home-hero__body {
  min-height: 0;
}
.home-hero__copy {
  position: relative;
  isolation: isolate;
  width: min(100%, clamp(30rem, 42vw, 64rem));
}
.home-hero--with-media .home-hero__copy::before {
  position: absolute;
  z-index: -1;
  inset: calc(-1 * clamp(4rem, 6vw, 7rem)) calc(-1 * clamp(4rem, 8vw, 8rem));
  background:
    radial-gradient(
      ellipse 80% 75% at 35% 35%,
      rgb(243 240 232 / 68%) 0%,
      rgb(243 240 232 / 56%) 40%,
      rgb(243 240 232 / 30%) 70%,
      transparent 100%
    ),
    radial-gradient(
      ellipse 65% 30% at 35% 70%,
      rgb(243 240 232 / 46%) 0%,
      rgb(243 240 232 / 38%) 40%,
      rgb(243 240 232 / 18%) 70%,
      transparent 100%
    );
  mask-image:
    linear-gradient(to right, transparent, #000 12%, #000 80%, transparent),
    linear-gradient(to bottom, transparent, #000 12%, #000 90%, transparent);
  mask-composite: intersect;
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
  max-width: 100%;
  margin-bottom: var(--space-8);
  font-family: var(--font-display);
  font-weight: 400;
  letter-spacing: -0.05em;
}
.home-hero__year {
  color: var(--color-accent);
  font-size: clamp(7rem, min(12vw, 23svh), 15rem);
  line-height: 0.9;
}
.home-hero__title {
  font-size: clamp(3rem, min(4.2vw + 0.5rem, 11svh), 7rem);
  line-height: 1.08;
}
.home-hero__description {
  max-width: max(30rem, 38ch);
  margin-bottom: 0;
  font-size: clamp(1.125rem, 0.8vw + 0.5rem, 1.875rem);
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
.home-introduction {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  gap: var(--grid-gap);
  padding-block: var(--space-24) var(--space-12);
}
.home-introduction h2 {
  max-width: 14ch;
  margin-bottom: 0;
  font-size: var(--text-h2);
}
.home-introduction__prose {
  max-width: var(--container-text);
  font-size: var(--text-body-lg);
  line-height: 1.7;
}
.home-introduction__prose p {
  margin-bottom: var(--space-6);
}
.home-introduction__prose p:last-child {
  margin-bottom: 0;
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
.home-link .link-arrow {
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
  grid-template-areas: 'fragment content';
  gap: clamp(2rem, 7vw, 8rem);
  align-items: center;
  /* Preserve the approved spacing after removing this section's 1px rule and 8px padding. */
  padding-top: calc(var(--space-12) + var(--space-2) + 1px);
}
.home-map__content {
  grid-area: content;
  min-width: 0;
}
.home-map__fragment {
  grid-area: fragment;
  min-width: 0;
}
.home-map {
  min-height: 0;
  padding-bottom: var(--space-12);
}
.home-map__places {
  margin: var(--space-4) 0 0;
  padding: 0;
  list-style: none;
}
.home-map__places li {
  border-top: var(--border-rule);
  font-family: var(--font-display);
  font-size: clamp(1rem, 1.4vw, 1.25rem);
  line-height: 1.3;
}
.home-map__places a {
  display: flex;
  min-height: 2.75rem;
  align-items: center;
  padding-block: var(--space-3);
  color: var(--color-ink);
  text-decoration: none;
}
.home-map__places a:hover,
.home-map__places a:focus-visible {
  color: var(--color-accent);
}
@media (max-width: 56.25rem) {
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
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'content' 'fragment';
    gap: var(--space-8);
  }
}
@media (max-width: 37.5rem) {
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
  .home-introduction {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-8);
    padding-block: var(--space-12);
  }
  .home-map {
    padding-bottom: var(--space-12);
  }
  .home-dictionary__layout,
  .home-map__layout {
    grid-template-columns: 1fr;
    gap: var(--space-12);
    padding-top: var(--space-12);
  }
  .home-map__layout {
    gap: var(--space-8);
    padding-top: calc(var(--space-12) + var(--space-2) + 1px);
  }
  .home-dictionary__alphabet {
    font-size: clamp(2.5rem, 12vw, 4rem);
  }
}
</style>
