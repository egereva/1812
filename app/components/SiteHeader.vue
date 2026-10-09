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
const mobilePanel = ref<HTMLElement | null>(null)
const header = ref<HTMLElement | null>(null)
const { hidden, scrolled, pointerDown, focusChanged } = useHeaderMotion(
  header,
  menuOpen,
)
const mobileNavigation = [
  ...siteNavigation,
  { to: '/sources', label: 'navigation.sources' },
]
let restoreBackground: (() => void) | undefined
let desktopQuery: MediaQueryList | undefined

function releaseBackground() {
  restoreBackground?.()
  restoreBackground = undefined
}

function lockBackground() {
  const bodyOverflow = document.body.style.overflow
  const rootOverflow = document.documentElement.style.overflow
  const background = [...(header.value?.parentElement?.children ?? [])]
    .filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element !== header.value,
    )
    .map((element) => ({ element, inert: element.inert }))
  // Clip without creating a new scroll container for the sticky header.
  document.body.style.overflow = 'clip'
  document.documentElement.style.overflow = 'hidden'
  background.forEach(({ element }) => {
    element.inert = true
  })
  restoreBackground = () => {
    document.body.style.overflow = bodyOverflow
    document.documentElement.style.overflow = rootOverflow
    background.forEach(({ element, inert }) => {
      element.inert = inert
    })
  }
}

watch(
  menuOpen,
  (open) => {
    if (open) lockBackground()
    else releaseBackground()
  },
  { flush: 'sync' },
)

function closeOnDesktop(event: MediaQueryListEvent) {
  if (event.matches) menuOpen.value = false
}
onMounted(() => {
  desktopQuery = window.matchMedia('(width > 900px)')
  desktopQuery.addEventListener('change', closeOnDesktop)
})
onBeforeUnmount(() => {
  desktopQuery?.removeEventListener('change', closeOnDesktop)
  releaseBackground()
})

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
    mobilePanel.value?.querySelector('a')?.focus({ preventScroll: true })
  }
}

function closeMenuOnEscape() {
  if (!menuOpen.value) return
  menuOpen.value = false
  menuButton.value?.focus()
}

function handleMenuKeydown(event: KeyboardEvent) {
  if (!menuOpen.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMenuOnEscape()
    return
  }
  if (event.key !== 'Tab') return
  const controls = [
    ...(header.value?.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled)',
    ) ?? []),
  ].filter(
    (element) =>
      element.getClientRects().length &&
      getComputedStyle(element).visibility !== 'hidden' &&
      !element.closest('[inert]'),
  )
  const first = controls[0]
  const last = controls.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)
</script>

<template>
  <header
    ref="header"
    class="site-header"
    :class="{
      'site-header--hidden': hidden,
      'site-header--scrolled': scrolled,
      'site-header--menu-open': menuOpen,
    }"
    :role="menuOpen ? 'dialog' : undefined"
    :aria-modal="menuOpen ? true : undefined"
    :aria-label="menuOpen ? t('navigation.primary') : undefined"
    @pointerdown="pointerDown"
    @focusin="focusChanged"
    @focusout="focusChanged"
    @keydown="handleMenuKeydown"
  >
    <div class="site-header__inner wide-container">
      <NuxtLink
        class="wordmark"
        :to="localePath('/')"
        :aria-label="t('navigation.home')"
        @click="menuOpen = false"
        >1812<span class="wordmark__dot">.</span></NuxtLink
      >
      <nav
        id="primary-navigation"
        class="site-nav"
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
            :no-prefetch="isYandexRoute && code !== locale"
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
          :aria-label="
            menuOpen ? t('navigation.closeMenu') : t('navigation.openMenu')
          "
          :aria-expanded="menuOpen"
          aria-controls="mobile-navigation"
          aria-haspopup="dialog"
          @click="toggleMenu"
        >
          <span class="menu-toggle__icon" aria-hidden="true"
            ><span /><span
          /></span>
        </button>
      </div>
    </div>
    <Transition name="mobile-menu">
      <div
        v-show="menuOpen"
        id="mobile-navigation"
        ref="mobilePanel"
        class="mobile-menu"
        :inert="!menuOpen"
        :aria-hidden="!menuOpen"
      >
        <nav class="mobile-menu__nav" :aria-label="t('navigation.primary')">
          <NuxtLink
            v-for="item in mobileNavigation"
            :key="item.to"
            class="mobile-menu__link"
            :to="localePath(item.to)"
            :aria-current="isActive(item.to) ? 'page' : undefined"
            @click="menuOpen = false"
          >
            {{ t(item.label) }}
            <span v-if="isActive(item.to)" aria-hidden="true">↗</span>
          </NuxtLink>
        </nav>
        <div class="mobile-menu__footer">
          <p class="mobile-menu__label">{{ t('navigation.language') }}</p>
          <div
            class="mobile-menu__languages"
            role="group"
            :aria-label="t('navigation.language')"
          >
            <NuxtLink
              v-for="code in ['ru', 'en'] as const"
              :key="code"
              :to="switchLocalePath(code)"
              :external="isYandexRoute && code !== locale"
              :no-prefetch="isYandexRoute && code !== locale"
              :lang="code"
              :aria-label="t(`language.${code}`)"
              :aria-current="locale === code ? 'true' : undefined"
              @click="menuOpen = false"
              >{{ code.toUpperCase() }}</NuxtLink
            >
          </div>
          <p class="mobile-menu__description">{{ t('footer.description') }}</p>
          <p class="mobile-menu__edition">{{ t('footer.edition') }}</p>
        </div>
      </div>
    </Transition>
  </header>
</template>
