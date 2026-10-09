<script setup lang="ts">
import { siteNavigation } from '~/utils/navigation'

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <footer class="site-footer">
    <div class="wide-container site-footer__inner">
      <div class="site-footer__identity">
        <NuxtLink class="site-footer__year" :to="localePath('/')"
          >1812<span>.</span></NuxtLink
        >
        <p>{{ t('footer.title') }}</p>
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

<style scoped>
.site-footer {
  border-top: 1px solid rgb(112 40 55 / 30%);
  background: #302d2a;
}
.site-footer__bottom {
  border-top-color: rgb(201 196 186 / 24%);
}
.site-footer__inner {
  container-type: inline-size;
  container-name: footer-reflow;
}
.site-footer__identity,
.site-footer__bottom {
  min-width: 0;
  overflow-wrap: anywhere;
}
.site-footer__nav a {
  max-width: 100%;
  overflow-wrap: anywhere;
}
@media (max-width: 37.5rem) {
  .site-footer__inner {
    grid-template-columns: minmax(0, 1fr);
  }
}
@container footer-reflow (width < 16rem) {
  .site-footer__nav {
    grid-template-columns: minmax(0, 1fr);
  }
  .site-footer__bottom {
    flex-direction: column;
  }
}
</style>
