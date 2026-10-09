export function useHomepageReveal(root: Ref<HTMLElement | null>) {
  let observer: IntersectionObserver | undefined
  let motion: MediaQueryList | undefined
  let sections: HTMLElement[] = []
  function reveal(element: HTMLElement) {
    element.classList.remove('reveal-pending')
    observer?.unobserve(element)
  }
  function focus(event: FocusEvent) {
    const section = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-reveal]',
    )
    if (section) reveal(section)
  }
  function preference() {
    if (!motion?.matches) return
    sections.forEach(reveal)
    observer?.disconnect()
  }
  onMounted(() => {
    motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    motion.addEventListener('change', preference)
    root.value?.addEventListener('focusin', focus)
    if (motion.matches || !('IntersectionObserver' in window)) return
    sections = [
      ...(root.value?.querySelectorAll<HTMLElement>('[data-reveal]') ?? []),
    ]
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) reveal(entry.target as HTMLElement)
      },
      { threshold: 0.08 },
    )
    for (const section of sections) {
      // Already visible content stays visible; SSR/no-JS never receives this class.
      if (section.getBoundingClientRect().top < window.innerHeight) continue
      section.classList.add('reveal-pending')
      observer.observe(section)
    }
  })
  onBeforeUnmount(() => {
    observer?.disconnect()
    motion?.removeEventListener('change', preference)
    root.value?.removeEventListener('focusin', focus)
  })
}
