<script setup lang="ts">
const route = useRoute()
const isHomepage = computed(() =>
  ['/', '/en'].includes(route.path.replace(/\/$/, '') || '/'),
)

useSiteSeo()
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
