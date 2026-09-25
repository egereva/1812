<script setup lang="ts">
import { getSiteContent } from '#shared/content/index'
import { siteNavigation } from '~/utils/navigation'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const site = computed(() => getSiteContent(locale.value))
</script>

<template>
  <footer class="site-footer">
    <div class="wide-container site-footer__inner">
      <div class="site-footer__identity">
        <NuxtLink class="site-footer__year" :to="localePath('/')"
          >1812<span>.</span></NuxtLink
        >
        <p>{{ site.siteTitle }}</p>
        <small>{{ t('footer.description') }}</small>
      </div>
      <nav class="site-footer__nav" :aria-label="t('navigation.footer')">
        <NuxtLink
          v-for="item in siteNavigation"
          :key="item.to"
          :to="localePath(item.to)"
          >{{ t(item.label) }}</NuxtLink
        >
        <NuxtLink :to="localePath('/sources')">{{
          t('navigation.sources')
        }}</NuxtLink>
      </nav>
      <div class="site-footer__bottom">
        <span>{{ t('footer.edition') }}</span>
        <span>{{ t('footer.languages') }}</span>
      </div>
    </div>
  </footer>
</template>
