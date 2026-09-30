<script setup lang="ts">
import { getPlaceBySlug } from '#shared/content/index'
import { mapPlaceUrl } from '~/data/mapPresentation'

const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()
const record = getPlaceBySlug(locale.value, String(route.params.slug ?? ''))
if (!record)
  throw createError({ statusCode: 404, statusMessage: 'Place not found' })
</script>

<template>
  <article class="technical-detail text-container">
    <p class="eyebrow">{{ $t('sections.place') }}</p>
    <h1>{{ record.title }}</h1>
    <p class="lead">{{ record.shortDescription }}</p>
    <NuxtLink
      class="place-map-action"
      :to="mapPlaceUrl(localePath('/map'), record.slug)"
    >
      {{ $t('map.showOnMap') }} <span aria-hidden="true">→</span>
    </NuxtLink>
  </article>
</template>

<style scoped>
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
