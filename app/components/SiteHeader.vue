<script setup lang="ts">
import { siteNavigation } from '~/utils/navigation'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()
const isYandexRoute = computed(() =>
  ['/', '/en', '/map', '/en/map'].includes(
    route.path.replace(/\/$/, '') || '/',
  ),
)
const menuOpen = ref(false)
const menuButton = ref<HTMLButtonElement | null>(null)
const nav = ref<HTMLElement | null>(null)

function isActive(path: string) {
  const target = localePath(path).replace(/\/$/, '') || '/'
  const current = route.path.replace(/\/$/, '') || '/'
  if (path === '/') return current === target
  if (path === '/map' && /^\/(?:en\/)?places\//.test(current)) return true
  return current === target || current.startsWith(`${target}/`)
}

async function toggleMenu() {
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) {
    await nextTick()
    nav.value?.querySelector('a')?.focus()
  }
}

function closeMenuOnEscape() {
  if (!menuOpen.value) return
  menuOpen.value = false
  menuButton.value?.focus()
}

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)
</script>

<template>
  <header class="site-header" @keydown.esc="closeMenuOnEscape">
    <div class="site-header__inner wide-container">
      <NuxtLink
        class="wordmark"
        :to="localePath('/')"
        :aria-label="t('navigation.home')"
        >1812<span class="wordmark__dot">.</span></NuxtLink
      >
      <nav
        id="primary-navigation"
        ref="nav"
        class="site-nav"
        :class="{ 'is-open': menuOpen }"
        :aria-label="t('navigation.primary')"
      >
        <NuxtLink
          v-for="item in siteNavigation"
          :key="item.to"
          class="site-nav__link"
          :to="localePath(item.to)"
          :aria-current="isActive(item.to) ? 'page' : undefined"
          @click="menuOpen = false"
          >{{ t(item.label) }}</NuxtLink
        >
      </nav>
      <div class="site-header__actions">
        <div
          class="language-switch"
          :aria-label="t('navigation.language')"
          role="group"
        >
          <NuxtLink
            v-for="code in ['ru', 'en'] as const"
            :key="code"
            :to="switchLocalePath(code)"
            :external="isYandexRoute && code !== locale"
            :lang="code"
            :aria-label="t(`language.${code}`)"
            :aria-current="locale === code ? 'true' : undefined"
            class="language-switch__link"
            >{{ code.toUpperCase() }}</NuxtLink
          >
        </div>
        <button
          ref="menuButton"
          class="menu-toggle"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="primary-navigation"
          @click="toggleMenu"
        >
          <span class="menu-toggle__icon" aria-hidden="true"
            ><span /><span
          /></span>
          <span>{{
            menuOpen ? t('navigation.close') : t('navigation.menu')
          }}</span>
        </button>
      </div>
    </div>
  </header>
</template>
