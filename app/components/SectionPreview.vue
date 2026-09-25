<script setup lang="ts">
const props = defineProps<{ titleKey: string }>()
const { t } = useI18n()

useHead(() => ({ title: `${t(props.titleKey)} — 1812` }))
</script>

<template>
  <div class="section-preview page-container">
    <div class="section-preview__index" aria-hidden="true">1812 /</div>
    <div class="section-preview__body">
      <p class="eyebrow">{{ t('sections.eyebrow') }}</p>
      <h1>{{ t(titleKey) }}</h1>
      <p>{{ t('sections.preview') }}</p>
    </div>
  </div>
</template>
