import { headerScrollState } from '~/utils/headerScroll'

export function useHeaderMotion(
  header: Ref<HTMLElement | null>,
  menuOpen: Ref<boolean>,
) {
  const hidden = ref(false)
  const scrolled = ref(false)
  let state = { y: 0, direction: 0, travel: 0, hidden: false }
  let frame = 0
  let pointerActive = false

  function update() {
    frame = 0
    const element = header.value
    const pinned =
      menuOpen.value ||
      pointerActive ||
      !!element?.querySelector(':focus-visible')
    state = headerScrollState(
      state,
      window.scrollY,
      element?.offsetHeight ?? 92,
      !!pinned,
    )
    if (pinned) state = { ...state, direction: 0, travel: 0 }
    hidden.value = state.hidden
    scrolled.value = state.y > 8
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(update)
  }
  function pointerDown(event: PointerEvent) {
    if (!(event.target instanceof Element)) return
    if (!event.target.closest('a, button')) return
    pointerActive = true
    schedule()
  }
  function releasePointer() {
    if (!pointerActive) return
    pointerActive = false
    schedule()
  }
  function focusChanged() {
    schedule()
  }
  watch(menuOpen, schedule)
  const route = useRoute()
  watch(
    () => route.fullPath,
    () => {
      pointerActive = false
      hidden.value = false
      state = { y: window.scrollY, direction: 0, travel: 0, hidden: false }
      schedule()
    },
  )
  onMounted(() => {
    document.addEventListener('pointerup', releasePointer, { passive: true })
    document.addEventListener('pointercancel', releasePointer, {
      passive: true,
    })
    window.addEventListener('blur', releasePointer)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    update()
  })
  onBeforeUnmount(() => {
    cancelAnimationFrame(frame)
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    document.removeEventListener('pointerup', releasePointer)
    document.removeEventListener('pointercancel', releasePointer)
    window.removeEventListener('blur', releasePointer)
  })
  return { hidden, scrolled, pointerDown, focusChanged }
}
