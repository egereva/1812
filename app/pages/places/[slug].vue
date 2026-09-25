<script setup lang="ts">
import { getPlaceBySlug } from '#shared/content/index'

const route = useRoute()
const { locale } = useI18n()
const record = getPlaceBySlug(locale.value, String(route.params.slug ?? ''))
if (!record)
  throw createError({ statusCode: 404, statusMessage: 'Place not found' })
</script>

<template>
  <article class="technical-detail text-container">
    <p class="eyebrow">{{ $t('sections.place') }}</p>
    <h1>{{ record.title }}</h1>
    <p class="lead">{{ record.shortDescription }}</p>
  </article>
</template>
