<script setup lang="ts">
import { getDictionaryEntries } from '#shared/content/index'
import type { DictionaryEntry } from '#shared/types/content'

interface DictionaryGroup {
  letter: string
  id: string
  entries: DictionaryEntry[]
}

const { locale, t } = useI18n()
const localePath = useLocalePath()

const groups = computed<DictionaryGroup[]>(() => {
  const collator = new Intl.Collator(locale.value, { sensitivity: 'base' })
  const byLetter = new Map<string, DictionaryEntry[]>()

  for (const entry of getDictionaryEntries(locale.value)) {
    const entries = byLetter.get(entry.letter) ?? []
    entries.push(entry)
    byLetter.set(entry.letter, entries)
  }

  return [...byLetter.entries()]
    .sort(([a], [b]) => collator.compare(a, b))
    .map(([letter, entries]) => ({
      letter,
      id: `dictionary-letter-${letter.codePointAt(0)}`,
      entries: entries.sort(
        (a, b) =>
          collator.compare(a.title, b.title) || a.id.localeCompare(b.id),
      ),
    }))
})

function goToLetter(event: MouseEvent, id: string) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return

  const target = document.getElementById(id)
  if (!target) return

  event.preventDefault()
  target.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'instant'
      : 'smooth',
    block: 'start',
  })
  window.history.replaceState(null, '', `#${id}`)
}

usePageSeo(
  () => t('navigation.dictionary'),
  () => t('home.dictionary.description'),
)
</script>

<template>
  <div class="dictionary-page page-container">
    <header class="dictionary-page__intro">
      <p class="eyebrow">{{ t('home.dictionary.kicker') }}</p>
      <h1>{{ t('navigation.dictionary') }}</h1>
      <p class="dictionary-page__description lead">
        {{ t('home.dictionary.description') }}
      </p>
    </header>

    <div class="dictionary-page__index">
      <nav class="dictionary-alphabet" :aria-label="t('dictionary.alphabet')">
        <p class="dictionary-alphabet__label">{{ t('dictionary.alphabet') }}</p>
        <ol>
          <li v-for="group in groups" :key="group.id">
            <a :href="`#${group.id}`" @click="goToLetter($event, group.id)">
              {{ group.letter }}
            </a>
          </li>
        </ol>
      </nav>

      <div class="dictionary-groups">
        <section
          v-for="group in groups"
          :id="group.id"
          :key="group.id"
          class="dictionary-group"
          :aria-labelledby="`${group.id}-heading`"
        >
          <h2 :id="`${group.id}-heading`" class="dictionary-group__letter">
            {{ group.letter }}
          </h2>
          <ol class="dictionary-group__entries">
            <li v-for="entry in group.entries" :key="entry.id">
              <NuxtLink
                class="dictionary-entry"
                :to="localePath(`/dictionary/${entry.slug}`)"
              >
                <h3>{{ entry.title }}</h3>
                <p>{{ entry.shortDescription }}</p>
                <span class="dictionary-entry__arrow" aria-hidden="true"
                  >↗</span
                >
              </NuxtLink>
            </li>
          </ol>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dictionary-page {
  padding-block: var(--space-16) var(--space-24);
}

.dictionary-page__intro {
  padding-bottom: var(--space-16);
}

.dictionary-page__intro .eyebrow {
  margin-bottom: var(--space-8);
}

.dictionary-page__intro h1 {
  margin-bottom: var(--space-8);
  font-size: clamp(4.5rem, 10vw, 9rem);
  letter-spacing: -0.055em;
}

.dictionary-page__description {
  max-width: 35rem;
  margin-bottom: 0;
  color: var(--color-muted);
}

.dictionary-page__index {
  display: grid;
  grid-template-columns: minmax(7rem, 11rem) minmax(0, 1fr);
  gap: var(--grid-gap);
  border-top: var(--border-rule);
}

.dictionary-alphabet {
  position: sticky;
  top: calc(5.75rem + var(--space-6));
  align-self: start;
  padding-top: var(--space-8);
}

