<script setup lang="ts">
const { locale } = useI18n()
const route = useRoute()
const isHomepage = computed(() =>
  ['/', '/en'].includes(route.path.replace(/\/$/, '') || '/'),
)

useHead(() => ({ htmlAttrs: { lang: locale.value === 'en' ? 'en' : 'ru' } }))
</script>

<template>
  <div class="site-shell" :class="{ 'site-shell--home': isHomepage }">
    <a class="skip-link" href="#main-content">{{ $t('accessibility.skip') }}</a>
    <SiteHeader />
    <main id="main-content" class="site-main" tabindex="-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