.dictionary-alphabet__label {
  margin-bottom: var(--space-6);
  color: var(--color-muted);
  font-size: var(--text-overline);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.dictionary-alphabet ol,
.dictionary-group__entries {
  margin: 0;
  padding: 0;
  list-style: none;
}

.dictionary-alphabet ol {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
}

.dictionary-alphabet a {
  display: grid;
  min-width: 2.25rem;
  min-height: 2.75rem;
  place-items: center;
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 1.375rem;
  text-decoration: none;
}

.dictionary-alphabet a:hover,
.dictionary-alphabet a:focus-visible {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 0.3em;
}

.dictionary-group {
  display: grid;
  grid-template-columns: minmax(4rem, 8rem) minmax(0, 1fr);
  gap: var(--space-6);
  padding-block: var(--space-16) var(--space-6);
  scroll-margin-top: calc(5.75rem + var(--space-6));
}

.dictionary-group + .dictionary-group {
  border-top: var(--border-rule);
}

.dictionary-group__letter {
  margin: -0.15em 0 0;
  color: var(--color-accent);
  font-size: clamp(4.5rem, 7vw, 7rem);
  line-height: 1;
}

.dictionary-group__entries {
  min-width: 0;
}

.dictionary-group__entries li:not(:last-child) {
  border-bottom: var(--border-rule);
}

.dictionary-entry {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr) 1.25rem;
  gap: var(--space-6);
  align-items: baseline;
  padding-block: var(--space-6);
  text-decoration: none;
}

.dictionary-entry h3 {
  min-width: 0;
  margin: 0;
  font-size: clamp(1.35rem, 2vw, 1.8rem);
  line-height: 1.18;
  overflow-wrap: break-word;
}

.dictionary-entry p {
  min-width: 0;
  margin: 0;
  color: var(--color-muted);
  font-size: var(--text-body-sm);
  line-height: 1.5;
}

.dictionary-entry__arrow {
  color: var(--color-accent);
  font-size: 1.125rem;
  line-height: 1;
  transition: transform var(--duration-short) ease;
}

.dictionary-entry:hover h3,
.dictionary-entry:focus-visible h3 {
  color: var(--color-accent);
}

.dictionary-entry:hover .dictionary-entry__arrow,
.dictionary-entry:focus-visible .dictionary-entry__arrow {
  transform: translate(2px, -2px);
}

@media (max-width: 56.25rem) {
  .dictionary-page__intro {
    padding-bottom: var(--space-12);
  }

  .dictionary-page__index {
    display: block;
  }

  .dictionary-alphabet {
    position: static;
    padding-block: var(--space-6) var(--space-8);
  }

  .dictionary-alphabet__label {
    margin-bottom: var(--space-3);
  }

  .dictionary-alphabet ol {
    gap: var(--space-1) var(--space-3);
  }

  .dictionary-group {
    grid-template-columns: minmax(3.5rem, 6rem) minmax(0, 1fr);
    padding-block: var(--space-12) var(--space-6);
    scroll-margin-top: calc(4.75rem + var(--space-6));
  }
}

@media (max-width: 37.5rem) {
  .dictionary-page {
    padding-block: var(--space-12) var(--space-16);
  }

  .dictionary-page__intro h1 {
    font-size: clamp(3.5rem, 16vw, 5rem);
  }

  .dictionary-group {
    display: block;
  }

  .dictionary-group__letter {
    margin-bottom: var(--space-6);
    font-size: 5rem;
  }

  .dictionary-entry {
    grid-template-columns: minmax(0, 1fr) 1.25rem;
    gap: var(--space-2) var(--space-4);
    padding-block: var(--space-6);
  }

  .dictionary-entry h3 {
    grid-column: 1;
  }

  .dictionary-entry p {
    grid-column: 1;
  }

  .dictionary-entry__arrow {
    grid-column: 2;
    grid-row: 1;
  }
}
</style>
